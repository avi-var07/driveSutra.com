import React from 'react';

const formatMeters = (m) => {
  if (m == null) return '--';
  if (m >= 1000) return (m/1000).toFixed(2) + ' km';
  return Math.round(m) + ' m';
};

const NavigationSidebar = ({start, end, naviState, onSetEnd}) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Live Navigation</h2>
      <div className="mb-3">
        <div><strong>Start:</strong> {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : 'Detecting...'}</div>
        <div><strong>End:</strong> {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : 'Click map to set'}</div>
      </div>

      <div className="mb-3">
        <div><strong>Speed:</strong> {naviState ? `${naviState.currentSpeedKph} km/h` : '--'}</div>
        <div><strong>Avg Speed:</strong> {naviState ? `${naviState.avgSpeedKph} km/h` : '--'}</div>
        <div><strong>ETA:</strong> {naviState && naviState.etaMinutes != null ? `${Math.max(0,naviState.etaMinutes).toFixed(1)} min` : '--'}</div>
      </div>

      <div className="mb-3">
        <div><strong>Total:</strong> {naviState ? formatMeters(naviState.totalDistance) : '--'}</div>
        <div><strong>Covered:</strong> {naviState ? formatMeters(naviState.coveredDistance) : '--'}</div>
        <div><strong>Remaining:</strong> {naviState ? formatMeters(naviState.remainingDistance) : '--'}</div>
      </div>

      <div className="mt-4 overflow-auto max-h-96">
        <h3 className="font-semibold mb-2">Directions</h3>
        {!naviState || !naviState.steps || !naviState.steps.length ? (
          <div className="text-sm text-gray-400">No route yet. Click the map to set destination.</div>
        ) : (
          <ol className="list-decimal ml-4">
            {naviState.steps.map((s, idx) => (
              <li key={idx} className={`mb-2 ${naviState.currentStepIndex === idx ? 'text-green-300' : ''}`}>
                <div>{s.maneuver && s.maneuver.instruction ? s.maneuver.instruction : s.name || 'Proceed'}</div>
                <div className="text-xs text-gray-300">{s.distance ? `${Math.round(s.distance)} m` : ''}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

    </div>
  );
};

export default NavigationSidebar;
