import { findUserByEmail } from "../models/userModel.js";
import { saveResetToken, deleteOldResetTokens } from "../models/userModel.js";
import { generateResetToken } from "../utils/generateResetToken.js";
import { nodemailerTransporter } from "../utils/nodemailerTransporter.js";
import { emailDesign } from "../utils/emailDesign.js";
const baseUrl = process.env.FRONTEND_BASE_URL ?? "https://adminportal-2r3x.vercel.app";
export const forgotPasswordService = async (email) => {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return { success: false, message: "Email not found" };
        }
        // ✅ Delete old tokens for this user (security hardening)
        await deleteOldResetTokens(user.user_id);
        // ✅ Generate secure random token (NOT JWT)
        const token = generateResetToken();
        // ✅ Token expiry (10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        // ✅ Save token in DB
        await saveResetToken(user.user_id, token, expiresAt);
        // ✅ Generate reset URL
        const resetUrl = `${baseUrl}/auth/resetpassword?token=${token}`;
        // ✅ Send email
        await nodemailerTransporter.sendMail({
            from: `"Pensoic.com" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Reset Your Password - Pensoic Pvt Ltd",
            html: emailDesign(resetUrl), // 👈 THIS is the important part
        });
        return { success: true, message: "Password reset link sent" };
    }
    catch (error) {
        console.error("forgotPasswordService error:", error);
        return {
            success: false,
            message: "Something went wrong while sending reset email",
        };
    }
};
//# sourceMappingURL=forgotPasswordService.js.map