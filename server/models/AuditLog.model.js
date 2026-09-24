import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGIN_ATTEMPT',
            'LOGOUT',
            'LOGOUT_ALL',
            'REGISTER',
            'PASSWORD_CHANGE',
            'PASSWORD_RESET',
            'PASSWORD_RESET_REQUESTED',
            'PASSWORD_RESET_COMPLETED',
            'EMAIL_VERIFIED',
            'ROLE_ASSIGNED',
            'USER_DELETED',
            'ACCOUNT_LOCKED',
            'ACCOUNT_UNLOCKED',
            'TOKEN_REFRESHED',
            'TOKEN_VERIFIED',
            'TOKEN_INVALID',
            'PROJECT_CREATED',
            'PROJECT_DELETED',
            'KEYS_ROTATED'
        ]
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ "details.projectId": 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

