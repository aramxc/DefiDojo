import React, { useState } from 'react';
import { Close, ExpandMore } from '@mui/icons-material';
import EthereumPaymentsSection from './payments/ethereum';
import LightningPaymentsSection from './payments/lightning';

interface PaymentsSidebarProps {
  account: string;
  isExpanded: boolean;
  onClose: () => void;
}

interface PaymentSection {
  id: string;
  title: string;
  component: React.ReactNode;
  gradientText: string;
}

const PaymentsSidebar: React.FC<PaymentsSidebarProps> = ({ account, isExpanded, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<string>('ethereum');

  // Payment sections configuration
  const paymentSections: PaymentSection[] = [
    {
      id: 'ethereum',
      title: 'Ethereum',
      component: <EthereumPaymentsSection account={account} isExpanded={expandedSection === 'ethereum'} />,
      gradientText: 'from-purple-300 via-purple-200 to-indigo-300'
    },
    {
      id: 'lightning',
      title: 'Lightning',
      component: <LightningPaymentsSection isExpanded={expandedSection === 'lightning'} />,
      gradientText: 'from-amber-300 via-yellow-200 to-amber-300'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50
                    ${isExpanded ? 'w-full sm:w-[340px] md:w-96' : 'w-0'}`}>
      {/* Mobile overlay */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm sm:hidden" 
             onClick={onClose} />
      )}
      
      {/* Sidebar container with premium styling */}
      <div className={`fixed left-0 top-0 h-full 
                    bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90
                    backdrop-blur-xl
                    border-r border-white/[0.05]
                    shadow-[4px_0_24px_-8px_rgba(0,0,0,0.3)]
                    w-[90%] sm:w-full max-w-[380px] ${isExpanded ? 'translate-x-0' : '-translate-x-full'}
                    transition-transform duration-500 flex flex-col
                    after:absolute after:inset-0 
                     
                    after:opacity-0 hover:after:opacity-100 
                    after:transition-opacity`}>
        
        {/* Close button with premium styling */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[60] p-1.5
                   bg-slate-800/50 hover:bg-slate-700/50
                   text-slate-400 hover:text-cyan-300
                   rounded-full cursor-pointer
                   transition-all duration-300 ease-in-out
                   hover:scale-110 active:scale-95
                   flex items-center justify-center
                   border border-white/[0.05] hover:border-cyan-500/20
                   shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]"
        >
          <Close className="w-4 h-4" />
        </button>

        {/* Content wrapper */}
        <div className={`h-full grid grid-rows-[auto_1fr] ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                      transition-opacity duration-500 relative z-10`}>
          {/* Header with premium styling */}
          <header className="p-6 border-b border-white/[0.05] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r 
                             from-blue-400 via-cyan-300 to-teal-400">
                Payment Methods
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-400 relative">
              Manage your payment options and transactions
            </p>
          </header>

          {/* Payment sections with premium styling */}
          <div className="min-h-0 flex flex-col">
            {paymentSections.map(({ id, title, component, gradientText }) => (
              <div key={id} className="flex flex-col min-h-0">
                <button
                  onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
                  className={`w-full flex items-center justify-between px-6 py-4
                           hover:bg-white/[0.02] transition-all duration-300 group
                           ${expandedSection === id ? 'bg-white/[0.03]' : ''}`}
                >
                  <span className={`font-medium text-transparent bg-clip-text 
                                bg-gradient-to-r ${gradientText}`}>
                    {title}
                  </span>
                  <ExpandMore 
                    className={`w-5 h-5 text-slate-400 group-hover:text-cyan-300
                            transition-transform duration-300 ease-in-out
                            ${expandedSection === id ? 'rotate-180' : ''}`}
                  />
                </button>
                
                <div className={`transition-all duration-500 
                              ${expandedSection === id ? 'flex-1' : 'h-0'}
                              overflow-hidden px-6`}>
                  {expandedSection === id && (
                    <div className="py-6">{component}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSidebar;