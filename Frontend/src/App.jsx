import React, { useState, useEffect } from "react";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

// Replace with your actual asset file names
import bgVideo from "./assets/video1.mp4";
import bg1 from "./assets/image1.png";
import bg2 from "./assets/image2.png";
import bg3 from "./assets/image3.png";

const heroData = [
  { text1: "Power Your Journey", text2: "With Smarter, Greener Choices" },
  { text1: "Your Drive Matters", text2: "Every Kilometer Saves Carbon" },
  { text1: "Lead the Change", text2: "Be the Eco Hero of Your City" },
];


function App() {
  // start from 0 and derive max index from heroData length
  const [heroCount, setHeroCount] = useState(0);

  const [playStatus, setPlayStatus] = useState(false);

  // Auto-cycle backgrounds every 3 seconds
  useEffect(() => {
    if (!playStatus) {
      const len = heroData.length;
      const interval = setInterval(() => {
        setHeroCount(prev => (prev >= len - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [playStatus, heroData.length]);

  return (
    <div className="w-full min-h-screen relative font-sans bg-black overflow-hidden">
      <Background
        playStatus={playStatus}
        heroCount={heroCount}
        bgVideo={bgVideo}
        bgImages={[bg1, bg2, bg3]}
      />
      <Navbar />
      <Hero
        setPlayStatus={setPlayStatus}
        heroData={heroData}
        heroCount={heroCount}
        setHeroCount={setHeroCount}
        playStatus={playStatus}
      />
    </div>
  );
}

export default App;
