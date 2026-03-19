/**
 * Web Sensor Service — Browser-native step counter using DeviceMotion API
 * Replaces Google Fit for walk/cycle verification (free, no API keys, works on mobile)
 * Falls back to simulated data on desktop/unsupported browsers
 */

class WebSensorService {
  constructor() {
    this.isTracking = false;
    this.steps = 0;
    this.startTime = null;
    this.lastPeak = 0;
    this.lastMagnitude = 0;
    this.magnitudeHistory = [];
    this.isSupported = false;
    this.permissionGranted = false;
    this.onStepUpdate = null; // callback for real-time updates
    this._boundHandler = this._handleMotion.bind(this);

    // Step detection parameters
    this.STEP_THRESHOLD = 1.2;    // Minimum acceleration magnitude change for a step
    this.STEP_COOLDOWN = 250;     // Minimum ms between steps (prevents double counting)
    this.SMOOTHING_WINDOW = 5;    // Moving average window
  }

  /**
   * Check if device motion is supported (mostly mobile browsers)
   */
  async checkSupport() {
    // Check for DeviceMotionEvent support
    if (!('DeviceMotionEvent' in window)) {
      console.warn('DeviceMotion not supported');
      this.isSupported = false;
      return false;
    }

    // iOS 13+ requires permission request
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        this.permissionGranted = permission === 'granted';
        this.isSupported = this.permissionGranted;
        return this.permissionGranted;
      } catch (err) {
        console.warn('DeviceMotion permission denied:', err);
        this.isSupported = false;
        return false;
      }
    }

    // Android & other — no permission needed
    this.isSupported = true;
    this.permissionGranted = true;
    return true;
  }

  /**
   * Start counting steps
   * @param {function} onUpdate - callback(stats) called on each step
   * @returns {{ success: boolean, provider: string }}
   */
  async start(onUpdate) {
    if (this.isTracking) return { success: true, provider: 'web_sensor' };

    const supported = await this.checkSupport();

    if (!supported) {
      console.log('DeviceMotion not available, using simulated step counter');
      return this._startSimulated(onUpdate);
    }

    this.steps = 0;
    this.startTime = Date.now();
    this.lastPeak = 0;
    this.lastMagnitude = 0;
    this.magnitudeHistory = [];
    this.onStepUpdate = onUpdate;
    this.isTracking = true;

    window.addEventListener('devicemotion', this._boundHandler, true);

    return { success: true, provider: 'web_sensor' };
  }

  /**
   * Stop counting and return final fitness data
   */
  stop() {
    if (!this.isTracking) return this._getStats();

    this.isTracking = false;
    window.removeEventListener('devicemotion', this._boundHandler, true);

    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = null;
    }

    return this._getStats();
  }

  /**
   * Handle incoming accelerometer data
   */
  _handleMotion(event) {
    if (!this.isTracking) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null) return;

    // Calculate acceleration magnitude
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    // Add to history for smoothing
    this.magnitudeHistory.push(magnitude);
    if (this.magnitudeHistory.length > this.SMOOTHING_WINDOW) {
      this.magnitudeHistory.shift();
    }

    // Calculate smoothed magnitude (moving average)
    const smoothed = this.magnitudeHistory.reduce((a, b) => a + b, 0) / this.magnitudeHistory.length;

    // Peak detection algorithm for step counting
    // A step = a peak in acceleration magnitude above threshold
    const now = Date.now();
    const delta = Math.abs(smoothed - this.lastMagnitude);

    if (
      delta > this.STEP_THRESHOLD &&
      smoothed > 10 && // Above resting gravity (~9.8)
      (now - this.lastPeak) > this.STEP_COOLDOWN
    ) {
      this.steps++;
      this.lastPeak = now;

      // Notify listener
      if (this.onStepUpdate) {
        this.onStepUpdate(this._getStats());
      }
    }

    this.lastMagnitude = smoothed;
  }

  /**
   * Start simulated step counting (for desktop/unsupported browsers)
   */
  _startSimulated(onUpdate) {
    this.steps = 0;
    this.startTime = Date.now();
    this.onStepUpdate = onUpdate;
    this.isTracking = true;

    // Simulate ~90 steps/minute (average walking pace)
    this._simulationInterval = setInterval(() => {
      if (!this.isTracking) return;
      this.steps += Math.floor(Math.random() * 3) + 1; // 1-3 steps per tick
      if (this.onStepUpdate) {
        this.onStepUpdate(this._getStats());
      }
    }, 700); // ~90 steps/min

    return { success: true, provider: 'simulated' };
  }

  /**
   * Get current fitness statistics
   */
  _getStats() {
    const durationMs = this.startTime ? Date.now() - this.startTime : 0;
    const durationMinutes = durationMs / 1000 / 60;
    const durationHours = durationMinutes / 60;

    // Estimate distance: average stride length ~0.75m
    const distance = (this.steps * 0.75) / 1000; // km

    // Estimate calories: ~0.04 cal per step (walking)
    const calories = Math.round(this.steps * 0.04);

    // Estimate heart rate based on intensity (steps/min)
    const stepsPerMin = durationMinutes > 0 ? this.steps / durationMinutes : 0;
    let avgHeartRate = 72; // resting
    if (stepsPerMin > 100) avgHeartRate = 120 + Math.floor(Math.random() * 15);
    else if (stepsPerMin > 60) avgHeartRate = 100 + Math.floor(Math.random() * 15);
    else if (stepsPerMin > 30) avgHeartRate = 85 + Math.floor(Math.random() * 10);

    const maxHeartRate = avgHeartRate + Math.floor(Math.random() * 15) + 5;
    const pace = distance > 0 ? this.steps / distance : 0;
    const caloriesPerKm = distance > 0 ? calories / distance : 0;
    const stressRelief = this._calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance);
    const fitnessScore = this._calculateFitnessScore(this.steps, distance, calories, avgHeartRate, stressRelief);

    return {
      steps: this.steps,
      distance: Math.round(distance * 100) / 100,
      calories,
      avgHeartRate,
      maxHeartRate,
      pace: Math.round(pace),
      caloriesPerKm: Math.round(caloriesPerKm),
      stressRelief,
      fitnessScore,
      isValid: this.steps > 0 || distance > 0,
      provider: this.isSupported ? 'web_sensor' : 'simulated',
      durationMinutes: Math.round(durationMinutes)
    };
  }

  _calculateStressRelief(avgHeartRate, maxHeartRate, calories, distance) {
    let score = 0;
    if (calories > 0) score += Math.min(30, calories / 10);
    if (avgHeartRate >= 100 && avgHeartRate <= 140) score += 25;
    else if (avgHeartRate >= 80 && avgHeartRate <= 160) score += 15;
    else score += 5;
    if (distance > 0) score += Math.min(25, distance * 5);
    if (distance > 2) score += 10;
    if (distance > 5) score += 10;
    return Math.min(100, Math.round(score));
  }

  _calculateFitnessScore(steps, distance, calories, avgHeartRate, stressRelief) {
    let score = 0;
    if (steps > 0) score += Math.min(30, steps / 100);
    if (distance > 0) score += Math.min(25, distance * 10);
    if (calories > 0) score += Math.min(25, calories / 10);
    if (avgHeartRate >= 100 && avgHeartRate <= 140) score += 20;
    else if (avgHeartRate >= 80 && avgHeartRate <= 160) score += 15;
    else score += 10;
    return Math.min(100, Math.round(score));
  }

  /**
   * Get provider name
   */
  getProvider() {
    return this.isSupported ? 'web_sensor' : 'simulated';
  }

  /**
   * Check if currently tracking
   */
  isActive() {
    return this.isTracking;
  }
}

export default new WebSensorService();
