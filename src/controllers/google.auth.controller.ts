import type { Request, Response } from "express";
import crypto from "crypto";

import { env } from "../config/env";
import {
  exchangeCodeForToken,
  getGoogleUserInfo,
} from "../Services/googleAuth.services";
import { googleUserSchema } from "../domain/auth/auth.dto";
import { userRepository } from "../repositories/user.repository";
import { jwtUtils, JwtBasePayload } from "../utils/jwt";
import { passwordUtils } from "../utils/password";
import { authCookieOptions } from "../utils/setCookie";
import { roleRepository } from "../repositories/role.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";

const isActiveUser = (user: { status_id?: string; status_name?: string | null }) => {
  if (user.status_name) {
    return user.status_name.toLowerCase() === "active";
  }
  return user.status_id === "1";
};

const parseTenantId = (value: unknown): number | null => {
  const asText = typeof value === "string" ? value : "";
  const parsed = Number.parseInt(asText, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const buildRefreshExpiryDate = () => {
  const now = Date.now();
  const refreshTtlDays = env.jwt.refreshTtlDays;
  return new Date(now + refreshTtlDays * 24 * 60 * 60 * 1000);
};

const encodeOAuthUser = (payload: {
  id: number;
  email: string;
  name?: string | null;
  role?: string | null;
  status?: string | null;
  tenant_id?: number;
}) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

export const redirectToGoogle = (req: Request, res: Response) => {
  const tenantId = parseTenantId(req.query.tenant_id);
  if (!tenantId) {
    return res.status(400).send("tenant_id query param is required");
  }

  const state = crypto.randomUUID();

  // store state + tenant context in secure cookies for callback validation
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.app.nodeEnv === "production",
    maxAge: 1000 * 60 * 10, // 10 minutes
  });
  res.cookie("oauth_tenant_id", tenantId.toString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.app.nodeEnv === "production",
    maxAge: 1000 * 60 * 10, // 10 minutes
  });

  const redirectUri = env.googleOauth.redirectUri;

  const params = new URLSearchParams({
    client_id: env.googleOauth.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ["openid", "email", "profile"].join(" "),
    access_type: "offline",
    prompt: "consent", // to ensure refresh_token is returned consistently
    state,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(googleAuthUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;

  if (!code) {
    return res.status(400).send("Authorization code is missing");
  }

  // CSRF protection using state
  const storedState = req.cookies?.oauth_state;
  if (!state || !storedState || state !== storedState) {
    return res.status(401).send("Invalid OAuth state");
  }
  res.clearCookie("oauth_state");

  const tenantId = parseTenantId(req.cookies?.oauth_tenant_id);
  res.clearCookie("oauth_tenant_id");

  try {
    // 1. Exchange code for Google tokens
    const tokenData = await exchangeCodeForToken(
      code,
      env.googleOauth.redirectUri,
      env.googleOauth.clientId,
      env.googleOauth.clientSecret
    );

    // 2. Fetch user info from Google
    const userInfo = await getGoogleUserInfo(tokenData.access_token);

    if (!userInfo.email) {
      return res.status(400).send("Google did not return an email");
    }

    // 3. Validate Google data via Zod
    const parsed = googleUserSchema.parse({
      email: userInfo.email,
      name: userInfo.name,
      googleId: userInfo.sub,
    });

    // 4. Find / create / link user in our DB
    let user = await userRepository.findByGoogleId(parsed.googleId);

    if (!user) {
      // If not linked by google_id, try by email (existing normal user?)
      const existingByEmail = await userRepository.findByEmail(parsed.email);

      if (existingByEmail) {
        // Link Google account to existing user
        user = await userRepository.linkGoogleAccount(
          existingByEmail.id,
          parsed.googleId,
          userInfo.email_verified
        );
      } else {
        if (!tenantId) {
          return res.status(400).send("tenant_id context is missing");
        }

        const role = await roleRepository.findByName("User", tenantId);
        if (!role) {
          return res.status(500).send("Default user role missing in database");
        }

        const randomPassword = crypto.randomUUID();
        const passwordHash = await passwordUtils.hash(randomPassword);

        user = await userRepository.createUserFromGoogle({
          name: parsed.name,
          email: parsed.email,
          googleId: parsed.googleId,
          isEmailVerified: userInfo.email_verified,
          roleId: role.id,
          tenantId,
          passwordHash,
        });
      }
    }

    // 5. Block non-active users
    if (!isActiveUser(user)) {
      return res.status(403).send("User account is not active");
    }

    // 6. Build payload for your JWTs
    const payload: JwtBasePayload = {
      sub: user.id,
      email: user.email,
      role: user.role_name ?? "User",
    };

    const accessToken = jwtUtils.signAccessToken(payload);
    const refreshToken = jwtUtils.signRefreshToken(payload);

    await refreshTokenRepository.create(
      user.id,
      refreshToken,
      user.tenant_id,
      buildRefreshExpiryDate()
    );

    // 7. Set tokens as HttpOnly cookies
    res.cookie("refreshToken", refreshToken, {
      ...authCookieOptions(),
      maxAge: 1000 * 60 * 60 * 24 * env.jwt.refreshTtlDays,
    });

    // access cookie lifetime (1 hour)
    const accessTtlHours = 1;
    res.cookie("accessToken", accessToken, {
      ...authCookieOptions(),
      maxAge: 1000 * 60 * 60 * accessTtlHours,
    });

    // 8. Redirect to frontend with token bootstrap in hash fragment.
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role_name ?? "User",
      status: user.status_name ?? user.status_id ?? null,
      tenant_id: user.tenant_id,
    };
    const hash = new URLSearchParams({
      accessToken,
      refreshToken,
      user: encodeOAuthUser(authUser),
    }).toString();

    return res.redirect(`${env.app.frontendUrl}/auth/success#${hash}`);
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return res.redirect(
      `${env.app.frontendUrl}/auth/error?reason=oauth_failed`
    );
  }
};
