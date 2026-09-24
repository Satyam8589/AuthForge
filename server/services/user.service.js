import User from "../models/User.model.js";

export const getUserByIdService = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password -__v");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        return user;
    } catch (error) {
        throw error;
    }
};