import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    // make navbar sticky at top with translucent backdrop and higher z-index
    <nav className="sticky top-0 left-0 z-50 w-full flex justify-between items-center py-4 px-16 text-white bg-black/40 backdrop-blur-sm transition-shadow">
      <style>{`
        .button {
          cursor: pointer;
          padding: 1em;
          font-size: 1em;
          width: 7em;
          aspect-ratio: 1/0.25;
          color: white;
          background: #212121;
          background-size: cover;
          background-blend-mode: overlay;
          border-radius: 0.5em;
          outline: 0.1em solid #353535;
          border: 0;
          box-shadow: 0 0 1em 1em rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-in-out;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 1em 0.45em rgba(0, 0, 0, 0.12);
          background: radial-gradient(circle at bottom, rgba(50,100,180,0.35) 10%, #212121 70%);
          outline: 0;
        }
        .icon {
          fill: white;
          width: 1em;
          aspect-ratio: 1;
          margin-right: 0.5em;
          opacity: 0.95;
        }
      `}</style>

      <div className="text-3xl font-extrabold font-outfit tracking-wide">G R E E N C H Λ L Λ O</div>

      <ul className="flex space-x-6 text-lg items-center font-medium">
        <li>
          <Link to="/" className="button" aria-label="Home">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z" /></svg>
            Home
          </Link>
        </li>

        <li>
          <Link to="/explore" className="button" aria-label="Explore">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></svg>
            Explore
          </Link>
        </li>

        <li>
          <Link to="/features" className="button" aria-label="Features">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden><path d="M4 7h16v2H4zM4 11h10v2H4zM4 15h16v2H4z" /></svg>
            Features
          </Link>
        </li>

        <li>
          <Link to="/about" className="button" aria-label="About">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            About
          </Link>
        </li>

        <li>
          <Link to="/profile" className="button" aria-label="Profile">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" /></svg>
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

