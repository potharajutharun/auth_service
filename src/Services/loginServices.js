// src/Services/loginServices.ts
import { findUserByEmail, getRoleByUserId } from "../models/userModel.js";
import { comparepassword } from "../utils/comparepassword.js";
import { generateAccessToken, generateRefreshToken, } from "../utils/generateToken.js";
import { HttpError } from "../utils/HttpError.js";
console.log("🧩 loginServices.ts LOADED");
export const loginUserService = async (email, password) => {
    console.log("➡️ loginUserService CALLED with:", { email, passwordExists: !!password });
    if (!email || !password) {
        throw new HttpError(400, "Email and password are required");
    }
    // 1) Find user
    const user = await findUserByEmail(email);
    console.log("👤 User fetched from DB:", user);
    if (!user) {
        throw new HttpError(401, "Invalid email or password");
    }
    const isPasswordValid = await comparepassword(password, user.password_hash);
    ;
    console.log("🔑 Password valid:", isPasswordValid);
    if (!isPasswordValid) {
        throw new HttpError(401, "Invalid email or password");
    }
    // 3) Fetch role from user_roles + roles
    const role = await getRoleByUserId(user.user_id);
    console.log("🎭 Role fetched from DB:", role);
    if (!role) {
        throw new HttpError(403, "User has no role assigned");
    }
    // 4) Build auth user object
    const authUser = {
        user_id: user.user_id,
        email: user.email,
        role_id: role.role_id, // 👈 this should be 4 for your user
        role_key: role.role_key, // "owner"
    };
    console.log("✅ Auth user for token:", authUser);
    // 5) Generate tokens
    const accessToken = generateAccessToken({
        user_id: authUser.user_id,
        email: authUser.email,
        role_id: authUser.role_id,
    });
    const refreshToken = generateRefreshToken({
        user_id: authUser.user_id,
        email: authUser.email,
        role_id: authUser.role_id,
    });
    console.log("🎫 Tokens generated");
    // 6) Return safe data
    return {
        user: authUser,
        accessToken,
        refreshToken,
    };
};
export default {
    loginUserService,
};
//# sourceMappingURL=loginServices.js.map