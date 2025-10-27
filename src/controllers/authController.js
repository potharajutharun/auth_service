import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { findUserByEmail } from "../models/userModel.js";
import { createSession } from "../models/sessionModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get("User-Agent") || "unknown";
  const deviceName = req.body.device_name || "Web Browser";

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const jwtId = uuidv4();

    await createSession({
      user_id: user.user_id,
      tenant_id: user.tenant_id || null,
      jwt_id: jwtId,
      ip_address: ip,
      device_name: deviceName,
      user_agent: userAgent,
      refresh_token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role_id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
