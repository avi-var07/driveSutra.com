import React from "react";

function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center py-6 px-16 text-white relative z-10">
      <div className="text-3xl font-extrabold font-outfit tracking-wide">G R E E N C H Λ L Λ O</div>
      <ul className="flex space-x-16 text-lg items-center font-medium">
        <li>Home</li>
        <li>Explore</li>
        <li>About</li>
        <li>
          <button className="bg-white text-[#3a3a3a] rounded-full px-6 py-2 font-bold ml-2 shadow-sm hover:bg-gray-100 transition">Contact</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
