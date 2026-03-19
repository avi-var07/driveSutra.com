# driveSutraGo

> **Travel Smart, Save the Planet**  
driveSutraGo is an interactive, gamified eco-routing platform designed to incentivize sustainable transportation choices. By tracking your daily commute, verifying eco-friendly transport modes, and rewarding you with real-world impact (like planting trees!), driveSutraGo transforms routine travel into an environmental adventure.

## 🌟 Key Features

1. **Gamified Eco-Routing**: Advanced algorithms calculate real-time CO₂ savings (based on factual 120g/km car baselines) when choosing to Walk, Cycle, or use Public Transit.
2. **Real-time Tracking & Verification**: Uses native Web Sensors (DeviceMotion) for walking/cycling steps to avoid restrictive 3rd-party health APIs, alongside GPS lag detection and Selfie verification for anti-fraud measures.
3. **Public Transit & "Book With Us"**: Intelligent transport suggestions based on distance/city-type with integrated ticketing via external providers, including a 7-day live expiration countdown.
4. **Dynamic Leaderboards & EcoScores**: Rank against other eco-warriors in your city.
5. **Real-World Impact**: Converts Carbon Credits into actual, planted trees dynamically shown in a customized "Forest" UI.
6. **Premium Admin Dashboard**: Provides real-time metrics on Global Eco Impact, user verification queues, and system overrides for flagged suspicious trips.

## 🏗 Workflow & Architecture

driveSutraGo operates on a MERN stack heavily augmented with Framer Motion for premium UI interactions. 

### The Flow
1. **User Starts Trip**: Frontend requests `locationTrackingService` and `webSensorService`.
2. **Transit Suggestion Engine**: Analyzes distance and location coordinates to suggest Walk (<3km), Cycle (<15km), or Public Transit.
3. **Tracking & Fraud Detection**: If location polling lags >60s, the trip flags, halting auto-verification and enforcing manual selfie upload or ticket verification (for transit).
4. **Completion & Calculation**: Backend `tripController` determines exact CO₂ saved vs a standard car and allocates XP/Carbon Credits respectively.
5. **Admin Review**: Flagged trips wait in the Admin Dashboard for approval.
6. **Reward Dispensation**: Users level up and use Carbon Credits to dynamically "plant" trees in their digital forest module.

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Google Auth Library, Tesseract.js (for OCR ticket parsing).
- **APIs**: OSRM (Routing), Nominatim (Geocoding), Overpass (Transit), OpenMeteo (Weather), Gemini (driveSutraGo AI Assistant).

## 🚀 Setup & Run Locally

### 1. Requirements
Ensure you have Node.js (v18+) and MongoDB installed. See `requirements.txt` for exact Environment Variables needed.

### 2. Backend Initialization
\`\`\`bash
cd Backend
npm install
# Create a .env file and configure according to requirements.txt
npm run dev
\`\`\`

### 3. Frontend Initialization
\`\`\`bash
cd Frontend
npm install
# Create a .env file and configure according to requirements.txt
npm run dev
\`\`\`

## 🌿 Our Mission
We strive to construct the most engaging infrastructure for tracking personal carbon mitigation. Every gram of CO₂ kept out of the atmosphere counts. Travel Smart, Save the Planet with driverSutraGo!
