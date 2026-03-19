import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function TicketCountdown({ ticketBookedAt, ticketExpiresAt, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!ticketExpiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(ticketExpiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0, totalMs: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { expired: false, days, hours, minutes, totalMs: diff };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute

    return () => clearInterval(interval);
  }, [ticketExpiresAt]);

  if (!ticketExpiresAt || !timeLeft) return null;

  const totalDays = 7;
  const daysLeft = timeLeft.days;
  const progressPercent = timeLeft.expired ? 0 : Math.max(0, (timeLeft.totalMs / (totalDays * 24 * 60 * 60 * 1000)) * 100);

  // Color based on urgency
  const getColor = () => {
    if (timeLeft.expired) return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' };
    if (daysLeft <= 1) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' };
    if (daysLeft <= 3) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' };
  };

  const colors = getColor();

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
        {timeLeft.expired ? (
          <>
            <FaExclamationTriangle className="text-[10px]" />
            Expired
          </>
        ) : (
          <>
            <FaClock className="text-[10px]" />
            {daysLeft}d {timeLeft.hours}h left
          </>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaTicketAlt className={colors.text} />
          <span className="text-sm font-semibold text-white">Ticket Validity</span>
        </div>
        {timeLeft.expired ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
            <FaExclamationTriangle />
            EXPIRED
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <FaCheckCircle />
            ACTIVE
          </span>
        )}
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${colors.text}`}>{daysLeft}</div>
          <div className="text-xs text-slate-400">Days</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${colors.text}`}>{timeLeft.hours}</div>
          <div className="text-xs text-slate-400">Hours</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${colors.text}`}>{timeLeft.minutes}</div>
          <div className="text-xs text-slate-400">Minutes</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-2 rounded-full ${colors.bar}`}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>Booked: {new Date(ticketBookedAt).toLocaleDateString()}</span>
        <span>Expires: {new Date(ticketExpiresAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
