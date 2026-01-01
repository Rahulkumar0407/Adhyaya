import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Shuffle, RotateCcw, ChevronDown, ChevronRight,
    ExternalLink, Check, Sparkles, Target, Trophy, Zap, BookOpen,
    Grid3X3, ArrowRight, Activity
} from 'lucide-react';
import { dsaPatterns, calculateProgress, getAllItems } from '../data/dsaPatterns';

export default function DSAPatterns() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPatterns, setExpandedPatterns] = useState({});
    const [completedItems, setCompletedItems] = useState(() => {
        const saved = localStorage.getItem('dsa-completed-items');
        return saved ? JSON.parse(saved) : [];
    });

    // 1. Restore Progress Calculation
    const progress = useMemo(() => calculateProgress(completedItems), [completedItems]);

    // 2. Add Difficulty Stats Calculation
    const difficultyStats = useMemo(() => {
        const allItems = getAllItems();
        let easy = 0, medium = 0, hard = 0;
        allItems.forEach(item => {
            if (completedItems.includes(item.id)) {
                if (item.difficulty === 'easy') easy++;
                else if (item.difficulty === 'medium') medium++;
                else if (item.difficulty === 'hard') hard++;
            }
        });
        return { easy, medium, hard };
    }, [completedItems]);

    // 3. Restore Filter Logic
    const filteredPatterns = useMemo(() => {
        if (!searchTerm) return dsaPatterns;
        return dsaPatterns.map(pattern => ({
            ...pattern,
            items: pattern.items.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pattern.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(pattern => pattern.items.length > 0);
    }, [searchTerm]);

    // 4. Restore Helper Functions
    const togglePattern = (patternId) => {
        setExpandedPatterns(prev => ({
            ...prev,
            [patternId]: !prev[patternId]
        }));
    };

    const toggleItemCompletion = (itemId, e) => {
        e.stopPropagation();
        setCompletedItems(prev => {
            const newCompleted = prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId];
            localStorage.setItem('dsa-completed-items', JSON.stringify(newCompleted));
            return newCompleted;
        });
    };

    const getRandomItem = () => {
        const allItems = getAllItems().filter(item => !completedItems.includes(item.id));
        if (allItems.length === 0) return null;
        return allItems[Math.floor(Math.random() * allItems.length)];
    };

    const handleRandomPattern = () => {
        const randomItem = getRandomItem();
        if (randomItem) {
            window.location.href = `/dsa/${randomItem.patternSlug}/${randomItem.slug}`;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-sans">
            {/* Animated Background - Orange Theme */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-full blur-3xl opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 rounded-full blur-3xl opacity-40" />
            </div>

            {/* Header */}
            <header className="relative bg-transparent border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <img src="/favicon.png" alt="DSA Logo" className="w-10 h-10 object-contain shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105" />
                        <div>
                            <span className="text-white font-medium block leading-tight">DSA Course</span>
                            <p className="text-gray-500 text-xs">Data Structures & Algorithms</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-full">
                            <Activity className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300 text-sm">{progress.solved} Solved</span>
                        </div>
                        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">

                {/* Hero Section */}
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4" />
                        Master Patterns, Crack Interfaces
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tight"
                    >
                        Data Structures <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                            & Algorithms
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        A comprehensive, pattern-based approach to mastering DSA.
                        Don't just solve problems, recognize the underlying patterns.
                    </motion.p>
                </div>

                {/* Stats & Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6"
                >
                    {/* Stat 1 */}
                    <div className="text-center p-6 rounded-2xl bg-[#12121a] border border-gray-800/50 hover:border-orange-500/30 transition-colors">
                        <div className="text-4xl font-bold text-white mb-2">{dsaPatterns.length}</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider font-medium">Patterns</div>
                    </div>
                    {/* Stat 2 */}
                    <div className="text-center p-6 rounded-2xl bg-[#12121a] border border-gray-800/50 hover:border-orange-500/30 transition-colors">
                        <div className="text-4xl font-bold text-white mb-2">{progress.total}</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider font-medium">Total Problems</div>
                    </div>
                    {/* Stat 3 */}
                    <div className="text-center p-6 rounded-2xl bg-[#12121a] border border-gray-800/50 hover:border-orange-500/30 transition-colors">
                        <div className="text-4xl font-bold text-orange-400 mb-2">{progress.percentage}%</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider font-medium">Completed</div>
                    </div>
                    {/* Stat 4 */}
                    <div className="text-center p-6 rounded-2xl bg-[#12121a] border border-gray-800/50 hover:border-orange-500/30 transition-colors">
                        <div className="text-4xl font-bold text-white mb-2">{progress.solved}</div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider font-medium">Solved</div>
                    </div>
                </motion.div>

                {/* Difficulty Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-6 mb-24 max-w-4xl mx-auto"
                >
                    <div className="text-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">{difficultyStats.easy}</div>
                        <div className="text-emerald-500/60 text-xs uppercase tracking-wider font-bold">Easy</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="text-2xl font-bold text-amber-400 mb-1">{difficultyStats.medium}</div>
                        <div className="text-amber-500/60 text-xs uppercase tracking-wider font-bold">Medium</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="text-2xl font-bold text-red-400 mb-1">{difficultyStats.hard}</div>
                        <div className="text-red-500/60 text-xs uppercase tracking-wider font-bold">Hard</div>
                    </div>
                </motion.div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for patterns (e.g., 'Sliding Window') or problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#15151e] border border-gray-800 text-white text-lg rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder-gray-600 shadow-xl"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Patterns Grid */}
                <div className="space-y-8">
                    {filteredPatterns.map((pattern, idx) => {
                        const isExpanded = expandedPatterns[pattern.id];
                        const patternCompleted = pattern.items.filter(item => completedItems.includes(item.id)).length;
                        const patternTotal = pattern.items.length;
                        const completionPercent = patternTotal > 0 ? (patternCompleted / patternTotal) * 100 : 0;
                        const isFullyComplete = patternCompleted === patternTotal && patternTotal > 0;

                        return (
                            <motion.div
                                key={pattern.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-[#12121a] ${isExpanded ? 'border-orange-500/30 shadow-2xl shadow-orange-500/10' : 'border-gray-800 hover:border-gray-700'
                                    }`}
                            >
                                <button
                                    onClick={() => togglePattern(pattern.id)}
                                    className="w-full p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 text-left relative overflow-hidden group"
                                >
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Icon Box */}
                                    <div className={`relative w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-105 ${isFullyComplete ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border border-gray-700 group-hover:border-orange-500/30 group-hover:text-orange-400'
                                        }`}>
                                        {isFullyComplete ? <Check className="w-8 h-8" /> : pattern.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                            {pattern.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{patternTotal} Problems</span>
                                            {pattern.description && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                    <span className="truncate max-w-md">{pattern.description}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex items-center gap-6 relative z-10 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">

                                        {/* Progress Bar & Count */}
                                        <div className="flex flex-col items-end gap-1.5 w-32">
                                            <div className="text-sm font-medium text-gray-300">
                                                {Math.round(completionPercent)}%
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isFullyComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}
                                                    style={{ width: `${completionPercent}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">{patternCompleted} / {patternTotal}</div>
                                        </div>

                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-orange-500/20 text-orange-400 rotate-180' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        >
                                            <div className="border-t border-gray-800/50 bg-[#0c0c12]">
                                                {pattern.items.map((item, itemIdx) => {
                                                    const isCompleted = completedItems.includes(item.id);
                                                    return (
                                                        <Link
                                                            key={item.id}
                                                            to={`/dsa/${pattern.slug}/${item.slug}`}
                                                            className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors border-b border-gray-800/30 last:border-0 group/item"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    onClick={(e) => toggleItemCompletion(item.id, e)}
                                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted
                                                                        ? 'bg-emerald-500 border-emerald-500'
                                                                        : 'border-gray-600 hover:border-orange-500'
                                                                        }`}
                                                                >
                                                                    {isCompleted && <Check className="w-4 h-4 text-white" />}
                                                                </button>
                                                                <div>
                                                                    <div className={`font-medium text-lg mb-1 transition-colors ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200 group-hover/item:text-orange-400'
                                                                        }`}>
                                                                        {item.title}
                                                                    </div>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                                                                        {item.difficulty === 'theory' ? 'Theory' : item.difficulty}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                {item.externalLink && (
                                                                    <a
                                                                        href={item.externalLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                                                        title="Solve on LeetCode"
                                                                    >
                                                                        <ExternalLink className="w-5 h-5" />
                                                                    </a>
                                                                )}
                                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredPatterns.length === 0 && (
                    <div className="text-center py-32 opacity-50">
                        <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400">No patterns found</h3>
                        <p className="text-gray-600 mt-2">Try searching for a different keyword.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
