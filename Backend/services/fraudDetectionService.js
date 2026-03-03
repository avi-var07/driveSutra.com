/**
 * fraudDetectionService.js
 * Advanced fraud detection for trip verification
 * Prevents GPS spoofing, phone shaking, and other cheating methods
 */

/**
 * Validate trip using multiple fraud detection techniques
 * @param {Object} tripData - Trip data to validate
 * @returns {Object} Validation result with confidence score
 */
export function validateTrip(tripData) {
  const checks = [];
  let fraudScore = 0; // 0 = legitimate, 100 = definitely fraud
  const flags = [];
  
  // 1. Speed Anomaly Detection
  const speedCheck = checkSpeedAnomalies(tripData);
  checks.push(speedCheck);
  fraudScore += speedCheck.fraudScore;
  if (speedCheck.isSuspicious) flags.push(speedCheck.reason);
  
  // 2. Route Deviation Check
  const routeCheck = checkRouteDeviation(tripData);
  checks.push(routeCheck);
  fraudScore += routeCheck.fraudScore;
  if (routeCheck.isSuspicious) flags.push(routeCheck.reason);
  
  // 3. Time-Distance Ratio Validation
  const timeDistanceCheck = checkTimeDistanceRatio(tripData);
  checks.push(timeDistanceCheck);
  fraudScore += timeDistanceCheck.fraudScore;
  if (timeDistanceCheck.isSuspicious) flags.push(timeDistanceCheck.reason);
  
  // 4. GPS Accuracy Check
  const gpsCheck = checkGPSAccuracy(tripData);
  checks.push(gpsCheck);
  fraudScore += gpsCheck.fraudScore;
  if (gpsCheck.isSuspicious) flags.push(gpsCheck.reason);
  
  // 5. Movement Pattern Analysis (detects phone shaking)
  const movementCheck = checkMovementPattern(tripData);
  checks.push(movementCheck);
  fraudScore += movementCheck.fraudScore;
  if (movementCheck.isSuspicious) flags.push(movementCheck.reason);
  
  // 6. Sensor Fusion Validation
  const sensorCheck = checkSensorConsistency(tripData);
  checks.push(sensorCheck);
  fraudScore += sensorCheck.fraudScore;
  if (sensorCheck.isSuspicious) flags.push(sensorCheck.reason);
  
  // Calculate confidence score (inverse of fraud score)
  const confidenceScore = Math.max(0, 100 - fraudScore);
  
  // Determine verification status
  let status = 'verified';
  let requiresManualReview = false;
  
  if (fraudScore >= 70) {
    status = 'rejected';
  } else if (fraudScore >= 40) {
    status = 'suspicious';
    requiresManualReview = true;
  } else if (fraudScore >= 20) {
    status = 'warning';
  }
  
  return {
    isValid: fraudScore < 40,
    status,
    confidenceScore,
    fraudScore,
    requiresManualReview,
    flags,
    checks,
    recommendation: getRecommendation(fraudScore, flags)
  };
}

/**
 * Check for speed anomalies
 */
function checkSpeedAnomalies(tripData) {
  const { mode, tracking, distanceKm, actualMinutes } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  if (!tracking || !tracking.speedAnalysis) {
    return { name: 'Speed Check', fraudScore: 5, isSuspicious: false, reason: 'No speed data' };
  }
  
  const { avgSpeed, maxSpeed, currentSpeed } = tracking.speedAnalysis;
  const modeUpper = (mode || '').toUpperCase();
  
  // Define realistic speed ranges for each mode (km/h)
  const speedLimits = {
    WALK: { min: 2, max: 8, typical: 5 },
    CYCLE: { min: 8, max: 30, typical: 15 },
    CAR: { min: 10, max: 120, typical: 40 },
    BIKE: { min: 15, max: 120, typical: 50 },
    PUBLIC: { min: 10, max: 80, typical: 30 }
  };
  
  const limits = speedLimits[modeUpper] || speedLimits.CAR;
  
  // Check average speed
  if (avgSpeed > limits.max * 1.5) {
    fraudScore += 30;
    isSuspicious = true;
    reason = `Average speed (${avgSpeed.toFixed(1)} km/h) exceeds realistic limit for ${mode}`;
  } else if (avgSpeed > limits.max) {
    fraudScore += 15;
    isSuspicious = true;
    reason = `Average speed slightly high for ${mode}`;
  }
  
  // Check if speed is too consistent (sign of GPS spoofing)
  if (tracking.locationHistory && tracking.locationHistory.length > 10) {
    const speeds = tracking.locationHistory
      .filter(loc => loc.speed)
      .map(loc => loc.speed);
    
    if (speeds.length > 5) {
      const speedVariance = calculateVariance(speeds);
      if (speedVariance < 1 && avgSpeed > 5) {
        fraudScore += 20;
        isSuspicious = true;
        reason = 'Speed too consistent - possible GPS spoofing';
      }
    }
  }
  
  // Check for impossible speed changes
  if (maxSpeed > avgSpeed * 3 && modeUpper !== 'CAR' && modeUpper !== 'BIKE') {
    fraudScore += 15;
    isSuspicious = true;
    reason = 'Impossible speed variations detected';
  }
  
  return {
    name: 'Speed Anomaly Check',
    fraudScore: Math.min(fraudScore, 30),
    isSuspicious,
    reason,
    details: { avgSpeed, maxSpeed, limits }
  };
}

/**
 * Check route deviation from expected path
 */
function checkRouteDeviation(tripData) {
  const { startLocation, endLocation, tracking, distanceKm } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  if (!tracking || !tracking.locationHistory || tracking.locationHistory.length < 3) {
    return { name: 'Route Check', fraudScore: 5, isSuspicious: false, reason: 'Insufficient location data' };
  }
  
  // Calculate straight-line distance
  const straightDistance = calculateHaversineDistance(
    startLocation.lat,
    startLocation.lng,
    endLocation.lat,
    endLocation.lng
  );
  
  // Calculate actual path distance from location history
  let actualPathDistance = 0;
  for (let i = 1; i < tracking.locationHistory.length; i++) {
    const prev = tracking.locationHistory[i - 1];
    const curr = tracking.locationHistory[i];
    actualPathDistance += calculateHaversineDistance(
      prev.lat,
      prev.lng,
      curr.lat,
      curr.lng
    );
  }
  
  // Check if route is unreasonably long (possible wandering to fake distance)
  const deviationRatio = actualPathDistance / straightDistance;
  
  if (deviationRatio > 5) {
    fraudScore += 25;
    isSuspicious = true;
    reason = `Route ${deviationRatio.toFixed(1)}x longer than straight line - possible fake distance`;
  } else if (deviationRatio > 3) {
    fraudScore += 10;
    reason = 'Route significantly longer than expected';
  }
  
  // Check for stationary periods with distance increase (GPS spoofing)
  const stationaryWithMovement = detectStationaryMovement(tracking.locationHistory);
  if (stationaryWithMovement) {
    fraudScore += 20;
    isSuspicious = true;
    reason = 'Distance increased while stationary - GPS spoofing detected';
  }
  
  return {
    name: 'Route Deviation Check',
    fraudScore: Math.min(fraudScore, 25),
    isSuspicious,
    reason,
    details: { straightDistance, actualPathDistance, deviationRatio }
  };
}

/**
 * Validate time-distance ratio
 */
function checkTimeDistanceRatio(tripData) {
  const { mode, distanceKm, actualMinutes } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  if (!actualMinutes || actualMinutes === 0) {
    return { name: 'Time-Distance Check', fraudScore: 10, isSuspicious: true, reason: 'No time data' };
  }
  
  const avgSpeed = (distanceKm / actualMinutes) * 60; // km/h
  const modeUpper = (mode || '').toUpperCase();
  
  // Expected speed ranges
  const expectedSpeeds = {
    WALK: { min: 3, max: 7 },
    CYCLE: { min: 10, max: 25 },
    CAR: { min: 15, max: 100 },
    BIKE: { min: 20, max: 100 },
    PUBLIC: { min: 15, max: 60 }
  };
  
  const expected = expectedSpeeds[modeUpper] || expectedSpeeds.CAR;
  
  if (avgSpeed < expected.min * 0.5) {
    fraudScore += 15;
    isSuspicious = true;
    reason = `Trip took too long (${avgSpeed.toFixed(1)} km/h) - possible fake time`;
  } else if (avgSpeed > expected.max * 1.5) {
    fraudScore += 20;
    isSuspicious = true;
    reason = `Trip too fast (${avgSpeed.toFixed(1)} km/h) for ${mode}`;
  }
  
  return {
    name: 'Time-Distance Ratio Check',
    fraudScore: Math.min(fraudScore, 20),
    isSuspicious,
    reason,
    details: { avgSpeed, expected }
  };
}

/**
 * Check GPS accuracy and reliability
 */
function checkGPSAccuracy(tripData) {
  const { tracking } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  if (!tracking || !tracking.locationHistory) {
    return { name: 'GPS Accuracy Check', fraudScore: 15, isSuspicious: true, reason: 'No GPS data' };
  }
  
  const locations = tracking.locationHistory;
  
  // Check for low accuracy readings (sign of GPS spoofing)
  const lowAccuracyCount = locations.filter(loc => loc.accuracy && loc.accuracy > 50).length;
  const lowAccuracyRatio = lowAccuracyCount / locations.length;
  
  if (lowAccuracyRatio > 0.5) {
    fraudScore += 15;
    isSuspicious = true;
    reason = 'Poor GPS accuracy throughout trip - possible spoofing';
  }
  
  // Check for sudden location jumps (teleportation)
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    const timeDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000; // seconds
    
    if (timeDiff > 0) {
      const distance = calculateHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      const speed = (distance / timeDiff) * 3600; // km/h
      
      if (speed > 200) {
        fraudScore += 25;
        isSuspicious = true;
        reason = 'Impossible location jump detected - GPS spoofing';
        break;
      }
    }
  }
  
  return {
    name: 'GPS Accuracy Check',
    fraudScore: Math.min(fraudScore, 25),
    isSuspicious,
    reason,
    details: { lowAccuracyRatio, totalPoints: locations.length }
  };
}

/**
 * Detect phone shaking patterns
 */
function checkMovementPattern(tripData) {
  const { mode, tracking } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  if (!tracking || !tracking.locationHistory || tracking.locationHistory.length < 10) {
    return { name: 'Movement Pattern Check', fraudScore: 0, isSuspicious: false, reason: 'Insufficient data' };
  }
  
  const modeUpper = (mode || '').toUpperCase();
  
  // Only check for WALK and CYCLE modes
  if (modeUpper !== 'WALK' && modeUpper !== 'CYCLE') {
    return { name: 'Movement Pattern Check', fraudScore: 0, isSuspicious: false, reason: 'Not applicable' };
  }
  
  const locations = tracking.locationHistory;
  
  // Check for rapid back-and-forth movement (phone shaking)
  let directionChanges = 0;
  for (let i = 2; i < locations.length; i++) {
    const bearing1 = calculateBearing(
      locations[i - 2].lat, locations[i - 2].lng,
      locations[i - 1].lat, locations[i - 1].lng
    );
    const bearing2 = calculateBearing(
      locations[i - 1].lat, locations[i - 1].lng,
      locations[i].lat, locations[i].lng
    );
    
    const bearingDiff = Math.abs(bearing1 - bearing2);
    if (bearingDiff > 90 && bearingDiff < 270) {
      directionChanges++;
    }
  }
  
  const changeRatio = directionChanges / (locations.length - 2);
  
  if (changeRatio > 0.6) {
    fraudScore += 30;
    isSuspicious = true;
    reason = 'Erratic movement pattern - possible phone shaking';
  } else if (changeRatio > 0.4) {
    fraudScore += 15;
    reason = 'Unusual movement pattern detected';
  }
  
  return {
    name: 'Movement Pattern Check',
    fraudScore: Math.min(fraudScore, 30),
    isSuspicious,
    reason,
    details: { directionChanges, changeRatio }
  };
}

/**
 * Check sensor data consistency
 */
function checkSensorConsistency(tripData) {
  const { mode, tracking, verification } = tripData;
  let fraudScore = 0;
  let isSuspicious = false;
  let reason = '';
  
  const modeUpper = (mode || '').toUpperCase();
  
  // Only applicable for WALK and CYCLE
  if (modeUpper !== 'WALK' && modeUpper !== 'CYCLE') {
    return { name: 'Sensor Consistency Check', fraudScore: 0, isSuspicious: false, reason: 'Not applicable' };
  }
  
  if (!verification || !verification.stepsData) {
    return { name: 'Sensor Consistency Check', fraudScore: 10, isSuspicious: false, reason: 'No fitness data' };
  }
  
  const { steps, distance: fitnessDistance } = verification.stepsData;
  const { distanceKm } = tripData;
  
  // Check step count vs distance consistency
  const expectedSteps = distanceKm * (modeUpper === 'WALK' ? 1300 : 400); // steps per km
  const stepRatio = steps / expectedSteps;
  
  if (stepRatio < 0.3 || stepRatio > 3) {
    fraudScore += 20;
    isSuspicious = true;
    reason = 'Step count inconsistent with distance';
  }
  
  // Check fitness API distance vs GPS distance
  if (fitnessDistance) {
    const distanceDiff = Math.abs(fitnessDistance - distanceKm);
    const diffRatio = distanceDiff / distanceKm;
    
    if (diffRatio > 0.5) {
      fraudScore += 15;
      isSuspicious = true;
      reason = 'GPS distance doesn\'t match fitness tracker';
    }
  }
  
  return {
    name: 'Sensor Consistency Check',
    fraudScore: Math.min(fraudScore, 20),
    isSuspicious,
    reason,
    details: { steps, expectedSteps, stepRatio }
  };
}

// Helper functions

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function calculateVariance(numbers) {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function detectStationaryMovement(locations) {
  if (locations.length < 5) return false;
  
  for (let i = 4; i < locations.length; i++) {
    const recentLocs = locations.slice(i - 4, i + 1);
    const distances = [];
    
    for (let j = 1; j < recentLocs.length; j++) {
      distances.push(calculateHaversineDistance(
        recentLocs[j - 1].lat, recentLocs[j - 1].lng,
        recentLocs[j].lat, recentLocs[j].lng
      ));
    }
    
    const avgMovement = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    // If average movement is very small but total distance increased significantly
    if (avgMovement < 0.01 && distances.some(d => d > 0.1)) {
      return true;
    }
  }
  
  return false;
}

function getRecommendation(fraudScore, flags) {
  if (fraudScore >= 70) {
    return 'REJECT - High fraud probability. Do not award points.';
  } else if (fraudScore >= 40) {
    return 'MANUAL REVIEW REQUIRED - Multiple suspicious indicators detected.';
  } else if (fraudScore >= 20) {
    return 'APPROVE WITH WARNING - Minor inconsistencies detected.';
  } else {
    return 'APPROVE - Trip appears legitimate.';
  }
}

export default {
  validateTrip,
  checkSpeedAnomalies,
  checkRouteDeviation,
  checkTimeDistanceRatio,
  checkGPSAccuracy,
  checkMovementPattern,
  checkSensorConsistency
};
