import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import AuthBanner from "../components/auth/AuthBanner";
import { useLocation } from "react-router-dom";

export default function LoginRegister() {
  const [showLogin, setShowLogin] = useState(true);

  // Hide Navbar if URL is /login (functionality ignore for now)
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Left Banner (Desktop) */}
      <div className="hidden md:flex w-1/2 justify-center items-center bg-gradient-to-br from-emerald-400/20 to-sky-400/10 border-r border-white/10">
        <AuthBanner />
      </div>

      {/* Right Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center px-6 md:px-0">
        {showLogin ? (
          <LoginForm switchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterForm switchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
}
