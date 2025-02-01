import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { purchaseProAccess, checkProAccess } from '../../services/web3/contract.service';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

interface PurchaseDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  onSuccess: (timeframe: '5Y' | 'Custom') => void;
  timeframe: '5Y' | 'Custom';
}

export const PurchaseDataModal = ({ isOpen, onClose, symbol, onSuccess, timeframe }: PurchaseDataModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (isProcessing) return; // Prevent double submissions
    
    try {
      setIsProcessing(true);
      await purchaseProAccess(symbol);
      
      // Short delay to ensure blockchain state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify access one final time before closing modal
      const hasAccess = await checkProAccess(symbol);
      if (hasAccess) {
        onSuccess(timeframe);
      } else {
        toast.error('Unable to verify access. Please try again or refresh the page.');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 shadow-xl"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Unlock Premium {symbol} Data
          </h3>
          
          <p className="text-gray-300 mb-6">
            Get access to advanced analytics including:
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-gray-300">
              <span className="mr-2">•</span>
              5 Year Historical Data
            </li>
            <li className="flex items-center text-gray-300">
              <span className="mr-2">•</span>
              Advanced Technical Indicators
            </li>
            <li className="flex items-center text-gray-300">
              <span className="mr-2">•</span>
              Real-time Market Insights
            </li>
          </ul>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="relative overflow-hidden rounded-lg font-medium px-6 py-2
                       text-white transition-all duration-200
                       before:absolute before:inset-0 
                       before:bg-gradient-to-r before:from-fuchsia-500/90 before:via-pink-500/90 before:to-fuchsia-400/90
                       before:transition-all before:duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]"
            >
              <span className="relative z-10 flex items-center">
                {isProcessing ? (
                  <>
                    <CircularProgress size={16} className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Purchase Access'
                )}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};