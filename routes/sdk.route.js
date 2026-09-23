import express from "express";
import {
    verifyTokenController,
    getProjectPublicInfoController,
    sdkRegisterController,
    sdkLoginController
} from "../controllers/sdk.controller.js";
import { sdkAuthMiddleware } from "../middlewares/sdkAuth.middleware.js";

const router = express.Router();

router.use(sdkAuthMiddleware);

router.post("/verify-token", verifyTokenController);
router.get("/info", getProjectPublicInfoController);
router.post("/auth/register", sdkRegisterController);
router.post("/auth/login", sdkLoginController);

export default router;
