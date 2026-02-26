# DriveSutraGo - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas account)
- Git

---

## Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd drivesutrago

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

---

## Step 2: Setup Environment Variables

### Backend (.env)
Create `Backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivesutrago
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
OPENWEATHER_API_KEY=your_openweather_api_key
```

### Frontend (.env)
Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Step 3: Get FREE API Keys (5 minutes)

### OpenWeatherMap (Weather Data)
1. Go to https://openweathermap.org/api
2. Sign up (FREE)
3. Get API key from dashboard
4. Add to `Backend/.env` as `OPENWEATHER_API_KEY`

### Google OAuth (Optional - for Google Fit)
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Fitness API
4. Create OAuth credentials
5. Add to `Frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

### Gmail SMTP (Email Notifications)
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password
3. Add to `Backend/.env` as `EMAIL_PASS`

**See `API_KEYS_SETUP_GUIDE.md` for detailed instructions**

---

## Step 4: Initialize Database

```bash
cd Backend

# Initialize achievements, challenges, rewards
npm run init-data

# Initialize partner merchants
node scripts/initializePartners.js

# Create admin account
node scripts/createAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@drivesutrago.com`
- Password: `Admin@123`

---

## Step 5: Start Development Servers

### Terminal 1 - Backend
```bash
cd Backend
npm run dev
```
Backend runs on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
```
Frontend runs on http://localhost:5173

---

## Step 6: Test the Application

### User Flow
1. Open http://localhost:5173
2. Click "Register" → Create account
3. Verify email with OTP
4. Plan a trip → Select start/end locations
5. Choose transport mode
6. Start trip → Track in real-time
7. Complete trip → View eco score
8. Redeem rewards with carbon credits

### Admin Flow
1. Open http://localhost:5173/admin/login
2. Login with admin credentials
3. View pending trip verifications
4. Review and approve/reject trips
5. Manage partner offers

---

## 🎯 Key Features to Test

### 1. Personalized Recommendations
- Update health profile in settings
- Plan trip and see personalized suggestions
- Check warnings based on weather/health

### 2. Real-Time Tracking
- Start a trip
- Watch GPS tracking
- Monitor speed and distance
- See live updates

### 3. Fraud Detection
- Complete a trip
- System automatically validates:
  - Speed anomalies
  - Route deviation
  - Time-distance ratio
  - GPS accuracy
  - Movement patterns

### 4. OCR Ticket Verification
- Upload ticket image (for public transport)
- System extracts:
  - Ticket number
  - Date, time
  - Fare amount
  - Transport type
- Auto-verification

### 5. Carbon Calculation
- View transparent CO2 calculations
- See emission factors
- Compare modes
- Track savings

### 6. Partner Rewards
- Browse partner offers
- Check eligibility
- Redeem with carbon credits
- Get unique coupon code

### 7. Gamification
- Earn XP and level up
- Unlock achievements
- Complete challenges
- Climb leaderboards

---

## 📁 Project Structure

```
drivesutrago/
├── Backend/
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation
│   ├── utils/             # Helper functions
│   │   ├── carbonEmissionCalculator.js
│   │   ├── fraudDetectionService.js
│   │   ├── personalizedRecommendationEngine.js
│   │   ├── ocrService.js
│   │   └── ecoScoreCalculator.js
│   ├── scripts/           # Initialization scripts
│   └── server.js          # Entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── App.jsx        # Main app
│   └── package.json
│
├── API_KEYS_SETUP_GUIDE.md
├── DEPLOYMENT_GUIDE.md
├── IMPROVEMENTS_IMPLEMENTED.md
└── QUICK_START.md (this file)
```

---

## 🔧 Common Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm run init-data    # Initialize database
node scripts/createAdmin.js  # Create admin
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod --version

# Check environment variables
cat Backend/.env

# Check port is available
lsof -i :5000
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check VITE_API_URL in Frontend/.env
cat Frontend/.env
```

### Database connection error
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string
# Update MONGODB_URI in Backend/.env
```

### OCR not working
```bash
# Install tesseract.js
cd Backend
npm install tesseract.js

# Restart backend
npm run dev
```

---

## 📚 Documentation

- **API Keys Setup**: `API_KEYS_SETUP_GUIDE.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Features**: `FEATURES_SUMMARY.md`
- **Improvements**: `IMPROVEMENTS_IMPLEMENTED.md`
- **Implementation**: `IMPLEMENTATION_GUIDE.md`

---

## 🎓 Learning Resources

### Technologies Used
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Vite, TailwindCSS
- **APIs**: OpenWeatherMap, Google OAuth, Tesseract.js
- **Maps**: Leaflet, OpenStreetMap, OSRM

### Tutorials
- MongoDB: https://www.mongodb.com/docs/manual/tutorial/
- Express: https://expressjs.com/en/starter/installing.html
- React: https://react.dev/learn
- Vite: https://vitejs.dev/guide/

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear message
5. Push and create PR

### Code Style
- Use ESLint for linting
- Follow existing patterns
- Add comments for complex logic
- Write meaningful commit messages

---

## 📞 Support

### Issues
- Check existing issues on GitHub
- Create new issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots if applicable

### Questions
- Check documentation first
- Search Stack Overflow
- Ask in community forums

---

## ✅ Next Steps

After setup, you should:

1. **Customize**
   - Update branding
   - Add your logo
   - Customize colors
   - Add more partner merchants

2. **Test**
   - Test all user flows
   - Test admin features
   - Test on mobile devices
   - Test with real GPS data

3. **Deploy**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Set up monitoring
   - Configure backups
   - Enable SSL

4. **Launch**
   - Onboard users
   - Partner with merchants
   - Gather feedback
   - Iterate

---

## 🎉 You're Ready!

Your DriveSutraGo platform is now running locally!

**User App**: http://localhost:5173
**Admin Panel**: http://localhost:5173/admin/login
**API**: http://localhost:5000/api

Happy coding! 🚀🌱
