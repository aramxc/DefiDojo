import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@mui/icons-material';
import CreateUserForm from './CreateUserForm';

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

const NavigationBar: React.FC<NavigationBarProps> = ({ isExpanded, onToggle }) => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleSignupSuccess = () => {
    setIsSignupOpen(false);
    // Add any additional success handling (like showing a welcome message)
    // Could also redirect to dashboard or show onboarding
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
                    p-6 shadow-lg border-b border-slate-700/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center">
          {/* Menu Button */}
          <div className="absolute left-4 flex items-center space-x-4">
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg
                         hover:bg-slate-700/50"
              aria-label="Toggle sidebar"
            >
              <Menu />
            </button>
          </div>

          {/* Center-aligned navigation links */}
          <div className="flex-1 flex justify-end items-center space-x-8 pl-32">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/learning">Learning</NavLink>
          </div>

          {/* Action buttons with consistent spacing */}
          <div className="flex items-center ml-16 space-x-4">
            <button
              onClick={() => setIsSignupOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                       py-2 px-4 rounded hover:opacity-90 transition-all duration-300 
                       hover:shadow-lg hover:shadow-purple-500/20"
            >
              Sign Up
            </button>
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white 
                       py-2 px-4 rounded hover:opacity-90 transition-all duration-300 
                       hover:shadow-lg hover:shadow-blue-500/20"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </nav>

      {/* Signup Modal */}
      <CreateUserForm
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={handleSignupSuccess}
        walletAddress={undefined} // Add wallet address if available
      />
    </>
  );
};

export default NavigationBar;