import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md py-3 px-6 flex justify-between items-center fixed top-0 left-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-green-600 tracking-wide">
        EcoDrive 🌱
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 font-medium text-gray-700">
        <Link to="/" className="hover:text-green-600">Dashboard</Link>
        <Link to="/trip/new" className="hover:text-green-600">Start Trip</Link>
        <Link to="/trips" className="hover:text-green-600">Trips</Link>
        <Link to="/challenges" className="hover:text-green-600">Challenges</Link>
        <Link to="/achievements" className="hover:text-green-600">Achievements</Link>
        <Link to="/forest" className="hover:text-green-600">Forest</Link>
      </div>

      {/* Profile Avatar */}
      <img
        src="https://i.pravatar.cc/40"
        alt="avatar"
        className="w-10 h-10 rounded-full cursor-pointer border-2 border-green-600"
      />
    </nav>
  );
}
