import { Link } from 'react-router-dom';
import { Home, Map, Target, Coffee, Bell, Flame } from 'lucide-react';

export default function DSAHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="container-babua">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Left: Logo and Navigation */}
                    <div className="flex items-center gap-6 md:gap-8">
                        {/* Logo */}
                        <Link to="/dsa" className="flex items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
                                {/* Auto-rickshaw icon */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19.11 11H4.89L6.5 6.5ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16Z" fill="#000000"/>
                                </svg>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg md:text-xl font-bold text-blue-900">Babua</span>
                                <span className="text-lg md:text-xl font-bold text-blue-500">DSA</span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                            <Link to="/dsa" className="text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                Home
                            </Link>
                            <Link to="/dsa/roadmap" className="text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                Roadmap
                            </Link>
                            <Link to="/dsa/practice" className="text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                Practice
                            </Link>
                            <Link to="/dsa/testimonials" className="text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                Chai Tapri
                            </Link>
                        </nav>
                    </div>

                    {/* Right: Streak, Notifications, Profile */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Streak */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
                            <div className="relative">
                                <Home className="w-4 h-4 text-orange-600" />
                                <Flame className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                            </div>
                            <span className="text-xs md:text-sm font-semibold text-orange-700">12 Day Streak</span>
                        </div>

                        {/* Bell Icon */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profile Picture */}
                        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-200 overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center text-white text-sm md:text-base font-semibold">
                                U
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

