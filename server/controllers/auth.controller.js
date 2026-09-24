import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    logoutAllDevices, 
    refreshUserTokens, 
    auditLogService,
    getUserAuditLogsService,
    registerUserByGoogle, 
    loginUserByGoogle,
    requestPasswordReset,
    resetPassword
} from "../services/auth.service.js";
import { getOAuthCompletionHTML } from "../utils/oauthHtml.js";
import { blacklistToken } from "../services/redis.service.js";


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
        
        if (req.token) {
            await blacklistToken(req.token, 3600);
        }

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
        const { userId, action, details, limit = 10 } = req.body || {};
        
        if (action) {
            const targetUserId = userId || req.user?.userId;
            const result = await auditLogService(targetUserId, action, req, details);
            return res.status(200).json({
                success: true,
                message: "Audit log created successfully",
                data: result
            });
        }

        const currentUserId = req.user?.userId;
        const queryLimit = req.query?.limit || limit;
        const logs = await getUserAuditLogsService(currentUserId, queryLimit);

        return res.status(200).json({
            success: true,
            message: "Audit logs retrieved successfully",
            data: logs
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const registerOAuthController = async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;
        
        const result = await registerUserByGoogle({ email, name, googleId, picture }, req);
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });
        
        res.status(result.isNewUser ? 201 : 200).json({ 
            success: true, 
            message: result.isNewUser ? "User registered successfully" : "Login successful",
            data: {
                accessToken: result.accessToken,
                user: result.user,
                isNewUser: result.isNewUser
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

export const loginOAuthController = async (req, res) => {
    try {
        const { email, name, googleId, picture } = req.body;
        
        const result = await loginUserByGoogle({ email, name, googleId, picture }, req);
        
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

export const googleOAuthCallbackController = async (req, res) => {
    try {
        const userData = req.user;
        const mode = req.query.state || 'register';
        
        let result;
        if (mode === 'login') {
            result = await loginUserByGoogle(userData, req);
        } else {
            result = await registerUserByGoogle(userData, req);
        }
        
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });
        
        return res.send(getOAuthCompletionHTML({
            success: true,
            data: {
                accessToken: result.accessToken,
                user: result.user,
                isNewUser: !!result.isNewUser
            }
        }));
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        return res.send(getOAuthCompletionHTML({
            success: false,
            error: error.message
        }));
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await requestPasswordReset(email, req);

        res.status(200).json({
            success: true,
            message: result.message,
            resetToken: result.resetToken,
            emailResult: result.emailResult
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPassword(token, newPassword, req);

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


