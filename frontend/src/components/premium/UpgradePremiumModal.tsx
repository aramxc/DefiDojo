import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

const PREMIUM_FEATURES = [
  {
    title: 'Advanced Trading Integration',
    description: 'Direct integration with Coinbase API for seamless trading',
    icon: '📈'
  },
  {
    title: 'Portfolio Tracking',
    description: 'Real-time portfolio tracking with performance analytics',
    icon: '💼'
  },
  {
    title: 'Market Insights',
    description: 'Daily analysis of top movers, losers, and market trends',
    icon: '🔍'
  },
  {
    title: 'Custom Alerts',
    description: 'Set price alerts and receive real-time notifications',
    icon: '🔔'
  },
  {
    title: 'Advanced Analytics',
    description: 'Access to advanced technical indicators and chart patterns',
    icon: '📊'
  },
  {
    title: 'Priority Support',
    description: '24/7 priority support from our expert team',
    icon: '🎯'
  }
];

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, walletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement upgrade logic with smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      toast.success('Upgrade successful!');
      onClose();
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="relative w-full max-w-2xl"
            >
              {/* Modal Content */}
              <div className="relative w-full p-8 bg-gradient-to-b from-slate-800/95 to-slate-900/95 
                            backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50">
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 
                           transition-colors rounded-lg hover:bg-slate-700/50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </motion.button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                               bg-clip-text text-transparent">
                    Upgrade to Premium
                  </h2>
                  <p className="text-slate-400 mt-2">
                    Unlock advanced features and take your trading to the next level
                  </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {PREMIUM_FEATURES.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h3 className="text-slate-200 font-medium">{feature.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Price Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <div className="inline-block">
                    <span className="text-4xl font-bold text-slate-200">$30</span>
                    <span className="text-slate-400 ml-2">USD in ETH</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">One-time payment for lifetime access</p>
                </motion.div>

                {/* Upgrade Button */}
                <motion.button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                           text-white font-medium shadow-lg shadow-cyan-500/20
                           hover:shadow-cyan-500/30 disabled:opacity-50 
                           transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    'Upgrade Now'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;