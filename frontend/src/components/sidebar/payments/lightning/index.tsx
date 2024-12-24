import React from 'react';

interface LightningPaymentsSectionProps {
  isExpanded: boolean;
}

const LightningPaymentsSection: React.FC<LightningPaymentsSectionProps> = ({ 
  isExpanded 
}) => {
  return (
    <div className={`space-y-6 ${isExpanded ? 'opacity-100' : 'opacity-0'} 
                    transition-opacity duration-300`}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-100 mb-3">Lightning Payments</h3>
        <p className="text-gray-400">Coming soon...</p>
      </div>
    </div>
  );
};

export default LightningPaymentsSection;