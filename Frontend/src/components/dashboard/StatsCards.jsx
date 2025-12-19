import React from 'react';
import { formatNumber, formatDistance, formatCO2 } from '../../utils/formatNumber';
import { 
  FaRoute, 
  FaLeaf, 
  FaTree, 
  FaCar,
  FaCoins
} from 'react-icons/fa';

const StatsCards = ({ stats, userData }) => {
  const statItems = [
    {
      id: 'trips',
      title: 'Total Trips',
      value: formatNumber(stats?.totalTrips || 0),
      icon: FaCar,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-600'
    },
    {
      id: 'distance',
      title: 'Total Distance',
      value: formatDistance(stats?.totalDistance || 0),
      icon: FaRoute,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textLight: 'text-purple-600'
    },
    {
      id: 'co2',
      title: 'CO₂ Saved',
      value: formatCO2(stats?.co2Saved || 0),
      icon: FaLeaf,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textLight: 'text-green-600'
    },
    {
      id: 'trees',
      title: 'Trees Equivalent',
      value: formatNumber(stats?.treesPlanted || 0),
      icon: FaTree,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-600'
    },
    {
      id: 'credits',
      title: 'Carbon Credits',
      value: formatNumber(userData?.carbonCredits || 0),
      icon: FaCoins,
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-50',
      textLight: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="glass-card backdrop-blur-md bg-emerald-950/20 border border-emerald-800/30 rounded-2xl shadow-lg p-6 hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">{item.title}</p>
                <h3 className="text-2xl font-bold text-white">
                  {item.value}
                </h3>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-full">
                <Icon className="text-2xl text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" 
                   style={{ width: '100%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
