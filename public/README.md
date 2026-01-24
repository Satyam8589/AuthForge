# AuthForge Testing Dashboard

A beautiful, modern testing interface for the AuthForge authentication API.

## 🚀 Features

- **Register** - Create new user accounts with validation
- **Login** - Authenticate with email/password
- **Google OAuth** - Register/Login with Google OAuth simulation
- **Token Refresh** - Test token refresh functionality
- **Logout** - Single device logout
- **Logout All Devices** - Multi-device session management
- **Real-time Response Viewer** - See API responses in real-time
- **User Profile Display** - View authenticated user information

## 🎨 Design Features

- Animated gradient background with floating orbs
- Glassmorphism effects
- Smooth transitions and hover effects
- Responsive design for all devices
- Toast notifications
- Loading states
- Color-coded responses (success/error)

## 📡 API Endpoints Tested

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/register-oauth` - Google OAuth registration/login
- `POST /api/auth/login-oauth` - Google OAuth login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout current device
- `POST /api/auth/logout-all` - Logout all devices

## 🔧 Usage

1. Start the AuthForge server
2. Open your browser to `http://localhost:5000`
3. Use the forms to test different authentication flows
4. View responses in the API Response section
5. Monitor your authentication status in the header

## 🔐 Testing OAuth

For testing Google OAuth without actual Google integration:
1. Use any email format (e.g., `test@gmail.com`)
2. Enter a name (e.g., `John Doe`)
3. Use any string as Google ID (e.g., `1234567890`)
4. Optionally add a picture URL

The system will:
- Create a new user if the email/googleId doesn't exist
- Login the user if they already exist
- Return an `isNewUser` flag to indicate which action occurred

## 📝 Notes

- Access tokens are stored in memory (displayed in response)
- Refresh tokens are stored in HttpOnly cookies
- All forms include validation
- Responses are color-coded (green = success, red = error)
- User profile appears when authenticated
- Protected actions only available when logged in
