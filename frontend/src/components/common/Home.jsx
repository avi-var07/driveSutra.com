import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { FaCarRear, FaTrain, FaEarthAmericas, FaBicycle, FaLeaf, FaChartLine, FaUsers } from "react-icons/fa6";
import { BsFillTreeFill } from "react-icons/bs";
import { CiTrophy } from "react-icons/ci";
import { HiSparkles } from "react-icons/hi2";
import { motion } from "motion/react";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef(null);

  // Carousel images - eco-friendly travel themes
  const carouselSlides = [
    {
      image: "https://media.istockphoto.com/id/1311425083/video/side-view-of-a-generic-autonomous-electric-car-driving-through-the-green-countryside.jpg?s=640x640&k=20&c=ce1Ss-GXZ7JZoXGFYw6rlMWimtSLWBwUlt9NVIzR0Zw=",
      title: "Sustainable Urban Mobility",
      desc: "Choose greener ways to move"
    },
    {
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=600&fit=crop",
      title: "Public Transport Excellence",
      desc: "Reduce emissions together"
    },
    {
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&h=600&fit=crop",
      title: "Eco-Friendly Cycling",
      desc: "Zero emissions, maximum impact"
    }
  ];

  useEffect(() => {
    // Loading screen timer
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Logo animation plays for 3.5 seconds

    // Scroll animation observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Auto-advance carousel
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(loadingTimer);
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f1a] via-[#112820] to-[#0a1d16] text-slate-100 antialiased overflow-x-hidden">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}
      
      {/* Main Content - Hidden during loading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header / Navbar */}
        <Navbar />

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center px-6 py-24 overflow-hidden">

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Text Content (ALWAYS VISIBLE) */}
              <div className="space-y-7 hero-content">
                {/* Eco Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600/15 border border-emerald-500/25 text-emerald-300 text-sm font-medium backdrop-blur-sm">
                  <FaLeaf className="text-base" />
                  Promote Eco-Friendly Driving Habits
                </div>
                
                {/* Main Headline with Animated Rotation */}
                <div className="relative h-[280px] md:h-[320px] lg:h-[360px]">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight">
                    <motion.div
                      key="line1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="block text-slate-100"
                    >
                      Drive with
                    </motion.div>
                    
                    {/* Animated rotating words */}
                    <div className="block h-[80px] md:h-[90px] lg:h-[100px] overflow-hidden relative">
                      <motion.div
                        animate={{ 
                          y: [0, -100, -100, -200, -200, -300, -300, 0],
                        }}
                        transition={{ 
                          duration: 12,
                          repeat: Infinity,
                          ease: "easeInOut",
                          times: [0, 0.16, 0.33, 0.49, 0.66, 0.82, 0.95, 1]
                        }}
                      >
                        <span className="block h-[80px] md:h-[90px] lg:h-[100px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent leading-[1.15]">
                          Purpose.
                        </span>
                        <span className="block h-[80px] md:h-[90px] lg:h-[100px] bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500 bg-clip-text text-transparent leading-[1.15]">
                          Passion.
                        </span>
                        <span className="block h-[80px] md:h-[90px] lg:h-[100px] bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent leading-[1.15]">
                          Impact.
                        </span>
                        <span className="block h-[80px] md:h-[90px] lg:h-[100px] bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400 bg-clip-text text-transparent leading-[1.15]">
                          Rewards.
                        </span>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      key="line3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="block text-slate-100 mt-2"
                    >
                      Grow with Excellence.
                    </motion.div>
                  </h1>
                </div>
                
                {/* Description */}
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed hero-fade-4">
                  Every sustainable journey nurtures a greener future. Track your trips, reduce emissions, 
                  and watch your positive impact grow—one eco-friendly choice at a time.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 hero-fade-5">
                  <Link 
                    to="/eco-map" 
                    className="group px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <BsFillTreeFill className="group-hover:scale-110 transition-transform" />
                    Start Eco Trip
                  </Link>
                  <Link 
                    to="/about" 
                    className="px-8 py-4 rounded-xl border-2 border-emerald-700/40 bg-emerald-950/30 text-slate-200 font-semibold hover:bg-emerald-950/50 hover:border-emerald-600/60 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                  >
                    Learn Our Mission
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 hero-fade-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400">2.3k+</div>
                    <div className="text-xs text-slate-400 mt-1.5">Eco Trips</div>
                  </div>
                  <div className="text-center border-x border-emerald-800/30">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400">18.4t</div>
                    <div className="text-xs text-slate-400 mt-1.5">CO₂ Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400">3.9k</div>
                    <div className="text-xs text-slate-400 mt-1.5">Trees Grown</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Animated Logo */}
              <div className="relative flex items-center justify-center lg:justify-end min-h-[500px]">
                <AnimatedLogo />
              </div>
            </div>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="py-20 px-6 bg-gradient-to-b from-emerald-950/20 to-transparent scroll-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Collective Impact</h2>
              <p className="text-slate-400">Together, we're building a sustainable future</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard
                number="2,340+"
                label="Eco-friendly trips"
                icon={<FaCarRear className="text-3xl" />}
              />
              <StatCard
                number="18.4t"
                label="CO₂ emissions saved"
                icon={<FaLeaf className="text-3xl" />}
              />
              <StatCard
                number="3,900+"
                label="Virtual trees grown"
                icon={<BsFillTreeFill className="text-3xl" />}
              />
            </div>
          </div>
        </section>

        {/* Image Carousel Section */}
        <section className="py-20 px-6 scroll-animate">
          <div className="max-w-6xl mx-auto">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {carouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.title}</h3>
                    <p className="text-lg text-slate-200">{slide.desc}</p>
                  </div>
                </div>
              ))}
              
              {/* Carousel indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {carouselSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide 
                        ? "bg-emerald-400 w-8" 
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 scroll-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                A simple, transparent process that rewards sustainable choices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  title: "Plan Trip",
                  desc: "Enter start and destination",
                  icon: "🗺️",
                  color: "emerald"
                },
                {
                  title: "Choose Mode",
                  desc: "Select your travel method",
                  icon: <FaTrain className="text-2xl" />,
                  color: "teal"
                },
                {
                  title: "Complete Journey",
                  desc: "Travel in real life",
                  icon: "🧭",
                  color: "emerald"
                },
                {
                  title: "Get Scored",
                  desc: "AI evaluates your trip",
                  icon: "⚖️",
                  color: "teal"
                },
                {
                  title: "Earn Rewards",
                  desc: "XP, trees, and badges",
                  icon: <CiTrophy className="text-2xl" />,
                  color: "emerald"
                },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-6 hover:bg-emerald-950/30 hover:border-emerald-700/40 transition-all duration-300">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${step.color}-500/10 border border-${step.color}-500/20 mb-4`}>
                      {typeof step.icon === 'string' ? (
                        <span className="text-2xl">{step.icon}</span>
                      ) : (
                        <div className="text-emerald-400">{step.icon}</div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.desc}</p>
                  </div>
                  
                  {i < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-24 px-6 bg-slate-900/30 scroll-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Key Features</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Intelligent tracking and rewards designed for sustainable travel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="Smart Evaluation"
                desc="AI-powered scoring based on distance, time, efficiency, and environmental impact"
                icon="🧭"
              />
              <FeatureCard
                title="Mode Recognition"
                desc="Automatic detection and rewards for eco-friendly transport choices"
                icon="🚲"
              />
              <FeatureCard
                title="Gamified Rewards"
                desc="Earn XP, level up, unlock achievements and grow your virtual forest"
                icon="🏆"
              />
              <FeatureCard
                title="Anti-Cheat System"
                desc="Fair verification through ticket validation and behavioral analysis"
                icon="🛡️"
              />
            </div>
          </div>
        </section>

        {/* Rewards & Gamification Preview */}
        <section className="py-24 px-6 scroll-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Track Your Progress</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Visualize your environmental impact and celebrate achievements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trip Summary Card */}
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-8 hover:bg-emerald-950/30 hover:border-emerald-600/40 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Recent Trip Score</p>
                    <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      82
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Earned</p>
                    <p className="text-2xl font-semibold text-emerald-400">+120 XP</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-800/30">
                    <p className="text-xs text-slate-400 mb-1">CO₂ Saved</p>
                    <p className="text-2xl font-bold text-slate-100">0.8 kg</p>
                  </div>
                  <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-800/30">
                    <p className="text-xs text-slate-400 mb-1">Trees Earned</p>
                    <p className="text-2xl font-bold text-emerald-400">+1</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-300 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <HiSparkles className="text-emerald-400 flex-shrink-0" />
                  <span>Smooth driving maintained high behavior score</span>
                </div>
              </div>

              {/* Level & Achievements Card */}
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-8 hover:bg-emerald-950/30 hover:border-teal-600/40 transition-all duration-500">
                <div className="mb-6">
                  <p className="text-sm text-slate-400 mb-2">Current Level</p>
                  <h3 className="text-3xl font-bold mb-4">Level 5 – Green Rider</h3>
                  
                  <div className="w-full bg-emerald-950/40 rounded-full h-3 overflow-hidden border border-emerald-800/30">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">65% to Level 6</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-300 mb-3">
                      <BsFillTreeFill className="inline text-emerald-400 mr-2" />
                      Your trips have grown <span className="font-semibold text-emerald-400">37 trees</span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Achievements Unlocked</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge name="Forest Friend" unlocked />
                      <Badge name="Commuter" unlocked />
                      <Badge name="Night Rider" locked />
                      <Badge name="Eco Hero" locked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why EcoDrive */}
        <section className="py-24 px-6 scroll-animate">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose EcoDrive?</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Join a community committed to sustainable transportation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <WhyCard
                icon={<FaEarthAmericas className="text-3xl text-emerald-400" />}
                title="Reduce Carbon Footprint"
                text="Track and visualize your environmental impact with detailed CO₂ savings metrics over time."
              />
              <WhyCard
                icon={<FaChartLine className="text-3xl text-teal-400" />}
                title="Improve Habits"
                text="Receive personalized feedback on efficiency and safety to develop greener travel patterns."
              />
              <WhyCard
                icon={<FaUsers className="text-3xl text-emerald-400" />}
                title="Stay Motivated"
                text="Compete in challenges, maintain streaks, and celebrate milestones with a growing community."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/30 bg-emerald-950/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                EcoDrive
              </h3>
              <p className="text-sm text-slate-400 max-w-md">
                Making sustainable transportation accessible, rewarding, and fun for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-slate-200">Quick Links</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to="/about" className="block hover:text-emerald-400 transition">About</Link>
                <a href="#" className="block hover:text-emerald-400 transition">Contact</a>
                <a href="#" className="block hover:text-emerald-400 transition">FAQ</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-slate-200">Legal</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <a href="#" className="block hover:text-emerald-400 transition">Privacy Policy</a>
                <a href="#" className="block hover:text-emerald-400 transition">Terms of Service</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-emerald-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2025 EcoDrive. All rights reserved.</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-center hover:bg-emerald-900/40 hover:border-emerald-600/50 transition">
                🐦
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-center hover:bg-emerald-900/40 hover:border-emerald-600/50 transition">
                📸
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-center hover:bg-emerald-900/40 hover:border-emerald-600/50 transition">
                🔗
              </a>
            </div>
          </div>
        </div>
      </footer>
      </motion.div>

      {/* Styles */}
      <style>{`
        /* ========================================
           HERO TEXT ANIMATIONS - Minimal & Clean
           ======================================== */
        
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-fade-1 { animation: heroFadeIn 0.6s ease-out 0.1s forwards; opacity: 0; }
        .hero-fade-2 { animation: heroFadeIn 0.6s ease-out 0.2s forwards; opacity: 0; }
        .hero-fade-3 { animation: heroFadeIn 0.6s ease-out 0.3s forwards; opacity: 0; }
        .hero-fade-4 { animation: heroFadeIn 0.6s ease-out 0.4s forwards; opacity: 0; }
        .hero-fade-5 { animation: heroFadeIn 0.6s ease-out 0.5s forwards; opacity: 0; }
        .hero-fade-6 { animation: heroFadeIn 0.6s ease-out 0.6s forwards; opacity: 0; }

        /* ========================================
           SCROLL ANIMATIONS - Section Reveals
           ======================================== */
        
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }

        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }


      `}</style>
    </div>
  );
}

/* Loading Screen Component */
function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#0d1f1a] via-[#112820] to-[#0a1d16]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Animated Logo */}
          <div className="relative">
            {/* Pulsing glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <svg width="160" height="160" viewBox="0 0 200 200" className="drop-shadow-2xl relative z-10">
              {/* Outer rotating ring */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#loadGradient1)"
                strokeWidth="4"
                strokeDasharray="15 8"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ originX: '100px', originY: '100px' }}
              />
              
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#loadGradient2)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '100px 100px',
                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                }}
              />

              {/* Background */}
              <defs>
                <radialGradient id="loadBgGradient">
                  <stop offset="0%" stopColor="#ecfdf5" />
                  <stop offset="100%" stopColor="#d1fae5" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="70" fill="url(#loadBgGradient)" />
              
              {/* Pulsing rings */}
              <motion.circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
                opacity="0.3"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: '100px 100px' }}
              />
              
              {/* Road */}
              <motion.path
                d="M 40 140 Q 70 100, 100 90 T 160 60"
                stroke="url(#loadRoadGradient)"
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
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
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
              />

              {/* Vehicle animation */}
              <motion.g
                initial={{ x: 40, y: 140, opacity: 0 }}
                animate={{
                  x: [40, 160],
                  y: [140, 60],
                  opacity: [0, 1, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut",
                  delay: 1.8,
                  times: [0, 0.1, 1]
                }}
              >
                <circle cx="0" cy="0" r="7" fill="#10b981" style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.8))' }} />
                <rect x="-4" y="-2.5" width="8" height="5" fill="white" rx="1" />
                <circle cx="0" cy="0" r="2" fill="#fbbf24" />
              </motion.g>

              {/* Center leaf - Growing animation */}
              <motion.g
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 150 }}
                style={{ transformOrigin: '100px 87px' }}
              >
                <motion.path
                  d="M 100 50 Q 130 65, 135 90 Q 135 105, 120 115 Q 110 120, 100 125 L 100 50 Z"
                  fill="url(#loadLeafGradient1)"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  style={{ transformOrigin: '117px 87px' }}
                />
                <motion.path
                  d="M 100 50 Q 70 65, 65 90 Q 65 105, 80 115 Q 90 120, 100 125 L 100 50 Z"
                  fill="url(#loadLeafGradient2)"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                  style={{ transformOrigin: '83px 87px' }}
                />
                <path d="M 100 50 L 100 125" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                <motion.circle
                  cx="100"
                  cy="87"
                  r="7"
                  fill="#fbbf24"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  style={{ transformOrigin: '100px 87px', filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))' }}
                />
              </motion.g>

              {/* Gradients */}
              <defs>
                <linearGradient id="loadGradient1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="loadGradient2">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="loadRoadGradient">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="loadLeafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="loadLeafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Brand name with fade-in */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              driveSutra.com
            </h1>
            <div className="text-emerald-400 mt-2 text-sm tracking-wider flex items-center gap-2 justify-center">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.4 }}
              >
                Travel
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.3 }}
              >
                →
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                Evaluate
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.3 }}
              >
                →
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.3, duration: 0.4 }}
              >
                Reward
              </motion.span>
            </div>
          </motion.div>

          {/* Loading dots */}
          <motion.div 
            className="flex gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* Animated Logo Component */
function AnimatedLogo() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo */}
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl relative z-10">
          {/* Outer rotating ring with gradient */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="4"
            strokeDasharray="15 8"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ originX: '100px', originY: '100px' }}
          />
          
          {/* Counter rotating ring */}
          <motion.circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#gradient3)"
            strokeWidth="2"
            strokeDasharray="10 5"
            opacity="0.6"
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ originX: '100px', originY: '100px' }}
          />
          
          {/* Progress circle with glow */}
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#d1fae5"
            strokeWidth="10"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '100px 100px',
              filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
            }}
          />

          {/* Main circular background with gradient */}
          <defs>
            <radialGradient id="bgGradient">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="50%" stopColor="#d1fae5" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </radialGradient>
            <pattern id="dotPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="0.5" fill="#10b981" opacity="0.1" />
            </pattern>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#bgGradient)" />
          <circle cx="100" cy="100" r="70" fill="url(#dotPattern)" opacity="0.5" />
          
          {/* Animated concentric rings in background */}
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="#10b981"
            strokeWidth="0.5"
            opacity="0.2"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: '100px 100px' }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="#10b981"
            strokeWidth="0.5"
            opacity="0.2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ transformOrigin: '100px 100px' }}
          />
          
          {/* Road path inside */}
          <motion.path
            d="M 40 140 Q 70 100, 100 90 T 160 60"
            stroke="#e5e7eb"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
          />
          <motion.path
            d="M 40 140 Q 70 100, 100 90 T 160 60"
            stroke="url(#roadGradient)"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))' }}
          />
          {/* Road dashes */}
          <motion.path
            d="M 40 140 Q 70 100, 100 90 T 160 60"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 10"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 20 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Multiple vehicles moving on path */}
          <motion.g
            animate={{
              x: [40, 70, 100, 130, 160],
              y: [140, 115, 90, 75, 60]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          >
            <circle cx="0" cy="0" r="8" fill="#10b981" style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.8))' }} />
            <rect x="-5" y="-3" width="10" height="6" fill="white" rx="1" />
            <circle cx="0" cy="0" r="2" fill="#fbbf24" />
          </motion.g>
          
          {/* Second vehicle with delay */}
          <motion.g
            animate={{
              x: [40, 70, 100, 130, 160],
              y: [140, 115, 90, 75, 60]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1,
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          >
            <circle cx="0" cy="0" r="6" fill="#059669" opacity="0.8" />
          </motion.g>

          {/* Tree/leaf in center with enhanced animation */}
          <motion.g
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 150 }}
            style={{ transformOrigin: '100px 100px' }}
          >
            {/* Modern leaf/eco symbol */}
            {/* Main large leaf */}
            <motion.path
              d="M 100 50 Q 130 65, 135 90 Q 135 105, 120 115 Q 110 120, 100 125 L 100 50 Z"
              fill="url(#leafMainGradient)"
              animate={{ 
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                transformOrigin: '117px 87px',
                filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.4))'
              }}
            />
            <motion.path
              d="M 100 50 Q 70 65, 65 90 Q 65 105, 80 115 Q 90 120, 100 125 L 100 50 Z"
              fill="url(#leafMainGradient2)"
              animate={{ 
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              style={{ 
                transformOrigin: '83px 87px',
                filter: 'drop-shadow(0 2px 6px rgba(5, 150, 105, 0.4))'
              }}
            />
            
            {/* Leaf vein details */}
            <motion.path
              d="M 100 60 Q 115 70, 120 85 M 100 75 Q 110 80, 115 90 M 100 90 Q 108 95, 110 100"
              stroke="#047857"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 100 60 Q 85 70, 80 85 M 100 75 Q 90 80, 85 90 M 100 90 Q 92 95, 90 100"
              stroke="#047857"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />
            
            {/* Center stem with glow */}
            <motion.path
              d="M 100 50 L 100 125"
              stroke="url(#stemGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ 
                strokeWidth: [3, 3.5, 3],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))' }}
            />
            
            {/* Glowing orb at center */}
            <motion.circle
              cx="100"
              cy="87"
              r="8"
              fill="url(#orbGradient)"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                transformOrigin: '100px 87px',
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
              }}
            />
            <motion.circle
              cx="100"
              cy="87"
              r="4"
              fill="#fef3c7"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: '100px 87px' }}
            />
            
            {/* Energy particles around the leaf */}
            {[
              { x: 110, y: 70, delay: 0 },
              { x: 90, y: 70, delay: 0.3 },
              { x: 115, y: 95, delay: 0.6 },
              { x: 85, y: 95, delay: 0.9 },
              { x: 100, y: 60, delay: 1.2 }
            ].map((pos, i) => (
              <motion.g key={`energy-${i}`}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="2.5"
                  fill="#fbbf24"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -5, -10]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: pos.delay
                  }}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))' }}
                />
              </motion.g>
            ))}
          </motion.g>

          {/* Enhanced floating leaves with trails */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.g key={i}>
              <motion.path
                d="M 0 0 Q 4 -3, 6 0 Q 4 3, 0 0"
                fill="url(#leafSmallGradient)"
                initial={{
                  x: 100,
                  y: 100,
                  opacity: 0,
                  scale: 0
                }}
                animate={{
                  x: 100 + Math.cos((i * 60) * Math.PI / 180) * 45,
                  y: 100 + Math.sin((i * 60) * Math.PI / 180) * 45,
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                  scale: [0, 1.2, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
                style={{ filter: 'drop-shadow(0 0 2px rgba(52, 211, 153, 0.6))' }}
              />
            </motion.g>
          ))}
          
          {/* CO2 particles being absorbed */}
          {[0, 1, 2, 3].map((i) => (
            <motion.text
              key={`co2-${i}`}
              x={60 + i * 20}
              y="160"
              fontSize="8"
              fill="#94a3b8"
              opacity="0.6"
              initial={{ y: 160, opacity: 0 }}
              animate={{ 
                y: 80,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeIn"
              }}
            >
              CO₂
            </motion.text>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="33%" stopColor="#fbbf24" />
              <stop offset="66%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <radialGradient id="leafGradient1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>
            <radialGradient id="leafGradient2">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id="leafGradient3">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>
            <linearGradient id="leafSmallGradient">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="leafMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="leafMainGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <radialGradient id="orbGradient">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fbbf24" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Brand name */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-3 justify-center">
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ 
              backgroundSize: '200% 200%',
              filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2))'
            }}
          >
            driveSutra.com
          </motion.h1>
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-4xl">🌱</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* Reusable Components */

function StatCard({ number, label, icon }) {
  return (
    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-8 text-center hover:bg-emerald-950/30 hover:border-emerald-700/40 transition-all duration-500">
      <div className="flex justify-center mb-4 text-emerald-400">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-6 hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Badge({ name, unlocked }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
        unlocked 
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
          : "bg-slate-800/50 text-slate-500 border border-slate-700/30 opacity-60"
      }`}
    >
      {name}
    </span>
  );
}

function WhyCard({ icon, title, text }) {
  return (
    <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-8 hover:bg-emerald-950/30 hover:border-emerald-700/40 hover:-translate-y-1 transition-all duration-300">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
    </div>
  );
}
