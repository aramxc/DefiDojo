import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
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

const NavigationBar: React.FC = () => (
  <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
                  p-6 shadow-lg border-b border-slate-700/50 backdrop-blur-sm">
    <div className="container mx-auto flex justify-between items-center">
      {/* Logo */}
      <Link 
        to="/" 
        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 
                   text-xl font-bold tracking-tight hover:scale-105 transition-transform duration-200"
      >
        Web3 Academy
      </Link>

      {/* Navigation Links */}
      <div className="flex space-x-8">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">Learning</NavLink>
      </div>
    </div>
  </nav>
);

export default NavigationBar;