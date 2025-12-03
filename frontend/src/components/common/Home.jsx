import React from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom"; // added
export default function Home() {
  // placeholder values
  const ecoScore = 82;
  const progress = ecoScore / 100;
  const xp = 120;
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050814] via-[#05181a] to-[#04121a] text-slate-100 antialiased">
      {/* Header / Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Drive smart. Travel green. Earn rewards.
            </h1>
            <p className="text-slate-300 max-w-xl">
              EcoDrive tracks your trips, calculates an ecoScore, and rewards you with XP, carbon credits, and
              virtual trees for choosing eco-friendly and efficient travel modes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-slate-900 font-medium shadow-lg hover:-translate-y-0.5 transition">
                Start a New Trip
              </button>
              {/* changed: navigate to About (How It Works) */}
              <Link to="/about" className="px-5 py-3 rounded-full border border-white/10 bg-white/3 text-sm hover:scale-105 transition flex items-center justify-center">
                See How It Works
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex gap-3 mt-2 flex-wrap">
              <div className="glass-card px-4 py-3 rounded-2xl backdrop-blur-md bg-white/4 border border-white/6 shadow-md">
                <div className="text-sm text-slate-200">2.3k+</div>
                <div className="text-xs text-slate-300">eco-friendly trips logged</div>
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl backdrop-blur-md bg-white/4 border border-white/6 shadow-md">
                <div className="text-sm text-slate-200">18.4t</div>
                <div className="text-xs text-slate-300">CO₂ estimated saved</div>
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl backdrop-blur-md bg-white/4 border border-white/6 shadow-md">
                <div className="text-sm text-slate-200">3,900+</div>
                <div className="text-xs text-slate-300">virtual trees grown</div>
              </div>
            </div>
          </div>

          {/* Right - Gamified Dashboard Preview */}
          <div className="relative flex justify-center md:justify-end">
            <div className="w-full max-w-md relative">
              <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 opacity-12 blur-3xl pointer-events-none"></div>
              <div className="glass-card p-6 rounded-3xl backdrop-blur-md bg-white/3 border border-white/6 shadow-2xl transform hover:-translate-y-2 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300">ecoScore</div>
                    <div className="flex items-end gap-3">
                      <div className="text-4xl font-bold">{ecoScore}</div>
                      <div className="text-sm text-slate-300">/100</div>
                    </div>
                  </div>
                  {/* Circular progress ring */}
                  <svg className="w-20 h-20" viewBox="0 0 36 36">
                    <defs>
                      <linearGradient id="g" x1="0" x2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#g)"
                      strokeWidth="3"
                      strokeDasharray={`${Math.max(0, progress * 100)}, 100`}
                      strokeLinecap="round"
                    />
                    <text x="18" y="20" textAnchor="middle" fontSize="5" fill="#e6f9f1">
                      {ecoScore}
                    </text>
                  </svg>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="w-full bg-white/6 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                      style={{ width: `${Math.min(100, xp / 2)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div>Level 5 – Green Rider</div>
                    <div>+{xp} XP</div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="text-slate-200">1.4 kg CO₂ saved</div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-white/5 text-xs">Public Transport Pro</span>
                      <span className="px-2 py-1 rounded-full bg-white/5 text-xs">Smooth Driver</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating icons */}
              <div className="pointer-events-none">
                <div className="absolute -right-6 -top-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/4 shadow-md transform animate-float">
                  🚌
                </div>
                <div className="absolute -left-6 -bottom-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/4 shadow-md transform animate-float-slow">
                  🚴
                </div>
                <div className="absolute right-0 top-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/4 shadow-md transform animate-float-delay">
                  🌳
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
            {[
              {
                title: "Plan Trip",
                desc: "Enter start and end location",
                icon: "🗺️",
              },
              {
                title: "Choose Mode",
                desc: "Pick public transport, walk/cycle, or car/bike",
                icon: "🚍",
              },
              {
                title: "Travel in Real Life",
                desc: "Complete your journey",
                icon: "🧭",
              },
              {
                title: "ecoScore Generated",
                desc: "AI evaluates mode, efficiency, behavior, weather & honesty",
                icon: "⚖️",
              },
              {
                title: "Earn Rewards",
                desc: "Gain XP, CO₂ saved, trees, badges & streak progress",
                icon: "🏆",
              },
            ].map((s, i) => (
              <div key={s.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/4 border border-white/6">
                  <span className="text-xl">{s.icon}</span>
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-slate-300">{s.desc}</div>
                </div>
                {/* connecting line for larger screens */}
                {i < 4 && (
                  <div className="hidden md:block col-span-full relative -mt-6">
                    {/* visual path handled by layout; nothing else required */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="Smart Trip Evaluation"
              desc="Uses distance, time, speed, and weather to calculate your ecoScore."
              icon="🧭"
            />
            <FeatureCard
              title="Mode-Aware ecoScore"
              desc="Public transport, walking, cycling, and efficient driving get you higher scores."
              icon="🚲"
            />
            <FeatureCard
              title="Rewards & XP System"
              desc="Earn XP, level up, unlock badges and grow your virtual forest."
              icon="🏆"
            />
            <FeatureCard
              title="Anti-Cheat & Verification"
              desc="Ticket uploads, step matching and speed checks keep the system fair."
              icon="🛡️"
            />
          </div>
        </section>

        {/* Rewards Preview / Gamification */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="glass-card p-6 rounded-2xl backdrop-blur-md bg-white/3 border border-white/6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Trip Summary</div>
                <div className="text-2xl font-bold">{ecoScore} ecoScore</div>
              </div>
              <div className="text-right text-sm text-slate-300">+{xp} XP</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-slate-300">CO₂</div>
                <div className="font-semibold">0.8 kg</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-xs text-slate-300">Trees</div>
                <div className="font-semibold">+1 Tree</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-300">Tip: Smooth driving kept your behavior score high.</div>
          </div>

          <div className="glass-card p-6 rounded-2xl backdrop-blur-md bg-white/3 border border-white/6 shadow-md">
            <div className="text-sm text-slate-300">Level & Forest</div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="font-semibold">Level 4 – Eco Commuter</div>
                <div className="text-xs text-slate-300">Progress to next level</div>
              </div>
              <div className="w-40 h-4 bg-white/6 rounded-full overflow-hidden">
                <div className="h-4 bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-slate-200">Your trips have grown 37 trees.</div>
              <div className="flex gap-2 mt-3">
                <Badge name="Forest Friend" unlocked />
                <Badge name="Commuter" unlocked />
                <Badge name="Night Rider" locked />
                <Badge name="Eco Hero" locked />
              </div>
            </div>
          </div>
        </section>

        {/* Why EcoDrive */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Why choose EcoDrive?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WhyCard
              icon="🌍"
              title="Reduce Your Carbon Footprint"
              text="Track CO₂ saved and visualize your environmental impact over time."
            />
            <WhyCard
              icon="🚗"
              title="Improve Driving Habits"
              text="Get feedback on speed & efficiency and train safer, greener habits."
            />
            <WhyCard
              icon="🎯"
              title="Stay Motivated With Gamification"
              text="Streaks, challenges, and friends keep you engaged and rewarded."
            />
          </div>
        </section>

        {/* Mini Auth Teaser */}
        <section className="flex justify-center">
          <div className="w-full max-w-md glass-card p-6 rounded-2xl backdrop-blur-md bg-white/3 border border-white/6 shadow-lg">
            <div className="text-lg font-semibold mb-4">Welcome back</div>
            <form className="space-y-3">
              <input
                className="w-full bg-white/4 border border-white/6 rounded-lg px-3 py-2 placeholder:text-slate-400"
                placeholder="Email"
                type="email"
              />
              <input
                className="w-full bg-white/4 border border-white/6 rounded-lg px-3 py-2 placeholder:text-slate-400"
                placeholder="Password"
                type="password"
              />
              <button className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-slate-900 font-medium">
                Log In
              </button>
            </form>
            <div className="text-sm text-slate-300 mt-3">
              New here? <span className="text-emerald-300">Create an account</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/6 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">© 2025 EcoDrive. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-slate-300">
              <Link to="/about" className="hover:underline">About</Link>
              <a className="hover:underline">Contact</a>
              <a className="hover:underline">Privacy Policy</a>
              <a className="hover:underline">Terms</a>
            </div>
            <div className="flex gap-2 text-slate-300">
              <span className="w-8 h-8 rounded-full bg-white/4 flex items-center justify-center">🐦</span>
              <span className="w-8 h-8 rounded-full bg-white/4 flex items-center justify-center">📸</span>
              <span className="w-8 h-8 rounded-full bg-white/4 flex items-center justify-center">🔗</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Small styles for components and animations */}
      <style>{`
        .glass-card { background: rgba(255,255,255,0.03); }
        @keyframes float { 0% { transform: translateY(0);} 50% { transform: translateY(-6px);} 100% { transform: translateY(0);} }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float 5s ease-in-out infinite; }
        .animate-float-delay { animation: float 4s ease-in-out 0.2s infinite; }
      `}</style>
    </div>
  );
}

/* Small reusable subcomponents */

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="p-5 rounded-2xl backdrop-blur-md bg-white/3 border border-white/6 shadow-sm transform hover:-translate-y-2 hover:shadow-lg transition">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-300 mt-2">{desc}</div>
    </div>
  );
}

function Badge({ name, unlocked }) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        unlocked ? "bg-emerald-400 text-slate-900" : "bg-white/5 text-slate-400 blur-sm"
      }`}
    >
      {name}
    </div>
  );
}

function WhyCard({ icon, title, text }) {
  return (
    <div className="p-4 rounded-2xl backdrop-blur-md bg-white/3 border border-white/6">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-300 mt-1">{text}</div>
    </div>
  );
}
