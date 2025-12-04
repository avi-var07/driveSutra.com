import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Dashboard from "./pages/Dashboard";
import NewTrip from "./pages/NewTrip";
import Trips from "./pages/Trips";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Forest from "./pages/Forest";
import Profile from "./pages/Profile";
import LoginRegister from "./pages/LoginRegister";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* space for navbar fixed at top */}
      <div className="pt-20 px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trip/new" element={<NewTrip />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/forest" element={<Forest />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LoginRegister />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
