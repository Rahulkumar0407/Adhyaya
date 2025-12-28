import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, User as UserIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: 'home' },
        { name: 'DSA', path: '/dsa', icon: 'code' },
        { name: 'Core Subjects', path: '/courses?category=core', icon: 'menu_book' },
        { name: 'System Design', path: '/courses?category=system-design', icon: 'architecture' },
        { name: 'AI/ML', path: '/courses?category=ai-ml', icon: 'psychology' },
        { name: 'Bhaukaal', path: '/leaderboard', icon: 'leaderboard' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel shadow-lg' : 'bg-transparent'}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="size-10 text-babua-blue animate-pulse">
                            <span className="material-symbols-outlined text-4xl">terminal</span>
                        </div>
                        <h2 className="font-bebas text-3xl tracking-wider text-white neon-text">
                            BABUA <span className="text-babua-yellow">BPL</span>
                        </h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {isAuthenticated ? (
                            <>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 group ${location.pathname === item.path ? 'text-babua-yellow' : 'text-gray-300 hover:text-babua-blue'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover:scale-125 transition-transform">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                ))}

                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                                    <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-2 right-2 size-2 bg-babua-orange rounded-full"></span>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <Link to="/profile" className="size-9 rounded-full bg-gradient-to-tr from-babua-blue to-babua-yellow p-[2px] hover:shadow-neon transition-shadow">
                                            <div className="size-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                <div className="h-full w-full bg-gradient-to-tr from-babua-blue to-babua-yellow flex items-center justify-center text-black font-bold">
                                                    {user?.name?.charAt(0) || 'B'}
                                                </div>
                                            </div>
                                        </Link>
                                        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="px-6 py-2 rounded-full font-bold text-gray-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary-babua !py-2 !px-6 text-sm">
                                    Signup
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isMenuOpen && (
                <div className="lg:hidden glass-panel fixed inset-0 top-16 z-40 animate-fade-in">
                    <div className="flex flex-col p-6 gap-6">
                        {isAuthenticated ? (
                            <>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 text-xl font-bold tracking-widest uppercase text-gray-300 active:text-babua-yellow"
                                    >
                                        <span className="material-symbols-outlined text-2xl text-babua-blue">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                ))}
                                <button onClick={logout} className="mt-4 flex items-center gap-4 text-red-400 font-bold uppercase tracking-widest">
                                    <LogOut className="w-6 h-6" />
                                    Logout Session
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center font-bold text-white glass-panel rounded-xl">
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center font-bold text-black bg-babua-yellow rounded-xl shadow-glow-yellow">
                                    Signup
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

