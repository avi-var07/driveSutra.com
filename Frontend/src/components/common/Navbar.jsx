import React, { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaLeaf } from "react-icons/fa6";
import { FaShieldAlt, FaTrophy, FaRoad, FaPause, FaTimes, FaPlay, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { useTripContext } from "../../context/TripContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tripCtx = useTripContext();

  // Check if current page is the trip tracking page
  const isOnTripPage = location.pathname.includes('/track');

  // Guarded navigation — intercepts if a trip is active
  const guardedNavigate = useCallback((to, e) => {
    if (tripCtx?.isTripActive && !tripCtx?.isPaused && !isOnTripPage) {
      // Already navigated away, allow it
      if (e) e.preventDefault();
      navigate(to);
      return;
    }
    if (tripCtx?.isTripActive && !tripCtx?.isPaused && isOnTripPage) {
      // On trip page, trying to leave — show guard
      if (e) e.preventDefault();
      tripCtx.requestNavigation(to);
      return;
    }
    // No active trip or already paused — allow navigation
    navigate(to);
  }, [tripCtx, navigate, isOnTripPage]);

  // Handle nav guard actions
  const handleContinueTrip = () => {
    tripCtx?.dismissNavGuard();
  };

  const handlePauseAndLeave = () => {
    tripCtx?.pauseTrip();
    const target = tripCtx?.pendingNavigation;
    tripCtx?.dismissNavGuard();
    if (target) navigate(target);
  };

  const handleCancelTrip = () => {
    tripCtx?.clearActiveTripState();
    const target = tripCtx?.pendingNavigation;
    tripCtx?.dismissNavGuard();
    if (target) navigate(target);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur bg-emerald-950/75 border-b border-emerald-800/20 shadow-lg shadow-emerald-900/20">
        {/* Active Trip Banner */}
        <AnimatePresence>
          {tripCtx?.isTripActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 overflow-hidden"
            >
              <div className="w-full px-6 py-1.5 flex items-center justify-between text-sm text-white">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tripCtx.isPaused ? 'bg-yellow-400' : 'bg-green-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${tripCtx.isPaused ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                  </span>
                  <span className="font-medium">
                    {tripCtx.isPaused ? '⏸️ Trip Paused' : '🚀 Trip In Progress'} — {tripCtx.tripMode}
                  </span>
                  {tripCtx.isPaused && (
                    <span className="text-yellow-200 text-xs">(Resume within 5 min or trip will be cancelled)</span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/trip/${tripCtx.activeTripId}/track`)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-all"
                >
                  {tripCtx.isPaused ? 'Resume Trip' : 'View Trip'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full px-6 py-3 flex items-center">
          {/* Left Corner - Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center gap-3" onClick={(e) => {
              if (tripCtx?.isTripActive && isOnTripPage) {
                e.preventDefault();
                tripCtx.requestNavigation('/');
              }
            }}>
              <NavbarLogo />
            </Link>
          </div>

          {/* Left Side - Dashboard (when authenticated) */}
          {isAuthenticated && (
            <div className="hidden md:flex ml-8">
              <GuardedNavLink to="/dashboard" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Dashboard</GuardedNavLink>
            </div>
          )}

          {/* Center Navigation - Spread across available space */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-8 mx-8">
            <GuardedNavLink to="/rewards" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Rewards</GuardedNavLink>
            <GuardedNavLink to="/challenges" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Challenges</GuardedNavLink>
            <GuardedNavLink to="/achievements" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Achievements</GuardedNavLink>
            <GuardedNavLink to="/forest" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Forest</GuardedNavLink>
            <GuardedNavLink to="/about" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>About</GuardedNavLink>
            <GuardedNavLink to="/contact" guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Contact</GuardedNavLink>
          </nav>

          {/* Right Corner - User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden lg:flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/20 rounded-full px-4 py-2 text-sm text-slate-200">
                  <span className="text-slate-300">Eco</span>
                  <span className="font-semibold text-emerald-400">{user?.ecoScore ?? '—'}</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-300">XP</span>
                  <span className="font-semibold text-blue-400">{user?.xp ?? 0}</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-300">Lv</span>
                  <span className="font-semibold text-yellow-400">{user?.level ?? '—'}</span>
                </div>

                <Link 
                  to="/profile" 
                  className="px-4 py-2 rounded-lg text-slate-200 hover:bg-emerald-950/30 hover:text-emerald-300 transition-all duration-300 border border-transparent hover:border-emerald-700/30"
                  onClick={(e) => {
                    if (tripCtx?.isTripActive && isOnTripPage) {
                      e.preventDefault();
                      tripCtx.requestNavigation('/profile');
                    }
                  }}
                >
                  Profile
                </Link>
                
                <LogoutButton onClick={() => { logout(); navigate('/'); }} />
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="px-4 py-2 rounded-lg border border-emerald-700/30 text-slate-200 hover:bg-emerald-950/30 hover:border-emerald-600/50 transition-all duration-300"
                >
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/30 hover:bg-emerald-950/60 hover:border-emerald-700/40 transition-all duration-300"
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
          >
            {open ? (
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {open && (
          <div className="md:hidden px-6 pb-6 animate-slideDown">
            <div className="flex flex-col gap-2 rounded-xl p-4 backdrop-blur-md bg-emerald-950/40 border border-emerald-800/30">
              {isAuthenticated && (
                <>
                  <MobileNavLink to="/dashboard" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/rewards" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Rewards</MobileNavLink>
                  <MobileNavLink to="/challenges" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Challenges</MobileNavLink>
                  <MobileNavLink to="/forest" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Forest</MobileNavLink>
                </>
              )}
              <MobileNavLink to="/about" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>About</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => { setOpen(false); }} guardedNavigate={guardedNavigate} tripActive={tripCtx?.isTripActive && isOnTripPage}>Contact</MobileNavLink>

              <div className="mt-3 pt-3 border-t border-emerald-800/30 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/auth" 
                      onClick={() => setOpen(false)}
                      className="text-center px-4 py-2.5 rounded-lg border border-emerald-700/40 bg-emerald-950/30 text-slate-200 font-medium hover:bg-emerald-950/50 hover:border-emerald-600/60 transition-all duration-300"
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/eco-map" 
                      onClick={() => setOpen(false)}
                      className="text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                    >
                      <FaLeaf className="text-sm" />
                      Start Eco Trip
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setOpen(false)}
                      className="text-center px-4 py-2.5 rounded-lg border border-emerald-700/40 bg-emerald-950/30 text-slate-200 font-medium hover:bg-emerald-950/50 hover:border-emerald-600/60 transition-all duration-300"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/30"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Navigation Guard Modal */}
      <AnimatePresence>
        {tripCtx?.showNavGuard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleContinueTrip}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-3xl text-amber-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">Trip In Progress!</h3>
              <p className="text-slate-300 text-center text-sm mb-1">
                Do you want to <span className="text-amber-400 font-semibold">pause</span> or <span className="text-red-400 font-semibold">end</span> your current trip?
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                <p className="text-amber-300 text-xs text-center font-medium">
                  ⚠️ Your ecoScore will be reduced by <span className="font-bold text-amber-200">50 points</span> if you pause!
                  {tripCtx?.pauseCount > 0 && (
                    <span className="block mt-1">Current penalty: <span className="text-red-400 font-bold">-{tripCtx.ecoScorePenalty}</span> points ({tripCtx.pauseCount} pause{tripCtx.pauseCount > 1 ? 's' : ''})</span>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {/* Continue Trip */}
                <button
                  onClick={handleContinueTrip}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  <FaPlay className="text-sm" /> Continue Trip
                </button>

                {/* Pause Trip */}
                <button
                  onClick={handlePauseAndLeave}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold rounded-xl hover:bg-amber-500/30 transition-all"
                >
                  <FaPause className="text-sm" /> Pause Trip
                  <span className="text-xs text-amber-400/70 ml-1">(-50 ecoScore, 5 min to resume)</span>
                </button>

                {/* Cancel Trip */}
                <button
                  onClick={handleCancelTrip}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500/20 border border-red-500/40 text-red-300 font-semibold rounded-xl hover:bg-red-500/30 transition-all"
                >
                  <FaTimes className="text-sm" /> Cancel Trip
                  <span className="text-xs text-red-400/70 ml-1">(no rewards)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

/* Desktop Navigation Link Component - with trip guard support */
function GuardedNavLink({ to, children, guardedNavigate, tripActive }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        if (tripActive && guardedNavigate) {
          guardedNavigate(to, e);
        } else {
          window.location.href !== to && (window.history.pushState(null, '', to), window.dispatchEvent(new PopStateEvent('popstate')));
          // Use a simple approach: just navigate
          guardedNavigate ? guardedNavigate(to, e) : null;
        }
      }}
      className="group relative px-4 py-2 text-slate-300 font-medium hover:text-emerald-300 transition-colors duration-300 cursor-pointer"
    >
      <span className="relative z-10">{children}</span>
      {/* Hover background effect */}
      <span className="absolute inset-0 rounded-lg bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300 scale-90 group-hover:scale-100"></span>
      {/* Bottom border animation */}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-3/4 transition-all duration-300"></span>
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-lg bg-emerald-400/20 transition-opacity duration-300 -z-10"></span>
    </a>
  );
}

/* Keep original NavLink for non-guarded usage */
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative px-4 py-2 text-slate-300 font-medium hover:text-emerald-300 transition-colors duration-300"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 rounded-lg bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300 scale-90 group-hover:scale-100"></span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-3/4 transition-all duration-300"></span>
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-lg bg-emerald-400/20 transition-opacity duration-300 -z-10"></span>
    </Link>
  );
}

/* Mobile Navigation Link Component - with trip guard support */
function MobileNavLink({ to, children, onClick, guardedNavigate, tripActive }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        if (tripActive && guardedNavigate) {
          guardedNavigate(to, e);
        } else {
          guardedNavigate ? guardedNavigate(to, e) : null;
        }
      }}
      className="group relative py-2.5 px-4 rounded-lg text-slate-300 font-medium hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 cursor-pointer"
    >
      <span className="relative z-10 flex items-center gap-2">
        <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-2 transition-all duration-300"></span>
        {children}
      </span>
    </a>
  );
}

/* Impressive Logout Button Component */
function LogoutButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium overflow-hidden group shadow-lg shadow-red-900/30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '0%' : '-100%' }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 blur-xl"
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Text with icon */}
      <span className="relative z-10 flex items-center gap-2">
        <motion.span
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          🚪
        </motion.span>
        Logout
      </span>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%', skewX: -45 }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
}

/* Navbar Logo Component - Compact Animated Version */
function NavbarLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Compact SVG Logo */}
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 200 200" className="drop-shadow-lg">
          {/* Outer rotating ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#navGradient1)"
            strokeWidth="4"
            strokeDasharray="15 8"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ originX: '100px', originY: '100px' }}
          />
          
          {/* Main background */}
          <circle cx="100" cy="100" r="70" fill="url(#navBgGradient)" />
          
          {/* Road path */}
          <motion.path
            d="M 40 140 Q 70 100, 100 90 T 160 60"
            stroke="url(#navRoadGradient)"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Road dashes */}
          <motion.path
            d="M 40 140 Q 70 100, 100 90 T 160 60"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 10"
            strokeLinecap="round"
            animate={{ strokeDashoffset: 20 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Moving vehicle */}
          <motion.g
            animate={{
              x: [40, 160],
              y: [140, 60]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <circle cx="0" cy="0" r="6" fill="#10b981" />
            <rect x="-3" y="-2" width="6" height="4" fill="white" rx="0.5" />
          </motion.g>

          {/* Center leaf */}
          <motion.g
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: '100px 87px' }}
          >
            <path
              d="M 100 50 Q 130 65, 135 90 Q 135 105, 120 115 Q 110 120, 100 125 L 100 50 Z"
              fill="url(#navLeafGradient1)"
            />
            <path
              d="M 100 50 Q 70 65, 65 90 Q 65 105, 80 115 Q 90 120, 100 125 L 100 50 Z"
              fill="url(#navLeafGradient2)"
            />
            <path
              d="M 100 50 L 100 125"
              stroke="#047857"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="87" r="6" fill="#fbbf24" opacity="0.9" />
          </motion.g>

          {/* Gradients */}
          <defs>
            <linearGradient id="navGradient1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <radialGradient id="navBgGradient">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#d1fae5" />
            </radialGradient>
            <linearGradient id="navRoadGradient">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="navLeafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="navLeafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Name */}
      <motion.span 
        className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent"
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
      >
        driveSutraGo
      </motion.span>
    </div>
  );
}

