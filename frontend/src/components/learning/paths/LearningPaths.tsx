import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  modules: {
    title: string;
    description: string;
    completed?: boolean;
  }[];
  progress: number;
  category: string;
}

export const LearningPaths: React.FC = () => {
  const [paths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Web3 Development Fundamentals',
      description: 'Master the basics of Web3 development, from blockchain concepts to smart contract deployment.',
      difficulty: 'beginner',
      estimatedHours: 20,
      category: 'development',
      progress: 0,
      modules: [
        {
          title: 'Blockchain Basics',
          description: 'Understanding blockchain technology and its core concepts',
          completed: false
        },
        {
          title: 'Smart Contract Development',
          description: 'Learn to write and deploy smart contracts using Solidity',
          completed: false
        },
        {
          title: 'Web3.js Integration',
          description: 'Connecting frontend applications to the blockchain',
          completed: false
        }
      ]
    },
    // Add more paths as needed
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'from-blue-500/10 to-cyan-500/10 text-blue-400 border-blue-500/20';
      case 'advanced': return 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20';
      default: return 'from-gray-500/10 to-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text 
                     bg-gradient-to-r from-blue-400 to-purple-400">
          Learning Paths
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Structured learning paths to help you master Web3 development at your own pace
        </p>
      </div>

      {/* Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {paths.map((path) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
          >
            {/* Path Header */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {path.title}
                  </h3>
                  <p className="text-gray-400">
                    {path.description}
                  </p>
                </div>
              </div>

              {/* Path Metadata */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                               bg-gradient-to-r ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium
                               bg-gradient-to-r from-slate-700/50 to-slate-700/30
                               text-gray-400 border border-slate-700/50">
                  {path.estimatedHours} hours
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-400">{path.progress}%</span>
                </div>
                <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500
                             transition-all duration-300 ease-out"
                    style={{ width: `${path.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="border-t border-slate-700/50">
              {path.modules.map((module, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/20
                           transition-colors duration-200"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                ${module.completed
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-slate-600 bg-slate-800/50'
                                }`}
                  >
                    {module.completed && (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {module.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start/Continue Button */}
            <div className="p-4 border-t border-slate-700/50">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500
                               text-white text-sm font-medium rounded-lg
                               hover:from-blue-600 hover:to-purple-600
                               transform hover:-translate-y-0.5 transition-all duration-200">
                {path.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
