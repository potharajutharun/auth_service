import { hashPassword } from "../utils/hashpassword.js";
import {
  findValidResetToken,
  deleteOldResetTokens,
  updateUserPasswordById,
} from "../models/userModel.js";

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

type ResetPasswordResult = {
  success: boolean;
  message: string;
};

export const resetPasswordService = async ({
  token,
  newPassword,
}: ResetPasswordInput): Promise<ResetPasswordResult> => {
  try {
    if (!token || !newPassword) {
      return { success: false, message: "Token and password are required" };
    }

    // 1️⃣ Find valid token in DB
    const resetRecord = await findValidResetToken(token);

    if (!resetRecord) {
      return {
        success: false,
        message: "Invalid or expired reset link",
      };
    }

    const userId = resetRecord.user_id;

    // 2️⃣ Hash new password
    const passwordHash = await hashPassword(newPassword);

    // 3️⃣ Update user's password
    const updateResult = await updateUserPasswordById(userId, passwordHash);

    if (!updateResult || updateResult.affectedRows !== 1) {
      return {
        success: false,
        message: "Failed to update password",
      };
    }

    // 4️⃣ Delete token so it can't be reused
    await deleteOldResetTokens(resetRecord.id);

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("resetPasswordService error:", error);
    return {
      success: false,
      message: "Something went wrong while resetting password",
    };
  }
};
