import { env } from "../config/env";
import type { CookieOptions, Response } from "express";

const resolveCookieMode = () => {
  const frontend = new URL(env.app.frontendUrl);
  const isLocalhostFrontend =
    frontend.hostname === "localhost" ||
    frontend.hostname === "127.0.0.1";

  const useCrossSiteCookies =
    env.app.nodeEnv === "production" || !isLocalhostFrontend;
  const canUseSecureCookies = frontend.protocol === "https:";

  if (useCrossSiteCookies && !canUseSecureCookies) {
    return { secure: false, sameSite: "lax" as const };
  }

  return {
    secure: useCrossSiteCookies,
    sameSite: useCrossSiteCookies ? ("none" as const) : ("lax" as const),
  };
};

export const authCookieOptions = (): CookieOptions => {
  const { secure, sameSite } = resolveCookieMode();
  return {
    httpOnly: true,
    secure,
    sameSite,
  };
};

export const setCookie = (
  res: Response,
  cookieName: string,
  token: string,
  hours: number
) => {
  res.cookie(cookieName, token, {
    ...authCookieOptions(),
    maxAge: 1000 * 60 * 60 * hours, // hours -> ms.
  });
};
