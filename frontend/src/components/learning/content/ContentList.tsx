import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Content {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tutorial' | 'whitepaper';
  url: string;
  author: {
    address: string;
    username: string;
  };
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  votes: number;
  tags: string[];
}

export const ContentList: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  // Placeholder data for testing
  React.useEffect(() => {
    const mockContent: Content[] = [
      {
        id: '1',
        title: 'Understanding Web3 Fundamentals',
        description: 'A comprehensive guide to understanding the basics of Web3 technology.',
        type: 'article',
        url: 'https://example.com/web3-basics',
        author: {
          address: '0x123...789',
          username: 'web3expert'
        },
        category: 'blockchain',
        difficulty: 'beginner',
        votes: 42,
        tags: ['web3', 'blockchain', 'ethereum']
      },
      // Add more mock content as needed
    ];

    setContent(mockContent);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters - To be implemented */}
      <div className="flex gap-4 pb-4 border-b border-slate-700/50">
        <button className="px-4 py-2 text-sm font-medium rounded-lg
                         bg-blue-500/10 text-blue-400 border border-blue-500/20">
          All Content
        </button>
        {/* Add more filter buttons as needed */}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50
                     hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-gray-400 line-clamp-2">
                  {item.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium
                                 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium
                                 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {item.difficulty}
                  </span>
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium
                                             bg-slate-700/50 text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vote Button */}
              <button
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                           bg-gradient-to-r from-blue-500/10 to-purple-500/10
                           hover:from-blue-500/20 hover:to-purple-500/20
                           border border-slate-700/50 hover:border-slate-600/50
                           transition-all duration-300"
              >
                <span className="text-2xl">⬆️</span>
                <span className="text-sm font-medium text-gray-400">
                  {item.votes}
                </span>
              </button>
            </div>

            {/* Author and Link */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">by</span>
                <span className="text-sm text-gray-300">{item.author.username}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Content →
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
