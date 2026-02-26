/**
 * carbonEmissionCalculator.js
 * Standardized carbon emission calculation based on scientific data
 * Source: UK Government GHG Conversion Factors 2023, EPA, IPCC
 */

// Emission factors in kg CO2 per km
const EMISSION_FACTORS = {
  // Private Vehicles (per km, per passenger)
  CAR: {
    petrol: {
      small: 0.142,      // <1.4L engine
      medium: 0.192,     // 1.4-2.0L engine
      large: 0.282,      // >2.0L engine
      average: 0.192     // Average petrol car
    },
    diesel: {
      small: 0.127,
      medium: 0.171,
      large: 0.251,
      average: 0.171
    },
    electric: {
      small: 0.053,      // Based on grid electricity
      medium: 0.058,
      large: 0.073,
      average: 0.058
    },
    hybrid: {
      petrol: 0.109,
      diesel: 0.099,
      average: 0.109
    },
    plugin_hybrid: {
      petrol: 0.074,
      diesel: 0.068,
      average: 0.074
    }
  },
  
  BIKE: {
    petrol: {
      small: 0.084,      // <125cc
      medium: 0.103,     // 125-500cc
      large: 0.134,      // >500cc
      average: 0.103
    },
    electric: 0.020      // Electric scooter/bike
  },
  
  // Public Transport (per km, per passenger)
  PUBLIC: {
    bus: {
      local: 0.089,      // Local bus
      coach: 0.027,      // Long-distance coach
      average: 0.089
    },
    metro: 0.041,        // Metro/Subway
    train: {
      local: 0.041,      // Local/commuter train
      intercity: 0.035,  // Intercity train
      average: 0.041
    },
    tram: 0.035,         // Tram/Light rail
    average: 0.055       // Average public transport
  },
  
  // Active Transport
  WALK: 0.0,             // Zero emissions
  CYCLE: 0.0,            // Zero emissions
  
  // Baseline for comparison (average car)
  BASELINE: 0.192
};

// Occupancy factors (average passengers per vehicle)
const OCCUPANCY_FACTORS = {
  CAR: {
    solo: 1,
    carpool_2: 2,
    carpool_3: 3,
    carpool_4: 4,
    average: 1.5         // Average car occupancy
  },
  BIKE: 1.2,             // Sometimes with pillion
  PUBLIC: {
    bus: 15,             // Average bus occupancy
    metro: 40,           // Average metro occupancy
    train: 30            // Average train occupancy
  }
};

// Traffic congestion multipliers (increases emissions)
const TRAFFIC_MULTIPLIERS = {
  free_flow: 1.0,
  light: 1.1,
  moderate: 1.25,
  heavy: 1.5,
  standstill: 2.0
};

/**
 * Calculate carbon emissions for a trip
 * @param {Object} params - Trip parameters
 * @returns {Object} Emission data
 */
export function calculateCarbonEmission({
  mode,
  distanceKm,
  vehicleType = 'car',
  fuelType = 'petrol',
  engineSize = 'medium',
  occupancy = 1,
  trafficCondition = 'moderate',
  publicTransportType = 'bus'
}) {
  const modeUpper = (mode || 'CAR').toUpperCase();
  let emissionPerKm = 0;
  let baselineEmission = EMISSION_FACTORS.BASELINE;
  
  // Calculate emission per km based on mode
  switch (modeUpper) {
    case 'WALK':
    case 'CYCLE':
      emissionPerKm = 0;
      break;
      
    case 'CAR':
      const carFuel = EMISSION_FACTORS.CAR[fuelType] || EMISSION_FACTORS.CAR.petrol;
      emissionPerKm = carFuel[engineSize] || carFuel.average;
      // Adjust for occupancy (carpool reduces per-person emissions)
      emissionPerKm = emissionPerKm / Math.max(1, occupancy);
      // Apply traffic multiplier
      emissionPerKm *= TRAFFIC_MULTIPLIERS[trafficCondition] || TRAFFIC_MULTIPLIERS.moderate;
      break;
      
    case 'BIKE':
      if (fuelType === 'electric') {
        emissionPerKm = EMISSION_FACTORS.BIKE.electric;
      } else {
        const bikeFuel = EMISSION_FACTORS.BIKE.petrol;
        emissionPerKm = bikeFuel[engineSize] || bikeFuel.average;
      }
      emissionPerKm = emissionPerKm / OCCUPANCY_FACTORS.BIKE;
      emissionPerKm *= TRAFFIC_MULTIPLIERS[trafficCondition] || TRAFFIC_MULTIPLIERS.moderate;
      break;
      
    case 'PUBLIC':
      const publicType = publicTransportType.toLowerCase();
      if (publicType === 'metro' || publicType === 'subway') {
        emissionPerKm = EMISSION_FACTORS.PUBLIC.metro;
      } else if (publicType === 'train') {
        emissionPerKm = EMISSION_FACTORS.PUBLIC.train.average;
      } else if (publicType === 'tram') {
        emissionPerKm = EMISSION_FACTORS.PUBLIC.tram;
      } else {
        // Default to bus
        emissionPerKm = EMISSION_FACTORS.PUBLIC.bus.average;
      }
      break;
      
    default:
      emissionPerKm = baselineEmission;
  }
  
  // Calculate total emissions
  const totalEmission = emissionPerKm * distanceKm;
  const baselineTotal = baselineEmission * distanceKm;
  const emissionSaved = Math.max(0, baselineTotal - totalEmission);
  const savingsPercentage = baselineTotal > 0 
    ? Math.round((emissionSaved / baselineTotal) * 100) 
    : 0;
  
  // Calculate equivalent metrics
  const treesNeeded = totalEmission / 22; // 1 tree absorbs ~22kg CO2/year
  const treesPlanted = emissionSaved / 22;
  
  return {
    emissionPerKm: Math.round(emissionPerKm * 1000) / 1000, // Round to 3 decimals
    totalEmission: Math.round(totalEmission * 100) / 100,
    baselineEmission: Math.round(baselineTotal * 100) / 100,
    emissionSaved: Math.round(emissionSaved * 100) / 100,
    savingsPercentage,
    treesNeeded: Math.round(treesNeeded * 100) / 100,
    treesPlanted: Math.round(treesPlanted * 100) / 100,
    equivalents: {
      smartphones_charged: Math.round(totalEmission * 121.6), // 1kg CO2 = 121.6 smartphone charges
      km_driven: Math.round(totalEmission / 0.192), // Equivalent km in average car
      plastic_bottles: Math.round(totalEmission * 12.5), // 1kg CO2 = 12.5 plastic bottles
      hours_led_bulb: Math.round(totalEmission * 1000) // 1kg CO2 = 1000 hours LED bulb
    }
  };
}

/**
 * Get emission factor for a specific mode
 */
export function getEmissionFactor(mode, vehicleType, fuelType, engineSize) {
  const modeUpper = (mode || 'CAR').toUpperCase();
  
  switch (modeUpper) {
    case 'WALK':
    case 'CYCLE':
      return 0;
      
    case 'CAR':
      const carFuel = EMISSION_FACTORS.CAR[fuelType] || EMISSION_FACTORS.CAR.petrol;
      return carFuel[engineSize] || carFuel.average;
      
    case 'BIKE':
      if (fuelType === 'electric') return EMISSION_FACTORS.BIKE.electric;
      const bikeFuel = EMISSION_FACTORS.BIKE.petrol;
      return bikeFuel[engineSize] || bikeFuel.average;
      
    case 'PUBLIC':
      return EMISSION_FACTORS.PUBLIC.average;
      
    default:
      return EMISSION_FACTORS.BASELINE;
  }
}

/**
 * Compare emissions across different modes
 */
export function compareEmissions(distanceKm, userVehicleType, userFuelType) {
  const modes = [
    { mode: 'WALK', label: 'Walking', icon: '🚶' },
    { mode: 'CYCLE', label: 'Cycling', icon: '🚴' },
    { mode: 'PUBLIC', label: 'Public Transport', icon: '🚌' },
    { mode: 'BIKE', label: 'Motorcycle', icon: '🏍️' },
    { mode: 'CAR', label: 'Car (Solo)', icon: '🚗' },
    { mode: 'CAR', label: 'Car (Carpool)', icon: '🚗', occupancy: 3 }
  ];
  
  return modes.map(({ mode, label, icon, occupancy = 1 }) => {
    const emission = calculateCarbonEmission({
      mode,
      distanceKm,
      vehicleType: userVehicleType,
      fuelType: userFuelType,
      occupancy
    });
    
    return {
      mode,
      label,
      icon,
      ...emission
    };
  }).sort((a, b) => a.totalEmission - b.totalEmission);
}

export default {
  calculateCarbonEmission,
  getEmissionFactor,
  compareEmissions,
  EMISSION_FACTORS,
  OCCUPANCY_FACTORS,
  TRAFFIC_MULTIPLIERS
};
