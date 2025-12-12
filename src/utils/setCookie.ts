import { env } from "../config/env";
import type { Response } from "express";

export const setCookie = (
  res: Response,
  cookieName: string,
  token: string,
  hours: number
) => {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: env.app.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * hours, // hours → ms
  });
};
