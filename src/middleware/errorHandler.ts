import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
};
