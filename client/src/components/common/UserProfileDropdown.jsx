import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, LayoutDashboard, ChevronDown, Wallet } from 'lucide-react';

export default function UserProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const userName = user?.name?.split(' ')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 group focus:outline-none"
            >
                <div className="text-right hidden md:block">
                    <div className="text-gray-200 font-medium text-sm group-hover:text-white transition-colors">{userName}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors uppercase">{user?.role || 'User'}</div>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all group-hover:scale-105 border border-white/10">
                        {userInitial}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-800 mb-2">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>

                    {/* Mentor Dashboard Access */}
                    {user?.role === 'mentor' ? ( // Check role
                        <Link
                            to="/mentor-dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Mentor Board
                        </Link>
                    ) : null}

                    <Link
                        to={user?.role === 'mentor' ? "/mentor/profile" : "/profile"}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <User className="w-4 h-4" />
                        Profile
                    </Link>
                    <Link
                        to="/wallet"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Wallet className="w-4 h-4" />
                        Wallet
                    </Link>
                    {user?.role !== 'mentor' && (
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    )}

                    <div className="border-t border-gray-800 my-2"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
