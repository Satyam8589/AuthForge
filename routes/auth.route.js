import { Router } from "express";
import { registerUserController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUserController);

export default router;