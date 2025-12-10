/**
 * ecoScoreCalculator.js
 * Implements the ecoScore components and final weighted score.
 */

function getModeComponent(mode) {
  if (!mode) return 50;
  const m = mode.toUpperCase();
  if (m === 'PUBLIC') return 100;
  if (m === 'WALK' || m === 'CYCLE') return 95;
  if (m === 'CAR' || m === 'BIKE') return 60;
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
  verification = {}
}) {
  const modeComponent = getModeComponent(mode);
  const efficiencyComponent = getEfficiencyComponent(distanceKm, etaMinutes, actualMinutes);
  const behaviorComponent = getBehaviorComponent(mode, distanceKm, actualMinutes);
  const weatherComponent = getWeatherComponent(weather, mode);
  const verificationComponent = getVerificationComponent({ mode, ...verification });

  const score = Math.round(
    0.30 * modeComponent +
    0.30 * efficiencyComponent +
    0.20 * behaviorComponent +
    0.10 * weatherComponent +
    0.10 * verificationComponent
  );

  return {
    ecoScore: Math.max(0, Math.min(100, score)),
    components: {
      modeComponent,
      efficiencyComponent,
      behaviorComponent,
      weatherComponent,
      verificationComponent
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
