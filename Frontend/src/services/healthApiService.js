// Universal Health API service supporting Google Fit, Apple HealthKit, and Samsung Health
import googleFitService from './googleFitService';

class HealthApiService {
  constructor() {
    this.provider = null; // 'google', 'apple', 'samsung', or null
    this.isConnected = false;
  }

  // Detect available health API
  async detectProvider() {
    // Check for Apple HealthKit (iOS Safari/WebView)
    if (window.webkit?.messageHandlers?.healthKit) {
      this.provider = 'apple';
      return 'apple';
    }

    // Check for Samsung Health (Samsung Internet)
    if (window.samsungHealth) {
      this.provider = 'samsung';
      return 'samsung';
    }

    // Default to Google Fit (works on most browsers)
    this.provider = 'google';
    return 'google';
  }

  // Connect to health API
  async connect() {
    if (!this.provider) {
      await this.detectProvider();
    }

    try {
      switch (this.provider) {
        case 'google':
          const result = await googleFitService.connectGoogleFit();
          this.isConnected = result?.success || false;
          return result;

        case 'apple':
          return await this.connectAppleHealthKit();

        case 'samsung':
          return await this.connectSamsungHealth();

        default:
          throw new Error('No health API available');
      }
    } catch (error) {
      console.error('Health API connection failed:', error);
      return null;
    }
  }

  // Connect to Apple HealthKit
  async connectAppleHealthKit() {
    return new Promise((resolve) => {
      if (!window.webkit?.messageHandlers?.healthKit) {
        resolve({ success: false, error: 'HealthKit not available' });
        return;
      }

      // Request HealthKit authorization
      window.webkit.messageHandlers.healthKit.postMessage({
        action: 'requestAuthorization',
        types: ['steps', 'distance', 'calories', 'heartRate']
      });

      // Listen for response
      window.addEventListener('healthKitAuthorized', (event) => {
        this.isConnected = event.detail.success;
        resolve(event.detail);
      }, { once: true });
    });
  }

  // Connect to Samsung Health
  async connectSamsungHealth() {
    if (!window.samsungHealth) {
      return { success: false, error: 'Samsung Health not available' };
    }

    try {
      await window.samsungHealth.connect();
      this.isConnected = true;
      return { success: true, provider: 'samsung' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get fitness data for trip verification
  async getFitnessData(startTime, endTime) {
    if (!this.isConnected) {
      console.warn('Health API not connected');
      return null;
    }

    try {
      switch (this.provider) {
        case 'google':
          return await googleFitService.getFitnessData(startTime, endTime);

        case 'apple':
          return await this.getAppleHealthData(startTime, endTime);

        case 'samsung':
          return await this.getSamsungHealthData(startTime, endTime);

        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to get fitness data:', error);
      return null;
    }
  }

  // Get Apple HealthKit data
  async getAppleHealthData(startTime, endTime) {
    return new Promise((resolve) => {
      window.webkit.messageHandlers.healthKit.postMessage({
        action: 'queryData',
        startTime,
        endTime,
        types: ['steps', 'distance', 'calories', 'heartRate']
      });

      window.addEventListener('healthKitData', (event) => {
        const data = event.detail;
        resolve(this.processHealthData(data, 'apple'));
      }, { once: true });
    });
  }

  // Get Samsung Health data
  async getSamsungHealthData(startTime, endTime) {
    try {
      const data = await window.samsungHealth.readData({
        dataType: ['steps', 'distance', 'calories', 'heartRate'],
        startTime,
        endTime
      });

      return this.processHealthData(data, 'samsung');
    } catch (error) {
      console.error('Samsung Health data fetch failed:', error);
      return null;
    }
  }

  // Process health data from different providers
  processHealthData(data, provider) {
    let steps = 0;
    let distance = 0;
    let calories = 0;
    let avgHeartRate = 0;
    let maxHeartRate = 0;

    switch (provider) {
      case 'apple':
        steps = data.steps || 0;
        distance = (data.distance || 0) / 1000; // Convert to km
        calories = data.calories || 0;
        avgHeartRate = data.avgHeartRate || 0;
        maxHeartRate = data.maxHeartRate || 0;
        break;

      case 'samsung':
        steps = data.stepCount || 0;
        distance = (data.distance || 0) / 1000;
        calories = data.caloriesBurned || 0;
        avgHeartRate = data.heartRate?.average || 0;
        maxHeartRate = data.heartRate?.max || 0;
        break;

      default:
        return data; // Google Fit already processed
    }

    // Calculate additional metrics
    const pace = distance > 0 ? steps / distance : 0;
    const caloriesPerKm = distance > 0 ? calories / distance : 0;
    const stressRelief = this.calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance);
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
      isValid: steps > 0 || distance > 0 || calories > 0,
      provider
    };
  }

  // Calculate stress relief score (0-100)
  calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance) {
    let stressScore = 0;

    if (calories > 0) {
      stressScore += Math.min(30, calories / 10);
    }

    if (avgHeartRate > 0) {
      if (avgHeartRate >= 100 && avgHeartRate <= 140) {
        stressScore += 25;
      } else if (avgHeartRate >= 80 && avgHeartRate <= 160) {
        stressScore += 15;
      } else {
        stressScore += 5;
      }
    }

    if (distance > 0) {
      stressScore += Math.min(25, distance * 5);
    }

    if (distance > 2) stressScore += 10;
    if (distance > 5) stressScore += 10;

    return Math.min(100, Math.round(stressScore));
  }

  // Calculate fitness score (0-100)
  calculateFitnessScore(steps, distance, calories, avgHeartRate, stressRelief) {
    let score = 0;

    if (steps > 0) {
      score += Math.min(30, steps / 100);
    }

    if (distance > 0) {
      score += Math.min(25, distance * 10);
    }

    if (calories > 0) {
      score += Math.min(25, calories / 10);
    }

    if (avgHeartRate > 0) {
      if (avgHeartRate >= 100 && avgHeartRate <= 140) {
        score += 20;
      } else if (avgHeartRate >= 80 && avgHeartRate <= 160) {
        score += 15;
      } else {
        score += 10;
      }
    }

    return Math.min(100, Math.round(score));
  }

  // Verify trip data against health data
  verifyTripData(tripDistance, tripDuration, fitnessData) {
    if (!fitnessData || !fitnessData.isValid) {
      return {
        verified: false,
        confidence: 0,
        reason: 'No fitness data available'
      };
    }

    const distanceDiff = Math.abs(tripDistance - fitnessData.distance);
    const distanceMatch = distanceDiff < tripDistance * 0.3;

    let confidence = 0;

    if (distanceMatch) confidence += 40;
    if (fitnessData.steps > tripDistance * 1000) confidence += 30;
    if (fitnessData.calories > tripDistance * 30) confidence += 20;
    if (fitnessData.avgHeartRate > 80) confidence += 10;

    return {
      verified: confidence >= 60,
      confidence,
      fitnessData,
      distanceMatch,
      reason: confidence >= 60 ? 'Trip verified with fitness data' : 'Fitness data doesn\'t match trip'
    };
  }

  // Get provider name
  getProvider() {
    return this.provider;
  }

  // Check if connected
  isHealthApiConnected() {
    return this.isConnected;
  }
}

export default new HealthApiService();
