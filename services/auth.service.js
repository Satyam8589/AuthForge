import User from "../models/User.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { getClientInfo } from "../utils/clientInfo.js";
import { getLocationFromIP } from "../utils/clientInfo.js";
import AuditLog from "../models/AuditLog.model.js";


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

        if (req) {
            const { ipAddress, userAgent } = getClientInfo(req);
            
            await AuditLog.create({
                userId: user._id,
                action: 'REGISTER',
                ipAddress,
                userAgent,
                details: {
                    email: user.email,
                    username: user.username
                }
            }).catch(err => console.error('Audit log error:', err));
        }

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
            if (req) {
                const { ipAddress, userAgent } = getClientInfo(req);
                await AuditLog.create({
                    userId: null,
                    action: 'LOGIN_FAILED',
                    ipAddress,
                    userAgent,
                    details: { email, reason: 'User not found' }
                }).catch(err => console.error('Audit log error:', err));
            }
            
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            await User.findByIdAndUpdate(user._id, {
                $inc: { loginAttempts: 1 }
            });
            if (req) {
                const { ipAddress, userAgent } = getClientInfo(req);
                await AuditLog.create({
                    userId: user._id,
                    action: 'LOGIN_FAILED',
                    ipAddress,
                    userAgent,
                    details: { email, reason: 'Invalid password' }
                }).catch(err => console.error('Audit log error:', err));
            }
            
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
            const RefreshToken = (await import("../models/RefreshToken.model.js")).default;
            
            await RefreshToken.create({
                userId: user._id,
                token: refreshToken,
                ipAddress,
                device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }).catch(err => console.error('RefreshToken save error:', err));

            const { userAgent } = getClientInfo(req);
            await AuditLog.create({
                userId: user._id,
                action: 'LOGIN_SUCCESS',
                ipAddress,
                userAgent,
                details: { email: user.email }
            }).catch(err => console.error('Audit log error:', err));
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
