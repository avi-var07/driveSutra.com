import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { sendOTP, verifyOTP, registerAPI } from '../../services/authService';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaCheckCircle,
  FaShieldAlt,
  FaLeaf 
} from 'react-icons/fa';

const RegisterForm = () => {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await sendOTP(formData.email);
      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
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
      const response = await verifyOTP(formData.email, otpCode);
      if (response.data.success) {
        setOtpVerified(true);
        setStep(3);
        // Proceed to registration
        await handleRegister();
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);

    try {
      const response = await registerAPI({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Simulate success for 2 seconds before redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed');
        setStep(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOTP();
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
        <div className="flex items-center justify-center gap-4 mb-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s * 0.1 }}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'bg-emerald-950/30 border border-emerald-800/30 text-slate-500'
                }`}
              >
                {step > s ? <FaCheckCircle /> : s}
              </motion.div>
              {s < 3 && (
                <div className={`h-0.5 w-12 transition-all duration-300 ${
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
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Verify Your Email'}
            {step === 3 && 'Welcome Aboard!'}
          </motion.h2>
          <p className="text-sm text-slate-400 mt-2">
            {step === 1 && 'Join the eco-friendly community'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Your account has been created successfully'}
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
          {/* Step 1: Registration Form */}
          {step === 1 && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOTP();
              }}
              className="space-y-5"
            >
              {/* First Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaUser className="text-emerald-400" />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="John"
                />
              </motion.div>

              {/* Last Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaUser className="text-emerald-400" />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="Doe"
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-emerald-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaLock className="text-emerald-400" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <FaShieldAlt className="text-emerald-400" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                  placeholder="••••••••"
                />
              </motion.div>

            {/* Terms and Conditions Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-start gap-3"
            >
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-emerald-800/50 bg-emerald-950/30 cursor-pointer accent-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
              />
              <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer">
                I agree to the{' '}
                <a 
                  href="/terms" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </motion.div>

            {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
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
                  We've sent a code to <span className="text-emerald-400 font-semibold">{formData.email}</span>
                </p>
              </div>

              {/* OTP Input Fields */}
              <div className="flex gap-2 justify-center">
            {/* Terms and Conditions Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-start gap-3"
            >
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-emerald-800/50 bg-emerald-950/30 cursor-pointer accent-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
              />
              <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer">
                I agree to the{' '}
                <a 
                  href="/terms" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </label>
            </motion.div>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
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
                    Verify & Register
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
                className="w-full text-slate-400 hover:text-slate-300 py-2 transition-colors duration-300"
              >
                ← Back to form
              </button>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
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
                Registration Successful!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 mb-6"
              >
                Welcome to driveSutra.com, {formData.firstName}!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-emerald-400"
              >
                <FaLeaf className="text-2xl" />
                <span>Redirecting to dashboard...</span>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 2 }}
                className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-6"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login Link */}
      {step === 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-slate-300"
        >
          Already have an account?{' '}
          <Link to="/auth" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-300">
            Sign in
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
};

export default RegisterForm;