import React, { useState } from 'react';
import LiveNavigation from './LiveNavigation';
import { FaMapMarkedAlt, FaRoute, FaPlay } from 'react-icons/fa';

const NavigationDemo = () => {
  const [showNavigation, setShowNavigation] = useState(false);

  const handleStartDemo = () => {
    setShowNavigation(true);
  };

  if (showNavigation) {
    return <LiveNavigation />;
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4">
        <div className="text-center">
          <FaMapMarkedAlt className="text-blue-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Live Navigation
          </h1>
          <p className="text-gray-600 mb-6">
            Experience Google-Maps-like navigation using only free services:
          </p>
          
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3">
              <FaRoute className="text-green-500" />
              <span className="text-sm">OpenStreetMap tiles</span>
            </div>
            <div className="flex items-center gap-3">
              <FaRoute className="text-green-500" />
              <span className="text-sm">OSRM routing engine</span>
            </div>
            <div className="flex items-center gap-3">
              <FaRoute className="text-green-500" />
              <span className="text-sm">Real-time GPS tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <FaRoute className="text-green-500" />
              <span className="text-sm">Turn-by-turn directions</span>
            </div>
            <div className="flex items-center gap-3">
              <FaRoute className="text-green-500" />
              <span className="text-sm">Speed & ETA calculations</span>
            </div>
          </div>

          <button
            onClick={handleStartDemo}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mx-auto"
          >
            <FaPlay size={16} />
            Start Navigation Demo
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Click on the map to set destination, then click Start to begin navigation
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;