import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRoute, FaClock, FaGasPump, FaLeaf, FaTachometerAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { MdSpeed, MdDirections, MdEco } from 'react-icons/md';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different transport modes
const createModeIcon = (mode, color) => {
  const icons = {
    'WALK': '🚶',
    'CYCLE': '🚴',
    'CAR': '🚗',
    'PUBLIC': '🚌'
  };
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 15px rgba(0,0,0,0.3); font-size: 16px;">
      ${icons[mode] || '📍'}
    </div>`,
    className: 'custom-mode-icon',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5]
  });
};

const startIcon = createModeIcon('START', '#10B981');
const endIcon = createModeIcon('END', '#EF4444');

// Component to fit map bounds to show all routes
function MapBoundsFitter({ routes, startPos, endPos }) {
  const map = useMap();
  
  useEffect(() => {
    if (routes.length > 0 && startPos && endPos) {
      const bounds = L.latLngBounds([startPos, endPos]);
      
      // Add route points to bounds
      routes.forEach(route => {
        if (route.geometry && route.geometry.coordinates) {
          route.geometry.coordinates.forEach(coord => {
            bounds.extend([coord[1], coord[0]]); // GeoJSON uses [lng, lat]
          });
        }
      });
      
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [routes, startPos, endPos, map]);
  
  return null;
}

// Speed suggestion component
function SpeedSuggestionCard({ speedSuggestion, mode, weather }) {
  if (!speedSuggestion || mode !== 'CAR') return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30"
    >
      <div className="flex items-center gap-3 mb-3">
        <FaTachometerAlt className="text-blue-400 text-xl" />
        <h3 className="text-lg font-semibold text-white">Speed Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{speedSuggestion.min}</div>
          <div className="text-xs text-slate-400">Min Speed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{speedSuggestion.optimal}</div>
          <div className="text-xs text-slate-400">Optimal</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{speedSuggestion.max}</div>
          <div className="text-xs text-slate-400">Max Speed</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3">
        <MdEco className="text-green-400" />
        <span>{speedSuggestion.ecoTip}</span>
      </div>
      
      {weather && weather.condition !== 'clear' && (
        <div className="mt-2 text-xs text-yellow-300 bg-yellow-500/20 rounded-lg p-2">
          ⚠️ Weather: {weather.condition} - Drive carefully and adjust speed accordingly
        </div>
      )}
    </motion.div>
  );
}

// Route option card component
function RouteOptionCard({ route, isSelected, onSelect, weather }) {
  const getModeColor = (mode) => {
    const colors = {
      'WALK': '#4CAF50',
      'CYCLE': '#2196F3', 
      'CAR': '#FF9800',
      'PUBLIC': '#9C27B0'
    };
    return colors[mode] || '#666666';
  };
  
  const getModeGradient = (mode) => {
    const gradients = {
      'WALK': 'from-green-500 to-emerald-500',
      'CYCLE': 'from-blue-500 to-cyan-500',
      'CAR': 'from-orange-500 to-red-500',
      'PUBLIC': 'from-purple-500 to-pink-500'
    };
    return gradients[mode] || 'from-gray-500 to-gray-600';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-500/10' 
          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getModeGradient(route.mode)} flex items-center justify-center text-xl`}>
            {route.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{route.mode}</h3>
            <p className="text-sm text-slate-400">{route.ecoLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{route.estimatedEcoScore}</div>
          <div className="text-xs text-slate-400">Eco Score</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <FaRoute className="text-blue-400" />
          <div>
            <div className="text-sm font-semibold text-white">{route.distanceKm.toFixed(1)} km</div>
            <div className="text-xs text-slate-400">Distance</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-yellow-400" />
          <div>
            <div className="text-sm font-semibold text-white">{Math.round(route.durationMinutes)} min</div>
            <div className="text-xs text-slate-400">Duration</div>
          </div>
        </div>
      </div>
      
      {/* Speed suggestion for cars */}
      {route.speedSuggestion && (
        <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <MdSpeed className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Recommended Speed</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">{route.speedSuggestion.min} km/h</span>
            <span className="text-blue-400 font-bold">{route.speedSuggestion.optimal} km/h</span>
            <span className="text-yellow-400">{route.speedSuggestion.max} km/h</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{route.speedSuggestion.ecoTip}</div>
        </div>
      )}
      
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-600 pt-3 mt-3"
        >
          <div className="text-xs text-emerald-300">✓ Route selected - Ready to start trip</div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function EnhancedRouteDisplay({ 
  routes = [], 
  startLocation, 
  endLocation, 
  weather,
  selectedRoute,
  onRouteSelect,
  onStartTrip 
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  useEffect(() => {
    if (startLocation && endLocation) {
      const centerLat = (startLocation.lat + endLocation.lat) / 2;
      const centerLng = (startLocation.lng + endLocation.lng) / 2;
      setMapCenter([centerLat, centerLng]);
    }
  }, [startLocation, endLocation]);
  
  if (!mapCenter || routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading route options...</p>
        </div>
      </div>
    );
  }
  
  const startPos = [startLocation.lat, startLocation.lng];
  const endPos = [endLocation.lat, endLocation.lng];
  const currentRoute = routes[selectedRouteIndex];
  
  // Convert route geometry to Leaflet format
  const getRouteCoordinates = (geometry) => {
    if (!geometry) return [];
    
    if (geometry.type === 'LineString') {
      return geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
    }
    
    return [];
  };
  
  const handleRouteSelect = (index) => {
    setSelectedRouteIndex(index);
    if (onRouteSelect) {
      onRouteSelect(routes[index]);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Route Options */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route, index) => (
          <RouteOptionCard
            key={index}
            route={route}
            isSelected={index === selectedRouteIndex}
            onSelect={() => handleRouteSelect(index)}
            weather={weather}
          />
        ))}
      </div>
      
      {/* Speed Suggestions for selected route */}
      {currentRoute && (
        <SpeedSuggestionCard 
          speedSuggestion={currentRoute.speedSuggestion}
          mode={currentRoute.mode}
          weather={weather}
        />
      )}
      
      {/* Enhanced Map */}
      <div className="relative h-96 rounded-xl overflow-hidden border border-slate-700">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Fit bounds to show all routes */}
          <MapBoundsFitter routes={routes} startPos={startPos} endPos={endPos} />
          
          {/* Start marker */}
          <Marker position={startPos} icon={startIcon}>
            <Popup>
              <div className="text-center">
                <strong>🚀 Start Location</strong>
                <br />
                {startLocation.address || `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)}`}
              </div>
            </Popup>
          </Marker>
          
          {/* End marker */}
          <Marker position={endPos} icon={endIcon}>
            <Popup>
              <div className="text-center">
                <strong>🏁 Destination</strong>
                <br />
                {endLocation.address || `${endLocation.lat.toFixed(4)}, ${endLocation.lng.toFixed(4)}`}
              </div>
            </Popup>
          </Marker>
          
          {/* Route polylines */}
          {routes.map((route, index) => {
            const coordinates = getRouteCoordinates(route.geometry);
            if (coordinates.length === 0) return null;
            
            return (
              <Polyline
                key={index}
                positions={coordinates}
                color={route.color || '#666666'}
                weight={index === selectedRouteIndex ? 6 : 4}
                opacity={index === selectedRouteIndex ? 0.9 : 0.6}
                dashArray={index === selectedRouteIndex ? null : '10, 10'}
              />
            );
          })}
        </MapContainer>
        
        {/* Map overlay with route info */}
        <div className="absolute top-4 left-4 bg-slate-800/90 rounded-lg p-3 text-white z-10">
          <div className="text-sm font-semibold mb-1">Selected Route: {currentRoute?.mode}</div>
          <div className="text-xs text-slate-300">
            {currentRoute?.distanceKm.toFixed(1)} km • {Math.round(currentRoute?.durationMinutes)} min
          </div>
          {currentRoute?.speedSuggestion && (
            <div className="text-xs text-blue-300 mt-1">
              Optimal: {currentRoute.speedSuggestion.optimal} km/h
            </div>
          )}
        </div>
        
        {/* Weather info */}
        {weather && weather.condition !== 'clear' && (
          <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2 text-yellow-300 z-10">
            <div className="text-xs font-semibold">Weather Alert</div>
            <div className="text-xs">{weather.condition} • {weather.temp}°C</div>
          </div>
        )}
      </div>
      
      {/* Start Trip Button */}
      {currentRoute && onStartTrip && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartTrip(currentRoute)}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
          >
            <MdDirections className="text-xl" />
            Start {currentRoute.mode} Trip
          </motion.button>
        </div>
      )}
    </div>
  );
}