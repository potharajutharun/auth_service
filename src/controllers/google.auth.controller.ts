// src/controllers/googleAuth.controller.ts
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

// adjust based on your roles/status tables
const DEFAULT_USER_ROLE_ID = 2; // e.g. "user"
const STATUS_ACTIVE_NAME = "active";

export const redirectToGoogle = (req: Request, res: Response) => {
  const state = crypto.randomUUID();

  // store state in a secure cookie for CSRF protection
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.app.nodeEnv === "production",
    maxAge: 1000 * 60 * 10, // 10 minutes
  });
  const redirectUri = env.googleOauth.gooleredirecturl;

  const params = new URLSearchParams({
    client_id: env.googleOauth.googleclientid,
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

  // ✅ CSRF protection using state
  const storedState = req.cookies?.oauth_state;
  if (!state || !storedState || state !== storedState) {
    return res.status(401).send("Invalid OAuth state");
  }
  res.clearCookie("oauth_state");

  try {
    // 1. Exchange code for Google tokens
    const tokenData = await exchangeCodeForToken(
      code,
      env.googleOauth.gooleredirecturl,
      env.googleOauth.googleclientid,
      env.googleOauth.gooleclientsecret
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
        const randomPassword = crypto.randomUUID();
        const passwordHash = await passwordUtils.hash(randomPassword);

        user = await userRepository.createUserFromGoogle({
          name: parsed.name,
          email: parsed.email,
          googleId: parsed.googleId,
          isEmailVerified: userInfo.email_verified,
          roleId: DEFAULT_USER_ROLE_ID,
          passwordHash,
        });
      }
    }

    // 5. Block non-active users
    if (user.status !== STATUS_ACTIVE_NAME) {
      return res.status(403).send("User account is not active");
    }

    // 6. Build payload for your JWTs
    const payload: JwtBasePayload = {
      sub: user.id,
      email: user.email,
      role: user.role_name, // e.g. "admin", "user"
    };

    const accessToken = jwtUtils.signAccessToken(payload);
    const refreshToken = jwtUtils.signRefreshToken(payload);

    // 7. Set tokens as HttpOnly cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.app.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * env.jwt.refreshTtlDays,
    });

    // access cookie lifetime – here I'm just using 1h, you can tune it
    const accessTtlHours = 1;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.app.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * accessTtlHours,
    });

    // 8. Redirect to frontend (no token in URL)
    return res.redirect(`${env.app.frontendUrl}/auth/success`);
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return res.redirect(
      `${env.app.frontendUrl}/auth/error?reason=oauth_failed`
    );
  }
};
