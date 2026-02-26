# 🔌 DriveSutraGo - Complete API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Trip APIs](#trip-apis)
4. [Admin APIs](#admin-apis)
5. [Achievement APIs](#achievement-apis)
6. [Challenge APIs](#challenge-apis)
7. [Reward APIs](#reward-apis)
8. [Partner Merchant APIs](#partner-merchant-apis)
9. [Public Transport APIs](#public-transport-apis)
10. [Tree Planting APIs](#tree-planting-apis)
11. [Contact APIs](#contact-apis)

---

## 🔐 Authentication APIs

### 1. User Registration
**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### 2. User Login
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "level": 1,
    "xp": 0,
    "ecoScore": 0,
    "carbonCredits": 0
  }
}
```

### 3. Google OAuth Login
**Endpoint:** `POST /auth/google-signin`

**Body:**
```json
{
  "idToken": "google_id_token",
  "profile": {
    "email": "john@example.com",
    "name": "John Doe",
    "picture": "profile_url"
  }
}
```

### 4. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

### 5. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewPassword@123"
}
```

---

## 👤 User APIs

### 1. Get User Profile
**Endpoint:** `GET /users/profile`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "level": 5,
    "xp": 4500,
    "ecoScore": 85,
    "carbonCredits": 250,
    "co2Saved": 45.5,
    "treesGrown": 2,
    "totalTrips": 25,
    "totalDistance": 150.5,
    "currentStreak": 7,
    "longestStreak": 15,
    "fraudStrikes": 0
  }
}
```

### 2. Update User Profile
**Endpoint:** `PUT /users/profile`
**Auth:** Required

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "avatar_url"
}
```

### 3. Get User Stats
**Endpoint:** `GET /users/stats`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTrips": 25,
    "totalDistance": 150.5,
    "co2Saved": 45.5,
    "treesGrown": 2,
    "carbonCredits": 250,
    "ecoScore": 85,
    "level": 5,
    "xp": 4500,
    "currentStreak": 7,
    "longestStreak": 15
  }
}
```

### 4. Get Leaderboard
**Endpoint:** `GET /users/leaderboard?type=ecoScore&limit=10`
**Auth:** Required

**Query Parameters:**
- `type`: ecoScore | carbonCredits | co2Saved | trips
- `limit`: Number of users (default: 10)

---

## 🚗 Trip APIs

### 1. Get Route Options
**Endpoint:** `POST /trips/route-options`
**Auth:** Required

**Body:**
```json
{
  "startLocation": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Connaught Place, New Delhi"
  },
  "endLocation": {
    "lat": 28.5355,
    "lng": 77.3910,
    "address": "Noida Sector 18"
  }
}
```

**Response:**
```json
{
  "success": true,
  "options": [
    {
      "mode": "PUBLIC",
      "distanceKm": 25.5,
      "durationMinutes": 45,
      "ecoLabel": "Eco-Friendly",
      "estimatedEcoScore": 85,
      "icon": "🚌"
    },
    {
      "mode": "WALK",
      "distanceKm": 2.5,
      "durationMinutes": 30,
      "ecoLabel": "Carbon Neutral",
      "estimatedEcoScore": 90,
      "icon": "🚶",
      "geometry": {...},
      "steps": [...]
    }
  ],
  "weather": {
    "condition": "clear",
    "temp": 25,
    "description": "Clear sky"
  }
}
```

### 2. Create Trip (Plan)
**Endpoint:** `POST /trips`
**Auth:** Required

**Body:**
```json
{
  "startLocation": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Connaught Place"
  },
  "endLocation": {
    "lat": 28.5355,
    "lng": 77.3910,
    "address": "Noida Sector 18"
  },
  "mode": "PUBLIC",
  "distanceKm": 25.5,
  "etaMinutes": 45,
  "routeGeometry": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip planned successfully",
  "trip": {
    "id": "trip_id",
    "status": "planned",
    "mode": "PUBLIC",
    "distanceKm": 25.5,
    "etaMinutes": 45
  }
}
```

### 3. Start Trip
**Endpoint:** `POST /trips/:tripId/start`
**Auth:** Required

**Body:**
```json
{
  "enableTracking": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "trip": {
    "id": "trip_id",
    "status": "in_progress",
    "startTime": "2026-02-26T10:00:00Z"
  }
}
```

### 4. Update Trip Location (Real-time Tracking)
**Endpoint:** `POST /trips/:tripId/location`
**Auth:** Required

**Body:**
```json
{
  "lat": 28.6000,
  "lng": 77.2500,
  "accuracy": 10,
  "speed": 5.5,
  "timestamp": "2026-02-26T10:15:00Z"
}
```

### 5. Complete Trip
**Endpoint:** `POST /trips/:tripId/complete`
**Auth:** Required

**Body:**
```json
{
  "actualMinutes": 50,
  "ticketImage": "base64_or_url",
  "stepsData": {
    "steps": 3500,
    "distance": 2.5,
    "calories": 150,
    "avgHeartRate": 110,
    "source": "google_fit"
  },
  "weatherData": {
    "condition": "clear",
    "temp": 25
  },
  "fitnessData": {
    "calories": 150,
    "stressRelief": 80,
    "avgHeartRate": 110
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip completed! Pending admin verification for rewards.",
  "trip": {
    "id": "trip_id",
    "status": "completed",
    "verificationStatus": "pending",
    "ecoScore": 85
  },
  "pendingRewards": {
    "xp": 150,
    "carbonCredits": 25,
    "co2Saved": 3.2,
    "trees": 0.15
  },
  "note": "Your rewards will be credited after admin verification"
}
```

### 6. Get User Trips
**Endpoint:** `GET /trips?page=1&limit=10&status=completed`
**Auth:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: planned | in_progress | completed | cancelled

**Response:**
```json
{
  "success": true,
  "trips": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 7. Get Trip Details
**Endpoint:** `GET /trips/:tripId`
**Auth:** Required

---

## 🛡️ Admin APIs

### 1. Admin Login
**Endpoint:** `POST /admin/login`

**Body:**
```json
{
  "email": "admin@drivesutrago.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "admin_jwt_token",
  "admin": {
    "id": "admin_id",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@drivesutrago.com",
    "role": "super_admin",
    "permissions": ["all"]
  }
}
```

### 2. Get Admin Dashboard
**Endpoint:** `GET /admin/dashboard`
**Auth:** Admin Required

**Response:**
```json
{
  "success": true,
  "stats": {
    "pendingVerifications": 5,
    "totalTrips": 250,
    "totalUsers": 50,
    "todayTrips": 15,
    "totalCO2Saved": 450.5,
    "totalTreesPlanted": 20,
    "modeDistribution": [
      { "_id": "PUBLIC", "count": 100 },
      { "_id": "WALK", "count": 80 }
    ],
    "recentVerifications": [...]
  }
}
```

### 3. Get Pending Trips
**Endpoint:** `GET /admin/trips/pending?page=1&limit=20&mode=PUBLIC`
**Auth:** Admin Required

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `mode`: Filter by mode

**Response:**
```json
{
  "success": true,
  "trips": [
    {
      "id": "trip_id",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "fraudStrikes": 0
      },
      "mode": "PUBLIC",
      "distanceKm": 25.5,
      "ecoScore": 85,
      "xpEarned": 150,
      "carbonCreditsEarned": 25,
      "verificationStatus": "pending",
      "endTime": "2026-02-26T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 4. Approve Trip
**Endpoint:** `POST /admin/trips/:tripId/approve`
**Auth:** Admin Required

**Body:**
```json
{
  "notes": "Trip verified successfully. All data checks out.",
  "adjustedEcoScore": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip approved and rewards awarded",
  "trip": {
    "id": "trip_id",
    "verificationStatus": "approved",
    "verification": {
      "adminVerified": true,
      "verifiedAt": "2026-02-26T12:00:00Z"
    }
  },
  "newAchievements": [...]
}
```

### 5. Reject Trip
**Endpoint:** `POST /admin/trips/:tripId/reject`
**Auth:** Admin Required

**Body:**
```json
{
  "reason": "Invalid ticket verification",
  "notes": "Ticket image does not match trip details. Date mismatch detected."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip rejected. No rewards awarded.",
  "trip": {
    "id": "trip_id",
    "verificationStatus": "rejected",
    "verification": {
      "rejected": true,
      "rejectionReason": "Invalid ticket verification"
    }
  },
  "fraudStrikes": 1
}
```

### 6. Get Pending Verifications (Public Transport)
**Endpoint:** `GET /admin/verifications/pending?page=1&limit=20&type=ticket`
**Auth:** Admin Required

---

## 🏆 Achievement APIs

### 1. Get All Achievements
**Endpoint:** `GET /achievements`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "achievement_id",
      "name": "First Trip",
      "description": "Complete your first eco-friendly trip",
      "icon": "🎯",
      "category": "milestone",
      "requirement": {
        "type": "trips_completed",
        "value": 1
      },
      "reward": {
        "xp": 50,
        "carbonCredits": 10
      }
    }
  ]
}
```

### 2. Get User Achievements
**Endpoint:** `GET /achievements/user`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "achievements": [
    {
      "achievement": {...},
      "unlockedAt": "2026-02-26T10:00:00Z",
      "progress": 100
    }
  ]
}
```

---

## 🎯 Challenge APIs

### 1. Get Active Challenges
**Endpoint:** `GET /challenges/active`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "challenges": [
    {
      "id": "challenge_id",
      "title": "Weekly Eco Warrior",
      "description": "Complete 5 eco-friendly trips this week",
      "type": "weekly",
      "requirement": {
        "trips": 5,
        "mode": "any"
      },
      "reward": {
        "xp": 200,
        "carbonCredits": 50
      },
      "startDate": "2026-02-24T00:00:00Z",
      "endDate": "2026-03-02T23:59:59Z"
    }
  ]
}
```

### 2. Join Challenge
**Endpoint:** `POST /challenges/:challengeId/join`
**Auth:** Required

### 3. Get Challenge Progress
**Endpoint:** `GET /challenges/:challengeId/progress`
**Auth:** Required

---

## 🎁 Reward APIs

### 1. Get Available Rewards
**Endpoint:** `GET /rewards`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "rewards": [
    {
      "id": "reward_id",
      "name": "Metro Pass Discount",
      "description": "10% off on metro pass",
      "category": "transport",
      "cost": 100,
      "icon": "🚇",
      "available": true
    }
  ]
}
```

### 2. Redeem Reward
**Endpoint:** `POST /rewards/:rewardId/redeem`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "message": "Reward redeemed successfully",
  "redemption": {
    "id": "redemption_id",
    "reward": {...},
    "code": "METRO-ABC123",
    "expiresAt": "2026-03-26T23:59:59Z"
  }
}
```

### 3. Get User Redemptions
**Endpoint:** `GET /rewards/redemptions`
**Auth:** Required

---

## 🏪 Partner Merchant APIs

### 1. Get All Partners
**Endpoint:** `GET /partners`
**Auth:** Optional (public)

**Response:**
```json
{
  "success": true,
  "partners": [
    {
      "id": "partner_id",
      "name": "EcoMart",
      "category": "retail",
      "description": "Sustainable products store",
      "discount": "15% off",
      "minCredits": 50,
      "logo": "logo_url",
      "location": "Multiple locations",
      "isActive": true
    }
  ]
}
```

### 2. Get Partner Details
**Endpoint:** `GET /partners/:partnerId`
**Auth:** Optional

### 3. Redeem Partner Offer
**Endpoint:** `POST /partners/:partnerId/redeem`
**Auth:** Required

**Body:**
```json
{
  "creditsToRedeem": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon generated successfully",
  "redemption": {
    "couponCode": "ECO-XYZ789",
    "discount": "15% off",
    "expiresAt": "2026-03-26T23:59:59Z",
    "partner": {...}
  }
}
```

---

## 🚌 Public Transport APIs

### 1. Submit Ticket Verification
**Endpoint:** `POST /public-transport/verify`
**Auth:** Required

**Body:**
```json
{
  "tripId": "trip_id",
  "ticketImage": "base64_image",
  "transactionId": "TXN123456",
  "verificationType": "ticket"
}
```

### 2. Get Verification Status
**Endpoint:** `GET /public-transport/verify/:verificationId`
**Auth:** Required

---

## 🌳 Tree Planting APIs

### 1. Get Tree Planting Stats
**Endpoint:** `GET /trees/stats`
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTrees": 150,
    "userTrees": 2,
    "co2Offset": 3300,
    "recentPlantings": [...]
  }
}
```

### 2. Plant Tree
**Endpoint:** `POST /trees/plant`
**Auth:** Required

**Body:**
```json
{
  "location": "Delhi NCR",
  "species": "Neem",
  "creditsUsed": 100
}
```

---

## 📧 Contact APIs

### 1. Submit Contact Form
**Endpoint:** `POST /contact`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I would like to partner with DriveSutraGo..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## 🔍 Error Responses

All APIs return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Distances are in kilometers
3. Durations are in minutes
4. CO2 values are in kilograms
5. Coordinates use decimal degrees (lat/lng)
6. Images can be base64 encoded or URLs
7. Pagination starts at page 1
8. Default limit is 10 items per page

---

*Last Updated: February 26, 2026*
