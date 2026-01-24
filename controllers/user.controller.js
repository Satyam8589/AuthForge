import { getUserByIdService } from "../services/user.service.js";


export const getCurrentUserController = async (req, res) => {
    try {
        const user = await getUserByIdService(req.user.userId);
        
        res.status(200).json({
            success: true,
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