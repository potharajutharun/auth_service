import express from "express";
import { usersController } from "../controllers/usersControllers.js";
const router = express.Router();
router.use('/users/getall', usersController);
export default router;
//# sourceMappingURL=userRoutes.js.map