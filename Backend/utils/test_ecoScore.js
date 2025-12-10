import { calculateEcoScore } from './ecoScoreCalculator.js';

function runSamples() {
  const cases = [
    {
      name: 'Public transport typical',
      input: {
        mode: 'PUBLIC',
        distanceKm: 12,
        etaMinutes: 30,
        actualMinutes: 32,
        weather: { condition: 'clear', temp: 25 },
        verification: { ticketVerified: true }
      }
    },
    {
      name: 'Cycle - good effort in heat',
      input: {
        mode: 'CYCLE',
        distanceKm: 5,
        etaMinutes: 25,
        actualMinutes: 27,
        weather: { condition: 'hot', temp: 34 },
        verification: { stepsMatch: true, avgSpeed: 11 }
      }
    },
    {
      name: 'Car - inefficient/fast',
      input: {
        mode: 'CAR',
        distanceKm: 40,
        etaMinutes: 50,
        actualMinutes: 40,
        weather: { condition: 'rain', temp: 18 },
        verification: { avgSpeed: 60 }
      }
    }
  ];

  cases.forEach((c) => {
    const res = calculateEcoScore(c.input);
    console.log('---', c.name, '---');
    console.log('ecoScore:', res.ecoScore);
    console.log('components:', res.components);
    console.log();
  });
}

runSamples();
