/**
 * personalizedRecommendationEngine.js
 * AI-powered personalized transport recommendations
 * Considers: health profile, weather, time constraints, past behavior
 */

import { calculateCarbonEmission } from './carbonEmissionCalculator.js';

/**
 * Generate personalized transport recommendations
 * @param {Object} params - Recommendation parameters
 * @returns {Array} Ranked transport options with personalization
 */
export function getPersonalizedRecommendations({
  user,
  distanceKm,
  routeOptions,
  weather,
  timeConstraints = {},
  currentTime = new Date()
}) {
  const recommendations = [];
  
  // Analyze each route option
  for (const option of routeOptions) {
    const score = calculatePersonalizationScore({
      user,
      option,
      distanceKm,
      weather,
      timeConstraints,
      currentTime
    });
    
    recommendations.push({
      ...option,
      personalizationScore: score.totalScore,
      personalizedReason: score.reason,
      healthBenefit: score.healthBenefit,
      suitabilityFactors: score.factors,
      warnings: score.warnings,
      tips: score.tips
    });
  }
  
  // Sort by personalization score (highest first)
  recommendations.sort((a, b) => b.personalizationScore - a.personalizationScore);
  
  // Add rank
  recommendations.forEach((rec, index) => {
    rec.rank = index + 1;
    rec.recommended = index === 0;
  });
  
  return recommendations;
}

/**
 * Calculate personalization score for a transport option
 */
function calculatePersonalizationScore({
  user,
  option,
  distanceKm,
  weather,
  timeConstraints,
  currentTime
}) {
  let totalScore = 50; // Base score
  const factors = [];
  const warnings = [];
  const tips = [];
  let reason = '';
  let healthBenefit = 'moderate';
  
  const mode = option.mode.toUpperCase();
  const healthProfile = user.healthProfile || {};
  const travelBehavior = user.travelBehavior || {};
  
  // 1. HEALTH PROFILE ANALYSIS (Weight: 30%)
  const healthScore = analyzeHealthSuitability({
    mode,
    distanceKm,
    healthProfile,
    weather
  });
  totalScore += healthScore.score * 0.3;
  factors.push(...healthScore.factors);
  warnings.push(...healthScore.warnings);
  tips.push(...healthScore.tips);
  healthBenefit = healthScore.benefit;
  
  // 2. WEATHER CONDITIONS (Weight: 20%)
  const weatherScore = analyzeWeatherSuitability({
    mode,
    weather,
    healthProfile
  });
  totalScore += weatherScore.score * 0.2;
  factors.push(...weatherScore.factors);
  warnings.push(...weatherScore.warnings);
  tips.push(...weatherScore.tips);
  
  // 3. TIME CONSTRAINTS (Weight: 25%)
  const timeScore = analyzeTimeConstraints({
    mode,
    option,
    timeConstraints,
    currentTime
  });
  totalScore += timeScore.score * 0.25;
  factors.push(...timeScore.factors);
  warnings.push(...timeScore.warnings);
  tips.push(...timeScore.tips);
  
  // 4. PAST BEHAVIOR (Weight: 15%)
  const behaviorScore = analyzePastBehavior({
    mode,
    travelBehavior,
    currentTime
  });
  totalScore += behaviorScore.score * 0.15;
  factors.push(...behaviorScore.factors);
  
  // 5. ENVIRONMENTAL IMPACT (Weight: 10%)
  const envScore = analyzeEnvironmentalImpact({
    mode,
    distanceKm,
    user
  });
  totalScore += envScore.score * 0.1;
  factors.push(...envScore.factors);
  
  // Generate personalized reason
  reason = generatePersonalizedReason({
    mode,
    healthScore,
    weatherScore,
    timeScore,
    behaviorScore,
    envScore,
    distanceKm
  });
  
  return {
    totalScore: Math.round(totalScore),
    reason,
    healthBenefit,
    factors,
    warnings,
    tips
  };
}

/**
 * Analyze health suitability
 */
function analyzeHealthSuitability({ mode, distanceKm, healthProfile, weather }) {
  let score = 0;
  const factors = [];
  const warnings = [];
  const tips = [];
  let benefit = 'moderate';
  
  const { bmi, activityLevel, fitnessGoal, medicalConditions = [], 
          walkingCapacity = 5, cyclingCapacity = 15, age } = healthProfile;
  
  switch (mode) {
    case 'WALK':
      // Check if distance is within walking capacity
      if (distanceKm <= walkingCapacity) {
        score += 30;
        factors.push(`Distance (${distanceKm.toFixed(1)}km) within your walking comfort zone`);
        benefit = 'high';
      } else if (distanceKm <= walkingCapacity * 1.5) {
        score += 15;
        factors.push(`Slightly longer than usual, but good exercise`);
        warnings.push(`This is ${(distanceKm - walkingCapacity).toFixed(1)}km more than your usual walking distance`);
        benefit = 'high';
      } else {
        score -= 20;
        warnings.push(`Distance (${distanceKm.toFixed(1)}km) exceeds your comfortable walking range`);
        benefit = 'low';
      }
      
      // BMI considerations
      if (bmi && bmi > 30) {
        if (distanceKm < 2) {
          score += 20;
          factors.push('Short walk - excellent for gradual fitness improvement');
          tips.push('Start with shorter walks and gradually increase distance');
        } else {
          score -= 10;
          warnings.push('Consider shorter distances initially for comfort');
        }
      }
      
      // Age considerations
      if (age && age > 60) {
        if (distanceKm < 3) {
          score += 15;
          factors.push('Moderate distance - great for maintaining mobility');
        } else {
          warnings.push('Consider taking breaks during longer walks');
        }
      }
      
      // Medical conditions
      if (medicalConditions.includes('knee_pain') || medicalConditions.includes('arthritis')) {
        score -= 15;
        warnings.push('Walking may aggravate knee/joint pain');
        tips.push('Consider public transport or cycling for longer distances');
      }
      
      // Fitness goal alignment
      if (fitnessGoal === 'weight_loss' || fitnessGoal === 'fitness') {
        score += 20;
        factors.push('Aligns perfectly with your fitness goals');
        tips.push(`Walking ${distanceKm.toFixed(1)}km burns ~${Math.round(distanceKm * 60)} calories`);
      }
      
      break;
      
    case 'CYCLE':
      // Check if distance is within cycling capacity
      if (distanceKm <= cyclingCapacity) {
        score += 30;
        factors.push(`Distance (${distanceKm.toFixed(1)}km) perfect for cycling`);
        benefit = 'very_high';
      } else if (distanceKm <= cyclingCapacity * 1.3) {
        score += 15;
        factors.push(`Good cycling distance with moderate effort`);
        benefit = 'high';
      } else {
        score -= 15;
        warnings.push(`Distance (${distanceKm.toFixed(1)}km) may be tiring`);
        benefit = 'moderate';
      }
      
      // Activity level
      if (activityLevel === 'sedentary' || activityLevel === 'light') {
        if (distanceKm > 10) {
          score -= 20;
          warnings.push('Long cycling distance for your current activity level');
          tips.push('Build up cycling endurance gradually');
        }
      }
      
      // Medical conditions
      if (medicalConditions.includes('asthma')) {
        score -= 10;
        warnings.push('Cycling may trigger asthma - carry inhaler');
        tips.push('Maintain steady pace, avoid overexertion');
      }
      
      if (medicalConditions.includes('back_pain')) {
        score -= 15;
        warnings.push('Cycling posture may aggravate back pain');
      }
      
      // Fitness goal alignment
      if (fitnessGoal === 'fitness' || fitnessGoal === 'health') {
        score += 25;
        factors.push('Excellent cardio workout for your goals');
        tips.push(`Cycling ${distanceKm.toFixed(1)}km burns ~${Math.round(distanceKm * 40)} calories`);
      }
      
      break;
      
    case 'PUBLIC':
      // Generally suitable for most people
      score += 15;
      factors.push('Comfortable option for all fitness levels');
      benefit = 'low';
      
      // Good for those with physical limitations
      if (medicalConditions.length > 0 || (bmi && bmi > 35)) {
        score += 20;
        factors.push('Recommended for your health profile');
      }
      
      // Environmental goal alignment
      if (fitnessGoal === 'environment') {
        score += 15;
        factors.push('Eco-friendly choice aligns with your goals');
      }
      
      break;
      
    case 'CAR':
    case 'BIKE':
      // Minimal health benefit
      score -= 10;
      benefit = 'none';
      
      // Only recommend if health constraints exist
      if (medicalConditions.length > 2 || (age && age > 70)) {
        score += 15;
        factors.push('Suitable given health considerations');
      } else {
        warnings.push('Consider active transport for health benefits');
      }
      
      break;
  }
  
  return { score, factors, warnings, tips, benefit };
}

/**
 * Analyze weather suitability
 */
function analyzeWeatherSuitability({ mode, weather, healthProfile }) {
  let score = 0;
  const factors = [];
  const warnings = [];
  const tips = [];
  
  const { condition = 'clear', temp = 25, humidity, windSpeed } = weather;
  const conditionLower = condition.toLowerCase();
  
  switch (mode) {
    case 'WALK':
    case 'CYCLE':
      // Rain
      if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        score -= 30;
        warnings.push('Rainy weather - not ideal for outdoor activity');
        tips.push('Consider public transport or wait for weather to clear');
        
        if (mode === 'CYCLE') {
          score -= 10; // Extra penalty for cycling in rain
          warnings.push('Cycling in rain is dangerous - reduced visibility and traction');
        }
      }
      
      // Extreme heat
      if (temp > 35) {
        score -= 25;
        warnings.push(`Very hot (${temp}°C) - risk of heat exhaustion`);
        tips.push('If you must go, carry water and take frequent breaks');
        
        if (healthProfile.medicalConditions?.includes('heart_condition')) {
          score -= 20;
          warnings.push('Extreme heat dangerous for heart conditions');
        }
      } else if (temp > 30) {
        score -= 10;
        warnings.push(`Hot weather (${temp}°C) - stay hydrated`);
        tips.push('Wear light clothing and sunscreen');
      }
      
      // Cold weather
      if (temp < 5) {
        score -= 20;
        warnings.push(`Cold weather (${temp}°C) - dress warmly`);
        tips.push('Wear layers and protect extremities');
        
        if (healthProfile.medicalConditions?.includes('asthma')) {
          score -= 15;
          warnings.push('Cold air may trigger asthma');
        }
      }
      
      // Pleasant weather bonus
      if (temp >= 15 && temp <= 25 && conditionLower.includes('clear')) {
        score += 20;
        factors.push('Perfect weather for outdoor activity!');
      }
      
      // Fog/mist
      if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
        score -= 15;
        warnings.push('Poor visibility - be extra cautious');
      }
      
      break;
      
    case 'PUBLIC':
      // Public transport less affected by weather
      if (conditionLower.includes('rain') || temp > 35 || temp < 5) {
        score += 20;
        factors.push('Weather-protected option');
      }
      break;
      
    case 'CAR':
    case 'BIKE':
      // Slightly affected by extreme weather
      if (conditionLower.includes('rain') || conditionLower.includes('fog')) {
        score -= 5;
        warnings.push('Drive carefully in poor weather');
      }
      break;
  }
  
  return { score, factors, warnings, tips };
}

/**
 * Analyze time constraints
 */
function analyzeTimeConstraints({ mode, option, timeConstraints, currentTime }) {
  let score = 0;
  const factors = [];
  const warnings = [];
  const tips = [];
  
  const { isUrgent, maxTimeMinutes, preferFastest } = timeConstraints;
  const tripDuration = option.durationMinutes || option.etaMinutes || 0;
  
  if (isUrgent || preferFastest) {
    // Prioritize fastest option
    if (mode === 'CAR' || mode === 'BIKE') {
      score += 30;
      factors.push('Fastest option for urgent travel');
    } else if (mode === 'PUBLIC') {
      score += 15;
      factors.push('Reasonably fast option');
    } else {
      score -= 20;
      warnings.push('Slower option - may not meet time constraints');
    }
  }
  
  if (maxTimeMinutes && tripDuration > maxTimeMinutes) {
    score -= 30;
    warnings.push(`Trip duration (${tripDuration} min) exceeds your time limit (${maxTimeMinutes} min)`);
  }
  
  // Rush hour considerations
  const hour = currentTime.getHours();
  const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
  
  if (isRushHour) {
    if (mode === 'CAR') {
      score -= 20;
      warnings.push('Rush hour traffic - expect delays');
      tips.push('Consider public transport or cycling to avoid traffic');
    } else if (mode === 'PUBLIC') {
      score += 10;
      factors.push('Avoids rush hour traffic');
    } else if (mode === 'CYCLE') {
      score += 15;
      factors.push('Fastest option during rush hour');
    }
  }
  
  return { score, factors, warnings, tips };
}

/**
 * Analyze past behavior
 */
function analyzePastBehavior({ mode, travelBehavior, currentTime }) {
  let score = 0;
  const factors = [];
  
  const { mostUsedMode, modeFrequency = {}, peakTravelTime } = travelBehavior;
  
  // Prefer frequently used modes (user comfort)
  if (mostUsedMode === mode) {
    score += 15;
    factors.push('Your most frequently used mode');
  }
  
  const modeCount = modeFrequency[mode] || 0;
  if (modeCount > 10) {
    score += 10;
    factors.push('You have experience with this mode');
  } else if (modeCount === 0) {
    score -= 5;
    factors.push('New mode - try something different!');
  }
  
  // Time of day preference
  const hour = currentTime.getHours();
  let currentPeriod = 'morning';
  if (hour >= 12 && hour < 17) currentPeriod = 'afternoon';
  else if (hour >= 17 && hour < 21) currentPeriod = 'evening';
  else if (hour >= 21 || hour < 6) currentPeriod = 'night';
  
  if (peakTravelTime === currentPeriod) {
    score += 5;
  }
  
  return { score, factors };
}

/**
 * Analyze environmental impact
 */
function analyzeEnvironmentalImpact({ mode, distanceKm, user }) {
  let score = 0;
  const factors = [];
  
  const emission = calculateCarbonEmission({
    mode,
    distanceKm,
    vehicleType: user.vehicleType,
    fuelType: user.fuelType
  });
  
  if (emission.emissionSaved > 0) {
    score += Math.min(30, emission.savingsPercentage / 3);
    factors.push(`Saves ${emission.emissionSaved.toFixed(2)}kg CO2 vs driving`);
  }
  
  if (mode === 'WALK' || mode === 'CYCLE') {
    score += 20;
    factors.push('Zero emissions - maximum environmental benefit');
  } else if (mode === 'PUBLIC') {
    score += 15;
    factors.push('Low emissions - eco-friendly choice');
  }
  
  return { score, factors };
}

/**
 * Generate personalized reason
 */
function generatePersonalizedReason({
  mode,
  healthScore,
  weatherScore,
  timeScore,
  behaviorScore,
  envScore,
  distanceKm
}) {
  const reasons = [];
  
  // Primary reason (highest scoring factor)
  const scores = [
    { name: 'health', score: healthScore.score, factors: healthScore.factors },
    { name: 'weather', score: weatherScore.score, factors: weatherScore.factors },
    { name: 'time', score: timeScore.score, factors: timeScore.factors },
    { name: 'behavior', score: behaviorScore.score, factors: behaviorScore.factors },
    { name: 'environment', score: envScore.score, factors: envScore.factors }
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  // Add top 2 reasons
  if (scores[0].factors.length > 0) {
    reasons.push(scores[0].factors[0]);
  }
  if (scores[1].factors.length > 0 && scores[1].score > 10) {
    reasons.push(scores[1].factors[0]);
  }
  
  return reasons.join('. ') || `Suitable option for ${distanceKm.toFixed(1)}km trip`;
}

export default {
  getPersonalizedRecommendations,
  calculatePersonalizationScore
};
