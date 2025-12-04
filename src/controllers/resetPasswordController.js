import { resetPasswordService } from "../Services/resetPasswordService.js";
export const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPasswordService({ token, newPassword });
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json({ message: result.message });
    }
    catch (error) {
        console.error("resetPasswordController error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=resetPasswordController.js.map