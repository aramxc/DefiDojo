import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { requestAccount } from '../../services/web3/contract.service';
import { UserService } from '../../services/api/user.service';
import { useUser } from '../../contexts/UserContext';
import type { UserProfile } from '@defidojo/shared-types';

interface CreateUserFormProps {
  onSuccess: () => void;
  walletAddress?: string;
  onClose: () => void;
  isOpen: boolean;
}

const userService = new UserService();

const CreateUserForm: React.FC<CreateUserFormProps> = ({ 
  onSuccess, 
  walletAddress, 
  onClose, 
  isOpen 
}) => {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    walletAddress: walletAddress || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkUsernameTimeout, setCheckUsernameTimeout] = useState<NodeJS.Timeout | null>(null);

  // Username availability check with timeout-based debounce
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    try {
      const isAvailable = await userService.checkUsernameAvailability(username);
      setUsernameError(isAvailable ? null : 'Username is already taken');
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
    }
  };

  // Handle username changes with debounce
  const handleUsernameChange = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    
    // Clear any existing timeout
    if (checkUsernameTimeout) {
      clearTimeout(checkUsernameTimeout);
    }

    // Set new timeout for username check
    const timeoutId = setTimeout(() => {
      checkUsername(username);
    }, 500);

    setCheckUsernameTimeout(timeoutId);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (checkUsernameTimeout) {
        clearTimeout(checkUsernameTimeout);
      }
    };
  }, [checkUsernameTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (usernameError) {
      toast.error('Please fix username errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const response = await userService.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        walletAddress: formData.walletAddress || null,
      });

      // Set the complete user profile in context
      if (response && response.user) {
        const userProfile: UserProfile = {
          ...response.user,
          wallet_address: formData.walletAddress || null,
          user_id: crypto.randomUUID(), // Generate temporary ID
          is_email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: null,
          subscriptions: [],
          preferences: {}
        };
        
        setUser(userProfile);
        toast.success('Profile created successfully!');
        onSuccess();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const account = await requestAccount();
      setFormData(prev => ({ ...prev, walletAddress: account }));
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  // Close modal if Escape key is pressed
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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

          {/* Center container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                bounce: 0.3,
                duration: 0.6 
              }}
              className="relative w-full max-w-md"
            >
              <div className="relative w-full p-8 bg-gradient-to-b from-slate-800/95 to-slate-900/95 
                            backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50">
                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 
                           transition-colors rounded-lg hover:bg-slate-700/50"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </motion.button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 
                               bg-clip-text text-transparent">
                    Create Your Profile
                  </h2>
                  <p className="text-slate-400 mt-2">Join the Dojo today 🥷</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`w-full p-3 rounded-lg bg-slate-800/50 border 
                               text-slate-200 placeholder-slate-400
                               focus:ring-2 transition-all duration-200
                               ${usernameError 
                                 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                 : 'border-slate-600 focus:border-purple-500 focus:ring-purple-500/20'
                               }`}
                      placeholder="Choose a username"
                      required
                    />
                    {usernameError && (
                      <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                    )}
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-600 
                               text-slate-200 placeholder-slate-400
                               focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                               transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-600 
                               text-slate-200 placeholder-slate-400
                               focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                               transition-all duration-200"
                      placeholder="Create a password"
                      required
                    />
                  </motion.div>

                  {/* Wallet Connection */}
                  {!formData.walletAddress && (
                    <motion.button
                      type="button"
                      onClick={handleConnectWallet}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      // transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 
                               text-blue-400 hover:bg-blue-500/20 
                               transition-all duration-200"
                    >
                      Connect Wallet (Optional)
                    </motion.button>
                  )}

                  {formData.walletAddress && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      // transition={{ delay: 0.5 }}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-600"
                    >
                      <p className="text-sm text-slate-300">Connected Wallet</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{formData.walletAddress}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    // initial={{ opacity: 0 }}
                    // animate={{ opacity: 1 }}
                    // transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 
                             text-white font-medium shadow-lg shadow-purple-500/20
                             hover:shadow-purple-500/30 disabled:opacity-50 
                             transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Profile...
                      </span>
                    ) : (
                      'Create Profile'
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateUserForm;