import React from 'react';
import { motion } from 'framer-motion';
import ConnectWalletButton from '../components/auth/ConnectWalletButton';
import { useWalletConnection } from '../hooks/useWalletConnection';

const AuthLandingPage = () => {
  const { connectWallet } = useWalletConnection();
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-cyan-300/10 to-teal-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]" />
      </motion.div>

      {/* Animated Floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/5 via-cyan-300/5 to-teal-400/5 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight 
          }}
          animate={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}

      {/* Welcome content */}
      <motion.div
        className="relative z-10 text-center space-y-8 max-w-2xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
            Welcome to the Dojo! 
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Connect your wallet to access real-time analytics and start learning about the future of finance.
        </p>

        <ConnectWalletButton variant="landing" />
      </motion.div>
    </div>
  );
};

export default AuthLandingPage;