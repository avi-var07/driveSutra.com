// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import Trips from './pages/Trips';
import Challenges from './pages/Challenges';
import Achievements from './pages/Achievements';
import Forest from './pages/Forest';
import Profile from './pages/Profile';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const AppLayout = () => {
  const { user, loading } = useAuth();

  // Show spinner while checking auth status (e.g., token in localStorage)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      
      <div className="flex">
        {user && <Sidebar />}
        
        <main className={user ? "flex-1 p-6 lg:p-10" : "w-full"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginRegister />} />
            <Route path="/login" element={<LoginRegister initialTab="login" />} />
            <Route path="/register" element={<LoginRegister initialTab="register" />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trip/new" element={<NewTrip />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/forest" element={<Forest />} />
              <Route path="/profile" element={<Profile />} />

              {/* Default redirect after login */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;