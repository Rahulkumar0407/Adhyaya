import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/admin/Sidebar';
import CommandPalette from '../../components/admin/CommandPalette';
import { Loader2 } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const AdminDashboard = () => {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const { user, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Global keyboard shortcut for command palette
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Check admin authorization - wait for loading to complete
    useEffect(() => {
        if (loading) return; // Wait for auth check to complete

        if (!isAuthenticated || user?.role !== 'admin') {
            // Redirect to login or unauthorized page
            navigate('/login', { state: { from: location.pathname } });
        }
    }, [loading, isAuthenticated, user, navigate, location]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #0a0e27 0%, #0f1225 50%, #0a0e27 100%)',
                }}
            >
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-14 h-14 text-cyan-400 animate-spin mx-auto" />
                        <div
                            className="absolute inset-0 w-14 h-14 mx-auto rounded-full blur-xl"
                            style={{ background: 'rgba(0, 212, 255, 0.3)' }}
                        />
                    </div>
                    <p className="mt-6 text-gray-400 font-medium tracking-wide">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authorized (redirect is happening)
    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div
                className="min-h-screen"
                style={{
                    background: 'linear-gradient(135deg, #0a0e27 0%, #0f1225 50%, #0a0e27 100%)',
                }}
            >
                {/* Animated Gradient Mesh Background */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background: `
                            radial-gradient(ellipse at 10% 20%, rgba(0, 212, 255, 0.06) 0%, transparent 40%),
                            radial-gradient(ellipse at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
                            radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)
                        `,
                    }}
                />

                {/* Subtle Grid Pattern */}
                <div
                    className="fixed inset-0 opacity-[0.15] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Floating Orbs with subtle animation */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
                        style={{
                            background: 'rgba(0, 212, 255, 0.06)',
                            top: '10%',
                            left: '20%',
                        }}
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
                        style={{
                            background: 'rgba(139, 92, 246, 0.05)',
                            bottom: '20%',
                            right: '15%',
                        }}
                        animate={{
                            x: [0, -25, 0],
                            y: [0, 25, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    />
                    <motion.div
                        className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
                        style={{
                            background: 'rgba(16, 185, 129, 0.04)',
                            top: '60%',
                            left: '60%',
                        }}
                        animate={{
                            x: [0, 20, 0],
                            y: [0, -15, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    />
                </div>

                {/* Sidebar */}
                <Sidebar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

                {/* Main Content - Adjusted for sidebar */}
                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="ml-[280px] p-8 min-h-screen relative z-10"
                >
                    {/* Page Header */}
                    <header className="mb-10">
                        <motion.h1
                            className="text-3xl font-bold text-white mb-2 tracking-tight"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {getPageTitle(location.pathname)}
                        </motion.h1>
                        <motion.p
                            className="text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {getPageDescription(location.pathname)}
                        </motion.p>
                    </header>

                    {/* Page Content */}
                    <Outlet />
                </motion.main>

                {/* Command Palette */}
                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                />
            </div>
        </QueryClientProvider>
    );
};

// Helper functions for page titles
const getPageTitle = (pathname) => {
    const titles = {
        '/admin': 'Dashboard',
        '/admin/users': 'User Inspector',
        '/admin/courses': 'Course Manager',
        '/admin/community': 'Community Command',
        '/admin/mentors': 'Mentor Operations',
        '/admin/live': 'Live Operations',
        '/admin/health': 'Server Health',
        '/admin/coupons': 'Coupon Generator',
        '/admin/settings': 'Settings',
    };
    return titles[pathname] || 'Admin';
};

const getPageDescription = (pathname) => {
    const descriptions = {
        '/admin': 'Overview of platform metrics and real-time activity',
        '/admin/users': 'Search, inspect, and manage user accounts',
        '/admin/courses': 'Manage DSA, System Design, and other course content',
        '/admin/community': 'Announcements, moderation, and Chai Tapri management',
        '/admin/mentors': 'Monitor mentor activity and performance',
        '/admin/live': 'Real-time transactions, doubts, and active calls',
        '/admin/health': 'API latency, database status, and server metrics',
        '/admin/coupons': 'Create and manage discount codes',
        '/admin/settings': 'Platform configuration and preferences',
    };
    return descriptions[pathname] || '';
};

export default AdminDashboard;
