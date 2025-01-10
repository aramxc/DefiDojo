import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../components/dashboard/StatCard';
import { 
  TrendingUp, TrendingDown, Assessment,
  ShowChart, Notifications, Speed
} from '@mui/icons-material';
import {
  Card, CardContent, LinearProgress, Chip,
  Alert, AlertTitle
} from '@mui/material';

interface AdvancedDashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
}) => {
  return (
    <div className="min-h-[100dvh] pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-[calc(100dvh-var(--navbar-height))] flex flex-col px-4 py-2 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 w-full max-w-[1920px] mx-auto rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
                     after:absolute after:inset-0 
                     after:bg-[radial-gradient(circle_at_50%_-20%,rgba(129,140,248,0.05),transparent_70%)]
                     after:z-[-1]
                     relative"
        >
          {/* Command Center Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Market Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Market Overview"
                  stats={[
                    { label: "Total Market Cap", value: "$2.1T", change: 5.2 },
                    { label: "24h Volume", value: "$86.2B", change: -2.8 },
                    { label: "BTC Dominance", value: "42%", change: 0.5 }
                  ]}
                />
              </motion.div>

              {/* Trading Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border border-white/5 backdrop-blur-xl">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-200 font-semibold">Trading Activity</h3>
                      <Speed className="text-blue-400" />
                    </div>
                    <div className="space-y-4">
                      {['BTC', 'ETH', 'SOL'].map((token) => (
                        <div key={token} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{token}/USD</span>
                            <span className="text-gray-200">78% Buy</span>
                          </div>
                          <LinearProgress 
                            variant="determinate" 
                            value={78} 
                            className="h-1.5 rounded-full bg-slate-700"
                            sx={{
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Alert Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border border-white/5 backdrop-blur-xl">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-200 font-semibold">Active Alerts</h3>
                      <Notifications className="text-blue-400" />
                    </div>
                    <div className="space-y-3">
                      <Alert 
                        severity="warning"
                        className="bg-amber-400/10 border border-amber-400/20"
                      >
                        <AlertTitle>BTC Volatility Alert</AlertTitle>
                        Unusual volume detected in the last hour
                      </Alert>
                      <Alert 
                        severity="info"
                        className="bg-blue-400/10 border border-blue-400/20"
                      >
                        <AlertTitle>ETH Price Target</AlertTitle>
                        Approaching resistance at $2,800
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Add more grid items as needed */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;