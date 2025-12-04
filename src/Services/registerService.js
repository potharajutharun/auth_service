import { hashPassword } from "../utils/hashpassword.js";
import { createUser } from "../models/userModel.js";
export const registerService = async (email, password) => {
    try {
        const password_hash = await hashPassword(password);
        const newUser = await createUser(email, password_hash);
        // example if using mysql2 ResultSetHeader:
        if (!newUser) {
            return { success: false, message: "User registration failed" };
        }
        return { success: true, message: "User registered successfully" };
    }
    catch (err) {
        console.error("Error in registerService:", err);
        // Optional: detect duplicate email error code (e.g., ER_DUP_ENTRY) and
        // return a more specific message.
        if (err.code === "ER_DUP_ENTRY") {
            return { success: false, message: "Email already exists" };
        }
        return { success: false, message: "Registration failed" };
    }
};
//# sourceMappingURL=registerService.js.map