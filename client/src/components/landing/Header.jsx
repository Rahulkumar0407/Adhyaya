import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

const navLinks = [
    { name: 'Jugaad (Patterns)', href: '/patterns' },
    { name: 'Mentors (1:1 Calls)', href: '/mentors' },
    { name: 'Charcha (Chats)', href: '/pods' },
    { name: 'Hamara Adda (About)', href: '/about' },
];

export default function Header() {
    const headerRef = useRef(null);
    const logoRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (logoRef.current) {
            gsap.fromTo(
                logoRef.current,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, []);

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gray-800/50"
        >
            <div className="container-babua">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" ref={logoRef} className="flex items-center gap-2 md:gap-3">
                        <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-lg md:text-xl font-bold text-orange-500">
                                ADHYAYA
                            </span>
                            <span className="text-[10px] text-gray-400 tracking-wider -mt-1 hidden md:block">
                                PLACEMENT XPRESS
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 text-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden md:block px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium text-sm"
                                >
                                    Login Wo
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 text-sm border border-orange-400"
                                >
                                    Shuru Karo Guru
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
                                >
                                    Login Wo
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
