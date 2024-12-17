import React from 'react';

const AboutSection = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-2xl shadow-2xl 
                    max-w-4xl mx-auto space-y-10 border border-slate-700/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 
                     mb-8 text-center tracking-tight">
        Cryptocurrency Information
      </h2>
      <p className="text-gray-300 mb-8 text-center text-lg leading-relaxed max-w-2xl mx-auto">
        Explore the top cryptocurrencies and access resources to deepen your understanding.
      </p>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-xl shadow-lg
                      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl 
                      border border-slate-600/20 group">
          <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-blue-400 transition-colors">
            Bitcoin (BTC)
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Bitcoin is a decentralized digital currency, without a central bank or single administrator.
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center space-x-2">
              <span className="text-blue-400">→</span>
              <a href="https://bitcoin.org/en/" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-blue-400 transition-colors">
                Official Bitcoin Website
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-400">→</span>
              <a href="https://www.investopedia.com/terms/b/bitcoin.asp" target="_blank" rel="noopener noreferrer"
                 className="text-gray-300 hover:text-blue-400 transition-colors">
                Bitcoin on Investopedia
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-xl shadow-lg
                      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                      border border-slate-600/20 group">
          <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-purple-400 transition-colors">
            Ethereum (ETH)
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Ethereum is a decentralized platform that enables smart contracts and decentralized applications (DApps).
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">→</span>
              <a href="https://ethereum.org/en/" target="_blank" rel="noopener noreferrer"
                 className="text-gray-300 hover:text-purple-400 transition-colors">
                Official Ethereum Website
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-purple-400">→</span>
              <a href="https://www.investopedia.com/terms/e/ethereum.asp" target="_blank" rel="noopener noreferrer"
                 className="text-gray-300 hover:text-purple-400 transition-colors">
                Ethereum on Investopedia
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-xl shadow-lg
                      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                      border border-slate-600/20 group">
          <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-cyan-400 transition-colors">
            Solana (SOL)
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Solana is a high-performance blockchain supporting builders around the world creating crypto apps.
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center space-x-2">
              <span className="text-cyan-400">→</span>
              <a href="https://solana.com/" target="_blank" rel="noopener noreferrer"
                 className="text-gray-300 hover:text-cyan-400 transition-colors">
                Official Solana Website
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-cyan-400">→</span>
              <a href="https://www.investopedia.com/solana-sol-5202788" target="_blank" rel="noopener noreferrer"
                 className="text-gray-300 hover:text-cyan-400 transition-colors">
                Solana on Investopedia
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;