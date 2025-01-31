import React from 'react';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import { truncateAddress } from '../../utils/formatters';

interface ConnectWalletButtonProps {
  variant?: 'landing' | 'nav';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ variant = 'nav' }) => {
  const { account, connect } = useWalletConnection();

  const buttonStyles = variant === 'landing'
    ? "relative overflow-hidden rounded-lg font-medium text-sm px-6 py-3 text-white transition-all duration-200 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:via-cyan-300 before:to-teal-400 before:opacity-70 before:transition-all before:duration-200 after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-400 after:via-cyan-300 after:to-teal-400 after:opacity-50 shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] active:transform active:scale-95"
    : "h-10 px-4 relative rounded-lg font-medium text-sm text-white transition-all duration-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 flex items-center justify-center gap-2";

  return (
    <button
      onClick={!account ? connect : undefined}
      className={buttonStyles}
    >
      <span className="relative z-10">
        {account ? truncateAddress(account) : 'Connect Wallet'}
      </span>
    </button>
  );
};

export default ConnectWalletButton;