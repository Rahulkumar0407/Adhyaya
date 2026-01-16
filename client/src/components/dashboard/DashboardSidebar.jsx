import { useLocation } from 'react-router-dom';
import PrefetchLink from '../common/PrefetchLink';
import { useAuth } from '../../context/AuthContext';
import {
    Home,
    BookOpen,
    Code2,
    ClipboardCheck,
    Trophy,
    MessageSquare,
    LogOut,
    Users
} from 'lucide-react';

const navItems = [
    {
        section: 'APNA ADDA',
        items: [
            { name: 'Dashboardwa', href: '/dashboard', icon: Home },
            { name: 'Imtihaan (Tests)', href: '/revisions', icon: ClipboardCheck },
        ]
    },
    {
        section: 'MENTOR CONNECT',
        items: [
            { name: 'Mentors (1:1 Calls)', href: '/mentors', icon: Users },
        ]
    },
    {
        section: 'SANGATI (COMMUNITY)',
        items: [
            { name: 'Toppers List', href: '/leaderboard', icon: Trophy },
            { name: 'Batiyave Ke Jagah', href: '/pods', icon: MessageSquare },
        ]
    }
];

export default function DashboardSidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <aside className="w-64 min-h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
            {/* Logo */}
            <div className="p-6">
                <PrefetchLink to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <img src="/favicon.png" alt="Adhyaya Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-orange-500">ADHYAYA</span>
                        <p className="text-[10px] text-gray-500 -mt-1">HUMARA PLATFORM</p>
                    </div>
                </PrefetchLink>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4">
                {navItems.map((group, idx) => (
                    <div key={idx} className="mb-6">
                        <p className="text-xs text-gray-500 font-medium tracking-wider mb-3 px-3">
                            {group.section}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </PrefetchLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User Profile at Bottom */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || 'Babua'} Bhaiya
                        </p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Ekdum Active
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
