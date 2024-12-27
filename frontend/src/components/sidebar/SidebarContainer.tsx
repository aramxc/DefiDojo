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
      
      {/* Sidebar container */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                    border-r border-slate-700/50 shadow-2xl backdrop-blur-md backdrop-saturate-150
                    w-[90%] sm:w-full max-w-[380px] ${isExpanded ? 'translate-x-0' : '-translate-x-full'}
                    transition-transform duration-500`}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[60] p-1.5
                   bg-transparent hover:bg-slate-800/30
                   text-slate-400 hover:text-white
                   rounded-full cursor-pointer
                   transition-all duration-300 ease-in-out
                   hover:scale-110 active:scale-95
                   flex items-center justify-center
                   border border-transparent hover:border-slate-600/50"
        >
          <Close className="w-4 h-4" />
        </button>

        {/* Content wrapper */}
        <div className={`h-full flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                      transition-opacity duration-500`}>
          <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
            {/* Header */}
            <header className="pb-6 border-b border-slate-700/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl" />
              <h2 className="text-2xl font-bold tracking-tight relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r 
                               from-blue-300 via-purple-300 to-indigo-300">
                  Payment Methods
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400 relative">
                Manage your payment options and transactions
              </p>
            </header>

            {/* Payment sections */}
            <div className="-mx-6">
              {paymentSections.map(({ id, title, component, gradientText }) => (
                <div key={id}>
                  <button
                    onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
                    className={`w-full flex items-center justify-between px-6 py-4
                             hover:bg-slate-700/30 transition-all duration-300 group
                             ${expandedSection === id ? 'bg-slate-800/40' : ''}`}
                  >
                    <span className={`font-medium text-transparent bg-clip-text 
                                  bg-gradient-to-r ${gradientText}`}>
                      {title}
                    </span>
                    <ExpandMore 
                      className={`w-5 h-5 text-slate-400 group-hover:text-white
                              transition-transform duration-300 ease-in-out
                              ${expandedSection === id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  <div className={`transition-all duration-500 overflow-hidden px-6
                                ${expandedSection === id ? 'max-h-[1000px] opacity-100 py-6' : 
                                                         'max-h-0 opacity-0'}`}>
                    {component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSidebar;