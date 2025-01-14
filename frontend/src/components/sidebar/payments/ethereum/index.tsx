import React, { useState } from 'react';
import { RefreshRounded } from '@mui/icons-material';
import ContractInfo from './ContractInfo';
import ContractActions from './ContractActions';

interface EthereumPaymentsSectionProps {
  account: string;
  isExpanded: boolean;
}

const EthereumPaymentsSection: React.FC<EthereumPaymentsSectionProps> = ({ 
  account,
  isExpanded 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setRefreshTrigger(prev => prev + 1); // Increment to trigger refresh
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Add small delay for better UX
    }
  };

  return (
    <div className={`space-y-6 ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                    transition-opacity duration-300`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Contract Info</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-1.5 rounded-full text-gray-400 hover:text-white
                     hover:bg-white/10 transition-all duration-200
                     ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshRounded className="w-4 h-4" />
        </button>
      </div>
      <ContractInfo 
        account={account} 
        refreshTrigger={refreshTrigger} 
      />
      <ContractActions onSuccess={handleRefresh} />
    </div>
  );
};

export default EthereumPaymentsSection;