import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from '../../routes/user.route.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import User from '../../models/User.model.js';
import { generateAccessToken } from '../../utils/jwt.js';

const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);

describe('GET /api/user/current-user - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  test('should return 200 and user data for authenticated request', async () => {
    // 1. Create a user
    const user = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePass123'
    });

    // 2. Generate token
    const token = generateAccessToken({ 
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // 3. Request current user
    const response = await request(app)
      .get('/api/user/current-user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.username).toBe('testuser');
    expect(response.body.data.password).toBeUndefined();
    expect(response.body.data.name).toBe('Test User');
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/user/current-user');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access denied. No token provided.');
  });

  test('should return 401 for invalid token format', async () => {
    const response = await request(app)
      .get('/api/user/current-user')
      .set('Authorization', 'InvalidTokenFormat');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid token format. Use 'Bearer <token>'");
  });

  test('should return 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/user/current-user')
      .set('Authorization', 'Bearer invalid.token.string');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid token. Authentication failed.');
  });

  test('should return 404 if user does not exist in database', async () => {
    // Generate token for a non-existent ID
    const nonExistentId = new mongoose.Types.ObjectId();
    const token = generateAccessToken({ 
      userId: nonExistentId,
      email: 'ghost@example.com',
      role: 'USER'
    });

    const response = await request(app)
      .get('/api/user/current-user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');
  });
});
