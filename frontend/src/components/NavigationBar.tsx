import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@mui/icons-material';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}
interface NavigationBarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

// Reusable NavLink component with hover effects
const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-gray-300 hover:text-white relative group py-2"
  >
    <span>{children}</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 
                   group-hover:w-full transition-all duration-300"></span>
  </Link>
);

const NavigationBar: React.FC<NavigationBarProps> = ({ isExpanded, onToggle }) => (
  <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
                  p-6 shadow-lg border-b border-slate-700/50 backdrop-blur-sm">
    <div className="container mx-auto flex items-center">
      {/* Menu Button - Keep absolute positioning */}
      <div className="absolute left-4 flex items-center space-x-4">
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg
                     hover:bg-slate-700/50"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>
        
        {/* Logo/Title - Now positioned next to the menu button */}
        <Link 
          to="/" 
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 
                     text-xl font-bold tracking-tight hover:scale-105 transition-transform duration-200"
        >
          Web3 Academy
        </Link>
      </div>

      {/* Center-aligned navigation links with proper spacing */}
      <div className="flex-1 flex justify-end items-center space-x-8 pl-32"> {/* Added pl-32 to account for the left section */}
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">Learning</NavLink>
      </div>
    </div>
  </nav>
);

export default NavigationBar;