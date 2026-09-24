import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.route.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import User from '../../models/User.model.js';
import { hashPassword } from '../../utils/hash.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Password Reset Endpoint - Integration Tests', () => {
    beforeAll(async () => {
        process.env.SKIP_RATE_LIMIT = "true";
        await connectDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    beforeEach(async () => {
        await clearDB();
    });

    describe('POST /api/auth/forgot-password', () => {
        test('should request password reset and return token in dev mode', async () => {
            await User.create({
                name: 'Integration User',
                username: 'integrationuser',
                email: 'integration@example.com',
                password: await hashPassword('InitialPass123')
            });

            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'integration@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBeDefined();
        });

        test('should handle request for non-existent email safely', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'unknown@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('If an account with that email exists');
        });

        test('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'bad-email-format' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/reset-password', () => {
        test('should successfully reset password with valid token', async () => {
            const user = await User.create({
                name: 'Integration User 2',
                username: 'integrationuser2',
                email: 'integration2@example.com',
                password: await hashPassword('InitialPass123')
            });

            // 1. Request reset
            const forgotRes = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'integration2@example.com' });

            const resetToken = forgotRes.body.resetToken;
            expect(resetToken).toBeDefined();

            // 2. Perform reset
            const resetRes = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: resetToken,
                    newPassword: 'BrandNewPassword1'
                });

            expect(resetRes.status).toBe(200);
            expect(resetRes.body.success).toBe(true);

            // 3. Verify user can log in with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'integration2@example.com',
                    password: 'BrandNewPassword1'
                });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.success).toBe(true);
            expect(loginRes.body.data.accessToken).toBeDefined();
        });

        test('should return 401 for invalid reset token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalid-token-value',
                    newPassword: 'BrandNewPassword1'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
