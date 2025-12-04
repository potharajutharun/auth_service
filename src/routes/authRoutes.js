import express from "express";
import { loginController } from "../controllers/loginController.js";
import { registerController } from "../controllers/registerController.js";
import { forgotpasswordController } from "../controllers/forgotpasswordController.js";
import { resetPasswordController } from "../controllers/resetPasswordController.js";
const router = express.Router();
//  console.log('Setting up /login route');
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/forgotpassword", forgotpasswordController);
router.post("/resetpassword", resetPasswordController);
export default router;
//# sourceMappingURL=authRoutes.js.map