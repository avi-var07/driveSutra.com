// Public transport verification and metro/bus suggestion service
import api from './api';

class PublicTransportService {
  constructor() {
    this.metroStations = null;
    this.busStops = null;
  }

  // Detect if location is in a metro city
  detectMetroCity(lat, lng) {
    const metroCities = {
      delhi: { lat: 28.6139, lng: 77.2090, radius: 50, name: 'Delhi NCR' },
      mumbai: { lat: 19.0760, lng: 72.8777, radius: 40, name: 'Mumbai' },
      bangalore: { lat: 12.9716, lng: 77.5946, radius: 35, name: 'Bangalore' },
      kolkata: { lat: 22.5726, lng: 88.3639, radius: 30, name: 'Kolkata' },
      chennai: { lat: 13.0827, lng: 80.2707, radius: 30, name: 'Chennai' },
      hyderabad: { lat: 17.3850, lng: 78.4867, radius: 30, name: 'Hyderabad' },
      pune: { lat: 18.5204, lng: 73.8567, radius: 25, name: 'Pune' },
      ahmedabad: { lat: 23.0225, lng: 72.5714, radius: 25, name: 'Ahmedabad' },
      jaipur: { lat: 26.9124, lng: 75.7873, radius: 20, name: 'Jaipur' },
      lucknow: { lat: 26.8467, lng: 80.9462, radius: 20, name: 'Lucknow' },
      kochi: { lat: 9.9312, lng: 76.2673, radius: 20, name: 'Kochi' },
      nagpur: { lat: 21.1458, lng: 79.0882, radius: 20, name: 'Nagpur' }
    };

    for (const [key, city] of Object.entries(metroCities)) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance <= city.radius) {
        return { hasMetro: true, city: city.name, key };
      }
    }

    return { hasMetro: false, city: null, key: null };
  }

  // Find nearby metro stations
  async findNearbyMetroStations(lat, lng, radius = 2) {
    try {
      const cityInfo = this.detectMetroCity(lat, lng);
      
      if (!cityInfo.hasMetro) {
        return {
          success: false,
          message: 'No metro service in this area',
          stations: []
        };
      }

      // Use Overpass API to find metro stations
      const query = `
        [out:json][timeout:25];
        (
          node["railway"="station"]["station"="subway"](around:${radius * 1000},${lat},${lng});
          node["railway"="halt"]["station"="subway"](around:${radius * 1000},${lat},${lng});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await response.json();
      
      const stations = data.elements.map(station => ({
        id: station.id,
        name: station.tags.name || 'Unknown Station',
        lat: station.lat,
        lng: station.lon,
        distance: this.calculateDistance(lat, lng, station.lat, station.lon),
        line: station.tags.line || station.tags['line:name'] || 'Unknown Line',
        network: station.tags.network || cityInfo.city
      })).sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        city: cityInfo.city,
        stations: stations.slice(0, 5), // Return top 5 nearest
        message: `Found ${stations.length} metro stations nearby`
      };

    } catch (error) {
      console.error('Metro station search failed:', error);
      return {
        success: false,
        message: 'Failed to fetch metro stations',
        stations: []
      };
    }
  }

  // Find nearby bus stops
  async findNearbyBusStops(lat, lng, radius = 0.5) {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["highway"="bus_stop"](around:${radius * 1000},${lat},${lng});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await response.json();
      
      const busStops = data.elements.map(stop => ({
        id: stop.id,
        name: stop.tags.name || 'Bus Stop',
        lat: stop.lat,
        lng: stop.lon,
        distance: this.calculateDistance(lat, lng, stop.lat, stop.lon),
        routes: stop.tags.route_ref || 'Multiple routes',
        operator: stop.tags.operator || 'Local Transport'
      })).sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        busStops: busStops.slice(0, 10),
        message: `Found ${busStops.length} bus stops nearby`
      };

    } catch (error) {
      console.error('Bus stop search failed:', error);
      return {
        success: false,
        message: 'Failed to fetch bus stops',
        busStops: []
      };
    }
  }

  // Verify ticket using OCR (basic implementation)
  async verifyTicket(ticketImage) {
    try {
      // In production, use OCR API like Google Vision, Tesseract.js, or AWS Textract
      // For now, we'll do basic validation
      
      const formData = new FormData();
      formData.append('ticket', ticketImage);

      const response = await api.post('/trips/verify-ticket', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;

    } catch (error) {
      console.error('Ticket verification failed:', error);
      return {
        verified: false,
        confidence: 0,
        message: 'Ticket verification failed'
      };
    }
  }

  // Verify transaction details
  async verifyTransaction(transactionData) {
    try {
      const { transactionId, amount, timestamp, mode } = transactionData;

      // Validate transaction format
      if (!transactionId || !amount || !timestamp) {
        return {
          verified: false,
          message: 'Incomplete transaction details'
        };
      }

      // Check if transaction is recent (within last 24 hours)
      const transactionTime = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return {
          verified: false,
          message: 'Transaction is too old (must be within 24 hours)'
        };
      }

      // Send to backend for verification
      const response = await api.post('/trips/verify-transaction', transactionData);

      return response.data;

    } catch (error) {
      console.error('Transaction verification failed:', error);
      return {
        verified: false,
        message: 'Transaction verification failed'
      };
    }
  }

  // Get detailed public transport route suggestions
  async getPublicTransportRoute(startLat, startLng, endLat, endLng) {
    try {
      const startCity = this.detectMetroCity(startLat, startLng);
      const endCity = this.detectMetroCity(endLat, endLng);

      const suggestions = {
        metro: null,
        bus: null,
        auto: null,
        combined: null
      };

      // Metro route with detailed information
      if (startCity.hasMetro && endCity.hasMetro && startCity.key === endCity.key) {
        suggestions.metro = await this.getDetailedMetroRoute(startLat, startLng, endLat, endLng, startCity.key);
      }

      // Bus route with detailed information
      suggestions.bus = await this.getDetailedBusRoute(startLat, startLng, endLat, endLng);

      // Auto rickshaw option
      suggestions.auto = await this.getAutoRoute(startLat, startLng, endLat, endLng);

      // Combined route (walk + metro/bus)
      if (suggestions.metro || suggestions.bus) {
        suggestions.combined = this.getCombinedRoute(suggestions);
      }

      return {
        success: true,
        suggestions,
        city: startCity.city || 'Unknown'
      };

    } catch (error) {
      console.error('Public transport route failed:', error);
      return {
        success: false,
        message: 'Failed to get public transport suggestions'
      };
    }
  }

  // Get detailed metro route with line changes, platforms, etc.
  async getDetailedMetroRoute(startLat, startLng, endLat, endLng, cityKey) {
    try {
      const nearbyStartStations = await this.findNearbyMetroStations(startLat, startLng, 1);
      const nearbyEndStations = await this.findNearbyMetroStations(endLat, endLng, 1);

      if (nearbyStartStations.stations.length === 0 || nearbyEndStations.stations.length === 0) {
        return null;
      }

      const startStation = nearbyStartStations.stations[0];
      const endStation = nearbyEndStations.stations[0];

      // Get metro route details (in production, use actual metro API)
      const routeDetails = this.calculateMetroRoute(startStation, endStation, cityKey);

      return {
        mode: 'METRO',
        startStation: {
          name: startStation.name,
          line: startStation.line,
          distance: startStation.distance,
          walkTime: Math.round((startStation.distance / 5) * 60), // 5 km/h walking
          coordinates: { lat: startStation.lat, lng: startStation.lng }
        },
        endStation: {
          name: endStation.name,
          line: endStation.line,
          distance: endStation.distance,
          walkTime: Math.round((endStation.distance / 5) * 60),
          coordinates: { lat: endStation.lat, lng: endStation.lng }
        },
        route: routeDetails.route,
        totalStations: routeDetails.totalStations,
        interchanges: routeDetails.interchanges,
        estimatedFare: this.estimateMetroFare(cityKey, startStation, endStation),
        estimatedTime: routeDetails.totalTime,
        instructions: routeDetails.instructions,
        platforms: routeDetails.platforms
      };

    } catch (error) {
      console.error('Detailed metro route failed:', error);
      return null;
    }
  }

  // Calculate metro route with line changes
  calculateMetroRoute(startStation, endStation, cityKey) {
    // In production, integrate with actual metro APIs
    // For now, provide mock detailed route
    
    const isSameLine = startStation.line === endStation.line;
    
    if (isSameLine) {
      // Direct route on same line
      return {
        route: [
          {
            line: startStation.line,
            from: startStation.name,
            to: endStation.name,
            stations: 8, // Mock number
            direction: 'Towards ' + endStation.name,
            color: this.getLineColor(startStation.line)
          }
        ],
        totalStations: 8,
        interchanges: [],
        totalTime: 25,
        instructions: [
          `Walk to ${startStation.name} metro station`,
          `Board ${startStation.line} towards ${endStation.name}`,
          `Travel for 8 stations`,
          `Alight at ${endStation.name}`,
          `Exit from Gate 2 (shortest route to destination)`
        ],
        platforms: [
          {
            station: startStation.name,
            platform: 'Platform 1',
            direction: 'Towards ' + endStation.name
          }
        ]
      };
    } else {
      // Route with interchange
      const interchangeStation = this.findInterchangeStation(startStation.line, endStation.line, cityKey);
      
      return {
        route: [
          {
            line: startStation.line,
            from: startStation.name,
            to: interchangeStation.name,
            stations: 5,
            direction: 'Towards ' + interchangeStation.name,
            color: this.getLineColor(startStation.line)
          },
          {
            line: endStation.line,
            from: interchangeStation.name,
            to: endStation.name,
            stations: 4,
            direction: 'Towards ' + endStation.name,
            color: this.getLineColor(endStation.line)
          }
        ],
        totalStations: 9,
        interchanges: [
          {
            station: interchangeStation.name,
            fromLine: startStation.line,
            toLine: endStation.line,
            walkTime: 3,
            instructions: `Change to ${endStation.line} at ${interchangeStation.name}`
          }
        ],
        totalTime: 35,
        instructions: [
          `Walk to ${startStation.name} metro station`,
          `Board ${startStation.line} towards ${interchangeStation.name}`,
          `Travel for 5 stations`,
          `Alight at ${interchangeStation.name}`,
          `Change to ${endStation.line} (follow signs, 3 min walk)`,
          `Board ${endStation.line} towards ${endStation.name}`,
          `Travel for 4 stations`,
          `Alight at ${endStation.name}`,
          `Exit from Gate 3`
        ],
        platforms: [
          {
            station: startStation.name,
            platform: 'Platform 1',
            direction: 'Towards ' + interchangeStation.name
          },
          {
            station: interchangeStation.name,
            platform: 'Platform 2',
            direction: 'Towards ' + endStation.name
          }
        ]
      };
    }
  }

  // Get detailed bus route
  async getDetailedBusRoute(startLat, startLng, endLat, endLng) {
    try {
      const nearbyStartBusStops = await this.findNearbyBusStops(startLat, startLng);
      const nearbyEndBusStops = await this.findNearbyBusStops(endLat, endLng);

      if (nearbyStartBusStops.busStops.length === 0 || nearbyEndBusStops.busStops.length === 0) {
        return null;
      }

      const startStop = nearbyStartBusStops.busStops[0];
      const endStop = nearbyEndBusStops.busStops[0];

      // In production, integrate with bus route APIs
      const busRoutes = this.findBusRoutes(startStop, endStop);

      return {
        mode: 'BUS',
        startStop: {
          name: startStop.name,
          distance: startStop.distance,
          walkTime: Math.round((startStop.distance / 5) * 60),
          coordinates: { lat: startStop.lat, lng: startStop.lng }
        },
        endStop: {
          name: endStop.name,
          distance: endStop.distance,
          walkTime: Math.round((endStop.distance / 5) * 60),
          coordinates: { lat: endStop.lat, lng: endStop.lng }
        },
        routes: busRoutes,
        estimatedFare: this.estimateBusFare(startLat, startLng, endLat, endLng),
        estimatedTime: this.estimateBusTime(startLat, startLng, endLat, endLng),
        instructions: [
          `Walk to ${startStop.name} bus stop`,
          `Board bus ${busRoutes[0]?.number || 'any available'} towards ${busRoutes[0]?.destination || 'destination'}`,
          `Travel for approximately ${busRoutes[0]?.stops || 15} stops`,
          `Alight at ${endStop.name}`,
          `Walk to destination`
        ]
      };

    } catch (error) {
      console.error('Detailed bus route failed:', error);
      return null;
    }
  }

  // Get auto rickshaw route
  async getAutoRoute(startLat, startLng, endLat, endLng) {
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    
    // Auto is practical for short distances (< 10 km)
    if (distance > 10) {
      return null;
    }

    const baseFare = 25; // Starting fare
    const perKmRate = 12; // Per km rate
    const estimatedFare = baseFare + (distance * perKmRate);

    return {
      mode: 'AUTO',
      distance: distance,
      estimatedFare: Math.round(estimatedFare),
      estimatedTime: Math.round((distance / 20) * 60), // 20 km/h average
      instructions: [
        `Hail an auto rickshaw from your location`,
        `Show destination to driver`,
        `Estimated fare: ₹${Math.round(estimatedFare)} (may vary)`,
        `Journey time: ~${Math.round((distance / 20) * 60)} minutes`
      ],
      tips: [
        'Ensure meter is running',
        'Ask for receipt if needed',
        'Carry exact change',
        'Use ride-hailing apps for fixed fares'
      ]
    };
  }

  // Find bus routes between stops
  findBusRoutes(startStop, endStop) {
    // In production, use actual bus route API
    // Mock data for now
    return [
      {
        number: '45A',
        name: 'City Express',
        destination: 'Central Station',
        stops: 15,
        frequency: '10-15 min',
        type: 'AC',
        operator: 'City Transport'
      },
      {
        number: '78',
        name: 'Local Service',
        destination: 'Bus Terminal',
        stops: 18,
        frequency: '5-10 min',
        type: 'Non-AC',
        operator: 'City Transport'
      }
    ];
  }

  // Find interchange station between two lines
  findInterchangeStation(line1, line2, cityKey) {
    // In production, use actual metro network data
    // Mock interchange stations
    const interchanges = {
      delhi: {
        'Blue Line-Yellow Line': { name: 'Rajiv Chowk', lat: 28.6328, lng: 77.2197 },
        'Blue Line-Red Line': { name: 'Kashmere Gate', lat: 28.6676, lng: 77.2273 },
        'Yellow Line-Red Line': { name: 'Kashmere Gate', lat: 28.6676, lng: 77.2273 }
      }
    };

    const key = `${line1}-${line2}`;
    return interchanges[cityKey]?.[key] || { name: 'Central Station', lat: 0, lng: 0 };
  }

  // Get line color for visualization
  getLineColor(lineName) {
    const colors = {
      'Blue Line': '#0066CC',
      'Red Line': '#CC0000',
      'Yellow Line': '#FFCC00',
      'Green Line': '#00CC00',
      'Violet Line': '#9933CC',
      'Pink Line': '#FF66CC',
      'Magenta Line': '#CC0066',
      'Orange Line': '#FF9900'
    };
    return colors[lineName] || '#666666';
  }

  // Get combined route (walk + public transport)
  getCombinedRoute(suggestions) {
    const routes = [];

    if (suggestions.metro) {
      routes.push({
        type: 'Walk + Metro',
        steps: [
          { mode: 'WALK', duration: suggestions.metro.startStation.walkTime, description: 'Walk to metro station' },
          { mode: 'METRO', duration: suggestions.metro.estimatedTime, description: 'Metro journey' },
          { mode: 'WALK', duration: suggestions.metro.endStation.walkTime, description: 'Walk to destination' }
        ],
        totalTime: suggestions.metro.startStation.walkTime + suggestions.metro.estimatedTime + suggestions.metro.endStation.walkTime,
        totalFare: suggestions.metro.estimatedFare,
        ecoScore: 90
      });
    }

    if (suggestions.bus) {
      routes.push({
        type: 'Walk + Bus',
        steps: [
          { mode: 'WALK', duration: suggestions.bus.startStop.walkTime, description: 'Walk to bus stop' },
          { mode: 'BUS', duration: suggestions.bus.estimatedTime, description: 'Bus journey' },
          { mode: 'WALK', duration: suggestions.bus.endStop.walkTime, description: 'Walk to destination' }
        ],
        totalTime: suggestions.bus.startStop.walkTime + suggestions.bus.estimatedTime + suggestions.bus.endStop.walkTime,
        totalFare: suggestions.bus.estimatedFare,
        ecoScore: 85
      });
    }

    return routes.length > 0 ? routes : null;
  }

  // Estimate metro fare (city-specific)
  estimateMetroFare(cityKey, startStation, endStation) {
    const fareStructures = {
      delhi: { base: 10, perKm: 2, max: 60 },
      mumbai: { base: 10, perKm: 3, max: 50 },
      bangalore: { base: 10, perKm: 2, max: 60 },
      kolkata: { base: 5, perKm: 2, max: 30 },
      chennai: { base: 10, perKm: 2, max: 50 },
      hyderabad: { base: 10, perKm: 2, max: 60 }
    };

    const structure = fareStructures[cityKey] || { base: 10, perKm: 2, max: 50 };
    const distance = this.calculateDistance(
      startStation.lat,
      startStation.lng,
      endStation.lat,
      endStation.lng
    );

    const fare = Math.min(
      structure.base + Math.ceil(distance) * structure.perKm,
      structure.max
    );

    return fare;
  }

  // Estimate metro travel time
  estimateMetroTime(startDistance, endDistance) {
    // Walking time to/from stations (5 km/h) + metro travel time (35 km/h)
    const walkingTime = (startDistance + endDistance) / 5 * 60; // minutes
    const metroTime = 20; // Average metro journey time
    return Math.round(walkingTime + metroTime);
  }

  // Estimate bus fare
  estimateBusFare(startLat, startLng, endLat, endLng) {
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    
    if (distance < 5) return 10;
    if (distance < 10) return 15;
    if (distance < 20) return 25;
    return 35;
  }

  // Estimate bus travel time
  estimateBusTime(startLat, startLng, endLat, endLng) {
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    // Average bus speed: 15 km/h in city traffic
    return Math.round((distance / 15) * 60);
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
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
}

export default new PublicTransportService();
