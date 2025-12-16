import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRoute, FaClock, FaLeaf, FaStar, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { tripService } from '../services/tripService';
import { formatDate } from '../utils/formatDate';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, in_progress, planned
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTrips();
  }, [filter, page]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getUserTrips({ 
        page, 
        limit: 10, 
        status: filter === 'all' ? undefined : filter 
      });
      setTrips(response.trips);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode) => {
    const icons = {
      'PUBLIC': '🚌',
      'WALK': '🚶',
      'CYCLE': '🚴',
      'CAR': '🚗',
      'BIKE': '🏍️'
    };
    return icons[mode] || '🚗';
  };

  const getModeColor = (mode) => {
    const colors = {
      'PUBLIC': 'bg-blue-500',
      'WALK': 'bg-green-500',
      'CYCLE': 'bg-emerald-500',
      'CAR': 'bg-orange-500',
      'BIKE': 'bg-red-500'
    };
    return colors[mode] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'text-green-400 bg-green-900/20',
      'in_progress': 'text-yellow-400 bg-yellow-900/20',
      'planned': 'text-blue-400 bg-blue-900/20',
      'cancelled': 'text-red-400 bg-red-900/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-900/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Your Trips
          </h1>
          <p className="text-slate-400">Track your eco-friendly journey</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'completed', 'in_progress', 'planned'].map((status) => (
            <button
              key={status}
              onClick={() => {setFilter(status); setPage(1);}}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <FaRoute className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips found</h3>
            <p className="text-slate-400 mb-6">Start your eco-friendly journey today!</p>
            <Link
              to="/trip/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FaRoute />
              Start New Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getModeColor(trip.mode)} rounded-lg flex items-center justify-center text-2xl`}>
                      {getModeIcon(trip.mode)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{trip.mode} Trip</h3>
                      <p className="text-slate-400 text-sm">
                        <FaCalendarAlt className="inline mr-1" />
                        {formatDate(trip.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-400">Distance</p>
                      <p className="font-semibold">{trip.distanceKm.toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="font-semibold">
                        {trip.actualMinutes || trip.etaMinutes} min
                      </p>
                    </div>
                  </div>
                  {trip.ecoScore > 0 && (
                    <div className="flex items-center gap-2">
                      <FaLeaf className="text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">Eco Score</p>
                        <p className="font-semibold">{trip.ecoScore}/100</p>
                      </div>
                    </div>
                  )}
                  {trip.xpEarned > 0 && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <div>
                        <p className="text-xs text-slate-400">XP Earned</p>
                        <p className="font-semibold">{trip.xpEarned}</p>
                      </div>
                    </div>
                  )}
                </div>

                {trip.status === 'completed' && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>🌱 {trip.treesGrown || 0} trees</span>
                      <span>💨 {trip.co2Saved?.toFixed(1) || 0} kg CO₂ saved</span>
                      <span>⭐ {trip.carbonCreditsEarned || 0} credits</span>
                    </div>
                    <Link
                      to={`/trips/${trip._id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-400">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}