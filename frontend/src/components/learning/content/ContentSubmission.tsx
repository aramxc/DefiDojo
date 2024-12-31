import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ContentSubmissionForm {
  title: string;
  description: string;
  type: 'article' | 'video' | 'tutorial' | 'whitepaper';
  url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string;
}

export const ContentSubmission: React.FC = () => {
  const [formData, setFormData] = useState<ContentSubmissionForm>({
    title: '',
    description: '',
    type: 'article',
    url: '',
    category: 'blockchain',
    difficulty: 'beginner',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submission logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-white placeholder-gray-400"
            placeholder="Enter content title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-white placeholder-gray-400"
            placeholder="Describe your content"
          />
        </div>

        {/* Type and Category */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                       text-white"
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="tutorial">Tutorial</option>
              <option value="whitepaper">Whitepaper</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                       text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* URL */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Content URL
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-white placeholder-gray-400"
            placeholder="https://"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                     text-white placeholder-gray-400"
            placeholder="web3, blockchain, ethereum"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                   text-white font-medium rounded-lg shadow-lg 
                   hover:from-blue-600 hover:to-purple-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   transform transition-all duration-200"
        >
          Submit Content
        </button>
      </form>
    </motion.div>
  );
};
