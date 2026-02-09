# 🔑 Free API Keys Setup Guide

## Required API Keys for DriveSutraGo

All APIs listed here have **FREE tiers** that are sufficient for development and moderate production use.

---

## 1. OpenWeatherMap API (Weather Data)

### Why Needed?
- Weather conditions for EcoScore calculation
- Temperature data for trip analysis

### Free Tier:
- ✅ 1,000 calls/day
- ✅ Current weather data
- ✅ No credit card required

### Setup Steps:

1. **Sign Up**
   - Go to: https://openweathermap.org/api
   - Click "Sign Up" (top right)
   - Fill in details (Name, Email, Password)
   - Verify email

2. **Get API Key**
   - Login to your account
   - Go to: https://home.openweathermap.org/api_keys
   - Copy the "Default" API key (or create new one)
   - Key format: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **Add to Backend .env**
   ```env
   OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Test API**
   ```bash
   curl "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY"
   ```

---

## 2. Google OAuth 2.0 (Google Fit & Authentication)

### Why Needed?
- Google Fit API for health data (steps, heart rate)
- Google Sign-In for authentication

### Free Tier:
- ✅ Unlimited OAuth requests
- ✅ Google Fit API access
- ✅ No credit card required

### Setup Steps:

1. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Project name: "DriveSutraGo"
   - Click "Create"

2. **Enable APIs**
   - In the project, go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ "Fitness API" (for Google Fit)  
     - ✅ "Google+ API" (for authentication)

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen:
     - User Type: External
     - App name: DriveSutraGo
     - User support email: your email
     - Developer contact: your email
     - Scopes: Add these:
       - `https://www.googleapis.com/auth/fitness.activity.read`
       - `https://www.googleapis.com/auth/fitness.body.read`
       - `https://www.googleapis.com/auth/fitness.location.read`
   - Application type: "Web application"
   - Name: "DriveSutraGo Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:3000`
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://yourdomain.com/auth/callback`
   - Click "Create"

4. **Copy Client ID**
   - Copy the "Client ID" (format: `123456789-abc.apps.googleusercontent.com`)

5. **Add to Frontend .env**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

6. **Add Google API Script to HTML**
   - Already done in `Frontend/index.html`:
   ```html
   <script src="https://apis.google.com/js/api.js"></script>
   ```

---

## 3. MongoDB Atlas (Database)

### Why Needed?
- Cloud MongoDB database
- Free tier sufficient for production

### Free Tier:
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ No credit card required

### Setup Steps:

1. **Sign Up**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google

2. **Create Cluster**
   - Choose "Free" tier (M0)
   - Cloud Provider: AWS
   - Region: Choose nearest (e.g., Mumbai for India)
   - Cluster Name: "DriveSutraGo"
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `drivesutra_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 4.1 or later
   - Copy connection string:
   ```
   mongodb+srv://drivesutra_admin:<password>@drivesutrago.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Add to Backend .env**
   ```env
   MONGODB_URI=mongodb+srv://drivesutra_admin:YOUR_PASSWORD@drivesutrago.xxxxx.mongodb.net/drivesutrago?retryWrites=true&w=majority
   ```

---

## 4. Gmail SMTP (Email Notifications)

### Why Needed?
- Send OTP emails
- Trip completion emails
- Reward confirmation emails

### Free Tier:
- ✅ 500 emails/day
- ✅ No cost
- ✅ Uses your Gmail account

### Setup Steps:

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click "Get Started" and follow steps

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Name: "DriveSutraGo"
   - Click "Generate"
   - Copy the 16-character password (format: `abcd efgh ijkl mnop`)

3. **Add to Backend .env**
   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

---

## 5. Mappls (MapmyIndia) API (Optional - Indian Maps)

### Why Needed?
- Better routing for India
- Indian address database
- Optional (OSRM is the fallback)

### Free Tier:
- ✅ 10,000 requests/month
- ✅ Indian map data
- ✅ No credit card required

### Setup Steps:

1. **Sign Up**
   - Go to: https://apis.mappls.com/console/
   - Click "Sign Up"
   - Fill in details
   - Verify email

2. **Create Project**
   - Login to console
   - Click "Create New Project"
   - Project Name: "DriveSutraGo"
   - Click "Create"

3. **Get API Keys**
   - In project dashboard, find:
     - REST API Key
     - Client ID
     - Client Secret
   - Copy REST API Key

4. **Add to Backend .env**
   ```env
   MAPPLS_API_KEY=your_rest_api_key_here
   ```

**Note**: If Mappls key is not provided, the system automatically falls back to OSRM (which is free and works globally).

---

## 6. No API Key Needed (Already Free)

These services work without API keys:

### Nominatim (OpenStreetMap)
- ✅ Geocoding
- ✅ Reverse geocoding
- ✅ No registration needed
- ✅ Usage policy: https://operations.osmfoundation.org/policies/nominatim/

### OSRM (Open Source Routing Machine)
- ✅ Route calculation
- ✅ Turn-by-turn navigation
- ✅ No registration needed
- ✅ Public instance: https://router.project-osrm.org/

### Overpass API (OpenStreetMap)
- ✅ Metro stations
- ✅ Bus stops
- ✅ POI data
- ✅ No registration needed
- ✅ Public instance: https://overpass-api.de/

---

## Complete .env Files

### Backend/.env
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://drivesutra_admin:YOUR_PASSWORD@drivesutrago.xxxxx.mongodb.net/drivesutrago?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Email (Gmail SMTP)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_16_char_app_password

# Weather API
OPENWEATHER_API_KEY=your_openweather_api_key

# Optional: Mappls (Indian Maps)
MAPPLS_API_KEY=your_mappls_api_key_or_leave_empty

# CORS Origins (add your frontend URLs)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend/.env
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Optional: Google Maps (if you want to use Google Maps instead of Leaflet)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## Testing Your API Keys

### 1. Test OpenWeatherMap
```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_KEY&units=metric"
```

Expected response:
```json
{
  "weather": [{"main": "Clear"}],
  "main": {"temp": 25}
}
```

### 2. Test MongoDB
```bash
cd Backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected')).catch(err => console.error('❌ Error:', err));"
```

### 3. Test Gmail SMTP
```bash
cd Backend
node -e "const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({service: 'gmail', auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}}); transporter.verify().then(() => console.log('✅ Email Ready')).catch(err => console.error('❌ Error:', err));"
```

### 4. Test Google OAuth
- Open your app in browser
- Click "Sign in with Google"
- Should show OAuth consent screen

---

## Rate Limits & Best Practices

### OpenWeatherMap
- **Limit**: 1,000 calls/day (free tier)
- **Best Practice**: Cache weather data for 10 minutes
- **Upgrade**: $40/month for 100,000 calls/day

### Google Fit API
- **Limit**: 10,000 requests/day (free)
- **Best Practice**: Cache fitness data for 5 minutes
- **Upgrade**: Contact Google for higher limits

### MongoDB Atlas
- **Limit**: 512 MB storage (free tier)
- **Best Practice**: Clean old data periodically
- **Upgrade**: $9/month for 2 GB

### Gmail SMTP
- **Limit**: 500 emails/day
- **Best Practice**: Use transactional email service for production
- **Upgrade**: Use SendGrid (100 emails/day free) or AWS SES

### Nominatim
- **Limit**: 1 request/second
- **Best Practice**: Add delay between requests
- **Upgrade**: Host your own Nominatim instance

### OSRM
- **Limit**: Fair use policy
- **Best Practice**: Cache routes for same origin-destination
- **Upgrade**: Host your own OSRM instance

---

## Production Recommendations

### For Production Use:

1. **Email Service**: Switch to SendGrid or AWS SES
   - SendGrid: 100 emails/day free
   - AWS SES: $0.10 per 1,000 emails

2. **MongoDB**: Upgrade to M10 cluster ($9/month)
   - Better performance
   - Automated backups
   - More storage

3. **Weather API**: Upgrade if needed
   - Monitor usage
   - Upgrade when hitting limits

4. **Self-Host OSRM** (optional)
   - Better performance
   - No rate limits
   - Requires server

---

## Troubleshooting

### "Invalid API Key"
- Check if key is copied correctly (no extra spaces)
- Verify key is activated (some APIs take 10 minutes)
- Check if API is enabled in console

### "MongoDB Connection Failed"
- Verify IP is whitelisted
- Check username/password
- Ensure cluster is running

### "Email Not Sending"
- Verify 2-step verification is enabled
- Check app password (not regular password)
- Allow less secure apps (if needed)

### "Google OAuth Not Working"
- Check authorized origins match your URL
- Verify APIs are enabled
- Clear browser cache

---

## Security Best Practices

1. **Never commit .env files**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys for dev/prod**
   - Development: `.env.development`
   - Production: `.env.production`

3. **Rotate keys periodically**
   - Every 3-6 months
   - After team member leaves
   - If key is exposed

4. **Monitor API usage**
   - Set up alerts for high usage
   - Check logs regularly
   - Watch for suspicious activity

---

## Cost Estimate

### Free Tier (Development)
- OpenWeatherMap: $0
- Google OAuth: $0
- MongoDB Atlas: $0
- Gmail SMTP: $0
- **Total: $0/month**

### Production (Small Scale)
- OpenWeatherMap: $0 (if under 1,000/day)
- Google OAuth: $0
- MongoDB Atlas: $9/month (M10 cluster)
- SendGrid: $0 (100 emails/day)
- **Total: ~$9/month**

### Production (Medium Scale)
- OpenWeatherMap: $40/month
- Google OAuth: $0
- MongoDB Atlas: $25/month (M20 cluster)
- SendGrid: $15/month (40,000 emails)
- **Total: ~$80/month**

---

## Quick Setup Checklist

- [ ] OpenWeatherMap API key obtained
- [ ] Google OAuth Client ID created
- [ ] MongoDB Atlas cluster created
- [ ] Gmail App Password generated
- [ ] Backend .env file configured
- [ ] Frontend .env file configured
- [ ] All API keys tested
- [ ] .env added to .gitignore

---

## Support

If you face issues:
1. Check API provider's status page
2. Review error messages carefully
3. Test API keys individually
4. Check rate limits
5. Verify network connectivity

---

**All APIs listed are FREE for development and small-scale production use!** 🎉
