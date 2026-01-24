import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

export const generateAccessToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            jwtConfig.access.secret,
            { 
                expiresIn: jwtConfig.access.expiresIn,
                algorithm: jwtConfig.access.algorithm
            }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating access token: ${error.message}`);
    }
};

export const generateRefreshToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            jwtConfig.refresh.secret,
            { 
                expiresIn: jwtConfig.refresh.expiresIn,
                algorithm: jwtConfig.refresh.algorithm
            }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating refresh token: ${error.message}`);
    }
};

export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.access.secret);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid access token');
        }
        throw new Error(`Error verifying access token: ${error.message}`);
    }
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.refresh.secret);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        }
        throw new Error(`Error verifying refresh token: ${error.message}`);
    }
};

export const generateEmailVerificationToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            jwtConfig.emailVerification.secret,
            { expiresIn: jwtConfig.emailVerification.expiresIn }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating email verification token: ${error.message}`);
    }
};

export const generatePasswordResetToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            jwtConfig.passwordReset.secret,
            { expiresIn: jwtConfig.passwordReset.expiresIn }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating password reset token: ${error.message}`);
    }
};

export const verifyEmailVerificationToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.emailVerification.secret);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired email verification token');
    }
};

export const verifyPasswordResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.passwordReset.secret);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired password reset token');
    }
};
