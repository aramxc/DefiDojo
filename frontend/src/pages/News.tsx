import { memo } from 'react';
import { motion } from 'framer-motion';
import { NewsFeed } from '../components/news/NewsFeed';
import { Article, TrendingUp, Language } from '@mui/icons-material';
import { useFetchRecentNews } from '../hooks/useFetchRecentNews';
import { Chip } from '@mui/material';

export const News = memo(() => {
    const { news, loading, error } = useFetchRecentNews();

    // Group news by source for the statistics
    const sourceStats = news.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-sm"></div>
                        <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-900/50 backdrop-blur-sm border border-white/[0.05]">
                            <Article className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <span className="relative text-2xl font-bold">
                        <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
                        <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                                    bg-clip-text text-transparent tracking-tight font-extrabold">
                            Crypto Market News
                        </span>
                    </span>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main News Feed */}
                <motion.div 
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <NewsFeed className="h-full" />
                </motion.div>

                {/* News Statistics Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {/* Sources Overview */}
                    <div className="rounded-xl overflow-hidden relative group 
                                before:absolute before:inset-0 
                                before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-900/90 before:to-slate-950/90 
                                before:backdrop-blur-xl before:transition-opacity
                                border border-white/[0.05]
                                p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Language className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-gray-200">News Sources</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(sourceStats).map(([source, count]) => (
                                <Chip
                                    key={source}
                                    label={`${source} (${count})`}
                                    className="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div className="rounded-xl overflow-hidden relative group 
                                before:absolute before:inset-0 
                                before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-900/90 before:to-slate-950/90 
                                before:backdrop-blur-xl before:transition-opacity
                                border border-white/[0.05]
                                p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-gray-200">Trending Topics</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Web3'].map((topic) => (
                                <Chip
                                    key={topic}
                                    label={topic}
                                    className="bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
});

News.displayName = 'News';