// frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Route, 
  Trophy, 
  Trees, 
  Target, 
  User, 
  History 
} from 'lucide-react';

const menuItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/trip/new", icon: Route, label: "New Trip" },
  { to: "/trips", icon: History, label: "Trip History" },
  { to: "/challenges", icon: Target, label: "Challenges" },
  { to: "/achievements", icon: Trophy, label: "Achievements" },
  { to: "/forest", icon: Trees, label: "My Forest" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-16 bottom-0 overflow-y-auto hidden md:block">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;