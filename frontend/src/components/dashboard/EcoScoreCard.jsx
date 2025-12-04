import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaChartLine, FaTrophy, FaFire } from 'react-icons/fa';
import { formatNumber } from '../../utils/formatNumber';

const EcoScoreCard = ({ stats, userData, recentTrips }) => {
  const navigate = useNavigate();
  // Calculate comprehensive eco score based on all dashboard data
  const ecoScore = useMemo(() => {
    if (!stats) return 0;

    // Base score from CO2 saved (40% weight)
    const co2Score = Math.min((stats.co2Saved || 0) * 2, 400);

    // Distance score (20% weight)
    const distanceScore = Math.min((stats.totalDistance || 0) / 10, 200);

    // Trip frequency score (20% weight)
    const tripScore = Math.min((stats.totalTrips || 0) * 5, 200);

    // Recent activity bonus (10% weight)
    const recentActivityScore = recentTrips && recentTrips.length > 0 ? 100 : 0;

    // Level multiplier (10% weight)
    const levelMultiplier = 1 + ((userData?.level || 1) * 0.01);

    const baseScore = co2Score + distanceScore + tripScore + recentActivityScore;
    const finalScore = Math.floor(baseScore * levelMultiplier);

    return Math.min(finalScore, 1000); // Cap at 1000
  }, [stats, userData, recentTrips]);

  // Calculate score percentage for visual display
  const scorePercentage = (ecoScore / 1000) * 100;

  // Determine score tier
  const getScoreTier = (score) => {
    if (score >= 800) return { 
      tier: 'Elite', 
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: FaTrophy
    };
    if (score >= 600) return { 
      tier: 'Expert', 
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: FaFire
    };
    if (score >= 400) return { 
      tier: 'Advanced', 
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: FaChartLine
    };
    if (score >= 200) return { 
      tier: 'Intermediate', 
      color: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: FaLeaf
    };
    return { 
      tier: 'Beginner', 
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: FaLeaf
    };
  };

  const scoreTier = getScoreTier(ecoScore);
  const TierIcon = scoreTier.icon;

  // Calculate score breakdown for details
  const scoreBreakdown = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: 'CO₂ Impact',
        value: Math.min((stats.co2Saved || 0) * 2, 400),
        max: 400,
        percentage: Math.min(((stats.co2Saved || 0) * 2 / 400) * 100, 100)
      },
      {
        label: 'Distance Covered',
        value: Math.min((stats.totalDistance || 0) / 10, 200),
        max: 200,
        percentage: Math.min(((stats.totalDistance || 0) / 10 / 200) * 100, 100)
      },
      {
        label: 'Trip Frequency',
        value: Math.min((stats.totalTrips || 0) * 5, 200),
        max: 200,
        percentage: Math.min(((stats.totalTrips || 0) * 5 / 200) * 100, 100)
      }
    ];
  }, [stats]);

  return (
    <div 
      className="glass-card backdrop-blur-md bg-white/4 border border-white/6 rounded-2xl shadow-lg p-6 mb-6 cursor-pointer hover:bg-white/6 hover:-translate-y-1 transition-all"
      onClick={() => navigate('/dashboard')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/dashboard');
        }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaLeaf className="text-emerald-400" />
          Your Eco Score
        </h2>
        <div className="bg-white/10 text-emerald-400 px-4 py-2 rounded-full flex items-center gap-2 font-bold">
          <TierIcon />
          {scoreTier.tier}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={scoreTier.tier === 'Elite' ? '#a855f7' : 
                        scoreTier.tier === 'Expert' ? '#3b82f6' : 
                        scoreTier.tier === 'Advanced' ? '#10b981' : 
                        scoreTier.tier === 'Intermediate' ? '#f59e0b' : '#6b7280'}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - scorePercentage / 100)}`}
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-5xl font-bold bg-gradient-to-r ${scoreTier.color} bg-clip-text text-transparent`}>
                {formatNumber(ecoScore)}
              </div>
              <div className="text-sm text-gray-500 font-medium">/ 1000</div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-300 text-sm mb-4">
          Your eco score is calculated from your trips, CO₂ savings, and overall activity
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Score Breakdown</h3>
        {scoreBreakdown.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">
                {formatNumber(Math.floor(item.value))} / {item.max}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-400 to-sky-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-lg font-bold text-white">
            {stats?.totalTrips || 0}
          </p>
          <p className="text-xs text-slate-400">Trips</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">
            {formatNumber(Math.floor(stats?.co2Saved || 0))} kg
          </p>
          <p className="text-xs text-slate-400">CO₂ Saved</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-sky-400">
            Lvl {userData?.level || 1}
          </p>
          <p className="text-xs text-slate-400">Level</p>
        </div>
      </div>

      {/* Progress Message */}
      {ecoScore < 1000 && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-slate-300 text-center">
            🎯 {1000 - ecoScore} points to reach maximum score! Keep tracking your eco-friendly trips.
          </p>
        </div>
      )}
    </div>
  );
};

export default EcoScoreCard;
