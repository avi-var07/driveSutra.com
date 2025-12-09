import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import AuthBanner from "../components/auth/AuthBanner";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const toggleVariants = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#041B1A] via-[#07211F] to-[#0A2A2A] text-white">
      <Navbar />
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)] overflow-hidden border border-white/10 backdrop-blur-xl">
          
          {/* Left Banner - Hidden on mobile */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex items-center justify-center bg-gradient-to-br from-emerald-400/10 via-sky-400/10 to-teal-400/10 p-10 backdrop-blur-xl border-r border-white/10"
          >
            <AuthBanner />
          </motion.div>

          {/* Form Container */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 bg-[#05080E]/60 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <motion.h1 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm"
              >
                DriveSutraGo
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 mt-3 text-sm sm:text-base lg:text-lg"
              >
                {isLogin ? "Welcome back, eco warrior 🌱" : "Join the green revolution 💚"}
              </motion.p>
            </div>

            {/* Toggle Switch */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-8 sm:mb-10"
            >
              <div className="bg-white/5 p-1.5 rounded-full inline-flex border border-white/10 backdrop-blur-sm">
                {/* Login Button */}
                <motion.button
                  {...toggleVariants}
                  onClick={() => setIsLogin(true)}
                  className={`px-6 sm:px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    isLogin
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Login
                </motion.button>

                {/* Register Button */}
                <motion.button
                  {...toggleVariants}
                  onClick={() => setIsLogin(false)}
                  className={`px-6 sm:px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    !isLogin
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>

            {/* Forms with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? (
                  <LoginForm switchToRegister={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm switchToLogin={() => setIsLogin(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
