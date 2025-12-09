import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa6";
import { motion } from "motion/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-[#0d1f1a]/95 via-[#112820]/95 to-[#0a1d16]/95 border-b border-emerald-800/30 shadow-lg shadow-emerald-950/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="group flex items-center gap-3">
              <NavbarLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/features">Features</NavLink>
            <NavLink to="/trips">My Trips</NavLink>
            <NavLink to="/challenges">Challenges</NavLink>
            <NavLink to="/forest">Forest</NavLink>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/auth" 
              className="group px-5 py-2.5 rounded-lg border border-emerald-700/40 bg-emerald-950/30 text-slate-200 font-medium hover:bg-emerald-950/50 hover:border-emerald-600/60 hover:text-emerald-300 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="relative">
                Log In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link 
              to="/eco-map" 
              className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <FaLeaf className="text-sm group-hover:rotate-12 transition-transform duration-300" />
              Start Eco Trip
            </Link>
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
              <MobileNavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink to="/features" onClick={() => setOpen(false)}>Features</MobileNavLink>
              <MobileNavLink to="/trips" onClick={() => setOpen(false)}>My Trips</MobileNavLink>
              <MobileNavLink to="/challenges" onClick={() => setOpen(false)}>Challenges</MobileNavLink>
              <MobileNavLink to="/forest" onClick={() => setOpen(false)}>Forest</MobileNavLink>

              <div className="mt-3 pt-3 border-t border-emerald-800/30 flex flex-col gap-2">
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
              </div>
            </div>
          </div>
        )}
      </header>

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

/* Desktop Navigation Link Component */
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative px-4 py-2 text-slate-300 font-medium hover:text-emerald-300 transition-colors duration-300"
    >
      <span className="relative z-10">{children}</span>
      {/* Hover background effect */}
      <span className="absolute inset-0 rounded-lg bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-300 scale-90 group-hover:scale-100"></span>
      {/* Bottom border animation */}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-3/4 transition-all duration-300"></span>
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 blur-lg bg-emerald-400/20 transition-opacity duration-300 -z-10"></span>
    </Link>
  );
}

/* Mobile Navigation Link Component */
function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group relative py-2.5 px-4 rounded-lg text-slate-300 font-medium hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
    >
      <span className="relative z-10 flex items-center gap-2">
        <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-2 transition-all duration-300"></span>
        {children}
      </span>
    </Link>
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
        driveSutra.com
      </motion.span>
    </div>
  );
}

