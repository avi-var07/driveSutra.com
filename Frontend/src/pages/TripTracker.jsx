import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LiveTripTracker from '../components/trips/LiveTripTracker';
import { getTripDetails } from '../services/tripService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft, FaTrophy, FaCoins, FaLeaf } from 'react-icons/fa';

export default function TripTracker() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completionResult, setCompletionResult] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await getTripDetails(tripId);
      if (response.success) {
        setTrip(response.trip);
      } else {
        setError('Trip not found');
      }
    } catch (err) {
      setError('Failed to load trip details');
      console.error('Trip details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripComplete = (result) => {
    setCompletionResult(result);
    // Auto-redirect to dashboard after 5 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner color="white" size="lg" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Trip Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              <FaArrowLeft className="text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Trip Tracking</h1>
              <p className="text-slate-400">
                {trip.startLocation.address || 'Start'} → {trip.endLocation.address || 'End'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">{trip.mode}</div>
            <div className="text-sm text-slate-400">Transport Mode</div>
          </div>
        </div>

        {/* Trip Completion Results */}
        <AnimatePresence>
          {completionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-2">Trip Completed!</h2>
                <p className="text-emerald-300">Great job on your eco-friendly journey!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                  <FaTrophy className="text-yellow-400 text-3xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{completionResult.ecoScore}</div>
                  <div className="text-sm text-slate-400">EcoScore</div>
                </div>
                
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-white">{completionResult.rewards?.xp || 0}</div>
                  <div className="text-sm text-slate-400">XP Earned</div>
                </div>
                
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                  <FaCoins className="text-yellow-500 text-3xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{completionResult.rewards?.carbonCredits || 0}</div>
                  <div className="text-sm text-slate-400">Carbon Credits</div>
                </div>
                
                <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                  <FaLeaf className="text-green-400 text-3xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{completionResult.rewards?.trees || 0}</div>
                  <div className="text-sm text-slate-400">Trees Grown</div>
                </div>
              </div>

              {completionResult.newAchievements && completionResult.newAchievements.length > 0 && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-3">🏆 New Achievements Unlocked!</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {completionResult.newAchievements.map((achievement, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-sm"
                      >
                        {achievement.icon} {achievement.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center mt-4">
                <p className="text-slate-400 text-sm">Redirecting to dashboard in 5 seconds...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Trip Tracker */}
        {!completionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <LiveTripTracker trip={trip} onTripComplete={handleTripComplete} />
          </motion.div>
        )}
      </div>
    </div>
  );
}