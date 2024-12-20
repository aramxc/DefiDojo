import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Wallet, Close } from '@mui/icons-material';
import ContractInfo from './ContractInfo';
import ContractActions from './ContractActions';

interface ContractSidebarProps {
  account: string;
  isExpanded: boolean;
  onClose: () => void;
}

const ContractSidebar: React.FC<ContractSidebarProps> = ({ 
  account, 
  isExpanded, 
  onClose 
}) => {
  return (
    <div className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50
                    ${isExpanded ? 'w-96' : 'w-0'}`}>
      <div className="relative h-full bg-gradient-to-b from-slate-900 to-slate-800 
                    border-r border-slate-700/50 shadow-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-200 
                     transition-colors rounded-lg hover:bg-slate-700/50"
        >
          <Close />
        </button>

        {/* Sidebar Content */}
        <div className={`h-full flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                      transition-opacity duration-300
                      ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Top Section */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
              <Wallet className="text-purple-400" />
              <h2 className="text-xl font-bold text-gray-100">
                Wallet & Contract Info
              </h2>
            </div>

            {/* Contract Info */}
            <div className="space-y-6">
              <ContractInfo account={account} />
            </div>
          </div>

          {/* Bottom Section - Contract Actions */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
            <ContractActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSidebar;