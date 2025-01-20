import React from 'react';
import { Gauge } from '@mui/x-charts';
import { motion } from 'framer-motion';
import { Info } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { FearGreed } from '@defidojo/shared-types';

interface FearGreedGaugeProps {
  data?: FearGreed | null;
  isLoading?: boolean;
}

export const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({ data, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full rounded-xl overflow-hidden relative group
                 before:absolute before:inset-0 
                 before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                 before:backdrop-blur-xl before:transition-opacity
                 after:absolute after:inset-0 
                 after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                 after:opacity-0 hover:after:opacity-100 
                 after:transition-opacity
                 border border-white/[0.05]
                 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
    >
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-100">
              Fear & Greed Index
            </h3>
            <Tooltip
              title={
                <div className="p-2 text-sm">
                  The Fear & Greed Index analyzes market sentiment using:
                  <br /><br />
                  • Volatility (25%)
                  <br />
                  • Market Momentum (25%)
                  <br />
                  • Social Media Sentiment (15%)
                  <br />
                  • Market Dominance (10%)
                  <br />
                  • Trading Volume (25%)
                  <br /><br />
                  0 = Extreme Fear, 100 = Extreme Greed
                </div>
              }
              arrow
              placement="top"
            >
              <Info className="text-gray-400 hover:text-gray-300 cursor-help w-5 h-5" />
            </Tooltip>
          </div>
        </div>

        {/* Gauge */}
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <Gauge
              value={data?.value ?? 50}
              aria-label="Fear and Greed Index"
              sx={{
                width: '50%',
                height: '50%',
                minHeight: '100px',
                '& .MuiChartsGauge-mark': { stroke: '#475569' },
                '& .MuiChartsGauge-markLabel': { fill: '#94a3b8' },
                '& .MuiChartsGauge-valueText': {
                  fill: '#e2e8f0',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                },
                '& .MuiChartsGauge-track': { stroke: '#334155' },
                '& .MuiChartsGauge-progress': {
                  stroke: (data?.value ?? 50) >= 50 ? '#22c55e' : '#ef4444',
                }
              }}
            />
          )}
        </div>

        {/* Last Updated */}
        {data?.timestamp && (
          <div className="mt-4 text-sm text-gray-400">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
};