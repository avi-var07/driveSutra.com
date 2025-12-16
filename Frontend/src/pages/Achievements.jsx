import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar, FaLock, FaCheck, FaFire, FaLeaf, FaRoute, FaCrown } from 'react-icons/fa';
import { achievementService } from '../services/achievementService';
import { useAuth } from '../context/AuthContext';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await achievementService.getAchievements();
      setAchievements(response.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId) => {
    return user?.unlockedAchievements?.includes(achievementId) || false;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'common': 'from-gray-500 to-gray-600',
      'rare': 'from-blue-500 to-blue-600',
      'epic': 'from-purple-500 to-purple-600',
      'legendary': 'from-yellow-500 to-orange-500'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity) => {
    const borders = {
      'common': 'border-gray-500/50',
      'rare': 'border-blue-500/50',
      'epic': 'border-purple-500/50',
      'legendary': 'border-yellow-500/50'
    };
    return borders[rarity] || borders.common;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'beginner': '🌱',
      'transport': '🚌',
      'distance': '📏',
      'efficiency': '⚡',
      'environmental': '🌍',
      'streak': '🔥'
    };
    return icons[category] || '🏆';
  };

  const categories = ['all', 'beginner', 'transport', 'distance', 'efficiency', 'environmental', 'streak'];

  const filteredAchievements = achievements.filter(achievement => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unlocked' && isUnlocked(achievement.id)) ||
      (filter === 'locked' && !isUnlocked(achievement.id));
    
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    
    return matchesFilter && matchesCategory;
  });

  const unlockedCount = achievements.filter(a => isUnlocked(a.id)).length;
  const totalXP = achievements
    .filter(a => isUnlocked(a.id))
    .reduce((sum, a) => sum + (a.rewards?.xp || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading achievements...</p>
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
            Achievements
          </h1>
          <p className="text-slate-400">Unlock badges and earn rewards for your eco-friendly actions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTrophy className="text-yellow-400 text-2xl" />
              <h3 className="font-semibold">Unlocked</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {unlockedCount}/{achievements.length}
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaStar className="text-blue-400 text-2xl" />
              <h3 className="font-semibold">Total XP</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{totalXP}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaMedal className="text-purple-400 text-2xl" />
              <h3 className="font-semibold">Completion</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaCrown className="text-orange-400 text-2xl" />
              <h3 className="font-semibold">Legendary</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {achievements.filter(a => a.rarity === 'legendary' && isUnlocked(a.id)).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'unlocked', 'locked'].map((filterType) => (
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

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category !== 'all' && <span>{getCategoryIcon(category)}</span>}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <FaTrophy className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No achievements found</h3>
            <p className="text-slate-400">Try different filters or start completing trips to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement, index) => {
              const unlocked = isUnlocked(achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-slate-900/50 border rounded-xl p-6 transition-all hover:scale-105 ${
                    unlocked 
                      ? `${getRarityBorder(achievement.rarity)} shadow-lg` 
                      : 'border-slate-800 opacity-75'
                  }`}
                >
                  {/* Rarity Glow Effect */}
                  {unlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(achievement.rarity)} opacity-10 rounded-xl`} />
                  )}

                  {/* Header */}
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          unlocked 
                            ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unlocked ? (
                        <FaCheck className="text-green-400 text-xl" />
                      ) : (
                        <FaLock className="text-slate-500 text-xl" />
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-bold text-lg mb-2 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-4 ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                    {achievement.description}
                  </p>

                  {/* Requirements */}
                  {!achievement.isHidden && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 text-emerald-400">Requirements:</h4>
                      <div className="space-y-1 text-sm text-slate-400">
                        {achievement.requirements.tripCount && (
                          <div className="flex items-center gap-2">
                            <FaRoute className="text-blue-400" />
                            <span>{achievement.requirements.tripCount} trips</span>
                          </div>
                        )}
                        {achievement.requirements.totalDistance && (
                          <div className="flex items-center gap-2">
                            <FaRoute className="text-green-400" />
                            <span>{achievement.requirements.totalDistance} km total</span>
                          </div>
                        )}
                        {achievement.requirements.ecoScoreAverage && (
                          <div className="flex items-center gap-2">
                            <FaLeaf className="text-emerald-400" />
                            <span>{achievement.requirements.ecoScoreAverage}+ avg eco score</span>
                          </div>
                        )}
                        {achievement.requirements.streakDays && (
                          <div className="flex items-center gap-2">
                            <FaFire className="text-red-400" />
                            <span>{achievement.requirements.streakDays} day streak</span>
                          </div>
                        )}
                        {achievement.requirements.co2Saved && (
                          <div className="flex items-center gap-2">
                            <span>💨</span>
                            <span>{achievement.requirements.co2Saved} kg CO₂ saved</span>
                          </div>
                        )}
                        {achievement.requirements.treesGrown && (
                          <div className="flex items-center gap-2">
                            <span>🌳</span>
                            <span>{achievement.requirements.treesGrown} trees grown</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  {unlocked && achievement.rewards && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 text-yellow-400">Rewards:</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {achievement.rewards.xp > 0 && (
                          <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded">
                            +{achievement.rewards.xp} XP
                          </span>
                        )}
                        {achievement.rewards.carbonCredits > 0 && (
                          <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded">
                            +{achievement.rewards.carbonCredits} Credits
                          </span>
                        )}
                        {achievement.rewards.title && (
                          <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded">
                            Title: {achievement.rewards.title}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{getCategoryIcon(achievement.category)}</span>
                      {achievement.category}
                    </span>
                    {unlocked && (
                      <span className="text-xs text-green-400 font-medium">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>

                  {/* Unlock Animation */}
                  {unlocked && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <div className={`w-full h-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} opacity-20 rounded-xl`} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}