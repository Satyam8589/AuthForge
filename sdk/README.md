# authforge-sdk

Official Node.js & JavaScript SDK for **AuthForge** - Enterprise Authentication & Access Control System.

## Installation

```bash
npm install authforge-sdk
```

Or using yarn / pnpm:

```bash
yarn add authforge-sdk
# or
pnpm add authforge-sdk
```

---

## Quick Start

### 1. Initialize the SDK

You can initialize `AuthForgeClient` using either a connection string or a configuration object:

```javascript
import { AuthForgeClient } from 'authforge-sdk';
// or in CommonJS:
// const { AuthForgeClient } = require('authforge-sdk');

// Option A: Connection String
const authForge = new AuthForgeClient(
  'authforge://af_key_123:af_secret_456@proj_789?host=https://your-auth-server.com'
);

// Option B: Config Object
const authForge = new AuthForgeClient({
  apiKey: 'af_key_123',
  apiSecret: 'af_secret_456',
  projectId: 'proj_789',
  host: 'https://your-auth-server.com' // Defaults to http://localhost:2000
});
```

---

### 2. Express.js Middleware Protection

Protect routes in your backend API with one line of code:

```javascript
import express from 'express';
import { AuthForgeClient } from 'authforge-sdk';

const app = express();
const authForge = new AuthForgeClient('authforge://key:secret@project_id?host=http://localhost:2000');

// Protected Route
app.get('/api/protected', authForge.expressMiddleware(), (req, res) => {
  // Access authenticated user data via req.user
  res.json({
    message: 'Welcome to protected dashboard!',
    user: req.user
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

### 3. Verify Tokens Manually

```javascript
const result = await authForge.verifyToken(token);

if (result.valid) {
  console.log('Authenticated User:', result.data.user);
} else {
  console.error('Authentication Failed:', result.message);
}
```

---

### 4. User Login & Registration

```javascript
// Register User
const registerRes = await authForge.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe'
});

// Login User
const loginRes = await authForge.login('user@example.com', 'SecurePassword123!');
console.log('JWT Access Token:', loginRes.token);
```

---

### 5. Google Authentication

```javascript
const googleRes = await authForge.loginWithGoogle({
  email: 'user@gmail.com',
  googleId: '1234567890',
  name: 'Google User',
  picture: 'https://example.com/photo.jpg'
});
```

### 6. Password Reset Flow

```javascript
// Request Password Reset Link via Email
const forgotRes = await authForge.forgotPassword('user@example.com');

// Reset Password using token from Email
const resetRes = await authForge.resetPassword(resetToken, 'NewPassword123!');
```

---

## API Reference

### `new AuthForgeClient(config)`
- `config`: Connection string (`authforge://...`) or object (`{ apiKey, apiSecret, projectId, host }`).

### `authForge.expressMiddleware()`
- Returns standard Express middleware. Reads `Authorization: Bearer <token>`, verifies token, populates `req.user` & `req.authForge`, or returns `401 Unauthorized`.

### `authForge.verifyToken(token)`
- `token`: JWT string.
- Returns `{ valid: boolean, data?: { user, tokenPayload }, message?: string }`.

### `authForge.login(email, password)`
- Logs in user registered under project.

### `authForge.register(userData)`
- Registers a new user under project.

### `authForge.loginWithGoogle(googleUserData)`
- Authenticates or auto-registers user via Google credentials.

### `authForge.forgotPassword(email)`
- Sends password reset email for an account.

### `authForge.resetPassword(token, newPassword)`
- Updates password using valid reset token.

---

## License

ISC License. AuthForge System.
