import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        default: "default",
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    googleId: {
        type: String
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

// Compound unique indexes: Email, username, and googleId are unique PER PROJECT
userSchema.index({ email: 1, projectId: 1 }, { unique: true });
userSchema.index({ username: 1, projectId: 1 }, { unique: true });
userSchema.index({ googleId: 1, projectId: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);