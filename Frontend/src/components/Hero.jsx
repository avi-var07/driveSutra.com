import React from "react";

// Inline SVG components to replace missing PNGs
const ArrowBtnIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12.293 5.293a1 1 0 011.414 1.414L10.414 10H19a1 1 0 110 2h-8.586l3.293 3.293a1 1 0 11-1.414 1.414l-5-5a1 1 0 010-1.414l5-5z" />
  </svg>
);

const PlayIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M5 3.868v16.264A1 1 0 006.553 21.1L19.553 12.53a1 1 0 000-1.06L6.553 2.9A1 1 0 005 3.868z" />
  </svg>
);

const PauseIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M6 4h4a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zm8 0h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5a1 1 0 011-1z" />
  </svg>
);

function Hero({ setPlayStatus, heroData, heroCount, setHeroCount, playStatus }) {
  return (
    <section className="relative z-10 px-16 pt-[270px]">
      <div className="text-white mb-8">
        <p className="text-[110px] leading-[130px] font-bold font-outfit">{heroData[heroCount].text1}</p>
        <p className="text-2xl mt-2 font-poppins">{heroData[heroCount].text2}</p>
      </div>

      <div className="flex items-center gap-12 bg-white rounded-[60px] px-8 py-4 mt-12 w-fit cursor-pointer hover:shadow-md transition">
        <p className="font-bold text-lg text-[#131313]">Explore the Features</p>
        <ArrowBtnIcon className="w-8 h-8" />
      </div>

      <div className="flex justify-between items-center mt-28">
        <ul className="flex items-center gap-6 list-none">
          {[0, 1, 2].map(idx =>
            <li
              key={idx}
              className={`w-4 h-4 rounded-full cursor-pointer border border-white transition
                ${heroCount === idx ? "bg-orange-600" : "bg-white opacity-80"}`}
              onClick={() => setHeroCount(idx)}
            ></li>
          )}
        </ul>
        <div className="flex items-center gap-6">
          {playStatus ? (
            <PauseIcon className="w-12 h-12 cursor-pointer" onClick={() => setPlayStatus(status => !status)} />
          ) : (
            <PlayIcon className="w-12 h-12 cursor-pointer" onClick={() => setPlayStatus(status => !status)} />
          )}
          <p className="text-white font-bold text-xl font-poppins">See the Video</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
