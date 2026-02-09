// Real-time GPS location tracking service for trip monitoring
class LocationTrackingService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.locationHistory = [];
    this.currentSpeed = 0;
    this.maxSpeed = 0;
    this.totalDistance = 0;
    this.lastPosition = null;
    this.onLocationUpdate = null;
    this.onSpeedUpdate = null;
    this.onError = null;
  }

  // Start tracking location
  startTracking(callbacks = {}) {
    if (this.isTracking) {
      console.warn('Location tracking already active');
      return;
    }

    this.onLocationUpdate = callbacks.onLocationUpdate;
    this.onSpeedUpdate = callbacks.onSpeedUpdate;
    this.onError = callbacks.onError;

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleError(error),
      options
    );

    this.isTracking = true;
    console.log('📍 Location tracking started');
  }

  // Stop tracking location
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    console.log('📍 Location tracking stopped');

    return this.getTripSummary();
  }

  // Handle location update
  handleLocationUpdate(position) {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    const timestamp = position.timestamp;

    const locationData = {
      lat: latitude,
      lng: longitude,
      accuracy,
      speed: speed || 0, // m/s
      heading: heading || 0,
      timestamp
    };

    // Calculate distance from last position
    if (this.lastPosition) {
      const distance = this.calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        latitude,
        longitude
      );
      this.totalDistance += distance;
    }

    // Update speed tracking
    if (speed !== null) {
      this.currentSpeed = speed * 3.6; // Convert m/s to km/h
      this.maxSpeed = Math.max(this.maxSpeed, this.currentSpeed);

      if (this.onSpeedUpdate) {
        this.onSpeedUpdate({
          current: this.currentSpeed,
          max: this.maxSpeed,
          average: this.calculateAverageSpeed()
        });
      }
    }

    // Store location in history
    this.locationHistory.push(locationData);
    this.lastPosition = locationData;

    // Callback with location data
    if (this.onLocationUpdate) {
      this.onLocationUpdate({
        ...locationData,
        totalDistance: this.totalDistance,
        currentSpeed: this.currentSpeed
      });
    }
  }

  // Handle location error
  handleError(error) {
    console.error('Location tracking error:', error);
    
    const errorMessages = {
      1: 'Location permission denied',
      2: 'Location unavailable',
      3: 'Location request timeout'
    };

    if (this.onError) {
      this.onError({
        code: error.code,
        message: errorMessages[error.code] || 'Unknown error'
      });
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate average speed
  calculateAverageSpeed() {
    if (this.locationHistory.length < 2) return 0;

    const firstLocation = this.locationHistory[0];
    const lastLocation = this.locationHistory[this.locationHistory.length - 1];
    const timeElapsed = (lastLocation.timestamp - firstLocation.timestamp) / 1000 / 3600; // hours

    return timeElapsed > 0 ? this.totalDistance / timeElapsed : 0;
  }

  // Get trip summary
  getTripSummary() {
    return {
      totalDistance: this.totalDistance,
      maxSpeed: this.maxSpeed,
      averageSpeed: this.calculateAverageSpeed(),
      locationHistory: this.locationHistory,
      duration: this.locationHistory.length > 0
        ? (this.locationHistory[this.locationHistory.length - 1].timestamp - this.locationHistory[0].timestamp) / 1000 / 60
        : 0
    };
  }

  // Get current location once
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Check if geolocation is supported
  static isSupported() {
    return 'geolocation' in navigator;
  }

  // Request location permission
  static async requestPermission() {
    if (!LocationTrackingService.isSupported()) {
      throw new Error('Geolocation not supported');
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      // Fallback: try to get location to trigger permission prompt
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (error) => {
            if (error.code === 1) resolve('denied');
            else reject(error);
          }
        );
      });
    }
  }

  // Reset tracking data
  reset() {
    this.locationHistory = [];
    this.currentSpeed = 0;
    this.maxSpeed = 0;
    this.totalDistance = 0;
    this.lastPosition = null;
  }
}

export default new LocationTrackingService();
