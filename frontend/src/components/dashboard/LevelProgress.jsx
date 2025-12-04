import React from 'react';
import { FaTrophy, FaStar } from 'react-icons/fa';

const LevelProgress = ({ userData }) => {
  const currentLevel = userData?.level || 1;
  const currentXP = userData?.xp || 0;
  const xpForNextLevel = userData?.xpForNextLevel || 1000;
  const progressPercentage = (currentXP / xpForNextLevel) * 100;

  // Calculate level titles
  const getLevelTitle = (level) => {
    if (level < 5) return 'Eco Beginner';
    if (level < 10) return 'Green Traveler';
    if (level < 20) return 'Eco Warrior';
    if (level < 30) return 'Climate Champion';
    if (level < 50) return 'Sustainability Master';
    return 'Eco Legend';
  };

  const levelTitle = getLevelTitle(currentLevel);

  return (
    <div className="glass-card backdrop-blur-md bg-white/4 border border-white/6 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          Your Progress
        </h2>
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-full">
          <FaStar />
          <span className="font-bold">Level {currentLevel}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300">{levelTitle}</span>
          <span className="text-sm font-medium text-slate-300">
            {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-xs text-white font-bold">
                {Math.floor(progressPercentage)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-sky-400">
            {userData?.achievements?.length || 0}
          </p>
          <p className="text-xs text-slate-400">Achievements</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {userData?.activeChallenges || 0}
          </p>
          <p className="text-xs text-slate-400">Active Challenges</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-400">
            {userData?.rank || 'N/A'}
          </p>
          <p className="text-xs text-slate-400">Global Rank</p>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;
