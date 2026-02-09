# DriveSutraGo - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- MongoDB running (local or cloud)
- Git installed

---

## 📦 Installation

### 1. Clone & Install Dependencies
```bash
# Clone the repository
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

## ⚙️ Configuration

### 2. Backend Environment Setup
Create `Backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drivesutrago
JWT_SECRET=your_super_secret_jwt_key_here
OPENWEATHER_API_KEY=your_openweather_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Optional (has fallback to free APIs)
MAPPLS_API_KEY=your_mappls_key
```

### 3. Frontend Environment Setup
Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🏃 Running the Application

### 4. Start Backend Server
```bash
cd Backend
npm run dev
```
Server will start on `http://localhost:5000`

### 5. Start Frontend Development Server
```bash
cd Frontend
npm run dev
```
App will open on `http://localhost:5173`

---

## 🧪 Test the Features

### Test 1: Create a Trip
1. Register/Login to the app
2. Go to "New Trip" page
3. Pin start and end locations on map
4. Select transport mode (WALK, CYCLE, PUBLIC, CAR, BIKE)
5. View route options with EcoScore estimates

### Test 2: Track a Trip (Walk/Cycle)
1. Create a WALK or CYCLE trip
2. Click "Start Trip"
3. Allow location and health permissions
4. Watch real-time tracking:
   - Distance updates
   - Speed monitoring
   - Health data collection
5. Click "Stop Trip" to complete

### Test 3: Public Transport Verification
1. Create a PUBLIC transport trip
2. Start and complete the trip
3. In verification modal:
   - Upload ticket image, OR
   - Enter transaction details (ID, amount)
4. View verification status

### Test 4: Tree Planting
1. Complete any trip with CO2 savings
2. Trees are automatically planted
3. View certificate in "Forest" page
4. Check certificate number

### Test 5: Rewards
1. Earn carbon credits from trips
2. Go to "Rewards" page
3. Browse 30+ Indian brand rewards
4. Redeem with carbon credits
5. View coupon code

---

## 🗺️ Free APIs (No Setup Required)

These APIs work out of the box:
- ✅ **Nominatim** - Geocoding (no key needed)
- ✅ **OSRM** - Routing (no key needed)
- ✅ **Overpass API** - Metro/bus data (no key needed)

---

## 🔑 Optional API Keys

### OpenWeatherMap (Recommended)
1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to `Backend/.env`

### Google OAuth (For Google Fit)
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add to `Frontend/.env`

---

## 📱 Mobile Testing

### Test on Real Device:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `Frontend/.env`:
   ```env
   VITE_API_URL=http://YOUR_IP:5000/api
   ```
3. Access from phone: `http://YOUR_IP:5173`

### Enable Location Permissions:
- **Android**: Settings → Apps → Browser → Permissions → Location
- **iOS**: Settings → Safari → Location → Allow

---

## 🎯 Feature Testing Checklist

### Real-Time Tracking
- [ ] GPS location updates every second
- [ ] Speed displayed in km/h
- [ ] Distance calculated accurately
- [ ] Location sent to backend

### Health API
- [ ] Google Fit connects (Android/Web)
- [ ] Step count retrieved
- [ ] Heart rate data shown
- [ ] Fitness bonus applied to EcoScore

### Public Transport
- [ ] Metro stations found in metro cities
- [ ] Ticket upload works
- [ ] Transaction verification succeeds
- [ ] Fare estimation shown

### Tree Planting
- [ ] Trees planted after trip (1 per 22kg CO2)
- [ ] Certificate generated with unique number
- [ ] User's tree count updated
- [ ] Certificate viewable

### Rewards
- [ ] 30+ rewards displayed
- [ ] Eligibility checked (credits, level, score)
- [ ] Redemption works
- [ ] Coupon code generated

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to MongoDB"
**Fix**: 
```bash
# Start MongoDB locally
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Issue: "Location permission denied"
**Fix**: 
- Chrome: Click lock icon → Site settings → Location → Allow
- Firefox: Click shield icon → Permissions → Location → Allow

### Issue: "Health API not connecting"
**Fix**:
- Ensure Google OAuth credentials are correct
- Check browser console for errors
- Try incognito mode (clears cache)

### Issue: "Metro stations not found"
**Fix**:
- Ensure you're in one of 12 supported cities
- Check internet connection (Overpass API needs internet)
- Try increasing search radius

### Issue: "Routes not loading"
**Fix**:
- OSRM might be down, wait a few minutes
- Check browser console for errors
- Fallback to straight-line calculation will work

---

## 📊 Database Seeding

### Initialize Sample Data:
```bash
cd Backend
node scripts/initializeData.js
```

This creates:
- Sample achievements
- Sample challenges
- 30+ rewards (Indian brands)

---

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite auto-reloads on file changes
- Backend: nodemon restarts on file changes

### Debug Mode
Enable detailed logging:
```javascript
// Backend: Add to any controller
console.log('Debug:', data);

// Frontend: Check browser console
console.log('State:', state);
```

### API Testing
Use Postman or Thunder Client:
```
POST http://localhost:5000/api/trips/route-options
Body: {
  "startLocation": { "lat": 28.6139, "lng": 77.2090 },
  "endLocation": { "lat": 28.7041, "lng": 77.1025 }
}
```

---

## 📚 Code Structure

### Backend
```
Backend/
├── controllers/        # Business logic
│   ├── tripController.js
│   ├── publicTransportController.js
│   └── treePlantingController.js
├── models/            # Database schemas
│   ├── Trip.js
│   ├── PublicTransportVerification.js
│   └── TreePlanting.js
├── routes/            # API endpoints
├── utils/             # Helper functions
└── server.js          # Entry point
```

### Frontend
```
Frontend/
├── src/
│   ├── components/    # React components
│   │   └── trips/
│   │       └── EnhancedTripTracker.jsx
│   ├── services/      # API services
│   │   ├── locationTrackingService.js
│   │   ├── healthApiService.js
│   │   ├── publicTransportService.js
│   │   └── treePlantingService.js
│   ├── pages/         # Page components
│   └── App.jsx        # Main app
```

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository
3. Add environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository
3. Add environment variables
4. Deploy

### Environment Variables for Production:
```env
# Backend
MONGODB_URI=mongodb+srv://...
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend.com/api
```

---

## 📖 Documentation

- **Full Guide**: See `IMPLEMENTATION_GUIDE.md`
- **Features**: See `FEATURES_SUMMARY.md`
- **API Docs**: See inline comments in controllers

---

## 🎓 Learning Resources

### Key Technologies:
- **React**: https://react.dev
- **Node.js**: https://nodejs.org
- **MongoDB**: https://mongodb.com
- **Leaflet**: https://leafletjs.com
- **OSRM**: http://project-osrm.org

### APIs Used:
- **Nominatim**: https://nominatim.org
- **Overpass**: https://overpass-api.de
- **OpenWeatherMap**: https://openweathermap.org

---

## 💡 Pro Tips

1. **Use Chrome DevTools**: 
   - Network tab for API calls
   - Console for errors
   - Application tab for localStorage

2. **Test on Real Device**:
   - GPS is more accurate
   - Health APIs work better
   - Real-world testing

3. **Monitor Performance**:
   - Check location update frequency
   - Optimize API calls
   - Cache static data

4. **Security**:
   - Never commit .env files
   - Use environment variables
   - Validate all inputs

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Need Help?

- **Documentation**: Check `IMPLEMENTATION_GUIDE.md`
- **Issues**: Open GitHub issue
- **Email**: support@drivesutrago.com

---

## ✅ You're Ready!

All features are implemented and ready to use. Start the servers and begin testing!

```bash
# Terminal 1: Backend
cd Backend && npm run dev

# Terminal 2: Frontend
cd Frontend && npm run dev
```

Visit `http://localhost:5173` and start your eco-friendly journey! 🌍🚀
