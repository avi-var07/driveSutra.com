import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

export const mapService = {
  // Geocoding: Address -> Coordinates
  searchLocation: async (query) => {
    try {
      const response = await axios.get(NOMINATIM_BASE_URL, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  },

  // Reverse Geocoding: Coordinates -> Address
  getAddress: async (lat, lon) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting address:', error);
      throw error;
    }
  },

  // Routing: Start -> End
  getRoute: async (start, end, mode = 'driving') => {
    // mode can be 'driving', 'walking', 'cycling' (OSRM profiles: driving, walking, bike)
    const profile = mode === 'cycling' ? 'bike' : mode === 'walking' ? 'foot' : 'driving';
    
    try {
      const url = `${OSRM_BASE_URL}/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}`;
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson'
        }
      });

      if (response.data.code !== 'Ok') {
        throw new Error('No route found');
      }

      return response.data.routes[0]; // Returns { distance, duration, geometry }
    } catch (error) {
      console.error('Error fetching route:', error);
      throw error;
    }
  }
};
