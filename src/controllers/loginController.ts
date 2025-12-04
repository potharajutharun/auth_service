import type { Request, Response } from "express";
import { loginUserService } from "../Services/loginServices.js";

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
    // console.log('Login attempt for email:', email);

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    //  console.log('Login attempt for email ts:', email);
    const result = await loginUserService(email, password);
    // console.log('Login successful for user ID:', result.user.id);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // 👈 must be lowercase
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    const status = error.statusCode || 500;

    return res.status(status).json({
      message: status === 500 ? "Something went wrong" : error.message,
    });
  }
};
