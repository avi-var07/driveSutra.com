# 🚀 DriveSutraGo - Quick Reference Card

## 📋 Setup in 3 Steps

### 1. Get FREE API Keys (10 minutes)
```bash
# See API_KEYS_SETUP_GUIDE.md for detailed instructions

✅ OpenWeatherMap: https://openweathermap.org/api
✅ Google OAuth: https://console.cloud.google.com/
✅ MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
✅ Gmail App Password: https://myaccount.google.com/apppasswords
```

### 2. Configure & Create Admin
```bash
# Backend/.env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
OPENWEATHER_API_KEY=your_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Create admin user
cd Backend
node scripts/createAdmin.js
```

### 3. Start Application
```bash
# Terminal 1: Backend
cd Backend && npm run dev

# Terminal 2: Frontend
cd Frontend && npm run dev
```

---

## 🔑 Default Admin Login

```
URL: http://localhost:5173/admin/login
Email: admin@drivesutrago.com
Password: Admin@123
⚠️ Change password after first login!
```

---

## 🗺️ Public Transport Modes

### Metro
- ✅ Line information (Blue, Red, Yellow, etc.)
- ✅ Platform numbers
- ✅ Interchange stations
- ✅ Walking time to/from stations
- ✅ Fare estimation
- ✅ Step-by-step instructions

### Bus
- ✅ Route numbers (45A, 78, etc.)
- ✅ Frequency (5-10 min, 10-15 min)
- ✅ AC/Non-AC type
- ✅ Operator information
- ✅ Number of stops
- ✅ Fare estimation

### Auto Rickshaw
- ✅ Distance-based fare (₹25 base + ₹12/km)
- ✅ Time estimation
- ✅ Tips for riders
- ✅ Distance limit (< 10 km)

---

## 👨‍💼 Admin Verification Flow

```
1. User completes PUBLIC transport trip
2. User uploads ticket OR enters transaction ID
3. Admin sees trip in "Pending Verifications"
4. Admin clicks "Review"
5. Admin sees:
   - User details
   - Trip information
   - Ticket image / Transaction ID
   - Current EcoScore
6. Admin can:
   - Approve (with optional EcoScore adjustment)
   - Reject (with mandatory reason)
7. System updates:
   - Trip status
   - User rewards
   - Carbon credits
   - Fraud strikes (if rejected)
```

---

## 📊 Admin Dashboard Stats

- Pending Verifications
- Total Trips
- Total Users
- Today's Trips
- CO2 Saved
- Trees Planted
- Mode Distribution
- Recent Verifications

---

## 🎯 Key Features

### For Users:
- 📍 Real-time GPS tracking
- 💪 Health API (Google Fit, Apple Health, Samsung Health)
- 🚇 Detailed public transport routes
- 🚗 Speed monitoring for cars
- 🎯 EcoScore (5 components + fitness bonus)
- 🌳 Tree planting (1 per 22 kg CO2)
- 🎁 30+ Indian brand rewards

### For Admins:
- 🔐 Secure login with lockout
- 📊 Dashboard with statistics
- ✅ Approve/Reject trips
- 📝 Adjust EcoScore
- 🚫 Fraud detection
- 📧 User notifications

---

## 🆓 FREE APIs Used

| API | Purpose | Cost | Key Required |
|-----|---------|------|--------------|
| Nominatim | Geocoding | FREE | ❌ No |
| OSRM | Routing | FREE | ❌ No |
| Overpass | Metro/Bus data | FREE | ❌ No |
| OpenWeatherMap | Weather | FREE | ✅ Yes |
| Google OAuth | Google Fit | FREE | ✅ Yes |
| MongoDB Atlas | Database | FREE | ✅ Yes |
| Gmail SMTP | Emails | FREE | ✅ Yes |

**Total Cost: $0/month** 🎉

---

## 📁 Important Files

### Documentation:
- `API_KEYS_SETUP_GUIDE.md` - Get API keys
- `QUICK_START.md` - 5-minute setup
- `IMPLEMENTATION_GUIDE.md` - Technical guide
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete summary

### Backend:
- `Backend/scripts/createAdmin.js` - Create admin user
- `Backend/models/Admin.js` - Admin model
- `Backend/controllers/adminController.js` - Admin logic
- `Backend/routes/adminRoutes.js` - Admin routes

### Frontend:
- `Frontend/src/pages/AdminLogin.jsx` - Admin login
- `Frontend/src/pages/AdminDashboard.jsx` - Admin dashboard
- `Frontend/src/services/publicTransportService.js` - Public transport

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"
```bash
# Check MongoDB URI in .env
# Ensure IP is whitelisted in MongoDB Atlas
```

### "Admin login failed"
```bash
# Create admin user first:
cd Backend
node scripts/createAdmin.js
```

### "Metro stations not found"
```bash
# Ensure you're in one of 12 supported cities:
# Delhi, Mumbai, Bangalore, Kolkata, Chennai, Hyderabad,
# Pune, Ahmedabad, Jaipur, Lucknow, Kochi, Nagpur
```

### "API key invalid"
```bash
# Check .env file
# Verify key is copied correctly (no spaces)
# Wait 10 minutes for key activation
```

---

## 🧪 Testing Commands

```bash
# Test MongoDB connection
cd Backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err));"

# Test OpenWeatherMap API
curl "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_KEY"

# Create admin user
node scripts/createAdmin.js

# Start backend
npm run dev

# Start frontend (in new terminal)
cd ../Frontend
npm run dev
```

---

## 📞 Quick Links

- **Admin Login**: http://localhost:5173/admin/login
- **User App**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

---

## ✅ Deployment Checklist

- [ ] Get all API keys
- [ ] Configure .env files
- [ ] Create admin user
- [ ] Test admin login
- [ ] Test trip verification
- [ ] Test public transport routes
- [ ] Update CORS for production
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update frontend API URL

---

## 🎊 You're Ready!

All features implemented and ready to use:
- ✅ Real-time tracking
- ✅ Health API integration
- ✅ Detailed public transport (metro, bus, auto)
- ✅ Admin verification system
- ✅ Tree planting
- ✅ Rewards system

**Start the servers and begin!** 🚀

```bash
cd Backend && npm run dev
cd Frontend && npm run dev
```

Visit: http://localhost:5173 (User App)
Visit: http://localhost:5173/admin/login (Admin Panel)

---

**Need Help?** Check the documentation files! 📚
