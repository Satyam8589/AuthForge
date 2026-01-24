import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
    generalLimiter, 
    loginLimiter, 
    registerLimiter, 
    logoutLimiter 
} from '../../middlewares/rateLimiter.middleware.js';

describe('Rate Limiter Middleware', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.set('trust proxy', true);
    });

    afterAll(() => {
        // Clean up
    });

    describe('General Limiter', () => {
        let testApp;

        beforeAll(() => {
            testApp = express();
            testApp.use(express.json());
            testApp.set('trust proxy', true);
            testApp.use(generalLimiter);
            testApp.get('/test', (req, res) => {
                res.status(200).json({ success: true, message: 'OK' });
            });
        });

        test('should allow requests within limit', async () => {
            const response = await request(testApp)
                .get('/test')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should return rate limit headers', async () => {
            const response = await request(testApp)
                .get('/test');

            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(response.headers).toHaveProperty('ratelimit-remaining');
            expect(response.headers).toHaveProperty('ratelimit-reset');
        });

        test('should block requests after exceeding limit', async () => {
            const testAppStrict = express();
            testAppStrict.use(express.json());
            testAppStrict.set('trust proxy', true);
            
            // Create a very strict limiter for testing
            const strictLimiter = rateLimit({
                windowMs: 60 * 1000,
                max: 2,
                standardHeaders: true,
                legacyHeaders: false,
                handler: (req, res) => {
                    res.status(429).json({
                        success: false,
                        message: "Too many requests"
                    });
                }
            });
            
            testAppStrict.use(strictLimiter);
            testAppStrict.get('/test', (req, res) => {
                res.status(200).json({ success: true });
            });

            // First request - should succeed
            await request(testAppStrict).get('/test').expect(200);
            
            // Second request - should succeed
            await request(testAppStrict).get('/test').expect(200);
            
            // Third request - should be rate limited
            const response = await request(testAppStrict).get('/test').expect(429);
            
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Too many requests");
        }, 10000);
    });

    describe('Login Limiter', () => {
        let loginApp;

        beforeAll(() => {
            loginApp = express();
            loginApp.use(express.json());
            loginApp.set('trust proxy', true);
            loginApp.post('/login', loginLimiter, (req, res) => {
                res.status(200).json({ success: true, message: 'Login successful' });
            });
        });

        test('should allow login requests within limit', async () => {
            const response = await request(loginApp)
                .post('/login')
                .send({ email: 'test@example.com', password: 'password123' })
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should have correct rate limit configuration', async () => {
            const response = await request(loginApp)
                .post('/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.headers['ratelimit-limit']).toBe('10');
        });
    });

    describe('Register Limiter', () => {
        let registerApp;

        beforeAll(() => {
            registerApp = express();
            registerApp.use(express.json());
            registerApp.set('trust proxy', true);
            registerApp.post('/register', registerLimiter, (req, res) => {
                res.status(201).json({ success: true, message: 'Registration successful' });
            });
        });

        test('should allow registration requests within limit', async () => {
            const response = await request(registerApp)
                .post('/register')
                .send({ 
                    name: 'Test User',
                    email: 'test@example.com', 
                    password: 'password123' 
                })
                .expect(201);

            expect(response.body.success).toBe(true);
        });

        test('should have correct rate limit configuration', async () => {
            const response = await request(registerApp)
                .post('/register')
                .send({ 
                    name: 'Test User',
                    email: 'test@example.com', 
                    password: 'password123' 
                });

            expect(response.headers['ratelimit-limit']).toBe('3');
        });
    });

    describe('Logout Limiter', () => {
        let logoutApp;

        beforeAll(() => {
            logoutApp = express();
            logoutApp.use(express.json());
            logoutApp.set('trust proxy', true);
            logoutApp.post('/logout', logoutLimiter, (req, res) => {
                res.status(200).json({ success: true, message: 'Logout successful' });
            });
        });

        test('should allow logout requests within limit', async () => {
            const response = await request(logoutApp)
                .post('/logout')
                .send({ refreshToken: 'some-token' })
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should have correct rate limit configuration', async () => {
            const response = await request(logoutApp)
                .post('/logout')
                .send({ refreshToken: 'some-token' });

            expect(response.headers['ratelimit-limit']).toBe('20');
        });
    });

    describe('Rate Limit Response Format', () => {
        let testApp;

        beforeAll(() => {
            testApp = express();
            testApp.use(express.json());
            testApp.set('trust proxy', true);
            
            const strictLimiter = rateLimit({
                windowMs: 60 * 1000,
                max: 1,
                standardHeaders: true,
                legacyHeaders: false,
                handler: (req, res) => {
                    res.status(429).json({
                        success: false,
                        message: "Too many requests"
                    });
                }
            });
            
            testApp.use(strictLimiter);
            testApp.get('/test', (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        test('should return proper error format when rate limited', async () => {
            // First request
            await request(testApp).get('/test').expect(200);
            
            // Second request - should be blocked
            const response = await request(testApp).get('/test').expect(429);
            
            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.success).toBe(false);
            expect(typeof response.body.message).toBe('string');
        });

        test('should return 429 status code when rate limited', async () => {
            const strictApp = express();
            strictApp.use(express.json());
            strictApp.set('trust proxy', true);
            
            const limiter = rateLimit({
                windowMs: 60 * 1000,
                max: 1,
                handler: (req, res) => {
                    res.status(429).json({
                        success: false,
                        message: "Rate limit exceeded"
                    });
                }
            });
            
            strictApp.use(limiter);
            strictApp.get('/test', (req, res) => {
                res.status(200).json({ success: true });
            });

            await request(strictApp).get('/test').expect(200);
            await request(strictApp).get('/test').expect(429);
        });
    });

    describe('Different IP Addresses', () => {
        let testApp;

        beforeAll(() => {
            testApp = express();
            testApp.use(express.json());
            testApp.set('trust proxy', true);
            testApp.use(generalLimiter);
            testApp.get('/test', (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        test('should track rate limits per IP address', async () => {
            // Request from IP 1
            const response1 = await request(testApp)
                .get('/test')
                .set('X-Forwarded-For', '192.168.1.1')
                .expect(200);

            expect(response1.body.success).toBe(true);

            // Request from IP 2
            const response2 = await request(testApp)
                .get('/test')
                .set('X-Forwarded-For', '192.168.1.2')
                .expect(200);

            expect(response2.body.success).toBe(true);
        });
    });

    describe('Standard Headers', () => {
        let testApp;

        beforeAll(() => {
            testApp = express();
            testApp.use(express.json());
            testApp.set('trust proxy', true);
            testApp.use(generalLimiter);
            testApp.get('/test', (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        test('should include RateLimit-Limit header', async () => {
            const response = await request(testApp).get('/test');
            
            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(parseInt(response.headers['ratelimit-limit'])).toBeGreaterThan(0);
        });

        test('should include RateLimit-Remaining header', async () => {
            const response = await request(testApp).get('/test');
            
            expect(response.headers).toHaveProperty('ratelimit-remaining');
            expect(parseInt(response.headers['ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
        });

        test('should include RateLimit-Reset header', async () => {
            const response = await request(testApp).get('/test');
            
            expect(response.headers).toHaveProperty('ratelimit-reset');
            expect(parseInt(response.headers['ratelimit-reset'])).toBeGreaterThan(0);
        });

        test('should NOT include legacy X-RateLimit headers', async () => {
            const response = await request(testApp).get('/test');
            
            expect(response.headers).not.toHaveProperty('x-ratelimit-limit');
            expect(response.headers).not.toHaveProperty('x-ratelimit-remaining');
            expect(response.headers).not.toHaveProperty('x-ratelimit-reset');
        });
    });
});
