# DriveSutra Authentication System Setup Guide

## Overview
This document outlines the complete authentication system implementation for DriveSutra, including user registration with OTP verification, login, JWT token management, and secure password hashing.

---

## Backend Setup

### 1. **Environment Variables** (.env)
Ensure your `.env` file in the `/Backend` directory contains:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/drivesutrago
JWT_SECRET=supersecret_jwt_key_change_this

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="DriveSutraGo <your-email@gmail.com>"
```

**Important:** 
- For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) instead of using your regular password
- Change `JWT_SECRET` to a strong random string in production

### 2. **Database Setup**
Ensure MongoDB is running:

```powershell
# If using MongoDB locally
mongod

# Or check if it's running
mongo --eval "db.version()"
```

### 3. **Install Dependencies**
```powershell
cd Backend
npm install
```

Required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT generation
- `nodemailer` - Email sending
- `otp-generator` - OTP generation
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### 4. **Database Models**

#### User Model (`/Backend/models/User.js`)
- Stores user information
- Auto-hashes passwords using bcrypt before saving
- Includes `comparePassword()` method for login verification
- Fields: firstName, lastName, email, password, isVerified, xp, level, ecoScore

#### OtpToken Model (`/Backend/models/OtpToken.js`)
- Stores temporary OTP codes
- Auto-expires after 10 minutes
- Fields: email, code, purpose, expiresAt

### 5. **API Endpoints**

#### POST `/api/auth/send-otp`
Sends an OTP to the provided email
- **Request:** `{ email: "user@example.com" }`
- **Response:** `{ success: true, message: "OTP sent successfully" }`

#### POST `/api/auth/verify-otp`
Verifies the OTP
- **Request:** `{ email: "user@example.com", otp: "123456" }`
- **Response:** `{ success: true, message: "OTP verified successfully" }`

#### POST `/api/auth/register`
Registers a new user (after OTP verification)
- **Request:** `{ firstName: "John", lastName: "Doe", email: "john@example.com", password: "password123" }`
- **Response:** 
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "xp": 0,
    "level": 1,
    "ecoScore": 0
  }
}
```

#### POST `/api/auth/login`
User login
- **Request:** `{ email: "john@example.com", password: "password123" }`
- **Response:** (Same as register response)

---

## Frontend Setup

### 1. **Environment Variables** (.env)
```dotenv
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### 2. **Install Dependencies**
```powershell
cd Frontend
npm install
```

Key packages:
- `axios` - HTTP client
- `react-router-dom` - Routing
- `tailwindcss` - Styling
- `motion` - Animations

### 3. **API Configuration** (`/Frontend/src/services/api.js`)
- Base URL: `http://localhost:5000/api`
- Auto-includes JWT token in Authorization header
- Handles 401 responses by clearing storage and redirecting to login

### 4. **Auth Service** (`/Frontend/src/services/authService.js`)
Provides methods:
- `loginAPI(email, password)` - Login user
- `registerAPI(data)` - Register user
- `sendOTP(email)` - Send OTP
- `verifyOTP(email, otp)` - Verify OTP

### 5. **Auth Context** (`/Frontend/src/context/AuthContext.jsx`)
Global state management for authentication:
- `user` - Current logged-in user
- `token` - JWT token
- `loading` - Loading state
- `isAuthenticated` - Boolean flag
- `login()` - Login function
- `register()` - Register function
- `logout()` - Logout function
- `updateUser()` - Update user profile

### 6. **Components**

#### LoginForm (`/Frontend/src/components/auth/LoginForm.jsx`)
- Simple login with email and password
- Calls `useAuth().login()`
- Redirects to dashboard on success

#### RegisterForm (`/Frontend/src/components/auth/RegisterForm.jsx`)
3-step registration process:
1. **Step 1:** Collect first name, last name, email, password
2. **Step 2:** OTP verification (6-digit code)
3. **Step 3:** Success message and redirect

---

## Authentication Flow

### Registration Flow
```
User fills form → Send OTP to email → User enters OTP → OTP verified → Register user → Generate JWT → Store token & user → Redirect to dashboard
```

### Login Flow
```
User enters email & password → Validate credentials → Hash password verification → Generate JWT → Store token & user → Redirect to dashboard
```

### Protected Routes
Use `<ProtectedRoute>` component to protect pages that require authentication:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## Testing

### Backend Testing

1. **Start MongoDB**
```powershell
mongod
```

2. **Start Backend Server**
```powershell
cd Backend
npm run dev
```
Expected output: `Server running on port 5000`

3. **Test Endpoints using Postman/cURL**

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"otp\":\"123456\"}"
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Frontend Testing

1. **Start Frontend Development Server**
```powershell
cd Frontend
npm run dev
```

2. **Test in Browser**
- Visit `http://localhost:5173` (or the displayed port)
- Navigate to Login/Register page
- Test registration with OTP
- Check browser console for any errors
- Verify localStorage contains token and user data

3. **Check Network Requests**
- Open DevTools (F12) → Network tab
- Perform login/register actions
- Verify requests have `Authorization: Bearer <token>` header
- Verify responses contain correct data

---

## Security Considerations

✅ **Implemented:**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- OTP expires after 10 minutes
- CORS enabled for frontend
- Protected API endpoints (auth middleware available)
- Error messages don't leak sensitive info

⚠️ **Production Checklist:**
- Change `JWT_SECRET` to a strong random string
- Use HTTPS only in production
- Set proper CORS origins (not `*`)
- Use environment-specific email credentials
- Enable HTTPS on email service
- Implement rate limiting on auth endpoints
- Add email verification before allowing full access
- Add password strength requirements
- Implement refresh token mechanism
- Add logging and monitoring

---

## Troubleshooting

### Issue: "Cannot find module 'OtpToken'"
**Solution:** Ensure import path is correct in `authController.js`:
```javascript
import OtpToken from "../models/OtpToken.js";
```

### Issue: "MongoDB connection failed"
**Solution:** 
- Check MongoDB is running: `mongod`
- Verify MONGO_URI in `.env`
- Check connection string syntax

### Issue: "Email not sending"
**Solution:**
- Verify EMAIL_USER and EMAIL_PASS in `.env`
- For Gmail, use [App Password](https://myaccount.google.com/apppasswords)
- Check firewall/antivirus not blocking SMTP

### Issue: "CORS error in frontend"
**Solution:**
- Backend server is running on port 5000
- Frontend API baseURL is `http://localhost:5000/api`
- CORS middleware is enabled in server.js

### Issue: "Token not being sent in requests"
**Solution:**
- Check localStorage has 'token' key
- Verify axios interceptor in `api.js` is working
- Check Authorization header format: `Bearer <token>`

---

## Next Steps

1. **Set up protected routes** for dashboard and other authenticated pages
2. **Add user profile update** endpoint
3. **Implement password reset** with OTP
4. **Add email verification** before full registration
5. **Set up refresh tokens** for better security
6. **Add rate limiting** on auth endpoints
7. **Implement 2FA** for enhanced security
8. **Add user roles and permissions** system

---

## File Structure

```
Backend/
├── models/
│   ├── User.js          (User model with bcrypt hashing)
│   └── OtpToken.js      (OTP model)
├── controllers/
│   └── authController.js (Auth business logic)
├── middleware/
│   └── authMiddleware.js (JWT verification)
├── routes/
│   └── authRoutes.js    (Auth endpoints)
├── utils/
│   └── sendEmail.js     (Email utility)
├── config/
│   └── db.js            (MongoDB connection)
├── server.js            (Express app setup)
└── .env                 (Environment variables)

Frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx       (Global auth state)
│   ├── services/
│   │   ├── api.js                (Axios config)
│   │   └── authService.js        (Auth API calls)
│   ├── components/auth/
│   │   ├── LoginForm.jsx         (Login component)
│   │   └── RegisterForm.jsx      (Register component)
│   └── pages/
│       └── LoginRegister.jsx     (Login/Register page)
└── .env                 (Frontend env)
```

---

## Support

For issues or questions, check:
1. Browser console for errors
2. Server logs (backend terminal)
3. Network tab (DevTools) for failed requests
4. MongoDB connection status
5. Email service configuration
