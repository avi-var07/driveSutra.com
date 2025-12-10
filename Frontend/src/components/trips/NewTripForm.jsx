import React, { useState } from 'react';
import { getRoute } from '../../services/tripService';
import { FaBus, FaBicycle, FaCar } from 'react-icons/fa';

const modeLabels = {
  PUBLIC: { icon: <FaBus />, label: 'Public Transport' },
  CYCLE: { icon: <FaBicycle />, label: 'Cycle / Walk' },
  CAR: { icon: <FaCar />, label: 'Car / Bike' }
};

export default function NewTripForm() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedMode, setSelectedMode] = useState('PUBLIC');
  const [error, setError] = useState('');

  // Helpers: parse simple "lat,lng" input into { lat, lng }
  const parseInput = (s) => {
    if (!s) return null;
    const parts = s.split(',').map((p) => p.trim());
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  };

  const handleGetRoute = async () => {
    setError('');
    const s = parseInput(start);
    const e = parseInput(end);
    if (!s || !e) {
      setError('Please enter start and end as "lat,lng"');
      return;
    }

    setLoading(true);
    try {
      const res = await getRoute({ start: s, end: e, mode: selectedMode });
      setRouteInfo(res);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Route lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Start a New Trip</h2>

      <div className="space-y-4 mb-4">
        <label className="block text-sm text-slate-300">Start (lat,lng)</label>
        <input className="w-full p-3 rounded bg-emerald-950/20" value={start} onChange={(e) => setStart(e.target.value)} placeholder="e.g. 12.9716,77.5946" />

        <label className="block text-sm text-slate-300">End (lat,lng)</label>
        <input className="w-full p-3 rounded bg-emerald-950/20" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="e.g. 12.9352,77.6245" />
      </div>

      <div className="mb-4">
        <div className="flex gap-3">
          {Object.keys(modeLabels).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMode(m)}
              className={`flex-1 p-3 rounded-lg text-center border ${selectedMode === m ? 'border-emerald-400 bg-emerald-900/30' : 'border-emerald-800/20'}`}
            >
              <div className="text-2xl mb-1">{modeLabels[m].icon}</div>
              <div className="text-sm">{modeLabels[m].label}</div>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-400 mb-2">{error}</div>}

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-emerald-500 rounded text-white" onClick={handleGetRoute} disabled={loading}>
          {loading ? 'Calculating...' : 'Get Route Options'}
        </button>
      </div>

      {routeInfo && (
        <div className="mt-6 p-4 bg-emerald-950/10 rounded">
          <h3 className="font-semibold mb-2">Suggested Option: {modeLabels[selectedMode].label}</h3>
          <p>Distance: <strong>{Number(routeInfo.distanceKm).toFixed(2)} km</strong></p>
          <p>Estimated time: <strong>{Number(routeInfo.durationMinutes).toFixed(1)} min</strong></p>
          <div className="mt-3">
            <button className="px-4 py-2 bg-teal-500 text-white rounded">Confirm Trip</button>
          </div>
        </div>
      )}
    </div>
  );
}
