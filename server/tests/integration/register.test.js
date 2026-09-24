import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.route.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('Successful Registration', () => {
    test('should return 201 and user data for valid registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.username).toBe('johndoe');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data.role).toBe('USER');
      expect(response.body.data.password).toBeUndefined();
    });

    test('should return user with all required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).toHaveProperty('isEmailVerified');
      expect(response.body.data).toHaveProperty('loginAttempts');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });
  });

  describe('Validation Errors - 400 Bad Request', () => {
    test('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    test('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    test('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'invalidemail',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    test('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password must be at least 8 characters');
    });

    test('should return 400 for invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'ab',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username must be 3-20 alphanumeric characters');
    });
  });

  describe('Conflict Errors - 409', () => {
    test('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          username: 'firstuser',
          email: 'duplicate@example.com',
          password: 'SecurePass123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          username: 'seconduser',
          email: 'duplicate@example.com',
          password: 'AnotherPass123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    test('should return 409 for duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          username: 'duplicateuser',
          email: 'first@example.com',
          password: 'SecurePass123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          username: 'duplicateuser',
          email: 'second@example.com',
          password: 'AnotherPass123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username already exists');
    });
  });

  describe('Data Transformation', () => {
    test('should convert email to lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'Test@Example.COM',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe('test@example.com');
    });

    test('should convert username to lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'TestUser123',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('testuser123');
    });
  });

  describe('Security Tests', () => {
    test('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should ignore role field from request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker',
          username: 'hacker',
          email: 'hacker@example.com',
          password: 'SecurePass123',
          role: 'ADMIN'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe('USER');
    });

    test('should initialize security fields correctly', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.body.data.isEmailVerified).toBe(false);
      expect(response.body.data.loginAttempts).toBe(0);
      expect(response.body.data.lockUntil).toBeNull();
    });
  });

  describe('Response Format', () => {
    test('should return correct response structure for success', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    test('should return correct response structure for error', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    test('should set correct Content-Type header', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle null values', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: null,
          username: null,
          email: null,
          password: null
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should trim whitespace from inputs', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '  John Doe  ',
          username: '  johndoe  ',
          email: '  john@example.com  ',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.username).toBe('johndoe');
      expect(response.body.data.email).toBe('john@example.com');
    });
  });
});
