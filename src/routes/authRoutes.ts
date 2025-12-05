import express from "express";
import { loginController } from "../controllers/loginController.js";
import { registerController } from "../controllers/registerController.js";
import { forgotpasswordController } from "../controllers/forgotpasswordController.js";
import { resetPasswordController } from "../controllers/resetPasswordController.js";

const router = express.Router();

//  console.log('Setting up /login route');

router.post("/auth/login", loginController);
router.post("/auth/register", registerController);
router.post("/auth/forgotpassword", forgotpasswordController);
router.post("/auth/resetpassword", resetPasswordController);

export default router;
