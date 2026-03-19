import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';
import AnimatedCard from '../common/AnimatedCard';

export default function LeaderboardSneakPeek({ userData }) {
  // Mock leaderboard data incorporating the current user
  const topUsers = [
    { name: 'EcoWarrior', score: Math.max((userData?.ecoScore || 0) * 1.5, 15000), isCurrentUser: false },
    { name: 'GreenRider', score: Math.max((userData?.ecoScore || 0) * 1.2, 12000), isCurrentUser: false },
    { name: 'You', score: userData?.ecoScore || 0, isCurrentUser: true },
    { name: 'PlanetSaver', score: Math.max((userData?.ecoScore || 0) * 0.8, 8000), isCurrentUser: false }
  ].sort((a, b) => b.score - a.score).slice(0, 3);

  // If user is not in top 3, show them at the bottom
  const userRank = topUsers.findIndex(u => u.isCurrentUser);
  if (userRank === -1) {
    topUsers[2] = { name: 'You', score: userData?.ecoScore || 0, isCurrentUser: true, rank: '42' };
  }

  return (
    <AnimatedCard className="h-full flex flex-col" glowColor="yellow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center text-yellow-400">
            <FaTrophy className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Eco Leaderboard</h2>
            <p className="text-sm text-slate-400">Top contributors this week</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {topUsers.map((user, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              user.isCurrentUser 
                ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:bg-yellow-500/20' 
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold w-6 text-center text-slate-400">
                {user.rank ? `#${user.rank}` : (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`)}
              </div>
              <div className={`font-medium ${user.isCurrentUser ? 'text-yellow-400' : 'text-slate-200'}`}>
                {user.name}
              </div>
            </div>
            <div className="font-bold text-emerald-400">
              {Math.round(user.score).toLocaleString()} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedCard>
  );
}
