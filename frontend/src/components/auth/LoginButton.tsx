import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { requestAccount } from '../../services/web3/contract.service';

const LoginButton: React.FC = () => {
  const { login } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    emailOrWallet: '',
    password: '',
  });

  const handleWalletLogin = async () => {
    try {
      const account = await requestAccount();
      if (account) {
        await login(account);
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.emailOrWallet, formData.password);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-gray-300 hover:text-white transition-colors"
      >
        Login
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

            <button
              onClick={handleWalletLogin}
              className="w-full mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 
                       text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              Connect Wallet to Login
            </button>

            <div className="relative my-6">
              <hr className="border-gray-600" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                             bg-slate-800 px-4 text-gray-400">
                or
              </span>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Email"
                value={formData.emailOrWallet}
                onChange={(e) => setFormData(prev => ({ ...prev, emailOrWallet: e.target.value }))}
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
              />
              <button
                type="submit"
                className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white font-medium"
              >
                Login with Email
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default LoginButton;