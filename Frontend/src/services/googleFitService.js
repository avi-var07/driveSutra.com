// Google Fit API integration for fitness data verification
class GoogleFitService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
  }

  // Initialize Google Fit API
  async initialize() {
    try {
      if (typeof gapi === 'undefined') {
        console.error('Google API not loaded');
        return false;
      }

      await new Promise((resolve) => {
        gapi.load('auth2', resolve);
      });

      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        await gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read'
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Fit:', error);
      return false;
    }
  }

  // Request permission and connect to Google Fit
  async connectGoogleFit() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        return {
          success: true,
          accessToken: this.accessToken,
          profile: user.getBasicProfile()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to connect Google Fit:', error);
      return null;
    }
  }

  // Get fitness data for trip verification
  async getFitnessData(startTime, endTime) {
    try {
      if (!this.accessToken) {
        throw new Error('Not connected to Google Fit');
      }

      const startTimeNanos = startTime * 1000000; // Convert to nanoseconds
      const endTimeNanos = endTime * 1000000;

      // Get step count data
      const stepsResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.step_count.delta',
                dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
              }
            ],
            bucketByTime: { durationMillis: endTime - startTime },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          })
        }
      );

      // Get distance data
      const distanceResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.distance.delta',
                dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'
              }
            ],
            bucketByTime: { durationMillis: endTime - startTime },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          })
        }
      );

      // Get calories data
      const caloriesResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.calories.expended',
                dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
              }
            ],
            bucketByTime: { durationMillis: endTime - startTime },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          })
        }
      );

      // Get heart rate data for stress calculation
      const heartRateResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.heart_rate.bpm',
                dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm'
              }
            ],
            bucketByTime: { durationMillis: endTime - startTime },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          })
        }
      );

      const [stepsData, distanceData, caloriesData, heartRateData] = await Promise.all([
        stepsResponse.json(),
        distanceResponse.json(),
        caloriesResponse.json(),
        heartRateResponse.json()
      ]);

      return this.processFitnessData(stepsData, distanceData, caloriesData, heartRateData);
    } catch (error) {
      console.error('Failed to get fitness data:', error);
      return null;
    }
  }

  // Process and calculate fitness metrics
  processFitnessData(stepsData, distanceData, caloriesData, heartRateData) {
    try {
      // Extract step count
      const steps = stepsData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
      
      // Extract distance (in meters, convert to km)
      const distanceMeters = distanceData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
      const distance = distanceMeters / 1000;
      
      // Extract calories
      const calories = caloriesData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
      
      // Extract heart rate data
      const heartRatePoints = heartRateData.bucket?.[0]?.dataset?.[0]?.point || [];
      const heartRates = heartRatePoints.map(point => point.value[0].fpVal);
      const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length : 0;
      const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : 0;

      // Calculate additional metrics
      const pace = distance > 0 ? (steps / distance) : 0; // steps per km
      const caloriesPerKm = distance > 0 ? (calories / distance) : 0;
      
      // Estimate stress relief based on heart rate variability and activity
      const stressRelief = this.calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance);
      
      // Calculate fitness score based on multiple factors
      const fitnessScore = this.calculateFitnessScore(steps, distance, calories, avgHeartRate, stressRelief);

      return {
        steps,
        distance,
        calories,
        avgHeartRate,
        maxHeartRate,
        pace,
        caloriesPerKm,
        stressRelief,
        fitnessScore,
        isValid: steps > 0 || distance > 0 || calories > 0
      };
    } catch (error) {
      console.error('Failed to process fitness data:', error);
      return null;
    }
  }

  // Calculate stress relief score (0-100)
  calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance) {
    let stressScore = 0;
    
    // Base score from physical activity
    if (calories > 0) {
      stressScore += Math.min(30, calories / 10); // Up to 30 points for calories
    }
    
    // Heart rate contribution (moderate exercise is best for stress relief)
    if (avgHeartRate > 0) {
      if (avgHeartRate >= 100 && avgHeartRate <= 140) {
        stressScore += 25; // Optimal heart rate zone
      } else if (avgHeartRate >= 80 && avgHeartRate <= 160) {
        stressScore += 15; // Good heart rate zone
      } else {
        stressScore += 5; // Some activity is better than none
      }
    }
    
    // Distance contribution
    if (distance > 0) {
      stressScore += Math.min(25, distance * 5); // Up to 25 points for distance
    }
    
    // Duration bonus (longer activities = more stress relief)
    if (distance > 2) stressScore += 10; // Bonus for longer activities
    if (distance > 5) stressScore += 10; // Additional bonus
    
    return Math.min(100, Math.round(stressScore));
  }

  // Calculate overall fitness score for eco-score enhancement
  calculateFitnessScore(steps, distance, calories, avgHeartRate, stressRelief) {
    let score = 0;
    
    // Steps contribution (up to 30 points)
    if (steps > 0) {
      score += Math.min(30, steps / 100); // 1 point per 100 steps, max 30
    }
    
    // Distance contribution (up to 25 points)
    if (distance > 0) {
      score += Math.min(25, distance * 10); // 10 points per km, max 25
    }
    
    // Calories contribution (up to 25 points)
    if (calories > 0) {
      score += Math.min(25, calories / 10); // 1 point per 10 calories, max 25
    }
    
    // Heart rate efficiency (up to 20 points)
    if (avgHeartRate > 0) {
      if (avgHeartRate >= 100 && avgHeartRate <= 140) {
        score += 20; // Optimal zone
      } else if (avgHeartRate >= 80 && avgHeartRate <= 160) {
        score += 15; // Good zone
      } else {
        score += 10; // Some activity
      }
    }
    
    return Math.min(100, Math.round(score));
  }

  // Verify trip data against Google Fit data
  verifyTripData(tripDistance, tripDuration, fitnessData) {
    if (!fitnessData || !fitnessData.isValid) {
      return {
        verified: false,
        confidence: 0,
        reason: 'No fitness data available'
      };
    }

    const distanceDiff = Math.abs(tripDistance - fitnessData.distance);
    const distanceMatch = distanceDiff < (tripDistance * 0.3); // Allow 30% variance
    
    // Calculate confidence based on data consistency
    let confidence = 0;
    
    if (distanceMatch) confidence += 40;
    if (fitnessData.steps > tripDistance * 1000) confidence += 30; // Reasonable steps for distance
    if (fitnessData.calories > tripDistance * 30) confidence += 20; // Reasonable calories for distance
    if (fitnessData.avgHeartRate > 80) confidence += 10; // Shows physical activity
    
    return {
      verified: confidence >= 60,
      confidence,
      fitnessData,
      distanceMatch,
      reason: confidence >= 60 ? 'Trip verified with fitness data' : 'Fitness data doesn\'t match trip'
    };
  }
}

export default new GoogleFitService();