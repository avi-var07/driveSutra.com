import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/dashboard/StatsCards';
import LevelProgress from '../components/dashboard/LevelProgress';
import RecentTrips from '../components/dashboard/RecentTrips';
import EcoScoreCard from '../components/dashboard/EcoScoreCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnimatedCard, { ActionCard } from '../components/common/AnimatedCard';
import { getDashboardStats } from '../services/userService';
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

      const response = await getDashboardStats();
      
      if (response.success) {
        const { data } = response;
        
        setDashboardData({
          stats: {
            totalTrips: data.user.totalTrips,
            totalDistance: data.user.totalDistance,
            co2Saved: data.user.co2Saved,
            treesPlanted: data.user.treesGrown
          },
          userData: {
            level: data.user.level,
            levelTitle: data.user.levelTitle,
            xp: data.user.xp,
            levelProgress: data.user.levelProgress,
            ecoScore: data.user.ecoScore,
            carbonCredits: data.user.carbonCredits,
            currentStreak: data.user.currentStreak,
            longestStreak: data.user.longestStreak,
            achievements: data.achievements
          },
          recentTrips: data.recentTrips,
          weekStats: data.weekStats
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data
      setDashboardData({
        stats: {
          totalTrips: 0,
          totalDistance: 0,
          co2Saved: 0,
          treesPlanted: 0
        },
        userData: {
          level: 1,
          levelTitle: 'Seedling',
          xp: 0,
          levelProgress: 0,
          ecoScore: 0,
          carbonCredits: 0,
          currentStreak: 0,
          longestStreak: 0,
          achievements: { total: 0, recent: [] }
        },
        recentTrips: [],
        weekStats: {
          trips: 0,
          distance: 0,
          co2Saved: 0,
          avgEcoScore: 0
        }
      });
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
              Welcome back, {user?.firstName || 'User'}! 👋
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            icon="🚴"
            title="New Trip"
            description="Plan your next eco-friendly journey"
            buttonText="Start Trip"
            onAction={() => navigate('/trip/new')}
            glowColor="emerald"
            delay={0.1}
          />
          <ActionCard
            icon="🏆"
            title="Challenges"
            description="Join active challenges and compete"
            buttonText="View Challenges"
            onAction={() => navigate('/challenges')}
            glowColor="blue"
            delay={0.2}
          />
          <ActionCard
            icon="🌳"
            title="Your Forest"
            description="See your environmental impact grow"
            buttonText="View Forest"
            onAction={() => navigate('/forest')}
            glowColor="green"
            delay={0.3}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
