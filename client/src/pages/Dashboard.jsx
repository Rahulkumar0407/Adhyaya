import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Flame, Trophy, Clock, CheckCircle, Play,
    BarChart3, Home, BookOpen, Code2, ClipboardCheck, Users, Bell,
    Cpu, Database, Network, Brain, Layers, ArrowUp
} from 'lucide-react';

// All courses data
const allCourses = [
    {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        shortTitle: 'DSA',
        description: 'Naukri chahiye to ye to padhna padega babua.',
        fullDescription: 'Abhi hum Dynamic Programming ke dukh-dard me phase hue hain.',
        icon: Code2,
        progress: 65,
        currentLesson: 'Lecture 4: Dynamic Programming ka Chakravyuh',
        iconColor: 'text-cyan-500',
        iconBg: 'bg-cyan-500/10',
        progressColor: 'bg-cyan-500',
        gradientFrom: 'from-cyan-500',
        gradientTo: 'to-blue-500',
    },
    {
        id: 'system-design',
        title: 'System Design',
        shortTitle: 'System Design',
        description: 'Bade socho babua! Netflix jaisa system kaise banega?',
        fullDescription: 'Scalability, Load Balancing, Microservices samjho.',
        icon: Layers,
        progress: 20,
        currentLesson: 'Lecture 2: Load Balancer Kya Hai?',
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/10',
        progressColor: 'bg-orange-500',
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-red-500',
    },
    {
        id: 'operating-systems',
        title: 'Operating Systems',
        shortTitle: 'OS',
        description: 'Computer ka dimaag kaise chalta hai?',
        fullDescription: 'Process, Threads aur Deadlock se bachna sikho.',
        icon: Cpu,
        progress: 0,
        currentLesson: 'Shuru Karo: Introduction to OS',
        iconColor: 'text-green-500',
        iconBg: 'bg-green-500/10',
        progressColor: 'bg-green-500',
        gradientFrom: 'from-green-500',
        gradientTo: 'to-emerald-500',
    },
    {
        id: 'computer-networks',
        title: 'Computer Networks',
        shortTitle: 'Networks',
        description: 'Jaal (Internet) kaise bicha hai?',
        fullDescription: 'OSI Model, TCP/IP aur Packets ka khel samjho.',
        icon: Network,
        progress: 10,
        currentLesson: 'Lecture 1: OSI Model Ka Rahasya',
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-500/10',
        progressColor: 'bg-purple-500',
        gradientFrom: 'from-purple-500',
        gradientTo: 'to-violet-500',
    },
    {
        id: 'dbms',
        title: 'DBMS & SQL',
        shortTitle: 'DBMS',
        description: 'Data ka Godam! Query maarke nikalna sikho.',
        fullDescription: 'Normalization, Joins, Indexes sab sikho.',
        icon: Database,
        progress: 45,
        currentLesson: 'Lecture 5: SQL Joins Ka Jadoo',
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-500/10',
        progressColor: 'bg-yellow-500',
        gradientFrom: 'from-yellow-500',
        gradientTo: 'to-amber-500',
    },
    {
        id: 'ai-ml',
        title: 'AI / ML',
        shortTitle: 'AI/ML',
        description: 'Jadu Tona (Future Tech). Machine ko sikhana padega.',
        fullDescription: 'Neural Networks, Deep Learning samjho.',
        icon: Brain,
        progress: 5,
        currentLesson: 'Lecture 1: Machine Learning Kya Hai?',
        iconColor: 'text-pink-500',
        iconBg: 'bg-pink-500/10',
        progressColor: 'bg-pink-500',
        gradientFrom: 'from-pink-500',
        gradientTo: 'to-rose-500',
    },
    {
        id: 'oops',
        title: 'OOPs',
        shortTitle: 'OOPs',
        description: 'Classes, Objects, Inheritance ka chakkar.',
        fullDescription: 'Code ko saaf-suthra rakhne ka tarika.',
        icon: Code2,
        progress: 0,
        currentLesson: 'Shuru Karo: What is OOP?',
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10',
        progressColor: 'bg-blue-500',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-indigo-500',
    },
];

// Stats data
const statsCards = [
    {
        label: 'STREAK',
        value: '12 Din',
        icon: Flame,
        borderColor: 'border-orange-500',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500',
        subtitle: 'Maje mein! Lagatar padhai jari hai',
        subtitleColor: 'text-orange-400',
    },
    {
        label: 'GLOBAL RANK',
        value: '#432',
        icon: Trophy,
        borderColor: 'border-purple-500',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-500',
        subtitle: '↗ Top 2% students mein',
        subtitleColor: 'text-purple-400',
    },
    {
        label: 'SAMAY',
        value: '42 Ghanta',
        icon: Clock,
        borderColor: 'border-yellow-500',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-500',
        subtitle: '+4hrs pichle hafte se',
        subtitleColor: 'text-gray-400',
    },
    {
        label: 'COURSE PURA',
        value: '65%',
        icon: CheckCircle,
        borderColor: 'border-green-500',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-500',
        subtitle: 'Bas thoda aur zor lagao!',
        subtitleColor: 'text-gray-400',
    },
];

// Nav items
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, active: true },
    { name: 'Padhai-Likhai', href: '/padhai-zone', icon: BookOpen },
    { name: 'Coding', href: '/patterns', icon: Code2 },
    { name: 'Imtihaan', href: '/revisions', icon: ClipboardCheck },
    { name: 'Adda', href: '/pods', icon: Users },
];

export default function Dashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const [featuredCourseId, setFeaturedCourseId] = useState('dsa');

    // Get featured course and other courses
    const featuredCourse = allCourses.find(c => c.id === featuredCourseId);
    const otherCourses = allCourses.filter(c => c.id !== featuredCourseId);

    const handleExploreCourse = (courseId) => {
        setFeaturedCourseId(courseId);
        // Scroll to top of featured course
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!loading && !isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="text-orange-500 text-xl">Loading...</div>
            </div>
        );
    }

    const userName = user?.name?.split(' ')[0] || 'Babua';


    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Top Navigation */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🎯</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="font-bold text-white">BABUA <span className="text-orange-500">BPL</span></div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Humara Platform</div>
                            </div>
                        </Link>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-400 hover:text-white p-2">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </button>
                        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                            <div className="text-right hidden md:block">
                                <div className="text-white font-medium text-sm">{userName} Bhaiya</div>
                                <div className="text-green-500 text-xs flex items-center gap-1 justify-end">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    ONLINE
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                {userName.charAt(0)}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* Greeting Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">🙏</span>
                            Pranam, {userName} Babua!
                        </h1>
                        <p className="text-gray-400 mt-1 flex items-center gap-2">
                            Ka haal ba? Aaj kuch bada ukhada jaye! <span className="text-xl">💪</span>
                        </p>
                    </div>
                    <Link
                        to="/daily-challenge"
                        className="inline-flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-2xl px-5 py-3 hover:border-orange-500/50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                            <span className="text-xl">🎯</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Aaj Ka Challenge</div>
                            <div className="text-orange-500 font-bold">Daily Streak Banayein</div>
                        </div>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statsCards.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={index}
                                className={`bg-[#1a1a1a] rounded-2xl p-5 border-l-4 ${stat.borderColor}`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                        <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    </div>
                                </div>
                                <div className={`text-xs ${stat.subtitleColor}`}>{stat.subtitle}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Current Course & Subject Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Current Course - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 relative overflow-hidden">
                        {/* Background gradient */}
                        <div className={`absolute top-0 right-0 w-1/2 h-full opacity-10 bg-gradient-to-l ${featuredCourse.gradientFrom} ${featuredCourse.gradientTo}`}></div>

                        <div className="relative">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-[#2a2a2a] text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                                    ABHI CHAL RAHA HAI
                                </span>
                                {featuredCourse.progress > 0 && (
                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Garma Garam
                                    </span>
                                )}
                                {featuredCourse.progress === 0 && (
                                    <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                                        Naya Course
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 ${featuredCourse.iconBg} rounded-xl flex items-center justify-center`}>
                                    <featuredCourse.icon className={`w-6 h-6 ${featuredCourse.iconColor}`} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">
                                    <span className="text-white">{featuredCourse.title.split(' ').slice(0, -1).join(' ')} </span>
                                    <span className={featuredCourse.iconColor}>{featuredCourse.title.split(' ').slice(-1)}</span>
                                </h2>
                            </div>

                            <p className="text-gray-400 text-sm mb-2">{featuredCourse.fullDescription}</p>

                            <div className="flex items-center gap-2 text-gray-400 mb-6">
                                <Play className="w-4 h-4 text-orange-500" fill="currentColor" />
                                <span>{featuredCourse.currentLesson}</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Progress</span>
                                        <span className={`font-bold ${featuredCourse.iconColor}`}>{featuredCourse.progress}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${featuredCourse.gradientFrom} ${featuredCourse.gradientTo} rounded-full transition-all duration-500`}
                                            style={{ width: `${featuredCourse.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <Link
                                    to={`/${featuredCourse.id}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <Play className="w-4 h-4" fill="currentColor" />
                                    {featuredCourse.progress > 0 ? 'Jari Rakho' : 'Shuru Karo'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Padhai-Likhai Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-orange-500" />
                                Padhai-Likhai
                            </h2>
                            <p className="text-gray-500 text-sm">Click "Explore" to switch course above</p>
                        </div>
                        <Link
                            to="/padhai-zone"
                            className="text-orange-500 text-sm hover:underline"
                        >
                            Sab Dekho →
                        </Link>
                    </div>

                    {/* Subject Cards Grid - Dynamic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherCourses.map((course) => {
                            const IconComponent = course.icon;
                            const getProgressLabel = (p) => {
                                if (p === 0) return { text: 'Shuru Nahi', color: 'text-gray-500' };
                                if (p < 25) return { text: 'Abhi Shuru', color: 'text-red-400' };
                                if (p < 50) return { text: 'Halfway', color: 'text-yellow-400' };
                                if (p < 75) return { text: 'Aadha Se Zyada', color: 'text-blue-400' };
                                return { text: 'Almost Done!', color: 'text-green-400' };
                            };
                            const progressInfo = getProgressLabel(course.progress);

                            return (
                                <div
                                    key={course.id}
                                    className="bg-[#151515] rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 ${course.iconBg} rounded-xl flex items-center justify-center`}>
                                            <IconComponent className={`w-5 h-5 ${course.iconColor}`} />
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-bold ${course.progress > 0 ? course.iconColor : 'text-gray-600'}`}>
                                                {course.progress}%
                                            </span>
                                            <p className={`text-[10px] ${progressInfo.color}`}>{progressInfo.text}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-white mb-1">{course.shortTitle}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{course.description}</p>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${course.progressColor} transition-all duration-500`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/padhai-zone/${course.id}/syllabus`}
                                            className="flex-1 py-2 text-center text-xs font-medium bg-[#2a2a2a] text-gray-300 rounded-lg border border-gray-700 hover:border-gray-600 hover:text-white transition-colors"
                                        >
                                            📖 Syllabus
                                        </Link>
                                        <button
                                            onClick={() => handleExploreCourse(course.id)}
                                            className="flex-1 py-2 text-center text-xs font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1"
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
