import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLocationArrow, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { MdMyLocation, MdLocationOn } from 'react-icons/md';

export default function CurrentLocationPicker({ onLocationSelect, selectedLocation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        
        const location = {
          lat: latitude,
          lng: longitude,
          name: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          address: data.display_name || 'Current Location'
        };

        setCurrentLocation(location);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        const location = {
          lat: latitude,
          lng: longitude,
          name: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          address: 'Current Location'
        };
        
        setCurrentLocation(location);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('Location access denied. Please enable location permissions.');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information unavailable. Please try again.');
          break;
        case error.TIMEOUT:
          setError('Location request timed out. Please try again.');
          break;
        default:
          setError('Failed to get current location. Please try again.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location on component mount
  useEffect(() => {
    if (!selectedLocation) {
      getCurrentLocation();
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Current Location Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={getCurrentLocation}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
          currentLocation
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
      >
        {loading ? (
          <>
            <FaSpinner className="text-xl animate-spin" />
            <span>Getting your location...</span>
          </>
        ) : currentLocation ? (
          <>
            <MdMyLocation className="text-xl text-emerald-400" />
            <span>Current Location Detected</span>
          </>
        ) : (
          <>
            <FaLocationArrow className="text-xl" />
            <span>Use Current Location</span>
          </>
        )}
      </motion.button>

      {/* Current Location Display */}
      {currentLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <MdLocationOn className="text-emerald-400 text-xl mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-emerald-300 mb-1">Current Location</h4>
              <p className="text-sm text-slate-300 break-words">{currentLocation.address}</p>
              <p className="text-xs text-slate-400 mt-1">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="text-red-400 text-xl mt-1">⚠️</div>
            <div>
              <h4 className="font-semibold text-red-300 mb-1">Location Error</h4>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={getCurrentLocation}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location Permissions Help */}
      {error && error.includes('denied') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
        >
          <h4 className="font-semibold text-blue-300 mb-2">Enable Location Access</h4>
          <div className="text-sm text-blue-200 space-y-1">
            <p>1. Click the location icon in your browser's address bar</p>
            <p>2. Select "Allow" for location permissions</p>
            <p>3. Refresh the page and try again</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}