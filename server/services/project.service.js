import Project from "../models/Project.model.js";
import crypto from "crypto";

export const createProjectService = async (ownerId, { name, allowedOrigins }, baseUrl) => {
    if (!name || name.trim().length === 0) {
        const error = new Error("Project name is required");
        error.statusCode = 400;
        throw error;
    }

    const existingCount = await Project.countDocuments({ ownerId });
    if (existingCount >= 10) {
        const error = new Error("Maximum limit of 10 projects reached per account");
        error.statusCode = 400;
        throw error;
    }

    let origins = Array.isArray(allowedOrigins) 
        ? allowedOrigins.map(o => o.trim()).filter(Boolean)
        : [];

    if (origins.length === 0) {
        origins = ["*"]; // Default to allow all origins if not specified
    }

    const project = await Project.create({
        name: name.trim(),
        ownerId,
        allowedOrigins: origins
    });

    const projectObj = project.toObject();
    projectObj.connectionString = project.getConnectionString(baseUrl);

    return projectObj;
};

export const getUserProjectsService = async (ownerId, baseUrl) => {
    const projects = await Project.find({ ownerId }).sort({ createdAt: -1 });
    return projects.map(proj => {
        const obj = proj.toObject();
        obj.connectionString = proj.getConnectionString(baseUrl);
        return obj;
    });
};

export const getProjectByIdService = async (projectId, ownerId, baseUrl) => {
    const project = await Project.findOne({ projectId, ownerId });
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    const obj = project.toObject();
    obj.connectionString = project.getConnectionString(baseUrl);
    return obj;
};

export const regenerateApiSecretService = async (projectId, ownerId, baseUrl) => {
    const project = await Project.findOne({ projectId, ownerId });
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    project.apiSecret = `af_sk_${crypto.randomBytes(24).toString("hex")}`;
    await project.save();

    const obj = project.toObject();
    obj.connectionString = project.getConnectionString(baseUrl);
    return obj;
};

export const deleteProjectService = async (projectId, ownerId) => {
    const project = await Project.findOneAndDelete({ projectId, ownerId });
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return { message: "Project deleted successfully", projectId };
};
