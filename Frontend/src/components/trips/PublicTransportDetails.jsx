import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import publicTransportService from '../../services/publicTransportService';

export default function PublicTransportDetails({ startLocation, endLocation }) {
  const [loading, setLoading] = useState(true);
  const [transportOptions, setTransportOptions] = useState(null);
  const [selectedMode, setSelectedMode] = useState('metro');

  useEffect(() => {
    fetchPublicTransportOptions();
  }, [startLocation, endLocation]);

  const fetchPublicTransportOptions = async () => {
    try {
      setLoading(true);
      const result = await publicTransportService.getPublicTransportRoute(
        startLocation.lat,
        startLocation.lng,
        endLocation.lat,
        endLocation.lng
      );

      if (result.success) {
        setTransportOptions(result.suggestions);
        // Auto-select first available mode
        if (result.suggestions.metro) setSelectedMode('metro');
        else if (result.suggestions.bus) setSelectedMode('bus');
        else if (result.suggestions.auto) setSelectedMode('auto');
      }
    } catch (error) {
      console.error('Failed to fetch public transport options:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-400">Loading public transport options...</p>
      </div>
    );
  }

  if (!transportOptions) {
    return (
      <div className="p-6 text-center text-slate-400">
        No public transport options available for this route
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex gap-2 p-2 bg-slate-800/50 rounded-lg">
        {transportOptions.metro && (
          <button
            onClick={() => setSelectedMode('metro')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedMode === 'metro'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🚇 Metro
          </button>
        )}
        {transportOptions.bus && (
          <button
            onClick={() => setSelectedMode('bus')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedMode === 'bus'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🚌 Bus
          </button>
        )}
        {transportOptions.auto && (
          <button
            onClick={() => setSelectedMode('auto')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              selectedMode === 'auto'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🛺 Auto
          </button>
        )}
      </div>

      {/* Mode Details */}
      <AnimatePresence mode="wait">
        {selectedMode === 'metro' && transportOptions.metro && (
          <MetroDetails key="metro" data={transportOptions.metro} />
        )}
        {selectedMode === 'bus' && transportOptions.bus && (
          <BusDetails key="bus" data={transportOptions.bus} />
        )}
        {selectedMode === 'auto' && transportOptions.auto && (
          <AutoDetails key="auto" data={transportOptions.auto} />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetroDetails({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Summary Card */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">₹{data.estimatedFare}</div>
            <div className="text-xs text-slate-400">Fare</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{data.estimatedTime} min</div>
            <div className="text-xs text-slate-400">Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{data.totalStations}</div>
            <div className="text-xs text-slate-400">Stations</div>
          </div>
        </div>
      </div>

      {/* Start Station */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚶</div>
          <div className="flex-1">
            <div className="font-semibold text-white">{data.startStation.name}</div>
            <div className="text-sm text-slate-400">
              Walk {data.startStation.walkTime} min ({data.startStation.distance.toFixed(1)} km)
            </div>
            <div className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              {data.startStation.line}
            </div>
          </div>
        </div>
      </div>

      {/* Route Details */}
      <div className="space-y-2">
        {data.route.map((segment, idx) => (
          <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚇</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="font-semibold text-white">{segment.line}</div>
                </div>
                <div className="text-sm text-slate-300">
                  {segment.from} → {segment.to}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {segment.stations} stations • {segment.direction}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interchanges */}
      {data.interchanges && data.interchanges.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="font-semibold text-yellow-400 mb-2">🔄 Interchange Required</div>
          {data.interchanges.map((interchange, idx) => (
            <div key={idx} className="text-sm text-slate-300">
              At <span className="font-semibold">{interchange.station}</span>: Change from{' '}
              {interchange.fromLine} to {interchange.toLine} ({interchange.walkTime} min walk)
            </div>
          ))}
        </div>
      )}

      {/* End Station */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚶</div>
          <div className="flex-1">
            <div className="font-semibold text-white">{data.endStation.name}</div>
            <div className="text-sm text-slate-400">
              Walk {data.endStation.walkTime} min ({data.endStation.distance.toFixed(1)} km) to destination
            </div>
            <div className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              {data.endStation.line}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="font-semibold text-white mb-3">📋 Step-by-Step Instructions</div>
        <ol className="space-y-2">
          {data.instructions.map((instruction, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300">
              <span className="font-semibold text-blue-400">{idx + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Platform Information */}
      {data.platforms && data.platforms.length > 0 && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="font-semibold text-white mb-3">🚉 Platform Information</div>
          {data.platforms.map((platform, idx) => (
            <div key={idx} className="text-sm text-slate-300 mb-2">
              <span className="font-semibold">{platform.station}:</span> {platform.platform} -{' '}
              {platform.direction}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function BusDetails({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Summary */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">₹{data.estimatedFare}</div>
            <div className="text-xs text-slate-400">Fare</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{data.estimatedTime} min</div>
            <div className="text-xs text-slate-400">Time</div>
          </div>
        </div>
      </div>

      {/* Start Stop */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚶</div>
          <div className="flex-1">
            <div className="font-semibold text-white">{data.startStop.name}</div>
            <div className="text-sm text-slate-400">
              Walk {data.startStop.walkTime} min ({data.startStop.distance.toFixed(1)} km)
            </div>
          </div>
        </div>
      </div>

      {/* Bus Routes */}
      <div className="space-y-2">
        <div className="font-semibold text-white">🚌 Available Bus Routes</div>
        {data.routes.map((route, idx) => (
          <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-600 text-white font-bold rounded">
                  {route.number}
                </div>
                <div className="font-semibold text-white">{route.name}</div>
              </div>
              <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                {route.type}
              </div>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <div>→ {route.destination}</div>
              <div className="text-slate-400">
                {route.stops} stops • Every {route.frequency} • {route.operator}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* End Stop */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚶</div>
          <div className="flex-1">
            <div className="font-semibold text-white">{data.endStop.name}</div>
            <div className="text-sm text-slate-400">
              Walk {data.endStop.walkTime} min ({data.endStop.distance.toFixed(1)} km) to destination
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="font-semibold text-white mb-3">📋 Instructions</div>
        <ol className="space-y-2">
          {data.instructions.map((instruction, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300">
              <span className="font-semibold text-green-400">{idx + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

function AutoDetails({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Summary */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">₹{data.estimatedFare}</div>
            <div className="text-xs text-slate-400">Est. Fare</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{data.estimatedTime} min</div>
            <div className="text-xs text-slate-400">Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{data.distance.toFixed(1)} km</div>
            <div className="text-xs text-slate-400">Distance</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="font-semibold text-white mb-3">📋 How to Take Auto</div>
        <ol className="space-y-2">
          {data.instructions.map((instruction, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300">
              <span className="font-semibold text-yellow-400">{idx + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="font-semibold text-blue-400 mb-3">💡 Tips for Auto Rickshaw</div>
        <ul className="space-y-2">
          {data.tips.map((tip, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-slate-300">
              <span>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Fare Breakdown */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="font-semibold text-white mb-2">💰 Fare Breakdown</div>
        <div className="text-sm text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span>Base Fare:</span>
            <span>₹25</span>
          </div>
          <div className="flex justify-between">
            <span>Distance ({data.distance.toFixed(1)} km × ₹12/km):</span>
            <span>₹{Math.round(data.distance * 12)}</span>
          </div>
          <div className="flex justify-between font-semibold text-yellow-400 pt-2 border-t border-slate-700">
            <span>Estimated Total:</span>
            <span>₹{data.estimatedFare}</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          * Actual fare may vary based on traffic and waiting time
        </div>
      </div>
    </motion.div>
  );
}
