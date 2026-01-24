import { Router } from "express";
import { registerUserController, loginUserController, auditLogController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/auditLog", auditLogController);

export default router;