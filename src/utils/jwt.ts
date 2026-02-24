import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtBasePayload {
  sub: number;
  email: string;
  role: string;
}

export interface PasswordResetPayload {
  sub: number;
  email: string;
  purpose: "password_reset";
}

const accessSecret: Secret = env.jwt.accessSecret;
const refreshSecret: Secret = env.jwt.refreshSecret;

export const jwtUtils = {
  signAccessToken(payload: JwtBasePayload): string {
    const options: SignOptions = {
      expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"]
    };
    return jwt.sign(payload, accessSecret, options);
  },

  signRefreshToken(payload: JwtBasePayload): string {
    const options: SignOptions = {
      expiresIn: `${env.jwt.refreshTtlDays}d`
    };
    return jwt.sign(payload, refreshSecret, options);
  },

  verifyAccessToken(token: string): JwtBasePayload & JwtPayload {
    return jwt.verify(token, accessSecret) as JwtBasePayload & JwtPayload;
  },

  verifyRefreshToken(token: string): JwtBasePayload & JwtPayload {
    return jwt.verify(token, refreshSecret) as JwtBasePayload & JwtPayload;
  },

  signPasswordResetToken(payload: {
    sub: number;
    email: string;
  }): string {
    const options: SignOptions = {
      expiresIn: `${env.security.resetPasswordTtlMinutes}m`
    };
    const tokenPayload: PasswordResetPayload = {
      ...payload,
      purpose: "password_reset",
    };
    return jwt.sign(tokenPayload, accessSecret, options);
  },

  verifyPasswordResetToken(token: string): PasswordResetPayload & JwtPayload {
    const payload = jwt.verify(token, accessSecret) as PasswordResetPayload & JwtPayload;
    if (payload.purpose !== "password_reset") {
      throw new Error("INVALID_RESET_PURPOSE");
    }
    return payload;
  }
};
