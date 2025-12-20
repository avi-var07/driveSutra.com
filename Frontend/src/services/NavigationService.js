/**
 * NavigationService - Handles route calculation, instruction parsing, and navigation logic
 * Uses OSRM (Open Source Routing Machine) for free routing
 */
class NavigationService {
  constructor() {
    this.osrmBaseUrl = 'https://router.project-osrm.org';
    this.offRouteThreshold = 50; // meters - distance threshold to consider user off-route
  }

  /**
   * Calculate route from start to destination using OSRM
   * @param {Object} start - {lat, lng}
   * @param {Object} destination - {lat, lng}
   * @returns {Promise<Object>} Route data with main route, alternatives, and instructions
   */
  async calculateRoute(start, destination) {
    try {
      const url = `${this.osrmBaseUrl}/route/v1/driving/${start.lng},${start.lat};${destination.lng},${destination.lat}`;
      const params = new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'true',
        alternatives: 'true'
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 'Ok') {
        throw new Error(`OSRM routing error: ${data.message || 'Unknown error'}`);
      }

      return this.parseRouteResponse(data);
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error(`Failed to calculate route: ${error.message}`);
    }
  }

  /**
   * Parse OSRM response into usable route data
   * @param {Object} osrmResponse - Raw OSRM API response
   * @returns {Object} Parsed route data
   */
  parseRouteResponse(osrmResponse) {
    const routes = osrmResponse.routes;
    
    if (!routes || routes.length === 0) {
      throw new Error('No routes found');
    }

    // Main route (first/fastest route)
    const mainRoute = this.parseRoute(routes[0]);
    
    // Alternative routes
    const alternatives = routes.slice(1).map(route => this.parseRoute(route));
    
    // Extract turn-by-turn instructions from main route
    const instructions = this.extractInstructions(routes[0]);

    return {
      mainRoute,
      alternatives,
      instructions
    };
  }

  /**
   * Parse individual route from OSRM response
   * @param {Object} route - Single route from OSRM response
   * @returns {Object} Parsed route object
   */
  parseRoute(route) {
    return {
      coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
      distance: route.distance, // meters
      duration: route.duration, // seconds
      legs: route.legs
    };
  }

  /**
   * Extract turn-by-turn instructions from route
   * @param {Object} route - Route object from OSRM
   * @returns {Array} Array of instruction objects
   */
  extractInstructions(route) {
    const instructions = [];
    
    route.legs.forEach((leg, legIndex) => {
      leg.steps.forEach((step, stepIndex) => {
        const instruction = {
          id: `${legIndex}-${stepIndex}`,
          instruction: step.maneuver.instruction || this.generateInstruction(step.maneuver),
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          distance: step.distance,
          duration: step.duration,
          name: step.name || '',
          coordinates: step.geometry.coordinates.map(coord => [coord[1], coord[0]]),
          location: [step.maneuver.location[1], step.maneuver.location[0]] // [lat, lng]
        };
        
        instructions.push(instruction);
      });
    });

    return instructions;
  }

  /**
   * Generate human-readable instruction from maneuver data
   * @param {Object} maneuver - OSRM maneuver object
   * @returns {string} Human-readable instruction
   */
  generateInstruction(maneuver) {
    const { type, modifier } = maneuver;
    
    switch (type) {
      case 'depart':
        return 'Start your journey';
      
      case 'turn':
        if (modifier === 'left') return 'Turn left';
        if (modifier === 'right') return 'Turn right';
        if (modifier === 'sharp left') return 'Turn sharp left';
        if (modifier === 'sharp right') return 'Turn sharp right';
        if (modifier === 'slight left') return 'Turn slight left';
        if (modifier === 'slight right') return 'Turn slight right';
        return 'Turn';
      
      case 'new name':
        return 'Continue straight';
      
      case 'continue':
        return 'Continue straight';
      
      case 'merge':
        return 'Merge';
      
      case 'on ramp':
        return 'Take the ramp';
      
      case 'off ramp':
        return 'Take the exit';
      
      case 'fork':
        if (modifier === 'left') return 'Keep left at the fork';
        if (modifier === 'right') return 'Keep right at the fork';
        return 'Continue at the fork';
      
      case 'roundabout':
        return 'Enter the roundabout';
      
      case 'arrive':
        return 'You have arrived at your destination';
      
      default:
        return 'Continue';
    }
  }

  /**
   * Update current instruction based on user position
   * @param {Object} userPosition - Current user position {lat, lng}
   * @param {Array} instructions - Array of route instructions
   * @param {number} currentIndex - Current instruction index
   * @returns {Object} Updated instruction info
   */
  updateCurrentInstruction(userPosition, instructions, currentIndex) {
    if (!instructions || instructions.length === 0) {
      return { newIndex: currentIndex, instruction: null };
    }

    // Check if user has passed the current instruction point
    const currentInstruction = instructions[currentIndex];
    if (!currentInstruction) {
      return { newIndex: currentIndex, instruction: currentInstruction };
    }

    const distanceToInstruction = this.calculateDistance(
      userPosition,
      { lat: currentInstruction.location[0], lng: currentInstruction.location[1] }
    );

    // If user is close to or past the instruction point, move to next instruction
    if (distanceToInstruction < 20 && currentIndex < instructions.length - 1) {
      return { 
        newIndex: currentIndex + 1, 
        instruction: instructions[currentIndex + 1] 
      };
    }

    return { newIndex: currentIndex, instruction: currentInstruction };
  }

  /**
   * Check if user is off the planned route
   * @param {Object} userPosition - Current user position {lat, lng}
   * @param {Object} route - Current route object
   * @returns {boolean} True if user is off-route
   */
  isOffRoute(userPosition, route) {
    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return false;
    }

    // Find the closest point on the route to the user's current position
    let minDistance = Infinity;
    
    for (const coordinate of route.coordinates) {
      const distance = this.calculateDistance(
        userPosition,
        { lat: coordinate[0], lng: coordinate[1] }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // User is off-route if they're more than threshold distance from the route
    return minDistance > this.offRouteThreshold;
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
}

export { NavigationService };