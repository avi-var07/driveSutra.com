import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';
import { formatDistance, formatCO2 } from '../../utils/formatNumber';
import { 
  FaBicycle, 
  FaBus, 
  FaCar, 
  FaTrain, 
  FaWalking,
  FaMotorcycle,
  FaSubway,
  FaPlane,
  FaArrowRight
} from 'react-icons/fa';

const RecentTrips = ({ trips, loading }) => {
  const navigate = useNavigate();

  const getModeIcon = (mode) => {
    const icons = {
      bike: FaBicycle,
      bus: FaBus,
      car: FaCar,
      train: FaTrain,
      walk: FaWalking,
      motorcycle: FaMotorcycle,
      subway: FaSubway,
      flight: FaPlane
    };
    return icons[mode?.toLowerCase()] || FaCar;
  };

  const getModeColor = (mode) => {
    const colors = {
      bike: 'text-green-600 bg-green-100',
      walk: 'text-blue-600 bg-blue-100',
      bus: 'text-orange-600 bg-orange-100',
      train: 'text-purple-600 bg-purple-100',
      subway: 'text-indigo-600 bg-indigo-100',
      car: 'text-red-600 bg-red-100',
      motorcycle: 'text-yellow-600 bg-yellow-100',
      flight: 'text-gray-600 bg-gray-100'
    };
    return colors[mode?.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  const getEcoRating = (co2Saved) => {
    if (co2Saved > 5) return { label: 'Excellent', color: 'text-green-600' };
    if (co2Saved > 2) return { label: 'Good', color: 'text-blue-600' };
    if (co2Saved > 0) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Low Impact', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="glass-card backdrop-blur-md bg-white/4 border border-white/6 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Trips</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card backdrop-blur-md bg-white/4 border border-white/6 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Trips</h2>
        <button
          onClick={() => navigate('/trips')}
          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-1"
        >
          View All <FaArrowRight className="text-xs" />
        </button>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">
            <FaCar className="text-5xl mx-auto mb-3" />
          </div>
          <p className="text-slate-400 mb-4">No trips recorded yet</p>
          <button
            onClick={() => navigate('/new-trip')}
            className="bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-900 px-6 py-2 rounded-full hover:brightness-110 transition-all font-medium"
          >
            Record Your First Trip
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => {
            const ModeIcon = getModeIcon(trip.mode);
            const modeColor = getModeColor(trip.mode);
            const ecoRating = getEcoRating(trip.co2Saved || 0);

            return (
              <div
                key={trip._id}
                className="flex items-center gap-4 p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => navigate('/trips')}
              >
                <div className="p-3 rounded-full bg-white/10">
                  <ModeIcon className="text-xl text-emerald-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {trip.from} → {trip.to}
                    </h3>
                    <span className="text-xs font-medium text-emerald-400">
                      {ecoRating.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{formatDistance(trip.distance)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(trip.date)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">
                    -{formatCO2(trip.co2Saved || 0)}
                  </p>
                  <p className="text-xs text-slate-400">CO₂ saved</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTrips;
