import React from "react";
import { Routes, Route } from "react-router-dom";

<<<<<<< Updated upstream
import Home from "./components/common/Home";
import Profile from "./pages/Profile";

function App() {
  return (
    <div className="w-full min-h-screen relative font-sans bg-black overflow-hidden">
      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

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

        <Route path="/profile" element={<Profile />}/>
      </Routes>
    </div>
=======
// Auth
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AuthBanner from './components/auth/AuthBanner';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';        
import Forest from './pages/Forest';     

const LoginRegisterPage = ({ initialTab = 'login' }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-12">
        <AuthBanner />
        <div className="flex-1 flex items-center justify-center">
          {initialTab === 'register' ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginRegisterPage />} />
          <Route path="/login" element={<LoginRegisterPage initialTab="login" />} />
          <Route path="/register" element={<LoginRegisterPage initialTab="register" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/forest" element={<ProtectedRoute><Forest /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
>>>>>>> Stashed changes
  );
}

export default App;
