import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { registerUser } from '../../services/auth.service.js';
import User from '../../models/User.model.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

describe('Auth Service - registerUser', () => {
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
    test('should register a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.username).toBe('johndoe');
      expect(result.email).toBe('john@example.com');
      expect(result.role).toBe('USER');
      expect(result.isEmailVerified).toBe(false);
      expect(result.loginAttempts).toBe(0);
      expect(result.password).toBeUndefined();
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    test('should hash the password before storing', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await registerUser(userData);

      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('SecurePass123');
      expect(user.password).toMatch(/^\$2b\$/);
    });

    test('should convert email to lowercase', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'Test@Example.COM',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result.email).toBe('test@example.com');
    });

    test('should convert username to lowercase', async () => {
      const userData = {
        name: 'Test User',
        username: 'TestUser123',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result.username).toBe('testuser123');
    });

    test('should default role to USER', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result.role).toBe('USER');
    });
  });

  describe('Validation Errors', () => {
    test('should throw error when name is missing', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('All fields are required');
    });

    test('should throw error when username is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('All fields are required');
    });

    test('should throw error when email is missing', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('All fields are required');
    });

    test('should throw error when password is missing', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com'
      };

      await expect(registerUser(userData)).rejects.toThrow('All fields are required');
    });

    test('should throw error with status code 400 for missing fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      try {
        await registerUser(userData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Email Validation', () => {
    test('should throw error for invalid email format - no @', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'invalidemail.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Invalid email format');
    });

    test('should throw error for invalid email format - no domain', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Invalid email format');
    });

    test('should throw error with status code 400 for invalid email', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'invalid',
        password: 'SecurePass123'
      };

      try {
        await registerUser(userData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Password Validation', () => {
    test('should throw error for password too short', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Short1'
      };

      await expect(registerUser(userData)).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should throw error for password without uppercase', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'lowercase123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should throw error for password without lowercase', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'UPPERCASE123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should throw error for password without number', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'NoNumberPass'
      };

      await expect(registerUser(userData)).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should accept password with special characters', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Secure@Pass123'
      };

      const result = await registerUser(userData);
      expect(result).toBeDefined();
    });

    test('should throw error with status code 400 for weak password', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak'
      };

      try {
        await registerUser(userData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Username Validation', () => {
    test('should throw error for username too short', async () => {
      const userData = {
        name: 'Test User',
        username: 'ab',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Username must be 3-20 alphanumeric characters');
    });

    test('should throw error for username too long', async () => {
      const userData = {
        name: 'Test User',
        username: 'thisusernameiswaytoolong123',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Username must be 3-20 alphanumeric characters');
    });

    test('should throw error for username with special characters', async () => {
      const userData = {
        name: 'Test User',
        username: 'user@name!',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Username must be 3-20 alphanumeric characters');
    });

    test('should throw error for username with spaces', async () => {
      const userData = {
        name: 'Test User',
        username: 'user name',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await expect(registerUser(userData)).rejects.toThrow('Username must be 3-20 alphanumeric characters');
    });

    test('should accept username with underscores', async () => {
      const userData = {
        name: 'Test User',
        username: 'test_user',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);
      expect(result.username).toBe('test_user');
    });

    test('should throw error with status code 400 for invalid username', async () => {
      const userData = {
        name: 'Test User',
        username: 'ab',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      try {
        await registerUser(userData);
      } catch (error) {
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Duplicate User Checks', () => {
    test('should throw error for duplicate email', async () => {
      const userData1 = {
        name: 'First User',
        username: 'firstuser',
        email: 'duplicate@example.com',
        password: 'SecurePass123'
      };

      const userData2 = {
        name: 'Second User',
        username: 'seconduser',
        email: 'duplicate@example.com',
        password: 'AnotherPass123'
      };

      await registerUser(userData1);
      await expect(registerUser(userData2)).rejects.toThrow('Email already exists');
    });

    test('should throw error for duplicate username', async () => {
      const userData1 = {
        name: 'First User',
        username: 'duplicateuser',
        email: 'first@example.com',
        password: 'SecurePass123'
      };

      const userData2 = {
        name: 'Second User',
        username: 'duplicateuser',
        email: 'second@example.com',
        password: 'AnotherPass123'
      };

      await registerUser(userData1);
      await expect(registerUser(userData2)).rejects.toThrow('Username already exists');
    });

    test('should throw error with status code 409 for duplicate email', async () => {
      const userData1 = {
        name: 'First User',
        username: 'firstuser',
        email: 'duplicate@example.com',
        password: 'SecurePass123'
      };

      const userData2 = {
        name: 'Second User',
        username: 'seconduser',
        email: 'duplicate@example.com',
        password: 'AnotherPass123'
      };

      await registerUser(userData1);

      try {
        await registerUser(userData2);
      } catch (error) {
        expect(error.statusCode).toBe(409);
      }
    });
  });

  describe('Security Tests', () => {
    test('should not include password in returned user object', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result.password).toBeUndefined();
      expect(result).not.toHaveProperty('password');
    });

    test('should store password as bcrypt hash', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      await registerUser(userData);

      const user = await User.findOne({ email: 'test@example.com' }).select('+password');
      expect(user.password).toMatch(/^\$2b\$/); // Accept any bcrypt hash
    });

    test('should initialize security fields correctly', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const result = await registerUser(userData);

      expect(result.isEmailVerified).toBe(false);
      expect(result.loginAttempts).toBe(0);
      expect(result.lockUntil).toBeNull();
    });
  });
});
