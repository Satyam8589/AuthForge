import { verifyAccessToken } from "../utils/jwt.js";
import { getUserByIdService } from "../services/user.service.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export const verifyTokenController = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = tokenFromHeader || req.body?.token;

        if (!token) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "Access token is required"
            });
        }

        const decoded = verifyAccessToken(token);
        const user = await getUserByIdService(decoded.userId);

        res.status(200).json({
            success: true,
            valid: true,
            project: {
                projectId: req.project.projectId,
                name: req.project.name
            },
            data: {
                user,
                tokenPayload: decoded
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            valid: false,
            message: error.message || "Invalid or expired access token"
        });
    }
};

export const getProjectPublicInfoController = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            projectId: req.project.projectId,
            name: req.project.name,
            apiKey: req.project.apiKey
        }
    });
};

export const sdkRegisterController = async (req, res) => {
    try {
        const user = await registerUser(req.body, req);
        res.status(201).json({
            success: true,
            message: "User registered successfully via AuthForge SDK",
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

export const sdkLoginController = async (req, res) => {
    try {
        const result = await loginUser(req.body, req);
        res.status(200).json({
            success: true,
            message: "Login successful via AuthForge SDK",
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
