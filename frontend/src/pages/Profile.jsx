import React from "react";

const LinkedInIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M4.98 3.5A2.5 2.5 0 102 6a2.5 2.5 0 002.98-2.5zM3 8.98h4v12H3v-12zm7.5 0h3.84v1.66h.05c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.21V21h-4v-5.02c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.31-1.94 2.66V21h-4v-12z"/>
  </svg>
);

export default function Profile() {
  return (
    <>
      {/* scoped background + UI styles (no global body changes) */}
      <style>{`
        .profile-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: linear-gradient(to bottom, #0b0b2b, #1b2735 70%, #090a0f); }
        .stars { position: absolute; width: 2px; height: 2px; background: transparent;
          box-shadow:
            2vw 5vh 2px white, 6vw 12vh 1px white, 10vw 8vh 2px white,
            15vw 15vh 1px white, 22vw 22vh 1px white, 28vw 12vh 2px white,
            32vw 32vh 1px white, 38vw 18vh 2px white, 42vw 35vh 1px white;
          animation: twinkle 8s infinite linear;
        }
        .stars::after { content: ""; position: absolute; width: 2px; height: 2px;
          box-shadow: 3vw 18vh 1px white, 8vw 12vh 2px white, 12vw 22vh 1px white, 16vw 18vh 1px white;
          animation: twinkle 6s infinite linear reverse;
        }
        @keyframes twinkle { 0%,100%{opacity:0.95}50%{opacity:0.45} }
        .shooting-star { position:absolute; width:120px; height:2px; background: linear-gradient(90deg, white, transparent); animation: shoot 3s infinite ease-in; opacity:0.95; }
        .shooting-star.s1{ top:12%; left:-10vw; animation-delay:0s; }
        .shooting-star.s2{ top:30%; left:-15vw; animation-delay:0.9s; }
        .shooting-star.s3{ top:50%; left:-20vw; animation-delay:1.8s; }
        @keyframes shoot { 0%{transform:translateX(-10vw) rotate(25deg);opacity:1}100%{transform:translateX(120vw) translateY(40vh) rotate(25deg);opacity:0} }

        .floating { animation: floatSmooth 7s ease-in-out infinite; }
        @keyframes floatSmooth { 0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)} }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }
        .elevated { box-shadow:0 24px 60px rgba(1,6,23,0.7); border-radius:16px; }
        .cta { background: linear-gradient(90deg,#34d399,#60a5fa); color:#000; padding:10px 16px; border-radius:10px; font-weight:700; }
        .muted { color:#bfc7d1; }
        .glass-input { width:100%; padding:12px 14px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#e6eef8; }
      `}</style>

      {/* fixed background layer (stars + shooting) */}
      <div className="profile-bg" aria-hidden>
        <div className="stars" />
        <div className="shooting-star s1" />
        <div className="shooting-star s2" />
        <div className="shooting-star s3" />
      </div>

      {/* MAIN content above background */}
      <main className="w-full min-h-screen relative z-10 flex items-start justify-center px-6 pt-28 pb-24 text-white">
        <div
          className="w-full max-w-6xl p-10 glass rounded-2xl elevated floating grid grid-cols-1 lg:grid-cols-3 gap-10"
          style={{ boxShadow: "0 0 35px rgba(255,255,255,0.25), 0 0 70px rgba(255,255,255,0.15)" }}
        >
          {/* LEFT PROFILE CARD */}
          <section className="flex flex-col items-center gap-5 p-8 rounded-xl glass elevated">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-black font-extrabold text-xl"
              style={{ background:"linear-gradient(135deg,#34d399,#60a5fa)" }}>
              AV
            </div>

            <h2 className="text-2xl font-semibold">Aman Verma</h2>
            <div className="text-sm muted">EcoDrive User • Level: Eco Expert</div>

            <p className="text-sm text-center text-gray-300 mt-2 px-4">
              Driving towards a greener future with smart habits.
            </p>

            <div className="w-full grid grid-cols-3 gap-4 text-center mt-4">
              <div><div className="text-lg font-extrabold">92</div><div className="text-xs muted">Eco Score</div></div>
              <div><div className="text-lg font-extrabold">1.2K</div><div className="text-xs muted">Trips</div></div>
              <div><div className="text-lg font-extrabold">24,560</div><div className="text-xs muted">KM Driven</div></div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-extrabold">1.8T</div>
                <div className="text-xs muted">CO₂ Saved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold">87</div>
                <div className="text-xs muted">Trees Equivalent</div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <a className="cta">Edit Profile</a>
              <button className="px-4 py-2 rounded-lg border border-white/10 text-gray-300">Settings</button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <LinkedInIcon className="hover:text-blue-400" />
              <span className="muted text-sm">website.example</span>
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* DRIVING BEHAVIOR */}
            <div className="p-8 rounded-xl glass elevated">
              <h3 className="font-semibold text-lg">Driving Behavior Insights</h3>
              <p className="text-sm text-gray-300 mt-2">Your eco performance metrics.</p>

              <ul className="mt-4 space-y-2 text-sm muted">
                <li>• Smooth Acceleration: 89%</li>
                <li>• Smooth Braking: 92%</li>
                <li>• Speed Stability: Excellent</li>
                <li>• Idling Time: 4%</li>
                <li>• Aggressive Events: 3 this week</li>
              </ul>

              <button className="cta mt-5">View Full Report</button>
            </div>

            {/* VEHICLE DETAILS */}
            <div className="p-8 rounded-xl glass elevated">
              <h3 className="font-semibold text-lg">Vehicle Details</h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm muted block mb-1">Vehicle Name</label>
                  <input className="glass-input" value="Fortuner " readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Vehicle Type</label>
                  <input className="glass-input" value="Diesel" readOnly />
                </div>

                {/* <div>
                  <label className="text-sm muted block mb-1">Range</label>
                  <input className="glass-input" value="540 km" readOnly />
                </div> */}

                <div>
                  <label className="text-sm muted block mb-1">Efficiency Score</label>
                  <input className="glass-input" value="87%" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Tire Pressure</label>
                  <input className="glass-input" value="Optimal" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Last Service</label>
                  <input className="glass-input" value="12 Oct 2025" readOnly />
                </div>
              </div>
            </div>

            {/* SUSTAINABILITY SUMMARY */}
            <div className="p-8 rounded-xl glass elevated md:col-span-2">
              <h3 className="font-semibold text-lg">Sustainability Summary</h3>
              <p className="text-sm text-gray-300 mt-2">Eco impact metrics.</p>

              <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                <div className="p-5 bg-white/5 rounded-lg">
                  <div className="text-xl font-extrabold">450 kg</div>
                  <div className="text-xs muted">Carbon Saved</div>
                </div>

                <div className="p-5 bg-white/5 rounded-lg">
                  <div className="text-xl font-extrabold">320</div>
                  <div className="text-xs muted">Charging Sessions</div>
                </div>

                <div className="p-5 bg-white/5 rounded-lg">
                  <div className="text-xl font-extrabold">1.2K</div>
                  <div className="text-xs muted">Eco Trip Count</div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </>
  );
}
