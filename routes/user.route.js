import express from "express";
import { getCurrentUserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/current-user").get(authMiddleware, getCurrentUserController);

export default router;