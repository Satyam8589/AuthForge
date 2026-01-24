import dotenv from "dotenv";

dotenv.config();

/**
 * JWT Configuration
 * Centralizes all JWT-related settings for access and refresh tokens
 */

const jwtConfig = {
    // Access Token Configuration
    access: {
        secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m', // 15 minutes
        algorithm: 'HS256'
    },

    // Refresh Token Configuration
    refresh: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 days
        algorithm: 'HS256'
    },

    // Email Verification Token Configuration
    emailVerification: {
        secret: process.env.JWT_EMAIL_SECRET || process.env.JWT_ACCESS_SECRET || 'your-email-secret-key',
        expiresIn: '24h' // 24 hours
    },

    // Password Reset Token Configuration
    passwordReset: {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET || 'your-reset-secret-key',
        expiresIn: '1h' // 1 hour
    }
};

/**
 * Validate JWT Configuration
 * Ensures all required secrets are set in production
 */
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

// Run validation on import
validateJwtConfig();

export default jwtConfig;
