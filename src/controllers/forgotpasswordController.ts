import { validateEmail } from "../utils/validateEmail.js";
import type { Request, Response } from "express";
import { forgotPasswordService } from "../Services/forgotPasswordService.js";
export const forgotpasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const result = await forgotPasswordService(email);
    if (result.success) {
      return res.status(200).json({ message:result.message});
    }
    return res.status(400).json({ message: result.message });
  } catch (error) {
    console.error("forgotpasswordController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
