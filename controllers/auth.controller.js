import { registerUser, loginUser, logoutUser, logoutAllDevices, refreshUserTokens, auditLogService } from "../services/auth.service.js";

export const registerUserController = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const user = await registerUser({ name, username, email, password }, req);
        
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            data: user 
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await loginUser({ email, password }, req);
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken: result.accessToken,
                user: result.user
            }
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const logoutUserController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        const userId = req.user.userId;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const result = await logoutUser(userId, refreshToken, req);
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth'
        });

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const logoutAllDevicesController = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await logoutAllDevices(userId, req);
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth'
        });

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                devicesLoggedOut: result.devicesLoggedOut
            }
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const refreshTokensController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        const result = await refreshUserTokens(refreshToken, req);
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            data: {
                accessToken: result.accessToken
            }
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const auditLogController = async (req, res) => {
    try {
        const { userId, action, details } = req.body;
        
        const result = await auditLogService(userId, action, req, details);
        
        res.status(200).json({
            success: true,
            message: "Audit log created successfully",
            data: result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};
