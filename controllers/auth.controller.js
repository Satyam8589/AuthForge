import { registerUser } from "../services/auth.service.js";

export const registerUserController = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        
        const user = await registerUser({ name, username, email, password });
        
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            data: user 
        });
    } catch (error) {
        // Use status code from error if available, otherwise default to 500
        const statusCode = error.statusCode || 500;
        
        res.status(statusCode).json({ 
            success: false, 
            message: error.message 
        });
    }
};