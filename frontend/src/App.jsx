import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./components/common/Home";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import EcoDriveMap from "./components/EcoDriveMap";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Small placeholder used for routes we don't want to import heavy components for now
const RoutesPlaceholder = ({ name }) => <div className="text-white p-20 text-4xl">{name} Page Placeholder</div>;

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative font-sans bg-black overflow-hidden">
      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* AUTH PAGES */}
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED PAGES */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />

        {/* App pages referenced by Navbar */}
        <Route path="/trips" element={<div className="text-white p-20 text-4xl"><RoutesPlaceholder name="Trips" /></div>} />
        <Route path="/challenges" element={<div className="text-white p-20 text-4xl"><RoutesPlaceholder name="Challenges" /></div>} />
        <Route path="/forest" element={<div className="text-white p-20 text-4xl"><RoutesPlaceholder name="Forest" /></div>} />

        {/* OTHER PAGES */}
        <Route path="/about" element={
          <div className="text-white p-20 text-4xl">
            About Page Content
          </div>
        }/>

        <Route path="/explore" element={
          <div className="text-white p-20 text-4xl">
            Explore Page Content
          </div>
        }/>

        <Route path="/features" element={
          <div className="text-white p-20 text-4xl">
            Features Page Content
          </div>
        }/>

        <Route path="/eco-map" element={<EcoDriveMap />}/>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
