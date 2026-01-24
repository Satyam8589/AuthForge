# 🧪 AuthForge Test Suite

## 📋 Overview

Comprehensive test suite for AuthForge authentication system using Jest and Supertest.

---

## 📁 Test Structure

```
tests/
├── setup/
│   └── testDb.js              # MongoDB Memory Server setup
├── unit/
│   └── auth.service.test.js   # Unit tests for auth service
└── integration/
    └── register.test.js       # Integration tests for registration endpoint
```

---

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

---

## 📊 Test Coverage

### Unit Tests (auth.service.test.js)
- ✅ **Successful Registration** (5 tests)
  - Register with valid data
  - Password hashing
  - Email lowercase conversion
  - Username lowercase conversion
  - Default role assignment

- ❌ **Validation Errors** (5 tests)
  - Missing name
  - Missing username
  - Missing email
  - Missing password
  - Status code verification

- ❌ **Email Validation** (3 tests)
  - Invalid format (no @)
  - Invalid format (no domain)
  - Status code verification

- ❌ **Password Validation** (6 tests)
  - Too short
  - No uppercase
  - No lowercase
  - No number
  - Special characters allowed
  - Status code verification

- ❌ **Username Validation** (6 tests)
  - Too short
  - Too long
  - Special characters
  - Spaces
  - Underscores allowed
  - Status code verification

- ❌ **Duplicate Checks** (3 tests)
  - Duplicate email
  - Duplicate username
  - Status code verification

- 🔒 **Security Tests** (3 tests)
  - Password not in response
  - Password hashed in database
  - Security fields initialization

**Total Unit Tests: 31**

---

### Integration Tests (register.test.js)
- ✅ **Successful Registration** (2 tests)
  - 201 status with user data
  - All required fields present

- ❌ **Validation Errors** (7 tests)
  - Missing fields (4 tests)
  - Invalid email
  - Weak password
  - Invalid username

- ❌ **Conflict Errors** (2 tests)
  - Duplicate email (409)
  - Duplicate username (409)

- 🔄 **Data Transformation** (2 tests)
  - Email lowercase
  - Username lowercase

- 🔒 **Security Tests** (3 tests)
  - Password not in response
  - Role cannot be set by user
  - Security fields initialization

- 📝 **Response Format** (3 tests)
  - Success response structure
  - Error response structure
  - Content-Type header

- ⚠️ **Edge Cases** (3 tests)
  - Empty request body
  - Null values
  - Whitespace trimming

**Total Integration Tests: 22**

---

## 🎯 Test Statistics

| Category | Unit Tests | Integration Tests | Total |
|----------|------------|-------------------|-------|
| Success Cases | 5 | 2 | 7 |
| Validation | 20 | 7 | 27 |
| Duplicates | 3 | 2 | 5 |
| Security | 3 | 3 | 6 |
| Edge Cases | 0 | 3 | 3 |
| Response Format | 0 | 3 | 3 |
| Data Transform | 0 | 2 | 2 |
| **TOTAL** | **31** | **22** | **53** |

---

## 🛠️ Technologies Used

- **Jest** - Testing framework
- **Supertest** - HTTP assertions
- **MongoDB Memory Server** - In-memory database for testing
- **@jest/globals** - Jest ES modules support

---

## 📝 Test Examples

### Unit Test Example
```javascript
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
  expect(result.password).toBeUndefined();
});
```

### Integration Test Example
```javascript
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
  expect(response.body.data.password).toBeUndefined();
});
```

---

## 🔍 Test Database

Tests use **MongoDB Memory Server** which:
- ✅ Runs in-memory (no actual MongoDB needed)
- ✅ Isolated from production/development databases
- ✅ Fast test execution
- ✅ Automatic cleanup after tests

---

## 📊 Expected Output

```bash
$ npm test

PASS  tests/unit/auth.service.test.js
  Auth Service - registerUser
    Successful Registration
      ✓ should register a new user with valid data (45ms)
      ✓ should hash the password before storing (38ms)
      ✓ should convert email to lowercase (32ms)
      ✓ should convert username to lowercase (31ms)
      ✓ should default role to USER (30ms)
    Validation Errors
      ✓ should throw error when name is missing (15ms)
      ✓ should throw error when username is missing (12ms)
      ...

PASS  tests/integration/register.test.js
  POST /api/auth/register - Integration Tests
    Successful Registration
      ✓ should return 201 and user data for valid registration (52ms)
      ✓ should return user with all required fields (48ms)
    Validation Errors - 400 Bad Request
      ✓ should return 400 when name is missing (25ms)
      ...

Test Suites: 2 passed, 2 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        8.234s
```

---

## 🐛 Troubleshooting

### Tests Failing
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Memory Server Issues
```bash
# The first run downloads MongoDB binary
# Subsequent runs will be faster
npm test
```

### ES Module Errors
```bash
# Ensure package.json has "type": "module"
# Ensure jest.config.js uses export default
```

---

## ✅ Test Checklist

Before pushing code, ensure:
- [ ] All tests pass (`npm test`)
- [ ] Coverage is above 80% (`npm run test:coverage`)
- [ ] No console errors or warnings
- [ ] New features have corresponding tests
- [ ] Edge cases are covered

---

## 🎯 Next Steps

### Additional Tests to Add:
1. Login functionality tests
2. Token generation tests
3. Token refresh tests
4. Logout tests
5. Email verification tests
6. Password reset tests
7. Middleware tests (auth, RBAC)
8. Rate limiting tests

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Created:** 2026-01-24  
**Last Updated:** 2026-01-24  
**Version:** 1.0.0
