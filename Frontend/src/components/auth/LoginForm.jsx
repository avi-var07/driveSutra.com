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
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Step 1: Sign in with Google
      const googleResult = await googleAuth.signIn();
      
      if (!googleResult.success) {
        setError(googleResult.error || 'Google sign-in failed');
        setLoading(false);
        return;
      }

      // Step 2: Send to backend
      const response = await api.post('/auth/google-signin', {
        idToken: googleResult.user.idToken,
        profile: googleResult.user
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate to dashboard
        navigate('/dashboard');
        window.location.reload(); // Refresh to update auth context
      } else {
        setError(response.data.message || 'Authentication failed');
      }

    } catch (error) {
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

      <motion.div variants={itemVariants} className="text-center">
        <p className="text-slate-300 text-sm">
          Don't have an account?{' '}
          <button
            onClick={switchToRegister}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
