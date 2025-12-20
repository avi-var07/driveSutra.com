/**
 * GPSTracker - Handles real-time GPS tracking using browser Geolocation API
 * Provides smooth position updates with error handling and position filtering
 */
class GPSTracker {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.lastPosition = null;
    this.positionHistory = [];
    this.maxHistorySize = 10;
    
    // GPS tracking options
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 1000 // 1 second
    };
    
    // Position filtering settings
    this.minAccuracy = 100; // meters - ignore positions with accuracy worse than this
    this.minDistanceThreshold = 2; // meters - minimum distance to consider as movement
    this.maxSpeedThreshold = 200; // km/h - maximum reasonable speed (filters GPS jumps)
  }

  /**
   * Start GPS tracking
   * @param {Function} onPositionUpdate - Callback for position updates
   * @param {Function} onError - Callback for errors
   */
  startTracking(onPositionUpdate, onError) {
    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return;
    }

    this.isTracking = true;
    this.onPositionUpdate = onPositionUpdate;
    this.onError = onError;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleError(error),
      this.options
    );

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleError(error),
      this.options
    );

    console.log('GPS tracking started');
  }

  /**
   * Stop GPS tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
    this.lastPosition = null;
    this.positionHistory = [];
    
    console.log('GPS tracking stopped');
  }

  /**
   * Handle position updates from the browser
   * @param {GeolocationPosition} position - Browser geolocation position
   */
  handlePositionUpdate(position) {
    const coords = position.coords;
    
    // Create position object
    const newPosition = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed, // m/s
      timestamp: position.timestamp
    };

    // Filter position based on accuracy and movement
    if (this.shouldAcceptPosition(newPosition)) {
      // Add to history
      this.addToHistory(newPosition);
      
      // Update last position
      this.lastPosition = newPosition;
      
      // Calculate additional data
      const enhancedPosition = this.enhancePosition(newPosition);
      
      // Notify callback
      if (this.onPositionUpdate) {
        this.onPositionUpdate(enhancedPosition);
      }
    }
  }

  /**
   * Handle GPS errors
   * @param {GeolocationPositionError} error - Geolocation error
   */
  handleError(error) {
    let errorMessage = 'Unknown GPS error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'GPS access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'GPS position unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'GPS request timed out';
        break;
    }

    console.error('GPS Error:', errorMessage, error);
    
    if (this.onError) {
      this.onError(new Error(errorMessage));
    }
  }

  /**
   * Determine if a position should be accepted based on filtering criteria
   * @param {Object} position - Position object
   * @returns {boolean} True if position should be accepted
   */
  shouldAcceptPosition(position) {
    // Check accuracy
    if (position.accuracy > this.minAccuracy) {
      console.warn(`Position rejected: poor accuracy (${position.accuracy}m)`);
      return false;
    }

    // If no previous position, accept this one
    if (!this.lastPosition) {
      return true;
    }

    // Calculate distance from last position
    const distance = this.calculateDistance(this.lastPosition, position);
    
    // Check minimum movement threshold
    if (distance < this.minDistanceThreshold) {
      return false; // Too small movement, likely GPS noise
    }

    // Check for unrealistic speed (GPS jumps)
    const timeDiff = (position.timestamp - this.lastPosition.timestamp) / 1000; // seconds
    if (timeDiff > 0) {
      const speed = (distance / timeDiff) * 3.6; // km/h
      if (speed > this.maxSpeedThreshold) {
        console.warn(`Position rejected: unrealistic speed (${speed.toFixed(1)} km/h)`);
        return false;
      }
    }

    return true;
  }

  /**
   * Add position to history for smoothing and calculations
   * @param {Object} position - Position object
   */
  addToHistory(position) {
    this.positionHistory.push(position);
    
    // Keep only recent positions
    if (this.positionHistory.length > this.maxHistorySize) {
      this.positionHistory.shift();
    }
  }

  /**
   * Enhance position with calculated data
   * @param {Object} position - Base position object
   * @returns {Object} Enhanced position with additional data
   */
  enhancePosition(position) {
    const enhanced = { ...position };
    
    // Calculate speed if not provided by GPS
    if (enhanced.speed === null || enhanced.speed === undefined) {
      enhanced.speed = this.calculateSpeed();
    }
    
    // Convert speed from m/s to km/h
    enhanced.speedKmh = enhanced.speed ? enhanced.speed * 3.6 : 0;
    
    // Calculate heading if not provided
    if (enhanced.heading === null || enhanced.heading === undefined) {
      enhanced.heading = this.calculateHeading();
    }
    
    // Add smoothed position
    enhanced.smoothedPosition = this.getSmoothPosition();
    
    return enhanced;
  }

  /**
   * Calculate current speed based on position history
   * @returns {number} Speed in m/s
   */
  calculateSpeed() {
    if (this.positionHistory.length < 2) {
      return 0;
    }

    const recent = this.positionHistory.slice(-3); // Use last 3 positions for smoothing
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < recent.length; i++) {
      const distance = this.calculateDistance(recent[i-1], recent[i]);
      const time = (recent[i].timestamp - recent[i-1].timestamp) / 1000;
      
      totalDistance += distance;
      totalTime += time;
    }

    return totalTime > 0 ? totalDistance / totalTime : 0;
  }

  /**
   * Calculate heading based on movement direction
   * @returns {number} Heading in degrees (0-360)
   */
  calculateHeading() {
    if (this.positionHistory.length < 2) {
      return 0;
    }

    const current = this.positionHistory[this.positionHistory.length - 1];
    const previous = this.positionHistory[this.positionHistory.length - 2];

    return this.calculateBearing(previous, current);
  }

  /**
   * Get smoothed position using weighted average
   * @returns {Object} Smoothed position
   */
  getSmoothPosition() {
    if (this.positionHistory.length === 0) {
      return null;
    }

    if (this.positionHistory.length === 1) {
      return this.positionHistory[0];
    }

    // Use weighted average of recent positions (more weight to recent positions)
    const recent = this.positionHistory.slice(-5);
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    recent.forEach((pos, index) => {
      const weight = index + 1; // More recent positions get higher weight
      totalWeight += weight;
      weightedLat += pos.lat * weight;
      weightedLng += pos.lng * weight;
    });

    return {
      lat: weightedLat / totalWeight,
      lng: weightedLng / totalWeight
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {Object} point1 - {lat, lng}
   * @param {Object} point2 - {lat, lng}
   * @returns {number} Distance in meters
   */
  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Calculate bearing between two points
   * @param {Object} point1 - {lat, lng}
   * @param {Object} point2 - {lat, lng}
   * @returns {number} Bearing in degrees
   */
  calculateBearing(point1, point2) {
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360;
  }

  /**
   * Get current tracking status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      hasPosition: this.lastPosition !== null,
      accuracy: this.lastPosition ? this.lastPosition.accuracy : null,
      historySize: this.positionHistory.length
    };
  }
}

export { GPSTracker };