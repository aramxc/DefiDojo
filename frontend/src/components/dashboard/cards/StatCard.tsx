import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { formatChange } from '../../../utils/formatters';

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  infoTooltip: string;
  stats: {
    label: string;
    value?: string | number;
    change?: number | null;
    className?: string;
    subLabel?: string;
    timeAgo?: string;
  }[];
  className?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = memo(({ 
  title, 
  icon, 
  infoTooltip, 
  stats, 
  className, 
  isLoading 
}: StatCardProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl p-4 
                    shadow-[0_0_10px_rgba(59,130,246,0.03)]
                    before:absolute before:inset-0 
                    before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-slate-700 rounded" />
          <div className="h-4 bg-slate-700 rounded w-1/3" />
        </div>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl overflow-hidden h-full
                
                group hover:transform hover:scale-[1.02] transition-all duration-200
                before:absolute before:inset-0 
                 before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                 before:backdrop-blur-xl before:transition-opacity
                 after:absolute after:inset-0 
                 after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                 after:opacity-0 hover:after:opacity-100 
                 after:transition-opacity
                 border border-white/[0.05]
                 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] ${className || ''}`}
    >
      <div className="relative z-10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-gray-300 opacity-75 group-hover:opacity-100 transition-opacity">
                {icon}
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-300
                       bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              {title}
            </h3>
          </div>
          {infoTooltip && (
            <Tooltip 
              title={
                <div className="p-2 max-w-xs text-sm">
                  {infoTooltip}
                </div>
              }
              arrow
              placement="top"
            >
              <InfoOutlined className="text-gray-400 hover:text-gray-300 cursor-help w-4 h-4" />
            </Tooltip>
          )}
        </div>
        <div className="space-y-2">
          {stats.map(({ label, value, change, className: statClassName, subLabel, timeAgo }) => (
            <div key={label} className="flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{label}</span>
                {value !== undefined && (
                  <span className={`text-gray-200 font-medium ${statClassName || ''}`}>
                    {value}
                  </span>
                )}
              </div>
              {(subLabel || change !== undefined) && (
                <div className="flex justify-between items-center mt-2">
                  <div className="text-gray-400 text-sm">
                    {subLabel}
                    {timeAgo && (
                      <span className="text-gray-500 ml-1">({timeAgo})</span>
                    )}
                  </div>
                  {typeof change === 'number' && (
                    <span className={`text-sm font-medium ${
                      change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatChange(change)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});