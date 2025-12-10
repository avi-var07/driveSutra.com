import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FaEnvelope, 
  FaLock, 
  FaCheckCircle,
  FaShieldAlt,
  FaKey,
  FaArrowLeft,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpToken, setOtpToken] = useState(''); // Store token from OTP verification

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to send OTP via nodemailer
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to verify OTP
      const response = await fetch('http://localhost:5000/api/auth/verify-forgot-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          otp: otpCode 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpToken(data.resetToken); // Store reset token for password change
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to reset password
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetToken: otpToken,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(4);
        // Redirect to unified auth page after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full"
    >
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s * 0.08 }}
                className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'bg-emerald-950/30 border border-emerald-800/30 text-slate-500'
                }`}
              >
                {step > s ? <FaCheckCircle className="text-sm" /> : s}
              </motion.div>
              {s < 4 && (
                <div className={`h-0.5 w-8 transition-all duration-300 ${
                  step > s ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-emerald-800/30'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-center">
          <motion.h2
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
          >
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify Your Email'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Reset Complete'}
          </motion.h2>
          <p className="text-sm text-slate-400 mt-2">
            {step === 1 && 'Enter your email to receive a verification code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Choose a strong password for your account'}
            {step === 4 && 'Your password has been successfully reset'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="backdrop-blur-md bg-emerald-950/20 border border-emerald-800/30 rounded-2xl shadow-2xl p-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Email Input */}
          {step === 1 && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleEmailSubmit}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-emerald-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <FaKey />
                    Send Verification Code
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50"
                >
                  <FaEnvelope className="text-3xl text-white" />
                </motion.div>
                <p className="text-sm text-slate-400">
                  We've sent a code to <span className="text-emerald-400 font-semibold">{email}</span>
                </p>
              </div>

              {/* OTP Input Fields */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    id={`forgot-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-12 h-14 text-center text-2xl font-bold bg-emerald-950/30 border-2 border-emerald-800/30 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Verify Code
                  </>
                )}
              </motion.button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-300 disabled:opacity-50"
                >
                  Didn't receive code? Resend
                </button>
              </div>

              {/* Back Button */}
              <button
                onClick={() => setStep(1)}
                className="w-full text-slate-400 hover:text-slate-300 py-2 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-sm" />
                Back to email
              </button>
            </motion.div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePasswordReset}
              className="space-y-5"
            >
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50"
                >
                  <FaLock className="text-3xl text-white" />
                </motion.div>
              </div>

              {/* New Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaLock className="text-emerald-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full pr-10 px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaShieldAlt className="text-emerald-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full pr-10 px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Reset Password
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50"
              >
                <FaCheckCircle className="text-5xl text-white" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Password Reset Successful!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 mb-6"
              >
                Your password has been updated successfully
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-emerald-400"
              >
                <FaKey className="text-2xl" />
                <span>Redirecting to login...</span>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 3 }}
                className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-6"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back to Login Link */}
      {step === 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-slate-300"
        >
          Remember your password?{' '}
          <Link to="/auth" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-300">
            Sign in
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
};

export default ForgetPassword;
