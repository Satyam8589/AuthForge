import jwtConfig from "../config/jwt.js";

/**
 * Send password reset email to user
 * @param {string} email - Recipient email address
 * @param {string} resetToken - JWT reset token
 * @param {object} [req] - Express request object for deriving base URL
 */
export const sendPasswordResetEmail = async (email, resetToken, req) => {
    try {
        const protocol = req ? (req.headers['x-forwarded-proto'] || req.protocol) : 'http';
        const host = req ? req.get('host') : 'localhost:3000';
        const resetUrl = `${protocol}://${host}/?resetToken=${encodeURIComponent(resetToken)}`;

        // Log the reset email details clearly for development / testing environments
        console.log('\n======================================================');
        console.log('📧 [AUTHFORGE EMAIL SERVICE] PASSWORD RESET EMAIL');
        console.log('======================================================');
        console.log(`To:          ${email}`);
        console.log(`Subject:     AuthForge - Password Reset Request`);
        console.log(`Reset Token: ${resetToken}`);
        console.log(`Reset Link:  ${resetUrl}`);
        console.log(`Expires In:  ${jwtConfig.passwordReset.expiresIn}`);
        console.log('======================================================\n');

        return {
            sent: true,
            email,
            resetToken,
            resetUrl,
            message: "Password reset instructions sent successfully"
        };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};
