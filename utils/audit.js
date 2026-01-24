import AuditLog from "../models/AuditLog.model.js";
import { getClientInfo } from "./clientInfo.js";

export const logAuditEvent = async ({ userId, action, req, details = {} }) => {
    try {
        if (!req) {
            console.warn('Audit log skipped: no request object provided');
            return false;
        }

        const { ipAddress, userAgent } = getClientInfo(req);

        await AuditLog.create({
            userId,
            action,
            ipAddress,
            userAgent,
            details
        });

        return true;
    } catch (error) {
        console.error('Audit log error:', error);
        return false;
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
            name: user.name
        }
    });
};
export const logLoginSuccess = async (userId, req, email) => {
    return logAuditEvent({
        userId,
        action: 'LOGIN_SUCCESS',
        req,
        details: { email }
    });
};

export const logLoginFailed = async (userId, req, email, reason) => {
    return logAuditEvent({
        userId,
        action: 'LOGIN_FAILED',
        req,
        details: { email, reason }
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
        action: 'LOGOUT',
        req,
        details: {
            logoutType: 'all_devices',
            devicesCount
        }
    });
};
