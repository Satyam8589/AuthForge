import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { registerUser, loginUser } from '../../services/auth.service.js';
import User from '../../models/User.model.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';
import { verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.js';

describe('Auth Service - loginUser', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  // Helper function to create a test user
  const createTestUser = async () => {
    return await registerUser({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePass123'
    });
  };

  describe('Successful Login', () => {
    test('should login with valid credentials', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.password).toBeUndefined();
    });

    test('should return valid access token', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyAccessToken(result.accessToken);
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('USER');
    });

    test('should return valid refresh token', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyRefreshToken(result.refreshToken);
      expect(decoded.userId).toBeDefined();
    });

    test('should return user data without password', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      expect(result.user).toHaveProperty('_id');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('role');
      expect(result.user).not.toHaveProperty('password');
    });

    test('should login with email in different case', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'Test@Example.COM',
        password: 'SecurePass123'
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('Validation Errors - 400', () => {
    test('should throw error when email is missing', async () => {
      const loginData = {
        password: 'SecurePass123'
      };

      await expect(loginUser(loginData)).rejects.toThrow('All fields are required');
    });

    test('should throw error when password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      await expect(loginUser(loginData)).rejects.toThrow('All fields are required');
    });

    test('should throw error with status code 400 for missing fields', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      try {
        await loginUser(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });

    test('should throw error for invalid email format', async () => {
      const loginData = {
        email: 'invalidemail',
        password: 'SecurePass123'
      };

      await expect(loginUser(loginData)).rejects.toThrow('Invalid email format');
    });

    test('should throw error with status code 400 for invalid email', async () => {
      const loginData = {
        email: 'invalid',
        password: 'SecurePass123'
      };

      try {
        await loginUser(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Authentication Errors - 401', () => {
    test('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123'
      };

      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });

    test('should throw error with status code 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123'
      };

      try {
        await loginUser(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    test('should throw error for incorrect password', async () => {
      await createTestUser();

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });

    test('should throw error with status code 401 for incorrect password', async () => {
      await createTestUser();

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      try {
        await loginUser(loginData);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    test('should not reveal if email exists (security)', async () => {
      await createTestUser();

      let wrongPasswordError;
      let wrongEmailError;

      // Wrong password
      try {
        await loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123'
        });
      } catch (error) {
        wrongPasswordError = error.message;
      }

      // Non-existent email
      try {
        await loginUser({
          email: 'nonexistent@example.com',
          password: 'SecurePass123'
        });
      } catch (error) {
        wrongEmailError = error.message;
      }

      // Both should throw same error message
      expect(wrongPasswordError).toBe('Invalid credentials');
      expect(wrongEmailError).toBe('Invalid credentials');
      expect(wrongPasswordError).toBe(wrongEmailError);
    });
  });

  describe('Password Validation', () => {
    test('should NOT validate password strength on login', async () => {
      // Create user with strong password
      await createTestUser();

      // Manually update user with weak password (simulating old user)
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { password: '$2b$12$weakpasswordhash' } // Simulated weak password hash
      );

      // Login should work regardless of password strength
      // (This test verifies we DON'T validate strength on login)
      const loginData = {
        email: 'test@example.com',
        password: 'weak' // This would fail registration but should attempt login
      };

      // Should fail with "Invalid credentials" not "Password too weak"
      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Case Sensitivity', () => {
    test('should handle email case insensitivity', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePass123'
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    test('should be case sensitive for password', async () => {
      await createTestUser();

      const loginData = {
        email: 'test@example.com',
        password: 'securepass123' // Wrong case
      };

      await expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Token Payload', () => {
    test('should include userId in access token', async () => {
      const user = await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyAccessToken(result.accessToken);
      expect(decoded.userId).toBeDefined();
      expect(decoded.userId.toString()).toBe(user._id.toString());
    });

    test('should include email in access token', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyAccessToken(result.accessToken);
      expect(decoded.email).toBe('test@example.com');
    });

    test('should include role in access token', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyAccessToken(result.accessToken);
      expect(decoded.role).toBe('USER');
    });

    test('should include userId in refresh token', async () => {
      const user = await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      const decoded = verifyRefreshToken(result.refreshToken);
      expect(decoded.userId).toBeDefined();
      expect(decoded.userId.toString()).toBe(user._id.toString());
    });
  });

  describe('Security', () => {
    test('should not return password in response', async () => {
      await createTestUser();

      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });

      expect(result.user.password).toBeUndefined();
      expect(result).not.toHaveProperty('password');
    });

    test('should use generic error message for failed login', async () => {
      await createTestUser();

      try {
        await loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123'
        });
      } catch (error) {
        // Should not reveal specific reason (wrong password vs wrong email)
        expect(error.message).toBe('Invalid credentials');
        expect(error.message).not.toContain('password');
        expect(error.message).not.toContain('email');
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle whitespace in email', async () => {
      await createTestUser();

      const result = await loginUser({
        email: '  test@example.com  ',
        password: 'SecurePass123'
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    test('should handle empty strings', async () => {
      const loginData = {
        email: '',
        password: ''
      };

      await expect(loginUser(loginData)).rejects.toThrow('All fields are required');
    });

    test('should handle null values', async () => {
      const loginData = {
        email: null,
        password: null
      };

      await expect(loginUser(loginData)).rejects.toThrow('All fields are required');
    });

    test('should handle undefined values', async () => {
      const loginData = {};

      await expect(loginUser(loginData)).rejects.toThrow('All fields are required');
    });
  });
});
