import mongoose from "mongoose";
import crypto from "crypto";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
        maxlength: [50, "Project name cannot exceed 50 characters"]
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    projectId: {
        type: String,
        required: true,
        unique: true,
        default: () => `proj_${crypto.randomBytes(8).toString("hex")}`
    },
    apiKey: {
        type: String,
        required: true,
        unique: true,
        default: () => `af_pk_${crypto.randomBytes(16).toString("hex")}`
    },
    apiSecret: {
        type: String,
        required: true,
        unique: true,
        default: () => `af_sk_${crypto.randomBytes(24).toString("hex")}`
    },
    allowedOrigins: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Helper method to build connection string
projectSchema.methods.getConnectionString = function(baseUrl = "http://localhost:2000") {
    const parsedUrl = new URL(baseUrl);
    const hostWithPort = parsedUrl.host;
    const protocol = parsedUrl.protocol; // http: or https:
    return `authforge://${this.apiKey}:${this.apiSecret}@${this.projectId}?host=${encodeURIComponent(baseUrl)}`;
};

export default mongoose.model("Project", projectSchema);
