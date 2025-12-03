import React from "react";
import { Routes, Route } from "react-router-dom";

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
  );
}

export default App;
