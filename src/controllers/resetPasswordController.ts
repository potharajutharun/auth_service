import type { Request, Response } from "express";
import { resetPasswordService } from "../Services/resetPasswordService.js";
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as ResetPasswordInput;

    const result = await resetPasswordService({ token, newPassword });

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("resetPasswordController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
