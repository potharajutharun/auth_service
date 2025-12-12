// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import { jwtUtils } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwtUtils.verifyAccessToken(token);

    // Cast req to add `user`
    const typedReq = req as Request & { user?: any };
    typedReq.user = payload;

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
