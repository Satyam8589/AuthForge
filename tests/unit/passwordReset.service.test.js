import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../models/User.model.js';
import RefreshToken from '../../models/RefreshToken.model.js';
import AuditLog from '../../models/AuditLog.model.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import { requestPasswordReset, resetPassword, registerUser } from '../../services/auth.service.js';
import { generatePasswordResetToken } from '../../utils/jwt.js';
import { comparePassword } from '../../utils/hash.js';

describe('Password Reset Functionality', () => {
    let mockReq;
    let testUser;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();

        mockReq = {
            ip: '127.0.0.1',
            headers: {
                'user-agent': 'JestTestRunner/1.0',
                'x-forwarded-proto': 'http',
                host: 'localhost:3000'
            },
            get: function(header) {
                return this.headers[header.toLowerCase()];
            }
        };

        // Create a test user
        testUser = await registerUser({
            name: 'Reset Test User',
            username: 'resetuser',
            email: 'reset@example.com',
            password: 'OldPassword1'
        }, mockReq);
    });

    describe('requestPasswordReset Service', () => {
        test('should process reset request for existing email and generate token', async () => {
            const result = await requestPasswordReset('reset@example.com', mockReq);
            expect(result.success).toBe(true);
            expect(result.resetToken).toBeDefined();

            // Verify audit log
            const auditLogs = await AuditLog.find({ action: 'PASSWORD_RESET' });
            expect(auditLogs.length).toBe(1);
            expect(auditLogs[0].details.stage).toBe('requested');
        });

        test('should return standard success message for non-existent email without throwing error', async () => {
            const result = await requestPasswordReset('nonexistent@example.com', mockReq);
            expect(result.success).toBe(true);
            expect(result.message).toContain('If an account with that email exists');
        });

        test('should throw 400 error for empty email', async () => {
            await expect(requestPasswordReset('', mockReq)).rejects.toThrow('Email is required');
        });

        test('should throw 400 error for invalid email format', async () => {
            await expect(requestPasswordReset('invalid-email-format', mockReq)).rejects.toThrow('Invalid email format');
        });
    });

    describe('resetPassword Service', () => {
        test('should reset password with valid token and hash new password', async () => {
            const resetToken = generatePasswordResetToken({
                userId: testUser._id,
                email: testUser.email
            });

            const result = await resetPassword(resetToken, 'NewPassword123', mockReq);
            expect(result.success).toBe(true);

            // Verify new password works
            const updatedUser = await User.findById(testUser._id).select('+password');
            const isMatch = await comparePassword('NewPassword123', updatedUser.password);
            expect(isMatch).toBe(true);

            // Verify audit log created
            const auditLogs = await AuditLog.find({ action: 'PASSWORD_RESET', 'details.stage': 'completed' });
            expect(auditLogs.length).toBe(1);
        });

        test('should invalidate all active refresh tokens upon resetting password', async () => {
            // Create active refresh token session
            await RefreshToken.create({
                userId: testUser._id,
                token: 'mock-session-refresh-token',
                ipAddress: '127.0.0.1',
                device: 'Desktop',
                expiresAt: new Date(Date.now() + 86400000)
            });

            let activeSessions = await RefreshToken.find({ userId: testUser._id });
            expect(activeSessions.length).toBe(1);

            const resetToken = generatePasswordResetToken({
                userId: testUser._id,
                email: testUser.email
            });

            await resetPassword(resetToken, 'BrandNewPass1', mockReq);

            activeSessions = await RefreshToken.find({ userId: testUser._id });
            expect(activeSessions.length).toBe(0);
        });

        test('should throw error for weak new password', async () => {
            const resetToken = generatePasswordResetToken({
                userId: testUser._id,
                email: testUser.email
            });

            await expect(resetPassword(resetToken, 'weak', mockReq)).rejects.toThrow(
                'Password must be at least 8 characters'
            );
        });

        test('should throw 401 error for invalid or tampered reset token', async () => {
            await expect(resetPassword('invalid.tampered.jwt', 'NewPassword123', mockReq)).rejects.toThrow(
                'Invalid or expired password reset token'
            );
        });
    });
});
