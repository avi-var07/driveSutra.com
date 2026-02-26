/**
 * ecoScoreCalculator.js
 * TRANSPARENT ECO SCORE FORMULA
 * 
 * FORMULA:
 * EcoScore = (Mode × 0.30) + (Efficiency × 0.30) + (Behavior × 0.20) + 
 *            (Weather × 0.10) + (Verification × 0.10) + Fitness Bonus
 * 
 * COMPONENTS:
 * 1. Mode Component (30%): Based on carbon emission
 *    - WALK/CYCLE: 95-100 (zero emission)
 *    - PUBLIC: 85-100 (low emission)
 *    - CAR/BIKE: 40-70 (based on fuel type & efficiency)
 * 
 * 2. Efficiency Component (30%): Time optimization
 *    - Ratio = Actual Time / Expected Time
 *    - 0.9-1.2: 90 points (optimal)
 *    - >1.6: 50 points (inefficient)
 * 
 * 3. Behavior Component (20%): Speed discipline
 *    - Safe speed range: 90 points
 *    - Speed violations: -20 points per violation
 * 
 * 4. Weather Component (10%): Difficulty bonus
 *    - Rain: +5, Fog: +7, Extreme temp: +5
 * 
 * 5. Verification Component (10%): Authenticity
 *    - Verified: 95, Unverified: 70, Fraud: 20
 * 
 * 6. Fitness Bonus (up to +20):
 *    - Calories: +10, Stress relief: +5, Heart rate: +5
 * 
 * CARBON CREDITS FORMULA:
 * Credits = (EcoScore × 0.1) + (Distance × 0.5) + (CO2 Saved × 2)
 * 
 * XP FORMULA:
 * XP = (EcoScore × 0.5) + (Distance × 2) × Mode Multiplier
 * Multipliers: WALK/CYCLE: 1.5x, PUBLIC: 1.3x, CAR: 1.0x
 */

import { calculateCarbonEmission } from './carbonEmissionCalculator.js';

function getModeComponent(mode, vehicleType, fuelType, distanceKm) {
  if (!mode) return 50;
  const m = mode.toUpperCase();
  
  // Calculate actual carbon emission
  const emission = calculateCarbonEmission({
    mode: m,
    distanceKm: distanceKm || 1,
    vehicleType,
    fuelType
  });
  
  // Score based on emission savings percentage
  if (m === 'WALK' || m === 'CYCLE') {
    return 100; // Zero emission
  } else if (m === 'PUBLIC') {
    return 85 + (emission.savingsPercentage * 0.15); // 85-100 range
  } else if (m === 'CAR' || m === 'BIKE') {
    // Score based on fuel efficiency
    if (fuelType === 'electric') return 75;
    if (fuelType === 'hybrid') return 65;
    return Math.max(40, 70 - (emission.emissionPerKm * 100)); // 40-70 range
  }
  
  return 50;
}

function getEfficiencyComponent(distanceKm, etaMinutes, actualMinutes) {
  if (!etaMinutes || !actualMinutes) return 60;
  const ratio = actualMinutes / etaMinutes;
  let score = 0;
  if (ratio >= 0.9 && ratio <= 1.2) score = 90;
  else if (ratio > 1.2 && ratio <= 1.6) score = 70;
  else if (ratio > 1.6) score = 50;
  else if (ratio >= 0.7 && ratio < 0.9) score = 75;
  else score = 40;

  if (typeof distanceKm === 'number' && distanceKm < 2) {
    score = Math.min(100, score + 5);
  }
  return score;
}

function getBehaviorComponent(mode, distanceKm, actualMinutes) {
  const m = (mode || '').toUpperCase();
  if (m === 'PUBLIC' || m === 'WALK' || m === 'CYCLE') return 90;
  if (!distanceKm || !actualMinutes) return 70;
  const avgSpeed = distanceKm / (actualMinutes / 60 || 1); // km/h
  let score = 0;
  if (avgSpeed >= 30 && avgSpeed <= 60) score = 90;
  else if ((avgSpeed >= 20 && avgSpeed < 30) || (avgSpeed > 60 && avgSpeed <= 75)) score = 75;
  else if ((avgSpeed >= 10 && avgSpeed < 20) || (avgSpeed > 75 && avgSpeed <= 90)) score = 60;
  else score = 40;

  if (distanceKm < 3) score = Math.min(100, score + 5);
  return score;
}

function getWeatherComponent(weather = {}, mode) {
  let score = 70;
  const condition = (weather.condition || '').toLowerCase();
  const temp = typeof weather.temp === 'number' ? weather.temp : 25;
  if (condition.includes('rain')) score += 5;
  if (condition.includes('fog')) score += 7;
  if (condition.includes('snow')) score += 8;
  if (condition.includes('storm')) score += 5;
  if ((mode === 'WALK' || mode === 'CYCLE') && temp > 32) score += 5;
  if ((mode === 'WALK' || mode === 'CYCLE') && temp < 10) score += 5;
  if (score > 100) score = 100;
  if (score < 40) score = 40;
  return score;
}

function getVerificationComponent({ mode, ticketVerified, stepsMatch, avgSpeed, fraudStrikes = 0 }) {
  const m = (mode || '').toUpperCase();
  let score = 80;
  if (m === 'PUBLIC') {
    score = ticketVerified ? 95 : 70;
  }
  if (m === 'WALK' || m === 'CYCLE') {
    score = stepsMatch ? 95 : 75;
  }
  if (m === 'CYCLE') {
    if (avgSpeed && avgSpeed > 27) score = 40;
  }
  if (m === 'WALK') {
    if (avgSpeed && avgSpeed > 8) score = 40;
  }
  if (fraudStrikes === 1) score -= 10;
  if (fraudStrikes >= 2) score -= 20;
  if (score > 100) score = 100;
  if (score < 20) score = 20;
  return score;
}

function calculateEcoScore({
  mode,
  distanceKm,
  etaMinutes,
  actualMinutes,
  weather,
  verification = {},
  vehicleType = 'car',
  fuelType = 'petrol',
  fitnessData = {}
}) {
  // Calculate base components
  const modeComponent = getModeComponent(mode, vehicleType, fuelType, distanceKm);
  const efficiencyComponent = getEfficiencyComponent(distanceKm, etaMinutes, actualMinutes);
  const behaviorComponent = getBehaviorComponent(mode, distanceKm, actualMinutes);
  const weatherComponent = getWeatherComponent(weather, mode);
  const verificationComponent = getVerificationComponent({ mode, ...verification });

  // Calculate base score (0-100)
  let baseScore = Math.round(
    0.30 * modeComponent +
    0.30 * efficiencyComponent +
    0.20 * behaviorComponent +
    0.10 * weatherComponent +
    0.10 * verificationComponent
  );

  // Calculate fitness bonus (up to +20 points)
  let fitnessBonus = 0;
  if (fitnessData.calories && fitnessData.calories > 50) {
    fitnessBonus += Math.min(10, fitnessData.calories / 50);
  }
  if (fitnessData.stressRelief && fitnessData.stressRelief > 50) {
    fitnessBonus += Math.min(5, fitnessData.stressRelief / 20);
  }
  if (fitnessData.avgHeartRate && fitnessData.avgHeartRate > 80) {
    fitnessBonus += Math.min(5, (fitnessData.avgHeartRate - 80) / 10);
  }
  
  // Calculate carbon emission and savings
  const carbonData = calculateCarbonEmission({
    mode,
    distanceKm,
    vehicleType,
    fuelType
  });

  // Final eco score (can exceed 100 with fitness bonus)
  const finalScore = Math.round(baseScore + fitnessBonus);

  // Calculate carbon credits
  // Formula: (EcoScore × 0.1) + (Distance × 0.5) + (CO2 Saved × 2)
  const carbonCredits = Math.round(
    (finalScore * 0.1) + 
    (distanceKm * 0.5) + 
    (carbonData.emissionSaved * 2)
  );

  // Calculate XP with mode multiplier
  const modeMultipliers = {
    WALK: 1.5,
    CYCLE: 1.5,
    PUBLIC: 1.3,
    CAR: 1.0,
    BIKE: 1.0
  };
  const multiplier = modeMultipliers[mode?.toUpperCase()] || 1.0;
  const xpEarned = Math.round(
    ((finalScore * 0.5) + (distanceKm * 2)) * multiplier
  );

  return {
    ecoScore: Math.max(0, Math.min(120, finalScore)), // Cap at 120
    baseScore: Math.max(0, Math.min(100, baseScore)),
    fitnessBonus: Math.round(fitnessBonus),
    carbonCredits,
    xpEarned,
    co2Saved: carbonData.emissionSaved,
    co2Emitted: carbonData.totalEmission,
    treesEquivalent: carbonData.treesPlanted,
    components: {
      modeComponent: Math.round(modeComponent),
      efficiencyComponent: Math.round(efficiencyComponent),
      behaviorComponent: Math.round(behaviorComponent),
      weatherComponent: Math.round(weatherComponent),
      verificationComponent: Math.round(verificationComponent)
    },
    formula: {
      explanation: 'EcoScore = (Mode × 0.30) + (Efficiency × 0.30) + (Behavior × 0.20) + (Weather × 0.10) + (Verification × 0.10) + Fitness Bonus',
      breakdown: {
        mode: `${Math.round(modeComponent)} × 0.30 = ${Math.round(modeComponent * 0.30)}`,
        efficiency: `${Math.round(efficiencyComponent)} × 0.30 = ${Math.round(efficiencyComponent * 0.30)}`,
        behavior: `${Math.round(behaviorComponent)} × 0.20 = ${Math.round(behaviorComponent * 0.20)}`,
        weather: `${Math.round(weatherComponent)} × 0.10 = ${Math.round(weatherComponent * 0.10)}`,
        verification: `${Math.round(verificationComponent)} × 0.10 = ${Math.round(verificationComponent * 0.10)}`,
        fitnessBonus: `+${Math.round(fitnessBonus)} bonus`
      }
    }
  };
}

export {
  getModeComponent,
  getEfficiencyComponent,
  getBehaviorComponent,
  getWeatherComponent,
  getVerificationComponent,
  calculateEcoScore
};
