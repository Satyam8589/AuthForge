import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generatePasswordResetToken, verifyPasswordResetToken } from "../utils/jwt.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { getClientInfo } from "../utils/clientInfo.js";
import { 
    logRegistration, 
    logLoginSuccess, 
    logLoginFailed, 
    logLogout,
    logLogoutAllDevices,
    logAuditEvent,
    getAuditLogs
} from "../utils/audit.js";

export const registerUser = async (userData, req) => {
    try {
        let { name, username, email, password } = userData;
        name = name?.trim();
        username = username?.trim();
        email = email?.trim();

        if (!name || !username || !email || !password) {
            const error = new Error("All fields are required");
            error.statusCode = 400;
            throw error;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            throw error;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            const error = new Error("Password must be at least 8 characters with uppercase, lowercase, and number");
            error.statusCode = 400;
            throw error;
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            const error = new Error("Username must be 3-20 alphanumeric characters");
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            const field = existingUser.email === email ? "Email" : "Username";
            const error = new Error(`${field} already exists`);
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({ 
            name, 
            username, 
            email, 
            password: hashedPassword
        });

        if (!user) {
            const error = new Error("Failed to create user");
            error.statusCode = 500;
            throw error;
        }

        await logRegistration(user._id, req, user);

        const userObject = user.toObject();
        const { password: _, ...userWithoutPassword } = userObject;

        return userWithoutPassword;

    } catch (error) {
        throw error;
    }
};

export const loginUser = async (userData, req) => {
    try {
        let { email, password } = userData;

        email = email?.trim();

        if (!email || !password) {
            const error = new Error("All fields are required");
            error.statusCode = 400;
            throw error;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            throw error;
        }
        
        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            await logLoginFailed(null, req, email, 'User not found');
            
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            await User.findByIdAndUpdate(user._id, {
                $inc: { loginAttempts: 1 }
            });
            await logLoginFailed(user._id, req, email, 'Invalid password');
            
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        if (user.loginAttempts > 0) {
            await User.findByIdAndUpdate(user._id, {
                loginAttempts: 0,
                lockUntil: null
            });
        }
        
        const accessToken = generateAccessToken({ 
            userId: user._id,
            email: user.email,
            role: user.role
        });
        
        const refreshToken = generateRefreshToken({ 
            userId: user._id 
        });

        if (req) {
            const { ipAddress, device } = getClientInfo(req);
            
            await RefreshToken.create({
                userId: user._id,
                token: refreshToken,
                ipAddress,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }).catch(err => console.error('RefreshToken save error:', err));

            await logLoginSuccess(user._id, req, user.email);
        }
        
        const userObject = user.toObject();
        const { password: _, ...userWithoutPassword } = userObject;
        
        return { 
            accessToken, 
            refreshToken,
            user: userWithoutPassword
        };
    } catch (error) {
        throw error;
    }
};

export const auditLogService = async (userId, action, req, details = {}) => {
    return await logAuditEvent({ userId, action, req, details });
};

export const getUserAuditLogsService = async (userId, limit = 10) => {
    return await getAuditLogs(userId, limit);
};

export const logoutUser = async (userId, refreshToken, req) => {
    try {
        const deletedToken = await RefreshToken.findOneAndDelete({
            userId,
            token: refreshToken
        });

        if (!deletedToken) {
            const error = new Error("Invalid refresh token");
            error.statusCode = 401;
            throw error;
        }

        await logLogout(userId, req, {
            device: deletedToken.device,
            tokenId: deletedToken._id
        });

        return {
            success: true,
            message: "Logged out successfully"
        };
    } catch (error) {
        throw error;
    }
};

export const logoutAllDevices = async (userId, req) => {
    try {
        const result = await RefreshToken.deleteMany({ userId });

        await logLogoutAllDevices(userId, req, result.deletedCount);

        return {
            success: true,
            message: `Logged out from ${result.deletedCount} device(s) successfully`,
            devicesLoggedOut: result.deletedCount
        };
    } catch (error) {
        throw error;
    }
};
export const refreshUserTokens = async (refreshToken, req) => {
    try {
        if (!refreshToken) {
            const error = new Error("Refresh token is required");
            error.statusCode = 400;
            throw error;
        }

        const decoded = verifyRefreshToken(refreshToken);
        
        const storedToken = await RefreshToken.findOne({ 
            userId: decoded.userId,
            token: refreshToken 
        });

        if (!storedToken) {
            const error = new Error("Token revoked or invalid");
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const newAccessToken = generateAccessToken({ 
            userId: user._id,
            email: user.email,
            role: user.role
        });

        const newRefreshToken = generateRefreshToken({ 
            userId: user._id 
        });

        if (req) {
            const { ipAddress, device } = getClientInfo(req);
            
            await RefreshToken.findByIdAndDelete(storedToken._id);
            
            await RefreshToken.create({
                userId: user._id,
                token: newRefreshToken,
                ipAddress,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            await logAuditEvent({
                userId: user._id,
                action: 'TOKEN_REFRESHED',
                req,
                details: { email: user.email }
            });
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
            error.statusCode = 401;
        }
        throw error;
    }
};
    
export const registerUserByGoogle = async (userData, req) => {
    try {
        const { email, name, googleId, picture } = userData;
        
        if (!email || !googleId) {
            const error = new Error("Email and Google ID are required");
            error.statusCode = 400;
            throw error;
        }
        
        const existingUser = await User.findOne({ 
            $or: [{ email }, { googleId }] 
        });
        
        if (existingUser) {
            const accessToken = generateAccessToken({ 
                userId: existingUser._id,
                email: existingUser.email,
                role: existingUser.role
            });
            
            const refreshToken = generateRefreshToken({ 
                userId: existingUser._id 
            });

            if (req) {
                const { ipAddress, device } = getClientInfo(req);
                
                await RefreshToken.create({
                    userId: existingUser._id,
                    token: refreshToken,
                    ipAddress,
                    device,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }).catch(err => console.error('RefreshToken save error:', err));

                await logLoginSuccess(existingUser._id, req, existingUser.email);
            }
            
            const userObject = existingUser.toObject();
            const { password: _, ...userWithoutPassword } = userObject;
            
            return { 
                accessToken, 
                refreshToken,
                user: userWithoutPassword,
                isNewUser: false
            };
        }
        
        let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        if (username.length < 3) {
            username = username + Math.random().toString(36).substring(2, 5);
        }
        if (username.length > 20) {
            username = username.substring(0, 20);
        }
        
        let usernameExists = await User.findOne({ username });
        let counter = 1;
        while (usernameExists) {
            const suffix = counter.toString();
            const baseUsername = username.substring(0, 20 - suffix.length);
            username = `${baseUsername}${suffix}`;
            usernameExists = await User.findOne({ username });
            counter++;
        }
        
        const randomPassword = Math.random().toString(36).substring(2) + 
                               Math.random().toString(36).substring(2) + 
                               'Aa1';
        const hashedPassword = await hashPassword(randomPassword);
        
        const newUser = await User.create({
            name: name || email.split('@')[0],
            username,
            email,
            password: hashedPassword,
            googleId,
            picture,
            role: 'USER',
            isEmailVerified: true
        });
        
        if (!newUser) {
            const error = new Error("Failed to create user");
            error.statusCode = 500;
            throw error;
        }
        
        await logRegistration(newUser._id, req, newUser);
        
        const accessToken = generateAccessToken({ 
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role
        });
        
        const refreshToken = generateRefreshToken({ 
            userId: newUser._id 
        });

        if (req) {
            const { ipAddress, device } = getClientInfo(req);
            
            await RefreshToken.create({
                userId: newUser._id,
                token: refreshToken,
                ipAddress,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }).catch(err => console.error('RefreshToken save error:', err));
        }
        
        const userObject = newUser.toObject();
        const { password: _, ...userWithoutPassword } = userObject;
        
        return { 
            accessToken, 
            refreshToken,
            user: userWithoutPassword,
            isNewUser: true
        };
        
    } catch (error) {
        throw error;
    }
};

export const loginUserByGoogle = async (userData, req) => {
    try {
        const { email, name, googleId, picture } = userData;
        
        if (!email || !googleId) {
            const error = new Error("Email and Google ID are required");
            error.statusCode = 400;
            throw error;
        }
        
        const existingUser = await User.findOne({ 
            $or: [{ email }, { googleId }] 
        });
        
        if (!existingUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        
        const accessToken = generateAccessToken({ 
            userId: existingUser._id,
            email: existingUser.email,
            role: existingUser.role
        });
        
        const refreshToken = generateRefreshToken({ 
            userId: existingUser._id 
        });

        if (req) {
            const { ipAddress, device } = getClientInfo(req);
            
            await RefreshToken.create({
                userId: existingUser._id,
                token: refreshToken,
                ipAddress,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }).catch(err => console.error('RefreshToken save error:', err));

            await logLoginSuccess(existingUser._id, req, existingUser.email);
        }
        
        const userObject = existingUser.toObject();
        const { password: _, ...userWithoutPassword } = userObject;
        
        return { 
            accessToken, 
            refreshToken,
            user: userWithoutPassword,
            isNewUser: false
        };
    } catch (error) {
        throw error;
    }
};

export const requestPasswordReset = async (email, req) => {
    try {
        email = email?.trim();

        if (!email) {
            const error = new Error("Email is required");
            error.statusCode = 400;
            throw error;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({ email });

        // Security best practice: Prevent email enumeration
        if (!user) {
            return {
                success: true,
                message: "If an account with that email exists, password reset instructions have been sent."
            };
        }

        const resetToken = generatePasswordResetToken({
            userId: user._id,
            email: user.email
        });

        await sendPasswordResetEmail(user.email, resetToken, req);

        await logAuditEvent({
            userId: user._id,
            action: 'PASSWORD_RESET',
            req,
            details: { email: user.email, stage: 'requested' }
        });

        return {
            success: true,
            message: "If an account with that email exists, password reset instructions have been sent.",
            resetToken // Included for convenience in development/testing
        };
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (token, newPassword, req) => {
    try {
        if (!token || !newPassword) {
            const error = new Error("Reset token and new password are required");
            error.statusCode = 400;
            throw error;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            const error = new Error("Password must be at least 8 characters with uppercase, lowercase, and number");
            error.statusCode = 400;
            throw error;
        }

        let decoded;
        try {
            decoded = verifyPasswordResetToken(token);
        } catch (err) {
            const error = new Error(err.message || "Invalid or expired password reset token");
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        // Invalidate all active sessions for security after password change
        await RefreshToken.deleteMany({ userId: user._id });

        await logAuditEvent({
            userId: user._id,
            action: 'PASSWORD_RESET',
            req,
            details: { email: user.email, stage: 'completed' }
        });

        return {
            success: true,
            message: "Password reset successfully. Please sign in with your new password."
        };
    } catch (error) {
        throw error;
    }
};


