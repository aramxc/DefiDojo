import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import { truncateAddress } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface ConnectWalletButtonProps {
  variant?: 'nav' | 'landing';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ variant = 'nav' }) => {
  const { wallet, connectWallet, disconnectWallet } = useUser();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const navigate = useNavigate();

  const handleWalletAction = async () => {
    try {
      if (wallet) {
        await disconnectWallet();
        window.location.href = '/';
      } else {
        await connectWallet();
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Wallet action failed:', error);
      toast.error(error.message || 'Wallet connection failed');
    }
  };

  if (variant === 'landing') {
    return (
      <button
        onClick={handleWalletAction}
        className="relative overflow-hidden px-8 py-4 rounded-xl font-semibold text-lg
                   bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400
                   text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]
                   transition-all duration-300 transform hover:scale-[1.02]
                   shadow-[0_0_20px_rgba(34,211,238,0.3)]"
      >
        <span className="relative z-10">
          {wallet ? truncateAddress(wallet) : 'Connect Wallet'}
        </span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-cyan-300/30 to-teal-400/30 
                      blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </button>
    );
  }

  return (
    <button
      onClick={handleWalletAction}
      onMouseEnter={() => setShowDisconnect(true)}
      onMouseLeave={() => setShowDisconnect(false)}
      className="flex items-center justify-center w-[140px] rounded-lg font-medium text-sm px-6 py-3
                 bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50
                 hover:from-slate-700/50 hover:via-slate-800/30 hover:to-slate-800/50
                 border border-white/[0.05] hover:border-blue-500/20
                 text-gray-400 hover:text-blue-400
                 transition-all duration-300 backdrop-blur-sm
                 hover:shadow-[0_8px_16px_-8px_rgba(59,130,246,0.3)]"
    >
      {wallet ? (
        <span className="flex items-center justify-center gap-2 w-full">
          {showDisconnect ? (
            <>
              <span className="text-blue-400">Disconnect</span>
              <span className="text-red-400 text-xl">×</span>
            </>
          ) : (
            truncateAddress(wallet)
          )}
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

export default ConnectWalletButton;