import { Router } from "express";
import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth";

const router = Router();
router.get("/me", authMiddleware,  userController.getProfile);

export const userRouter = router;