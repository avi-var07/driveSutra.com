import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';

const BOOKING_PROVIDERS = {
  BUS: [
    { name: 'RedBus', url: 'https://www.redbus.in', icon: '🚌', color: '#D84E55' },
    { name: 'AbhiBus', url: 'https://www.abhibus.com', icon: '🚍', color: '#FF6B00' },
    { name: 'MakeMyTrip Bus', url: 'https://www.makemytrip.com/bus-tickets', icon: '🎫', color: '#2196F3' }
  ],
  METRO: {
    'Delhi NCR': { name: 'DMRC', url: 'https://www.delhimetrorail.com', icon: '🚇' },
    'Mumbai': { name: 'Mumbai Metro', url: 'https://www.mumbai-metro.com', icon: '🚇' },
    'Bangalore': { name: 'Namma Metro', url: 'https://english.bmrc.co.in', icon: '🚇' },
    'Kolkata': { name: 'Kolkata Metro', url: 'https://www.mtp.indianrailways.gov.in', icon: '🚇' },
    'Chennai': { name: 'Chennai Metro', url: 'https://chennaimetrorail.org', icon: '🚇' },
    'Hyderabad': { name: 'Hyderabad Metro', url: 'https://www.ltmetro.com', icon: '🚇' },
    'Pune': { name: 'Pune Metro', url: 'https://www.punemetrorail.org', icon: '🚇' },
    'Kochi': { name: 'Kochi Metro', url: 'https://kochimetro.org', icon: '🚇' },
    default: { name: 'Metro Website', url: '#', icon: '🚇' }
  },
  TRAIN: [
    { name: 'IRCTC', url: 'https://www.irctc.co.in', icon: '🚆', color: '#1A237E' },
    { name: 'RailYatri', url: 'https://www.railyatri.in', icon: '🚂', color: '#FF5722' },
    { name: 'ConfirmTkt', url: 'https://www.confirmtkt.com', icon: '🎟️', color: '#4CAF50' }
  ]
};

export default function BookingModal({ isOpen, onClose, route, onBookingConfirmed }) {
  const [bookingRef, setBookingRef] = useState('');
  const [step, setStep] = useState('providers'); // 'providers' | 'confirm'
  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  const subMode = route?.subMode || 'BUS';

  const getProviders = () => {
    if (subMode === 'METRO') {
      const cityName = route?.metroCity || 'default';
      const provider = BOOKING_PROVIDERS.METRO[cityName] || BOOKING_PROVIDERS.METRO.default;
      return [{ ...provider, color: '#1565C0' }];
    }
    return BOOKING_PROVIDERS[subMode] || BOOKING_PROVIDERS.BUS;
  };

  const providers = getProviders();

  const handleConfirmBooking = async () => {
    if (!bookingRef.trim()) return;
    setConfirming(true);
    // Brief delay for UX
    await new Promise(r => setTimeout(r, 800));
    onBookingConfirmed({ bookingRef: bookingRef.trim(), subMode });
    setConfirming(false);
    setStep('providers');
    setBookingRef('');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">
                <FaTicketAlt className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Book With Us</h2>
                <p className="text-sm text-slate-400">
                  {subMode === 'METRO' ? `Metro - ${route?.metroCity || 'City'}` :
                   subMode === 'TRAIN' ? 'Train Booking' : 'Bus Booking'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FaTimes className="text-slate-400" />
            </button>
          </div>

          {step === 'providers' ? (
            <>
              {/* Benefits Banner */}
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">✨ Why Book With Us?</h3>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>✅ Auto-verified trip — no manual approval needed</li>
                  <li>✅ Instant eco rewards credited</li>
                  <li>✅ 7-day valid ticket with countdown</li>
                  <li>✅ Higher XP multiplier for booked trips</li>
                </ul>
              </div>

              {/* Booking Providers */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-300">Select a provider to book:</h3>
                {providers.map((provider, idx) => (
                  <motion.a
                    key={idx}
                    href={provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600 hover:border-emerald-500/50 transition-all cursor-pointer block"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{provider.name}</div>
                        <div className="text-xs text-slate-400">Opens in new tab</div>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-slate-400" />
                  </motion.a>
                ))}
              </div>

              {/* Continue to confirm */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('confirm')}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                I've Booked — Enter Reference
              </motion.button>
            </>
          ) : (
            <>
              {/* Confirm Booking */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Booking Reference / PNR Number
                </label>
                <input
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="Enter your booking reference..."
                  className="w-full p-4 rounded-xl bg-slate-700/50 border-2 border-slate-600 focus:border-emerald-500 text-white placeholder-slate-500 outline-none transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-2">
                  Enter the booking reference or PNR from your ticket confirmation
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('providers')}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-700 text-slate-300 font-semibold hover:bg-slate-600 transition-all"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmBooking}
                  disabled={!bookingRef.trim() || confirming}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaCheckCircle />
                      Confirm Booking
                    </>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
