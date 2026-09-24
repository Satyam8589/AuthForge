import express from "express";
import {
    verifyTokenController,
    getProjectPublicInfoController,
    sdkRegisterController,
    sdkLoginController,
    sdkGoogleAuthController
} from "../controllers/sdk.controller.js";
import { sdkAuthMiddleware } from "../middlewares/sdkAuth.middleware.js";

const router = express.Router();

router.use(sdkAuthMiddleware);

router.post("/verify-token", verifyTokenController);
router.get("/info", getProjectPublicInfoController);
router.post("/auth/register", sdkRegisterController);
router.post("/auth/login", sdkLoginController);
router.post("/auth/google", sdkGoogleAuthController);

export default router;

