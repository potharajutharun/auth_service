import { Request, Response, NextFunction } from "express";
import { authService } from "../Services/auth.service";
import { authCookieOptions, setCookie } from "../utils/setCookie";
// Shape of what we store in req.user (from JWT)
type JwtUser = {
  sub: number; // user id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      setCookie(res, "refreshToken", result.refreshToken, 7 * 24); //7days

      return res
        .status(201)
        .json({ user: result.user, accessToken: result.accessToken });
    } catch (err: any) {
      if (err.message === "EMAIL_EXISTS") {
        return res.status(409).json({ message: "Email already registered" });
      }

      if (err.message === "ROLE_USER_MISSING") {
        return res
          .status(500)
          .json({ message: "Default user role missing in database" });
      }

      return next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setCookie(res, "refreshToken", result.refreshToken, 7 * 24); //7days
      return res
        .status(200)
        .json({ user: result.user, accessToken: result.accessToken });
    } catch (err: any) {
      if (err.message === "INVALID") {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (err.message === "USER_INACTIVE") {
        return res.status(403).json({ message: "Account inactive or blocked" });
      }

      return next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken is required" });
      }

      const result = await authService.refreshTokens(refreshToken);
      // result: { user, accessToken, refreshToken }
      setCookie(res, "refreshToken", result.refreshToken, 7 * 24);
      return res
        .status(200)
        .json({ user: result.user, accessToken: result.accessToken });
    } catch (err: any) {
      if (err.message === "INVALID_REFRESH") {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      if (err.message === "USER_INACTIVE") {
        return res.status(403).json({ message: "Account inactive or blocked" });
      }

      return next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body);
      return res.status(200).json({
        message: "If the email exists, a password reset link has been sent",
      });
    } catch (err) {
      return next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body);
      return res.status(200).json({ message: "Password reset successful" });
    } catch (err: any) {
      if (err.message === "RESET_TOKEN_INVALID") {
        return res.status(400).json({ message: "Invalid reset token" });
      }
      if (err.message === "RESET_TOKEN_EXPIRED") {
        return res.status(410).json({ message: "Reset token expired" });
      }
      if (err.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
      }
      return next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken is required" });
      }

      await authService.logout(refreshToken);

      res.clearCookie("refreshToken", {
        ...authCookieOptions(),
      });
      return res.status(200).json({ message: "Logged out" });
    } catch (err) {
      return next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is set by authenticate() middleware
      const userFromReq = (req as Request & { user?: JwtUser }).user;
      console.log(userFromReq, "kkla");

      if (!userFromReq) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = userFromReq.sub;
      const profile = await authService.me(userId);

      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(profile);
    } catch (err) {
      return next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        (typeof req.body?.token === "string" ? req.body.token : undefined) ??
        (typeof req.query?.token === "string" ? req.query.token : undefined);

      if (!token) {
        return res.status(400).json({ message: "token is required" });
      }

      await authService.verifyEmailToken(token);
      return res.status(200).json({ message: "Email verified successfully" });
    } catch (err: any) {
      if (err.message === "EMAIL_VERIFICATION_INVALID") {
        return res.status(400).json({ message: "Invalid verification link" });
      }
      if (err.message === "EMAIL_VERIFICATION_EXPIRED") {
        return res.status(410).json({ message: "Verification link expired" });
      }
      if (err.message === "EMAIL_VERIFICATION_USED") {
        return res.status(409).json({ message: "Verification link already used" });
      }
      if (err.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
      }
      return next(err);
    }
  },
};
