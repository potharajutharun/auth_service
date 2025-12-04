// src/controllers/loginController.ts
import type { Request, Response } from "express";
import { loginUserService } from "../Services/loginServices.js";

console.log("🧩 loginController.ts LOADED");

interface LoginRequestBody {
  email: string;
  password: string;
}

export const loginController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    console.log("📥 loginController CALLED with body:", req.body);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await loginUserService(email, password);

    console.log("🔐 Login result (service):", result);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Refresh token cookie set");

    return res.status(200).json({
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("❌ loginController ERROR:", error);

    const status = error.statusCode || 500;

    return res.status(status).json({
      message: status === 500 ? "Something went wrong" : error.message,
    });
  }
};
