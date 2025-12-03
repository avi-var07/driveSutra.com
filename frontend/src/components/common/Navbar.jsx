import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/3 border-b border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">🍃</span>
            <span className="text-white">EcoDrive</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-slate-200">
          <Link to="/features" className="hover:underline">Features</Link>
          <a href="#how" className="hover:underline">How it Works</a>
          <a href="#rewards" className="hover:underline">Rewards</a>
          <a href="#why" className="hover:underline">Why EcoDrive?</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/profile" className="px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-sm hover:scale-105 transition">Log In</Link>
          <Link to="/" className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-slate-900 font-semibold shadow-lg hover:brightness-105 transition">Start Journey</Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-white/4"
          aria-label="Toggle menu"
          onClick={() => setOpen(v => !v)}
        >
          {open ? (
            <svg className="w-6 h-6 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden px-6 pb-6">
          <div className="flex flex-col gap-3 rounded-xl p-4 backdrop-blur-md bg-white/4 border border-white/6">
            <Link to="/features" className="py-2 px-3 rounded hover:bg-white/6">Features</Link>
            <a href="#how" className="py-2 px-3 rounded hover:bg-white/6">How it Works</a>
            <a href="#rewards" className="py-2 px-3 rounded hover:bg-white/6">Rewards</a>
            <a href="#why" className="py-2 px-3 rounded hover:bg-white/6">Why EcoDrive?</a>

            <div className="mt-2 flex gap-2">
              <Link to="/profile" className="flex-1 text-center px-3 py-2 rounded-lg border border-white/10 bg-white/3">Log In</Link>
              <Link to="/" className="flex-1 text-center px-3 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-slate-900">Start Journey</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

