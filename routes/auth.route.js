import { Router } from "express";
import { 
    registerUserController, 
    loginUserController, 
    logoutUserController,
    logoutAllDevicesController,
    refreshTokensController,
    auditLogController,
    registerOAuthController,
    loginOAuthController,
    googleOAuthCallbackController
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { 
    registerLimiter, 
    loginLimiter, 
    logoutLimiter 
} from "../middlewares/rateLimiter.middleware.js";
import passport from "../config/passport.js";

const router = Router();

// Public routes with rate limiting
router.route("/register").post(registerLimiter, registerUserController);
router.route("/login").post(loginLimiter, loginUserController);
router.route("/refresh-token").post(refreshTokensController);
router.route("/register-oauth").post(registerLimiter, registerOAuthController);
router.route("/login-oauth").post(loginLimiter, loginOAuthController);

// Google OAuth Popup Routes
router.route('/google').get((req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: 'register'
    })(req, res, next);
});

router.route('/google/login').get((req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: 'login'
    })(req, res, next);
});

router.route('/google/callback').get(
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/?error=oauth_failed'
    }),
    googleOAuthCallbackController
);

// Protected routes (require authentication) with rate limiting
router.route("/logout").post(authMiddleware, logoutLimiter, logoutUserController);
router.route("/logout-all").post(authMiddleware, logoutLimiter, logoutAllDevicesController);

// Admin/Debug route
router.route("/auditLog").post(authMiddleware, auditLogController);

export default router;