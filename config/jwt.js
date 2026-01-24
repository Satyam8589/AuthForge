import dotenv from "dotenv";

dotenv.config();

const jwtConfig = {
    access: {
        secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
        algorithm: 'HS256'
    },

    refresh: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
        algorithm: 'HS256'
    },

    emailVerification: {
        secret: process.env.JWT_EMAIL_SECRET || process.env.JWT_ACCESS_SECRET || 'your-email-secret-key',
        expiresIn: '24h'
    },

    passwordReset: {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET || 'your-reset-secret-key',
        expiresIn: '1h'
    }
};

const validateJwtConfig = () => {
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET must be set in production environment');
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET must be set in production environment');
        }
        if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
        }
    }
};

validateJwtConfig();

export default jwtConfig;
