import express from "express";
import {
    createProjectController,
    getUserProjectsController,
    getProjectByIdController,
    regenerateApiSecretController,
    deleteProjectController
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
    .post(createProjectController)
    .get(getUserProjectsController);

router.route("/:projectId")
    .get(getProjectByIdController)
    .delete(deleteProjectController);

router.route("/:projectId/regenerate-secret")
    .post(regenerateApiSecretController);

export default router;
