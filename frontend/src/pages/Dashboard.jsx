// frontend/src/pages/Dashboard.jsx
import React from 'react';
import { Leaf, Trees, Flame, Trophy, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageTitle from '../components/common/PageTitle';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data (replace with real from backend later)
  const stats = {
    ecoScore: 87,
    level: 12,
    xp: 2840,
    xpToNext: 5000,
    co2Saved: 142.8,
    trees: 89,
    streak: 7,
    totalTrips: 156
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="md:ml-64 pt-20 p-6 lg:p-10">
        <PageTitle title={`Welcome back, ${user?.name?.split(' ')[0] || 'Eco Warrior'}!`} subtitle="Every trip counts" />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* ecoScore Gauge */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl font-bold text-green-600">{stats.ecoScore}</div>
            <p className="text-gray-600 mt-2">ecoScore</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full" style={{ width: `${stats.ecoScore}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">Level {stats.level}</div>
              <p className="text-gray-600">{stats.xp} / {stats.xpToNext} XP</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <Flame className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.streak} days</div>
              <p className="text-gray-600">Current Streak</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Trees className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.trees}</div>
              <p className="text-gray-600">Trees Grown</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/trip/new" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 text-center hover:shadow-2xl transition transform hover:scale-105">
            <Zap className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Start New Trip</h3>
            <p className="mt-2 opacity-90">Plan your next eco-friendly journey</p>
          </a>

          <a href="/challenges" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 text-center hover:shadow-2xl transition transform hover:scale-105">
            <Target className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Daily Challenges</h3>
            <p className="mt-2 opacity-90">Earn bonus XP & badges</p>
          </a>

          <a href="/forest" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl p-8 text-center hover:shadow-2xl transition transform hover:scale-105">
            <Leaf className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">My Forest</h3>
            <p className="mt-2 opacity-90">Watch your trees grow</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;