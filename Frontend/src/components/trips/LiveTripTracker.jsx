import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaStop, FaPause, FaMapMarkerAlt, FaClock, FaRoute, FaHeartbeat, FaFire } from 'react-icons/fa';
import { MdSpeed, MdMyLocation, MdFitnessCenter } from 'react-icons/md';
import { startTrip, completeTrip } from '../../services/tripService';
import googleFitService from '../../services/googleFitService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 14px;">${icon}</span>
    </div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const startIcon = createCustomIcon('#10B981', '🚀');
const endIcon = createCustomIcon('#EF4444', '🏁');
const currentIcon = createCustomIcon('#3B82F6', '📍');

// Component to update map view and follow user
function MapUpdater({ center, zoom, followUser }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && followUser) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map, followUser]);
  
  return null;
}

export default function LiveTripTracker({ trip, onTripComplete }) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tripPath, setTripPath] = useState([]);
  const [tripStats, setTripStats] = useState({
    distance: 0,
    duration: 0,
    avgSpeed: 0,
    maxSpeed: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [fitnessData, setFitnessData] = useState(null);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [showFitnessStats, setShowFitnessStats] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastPositionRef = useRef(null);
  const speedsRef = useRef([]);

  // Check if trip is already in progress and restore state
  useEffect(() => {
    const savedTripState = localStorage.getItem(`trip_${trip._id}`);
    if (savedTripState) {
      const state = JSON.parse(savedTripState);
      if (state.isTracking && trip.status === 'in_progress') {
        setIsTracking(true);
        setTripStarted(true);
        setTripPath(state.tripPath || []);
        setTripStats(state.tripStats || { distance: 0, duration: 0, avgSpeed: 0, maxSpeed: 0 });
        startTimeRef.current = state.startTime || Date.now();
        speedsRef.current = state.speeds || [];
        console.log('Restored trip state from localStorage');
      }
    }
  }, [trip._id, trip.status]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(pos);
          
          // If trip is in progress, start tracking immediately
          if (trip.status === 'in_progress' && !isTracking) {
            console.log('Trip in progress, starting tracking...');
            startPositionTracking();
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, [trip.status]);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Save trip state to localStorage
  const saveTripState = () => {
    const state = {
      isTracking,
      tripPath,
      tripStats,
      startTime: startTimeRef.current,
      speeds: speedsRef.current
    };
    localStorage.setItem(`trip_${trip._id}`, JSON.stringify(state));
  };

  // Clear trip state from localStorage
  const clearTripState = () => {
    localStorage.removeItem(`trip_${trip._id}`);
  };

  // Connect to Google Fit for walking/cycling trips
  const connectGoogleFit = async () => {
    try {
      if (trip.mode === 'WALK' || trip.mode === 'CYCLE') {
        const connection = await googleFitService.connectGoogleFit();
        if (connection && connection.success) {
          setGoogleFitConnected(true);
          setShowFitnessStats(true);
        }
      }
    } catch (error) {
      console.error('Failed to connect Google Fit:', error);
    }
  };

  // Start position tracking function
  const startPositionTracking = () => {
    if (!navigator.geolocation || watchIdRef.current) return;

    console.log('Starting position tracking...');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = [position.coords.latitude, position.coords.longitude];
        const speed = position.coords.speed ? Math.max(0, position.coords.speed * 3.6) : 0; // Convert m/s to km/h
        const accuracy = position.coords.accuracy;
        
        console.log(`Position update: ${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}, Speed: ${speed.toFixed(1)} km/h, Accuracy: ${accuracy}m`);
        
        // Only update if accuracy is reasonable (less than 100 meters)
        if (accuracy > 100) {
          console.log('Low accuracy position ignored:', accuracy);
          return;
        }
        
        setCurrentPosition(newPos);
        
        // Update trip path
        setTripPath(prev => {
          const lastPos = prev[prev.length - 1];
          if (lastPos && calculateDistance(lastPos[0], lastPos[1], newPos[0], newPos[1]) < 0.003) {
            return prev; // Don't add if movement is less than 3 meters
          }
          const newPath = [...prev, newPos];
          return newPath;
        });
        
        // Update stats with better calculation
        if (lastPositionRef.current && startTimeRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current[0], lastPositionRef.current[1],
            newPos[0], newPos[1]
          );
          
          // Only update if there's meaningful movement (more than 2 meters)
          if (distance > 0.002) {
            setTripStats(prev => {
              const newDistance = prev.distance + distance;
              const duration = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
              const avgSpeed = duration > 0.1 ? (newDistance / duration) * 60 : 0; // km/h
              
              // Track speeds for max speed (use GPS speed if available, otherwise calculated)
              const currentSpeed = speed > 0 ? speed : (distance > 0 && duration > 0 ? (distance / (duration / 60)) : 0);
              if (currentSpeed > 0 && currentSpeed < 200) { // Sanity check
                speedsRef.current.push(currentSpeed);
              }
              const maxSpeed = Math.max(prev.maxSpeed, currentSpeed);
              
              const newStats = {
                distance: newDistance,
                duration,
                avgSpeed,
                maxSpeed
              };
              
              console.log('Stats updated:', newStats);
              return newStats;
            });
            
            lastPositionRef.current = newPos;
          }
        } else {
          lastPositionRef.current = newPos;
        }
        
        // Save state periodically
        if (isTracking) {
          saveTripState();
        }
      },
      (error) => {
        console.error('Error watching position:', error);
        setError('Error tracking location. Please check your GPS settings and ensure you\'re outdoors for better signal.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );
  };

  // Start trip tracking
  const handleStartTrip = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if trip is already started
      if (trip.status === 'in_progress') {
        console.log('Trip already in progress, just starting tracking...');
        setIsTracking(true);
        setTripStarted(true);
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }
        if (currentPosition) {
          setTripPath(prev => prev.length === 0 ? [currentPosition] : prev);
          lastPositionRef.current = currentPosition;
        }
        startPositionTracking();
        return;
      }
      
      // Connect to Google Fit for walking/cycling
      if (trip.mode === 'WALK' || trip.mode === 'CYCLE') {
        await connectGoogleFit();
      }
      
      // Start trip on backend
      await startTrip(trip._id);
      
      setIsTracking(true);
      setTripStarted(true);
      startTimeRef.current = Date.now();
      
      if (currentPosition) {
        setTripPath([currentPosition]);
        lastPositionRef.current = currentPosition;
      }
      
      // Reset stats
      setTripStats({
        distance: 0,
        duration: 0,
        avgSpeed: 0,
        maxSpeed: 0
      });
      speedsRef.current = [];
      
      // Start position tracking
      startPositionTracking();
      
      // Save initial state
      saveTripState();
      
    } catch (err) {
      setError('Failed to start trip tracking: ' + err.message);
      console.error('Start trip error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stop trip tracking
  const handleStopTrip = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Stop watching position
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Get Google Fit data for walking/cycling trips
      let googleFitData = null;
      if (googleFitConnected && (trip.mode === 'WALK' || trip.mode === 'CYCLE')) {
        try {
          googleFitData = await googleFitService.getFitnessData(
            startTimeRef.current,
            Date.now()
          );
          setFitnessData(googleFitData);
        } catch (error) {
          console.error('Failed to get Google Fit data:', error);
        }
      }

      // Complete trip on backend
      const completionData = {
        actualMinutes: Math.max(1, tripStats.duration), // Ensure at least 1 minute
        verification: {
          avgSpeed: tripStats.avgSpeed,
          maxSpeed: tripStats.maxSpeed,
          speedViolations: speedsRef.current.filter(s => s > 80).length
        },
        fitnessData: googleFitData,
        stepsData: googleFitData ? {
          steps: googleFitData.steps,
          distance: googleFitData.distance,
          calories: googleFitData.calories,
          source: 'google_fit'
        } : null
      };
      
      console.log('Completing trip with data:', completionData);
      const result = await completeTrip(trip._id, completionData);
      
      setIsTracking(false);
      setTripStarted(false);
      
      // Clear saved state
      clearTripState();
      
      // Call parent callback with results
      if (onTripComplete) {
        onTripComplete(result);
      }
      
    } catch (err) {
      setError('Failed to complete trip: ' + err.message);
      console.error('Complete trip error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update duration every second when tracking
  useEffect(() => {
    let interval;
    if (isTracking && startTimeRef.current) {
      interval = setInterval(() => {
        setTripStats(prev => ({
          ...prev,
          duration: (Date.now() - startTimeRef.current) / 1000 / 60 // minutes
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (!currentPosition) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Getting your location...</p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const mapCenter = currentPosition || [trip.startLocation.lat, trip.startLocation.lng];
  const startPos = [trip.startLocation.lat, trip.startLocation.lng];
  const endPos = [trip.endLocation.lat, trip.endLocation.lng];

  return (
    <div className="space-y-6">
      {/* Trip Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/50 rounded-xl p-4 text-center"
        >
          <FaRoute className="text-emerald-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{tripStats.distance.toFixed(2)}</div>
          <div className="text-sm text-slate-400">Distance (km)</div>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-xl p-4 text-center"
        >
          <FaClock className="text-blue-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{Math.round(tripStats.duration)}</div>
          <div className="text-sm text-slate-400">Time (min)</div>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-xl p-4 text-center"
        >
          <MdSpeed className="text-yellow-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{Math.round(tripStats.avgSpeed)}</div>
          <div className="text-sm text-slate-400">Avg Speed (km/h)</div>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-xl p-4 text-center"
        >
          <MdSpeed className="text-red-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{Math.round(tripStats.maxSpeed)}</div>
          <div className="text-sm text-slate-400">Max Speed (km/h)</div>
        </motion.div>
      </div>

      {/* Google Fit Stats for Walking/Cycling */}
      <AnimatePresence>
        {showFitnessStats && fitnessData && (trip.mode === 'WALK' || trip.mode === 'CYCLE') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MdFitnessCenter className="text-emerald-400" />
                Fitness Tracking
              </h3>
              <div className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                Google Fit Connected
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">👟</div>
                <div className="text-xl font-bold text-white">{fitnessData.steps}</div>
                <div className="text-sm text-slate-400">Steps</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <FaFire className="text-orange-400 text-2xl mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{Math.round(fitnessData.calories)}</div>
                <div className="text-sm text-slate-400">Calories</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <FaHeartbeat className="text-red-400 text-2xl mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{Math.round(fitnessData.avgHeartRate)}</div>
                <div className="text-sm text-slate-400">Avg BPM</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">😌</div>
                <div className="text-xl font-bold text-white">{fitnessData.stressRelief}</div>
                <div className="text-sm text-slate-400">Stress Relief</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="relative h-96 rounded-xl overflow-hidden border border-slate-700">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Update map center when position changes */}
          <MapUpdater center={currentPosition} zoom={16} followUser={followUser && isTracking} />
          
          {/* Start marker */}
          <Marker position={startPos} icon={startIcon}>
            <Popup>
              <div className="text-center">
                <strong>Start Location</strong>
                <br />
                {trip.startLocation.address || 'Trip Start'}
              </div>
            </Popup>
          </Marker>
          
          {/* End marker */}
          <Marker position={endPos} icon={endIcon}>
            <Popup>
              <div className="text-center">
                <strong>End Location</strong>
                <br />
                {trip.endLocation.address || 'Trip End'}
              </div>
            </Popup>
          </Marker>
          
          {/* Current position marker */}
          {currentPosition && (
            <Marker position={currentPosition} icon={currentIcon}>
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  <br />
                  Speed: {Math.round(tripStats.avgSpeed)} km/h
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Planned route (if available) */}
          {trip.routeGeometry && trip.routeGeometry.coordinates && (
            <Polyline
              positions={trip.routeGeometry.coordinates.map(coord => [coord[1], coord[0]])}
              color={trip.color || '#6B7280'}
              weight={3}
              opacity={0.5}
              dashArray="10, 10"
            />
          )}
          
          {/* Actual trip path */}
          {tripPath.length > 1 && (
            <Polyline
              positions={tripPath}
              color="#10B981"
              weight={5}
              opacity={0.9}
            />
          )}
        </MapContainer>
      </div>

      {/* Map Controls */}
      {isTracking && (
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setFollowUser(!followUser)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              followUser 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {followUser ? '📍 Following' : '🗺️ Free View'}
          </button>
          
          {(trip.mode === 'WALK' || trip.mode === 'CYCLE') && !googleFitConnected && (
            <button
              onClick={connectGoogleFit}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-300"
            >
              Connect Google Fit
            </button>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <AnimatePresence>
          {!isTracking ? (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTrip}
              disabled={loading || !currentPosition}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FaPlay className="text-lg" />
              {loading ? 'Starting...' : !currentPosition ? 'Getting Location...' : trip.status === 'in_progress' ? 'Resume Tracking' : 'Start Trip'}
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStopTrip}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FaStop className="text-lg" />
              {loading ? 'Completing...' : 'Complete Trip'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}