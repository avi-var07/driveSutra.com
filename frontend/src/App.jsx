import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

// pages
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import NewTrip from "./pages/NewTrip";
import Trips from "./pages/Trips";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Forest from "./pages/Forest";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar hamesha dikhni chahiye except login page pe */}
      <Navbar />

      {/* because navbar fixed hai, niche gap dena jaruri */}
      <div className="pt-20 px-6">
        <Routes>
          {/* login page open to everyone */}
          <Route path="/login" element={<LoginRegister />} />

          {/* protected pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trip/new"
            element={
              <ProtectedRoute>
                <NewTrip />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forest"
            element={
              <ProtectedRoute>
                <Forest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
