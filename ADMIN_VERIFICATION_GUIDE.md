# Admin Verification Guide

## 🎯 How to Verify Trips

### Step 1: Access Admin Dashboard

1. Go to: http://localhost:5173/admin/login
2. Login with:
   - **Email**: `admin@drivesutrago.com`
   - **Password**: `Admin@123`

### Step 2: View Pending Verifications

The dashboard shows:
- **Pending Verifications**: Number of trips waiting for review
- **Total Trips**: All trips in system
- **Total Users**: Registered users
- **CO2 Saved**: Total carbon savings

### Step 3: Review Trip Details

Click **"Review"** on any pending trip to see:

#### User Information
- Name
- Email
- Current stats (level, EcoScore, carbon credits)
- Fraud strikes (if any)

#### Trip Details
- **Mode**: PUBLIC, WALK, CYCLE, CAR, BIKE
- **Distance**: Kilometers traveled
- **Duration**: Expected vs Actual time
- **Route**: Start and end locations
- **Date/Time**: When trip was completed

#### Verification Data

**For Public Transport:**
- ✅ Ticket image (if uploaded)
- ✅ OCR extracted data:
  - Ticket number
  - Date and time
  - Fare amount
  - Transport type
  - Operator name
- ✅ Transaction ID
- ✅ Metro station/Bus route

**For Walk/Cycle:**
- ✅ Fitness data:
  - Steps taken
  - Distance from fitness tracker
  - Calories burned
  - Heart rate
  - Stress relief score
- ✅ Source: Google Fit, Apple Health, Samsung Health

**For Private Vehicle:**
- ✅ Speed analysis:
  - Average speed
  - Maximum speed
  - Speed violations
  - Real-time tracking data

#### Fraud Detection Results (NEW!)
- ✅ **Confidence Score**: 0-100 (higher = more legitimate)
- ✅ **Fraud Score**: 0-100 (higher = more suspicious)
- ✅ **Status**: verified, warning, suspicious, rejected
- ✅ **Flags**: List of suspicious indicators
- ✅ **Checks Performed**:
  1. Speed Anomaly Detection
  2. Route Deviation Check
  3. Time-Distance Ratio Validation
  4. GPS Accuracy Check
  5. Movement Pattern Analysis
  6. Sensor Fusion Validation

#### EcoScore Breakdown
- **Mode Component** (30%)
- **Efficiency Component** (30%)
- **Behavior Component** (20%)
- **Weather Component** (10%)
- **Verification Component** (10%)
- **Fitness Bonus** (up to +20)
- **Total EcoScore**: 0-120

#### Rewards to be Awarded
- **Carbon Credits**: Based on formula
- **XP**: Experience points
- **CO2 Saved**: Kilograms
- **Trees Equivalent**: Trees planted

---

## Step 4: Make Decision

### Option A: Approve Trip ✅

1. Click **"Approve"** button
2. Optionally adjust EcoScore if needed
3. Confirm approval

**What Happens:**
- ✅ Trip marked as verified
- ✅ User receives carbon credits
- ✅ User receives XP
- ✅ User's stats updated
- ✅ CO2 savings recorded
- ✅ Trees planted (if threshold reached)
- ✅ Achievements checked
- ✅ Email notification sent (optional)

### Option B: Reject Trip ❌

1. Click **"Reject"** button
2. Select rejection reason:
   - Fake ticket/data
   - GPS spoofing detected
   - Phone shaking detected
   - Duplicate submission
   - Suspicious activity
   - Other (specify)
3. Confirm rejection

**What Happens:**
- ❌ Trip marked as rejected
- ❌ No rewards given
- ❌ Fraud strike added to user (3 strikes = account review)
- ❌ User notified of rejection

### Option C: Adjust EcoScore

1. Review the calculated EcoScore
2. If you think it's too high/low, adjust it
3. Provide reason for adjustment
4. Then approve

**When to Adjust:**
- Ticket shows different fare than expected
- Route seems inefficient
- Weather bonus seems excessive
- Verification data is partial

---

## 🚨 Fraud Detection Indicators

### High Risk (Reject)
- ❌ Fraud Score > 70
- ❌ Multiple speed anomalies
- ❌ Impossible location jumps
- ❌ Phone shaking detected
- ❌ GPS accuracy very poor
- ❌ Duplicate ticket
- ❌ Ticket date doesn't match trip

### Medium Risk (Manual Review)
- ⚠️ Fraud Score 40-70
- ⚠️ Some inconsistencies
- ⚠️ Partial verification data
- ⚠️ Route deviation moderate
- ⚠️ Speed slightly high

### Low Risk (Approve)
- ✅ Fraud Score < 40
- ✅ All checks passed
- ✅ Verification data complete
- ✅ Route looks normal
- ✅ Speed within limits

---

## 📊 Admin Dashboard Features

### Statistics Overview
- **Pending Verifications**: Trips waiting for review
- **Total Trips**: All trips (verified + pending + rejected)
- **Total Users**: Registered users
- **CO2 Saved**: Total carbon savings across all users

### Pending Trip List
Shows all trips with status "completed" that need verification:
- User name
- Trip mode
- Distance
- EcoScore
- Verification status
- Actions (Review button)

### Filters (Coming Soon)
- Filter by mode
- Filter by date range
- Filter by user
- Filter by fraud score
- Sort by EcoScore, distance, date

---

## 🎓 Best Practices

### 1. Check Fraud Detection First
Always review the fraud detection results before making a decision. If fraud score is high, investigate carefully.

### 2. Verify Ticket Images
For public transport:
- Check if ticket is clear and readable
- Verify date matches trip date
- Check fare is reasonable for distance
- Look for signs of editing/manipulation

### 3. Cross-Check Fitness Data
For walk/cycle:
- Steps should match distance (1300 steps/km for walk, 400 steps/km for cycle)
- Calories should be reasonable
- Heart rate should show activity
- Distance from fitness tracker should match GPS distance

### 4. Review Speed Data
For all modes:
- Average speed should be realistic for mode
- No impossible speed changes
- Speed violations should be penalized

### 5. Consider Context
- Weather conditions (rain, heat)
- Time of day (rush hour)
- Route complexity
- User's history (first trip vs regular user)

### 6. Be Fair but Strict
- Give benefit of doubt for minor inconsistencies
- Be strict on clear fraud attempts
- Adjust EcoScore if needed
- Add fraud strikes for suspicious activity

---

## 🔧 Troubleshooting

### No Pending Verifications?
1. Check if users have completed trips
2. Verify trips have status "completed"
3. Check database connection
4. Refresh the page

### Can't See Trip Details?
1. Check if trip ID is valid
2. Verify admin permissions
3. Check browser console for errors
4. Try logging out and back in

### Approve/Reject Not Working?
1. Check network connection
2. Verify admin token is valid
3. Check backend logs
4. Try refreshing the page

---

## 📝 Quick Reference

### Admin Credentials
- **Email**: admin@drivesutrago.com
- **Password**: Admin@123
- **URL**: http://localhost:5173/admin/login

### Test User (for testing)
- **Email**: test@example.com
- **Password**: Test@123

### API Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/trips/pending` - Pending trips
- `POST /api/admin/trips/:id/approve` - Approve trip
- `POST /api/admin/trips/:id/reject` - Reject trip

### Fraud Score Thresholds
- **0-20**: Legitimate (approve)
- **20-40**: Minor issues (approve with warning)
- **40-70**: Suspicious (manual review)
- **70-100**: High fraud (reject)

### EcoScore Components
- **Mode**: 30% (based on carbon emission)
- **Efficiency**: 30% (time optimization)
- **Behavior**: 20% (speed discipline)
- **Weather**: 10% (difficulty bonus)
- **Verification**: 10% (authenticity)
- **Fitness Bonus**: up to +20 points

---

## 🎯 Next Steps

1. **Refresh the admin dashboard** - You should now see 1 pending verification
2. **Click "Review"** on the test trip
3. **Review all the details** - See fraud detection, EcoScore breakdown, etc.
4. **Approve or Reject** - Test the workflow
5. **Check user stats** - Login as test user to see rewards

---

## 💡 Tips

- Review trips regularly to keep users engaged
- Use fraud detection as a guide, not absolute truth
- Adjust EcoScore when needed to be fair
- Add fraud strikes for clear violations
- Monitor patterns across multiple trips from same user
- Provide feedback to users on rejections

---

## 🚀 Ready to Verify!

Your admin dashboard is now fully functional with:
- ✅ Fraud detection integration
- ✅ OCR ticket extraction
- ✅ Transparent EcoScore breakdown
- ✅ Complete trip details
- ✅ User statistics
- ✅ Approve/Reject workflow

**Refresh your admin dashboard to see the test trip!**
