import { memo } from 'react';
import { useNews } from '../../hooks/useFetchRecentNews';
import { CircularProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Article, OpenInNew, Schedule, TrendingUp } from '@mui/icons-material';

interface NewsFeedProps {
    symbol: string;
    className?: string;
}

export const NewsFeed = memo(({ symbol, className = '' }: NewsFeedProps) => {
    const { news, loading, error } = useNews(symbol);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`h-full w-full rounded-xl overflow-hidden relative group 
                     before:absolute before:inset-0 
                     before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-900/90 before:to-slate-950/90 
                     before:backdrop-blur-xl before:transition-opacity
                     after:absolute after:inset-0 
                     after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                     after:opacity-0 hover:after:opacity-100 
                     after:transition-opacity
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
                     ${className}`}
        >
            <div className="relative z-10 p-6 h-full flex flex-col">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative transition-all duration-300">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 rounded-full blur-sm group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300"></div>
                            <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-900/50 backdrop-blur-sm border border-white/[0.05]">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <span className="relative text-2xl font-bold">
                            <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
                            <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                                        bg-clip-text text-transparent tracking-tight font-extrabold">
                                {symbol} Market Insights
                            </span>
                        </span>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent"></div>
                </motion.div>

                {/* News Content with Enhanced Scrollbar */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <CircularProgress size={30} className="text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center text-red-400">
                        {error}
                    </div>
                ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[calc(100vh-24rem)]">
                        {news.map((item, index) => (
                            <motion.a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 rounded-lg 
                                         bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50
                                         hover:from-slate-700/50 hover:via-slate-800/30 hover:to-slate-800/50
                                         border border-white/[0.05] hover:border-blue-500/20
                                         transition-all duration-300 ease-out
                                         group/item backdrop-blur-sm
                                         hover:shadow-[0_8px_16px_-8px_rgba(59,130,246,0.3)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { delay: index * 0.1 }
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <Tooltip 
                                        title={item.title}
                                        placement="top"
                                        arrow
                                    >
                                        <h4 className="text-gray-200 font-medium text-sm mb-2 
                                                     group-hover/item:text-blue-400 transition-colors
                                                     line-clamp-2 cursor-pointer">
                                            {item.title}
                                        </h4>
                                    </Tooltip>
                                    <OpenInNew className="w-4 h-4 text-gray-500 
                                                        group-hover/item:text-blue-400 transition-colors 
                                                        flex-shrink-0 mt-1" />
                                </div>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2 
                                            group-hover/item:text-gray-300 transition-colors">
                                    {item.snippet}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2 text-gray-500
                                                   px-2 py-1 rounded-full bg-slate-800/50
                                                   border border-white/[0.05]">
                                        <Schedule className="w-3 h-3" />
                                        {formatDate(item.publishedAt)}
                                    </span>
                                    <span className="text-blue-400/70 font-medium">
                                        {item.source}
                                    </span>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

NewsFeed.displayName = 'NewsFeed';