# 🚀 Quick Test Guide

## Install Dependencies
```bash
npm install
```

## Run Tests
```bash
# Run all tests
npm test

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## Test Files
- `tests/unit/auth.service.test.js` - 31 unit tests
- `tests/integration/register.test.js` - 22 integration tests
- **Total: 53 tests**

## Expected Result
```
Test Suites: 2 passed, 2 total
Tests:       53 passed, 53 total
Time:        ~8s
```

## Coverage Goal
- Aim for >80% code coverage
- Check coverage report in `coverage/` folder after running `npm run test:coverage`
