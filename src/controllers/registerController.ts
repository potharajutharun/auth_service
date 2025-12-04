import type { Request, Response } from "express";
import { validateEmail } from "../utils/validateEmail.js";
import { validatePassword } from "../utils/validatepassword.js";
import { registerService } from "../Services/registerService.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("➡️ registerController CALLED with:", { email, passwordExists: !!password });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: "Password does not meet complexity requirements" });
    }

    const result = await registerService(email, password);

    if (result.success) {
      return res.status(201).json({ message: "User registered successfully" });
    }

    // you can adjust status code based on result.message or add a status in service
    return res.status(400).json({ message: result.message });
  } catch (error) {
    console.error("registerController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

