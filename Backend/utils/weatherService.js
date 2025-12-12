// Weather service using OpenWeatherMap API
// You can also use other weather APIs like WeatherAPI, AccuWeather, etc.

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function getWeatherData(lat, lng) {
  try {
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not configured, using default weather data');
      return {
        condition: 'clear',
        temp: 25,
        description: 'Clear sky'
      };
    }

    const url = `${WEATHER_BASE_URL}?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      condition: mapWeatherCondition(data.weather[0].main),
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      raw: data
    };
    
  } catch (err) {
    console.error('Weather service error:', err.message);
    
    // Return default weather data on error
    return {
      condition: 'clear',
      temp: 25,
      description: 'Weather data unavailable'
    };
  }
}

// Map OpenWeatherMap conditions to our simplified conditions
function mapWeatherCondition(condition) {
  const conditionMap = {
    'Clear': 'clear',
    'Clouds': 'cloudy',
    'Rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'storm',
    'Snow': 'snow',
    'Mist': 'fog',
    'Fog': 'fog',
    'Haze': 'fog',
    'Dust': 'dust',
    'Sand': 'dust',
    'Smoke': 'fog'
  };
  
  return conditionMap[condition] || 'clear';
}

// Get weather for multiple locations (for route planning)
export async function getRouteWeather(startLat, startLng, endLat, endLng) {
  try {
    const [startWeather, endWeather] = await Promise.all([
      getWeatherData(startLat, startLng),
      getWeatherData(endLat, endLng)
    ]);
    
    // Use the worse weather condition for trip scoring
    const conditions = [startWeather.condition, endWeather.condition];
    const worstCondition = getWorstWeatherCondition(conditions);
    const avgTemp = Math.round((startWeather.temp + endWeather.temp) / 2);
    
    return {
      condition: worstCondition,
      temp: avgTemp,
      description: `${startWeather.description} to ${endWeather.description}`,
      start: startWeather,
      end: endWeather
    };
    
  } catch (err) {
    console.error('Route weather error:', err.message);
    return getWeatherData(startLat, startLng); // Fallback to start location weather
  }
}

// Determine the worst weather condition for scoring
function getWorstWeatherCondition(conditions) {
  const severityOrder = ['clear', 'cloudy', 'fog', 'dust', 'rain', 'snow', 'storm'];
  
  let worstIndex = 0;
  for (const condition of conditions) {
    const index = severityOrder.indexOf(condition);
    if (index > worstIndex) {
      worstIndex = index;
    }
  }
  
  return severityOrder[worstIndex];
}

export default {
  getWeatherData,
  getRouteWeather
};