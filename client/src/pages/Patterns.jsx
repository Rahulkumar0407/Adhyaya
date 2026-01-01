import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, ChevronRight, BookOpen, Target, Trophy } from 'lucide-react';

export default function Patterns() {
    const [patterns, setPatterns] = useState({ foundational: [], intermediate: [], advanced: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchPatterns();
    }, []);

    const fetchPatterns = async () => {
        try {
            const response = await api.get('/patterns');
            setPatterns(response.data.data.grouped);
        } catch (error) {
            console.error('Failed to fetch patterns:', error);
            // Mock data for demo
            setPatterns({
                foundational: [
                    { _id: '1', name: 'Two Pointers (Same Direction)', slug: 'two-pointers-same', subcategory: 'two-pointers', description: 'Use two pointers moving in the same direction to solve array problems efficiently.', totalProblems: 5 },
                    { _id: '2', name: 'Two Pointers (Opposite)', slug: 'two-pointers-opposite', subcategory: 'two-pointers', description: 'Two pointers from opposite ends, converging towards each other.', totalProblems: 6 },
                    { _id: '3', name: 'Sliding Window (Fixed)', slug: 'sliding-window-fixed', subcategory: 'sliding-window', description: 'Fixed-size window sliding across the array.', totalProblems: 4 },
                    { _id: '4', name: 'Sliding Window (Variable)', slug: 'sliding-window-variable', subcategory: 'sliding-window', description: 'Variable-size window that expands and contracts.', totalProblems: 5 },
                    { _id: '5', name: 'Fast & Slow Pointers', slug: 'fast-slow-pointers', subcategory: 'fast-slow', description: 'Two pointers moving at different speeds.', totalProblems: 4 },
                ],
                intermediate: [
                    { _id: '6', name: 'Merge Intervals', slug: 'merge-intervals', subcategory: 'intervals', description: 'Handle overlapping intervals by sorting and merging.', totalProblems: 5 },
                    { _id: '7', name: 'BFS (Level Order)', slug: 'bfs-level-order', subcategory: 'bfs', description: 'Breadth-First Search processes nodes level by level.', totalProblems: 6 },
                    { _id: '8', name: 'DFS (Tree)', slug: 'dfs-tree', subcategory: 'dfs', description: 'Depth-First Search explores as deep as possible.', totalProblems: 8 },
                    { _id: '9', name: 'Two Heaps', slug: 'two-heaps', subcategory: 'heaps', description: 'Use two heaps to track median or partition elements.', totalProblems: 4 },
                ],
                advanced: [
                    { _id: '10', name: 'DP - 0/1 Knapsack', slug: 'dp-01-knapsack', subcategory: 'dp-knapsack', description: 'Choose or skip each item exactly once.', totalProblems: 6 },
                    { _id: '11', name: 'DP - Unbounded Knapsack', slug: 'dp-unbounded-knapsack', subcategory: 'dp-knapsack', description: 'Items can be used unlimited times.', totalProblems: 5 },
                    { _id: '12', name: 'DP - LCS', slug: 'dp-lcs', subcategory: 'dp-string', description: 'Find the longest subsequence common to two sequences.', totalProblems: 5 },
                    { _id: '13', name: 'Backtracking', slug: 'backtracking', subcategory: 'backtracking', description: 'Explore all possibilities with smart pruning.', totalProblems: 7 },
                    { _id: '14', name: 'Topological Sort', slug: 'topological-sort', subcategory: 'graphs', description: 'Order nodes in DAG respecting dependencies.', totalProblems: 4 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const filterPatterns = (patternList) => {
        if (!searchTerm) return patternList;
        return patternList.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const categories = [
        { id: 'all', label: 'All Patterns', icon: BookOpen },
        { id: 'foundational', label: 'Foundational', icon: BookOpen, color: 'cyan' },
        { id: 'intermediate', label: 'Intermediate', icon: Target, color: 'purple' },
        { id: 'advanced', label: 'Advanced', icon: Trophy, color: 'rose' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-babua-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const renderPatternSection = (title, patternList, icon, colorClass) => {
        const filtered = filterPatterns(patternList);
        if (filtered.length === 0) return null;

        return (
            <div className="mb-10">
                <h2 className={`text-xl font-semibold ${colorClass} mb-4 flex items-center gap-2`}>
                    {icon}
                    {title}
                    <span className="text-sm font-normal text-white/50">({filtered.length} patterns)</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((pattern) => (
                        <Link
                            key={pattern._id}
                            to={`/patterns/${pattern.slug}`}
                            className="card card-hover group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`badge badge-${colorClass.replace('text-', '').split('-')[0]}`}>
                                    {pattern.subcategory}
                                </span>
                                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-babua-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-babua-primary transition-colors">
                                {pattern.name}
                            </h3>
                            <p className="text-sm text-white/60 line-clamp-2 mb-4">
                                {pattern.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">{pattern.totalProblems} problems</span>
                                <span className="text-babua-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Start learning →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">DSA Patterns</h1>
                    <p className="text-white/60">
                        Master the patterns, solve any problem. One pattern unlocks hundreds of solutions.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search patterns..."
                            className="input pl-10 w-full"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                                        ? 'bg-babua-primary text-white'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pattern Sections */}
                {(activeCategory === 'all' || activeCategory === 'foundational') &&
                    renderPatternSection(
                        'Foundational Patterns',
                        patterns.foundational,
                        <BookOpen className="w-5 h-5" />,
                        'text-cyan-400'
                    )}

                {(activeCategory === 'all' || activeCategory === 'intermediate') &&
                    renderPatternSection(
                        'Intermediate Patterns',
                        patterns.intermediate,
                        <Target className="w-5 h-5" />,
                        'text-purple-400'
                    )}

                {(activeCategory === 'all' || activeCategory === 'advanced') &&
                    renderPatternSection(
                        'Advanced Patterns',
                        patterns.advanced,
                        <Trophy className="w-5 h-5" />,
                        'text-rose-400'
                    )}
            </div>
        </div>
    );
}
