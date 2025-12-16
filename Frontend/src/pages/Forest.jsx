import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTree, FaLeaf, FaSeedling, FaGlobeAmericas, FaWater, FaCloud } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Forest() {
  const { user } = useAuth();
  const [forestData, setForestData] = useState({
    treesGrown: 0,
    co2Saved: 0,
    forestLevel: 1,
    nextLevelTrees: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForestData();
  }, []);

  const fetchForestData = async () => {
    try {
      setLoading(true);
      // Get user stats for forest visualization
      const response = await userService.getUserStats();
      const stats = response.stats || {};
      
      const treesGrown = stats.treesGrown || user?.treesGrown || 0;
      const co2Saved = stats.co2Saved || user?.co2Saved || 0;
      
      // Calculate forest level based on trees grown
      const forestLevel = Math.floor(treesGrown / 10) + 1;
      const nextLevelTrees = forestLevel * 10;
      
      setForestData({
        treesGrown,
        co2Saved,
        forestLevel,
        nextLevelTrees
      });
    } catch (error) {
      console.error('Error fetching forest data:', error);
      // Fallback to user data
      setForestData({
        treesGrown: user?.treesGrown || 0,
        co2Saved: user?.co2Saved || 0,
        forestLevel: Math.floor((user?.treesGrown || 0) / 10) + 1,
        nextLevelTrees: (Math.floor((user?.treesGrown || 0) / 10) + 1) * 10
      });
    } finally {
      setLoading(false);
    }
  };

  const getForestStage = (level) => {
    if (level >= 10) return { name: 'Ancient Forest', color: 'from-emerald-800 to-green-900', icon: '🌲' };
    if (level >= 7) return { name: 'Mature Forest', color: 'from-green-600 to-emerald-700', icon: '🌳' };
    if (level >= 5) return { name: 'Growing Forest', color: 'from-green-500 to-emerald-600', icon: '🌿' };
    if (level >= 3) return { name: 'Young Grove', color: 'from-lime-500 to-green-500', icon: '🌱' };
    return { name: 'Seedling Garden', color: 'from-yellow-400 to-lime-500', icon: '🌱' };
  };

  const generateTrees = (count) => {
    const trees = [];
    const maxTrees = Math.min(count, 50); // Limit visual trees for performance
    
    for (let i = 0; i < maxTrees; i++) {
      const size = Math.random() * 0.5 + 0.5; // 0.5 to 1
      const x = Math.random() * 80 + 10; // 10% to 90% width
      const y = Math.random() * 60 + 30; // 30% to 90% height
      const treeType = Math.random() > 0.5 ? '🌲' : '🌳';
      
      trees.push({
        id: i,
        x,
        y,
        size,
        type: treeType,
        delay: i * 0.1
      });
    }
    
    return trees;
  };

  const forestStage = getForestStage(forestData.forestLevel);
  const trees = generateTrees(forestData.treesGrown);
  const progressToNext = ((forestData.treesGrown % 10) / 10) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Growing your forest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Your Eco Forest
          </h1>
          <p className="text-slate-400">Every eco-friendly trip grows your virtual forest</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTree className="text-green-400 text-2xl" />
              <h3 className="font-semibold">Trees Grown</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{forestData.treesGrown}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaCloud className="text-blue-400 text-2xl" />
              <h3 className="font-semibold">CO₂ Saved</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{forestData.co2Saved.toFixed(1)} kg</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{forestStage.icon}</span>
              <h3 className="font-semibold">Forest Level</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{forestData.forestLevel}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaGlobeAmericas className="text-teal-400 text-2xl" />
              <h3 className="font-semibold">Impact</h3>
            </div>
            <p className="text-lg font-bold text-emerald-400">{forestStage.name}</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Progress to Next Forest Level</h3>
            <span className="text-emerald-400 font-semibold">
              {forestData.treesGrown % 10}/10 trees
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
            <motion.div
              className="h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-slate-400">
            {10 - (forestData.treesGrown % 10)} more trees to reach Level {forestData.forestLevel + 1}
          </p>
        </div>
      </div>

      {/* Forest Visualization */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${forestStage.color} opacity-20`} />
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-900/40 to-transparent" />
        
        {/* Trees */}
        <div className="absolute inset-0">
          {trees.map((tree) => (
            <motion.div
              key={tree.id}
              className="absolute text-4xl select-none"
              style={{
                left: `${tree.x}%`,
                bottom: `${tree.y}%`,
                fontSize: `${tree.size * 2 + 1}rem`,
                filter: `hue-rotate(${Math.random() * 60 - 30}deg)`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: tree.delay,
                duration: 0.5,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: tree.size * 1.2 + 0.8,
                transition: { duration: 0.2 }
              }}
            >
              {tree.type}
            </motion.div>
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {forestData.treesGrown === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FaSeedling className="text-6xl text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Forest Awaits</h3>
              <p className="text-slate-400 mb-6">Complete eco-friendly trips to grow your first tree!</p>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                🌱
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Impact */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4 text-center">Your Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">🌍</div>
              <h4 className="font-semibold mb-1">Carbon Footprint Reduced</h4>
              <p className="text-2xl font-bold text-emerald-400">{forestData.co2Saved.toFixed(1)} kg</p>
              <p className="text-sm text-slate-400">Equivalent to {Math.round(forestData.co2Saved / 0.5)} car-free kilometers</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🌳</div>
              <h4 className="font-semibold mb-1">Trees Equivalent</h4>
              <p className="text-2xl font-bold text-emerald-400">{forestData.treesGrown}</p>
              <p className="text-sm text-slate-400">Each tree absorbs ~22kg CO₂ per year</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💚</div>
              <h4 className="font-semibold mb-1">Eco Level</h4>
              <p className="text-2xl font-bold text-emerald-400">{forestStage.name}</p>
              <p className="text-sm text-slate-400">Keep growing your impact!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}