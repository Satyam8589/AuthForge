# 🛡️ AuthForge

**AuthForge** is a professional-grade, enterprise-ready Authentication & Access Control System built with Node.js and Express. It provides a robust foundation for modern web applications, combining standard form-based authentication with seamless Google OAuth 2.0 integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Tech](https://img.shields.io/badge/tech-Node.js%20%7C%20Express%20%7C%20MongoDB-orange.svg)

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Dual-Layer Auth**: Supports traditional Email/Password registration and login alongside Google OAuth 2.0.
- **JWT System**: Implements a secure Access Token (Short-lived) and Refresh Token (Long-lived, HTTP-only cookie) strategy.
- **Session Handshake**: Frontend proactively validates session integrity with the backend on every page load/refresh.
- **Rate Limiting**: Protection against brute-force attacks on all authentication endpoints.
- **Security Headers**: Integrated with **Helmet** and strict CORS policies.

### 👤 User Management
- **Modular User System**: Dedicated logic for user profile retrieval and management.
- **Google Integration**: Automatically syncs Google names and profile pictures into the user dashboard.
- **Audit Logging**: Comprehensive system for tracking authentication events (registration, logins, logouts).

### 🎨 Modern UI Dashboard
- **Glassmorphism Design**: A sleek, high-density dashboard with vibrant animated backgrounds.
- **Dynamic Visibility**: Automatically hides/shows authentication forms or user profiles based on login state.
- **Session Persistence**: Uses `localStorage` combined with backend validation to keep users logged in across refreshes.
- **Status Monitoring**: Real-time "Authenticated" status dot with pulse animations.

---

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Passport.js, JSON Web Tokens (JWT)
- **Security**: Bcrypt, Helmet, Express-Rate-Limit
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Testing**: Jest, Supertest, MongoDB Memory Server

---

## 📂 Project Structure

```text
├── config/             # Passport, JWT, and Database configurations
├── controllers/        # Logical handlers for Auth and User modules
├── middlewares/        # Authentication and Rate-Limiter middlewares
├── models/             # Mongoose schemas for User and Refresh Tokens
├── public/             # Modern frontend dashboard (HTML, CSS, JS)
├── routes/             # API endpoint definitions
├── services/           # Business logic layer
├── tests/              # Unit and Integration test suites
├── utils/              # JWT helpers, Audit logs, and HTML templates
└── server.js           # Main application entry point
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Cloud Console Project (for OAuth)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Satyam8589/AuthForge.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
CLIENT_URL=http://localhost:5000
```

### 4. Running the App
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

---

## 🧪 Testing

AuthForge comes with a comprehensive test suite covering critical authentication flows.

```bash
# Run all tests
npm test

# Run user profile integration tests
npm test tests/integration/user.test.js
```

---

## 📦 SDK Installation & Usage

Other developers can install AuthForge directly into their Node.js/Express applications using GitHub:

### 1. Installation
```bash
npm install github:Satyam8589/AuthForge
```

### 2. Quick Start

```javascript
import { AuthForgeClient } from "authforge";

// Initialize with your connection string or config
const auth = new AuthForgeClient(process.env.AUTHFORGE_URI);
// Format: authforge://<API_KEY>:<API_SECRET>@<PROJECT_ID>?host=https://your-authforge-server.com

// Protect routes in Express
app.get("/api/protected-route", auth.expressMiddleware(), (req, res) => {
    res.json({ message: `Hello ${req.user.name}`, user: req.user });
});

// Or verify tokens manually
const verification = await auth.verifyToken(userToken);
if (verification.valid) {
    console.log("Valid user:", verification.data.user);
}
```

---

## 📜 License
This project is licensed under the **ISC License**.

---

**Built with ❤️ by [Satyam Kumar Singh](https://github.com/Satyam8589)**
