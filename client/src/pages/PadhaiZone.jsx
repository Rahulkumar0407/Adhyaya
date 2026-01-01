import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Flame, Trophy, BookOpen, Grid3X3, List,
    Cpu, Database, Network, Brain, Code2, Layers
} from 'lucide-react';

const subjects = [
    {
        id: 'system-design',
        title: 'System Design',
        description: 'Bade socho babua! Netflix jaisa system kaise banega? Scalability, Load Balancing samjho.',
        icon: Layers,
        progress: 20,
        status: 'in-progress',
        buttonText: 'Padhai Jari Rakho',
        buttonStyle: 'secondary',
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/10',
    },
    {
        id: 'operating-systems',
        title: 'Operating Systems',
        description: 'Computer ka dimaag kaise chalta hai? Process, Threads aur Deadlock se bachna sikho.',
        icon: Cpu,
        progress: 0,
        status: 'not-started',
        buttonText: 'Shuru Karo',
        buttonStyle: 'primary',
        iconColor: 'text-green-500',
        iconBg: 'bg-green-500/10',
    },
    {
        id: 'computer-networks',
        title: 'Computer Networks',
        description: 'Jaal (Internet) kaise bicha hai? OSI Model, TCP/IP aur Packets ka khel samjho.',
        icon: Network,
        progress: 10,
        status: 'in-progress',
        buttonText: 'Padhai Jari Rakho',
        buttonStyle: 'secondary',
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-500/10',
    },
    {
        id: 'dbms',
        title: 'DBMS & SQL',
        description: 'Data ka Godam! Data ko kaise store karna hai aur Query maarke kaise nikalna hai.',
        icon: Database,
        progress: 45,
        status: 'in-progress',
        buttonText: 'Padhai Jari Rakho',
        buttonStyle: 'secondary',
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-500/10',
    },
    {
        id: 'ai-ml',
        title: 'AI / ML',
        description: 'Jadu Tona (Future Tech). Machine ko sikhana padega ab. Neural Networks, Deep Learning.',
        icon: Brain,
        progress: 5,
        status: 'in-progress',
        buttonText: 'Padhai Jari Rakho',
        buttonStyle: 'secondary',
        iconColor: 'text-pink-500',
        iconBg: 'bg-pink-500/10',
    },
    {
        id: 'oops',
        title: 'OOPs',
        description: 'Classes, Objects, Inheritance ka chakkar. Code ko saaf-suthra rakhne ka tarika.',
        icon: Code2,
        progress: 0,
        status: 'not-started',
        buttonText: 'Shuru Karo',
        buttonStyle: 'primary',
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10',
    },
];

export default function PadhaiZone() {
    const [viewMode, setViewMode] = useState('grid');

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Top Navigation */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <img src="/favicon.png" alt="Adhyaya Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                                <div className="font-bold text-white">ADHYAYA</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Placement Platform</div>
                            </div>
                        </Link>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Adda (Dashboard)
                            </Link>
                            <Link to="/padhai-zone" className="text-white bg-orange-500 px-3 py-1.5 rounded-lg text-sm font-medium">
                                Padhai (Courses)
                            </Link>
                            <Link to="/practice" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Akhaada (Practice)
                            </Link>
                            <Link to="/mentors" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Guru Ji (Mentors)
                            </Link>
                        </nav>
                    </div>

                    {/* Search & User */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-gray-800">
                            <span className="text-gray-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Ka kho rahe ho babua?"
                                className="bg-transparent text-sm text-gray-400 outline-none w-48"
                            />
                        </div>
                        <button className="text-gray-400 hover:text-white">🔔</button>
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full"></div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-500 text-xs font-semibold uppercase tracking-wider">🔥 Namaste Engineer!</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="text-white">Padhai Likhai </span>
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Zone</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            {/* Streak Badge */}
                            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-2 border border-gray-800">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Lagatar Mehnat</div>
                                    <div className="text-white font-bold">12 Days</div>
                                </div>
                            </div>
                            {/* Rank Badge */}
                            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-2 border border-gray-800">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Rutba (Rank)</div>
                                    <div className="text-white font-bold">Bahubali</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2">Ka haal ba? Placement phodne ki taiyari shuru karo. Boka mat bano, smart bano!</p>
                </div>

                {/* Featured Course - DSA */}
                <div className="mb-12">
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl p-6 md:p-8 border border-gray-800 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
                            <div className="absolute top-10 right-10 w-40 h-40 bg-green-500/30 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-10 right-20 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative grid md:grid-cols-2 gap-8">
                            <div>
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 text-green-500 text-xs font-semibold uppercase tracking-wider mb-4">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Chalu Hai (In Progress)
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    <span className="text-white">DSA: Placement Ka </span>
                                    <span className="text-orange-500">Brahmastra</span>
                                </h2>

                                <p className="text-gray-400 mb-6">
                                    Naukri chahiye to ye to padhna padega babua. Abhi hum <span className="text-white font-medium">Dynamic Programming</span> ke dukh-dard me phase hue hain.
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Taiyari Meter</span>
                                        <span className="text-green-500 font-bold">65% Ho Gaya</span>
                                    </div>
                                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                                            style={{ width: '65%' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        to="/dsa"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30"
                                    >
                                        Padhai Jari Rakho
                                        <span>→</span>
                                    </Link>
                                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#2a2a2a] text-white font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                        <BookOpen className="w-4 h-4" />
                                        Syllabus Dekho
                                    </button>
                                </div>
                            </div>

                            {/* Right side - Next Challenge */}
                            <div className="hidden md:flex items-end justify-end">
                                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 max-w-xs">
                                    <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
                                        <span>→</span>
                                        <span className="uppercase tracking-wider">Agla Padga</span>
                                    </div>
                                    <div className="text-orange-500 text-xs font-medium mb-1">Coding Challenge</div>
                                    <div className="text-white font-bold">Longest Increasing Subsequence</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Subjects Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Aur Bhi Maidan Hai</h2>
                            <p className="text-gray-500 text-sm">Domain chuno aur shuru ho jao.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Subject Cards Grid */}
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {subjects.map((subject) => {
                            const IconComponent = subject.icon;
                            return (
                                <div
                                    key={subject.id}
                                    className="bg-[#151515] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 group"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${subject.iconBg} rounded-xl flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${subject.iconColor}`} />
                                        </div>
                                        {subject.progress > 0 && (
                                            <span className="text-xs text-gray-500 font-medium">{subject.progress}%</span>
                                        )}
                                        {subject.status === 'not-started' && (
                                            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">Shuru Nahi Hua</span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-white mb-2">{subject.title}</h3>

                                    {/* Description */}
                                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{subject.description}</p>

                                    {/* Progress Bar */}
                                    {subject.progress > 0 && (
                                        <div className="h-1 bg-gray-800 rounded-full mb-4 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${subject.iconColor.replace('text-', 'bg-')}`}
                                                style={{ width: `${subject.progress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    {/* Button */}
                                    <button
                                        className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${subject.buttonStyle === 'primary'
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/20'
                                            : 'bg-[#2a2a2a] text-gray-300 border border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        {subject.buttonText}
                                        {subject.buttonStyle === 'primary' && <span className="ml-2">→</span>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-16 py-6">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="text-red-500">❤️</span>
                        <span>© 2024 ADHYAYA. Bihari Engineers ke liye, Dil se.</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link to="/help" className="hover:text-white transition-colors">Madad (Help)</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
