import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCard({ 
  children, 
  className = '', 
  hoverScale = 1.02,
  hoverRotate = 0,
  glowColor = 'emerald',
  clickable = false,
  onClick,
  delay = 0,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const glowColors = {
    emerald: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    red: 'shadow-red-500/20 hover:shadow-red-500/40',
    yellow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40',
    green: 'shadow-green-500/20 hover:shadow-green-500/40',
    pink: 'shadow-pink-500/20 hover:shadow-pink-500/40',
    orange: 'shadow-orange-500/20 hover:shadow-orange-500/40'
  };

  return (
    <motion.div
      className={`
        relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 
        backdrop-blur-sm transition-all duration-300 overflow-hidden
        hover:border-${glowColor}-500/50 hover:bg-slate-900/70
        ${glowColors[glowColor] || glowColors.emerald}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: hoverScale,
        rotate: hoverRotate,
        transition: { duration: 0.2 }
      }}
      whileTap={clickable ? { scale: 0.98 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-${glowColor}-500/5 to-transparent opacity-0`}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: '-100%', skewX: -45 }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 bg-${glowColor}-400 rounded-full`}
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-10, -20, -30]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accent */}
      <motion.div
        className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-${glowColor}-500/20 to-transparent rounded-bl-full`}
        initial={{ scale: 0, rotate: -45 }}
        animate={{ 
          scale: isHovered ? 1 : 0,
          rotate: isHovered ? 0 : -45
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Specialized card variants
export function StatsCard({ icon, title, value, subtitle, trend, className = '', ...props }) {
  return (
    <AnimatedCard className={`text-center ${className}`} glowColor="emerald" {...props}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-300 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-emerald-400 mb-1">{value}</div>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      {trend && (
        <div className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </AnimatedCard>
  );
}

export function FeatureCard({ icon, title, description, className = '', ...props }) {
  return (
    <AnimatedCard className={className} glowColor="blue" hoverScale={1.05} {...props}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <p className="text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function ActionCard({ icon, title, description, buttonText, onAction, className = '', ...props }) {
  return (
    <AnimatedCard className={className} glowColor="purple" clickable onClick={onAction} {...props}>
      <div className="text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-4">{description}</p>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          {buttonText}
        </button>
      </div>
    </AnimatedCard>
  );
}

export function TripCard({ trip, className = '', ...props }) {
  const getModeIcon = (mode) => {
    const icons = {
      'PUBLIC': '🚌',
      'WALK': '🚶',
      'CYCLE': '🚴',
      'CAR': '🚗',
      'BIKE': '🏍️'
    };
    return icons[mode] || '🚗';
  };

  const getModeColor = (mode) => {
    const colors = {
      'PUBLIC': 'blue',
      'WALK': 'green',
      'CYCLE': 'emerald',
      'CAR': 'orange',
      'BIKE': 'red'
    };
    return colors[mode] || 'emerald';
  };

  return (
    <AnimatedCard 
      className={className} 
      glowColor={getModeColor(trip.mode)} 
      hoverScale={1.03}
      {...props}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-${getModeColor(trip.mode)}-600 rounded-lg flex items-center justify-center text-2xl`}>
          {getModeIcon(trip.mode)}
        </div>
        <div>
          <h3 className="font-semibold text-white">{trip.mode} Trip</h3>
          <p className="text-slate-400 text-sm">{trip.date}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400">Distance</p>
          <p className="font-semibold text-white">{trip.distance} km</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Eco Score</p>
          <p className="font-semibold text-emerald-400">{trip.ecoScore}/100</p>
        </div>
      </div>
      
      {trip.rewards && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">🌱 {trip.rewards.trees} trees</span>
          <span className="text-slate-400">⭐ {trip.rewards.xp} XP</span>
        </div>
      )}
    </AnimatedCard>
  );
}