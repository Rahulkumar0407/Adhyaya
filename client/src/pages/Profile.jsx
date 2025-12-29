import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    BarChart3, Edit3, Linkedin, Github, Globe, MapPin,
    GraduationCap, Flame, Trophy, Clock, CheckCircle,
    Home, BookOpen, Code2, ClipboardCheck, Users, Bell
} from 'lucide-react';

// Nav items
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Padhai-Likhai', href: '/padhai-zone', icon: BookOpen },
    { name: 'Coding', href: '/patterns', icon: Code2 },
    { name: 'Imtihaan', href: '/revisions', icon: ClipboardCheck },
    { name: 'Adda', href: '/pods', icon: Users },
];

export default function Profile() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [chartView, setChartView] = useState('weekly');
    const [weeklyData, setWeeklyData] = useState([]);
    const [subjectProgress, setSubjectProgress] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProfile();
        fetchWeeklyActivity();
        fetchSubjectProgress();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyActivity = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/activity/weekly`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setWeeklyData(data.data);
            } else {
                // Use demo data if API doesn't exist yet
                setWeeklyData([
                    { day: 'SOM', minutes: 45, date: getDateForDay(0) },
                    { day: 'MANGAL', minutes: 120, date: getDateForDay(1) },
                    { day: 'BUDH', minutes: 90, date: getDateForDay(2) },
                    { day: 'GURU', minutes: 180, date: getDateForDay(3) },
                    { day: 'SHUKR', minutes: 60, date: getDateForDay(4) },
                    { day: 'SHANI', minutes: 150, date: getDateForDay(5) },
                    { day: 'RAVI', minutes: 200, date: getDateForDay(6) },
                ]);
            }
        } catch (error) {
            // Use demo data
            setWeeklyData([
                { day: 'SOM', minutes: 45, date: getDateForDay(0) },
                { day: 'MANGAL', minutes: 120, date: getDateForDay(1) },
                { day: 'BUDH', minutes: 90, date: getDateForDay(2) },
                { day: 'GURU', minutes: 180, date: getDateForDay(3) },
                { day: 'SHUKR', minutes: 60, date: getDateForDay(4) },
                { day: 'SHANI', minutes: 150, date: getDateForDay(5) },
                { day: 'RAVI', minutes: 200, date: getDateForDay(6) },
            ]);
        }
    };

    const fetchSubjectProgress = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/subjects/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setSubjectProgress(data.data);
            } else {
                // Use demo data if API doesn't exist yet
                setSubjectProgress([
                    { name: 'DSA', progress: 100, color: 'bg-cyan-500' },
                    { name: 'DBMS', progress: 80, color: 'bg-orange-500' },
                    { name: 'OS', progress: 50, color: 'bg-purple-500' },
                    { name: 'Networks', progress: 10, color: 'bg-green-500' },
                ]);
            }
        } catch (error) {
            // Use demo data
            setSubjectProgress([
                { name: 'DSA', progress: 100, color: 'bg-cyan-500' },
                { name: 'DBMS', progress: 80, color: 'bg-orange-500' },
                { name: 'OS', progress: 50, color: 'bg-purple-500' },
                { name: 'Networks', progress: 10, color: 'bg-green-500' },
            ]);
        }
    };

    const getDateForDay = (dayOffset) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + dayOffset);
        return startOfWeek.toISOString().split('T')[0];
    };

    const formatMinutes = (mins) => {
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    const getTotalWeeklyTime = () => {
        return weeklyData.reduce((acc, day) => acc + day.minutes, 0);
    };

    const getMaxMinutes = () => {
        return Math.max(...weeklyData.map(d => d.minutes), 60);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Babua';

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Top Navigation - Same as Dashboard */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🎯</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="font-bold text-white">BABUA <span className="text-orange-500">BPL</span></div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Humara Platform</div>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-400 hover:text-white p-2">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </button>
                        <Link to="/profile" className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-white font-medium text-sm">{userName} Bhaiya</div>
                                <div className="text-green-500 text-xs flex items-center gap-1 justify-end">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    ONLINE
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    userName.charAt(0)
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* Profile Header Card */}
                <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-1">
                            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt={profile?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {profile?.name?.charAt(0) || 'B'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                {profile?.name || 'Babua'}
                                <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    Lvl {profile?.level || 1}
                                </span>
                            </h1>
                            <p className="text-gray-400 text-sm mb-2">{profile?.email}</p>
                            <p className="text-gray-300 text-sm">{profile?.bio || 'Apna bio add karo - Settings mein jao!'}</p>

                            {/* Social Links */}
                            <div className="flex items-center gap-3 mt-3">
                                {profile?.location && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" /> {profile.location}
                                    </span>
                                )}
                                {profile?.college && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <GraduationCap className="w-3 h-3" /> {profile.college}
                                    </span>
                                )}
                                {profile?.socialLinks?.linkedin && (
                                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                                {profile?.socialLinks?.github && (
                                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                        <Github className="w-4 h-4" />
                                    </a>
                                )}
                                {profile?.socialLinks?.portfolio && (
                                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
                                        <Globe className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <Link
                            to="/settings"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Stats Cards - Same style as Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1a1a1a] rounded-2xl p-5 border-l-4 border-orange-500">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">STREAK</div>
                                <div className="text-2xl font-bold text-white">{profile?.streakCount || 0} Din</div>
                            </div>
                        </div>
                        <div className="text-xs text-orange-400">Lagatar padhai jari hai! 🔥</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-2xl p-5 border-l-4 border-purple-500">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">SAMOSA POINTS</div>
                                <div className="text-2xl font-bold text-white">{profile?.babuaCoins || 0}</div>
                            </div>
                        </div>
                        <div className="text-xs text-purple-400">Coins kamao, rewards lo!</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-2xl p-5 border-l-4 border-yellow-500">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">TOTAL XP</div>
                                <div className="text-2xl font-bold text-white">{profile?.xpPoints || 0}</div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">Experience points</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-2xl p-5 border-l-4 border-green-500">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">PROBLEMS</div>
                                <div className="text-2xl font-bold text-white">{profile?.problemsSolved || 0}</div>
                            </div>
                        </div>
                        <div className="text-xs text-green-400">Solved till now</div>
                    </div>
                </div>

                {/* Subject Mein Pakad & Hafta Ka Hisaab */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Subject Progress - Functional */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Subject Mein Pakad</h3>
                                <p className="text-xs text-gray-500">Sab subject barabar leke chalo!</p>
                            </div>
                            <button className="text-gray-500 hover:text-white">
                                <BarChart3 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {subjectProgress.map((subject, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${subject.color}`}></span>
                                            {subject.name}
                                        </span>
                                        <span className={`font-medium ${subject.progress >= 75 ? 'text-green-400' :
                                                subject.progress >= 50 ? 'text-yellow-400' :
                                                    subject.progress >= 25 ? 'text-orange-400' : 'text-red-400'
                                            }`}>
                                            {subject.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                                            style={{ width: `${subject.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Progress */}
                        <div className="mt-6 pt-4 border-t border-gray-800">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Overall Progress</span>
                                <span className="text-white font-bold">
                                    {Math.round(subjectProgress.reduce((acc, s) => acc + s.progress, 0) / subjectProgress.length || 0)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Chart - Functional */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Hafta Ka Hisaab</h3>
                                    <p className="text-xs text-gray-500">
                                        Total: {formatMinutes(getTotalWeeklyTime())} is hafte
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1">
                                <button
                                    onClick={() => setChartView('weekly')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${chartView === 'weekly' ? 'bg-[#3a3a3a] text-white' : 'text-gray-500'
                                        }`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setChartView('monthly')}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${chartView === 'monthly' ? 'bg-[#3a3a3a] text-white' : 'text-gray-500'
                                        }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="h-40 flex items-end justify-between gap-2 px-2">
                            {weeklyData.map((day, index) => {
                                const height = (day.minutes / getMaxMinutes()) * 100;
                                const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-xs text-gray-400">{formatMinutes(day.minutes)}</span>
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-500 ${isToday
                                                    ? 'bg-gradient-to-t from-orange-600 to-orange-400'
                                                    : 'bg-gradient-to-t from-orange-600/50 to-orange-400/50'
                                                }`}
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Day labels */}
                        <div className="flex justify-between mt-2 px-2">
                            {weeklyData.map((data, index) => {
                                const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                                return (
                                    <span
                                        key={index}
                                        className={`flex-1 text-center text-[10px] font-medium ${isToday ? 'text-orange-500' : 'text-gray-500'
                                            }`}
                                    >
                                        {data.day}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* LeetCode Integration */}
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#FFA116] rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-lg">LC</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">LeetCode Integration</h2>
                            <p className="text-xs text-gray-400">Sync your LeetCode progress</p>
                        </div>
                    </div>

                    {profile?.codingProfiles?.leetcode?.verified ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-[#333]">
                                <p className="text-3xl font-bold text-white">{profile.codingProfiles.leetcode.stats?.totalSolved || 0}</p>
                                <p className="text-xs text-gray-400">Total Solved</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-green-500/30">
                                <p className="text-3xl font-bold text-green-400">{profile.codingProfiles.leetcode.stats?.easySolved || 0}</p>
                                <p className="text-xs text-gray-400">Easy</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-yellow-500/30">
                                <p className="text-3xl font-bold text-yellow-400">{profile.codingProfiles.leetcode.stats?.mediumSolved || 0}</p>
                                <p className="text-xs text-gray-400">Medium</p>
                            </div>
                            <div className="bg-[#2a2a2a] rounded-lg p-4 text-center border border-red-500/30">
                                <p className="text-3xl font-bold text-red-400">{profile.codingProfiles.leetcode.stats?.hardSolved || 0}</p>
                                <p className="text-xs text-gray-400">Hard</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">LeetCode account connect karo apna progress dekhne ke liye!</p>
                            <Link
                                to="/settings"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFA116] text-black font-bold rounded-xl hover:bg-[#FFB340] transition-colors"
                            >
                                Connect LeetCode
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
