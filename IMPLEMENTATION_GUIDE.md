# DriveSutraGo - Complete Implementation Guide

## Overview
DriveSutraGo is an eco-friendly travel platform that rewards users for choosing sustainable transport modes. This guide covers all implemented features and how to use them.

---

## 🚀 Core Features Implemented

### 1. **Real-Time GPS Location Tracking**

#### Frontend Service: `locationTrackingService.js`
- **Purpose**: Track user's real-time location during trips
- **Features**:
  - High-accuracy GPS tracking
  - Speed monitoring (current, max, average)
  - Distance calculation using Haversine formula
  - Location history storage
  - Error handling for permission issues

#### Usage:
```javascript
import locationTrackingService from './services/locationTrackingService';

// Start tracking
locationTrackingService.startTracking({
  onLocationUpdate: (data) => {
    console.log('Location:', data.lat, data.lng);
    console.log('Speed:', data.currentSpeed, 'km/h');
  },
  onSpeedUpdate: (speedData) => {
    console.log('Max speed:', speedData.max);
  },
  onError: (error) => {
    console.error('Tracking error:', error.message);
  }
});

// Stop tracking
const summary = locationTrackingService.stopTracking();
console.log('Total distance:', summary.totalDistance);
```

#### Backend Integration:
- **Endpoint**: `POST /api/trips/:tripId/location`
- **Model**: Trip model includes `tracking` field with location history
- **Real-time updates**: Location data sent to backend every update

---

### 2. **Universal Health API Integration**

#### Frontend Service: `healthApiService.js`
- **Supported Platforms**:
  - ✅ Google Fit (Android, Web)
  - ✅ Apple HealthKit (iOS)
  - ✅ Samsung Health (Samsung devices)

#### Features:
- Auto-detection of available health API
- Step count tracking
- Distance measurement
- Calories burned
- Heart rate monitoring
- Stress relief calculation
- Fitness score computation

#### Usage:
```javascript
import healthApiService from './services/healthApiService';

// Connect to health API
const result = await healthApiService.connect();
if (result.success) {
  console.log('Connected to:', result.provider);
}

// Get fitness data for trip
const fitnessData = await healthApiService.getFitnessData(startTime, endTime);
console.log('Steps:', fitnessData.steps);
console.log('Calories:', fitnessData.calories);
console.log('Stress relief:', fitnessData.stressRelief);
```

#### Verification:
- Compares trip distance with fitness data
- Validates step count (>1000 steps per km)
- Checks heart rate elevation (>80 bpm for activity)
- Confidence score: 0-100%

---

### 3. **Public Transport Verification System**

#### Frontend Service: `publicTransportService.js`

##### Features:
1. **Metro Station Detection**
   - Detects 12 metro cities in India
   - Finds nearby metro stations (using Overpass API)
   - Calculates distance and fare estimates
   - Provides line information

2. **Bus Stop Finder**
   - Locates nearby bus stops
   - Shows route numbers
   - Operator information

3. **Ticket Verification**
   - Image upload support
   - OCR text extraction (backend)
   - Duplicate ticket detection
   - Expiry validation

4. **Transaction Verification**
   - UPI/Card/Wallet support
   - Transaction ID validation
   - 24-hour time window check
   - Fraud detection

#### Usage:
```javascript
import publicTransportService from './services/publicTransportService';

// Find nearby metro stations
const metro = await publicTransportService.findNearbyMetroStations(lat, lng, 2);
console.log('Stations:', metro.stations);

// Verify ticket
const ticketResult = await publicTransportService.verifyTicket(imageFile);

// Verify transaction
const txnResult = await publicTransportService.verifyTransaction({
  transactionId: 'TXN123456',
  amount: 50,
  timestamp: Date.now(),
  paymentMethod: 'upi',
  provider: 'paytm'
});
```

#### Backend Models:
- **PublicTransportVerification**: Stores all verification data
- **Fields**: ticket details, transaction info, OCR data, fraud checks

---

### 4. **Private Vehicle Tracking**

#### Features:
- Real-time speed monitoring
- Speed violation detection (>80 km/h)
- Average speed calculation
- Fuel efficiency estimation
- EcoScore based on driving behavior

#### Speed Suggestions:
- **Optimal**: 40-60 km/h (best fuel efficiency)
- **Warning**: >80 km/h (speed violation)
- **Weather adjustment**: Reduces suggested speed in rain/fog

#### Backend Integration:
- Speed data stored in `trip.tracking.locationHistory`
- Max speed recorded in `trip.tracking.maxSpeedRecorded`
- Speed violations affect EcoScore

---

### 5. **Enhanced EcoScore Calculation**

#### Components (5 parts):
1. **Mode Component (30%)**
   - PUBLIC: 100 points
   - WALK/CYCLE: 95 points
   - CAR/BIKE: 60 points

2. **Efficiency Component (30%)**
   - Based on actual vs expected time
   - Optimal: 90-120% of ETA = 90 points

3. **Behavior Component (20%)**
   - Speed discipline for cars (30-60 km/h = 90 points)
   - Smooth driving patterns

4. **Weather Component (10%)**
   - Bonus for difficult conditions
   - Rain: +5, Fog: +7, Snow: +8

5. **Verification Component (10%)**
   - Ticket verified: 95 points
   - Steps match: 95 points
   - Speed violations: -20 points

#### Fitness Bonus (NEW):
- Calories burned: up to +10 points
- Stress relief: up to +5 points
- Heart rate elevation: +5 points
- **Total possible bonus**: +20 points

---

### 6. **Tree Planting System**

#### Frontend Service: `treePlantingService.js`

#### Features:
- Automatic tree planting based on CO2 saved
- **Formula**: 1 tree per 22 kg CO2 saved
- Certificate generation with unique number
- GPS verification support
- Growth tracking updates
- Partner organization integration

#### Backend Model: `TreePlanting`
```javascript
{
  user: ObjectId,
  trip: ObjectId,
  treeCount: Number,
  species: String,
  location: { name, lat, lng, region },
  status: 'pending' | 'planted' | 'verified',
  certificate: {
    certificateNumber: 'TREE-2024-ABC123',
    issuedDate: Date,
    downloadUrl: String
  },
  verification: {
    method: 'gps' | 'photo' | 'certificate',
    photoUrl: String,
    gpsCoordinates: { lat, lng }
  }
}
```

#### Usage:
```javascript
import treePlantingService from './services/treePlantingService';

// Plant trees after trip completion
const result = await treePlantingService.plantTreesForTrip(tripId);
console.log('Trees planted:', result.treePlanting.treeCount);
console.log('Certificate:', result.certificateNumber);

// Get user's trees
const trees = await treePlantingService.getUserTrees();
console.log('Total trees:', trees.impact.totalTrees);
console.log('Total CO2 offset:', trees.impact.totalCO2);
```

---

### 7. **Reward & Coupon System**

#### Features:
- 30+ Indian brand rewards
- Carbon credit-based redemption
- EcoScore and level requirements
- Stock management
- Expiry tracking
- Unique coupon code generation

#### Categories:
- 🍕 Food & Beverage (CCD, Domino's, Haldiram's, Zomato)
- 🚗 Transport (Ola, Metro Card, Bus Pass)
- 🛒 Shopping (Amazon, Flipkart, Myntra, Paytm)
- 📺 Entertainment (Hotstar, BookMyShow)
- 🌿 Eco-friendly (Tree planting, Organic India, Khadi)
- 🧘 Experiences (Ayurvedic spa, Yoga classes)

#### Eligibility:
- Carbon credits required: 30-250 credits
- EcoScore minimum: 60-90
- Level requirement: 1-5

---

## 📱 Enhanced Trip Tracker Component

### `EnhancedTripTracker.jsx`

#### Features:
1. **Real-time Tracking**
   - Live location updates
   - Speed monitoring
   - Distance calculation
   - Duration timer

2. **Mode-Specific Features**
   - **Walk/Cycle**: Health API integration
   - **Public Transport**: Metro suggestions, ticket/transaction verification
   - **Car/Bike**: Speed alerts, fuel efficiency tips

3. **Verification Flow**
   - Automatic fitness data collection
   - Ticket upload interface
   - Transaction verification form
   - Manual verification options

4. **Trip Completion**
   - Summary display
   - EcoScore calculation
   - Automatic tree planting
   - Reward notification

---

## 🗺️ Map Services

### Free APIs Used:
1. **Nominatim (OpenStreetMap)**
   - Geocoding: Address → Coordinates
   - Reverse geocoding: Coordinates → Address
   - No API key required

2. **OSRM (Open Source Routing Machine)**
   - Route calculation for all modes
   - Distance and duration estimation
   - Turn-by-turn navigation
   - No API key required

3. **Overpass API (OpenStreetMap)**
   - Metro station data
   - Bus stop locations
   - Public transport routes
   - No API key required

4. **OpenWeatherMap**
   - Weather conditions
   - Temperature data
   - API key required (free tier available)

---

## 🔧 Backend API Endpoints

### Trip Management
```
POST   /api/trips/route-options          # Get route options
POST   /api/trips                         # Create trip
POST   /api/trips/:id/start               # Start trip
POST   /api/trips/:id/location            # Update location (real-time)
POST   /api/trips/:id/complete            # Complete trip
GET    /api/trips                         # Get user trips
GET    /api/trips/:id                     # Get trip details
```

### Public Transport
```
POST   /api/public-transport/verify-ticket        # Verify ticket image
POST   /api/public-transport/verify-transaction   # Verify transaction
GET    /api/public-transport/metro-stations       # Get nearby metro
```

### Tree Planting
```
POST   /api/trees/plant                   # Plant trees for trip
GET    /api/trees/user                    # Get user's trees
GET    /api/trees/certificate/:id         # Get certificate
PUT    /api/trees/growth/:id              # Update growth (admin)
```

### Rewards
```
GET    /api/rewards                       # Get available rewards
POST   /api/rewards/:id/redeem            # Redeem reward
GET    /api/rewards/user                  # Get user's rewards
POST   /api/rewards/:id/use               # Mark as used
GET    /api/rewards/leaderboard           # Get leaderboard
```

---

## 🎯 Transport Mode Details

### 1. WALK Mode
- **Tracking**: GPS + Health API
- **Verification**: Step count, distance, heart rate
- **EcoScore**: 95 base + fitness bonus
- **Rewards**: 1.8x XP multiplier
- **Distance limit**: < 7 km recommended

### 2. CYCLE Mode
- **Tracking**: GPS + Health API
- **Verification**: Step count, speed check (<27 km/h)
- **EcoScore**: 90 base + fitness bonus
- **Rewards**: 1.6x XP multiplier
- **Distance limit**: < 20 km recommended

### 3. PUBLIC Transport
- **Tracking**: GPS (start/end points)
- **Verification**: Ticket image OR transaction details
- **Metro Support**: 12 cities (Delhi, Mumbai, Bangalore, etc.)
- **EcoScore**: 85 base
- **Rewards**: 1.5x XP multiplier

### 4. CAR Mode
- **Tracking**: Real-time GPS + speed monitoring
- **Verification**: Speed analysis, route validation
- **Speed Suggestions**: 40-60 km/h optimal
- **EcoScore**: 65 base (reduced for speed violations)
- **Rewards**: 1.0x XP multiplier

### 5. BIKE Mode
- **Tracking**: Real-time GPS + speed monitoring
- **Verification**: Speed analysis
- **EcoScore**: 60 base
- **Rewards**: 1.1x XP multiplier

---

## 💾 Database Models

### Trip Model (Enhanced)
```javascript
{
  user: ObjectId,
  startLocation: { lat, lng, address },
  endLocation: { lat, lng, address },
  mode: 'PUBLIC' | 'WALK' | 'CYCLE' | 'CAR' | 'BIKE',
  distanceKm: Number,
  etaMinutes: Number,
  actualMinutes: Number,
  status: 'planned' | 'in_progress' | 'completed',
  
  // NEW: Real-time tracking
  tracking: {
    enabled: Boolean,
    locationHistory: [{
      lat, lng, accuracy, speed, timestamp
    }],
    totalDistanceTracked: Number,
    maxSpeedRecorded: Number
  },
  
  // NEW: Enhanced verification
  verification: {
    ticketUploaded: Boolean,
    transactionVerified: Boolean,
    stepsData: {
      steps, distance, calories, avgHeartRate, source
    },
    speedAnalysis: {
      avgSpeed, maxSpeed, speedViolations
    },
    publicTransport: {
      metroStation, busRoute, fare, verificationMethod
    }
  },
  
  ecoScore: Number,
  ecoComponents: {
    modeComponent, efficiencyComponent, behaviorComponent,
    weatherComponent, verificationComponent, fitnessBonus
  },
  carbonCreditsEarned: Number,
  co2Saved: Number,
  treesGrown: Number
}
```

---

## 🚀 Getting Started

### Prerequisites
```bash
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENWEATHER_API_KEY=your_openweather_key
MAPPLS_API_KEY=your_mappls_key (optional)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key (optional)
```

### Running the Application
```bash
# Backend
cd Backend
npm run dev

# Frontend
cd Frontend
npm run dev
```

---

## 📊 Carbon Credit Calculation

### Formula:
```javascript
// CO2 saved = (car_emission - mode_emission) × distance
const carEmission = 0.21; // kg CO2 per km

const modeEmissions = {
  PUBLIC: 0.05,  // kg CO2 per km
  WALK: 0,
  CYCLE: 0,
  CAR: 0.21,
  BIKE: 0.15
};

const co2Saved = (carEmission - modeEmissions[mode]) * distanceKm;

// Carbon credits = ecoScore × 0.1 + distance × 0.5
const carbonCredits = ecoScore * 0.1 + distanceKm * 0.5;

// Trees = CO2 saved / 22 kg (annual CO2 absorption per tree)
const trees = Math.floor(co2Saved / 22);
```

---

## 🎮 Gamification System

### XP Calculation:
```javascript
const baseXP = ecoScore * 0.5 + distanceKm * 2;
const modeMultiplier = {
  PUBLIC: 1.5,
  WALK: 1.8,
  CYCLE: 1.6,
  CAR: 1.0,
  BIKE: 1.1
};
const xp = baseXP * modeMultiplier[mode] + fitnessBonus * 2;
```

### Level System:
- Level = floor(XP / 1000) + 1
- Level 1: 0-999 XP
- Level 2: 1000-1999 XP
- Level 3: 2000-2999 XP
- etc.

### Streaks:
- Daily trip = +1 streak
- Missed day = reset to 1
- Longest streak tracked

---

## 🔒 Security Features

### Fraud Detection:
1. **Duplicate Ticket Check**: Transaction ID uniqueness
2. **Time Validation**: 24-hour window for transactions
3. **Location Verification**: GPS accuracy checks
4. **Speed Validation**: Realistic speed limits per mode
5. **Distance Verification**: Fitness data vs GPS comparison
6. **Fraud Strikes**: 3 strikes = account review

---

## 📈 Analytics & Insights

### User Dashboard:
- Total trips
- Total distance
- CO2 saved
- Trees planted
- Current streak
- EcoScore average
- Carbon credits balance
- Level progress

### Trip History:
- Mode distribution
- Distance trends
- EcoScore trends
- Reward earnings
- Achievement progress

---

## 🌟 Future Enhancements

### Planned Features:
1. **Offline Mode**: Cache maps and trip data
2. **Social Features**: Friend challenges, group trips
3. **OBD-II Integration**: Real-time vehicle data
4. **Air Quality API**: Pollution-based rewards
5. **Payment Gateway**: Premium features
6. **QR Code Scanning**: Instant ticket verification
7. **Voice Navigation**: Turn-by-turn audio
8. **AR Features**: Gamified tree planting visualization

---

## 📞 Support

For issues or questions:
- GitHub Issues: [Your repo URL]
- Email: support@drivesutrago.com
- Documentation: [Your docs URL]

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- OpenStreetMap for free mapping data
- OSRM for routing services
- Google Fit API for health data
- All open-source contributors

---

**Built with ❤️ for a greener planet 🌍**
