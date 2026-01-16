import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    BookOpen,
    UserCog,
    MessageSquare,
    Zap,
    ArrowRight,
    Command,
    Hash
} from 'lucide-react';
import { globalSearch } from '../../services/adminService';

const quickActions = [
    { id: 'users', label: 'Search Users', icon: User, path: '/admin/users', shortcut: 'U' },
    { id: 'courses', label: 'Manage Courses', icon: BookOpen, path: '/admin/courses', shortcut: 'C' },
    { id: 'mentors', label: 'View Mentors', icon: UserCog, path: '/admin/mentors', shortcut: 'M' },
    { id: 'community', label: 'Community', icon: MessageSquare, path: '/admin/community', shortcut: 'O' },
    { id: 'live', label: 'Live Operations', icon: Zap, path: '/admin/live', shortcut: 'L' },
];

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], courses: [], mentors: [] });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Calculate total items for navigation
    const allItems = [
        ...quickActions.map((a) => ({ ...a, type: 'action' })),
        ...results.users.map((u) => ({ ...u, type: 'user', label: u.name, path: `/admin/users?id=${u._id}` })),
        ...results.mentors.map((m) => ({ ...m, type: 'mentor', label: m.headline, path: `/admin/mentors?id=${m._id}` })),
    ];

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults({ users: [], courses: [], mentors: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await globalSearch(query);
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % allItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
            } else if (e.key === 'Enter' && allItems[selectedIndex]) {
                e.preventDefault();
                navigate(allItems[selectedIndex].path);
                onClose();
            } else if (e.key === 'Escape') {
                onClose();
            }
        },
        [allItems, selectedIndex, navigate, onClose]
    );

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!isOpen) {
                    // This should be handled by parent
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setResults({ users: [], courses: [], mentors: [] });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.03) 0%, rgba(0, 0, 0, 0.8) 100%)',
                        backdropFilter: 'blur(8px)',
                    }}
                />

                {/* Command Palette Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={handleKeyDown}
                    className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
                    style={{
                        background: 'rgba(15, 15, 25, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        boxShadow: `
              0 0 0 1px rgba(0, 240, 255, 0.1),
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 100px rgba(0, 240, 255, 0.1)
            `,
                    }}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-cyan-500/10">
                        <Search className="w-5 h-5 text-cyan-400" />
                        <input
                            type="text"
                            placeholder="Search users, courses, or type a command..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                            className="flex-1 bg-transparent text-white text-lg placeholder:text-gray-500 outline-none"
                        />
                        {isLoading && (
                            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                        )}
                        <kbd className="px-2 py-1 text-xs bg-gray-800/50 rounded border border-gray-700 text-gray-500">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto py-2">
                        {/* Quick Actions */}
                        {!query && (
                            <div className="px-4 py-2">
                                <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quick Actions
                                </p>
                                <div className="mt-2 space-y-1">
                                    {quickActions.map((action, index) => {
                                        const Icon = action.icon;
                                        const isSelected = selectedIndex === index;

                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => {
                                                    navigate(action.path);
                                                    onClose();
                                                }}
                                                className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-150 group
                          ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}
                        `}
                                                style={{
                                                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                                                }}
                                            >
                                                <div
                                                    className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20' : 'bg-gray-800/50'
                                                        }`}
                                                >
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                                                </div>
                                                <span className={`flex-1 text-left ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                    {action.label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-800/50 rounded border border-gray-700 text-gray-500">
                                                        {action.shortcut}
                                                    </kbd>
                                                    <ArrowRight
                                                        className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0' : 'text-gray-600 -translate-x-2 opacity-0'
                                                            }`}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Search Results - Users */}
                        {query && results.users.length > 0 && (
                            <div className="px-4 py-2">
                                <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Users
                                </p>
                                <div className="mt-2 space-y-1">
                                    {results.users.map((user, index) => {
                                        const adjustedIndex = quickActions.length + index;
                                        const isSelected = selectedIndex === adjustedIndex;

                                        return (
                                            <button
                                                key={user._id}
                                                onClick={() => {
                                                    navigate(`/admin/users?id=${user._id}`);
                                                    onClose();
                                                }}
                                                className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-150
                          ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}
                        `}
                                                style={{
                                                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                                                }}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className={isSelected ? 'text-white' : 'text-gray-300'}>{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : user.role === 'mentor'
                                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Search Results - Mentors */}
                        {query && results.mentors.length > 0 && (
                            <div className="px-4 py-2">
                                <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <UserCog className="w-3 h-3" />
                                    Mentors
                                </p>
                                <div className="mt-2 space-y-1">
                                    {results.mentors.map((mentor, index) => {
                                        const adjustedIndex = quickActions.length + results.users.length + index;
                                        const isSelected = selectedIndex === adjustedIndex;

                                        return (
                                            <button
                                                key={mentor._id}
                                                onClick={() => {
                                                    navigate(`/admin/mentors?id=${mentor._id}`);
                                                    onClose();
                                                }}
                                                className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-150
                          ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}
                        `}
                                                style={{
                                                    border: isSelected ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                                                }}
                                            >
                                                <div
                                                    className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20' : 'bg-gray-800/50'}`}
                                                >
                                                    <UserCog className="w-4 h-4 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className={isSelected ? 'text-white' : 'text-gray-300'}>{mentor.headline}</p>
                                                    <p className="text-xs text-gray-500">₹{mentor.ratePerMinute}/min</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2 h-2 rounded-full ${mentor.isOnline ? 'bg-green-500' : 'bg-gray-500'
                                                            }`}
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        {mentor.isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {query && !isLoading && results.users.length === 0 && results.mentors.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <Hash className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400">No results found for "{query}"</p>
                                <p className="text-sm text-gray-600 mt-1">Try searching with different keywords</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-cyan-500/10 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded border border-gray-700">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded border border-gray-700">↓</kbd>
                                to navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded border border-gray-700">↵</kbd>
                                to select
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Command className="w-3 h-3" />
                            <span>+ K to toggle</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandPalette;
