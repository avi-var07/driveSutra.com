import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaTrophy, FaGift, FaCrown, FaFire, FaLeaf } from 'react-icons/fa';
import { MdRedeem, MdCheckCircle, MdError } from 'react-icons/md';
import { getAvailableRewards, redeemReward, getUserRewards, getLeaderboard } from '../services/rewardService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const categoryIcons = {
  food: '🍛',
  transport: '🚌',
  shopping: '🛒',
  entertainment: '🎭',
  eco: '🌿',
  travel: '🚂'
};

const leaderboardTypes = [
  { key: 'ecoScore', label: 'EcoScore', icon: '🌟' },
  { key: 'xp', label: 'Experience', icon: '⭐' },
  { key: 'co2Saved', label: 'CO₂ Saved', icon: '🌍' },
  { key: 'streak', label: 'Streak', icon: '🔥' },
  { key: 'trees', label: 'Trees', icon: '🌳' },
  { key: 'carbonCredits', label: 'Credits', icon: '💰' }
];

export default function Rewards() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('ecoScore');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, leaderboardType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'rewards') {
        const rewardsResponse = await getAvailableRewards();
        if (rewardsResponse.success) {
          setRewards(rewardsResponse.rewards);
        }
      } else if (activeTab === 'my-rewards') {
        const userRewardsResponse = await getUserRewards();
        if (userRewardsResponse.success) {
          setUserRewards(userRewardsResponse.userRewards);
        }
      } else if (activeTab === 'leaderboard') {
        const leaderboardResponse = await getLeaderboard(leaderboardType, 20);
        if (leaderboardResponse.success) {
          setLeaderboard(leaderboardResponse.leaderboard);
        }
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    try {
      setRedeemingId(rewardId);
      setError('');
      
      const response = await redeemReward(rewardId);
      if (response.success) {
        setSuccess('Reward redeemed successfully! 🎉');
        // Refresh rewards to update user's carbon credits
        fetchData();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const formatExpiryDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'redeemed': return 'text-green-400 bg-green-400/20';
      case 'used': return 'text-blue-400 bg-blue-400/20';
      case 'expired': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

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
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🏆 Rewards & Leaderboard
          </h1>
          <p className="text-slate-400 text-lg">
            Redeem your carbon credits for amazing Indian rewards and compete with eco-warriors!
          </p>
          
          {user && (
            <div className="flex justify-center items-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <FaCoins className="text-yellow-400" />
                <span className="text-white font-semibold">{user.carbonCredits || 0} Credits</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <FaTrophy className="text-emerald-400" />
                <span className="text-white font-semibold">EcoScore: {user.ecoScore || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <FaCrown className="text-blue-400" />
                <span className="text-white font-semibold">Level {user.level || 1}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
            {[
              { key: 'rewards', label: 'Available Rewards', icon: FaGift },
              { key: 'my-rewards', label: 'My Rewards', icon: MdRedeem },
              { key: 'leaderboard', label: 'Leaderboard', icon: FaTrophy }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="text-lg" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 flex items-center gap-2 max-w-2xl mx-auto"
            >
              <MdError className="text-lg" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 max-w-2xl mx-auto"
            >
              <MdCheckCircle className="text-lg" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <LoadingSpinner color="white" size="lg" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Available Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={reward._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 ${
                        reward.featured ? 'ring-2 ring-yellow-500/50' : ''
                      }`}
                    >
                      {reward.featured && (
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                          ⭐ FEATURED
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{reward.icon}</div>
                          <div>
                            <h3 className="font-bold text-white">{reward.title}</h3>
                            <p className="text-sm text-slate-400">{reward.brand}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            {reward.carbonCreditsCost} <FaCoins className="inline text-sm" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-4">{reward.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
                            {categoryIcons[reward.category]} {reward.category}
                          </span>
                          {reward.value > 0 && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 rounded-full text-green-300">
                              ₹{reward.value}
                            </span>
                          )}
                          {reward.discountPercentage > 0 && (
                            <span className="text-xs px-2 py-1 bg-orange-500/20 rounded-full text-orange-300">
                              {reward.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Requirements */}
                      <div className="mb-4 space-y-1">
                        {reward.ecoScoreRequired > 0 && (
                          <div className="text-xs text-slate-400">
                            Min EcoScore: {reward.ecoScoreRequired}
                          </div>
                        )}
                        {reward.levelRequired > 1 && (
                          <div className="text-xs text-slate-400">
                            Min Level: {reward.levelRequired}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleRedeemReward(reward._id)}
                        disabled={!reward.canRedeem || redeemingId === reward._id}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          reward.canRedeem
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/50'
                            : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {redeemingId === reward._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Redeeming...
                          </div>
                        ) : reward.canRedeem ? (
                          'Redeem Now'
                        ) : (
                          'Requirements Not Met'
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* My Rewards Tab */}
              {activeTab === 'my-rewards' && (
                <div className="space-y-4">
                  {userRewards.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">🎁</div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Rewards Yet</h3>
                      <p className="text-slate-400 mb-6">Start earning carbon credits to redeem amazing rewards!</p>
                      <button
                        onClick={() => setActiveTab('rewards')}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        Browse Rewards
                      </button>
                    </div>
                  ) : (
                    userRewards.map((userReward, index) => (
                      <motion.div
                        key={userReward._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{userReward.reward.icon}</div>
                            <div>
                              <h3 className="font-bold text-white">{userReward.reward.title}</h3>
                              <p className="text-sm text-slate-400">{userReward.reward.brand}</p>
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(userReward.status)}`}>
                                  {userReward.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400 mb-2">
                              {userReward.carbonCreditsSpent} <FaCoins className="inline text-sm" />
                            </div>
                            <div className="text-xs text-slate-400">
                              Expires: {formatExpiryDate(userReward.expiresAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-300">Coupon Code:</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(userReward.couponCode)}
                              className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="font-mono text-lg text-white bg-slate-800/50 p-2 rounded text-center">
                            {userReward.couponCode}
                          </div>
                        </div>
                        
                        {userReward.usageInstructions && (
                          <div className="mt-4 text-sm text-slate-300">
                            <strong>How to use:</strong> {userReward.usageInstructions}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && (
                <div>
                  {/* Leaderboard Type Selector */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {leaderboardTypes.map(({ key, label, icon }) => (
                      <button
                        key={key}
                        onClick={() => setLeaderboardType(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          leaderboardType === key
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <span>{icon}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Leaderboard */}
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          index < 3
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                              {entry.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{entry.name}</div>
                              <div className="text-sm text-slate-400">Level {entry.level}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">{entry.displayValue}</div>
                          <div className="text-sm text-slate-400">
                            {leaderboardTypes.find(t => t.key === leaderboardType)?.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}