import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <FaLeaf className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                driveSutra.com
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transform your daily commute into an eco-friendly adventure. Track, compete, and make a positive impact on the environment with every trip.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="https://twitter.com" icon={FaTwitter} />
              <SocialLink href="https://facebook.com" icon={FaFacebook} />
              <SocialLink href="https://instagram.com" icon={FaInstagram} />
              <SocialLink href="https://linkedin.com" icon={FaLinkedin} />
              <SocialLink href="https://github.com" icon={FaGithub} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/trip/new">Start Trip</FooterLink>
              <FooterLink to="/challenges">Challenges</FooterLink>
              <FooterLink to="/achievements">Achievements</FooterLink>
              <FooterLink to="/forest">Your Forest</FooterLink>
              <FooterLink to="/rewards">Rewards</FooterLink>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <div className="space-y-2">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <FaEnvelope className="text-emerald-400" />
                <span className="text-sm">supportDriveSutra@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <FaPhone className="text-emerald-400" />
                <span className="text-sm">8687883676</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400">
                <FaMapMarkerAlt className="text-emerald-400 mt-1" />
                <span className="text-sm">
                  Lovely Professional University<br />
                  Jalandhar, Punjab<br />
                  India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact Stats */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Our Community Impact</h3>
            <p className="text-slate-400 text-sm">Together, we're making a difference</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ImpactStat icon="🌍" value="2.5M+" label="CO₂ Saved (kg)" />
            <ImpactStat icon="🌳" value="15K+" label="Trees Grown" />
            <ImpactStat icon="🚴" value="500K+" label="Eco Trips" />
            <ImpactStat icon="👥" value="25K+" label="Active Users" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm text-center md:text-left">
            © {currentYear} driveSutra.com. All rights reserved. Made with 💚 for a sustainable future.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Social Link Component */
function SocialLink({ href, icon: Icon }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="text-sm" />
    </motion.a>
  );
}

/* Footer Link Component */
function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block text-slate-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
    >
      {children}
    </Link>
  );
}

/* Impact Stat Component */
function ImpactStat({ icon, value, label }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-emerald-400 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </motion.div>
  );
}