/**
 * RouteCalculator - Handles distance calculations, speed tracking, and ETA calculations
 * Provides real-time navigation data updates during live tracking
 */
class RouteCalculator {
  constructor() {
    this.speedHistory = [];
    this.maxSpeedHistorySize = 30; // Keep last 30 speed readings (about 1-2 minutes at 2-second intervals)
    this.minSpeedForETA = 1; // km/h - minimum speed to calculate meaningful ETA
  }

  /**
   * Initialize navigation data when route is first calculated
   * @param {Object} route - Route object with coordinates and distance
   * @param {Object} startPosition - Starting position {lat, lng}
   * @returns {Object} Initial navigation data
   */
  initializeNavigationData(route, startPosition) {
    return {
      totalDistance: route.distance, // meters
      coveredDistance: 0,
      remainingDistance: route.distance,
      currentSpeed: 0, // km/h
      averageSpeed: 0, // km/h
      eta: 0, // minutes
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      lastPosition: startPosition
    };
  }

  /**
   * Update navigation data with new position
   * @param {Object} currentPosition - Current GPS position {lat, lng, speed, timestamp}
   * @param {Object} route - Current route object
   * @param {Object} previousData - Previous navigation data
   * @returns {Object} Updated navigation data
   */
  updateNavigationData(currentPosition, route, previousData) {
    const now = Date.now();
    const timeDelta = (now - previousData.lastUpdateTime) / 1000; // seconds

    // Calculate distance covered since last update
    const distanceSinceLastUpdate = this.calculateDistance(
      previousData.lastPosition,
      currentPosition
    );

    // Update covered distance
    const newCoveredDistance = previousData.coveredDistance + distanceSinceLastUpdate;
    const remainingDistance = Math.max(0, previousData.totalDistance - newCoveredDistance);

    // Calculate current speed
    const currentSpeed = this.calculateCurrentSpeed(currentPosition, previousData, timeDelta);
    
    // Update speed history
    this.updateSpeedHistory(currentSpeed);
    
    // Calculate average speed
    const averageSpeed = this.calculateAverageSpeed();
    
    // Calculate ETA
    const eta = this.calculateETA(remainingDistance, averageSpeed);

    return {
      ...previousData,
      coveredDistance: newCoveredDistance,
      remainingDistance,
      currentSpeed,
      averageSpeed,
      eta,
      lastUpdateTime: now,
      lastPosition: currentPosition
    };
  }

  /**
   * Calculate current speed from position data
   * @param {Object} currentPosition - Current position with speed data
   * @param {Object} previousData - Previous navigation data
   * @param {number} timeDelta - Time since last update in seconds
   * @returns {number} Current speed in km/h
   */
  calculateCurrentSpeed(currentPosition, previousData, timeDelta) {
    // Use GPS speed if available and reliable
    if (currentPosition.speed !== null && currentPosition.speed !== undefined && currentPosition.speed >= 0) {
      return currentPosition.speed * 3.6; // Convert m/s to km/h
    }

    // Calculate speed from position change
    if (timeDelta > 0 && previousData.lastPosition) {
      const distance = this.calculateDistance(previousData.lastPosition, currentPosition);
      const speed = (distance / timeDelta) * 3.6; // km/h
      
      // Filter out unrealistic speeds (likely GPS errors)
      if (speed <= 200) { // Max reasonable speed
        return speed;
      }
    }

    return 0;
  }

  /**
   * Update speed history for average calculations
   * @param {number} speed - Current speed in km/h
   */
  updateSpeedHistory(speed) {
    // Only add meaningful speeds (ignore very low speeds that might be GPS noise)
    if (speed > 0.5) {
      this.speedHistory.push({
        speed,
        timestamp: Date.now()
      });

      // Keep only recent history
      if (this.speedHistory.length > this.maxSpeedHistorySize) {
        this.speedHistory.shift();
      }
    }
  }

  /**
   * Calculate average speed from recent history
   * @returns {number} Average speed in km/h
   */
  calculateAverageSpeed() {
    if (this.speedHistory.length === 0) {
      return 0;
    }

    // Use weighted average giving more weight to recent speeds
    let totalWeight = 0;
    let weightedSum = 0;

    this.speedHistory.forEach((entry, index) => {
      const weight = index + 1; // More recent entries get higher weight
      totalWeight += weight;
      weightedSum += entry.speed * weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate ETA based on remaining distance and average speed
   * @param {number} remainingDistance - Remaining distance in meters
   * @param {number} averageSpeed - Average speed in km/h
   * @returns {number} ETA in minutes
   */
  calculateETA(remainingDistance, averageSpeed) {
    if (remainingDistance <= 0) {
      return 0;
    }

    if (averageSpeed < this.minSpeedForETA) {
      // If speed is too low, use a default assumption or return a large ETA
      return 999; // Large number to indicate unknown ETA
    }

    // Convert remaining distance to km and calculate time
    const remainingKm = remainingDistance / 1000;
    const etaHours = remainingKm / averageSpeed;
    const etaMinutes = etaHours * 60;

    // Apply smoothing to avoid rapid ETA changes
    return this.smoothETA(etaMinutes);
  }

  /**
   * Smooth ETA to avoid rapid fluctuations
   * @param {number} newETA - New calculated ETA in minutes
   * @returns {number} Smoothed ETA in minutes
   */
  smoothETA(newETA) {
    if (!this.lastETA) {
      this.lastETA = newETA;
      return newETA;
    }

    // Use exponential smoothing
    const smoothingFactor = 0.3; // Adjust for more/less smoothing
    const smoothedETA = (smoothingFactor * newETA) + ((1 - smoothingFactor) * this.lastETA);
    
    this.lastETA = smoothedETA;
    return smoothedETA;
  }

  /**
   * Calculate distance along route from start to current position
   * @param {Object} currentPosition - Current position {lat, lng}
   * @param {Object} route - Route object with coordinates
   * @returns {number} Distance covered in meters
   */
  calculateDistanceAlongRoute(currentPosition, route) {
    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return 0;
    }

    // Find the closest point on the route to current position
    let closestIndex = 0;
    let minDistance = Infinity;

    route.coordinates.forEach((coord, index) => {
      const distance = this.calculateDistance(
        currentPosition,
        { lat: coord[0], lng: coord[1] }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Calculate distance from start to closest point
    let distanceAlongRoute = 0;
    for (let i = 1; i <= closestIndex; i++) {
      distanceAlongRoute += this.calculateDistance(
        { lat: route.coordinates[i-1][0], lng: route.coordinates[i-1][1] },
        { lat: route.coordinates[i][0], lng: route.coordinates[i][1] }
      );
    }

    return distanceAlongRoute;
  }

  /**
   * Calculate progress percentage
   * @param {number} coveredDistance - Distance covered in meters
   * @param {number} totalDistance - Total route distance in meters
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(coveredDistance, totalDistance) {
    if (totalDistance <= 0) {
      return 0;
    }
    
    return Math.min(100, Math.max(0, (coveredDistance / totalDistance) * 100));
  }

  /**
   * Get route segment that has been covered
   * @param {Object} route - Route object with coordinates
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Array} Array of coordinates for covered segment
   */
  getCoveredRouteSegment(route, progress) {
    if (!route || !route.coordinates || progress <= 0) {
      return [];
    }

    const segmentLength = Math.floor((progress / 100) * route.coordinates.length);
    return route.coordinates.slice(0, segmentLength);
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
   * Reset calculator state (useful when starting new navigation)
   */
  reset() {
    this.speedHistory = [];
    this.lastETA = null;
  }

  /**
   * Get current statistics
   * @returns {Object} Current calculator statistics
   */
  getStatistics() {
    return {
      speedHistorySize: this.speedHistory.length,
      averageSpeed: this.calculateAverageSpeed(),
      lastETA: this.lastETA
    };
  }
}

export { RouteCalculator };