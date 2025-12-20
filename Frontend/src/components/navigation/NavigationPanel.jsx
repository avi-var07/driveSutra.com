import React from 'react';
import { FaPlay, FaStop, FaTachometerAlt, FaClock, FaRoute, FaMapMarkerAlt } from 'react-icons/fa';

const NavigationPanel = ({
  navigationData,
  isNavigating,
  isLoading,
  error,
  onStartNavigation,
  onStopNavigation,
  userPosition,
  destination
}) => {
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const formatSpeed = (kmh) => {
    return `${Math.round(kmh)} km/h`;
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 min-w-80 z-1000">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
        {isNavigating ? (
          <button
            onClick={onStopNavigation}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            <FaStop size={12} />
            Stop
          </button>
        ) : (
          destination && (
            <button
              onClick={onStartNavigation}
              disabled={isLoading || !userPosition}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-md transition-colors"
            >
              <FaPlay size={12} />
              Start
            </button>
          )
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
          <p className="text-blue-700 text-sm">Calculating route...</p>
        </div>
      )}

      {/* Location Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaMapMarkerAlt className="text-green-500" size={14} />
          <span className="text-sm font-medium">Current Location</span>
        </div>
        {userPosition ? (
          <p className="text-xs text-gray-600 ml-5">
            {userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-xs text-red-600 ml-5">Location not available</p>
        )}
      </div>

      {/* Destination */}
      {destination && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-red-500" size={14} />
            <span className="text-sm font-medium">Destination</span>
          </div>
          <p className="text-xs text-gray-600 ml-5">
            {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Navigation Stats */}
      {isNavigating && (
        <div className="space-y-3">
          {/* Distance Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <FaRoute className="text-blue-500" size={14} />
                <span className="text-xs font-medium text-gray-700">Total</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatDistance(navigationData.totalDistance)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <FaRoute className="text-green-500" size={14} />
                <span className="text-xs font-medium text-gray-700">Remaining</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatDistance(navigationData.remainingDistance)}
              </p>
            </div>
          </div>

          {/* Speed Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <FaTachometerAlt className="text-orange-500" size={14} />
                <span className="text-xs font-medium text-gray-700">Current</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatSpeed(navigationData.currentSpeed)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <FaTachometerAlt className="text-purple-500" size={14} />
                <span className="text-xs font-medium text-gray-700">Average</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatSpeed(navigationData.averageSpeed)}
              </p>
            </div>
          </div>

          {/* ETA */}
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <FaClock className="text-blue-500" size={14} />
              <span className="text-xs font-medium text-gray-700">Estimated Time</span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {formatTime(navigationData.eta)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs text-gray-600">
                {Math.round((navigationData.coveredDistance / navigationData.totalDistance) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(navigationData.coveredDistance / navigationData.totalDistance) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for non-navigating state */}
      {!isNavigating && !destination && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-2">Click on the map to set destination</p>
          <p className="text-xs text-gray-500">Then click Start to begin navigation</p>
        </div>
      )}
    </div>
  );
};

export default NavigationPanel;