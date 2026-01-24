import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String
    },
    role: {
        type: String,
        enum: ["ADMIN", "MANAGER", "USER"],
        default: "USER"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);