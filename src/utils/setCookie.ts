import { env } from "../config/env";
import type { CookieOptions, Response } from "express";

export const authCookieOptions = (): CookieOptions => {
  const isProduction = env.app.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
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
