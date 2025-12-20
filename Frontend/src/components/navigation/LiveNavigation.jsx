import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Navigation.css';
import { NavigationService } from '../../services/NavigationService';
import { GPSTracker } from '../../utils/GPSTracker';
import { RouteCalculator } from '../../utils/RouteCalculator';
import NavigationPanel from './NavigationPanel';
import RouteInstructions from './RouteInstructions';
import MapClickHandler from './MapClickHandler';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon (blue dot)
const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #4285f4;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map controller component to handle map updates
function MapController({ center, userPosition, route, isNavigating }) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating && userPosition) {
      // Smooth pan to user position during navigation
      map.panTo([userPosition.lat, userPosition.lng], {
        animate: true,
        duration: 1
      });
    }
  }, [map, userPosition, isNavigating]);

  useEffect(() => {
    if (route && route.coordinates.length > 0) {
      // Fit map to show entire route
      const bounds = L.latLngBounds(route.coordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, route]);

  return null;
}

const LiveNavigation = () => {
  // State management
  const [userPosition, setUserPosition] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation data
  const [navigationData, setNavigationData] = useState({
    totalDistance: 0,
    coveredDistance: 0,
    remainingDistance: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    eta: 0,
    currentInstruction: null,
    nextInstruction: null
  });

  // Route instructions
  const [instructions, setInstructions] = useState([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);

  // Services
  const gpsTracker = useRef(null);
  const routeCalculator = useRef(null);
  const navigationService = useRef(null);

  // Initialize services
  useEffect(() => {
    gpsTracker.current = new GPSTracker();
    routeCalculator.current = new RouteCalculator();
    navigationService.current = new NavigationService();

    return () => {
      if (gpsTracker.current) {
        gpsTracker.current.stopTracking();
      }
    };
  }, []);

  // Handle GPS position updates
  const handlePositionUpdate = useCallback((position) => {
    setUserPosition(position);
    
    if (isNavigating && route) {
      // Update navigation data
      const updatedData = routeCalculator.current.updateNavigationData(
        position,
        route,
        navigationData
      );
      setNavigationData(updatedData);

      // Check for off-route and update current instruction
      const instructionUpdate = navigationService.current.updateCurrentInstruction(
        position,
        instructions,
        currentInstructionIndex
      );
      
      if (instructionUpdate.newIndex !== currentInstructionIndex) {
        setCurrentInstructionIndex(instructionUpdate.newIndex);
      }

      // Check if user is off-route
      if (navigationService.current.isOffRoute(position, route)) {
        handleReRoute(position);
      }
    }
  }, [isNavigating, route, navigationData, instructions, currentInstructionIndex]);

  // Start GPS tracking
  const startGPSTracking = useCallback(() => {
    if (gpsTracker.current) {
      gpsTracker.current.startTracking(handlePositionUpdate, (error) => {
        setError(`GPS Error: ${error.message}`);
      });
    }
  }, [handlePositionUpdate]);

  // Get user's current location
  useEffect(() => {
    startGPSTracking();
  }, [startGPSTracking]);

  // Handle destination selection
  const handleDestinationSelect = async (destinationCoords) => {
    if (!userPosition) {
      setError('Current location not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const routeData = await navigationService.current.calculateRoute(
        userPosition,
        destinationCoords
      );

      setDestination(destinationCoords);
      setRoute(routeData.mainRoute);
      setAlternativeRoutes(routeData.alternatives);
      setInstructions(routeData.instructions);
      
      // Initialize navigation data
      const initialData = routeCalculator.current.initializeNavigationData(
        routeData.mainRoute,
        userPosition
      );
      setNavigationData(initialData);
      
    } catch (err) {
      setError(`Route calculation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Start navigation
  const startNavigation = () => {
    if (route && userPosition) {
      setIsNavigating(true);
      setCurrentInstructionIndex(0);
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setAlternativeRoutes([]);
    setDestination(null);
    setInstructions([]);
    setCurrentInstructionIndex(0);
    setNavigationData({
      totalDistance: 0,
      coveredDistance: 0,
      remainingDistance: 0,
      currentSpeed: 0,
      averageSpeed: 0,
      eta: 0,
      currentInstruction: null,
      nextInstruction: null
    });
  };

  // Handle re-routing when user goes off-route
  const handleReRoute = async (currentPosition) => {
    if (!destination) return;

    try {
      const routeData = await navigationService.current.calculateRoute(
        currentPosition,
        destination
      );

      setRoute(routeData.mainRoute);
      setInstructions(routeData.instructions);
      setCurrentInstructionIndex(0);
      
      // Reset navigation data for new route
      const newData = routeCalculator.current.initializeNavigationData(
        routeData.mainRoute,
        currentPosition
      );
      setNavigationData(newData);
      
    } catch (err) {
      setError(`Re-routing failed: ${err.message}`);
    }
  };

  // Map click handler for destination selection
  const handleMapClick = (e) => {
    if (!isNavigating) {
      const coords = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      handleDestinationSelect(coords);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <MapContainer
        center={userPosition ? [userPosition.lat, userPosition.lng] : [28.6139, 77.2090]}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map Controller */}
        <MapController
          center={userPosition ? [userPosition.lat, userPosition.lng] : [28.6139, 77.2090]}
          userPosition={userPosition}
          route={route}
          isNavigating={isNavigating}
        />

        {/* Map Click Handler */}
        <MapClickHandler onMapClick={handleMapClick} isNavigating={isNavigating} />

        {/* User Position Marker */}
        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={userLocationIcon}
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} />
        )}

        {/* Main Route */}
        {route && (
          <Polyline
            positions={route.coordinates}
            color="#4285f4"
            weight={6}
            opacity={0.8}
          />
        )}

        {/* Covered Route (Green) */}
        {route && isNavigating && navigationData.coveredDistance > 0 && (
          <Polyline
            positions={route.coordinates.slice(0, Math.floor(route.coordinates.length * (navigationData.coveredDistance / navigationData.totalDistance)))}
            color="#34d399"
            weight={6}
            opacity={0.9}
          />
        )}

        {/* Alternative Routes */}
        {alternativeRoutes.map((altRoute, index) => (
          <Polyline
            key={index}
            positions={altRoute.coordinates}
            color="#9ca3af"
            weight={4}
            opacity={0.6}
          />
        ))}
      </MapContainer>

      {/* Navigation Panel */}
      <NavigationPanel
        navigationData={navigationData}
        isNavigating={isNavigating}
        isLoading={isLoading}
        error={error}
        onStartNavigation={startNavigation}
        onStopNavigation={stopNavigation}
        userPosition={userPosition}
        destination={destination}
      />

      {/* Route Instructions */}
      {isNavigating && instructions.length > 0 && (
        <RouteInstructions
          instructions={instructions}
          currentIndex={currentInstructionIndex}
          navigationData={navigationData}
        />
      )}

      {/* CSS for animations */}
    </div>
  );
};

export default LiveNavigation;