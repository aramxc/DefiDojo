import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
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
  hoverBg: string;
}

const PaymentsSidebar: React.FC<PaymentsSidebarProps> = ({ 
  account, 
  isExpanded, 
  onClose 
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('ethereum');

  const paymentSections: PaymentSection[] = [
    {
      id: 'ethereum',
      title: 'Ethereum',
      component: <EthereumPaymentsSection 
                  account={account} 
                  isExpanded={expandedSection === 'ethereum'} 
                />,
      gradientText: 'from-purple-300 via-purple-200 to-indigo-300',
      hoverBg: 'hover:bg-slate-700/30'
    },
    {
      id: 'lightning',
      title: 'Lightning',
      component: <LightningPaymentsSection 
                  isExpanded={expandedSection === 'lightning'} 
                />,
      gradientText: 'from-amber-300 via-yellow-200 to-amber-300',
      hoverBg: 'hover:bg-slate-700/30'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50
                    ${isExpanded ? 'w-full sm:w-[340px] md:w-96' : 'w-0'}`}>
      {/* Enhanced overlay with blur */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm sm:hidden" onClick={onClose} />
      )}
      
      <div className={`relative h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                    border-r border-slate-700/50 shadow-2xl overflow-hidden
                    backdrop-blur-md backdrop-saturate-150
                    before:absolute before:inset-0 before:bg-gradient-to-b 
                    before:from-slate-400/10 before:to-transparent before:pointer-events-none
                    w-[90%] sm:w-full max-w-[380px]`}>
        
        {/* Enhanced close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-200 
                   transition-all duration-300 rounded-full hover:bg-slate-700/50
                   hover:shadow-lg hover:shadow-slate-700/20 active:scale-95"
        >
          <Close className="w-5 h-5" />
        </button>

        {/* Enhanced sections container */}
        <div className={`h-full flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                      transition-opacity duration-500`}>
          <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
            {/* Enhanced header */}
            <div className="pb-6 border-b border-slate-700/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl" />
              <h2 className="text-2xl font-bold tracking-tight relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r 
                               from-blue-300 via-purple-300 to-indigo-300
                               animate-gradient">
                  Payment Methods
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400 relative">
                Manage your payment options and transactions
              </p>
            </div>

            {/* Enhanced payment sections */}
            <div className="-mx-6">
              {paymentSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => setExpandedSection(
                      expandedSection === section.id ? '' : section.id
                    )}
                    className={`w-full flex items-center justify-between px-6 py-4
                             ${section.hoverBg} transition-all duration-300 group
                             relative overflow-hidden
                             ${expandedSection === section.id ? 
                               'bg-slate-800/40 shadow-lg shadow-slate-900/50' : ''}`}
                  >
                    {/* Add hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                via-slate-400/5 to-transparent translate-x-[-200%] 
                                group-hover:translate-x-[200%] transition-transform 
                                duration-[400ms] ease-out" />
                    
                    <span className={`font-medium text-transparent bg-clip-text bg-gradient-to-r 
                                  ${section.gradientText} tracking-wide relative`}>
                      {section.title}
                    </span>
                    <span className={`text-sm opacity-60 group-hover:opacity-100 
                                  transition-all duration-300 text-slate-300
                                  group-hover:rotate-180 transform`}>
                      {expandedSection === section.id ? '−' : '+'}
                    </span>
                  </button>
                  
                  <div className={`transition-all duration-500 overflow-hidden px-6
                                ${expandedSection === section.id ? 
                                  'max-h-[1000px] opacity-100 py-6' : 
                                  'max-h-0 opacity-0'}`}>
                    {section.component}
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