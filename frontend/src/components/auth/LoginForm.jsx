import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';

const LoginForm = ({ switchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleGoogleLogin = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      console.log('Google auth token:', credentialResponse);
      setError('Google authentication coming soon');
    } catch (err) {
      setError('Google authentication failed');
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
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 outline-none transition-all duration-300"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            <FaLock className="inline mr-2 text-emerald-400" />
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400 outline-none transition-all duration-300"
          />
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
        onClick={() => handleGoogleLogin(null)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 transition-all duration-300 disabled:opacity-50 font-semibold"
      >
        <FaGoogle className="text-lg" />
        Sign in with Google
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
