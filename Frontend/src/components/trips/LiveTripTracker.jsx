import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaStop, FaPause, FaMapMarkerAlt, FaClock, FaRoute } from 'react-icons/fa';
import { MdSpeed, MdMyLocation } from 'react-icons/md';
import { startTrip, completeTrip } from '../../services/tripService';
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
  
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastPositionRef = useRef(null);
  const speedsRef = useRef([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(pos);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

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

  // Start trip tracking
  const handleStartTrip = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Start trip on backend
      await startTrip(trip._id);
      
      setIsTracking(true);
      startTimeRef.current = Date.now();
      setTripPath([currentPosition]);
      lastPositionRef.current = currentPosition;
      
      // Start watching position
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newPos = [position.coords.latitude, position.coords.longitude];
            const speed = position.coords.speed ? (position.coords.speed * 3.6) : 0; // Convert m/s to km/h
            const accuracy = position.coords.accuracy;
            
            // Only update if accuracy is reasonable (less than 50 meters)
            if (accuracy > 50) {
              console.log('Low accuracy position ignored:', accuracy);
              return;
            }
            
            setCurrentPosition(newPos);
            setTripPath(prev => {
              // Avoid adding duplicate positions
              const lastPos = prev[prev.length - 1];
              if (lastPos && calculateDistance(lastPos[0], lastPos[1], newPos[0], newPos[1]) < 0.005) {
                return prev; // Don't add if movement is less than 5 meters
              }
              return [...prev, newPos];
            });
            
            // Update stats
            if (lastPositionRef.current) {
              const distance = calculateDistance(
                lastPositionRef.current[0], lastPositionRef.current[1],
                newPos[0], newPos[1]
              );
              
              // Only update if there's meaningful movement
              if (distance > 0.001) { // More than 1 meter
                setTripStats(prev => {
                  const newDistance = prev.distance + distance;
                  const duration = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
                  const avgSpeed = duration > 0 ? (newDistance / duration) * 60 : 0; // km/h
                  
                  // Track speeds for max speed
                  if (speed > 0) {
                    speedsRef.current.push(speed);
                  }
                  const maxSpeed = Math.max(prev.maxSpeed, speed);
                  
                  return {
                    distance: newDistance,
                    duration,
                    avgSpeed,
                    maxSpeed
                  };
                });
                
                lastPositionRef.current = newPos;
              }
            } else {
              lastPositionRef.current = newPos;
            }
          },
          (error) => {
            console.error('Error watching position:', error);
            setError('Error tracking location. Please check your GPS settings and ensure you\'re outdoors for better signal.');
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 2000
          }
        );
      }
    } catch (err) {
      setError('Failed to start trip tracking');
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
      
      // Complete trip on backend
      const completionData = {
        actualMinutes: tripStats.duration,
        verification: {
          avgSpeed: tripStats.avgSpeed,
          maxSpeed: tripStats.maxSpeed,
          speedViolations: speedsRef.current.filter(s => s > 80).length
        }
      };
      
      const result = await completeTrip(trip._id, completionData);
      
      setIsTracking(false);
      
      // Call parent callback with results
      if (onTripComplete) {
        onTripComplete(result);
      }
      
    } catch (err) {
      setError('Failed to complete trip');
      console.error('Complete trip error:', err);
    } finally {
      setLoading(false);
    }
  };

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
          
          {/* Trip path */}
          {tripPath.length > 1 && (
            <Polyline
              positions={tripPath}
              color="#10B981"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Map Controls */}
      {isTracking && (
        <div className="flex justify-center mb-4">
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
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FaPlay className="text-lg" />
              {loading ? 'Starting...' : 'Start Trip'}
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