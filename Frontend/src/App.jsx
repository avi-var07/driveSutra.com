import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./components/common/Home";
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import EcoDriveMap from "./components/EcoDriveMap";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NewTripPage from "./pages/NewTrip";
import RewardsPage from "./pages/Rewards";
import TripTracker from "./pages/TripTracker";
import TripsPage from "./pages/Trips";
import ChallengesPage from "./pages/Challenges";
import ForestPage from "./pages/Forest";
import AchievementsPage from "./pages/Achievements";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";

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
    <div className="w-full min-h-screen relative font-sans bg-black overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* AUTH PAGES - Unified auth page with login/register toggle */}
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
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
        <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
        <Route path="/trip/new" element={<ProtectedRoute><NewTripPage /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/forest" element={<ProtectedRoute><ForestPage /></ProtectedRoute>} />

        {/* OTHER PAGES */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

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
        <Route path="/trip/:tripId/track" element={<ProtectedRoute><TripTracker /></ProtectedRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
