import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    MessageSquare,
    UserCog,
    Zap,
    Activity,
    Gift,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Search,
    Shield,
    CreditCard
} from 'lucide-react';

const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin',
    },
    {
        id: 'users',
        label: 'User Inspector',
        icon: Users,
        path: '/admin/users',
    },
    {
        id: 'courses',
        label: 'Course Manager',
        icon: BookOpen,
        path: '/admin/courses',
    },
    {
        id: 'community',
        label: 'Community Command',
        icon: MessageSquare,
        path: '/admin/community',
    },
    {
        id: 'mentors',
        label: 'Mentor Operations',
        icon: UserCog,
        path: '/admin/mentors',
    },
    {
        id: 'live',
        label: 'Live Operations',
        icon: Zap,
        path: '/admin/live',
    },
    {
        id: 'health',
        label: 'Server Health',
        icon: Activity,
        path: '/admin/health',
    },
    {
        id: 'coupons',
        label: 'Coupon Generator',
        icon: Gift,
        path: '/admin/coupons',
    },
    {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        path: '/admin/payments',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/admin/settings',
    },
];

const Sidebar = ({ onOpenCommandPalette }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen z-50 flex flex-col"
            style={{
                background: 'linear-gradient(180deg, rgba(10, 14, 39, 0.98) 0%, rgba(15, 18, 35, 0.95) 50%, rgba(10, 14, 39, 0.98) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRight: '1px solid rgba(0, 212, 255, 0.12)',
                boxShadow: '4px 0 40px rgba(0, 212, 255, 0.08), inset -1px 0 0 rgba(255, 255, 255, 0.03)',
            }}
        >
            {/* Animated gradient mesh background */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at 20% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)
                    `,
                }}
            />
            {/* Logo Section */}
            <div className="relative p-4 border-b border-cyan-500/10">
                <Link to="/admin" className="flex items-center gap-3">
                    {/* Logo Glow Effect */}
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                                boxShadow: '0 0 24px rgba(0, 212, 255, 0.5), 0 0 48px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                            }}
                        >
                            <Shield className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                        {/* Animated pulse ring */}
                        <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                            }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </motion.div>

                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                                    Adhyaya Admin
                                </h1>
                                <p className="text-xs text-gray-500 tracking-wide">Control Panel</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Command Palette Trigger */}
            <div className="px-3 py-4 relative">
                <motion.button
                    onClick={onOpenCommandPalette}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
                        border: '1px solid rgba(0, 212, 255, 0.15)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <Search className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex items-center justify-between"
                            >
                                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Quick Search...</span>
                                <kbd className="px-2 py-0.5 text-xs bg-gray-800/60 rounded-md border border-gray-700/50 text-gray-500 font-mono shadow-inner">
                                    ⌘K
                                </kbd>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/30 relative">
                <ul className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <li key={item.id}>
                                <Link
                                    to={item.path}
                                    className={`
                                        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-300 group
                                        ${active ? 'text-white' : 'text-gray-400 hover:text-white'}
                                    `}
                                    style={{
                                        background: active
                                            ? 'linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)'
                                            : 'transparent',
                                        boxShadow: active ? '0 4px 20px rgba(0, 212, 255, 0.1)' : 'none',
                                    }}
                                >
                                    {/* Active Indicator with glow */}
                                    {active && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                            style={{
                                                background: 'linear-gradient(180deg, #00d4ff 0%, #8b5cf6 100%)',
                                                boxShadow: '0 0 12px #00d4ff, 0 0 24px rgba(0, 212, 255, 0.5)',
                                            }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        className={`
                                            relative p-2 rounded-lg transition-all duration-300
                                            ${active ? 'bg-cyan-500/20' : 'bg-gray-800/40 group-hover:bg-cyan-500/10'}
                                        `}
                                        style={{
                                            boxShadow: active ? '0 0 16px rgba(0, 212, 255, 0.3)' : 'none',
                                        }}
                                    >
                                        <Icon
                                            className={`w-5 h-5 transition-all duration-300 ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]' : 'text-gray-400 group-hover:text-cyan-400'}`}
                                        />
                                        {active && (
                                            <div
                                                className="absolute inset-0 rounded-lg blur-md opacity-40"
                                                style={{ background: '#00d4ff' }}
                                            />
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.25 }}
                                                className="text-sm font-medium tracking-wide"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-cyan-500/10 relative">
                {/* Collapse Toggle */}
                <motion.button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                        text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all duration-300"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </motion.button>

                {/* User Profile */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex items-center gap-3 px-3 py-3 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(15, 18, 35, 0.6) 100%)',
                        border: '1px solid rgba(0, 212, 255, 0.08)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <div className="relative">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                                background: user?.avatar
                                    ? `url(${user.avatar})`
                                    : 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                                backgroundSize: 'cover',
                                boxShadow: '0 0 16px rgba(0, 212, 255, 0.3)',
                            }}
                        >
                            {!user?.avatar && (user?.name?.[0]?.toUpperCase() || 'A')}
                        </div>
                        {/* Online indicator with glow */}
                        <div
                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                            style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}
                        />
                    </div>

                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Super Admin' : user?.role}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/15 transition-all duration-300"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Decorative Glow Line */}
            <div
                className="absolute right-0 top-0 h-full w-px pointer-events-none"
                style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.4) 30%, rgba(139, 92, 246, 0.3) 70%, transparent 100%)',
                }}
            />

            {/* Bottom ambient glow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 pointer-events-none blur-3xl"
                style={{ background: 'rgba(0, 212, 255, 0.05)' }}
            />
        </motion.aside>
    );
};

export default Sidebar;
