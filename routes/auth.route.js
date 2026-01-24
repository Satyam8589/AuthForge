import { Router } from "express";
import { 
    registerUserController, 
    loginUserController, 
    logoutUserController,
    logoutAllDevicesController,
    refreshTokensController,
    auditLogController,
    registerOAuthController,
    loginOAuthController 
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { 
    registerLimiter, 
    loginLimiter, 
    logoutLimiter 
} from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Public routes with rate limiting
router.post("/register", registerLimiter, registerUserController);
router.post("/login", loginLimiter, loginUserController);
router.post("/refresh-token", refreshTokensController);
router.post("/register-oauth", registerLimiter, registerOAuthController);
router.post("/login-oauth", loginLimiter, loginOAuthController);

// Protected routes (require authentication) with rate limiting
router.post("/logout", authMiddleware, logoutLimiter, logoutUserController);
router.post("/logout-all", authMiddleware, logoutLimiter, logoutAllDevicesController);

// Admin/Debug route
router.post("/auditLog", auditLogController);

export default router;