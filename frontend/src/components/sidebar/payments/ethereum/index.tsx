import React from 'react';
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
  return (
    <div className={`space-y-6 ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                    transition-opacity duration-300`}>
      <ContractInfo account={account} />
      <ContractActions />
    </div>
  );
};

export default EthereumPaymentsSection;