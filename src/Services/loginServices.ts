// src/services/authService.ts
import { findUserByEmail } from "../models/userModel.js";
import { comparepassword } from "../utils/comparepassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import { HttpError } from "../utils/HttpError.js";

interface AuthUser {
  user_id: number;
  email: string;
  role_id: string;
}

interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const loginUserService = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  // Optional: basic sanity check here too (even if controller also validates)
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }
  const user = await findUserByEmail(email);
  //  console.log('User fetched from DB ts nsb:', user);

  // Same message for both "email not found" and "wrong password"
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }
 

  const isPasswordValid = await comparepassword(password, user.password_hash);

  // console.log('Password validated for user ID:', isPasswordValid);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  //  console.log('Password validated for user ID:', user.user_id);

  // Generate tokens from minimal safe info
  const accessToken = generateAccessToken({
    user_id: user.user_id,
    email: user.email,
    role_id: user.role_id,
  });
  //  console.log('Access token generated for user ID:', accessToken);

  const refreshToken = generateRefreshToken({
    user_id: user.user_id,
    email: user.email,
    role_id: user.role_id,
  });

  // Return only what the controller / client actually needs
  return {
    user: {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    },
    accessToken,
    refreshToken,
  };
};

export default {
  loginUserService,
};
