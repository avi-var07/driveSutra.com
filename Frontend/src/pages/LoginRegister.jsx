import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import AuthBanner from "../components/auth/AuthBanner";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#041B1A] via-[#07211F] to-[#0A2A2A] flex items-center justify-center px-6 py-10">
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.35)] overflow-hidden border border-white/10 backdrop-blur-xl">
        
        {/* Left Banner */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-emerald-400/10 via-sky-400/10 to-teal-400/10 p-10 backdrop-blur-xl border-r border-white/10">
          <AuthBanner />
        </div>

        {/* Form space */}
        <div className="px-10 sm:px-14 py-12 bg-[#05080E]/60 backdrop-blur-xl text-white">
          {/* Title + Subtitle */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
              DriveSutraGo
            </h1>
            <p className="text-slate-400 mt-3 text-base sm:text-lg">
              {isLogin ? "Welcome back, eco warrior 🌱" : "Join the green revolution 💚"}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/5 p-1.5 rounded-full inline-flex border border-white/10">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-8 py-2.5 rounded-full font-semibold transition ${
                  isLogin
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-8 py-2.5 rounded-full font-semibold transition ${
                  !isLogin
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Render */}
          <div className="animate-fadeIn">
            {isLogin ? (
              <LoginForm switchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm switchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
