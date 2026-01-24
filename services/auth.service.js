import User from "../models/User.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const registerUser = async (userData) => {
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

        const userObject = user.toObject();
        const { password: _, ...userWithoutPassword } = userObject;

        return userWithoutPassword;

    } catch (error) {
        throw error;
    }
};

export const loginUser = async (userData) => {
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
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }
        
        const accessToken = generateAccessToken({ 
            userId: user._id,
            email: user.email,
            role: user.role
        });
        
        const refreshToken = generateRefreshToken({ 
            userId: user._id 
        });
        
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
