import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import googleAuth from '../../services/googleAuth';
import api from '../../services/api';

const LoginForm = ({ switchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Login form submitted');  // DEBUG LOG
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      console.log('❌ Missing fields');  // DEBUG LOG
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('📨 Attempting login with:', formData.email);  // DEBUG LOG
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting...');
        // Force page reload to ensure auth state is properly updated
        window.location.href = '/dashboard';
      } else {
        console.log('Login failed with error:', result.error);
        setError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔵 Google login button clicked');  // DEBUG LOG
    setError('');
    setLoading(true);
    
    try {
      // Step 1: Sign in with Google
      console.log('1️⃣ Starting Google signIn()...');  // DEBUG LOG
      const googleResult = await googleAuth.signIn();
      console.log('2️⃣ Google result:', googleResult?.success ? '✅ Success' : '❌ Failed');  // DEBUG LOG
      
      if (!googleResult.success) {
        console.error('❌ Google signin failed:', googleResult.error);  // DEBUG LOG
        setError(googleResult.error || 'Google sign-in failed');
        setLoading(false);
        return;
      }

      // Step 2: Send to backend
      console.log('3️⃣ Sending idToken to backend...');  // DEBUG LOG
      const response = await api.post('/auth/google-signin', {
        idToken: googleResult.user.idToken,
        profile: googleResult.user
      });
      console.log('4️⃣ Backend response:', response.data?.success ? '✅ Success' : '❌ Failed');  // DEBUG LOG

      if (response.data.success) {
        console.log('✅ Authentication successful, storing credentials');  // DEBUG LOG
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Token and user stored in localStorage');  // DEBUG LOG
        console.log('🔄 Reloading page to initialize auth context...');  // DEBUG LOG
        
        // Force page reload to update AuthContext with new token/user
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        console.error('❌ Backend rejected login:', response.data.message);  // DEBUG LOG
        setError(response.data.message || 'Authentication failed');
      }

    } catch (error) {
      console.error('❌ Google login error:', error);  // DEBUG LOG
      if (error.response) {
        setError(error.response.data.message || 'Server error occurred');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            <FaEnvelope className="inline mr-2 text-emerald-400" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            autoComplete="username"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 outline-none transition-all duration-300"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            <FaLock className="inline mr-2 text-emerald-400" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 outline-none transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <a
            href="/forgot-password"
            className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
          >
            Forgot Password?
          </a>
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 font-bold text-slate-900 py-3 rounded-xl shadow-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"
              />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </motion.button>
      </motion.form>

      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 my-6"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <span className="text-slate-400 text-sm">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 transition-all duration-300 disabled:opacity-50 font-semibold"
      >
        <FaGoogle className="text-lg" />
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </motion.button>

      <motion.div variants={itemVariants} className="text-center space-y-3">
        <p className="text-slate-300 text-sm">
          Don't have an account?{' '}
          <button
            onClick={switchToRegister}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            Sign up
          </button>
        </p>
        
        <div className="pt-2 border-t border-white/10">
          <a
            href="/admin/login"
            className="text-sky-400 text-sm font-semibold hover:text-sky-300 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Login as Admin
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
