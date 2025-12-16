import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaUsers, FaGlobeAmericas, FaLightbulb, FaHeart, FaRocket } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              About driveSutra
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              We're on a mission to transform daily commuting into an engaging, 
              eco-friendly adventure that benefits both individuals and our planet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-emerald-400">Our Mission</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Every day, millions of people make transportation choices that impact our environment. 
                We believe that by gamifying eco-friendly travel and making sustainability engaging, 
                we can create a global community of environmental champions.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                driveSutra turns your daily commute into a meaningful journey toward a greener future, 
                where every trip counts and every choice matters.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-8 border border-emerald-500/30">
                <div className="text-6xl mb-4 text-center">🌍</div>
                <h3 className="text-xl font-semibold text-center mb-4">Making Impact Visible</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">2.5M+</div>
                    <div className="text-sm text-slate-400">kg CO₂ Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">15K+</div>
                    <div className="text-sm text-slate-400">Trees Grown</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">500K+</div>
                    <div className="text-sm text-slate-400">Eco Trips</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">25K+</div>
                    <div className="text-sm text-slate-400">Active Users</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">Our Values</h2>
            <p className="text-slate-300 text-lg">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard
              icon={FaGlobeAmericas}
              title="Environmental Impact"
              description="Every feature we build is designed to encourage sustainable transportation choices and reduce carbon footprints."
            />
            <ValueCard
              icon={FaUsers}
              title="Community First"
              description="We believe in the power of collective action. Together, we can create meaningful change for our planet."
            />
            <ValueCard
              icon={FaLightbulb}
              title="Innovation"
              description="We use cutting-edge technology to make eco-friendly choices easier, more engaging, and more rewarding."
            />
            <ValueCard
              icon={FaHeart}
              title="Accessibility"
              description="Sustainable transportation should be accessible to everyone, regardless of their background or circumstances."
            />
            <ValueCard
              icon={FaRocket}
              title="Continuous Growth"
              description="We're constantly evolving, learning from our community, and improving our platform to serve you better."
            />
            <ValueCard
              icon={FaLeaf}
              title="Transparency"
              description="We're open about our methods, our impact calculations, and our journey toward a more sustainable future."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">How driveSutra Works</h2>
            <p className="text-slate-300 text-lg">Simple steps to start your eco-friendly journey</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Plan Your Trip"
              description="Enter your start and end locations. We'll show you eco-friendly route options with estimated environmental impact."
              icon="🗺️"
            />
            <StepCard
              step="2"
              title="Choose Green"
              description="Select from public transport, walking, cycling, or efficient driving. Each choice has different rewards and impact."
              icon="🚌"
            />
            <StepCard
              step="3"
              title="Earn & Grow"
              description="Complete trips to earn XP, grow your virtual forest, unlock achievements, and compete with friends."
              icon="🌱"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-emerald-400">Built by Passionate Developers</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              driveSutra is crafted by a team of developers, designers, and environmental enthusiasts 
              who believe technology can be a force for positive change. We're committed to creating 
              tools that make sustainable living not just possible, but enjoyable.
            </p>
            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Join Our Mission</h3>
              <p className="text-slate-400 mb-6">
                Whether you're a developer, designer, environmental scientist, or just someone who cares 
                about our planet, there are many ways to contribute to the driveSutra community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Contribute on GitHub
                </button>
                <button className="px-6 py-3 border border-emerald-600 text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                  Join Our Community
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* Value Card Component */
function ValueCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300"
    >
      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
        <Icon className="text-white text-xl" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* Step Card Component */
function StepCard({ step, title, description, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: parseInt(step) * 0.2 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}