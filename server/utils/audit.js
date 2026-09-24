import AuditLog from "../models/AuditLog.model.js";
import { getClientInfo } from "./clientInfo.js";

export const logAuditEvent = async ({ userId, action, req, details = {} }) => {
    try {
        if (!req) {
            console.warn('Audit log skipped: no request object provided');
            return false;
        }

        if (!action) {
            console.warn('Audit log skipped: action is required');
            return false;
        }

        const { ipAddress, userAgent } = getClientInfo(req);
        
        // Auto-extract projectId from req context
        const projectId = details.projectId || req.project?.projectId || req.body?.projectId || req.query?.projectId || 'default';
        const mergedDetails = {
            projectId,
            ...details
        };

        await AuditLog.create({
            userId: userId || null,
            action,
            ipAddress,
            userAgent,
            details: mergedDetails
        });

        return true;
    } catch (error) {
        console.error('Audit log error:', error);
        return false;
    }
};

export const getAuditLogs = async (userId, limit = 50, projectId = null) => {
    try {
        let query = {};
        if (projectId && projectId !== 'all') {
            query = { "details.projectId": projectId };
        } else if (userId) {
            const Project = (await import("../models/Project.model.js")).default;
            const userProjects = await Project.find({ ownerId: userId }).select("projectId");
            const projectIds = userProjects.map(p => p.projectId);
            projectIds.push("default");

            query = {
                $or: [
                    { userId },
                    { "details.projectId": { $in: projectIds } }
                ]
            };
        }
        return await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));
    } catch (err) {
        console.error("Failed to query audit logs:", err);
        return [];
    }
};

export const logRegistration = async (userId, req, user) => {
    return logAuditEvent({
        userId,
        action: 'REGISTER',
        req,
        details: {
            email: user.email,
            username: user.username,
            name: user.name,
            projectId: user.projectId || req.project?.projectId || 'default'
        }
    });
};

export const logLoginAttempt = async (req, email) => {
    return logAuditEvent({
        userId: null,
        action: 'LOGIN_ATTEMPT',
        req,
        details: { 
            email,
            projectId: req.project?.projectId || 'default'
        }
    });
};

export const logLoginSuccess = async (userId, req, email) => {
    return logAuditEvent({
        userId,
        action: 'LOGIN_SUCCESS',
        req,
        details: { 
            email,
            projectId: req.project?.projectId || 'default'
        }
    });
};

export const logLoginFailed = async (userId, req, email, reason) => {
    return logAuditEvent({
        userId,
        action: 'LOGIN_FAILED',
        req,
        details: { 
            email, 
            reason,
            projectId: req.project?.projectId || 'default'
        }
    });
};

export const logLogout = async (userId, req, tokenInfo = {}) => {
    return logAuditEvent({
        userId,
        action: 'LOGOUT',
        req,
        details: tokenInfo
    });
};

export const logLogoutAllDevices = async (userId, req, devicesCount) => {
    return logAuditEvent({
        userId,
        action: 'LOGOUT_ALL',
        req,
        details: {
            logoutType: 'all_devices',
            devicesCount
        }
    });
};

export const logTokenVerified = async (userId, req, email) => {
    return logAuditEvent({
        userId,
        action: 'TOKEN_VERIFIED',
        req,
        details: {
            email,
            projectId: req.project?.projectId
        }
    });
};

export const logTokenInvalid = async (req, reason) => {
    return logAuditEvent({
        userId: null,
        action: 'TOKEN_INVALID',
        req,
        details: {
            reason,
            projectId: req.project?.projectId || 'default'
        }
    });
};

export const logPasswordResetRequested = async (userId, req, email) => {
    return logAuditEvent({
        userId,
        action: 'PASSWORD_RESET_REQUESTED',
        req,
        details: {
            email,
            stage: 'requested'
        }
    });
};

export const logPasswordResetCompleted = async (userId, req, email) => {
    return logAuditEvent({
        userId,
        action: 'PASSWORD_RESET_COMPLETED',
        req,
        details: {
            email,
            stage: 'completed'
        }
    });
};

export const logProjectCreated = async (userId, req, project) => {
    return logAuditEvent({
        userId,
        action: 'PROJECT_CREATED',
        req,
        details: {
            projectId: project.projectId,
            projectName: project.name
        }
    });
};

export const logKeysRotated = async (userId, req, project) => {
    return logAuditEvent({
        userId,
        action: 'KEYS_ROTATED',
        req,
        details: {
            projectId: project.projectId,
            projectName: project.name
        }
    });
};

export const logProjectDeleted = async (userId, req, projectId) => {
    return logAuditEvent({
        userId,
        action: 'PROJECT_DELETED',
        req,
        details: {
            projectId
        }
    });
};

