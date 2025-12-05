import { GetAllusers } from "../models/userModel.js";
export const usersController = async (req, res) => {
    try {
        const result = await GetAllusers(); // ✅ await is required
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("usersController error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
//# sourceMappingURL=usersControllers.js.map