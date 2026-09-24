import {
    createProjectService,
    getUserProjectsService,
    getProjectByIdService,
    regenerateApiSecretService,
    deleteProjectService,
    getProjectUsersService
} from "../services/project.service.js";
import { logProjectCreated, logKeysRotated, logProjectDeleted } from "../utils/audit.js";

const getBaseUrl = (req) => {
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 2000}`;
    return `${protocol}://${host}`;
};

export const createProjectController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const baseUrl = getBaseUrl(req);
        const project = await createProjectService(ownerId, req.body, baseUrl);

        await logProjectCreated(ownerId, req, project);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserProjectsController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const baseUrl = getBaseUrl(req);
        const projects = await getUserProjectsService(ownerId, baseUrl);

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectByIdController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { projectId } = req.params;
        const baseUrl = getBaseUrl(req);
        const project = await getProjectByIdService(projectId, ownerId, baseUrl);

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const regenerateApiSecretController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { projectId } = req.params;
        const baseUrl = getBaseUrl(req);
        const project = await regenerateApiSecretService(projectId, ownerId, baseUrl);

        await logKeysRotated(ownerId, req, project);

        res.status(200).json({
            success: true,
            message: "API Secret regenerated successfully",
            data: project
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProjectController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { projectId } = req.params;
        const result = await deleteProjectService(projectId, ownerId);

        await logProjectDeleted(ownerId, req, projectId);

        res.status(200).json({
            success: true,
            message: result.message,
            data: { projectId: result.projectId }
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectUsersController = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { projectId } = req.params;
        const data = await getProjectUsersService(projectId, ownerId);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};
