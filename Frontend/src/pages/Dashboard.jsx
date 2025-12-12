import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/dashboard/StatsCards';
import LevelProgress from '../components/dashboard/LevelProgress';
import RecentTrips from '../components/dashboard/RecentTrips';
import EcoScoreCard from '../components/dashboard/EcoScoreCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import { FaSync } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalTrips: 0,
      totalDistance: 0,
      co2Saved: 0,
      treesPlanted: 0
    },
    userData: {
      level: 1,
      xp: 0,
      xpForNextLevel: 1000,
      achievements: [],
      activeChallenges: 0,
      rank: null
    },
    recentTrips: []
  });

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // In a real app, these would be actual API calls
      // For now, we'll simulate with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - Replace with actual API calls
      const mockStats = {
        totalTrips: 45,
        totalDistance: 1234.5,
        co2Saved: 245.8,
        treesPlanted: 12
      };

      const mockUserData = {
        level: user?.level || 5,
        xp: user?.xp || 3450,
        xpForNextLevel: 5000,
        achievements: user?.achievements || [],
        activeChallenges: 3,
        rank: user?.rank || 142
      };

      const mockRecentTrips = [
        {
          _id: '1',
          from: 'Home',
          to: 'Office',
          mode: 'bike',
          distance: 8.5,
          co2Saved: 2.3,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          _id: '2',
          from: 'Office',
          to: 'Gym',
          mode: 'walk',
          distance: 1.2,
          co2Saved: 0.5,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          _id: '3',
          from: 'Home',
          to: 'Mall',
          mode: 'bus',
          distance: 12.3,
          co2Saved: 5.6,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          _id: '4',
          from: 'Home',
          to: 'Airport',
          mode: 'train',
          distance: 35.0,
          co2Saved: 15.2,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          _id: '5',
          from: 'Office',
          to: 'Home',
          mode: 'bike',
          distance: 8.5,
          co2Saved: 2.3,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        }
      ];

      setDashboardData({
        stats: mockStats,
        userData: mockUserData,
        recentTrips: mockRecentTrips
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // You might want to show an error toast/notification here
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d1f1a] via-[#112820] to-[#0a1d16] text-slate-100">
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner color="white" size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f1a] via-[#112820] to-[#0a1d16] text-slate-100 antialiased">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-slate-300 mt-2">
              Here's your eco-friendly travel summary
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-emerald-950/30 border border-emerald-800/30 rounded-lg hover:bg-emerald-950/50 hover:border-emerald-700/40 transition-all duration-300 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaSync className={`text-emerald-300 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-emerald-300">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={dashboardData.stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Takes 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <LevelProgress userData={dashboardData.userData} />

            {/* Recent Trips */}
            <RecentTrips 
              trips={dashboardData.recentTrips} 
              loading={false}
            />
          </div>

          {/* Right Column - Eco Score Card - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <EcoScoreCard 
              stats={dashboardData.stats}
              userData={dashboardData.userData}
              recentTrips={dashboardData.recentTrips}
            />
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate('/new-trip')}
            className="glass-card p-6 rounded-2xl backdrop-blur-md bg-emerald-950/20 border border-emerald-800/30 shadow-lg cursor-pointer hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="text-lg font-bold mb-2 text-white">🚴 New Trip</h3>
            <p className="text-sm text-slate-300">Record your latest eco-friendly journey</p>
          </div>
          <div 
            onClick={() => navigate('/challenges')}
            className="glass-card p-6 rounded-2xl backdrop-blur-md bg-emerald-950/20 border border-emerald-800/30 shadow-lg cursor-pointer hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="text-lg font-bold mb-2 text-white">🏆 Challenges</h3>
            <p className="text-sm text-slate-300">Join active challenges and compete</p>
          </div>
          <div 
            onClick={() => navigate('/forest')}
            className="glass-card p-6 rounded-2xl backdrop-blur-md bg-emerald-950/20 border border-emerald-800/30 shadow-lg cursor-pointer hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300"
          >
            <h3 className="text-lg font-bold mb-2 text-white">🌳 Your Forest</h3>
            <p className="text-sm text-slate-300">See your environmental impact grow</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
