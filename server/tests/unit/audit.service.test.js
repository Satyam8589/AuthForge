import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { registerUser, loginUser, getUserAuditLogsService } from '../../services/auth.service.js';
import AuditLog from '../../models/AuditLog.model.js';
import User from '../../models/User.model.js';
import RefreshToken from '../../models/RefreshToken.model.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

describe('Audit Log Functionality', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    // Also clear RefreshTokens to avoid duplicate token errors
    await RefreshToken.deleteMany({});
  });

  // Mock request object
  const createMockReq = (ip = '192.168.1.1', userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0') => ({
    ip,
    headers: {
      'user-agent': userAgent,
      'x-forwarded-for': ip
    },
    connection: {
      remoteAddress: ip
    }
  });

  describe('Registration Audit Logs', () => {
    test('should create audit log on successful registration', async () => {
      const mockReq = createMockReq();
      
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const user = await registerUser(userData, mockReq);

      // Wait a bit for async audit log creation
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ userId: user._id });
      
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].action).toBe('REGISTER');
      expect(auditLogs[0].ipAddress).toBe('192.168.1.1');
      expect(auditLogs[0].userAgent).toContain('Chrome');
      expect(auditLogs[0].details.email).toBe('test@example.com');
      expect(auditLogs[0].details.username).toBe('testuser');
    });

    test('should capture correct IP address from request', async () => {
      const mockReq = createMockReq('203.0.113.45');
      
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const user = await registerUser(userData, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      expect(auditLog.ipAddress).toBe('203.0.113.45');
    });

    test('should capture user agent from request', async () => {
      const mockReq = createMockReq('192.168.1.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1');
      
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const user = await registerUser(userData, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      expect(auditLog.userAgent).toContain('iPhone');
      expect(auditLog.userAgent).toContain('Safari');
    });

    test('should not create audit log if req is not provided', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const user = await registerUser(userData, null);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ userId: user._id });
      expect(auditLogs.length).toBe(0);
    });
  });

  describe('Login Success Audit Logs', () => {
    test('should create audit log on successful login', async () => {
      const mockReq = createMockReq();
      
      // First register a user
      await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      // Clear audit logs from registration
      await AuditLog.deleteMany({});

      // Now login
      const result = await loginUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ userId: result.user._id });
      
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].action).toBe('LOGIN_SUCCESS');
      expect(auditLogs[0].ipAddress).toBe('192.168.1.1');
      expect(auditLogs[0].details.email).toBe('test@example.com');
    });

    test('should track multiple successful logins', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      // Clear registration audit log
      await AuditLog.deleteMany({});

      // Login multiple times
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: user._id,
        action: 'LOGIN_SUCCESS'
      });
      
      expect(auditLogs.length).toBe(3);
    });
  });

  describe('Login Failed Audit Logs', () => {
    test('should create audit log on failed login - wrong password', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      // Clear registration audit log
      await AuditLog.deleteMany({});

      // Try to login with wrong password
      try {
        await loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123'
        }, mockReq);
      } catch (error) {
        // Expected to fail
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: user._id,
        action: 'LOGIN_FAILED'
      });
      
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].details.reason).toBe('Invalid password');
      expect(auditLogs[0].details.email).toBe('test@example.com');
    });

    test('should create audit log on failed login - user not found', async () => {
      const mockReq = createMockReq();

      try {
        await loginUser({
          email: 'nonexistent@example.com',
          password: 'SecurePass123'
        }, mockReq);
      } catch (error) {
        // Expected to fail
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        action: 'LOGIN_FAILED',
        userId: null
      });
      
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].details.reason).toBe('User not found');
      expect(auditLogs[0].details.email).toBe('nonexistent@example.com');
    });

    test('should track multiple failed login attempts', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await AuditLog.deleteMany({});

      // Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await loginUser({
            email: 'test@example.com',
            password: 'WrongPassword123'
          }, mockReq);
        } catch (error) {
          // Expected to fail
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: user._id,
        action: 'LOGIN_FAILED'
      });
      
      expect(auditLogs.length).toBe(5);
    });
  });

  describe('Audit Log Data Integrity', () => {
    test('should have all required fields in audit log', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      
      expect(auditLog).toHaveProperty('userId');
      expect(auditLog).toHaveProperty('action');
      expect(auditLog).toHaveProperty('ipAddress');
      expect(auditLog).toHaveProperty('userAgent');
      expect(auditLog).toHaveProperty('details');
      expect(auditLog).toHaveProperty('createdAt');
      expect(auditLog).toHaveProperty('updatedAt');
    });

    test('should store timestamps correctly', async () => {
      const mockReq = createMockReq();
      
      const beforeTime = new Date();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const afterTime = new Date();
      const auditLog = await AuditLog.findOne({ userId: user._id });
      
      expect(auditLog.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(auditLog.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test('should store details as object', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      
      expect(typeof auditLog.details).toBe('object');
      expect(auditLog.details).toHaveProperty('email');
      expect(auditLog.details).toHaveProperty('username');
    });
  });

  describe('Different IP Addresses', () => {
    test('should handle localhost IP', async () => {
      const mockReq = createMockReq('127.0.0.1');
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      expect(auditLog.ipAddress).toBe('127.0.0.1');
    });

    test('should handle IPv6 addresses', async () => {
      const mockReq = createMockReq('::1');
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      // Should be converted to IPv4
      expect(auditLog.ipAddress).toBe('127.0.0.1');
    });

    test('should handle public IP addresses', async () => {
      const mockReq = createMockReq('203.0.113.45');
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ userId: user._id });
      expect(auditLog.ipAddress).toBe('203.0.113.45');
    });
  });

  describe('Audit Log Querying', () => {
    test('should be able to query logs by userId', async () => {
      const mockReq = createMockReq();
      
      const user1 = await registerUser({
        name: 'User 1',
        username: 'user1',
        email: 'user1@example.com',
        password: 'SecurePass123'
      }, mockReq);

      const user2 = await registerUser({
        name: 'User 2',
        username: 'user2',
        email: 'user2@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const user1Logs = await AuditLog.find({ userId: user1._id });
      const user2Logs = await AuditLog.find({ userId: user2._id });
      
      expect(user1Logs.length).toBe(1);
      expect(user2Logs.length).toBe(1);
      expect(user1Logs[0].details.email).toBe('user1@example.com');
      expect(user2Logs[0].details.email).toBe('user2@example.com');
    });

    test('should be able to query logs by action', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await AuditLog.deleteMany({});

      // Create different actions
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      
      try {
        await loginUser({ email: 'test@example.com', password: 'Wrong123' }, mockReq);
      } catch (error) {}

      await new Promise(resolve => setTimeout(resolve, 100));

      const successLogs = await AuditLog.find({ action: 'LOGIN_SUCCESS' });
      const failedLogs = await AuditLog.find({ action: 'LOGIN_FAILED' });
      
      expect(successLogs.length).toBe(1);
      expect(failedLogs.length).toBe(1);
    });

    test('should be able to query logs by date range', async () => {
      const mockReq = createMockReq();
      
      const startTime = new Date();
      
      await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const endTime = new Date();

      const logs = await AuditLog.find({
        createdAt: {
          $gte: startTime,
          $lte: endTime
        }
      });
      
      expect(logs.length).toBeGreaterThan(0);
    });

    test('should fetch audit logs via getUserAuditLogsService', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Audit Fetch User',
        username: 'auditfetchuser',
        email: 'auditfetch@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await new Promise(resolve => setTimeout(resolve, 100));

      const logs = await getUserAuditLogsService(user._id, 10);
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('REGISTER');
    });
  });
});
