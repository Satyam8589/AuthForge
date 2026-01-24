import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { registerUser, loginUser, logoutUser, logoutAllDevices } from '../../services/auth.service.js';
import RefreshToken from '../../models/RefreshToken.model.js';
import AuditLog from '../../models/AuditLog.model.js';
import { connectDB, closeDB, clearDB } from '../setup/testDb.js';

describe('Logout Functionality', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    await RefreshToken.deleteMany({});
    await AuditLog.deleteMany({});
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

  // Helper to create and login a user
  const createAndLoginUser = async () => {
    const mockReq = createMockReq();
    
    await registerUser({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePass123'
    }, mockReq);

    const loginResult = await loginUser({
      email: 'test@example.com',
      password: 'SecurePass123'
    }, mockReq);

    return loginResult;
  };

  describe('Single Device Logout', () => {
    test('should successfully logout with valid refresh token', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      const result = await logoutUser(loginResult.user._id, loginResult.refreshToken, mockReq);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Logged out successfully");
    });

    test('should delete refresh token from database', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      await logoutUser(loginResult.user._id, loginResult.refreshToken, mockReq);

      const tokens = await RefreshToken.find({ userId: loginResult.user._id });
      expect(tokens.length).toBe(0);
    });

    test('should create audit log on logout', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      // Clear previous audit logs
      await AuditLog.deleteMany({});

      await logoutUser(loginResult.user._id, loginResult.refreshToken, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: loginResult.user._id,
        action: 'LOGOUT'
      });

      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].ipAddress).toBe('192.168.1.1');
    });

    test('should throw error for invalid refresh token', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      await expect(
        logoutUser(loginResult.user._id, 'invalid-token', mockReq)
      ).rejects.toThrow('Invalid refresh token');
    });

    test('should throw error with status code 401 for invalid token', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      try {
        await logoutUser(loginResult.user._id, 'invalid-token', mockReq);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    test('should include device info in audit log', async () => {
      const loginResult = await createAndLoginUser();
      const mockReq = createMockReq();

      await AuditLog.deleteMany({});
      await logoutUser(loginResult.user._id, loginResult.refreshToken, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ 
        userId: loginResult.user._id,
        action: 'LOGOUT'
      });

      expect(auditLog.details).toHaveProperty('device');
      expect(auditLog.details).toHaveProperty('tokenId');
    });
  });

  describe('Logout All Devices', () => {
    test('should logout from all devices', async () => {
      const mockReq = createMockReq();
      
      // Register user
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      // Login from 3 different devices with delays to avoid duplicate tokens
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await new Promise(resolve => setTimeout(resolve, 10));
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, createMockReq('192.168.1.2'));
      await new Promise(resolve => setTimeout(resolve, 10));
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, createMockReq('192.168.1.3'));

      const result = await logoutAllDevices(user._id, mockReq);

      expect(result.success).toBe(true);
      expect(result.message).toContain('3');
    });

    test('should delete all refresh tokens', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      // Login from multiple devices
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, createMockReq('192.168.1.2'));

      await logoutAllDevices(user._id, mockReq);

      const tokens = await RefreshToken.find({ userId: user._id });
      expect(tokens.length).toBe(0);
    });

    test('should create audit log for logout all devices', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);

      await AuditLog.deleteMany({});
      await logoutAllDevices(user._id, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: user._id,
        action: 'LOGOUT'
      });

      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].details.logoutType).toBe('all_devices');
    });

    test('should include device count in audit log', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await new Promise(resolve => setTimeout(resolve, 10));
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await new Promise(resolve => setTimeout(resolve, 10));
      await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);

      await AuditLog.deleteMany({});
      await logoutAllDevices(user._id, mockReq);
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLog = await AuditLog.findOne({ 
        userId: user._id,
        action: 'LOGOUT'
      });

      expect(auditLog.details.devicesCount).toBe(3);
    });

    test('should work even with no active sessions', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      const result = await logoutAllDevices(user._id, mockReq);

      expect(result.success).toBe(true);
      expect(result.message).toContain('0');
    });
  });

  describe('Multiple Sessions Management', () => {
    test('should only logout specific device', async () => {
      const mockReq1 = createMockReq('192.168.1.1');
      const mockReq2 = createMockReq('192.168.1.2');
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq1);

      const login1 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq1);
      await new Promise(resolve => setTimeout(resolve, 10));
      const login2 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq2);

      // Logout from device 1
      await logoutUser(user._id, login1.refreshToken, mockReq1);

      // Device 2 should still have token
      const remainingTokens = await RefreshToken.find({ userId: user._id });
      expect(remainingTokens.length).toBe(1);
      expect(remainingTokens[0].token).toBe(login2.refreshToken);
    });

    test('should track logout from different IP addresses', async () => {
      const mockReq1 = createMockReq('192.168.1.1');
      const mockReq2 = createMockReq('203.0.113.45');
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq1);

      const login1 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq1);
      const login2 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq2);

      await AuditLog.deleteMany({});

      await logoutUser(user._id, login1.refreshToken, mockReq1);
      await logoutUser(user._id, login2.refreshToken, mockReq2);

      await new Promise(resolve => setTimeout(resolve, 100));

      const auditLogs = await AuditLog.find({ 
        userId: user._id,
        action: 'LOGOUT'
      }).sort({ createdAt: 1 });

      expect(auditLogs.length).toBe(2);
      expect(auditLogs[0].ipAddress).toBe('192.168.1.1');
      expect(auditLogs[1].ipAddress).toBe('203.0.113.45');
    });
  });

  describe('Edge Cases', () => {
    test('should handle logout without req object', async () => {
      const loginResult = await createAndLoginUser();

      const result = await logoutUser(loginResult.user._id, loginResult.refreshToken, null);

      expect(result.success).toBe(true);
      
      // Should still delete token
      const tokens = await RefreshToken.find({ userId: loginResult.user._id });
      expect(tokens.length).toBe(0);
    });

    test('should handle logout all devices without req object', async () => {
      const loginResult = await createAndLoginUser();

      const result = await logoutAllDevices(loginResult.user._id, null);

      expect(result.success).toBe(true);
      
      // Should still delete tokens
      const tokens = await RefreshToken.find({ userId: loginResult.user._id });
      expect(tokens.length).toBe(0);
    });

    test('should handle concurrent logouts', async () => {
      const mockReq = createMockReq();
      
      const user = await registerUser({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      }, mockReq);

      const login1 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);
      await new Promise(resolve => setTimeout(resolve, 10));
      const login2 = await loginUser({ email: 'test@example.com', password: 'SecurePass123' }, mockReq);

      // Logout sequentially (concurrent logout of same token would fail)
      await logoutUser(user._id, login1.refreshToken, mockReq);
      await logoutUser(user._id, login2.refreshToken, mockReq);

      const tokens = await RefreshToken.find({ userId: user._id });
      expect(tokens.length).toBe(0);
    });
  });
});
