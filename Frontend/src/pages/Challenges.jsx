import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaClock, FaUsers, FaFire, FaLeaf, FaRoute, FaStar } from 'react-icons/fa';
import { challengeService } from '../services/challengeService';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const { user } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getChallenges();
      setChallenges(response.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      await challengeService.joinChallenge(challengeId);
      fetchChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getChallengeIcon = (category) => {
    const icons = {
      'transport': '🚌',
      'distance': '📏',
      'efficiency': '⚡',
      'streak': '🔥'
    };
    return icons[category] || '🏆';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'text-green-400 bg-green-900/20',
      'medium': 'text-yellow-400 bg-yellow-900/20',
      'hard': 'text-red-400 bg-red-900/20'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-900/20';
  };

  const getTypeColor = (type) => {
    const colors = {
      'daily': 'text-blue-400 bg-blue-900/20',
      'weekly': 'text-purple-400 bg-purple-900/20',
      'monthly': 'text-orange-400 bg-orange-900/20',
      'special': 'text-pink-400 bg-pink-900/20'
    };
    return colors[type] || 'text-gray-400 bg-gray-900/20';
  };

  const getUserProgress = (challengeId) => {
    const userChallenge = user?.activeChallenges?.find(c => c.challengeId === challengeId);
    return userChallenge?.progress || 0;
  };

  const isUserJoined = (challengeId) => {
    return user?.activeChallenges?.some(c => c.challengeId === challengeId);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'active') return isUserJoined(challenge._id);
    if (filter === 'completed') return getUserProgress(challenge._id) >= 100;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading challenges...</p>
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
            Eco Challenges
          </h1>
          <p className="text-slate-400">Complete challenges to earn rewards and level up!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTrophy className="text-yellow-400 text-2xl" />
              <h3 className="font-semibold">Active Challenges</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {user?.activeChallenges?.length || 0}
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaFire className="text-red-400 text-2xl" />
              <h3 className="font-semibold">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {challenges.filter(c => getUserProgress(c._id) >= 100).length}
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaStar className="text-blue-400 text-2xl" />
              <h3 className="font-semibold">Total Rewards</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {challenges.reduce((sum, c) => sum + (c.rewards?.xp || 0), 0)} XP
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'active', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterType
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <FaTrophy className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
            <p className="text-slate-400">Check back later for new challenges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge, index) => {
              const progress = getUserProgress(challenge._id);
              const joined = isUserJoined(challenge._id);
              const completed = progress >= 100;

              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-slate-900/50 border rounded-xl p-6 hover:border-emerald-700/50 transition-all ${
                    completed ? 'border-green-500/50' : 'border-slate-800'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">
                      {getChallengeIcon(challenge.category)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                        {challenge.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg mb-2">{challenge.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{challenge.description}</p>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-emerald-400">Requirements:</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      {challenge.requirements.tripCount && (
                        <div className="flex items-center gap-2">
                          <FaRoute className="text-blue-400" />
                          <span>{challenge.requirements.tripCount} trips</span>
                        </div>
                      )}
                      {challenge.requirements.distanceKm && (
                        <div className="flex items-center gap-2">
                          <FaRoute className="text-green-400" />
                          <span>{challenge.requirements.distanceKm} km total</span>
                        </div>
                      )}
                      {challenge.requirements.modeRequired && (
                        <div className="flex items-center gap-2">
                          <span>{getChallengeIcon('transport')}</span>
                          <span>Use {challenge.requirements.modeRequired.toLowerCase()}</span>
                        </div>
                      )}
                      {challenge.requirements.consecutiveDays && (
                        <div className="flex items-center gap-2">
                          <FaFire className="text-red-400" />
                          <span>{challenge.requirements.consecutiveDays} consecutive days</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {joined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.min(100, progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            completed ? 'bg-green-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-yellow-400">Rewards:</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {challenge.rewards.xp > 0 && (
                        <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded">
                          {challenge.rewards.xp} XP
                        </span>
                      )}
                      {challenge.rewards.carbonCredits > 0 && (
                        <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded">
                          {challenge.rewards.carbonCredits} Credits
                        </span>
                      )}
                      {challenge.rewards.trees > 0 && (
                        <span className="bg-emerald-900/20 text-emerald-400 px-2 py-1 rounded">
                          {challenge.rewards.trees} Trees
                        </span>
                      )}
                      {challenge.rewards.badge && (
                        <span className="bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded">
                          Badge
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <FaUsers />
                      <span>{challenge.currentParticipants || 0} joined</span>
                    </div>
                    {completed ? (
                      <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                        ✓ Completed
                      </span>
                    ) : joined ? (
                      <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
                        In Progress
                      </span>
                    ) : (
                      <button
                        onClick={() => joinChallenge(challenge._id)}
                        className="px-4 py-2 bg-slate-700 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Join Challenge
                      </button>
                    )}
                  </div>

                  {/* Time Remaining */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-sm text-slate-400">
                    <FaClock />
                    <span>
                      Ends {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}