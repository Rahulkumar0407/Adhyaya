import { Link, useLocation } from 'react-router-dom';
import {
    Home, Mic, RotateCcw, Gift, MessageCircle,
    Bell, Search, Menu, X, Rocket, LayoutDashboard, Wallet, Calendar, TrendingUp
} from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => location.pathname === path
        ? "bg-gray-800 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800/50";

    return (
        <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800/50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to={user?.role === 'mentor' ? "/mentor-dashboard" : "/dashboard"} className="flex items-center gap-2 group">
                    <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                    <div className="hidden md:block">
                        <div className="font-bold text-white text-sm tracking-wide">ADHYAYA</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                            {user?.role === 'mentor' ? 'Mentor Portal' : 'Humara Platform'}
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-900/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                    {user?.role === 'mentor' ? (
                        <>
                            <Link to="/mentor-dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/mentor-dashboard')}`}>
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link to="/doubts/mentor-analytics" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/doubts/mentor-analytics')}`}>
                                <TrendingUp className="w-4 h-4" />
                                Analytics
                            </Link>
                            <Link to="/wallet" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/wallet')}`}>
                                <Wallet className="w-4 h-4" />
                                Wallet
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard')}`}>
                                <Home className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link to="/mock-interview" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/mock-interview')}`}>
                                <Mic className="w-4 h-4" />
                                Interview
                            </Link>
                            <Link to="/revision" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/revision')}`}>
                                <RotateCcw className="w-4 h-4" />
                                Revision
                            </Link>
                            <Link to="/mentors" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith('/mentors') ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}>
                                <MessageCircle className="w-4 h-4" />
                                Mentors
                            </Link>
                            <Link to="/how-to-earn" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/how-to-earn')}`}>
                                <Gift className="w-4 h-4" />
                                Rewards
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Search - Visually present but static for now */}
                    {/* <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-gray-800/50 rounded-lg text-gray-500 text-xs">
                        <Search className="w-3 h-3" />
                        <span className="opacity-50">Search...</span>
                        <span className="bg-gray-800 px-1 rounded text-[10px] ml-4">⌘K</span>
                    </div> */}

                    <button className="relative text-gray-500 hover:text-orange-400 p-2 transition-colors group">
                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-[#0a0a0a]"></span>
                    </button>

                    <div className="h-6 w-px bg-gray-800 mx-1 hidden md:block"></div>

                    <UserProfileDropdown />
                </div>
            </div>
        </header>
    );
}
