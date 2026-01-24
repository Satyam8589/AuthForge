import { registerUser, loginUser } from "../services/auth.service.js";


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
        
        const result = await loginUser({ email, password });
        
        res.status(200).json({
            success: true,
            message: "Login successful",
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
