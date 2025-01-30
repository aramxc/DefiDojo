import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';
import ConnectWalletButton from '../auth/ConnectWalletButton';
import CreateUserForm from '../auth/CreateUserForm';
import { truncateAddress } from '../../utils';
import UpgradeModal from '../premium/UpgradePremiumModal';
// Types
interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

interface NavigationBarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

// Shared style constants
const GRADIENT = "from-blue-400 via-cyan-400 to-teal-400";
const TRANSITION = "transition-all duration-200";

// Reusable NavLink with hover effect
const NavLink = ({ to, children }: NavLinkProps) => (
  <Link to={to} className="text-gray-300 hover:text-white relative group py-2">
    {children}
    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${GRADIENT} 
                     group-hover:w-full ${TRANSITION}`} />
  </Link>
);

const NavigationBar = ({ isExpanded, onToggle }: NavigationBarProps) => {
  const { wallet, profile } = useUser();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)]
                    bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
                    shadow-lg border-b border-slate-700/50 backdrop-blur-sm
                    flex items-center">
        <div className="px-6 w-full">
          <div className="px-4 mx-auto flex items-center">
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg
                       hover:bg-slate-700/50"
            >
              <Menu />
            </button>

            <div className="flex-1 flex justify-end items-center">
              <div className="flex items-center space-x-8 mr-8">
                <NavLink to="/news">News</NavLink>
                <NavLink to="/learning">Learning</NavLink>
                <NavLink to="/dashboard">
                  Dashboard
                  <span className="ml-1 text-[10px] font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-1.5 py-0.5 rounded-full">
                    BETA
                  </span>
                </NavLink>
              </div>

              <div className="flex items-center space-x-4">
                {/* Show Sign Up if wallet is connected but no profile exists */}
                {wallet && !profile && (
                  <button
                    onClick={() => setIsSignupOpen(true)}
                    className="relative overflow-hidden rounded-lg font-medium text-sm px-6 py-3
                             text-white transition-all duration-200
                             before:absolute before:inset-0 
                             before:bg-gradient-to-r before:from-fuchsia-500/80 before:via-violet-500/80 before:to-indigo-500/80"
                  >
                    <span className="relative z-10">Sign Up</span>
                  </button>
                )}

                {/* Upgrade Button */}
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setIsUpgradeOpen(true);
                  }}
                  to="/"
                  className="relative overflow-hidden rounded-lg font-medium text-sm px-6 py-3
                           text-white transition-all duration-200
                           before:absolute before:inset-0 
                           before:bg-gradient-to-r before:from-blue-400 before:via-cyan-300 before:to-teal-400
                           before:opacity-70 before:transition-all before:duration-200
                           after:absolute after:inset-0 
                           after:bg-gradient-to-r after:from-blue-400 after:via-cyan-300 after:to-teal-400
                           after:opacity-50
                           shadow-[0_0_12px_rgba(34,211,238,0.25)]
                           hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]
                           active:transform active:scale-95"
                >
                  <span className="relative z-10">Upgrade</span>
                </Link>

                {/* Login/Wallet Connection Button */}
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Form for creating full profile with email/password */}
      <CreateUserForm
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSuccess={() => setIsSignupOpen(false)}
        walletAddress={wallet || undefined}
      />

      {/* Premium upgrade modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        walletAddress={wallet || undefined}
      />
    </>
  );
};

export default NavigationBar;