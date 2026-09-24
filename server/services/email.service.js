import nodemailer from "nodemailer";
import jwtConfig from "../config/jwt.js";

/**
 * Get configured Nodemailer transport or null if SMTP credentials are not set
 */
const getTransporter = () => {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const rawPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
    const pass = rawPass.replace(/\s+/g, '');

    if (!user || !pass) {
        console.warn("⚠️ [AUTHFORGE EMAIL SERVICE] EMAIL_USER or EMAIL_PASS is missing in environment variables.");
        return null;
    }

    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user, pass }
        });
    }

    // Standard Nodemailer Gmail Transport
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
};

/**
 * Send password reset email to user
 * @param {string} email - Recipient email address
 * @param {string} resetToken - JWT reset token
 * @param {object} [req] - Express request object for deriving base URL
 */
export const sendPasswordResetEmail = async (email, resetToken, req) => {
    try {
        const clientBase = (process.env.CLIENT_URL || (req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3000')).replace(/\/$/, '');
        const resetUrl = `${clientBase}/?resetToken=${encodeURIComponent(resetToken)}`;

        const transporter = getTransporter();

        if (transporter) {
            const senderUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
            const from = process.env.EMAIL_FROM || `"AuthForge Security" <${senderUser}>`;

            const mailOptions = {
                from,
                to: email,
                subject: '🔒 Reset Your AuthForge Password',
                text: `You requested a password reset for your AuthForge account.\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis link expires in ${jwtConfig.passwordReset.expiresIn}.\nIf you did not request this reset, please ignore this email.`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #f8fafc; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h2 style="color: #818cf8; margin: 0; font-size: 24px;">🔐 AuthForge</h2>
                            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Enterprise Security & Authentication</p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
                        <h3 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Request</h3>
                        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                            We received a request to reset the password for your account (<strong>${email}</strong>).
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                                Reset My Password
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                            Or copy and paste this link into your browser:<br/>
                            <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
                        </p>
                        <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px; margin-top: 24px;">
                            <p style="color: #fbbf24; font-size: 13px; margin: 0;">
                                ⚠️ This link is valid for <strong>${jwtConfig.passwordReset.expiresIn}</strong>. If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0 16px 0;" />
                        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                            © 2026 AuthForge Enterprise Auth. Automated Security System.
                        </p>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ [AUTHFORGE EMAIL SERVICE] Reset email sent to ${email}: ${info.messageId}`);
            return {
                sent: true,
                mode: 'smtp',
                email,
                messageId: info.messageId,
                message: "Password reset instructions sent to recipient inbox"
            };
        } else {
            console.log('📧 [AUTHFORGE EMAIL SERVICE] Dev fallback mode: Reset URL is:', resetUrl);
            return {
                sent: true,
                mode: 'console_dev',
                email,
                resetToken,
                resetUrl,
                message: "Password reset instructions generated (check server log or console)"
            };
        }
    } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};
