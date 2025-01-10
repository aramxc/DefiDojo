import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  stats: { 
    label: string;
    value: string;
    change?: number;
  }[];
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-white/5 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 bg-slate-700 rounded w-1/4" />
              <div className="h-3 bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-white/5 hover:bg-slate-800/60 transition-colors duration-200"
    >
      <h3 className="text-sm font-semibold text-gray-400 mb-3">{title}</h3>
      <div className="space-y-2">
        {stats.map(({ label, value, change }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-200 font-medium">{value}</span>
              {change !== undefined && (
                <span className={`text-xs font-medium ${
                  change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};