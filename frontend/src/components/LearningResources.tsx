import React from 'react';

interface ResourceCardProps {
  title: string;
  description: string;
  links: Array<{ url: string; text: string }>;
  accentColor: string;
}

// Reusable resource card component
const ResourceCard: React.FC<ResourceCardProps> = ({ 
  title, 
  description, 
  links, 
  accentColor 
}) => (
  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-xl 
                  shadow-lg transform transition-all duration-300 hover:scale-[1.02] 
                  hover:shadow-2xl border border-slate-600/20 group">
    <h3 className={`text-2xl font-bold text-gray-100 mb-4 
                    group-hover:text-${accentColor}-400 transition-colors`}>
      {title}
    </h3>
    <p className="text-gray-400 mb-6 leading-relaxed">
      {description}
    </p>
    <ul className="space-y-3 text-gray-400">
      {links.map((link, index) => (
        <li key={index} className="flex items-center space-x-2">
          <span className={`text-${accentColor}-400`}>→</span>
          <a href={link.url} 
             target="_blank" 
             rel="noopener noreferrer"
             className={`text-gray-300 hover:text-${accentColor}-400 transition-colors`}>
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// Resource data
const RESOURCES = [
  {
    title: 'Bitcoin (BTC)',
    description: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator.',
    links: [
      { url: 'https://bitcoin.org/en/', text: 'Official Bitcoin Website' },
      { url: 'https://www.investopedia.com/terms/b/bitcoin.asp', text: 'Bitcoin on Investopedia' }
    ],
    accentColor: 'blue'
  },
  {
    title: 'Ethereum (ETH)',
    description: 'Ethereum is a decentralized platform that enables smart contracts and decentralized applications (DApps).',
    links: [
      { url: 'https://ethereum.org/en/', text: 'Official Ethereum Website' },
      { url: 'https://www.investopedia.com/terms/e/ethereum.asp', text: 'Ethereum on Investopedia' }
    ],
    accentColor: 'purple'
  },
  {
    title: 'Solana (SOL)',
    description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps.',
    links: [
      { url: 'https://solana.com/', text: 'Official Solana Website' },
      { url: 'https://www.investopedia.com/solana-sol-5202788', text: 'Solana on Investopedia' }
    ],
    accentColor: 'cyan'
  }
];

const LearningResources: React.FC = () => (
  <div className="min-h-screen py-8">
    <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-8">
      {/* Content wrapper with the same styling as Dashboard */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-2xl 
                    shadow-2xl space-y-10 border border-slate-700/30 
                    relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 
                      rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 
                      rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

        {/* Header */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text 
                       bg-gradient-to-r from-blue-400 to-purple-400 
                       mb-8 text-center tracking-tight">
            Learning Resources
          </h2>
          <p className="text-gray-300 mb-8 text-center text-lg leading-relaxed max-w-2xl mx-auto">
            Explore the top cryptocurrencies and access resources to deepen your understanding.
          </p>
        </div>

        {/* Resource cards */}
        <div className="relative z-10 space-y-8">
          {RESOURCES.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LearningResources;