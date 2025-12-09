# DriveSutra Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Prerequisites
- Node.js installed
- MongoDB running
- Gmail account (for OTP emails)

### Step 1: Configure Environment Variables

**Backend** (`/Backend/.env`):
```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/drivesutrago
JWT_SECRET=your-super-secret-key-12345

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="DriveSutraGo <your-email@gmail.com>"
```

**Frontend** (`/Frontend/.env`):
```dotenv
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### Step 2: Install Dependencies

```powershell
# Backend
cd Backend
npm install

# Frontend (in another terminal)
cd Frontend
npm install
```

### Step 3: Start MongoDB

```powershell
mongod
```

### Step 4: Start Backend Server

```powershell
cd Backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected: 127.0.0.1
```

### Step 5: Start Frontend Development Server

```powershell
cd Frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Register" and fill in the form
3. Enter the OTP sent to your email
4. You should be redirected to the dashboard

---

## 🔑 Key Features Implemented

✅ **Registration with OTP**
- User provides first name, last name, email, and password
- 6-digit OTP sent to email
- OTP verification required before account creation
- Secure password hashing with bcrypt

✅ **Login**
- Email and password authentication
- Secure password comparison
- JWT token generation (7-day expiration)

✅ **JWT Token Management**
- Auto-included in all API requests
- Automatically clears on 401 (unauthorized) response
- Stored in localStorage

✅ **Data Persistence**
- All user data stored in MongoDB
- User info persists across browser refreshes
- Logout clears all stored data

---

## 📁 Changed/Created Files

### Backend Changes
- ✏️ `models/User.js` - Added bcrypt hashing and password comparison
- ✏️ `controllers/authController.js` - Enhanced with proper error handling
- ✏️ `middleware/authMiddleware.js` - Improved JWT verification
- ✏️ `routes/authRoutes.js` - Added route documentation

### Frontend Changes
- ✏️ `services/api.js` - Added JWT token interceptor
- ✏️ `services/authService.js` - Updated API calls
- ✏️ `context/AuthContext.jsx` - Enhanced state management
- ✏️ `components/auth/RegisterForm.jsx` - Fixed form integration
- ✏️ `components/auth/LoginForm.jsx` - Already configured correctly

### New Documentation
- 📄 `AUTHENTICATION_SETUP.md` - Complete setup guide
- 📄 `QUICK_START.md` - This file

---

## 🧪 Testing the APIs

### Using Postman or cURL

**1. Send OTP**
```bash
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**2. Verify OTP**
```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

**3. Register User**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**4. Login User**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 🔍 Debugging

### Check Backend Logs
Look for errors in the backend terminal. Common issues:

```
MongoDB Error: connect ECONNREFUSED
→ Make sure MongoDB is running with 'mongod'

Failed to send OTP
→ Check EMAIL_USER and EMAIL_PASS in .env
→ For Gmail, use App Password, not regular password

CORS error in frontend
→ Check backend is running on port 5000
→ Check frontend baseURL is http://localhost:5000/api
```

### Check Frontend Console
Open DevTools (F12) and look for errors in the Console tab.

### Check Network Requests
In DevTools, Network tab:
1. Look for failed requests (red)
2. Click on request to see Request/Response
3. Check Response status code
4. Verify Authorization header is present: `Bearer <token>`

---

## 📊 Database Structure

### Users Collection
```json
{
  "_id": ObjectId,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "hashed-password-bcrypt",
  "isVerified": false,
  "xp": 0,
  "level": 1,
  "ecoScore": 0,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### OtpTokens Collection
```json
{
  "_id": ObjectId,
  "email": "john@example.com",
  "code": "123456",
  "purpose": "register",
  "expiresAt": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

---

## 🚀 Next Steps

1. **Protect Routes** - Make dashboard and other pages require authentication
2. **Add Trip Management** - Create, read, update, delete trips
3. **Add User Profile** - Allow users to update their profile
4. **Password Reset** - Implement forgot password flow with OTP
5. **Email Verification** - Require email verification before full access
6. **Dashboard** - Display user stats, eco score, level, XP
7. **Leaderboard** - Show top users by eco score
8. **Challenges** - Create eco-friendly driving challenges

---

## 💡 Important Notes

- **JWT Secret**: Change the JWT_SECRET to a long random string in production
- **Email**: For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords)
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Add rate limiting to auth endpoints in production
- **Password Requirements**: Enforce strong passwords in production

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "OTP not received" | Check EMAIL_USER/EMAIL_PASS, verify Gmail App Password |
| "Cannot connect to MongoDB" | Run `mongod` in another terminal |
| "Token not found in requests" | Check localStorage has 'token', refresh page |
| "CORS error" | Ensure backend is running on port 5000 |
| "User not found after login" | Check MongoDB has the user data |
| "Password mismatch on login" | Verify password matches during registration |

---

Good luck! 🚀
