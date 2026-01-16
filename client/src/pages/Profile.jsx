import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { useRef } from 'react';
import UserProfileDropdown from '../components/common/UserProfileDropdown';
import {
    Edit3, Linkedin, Github, Globe, MapPin,
    GraduationCap, Flame, ClipboardCheck,
    Home, Bell, LogOut, Trophy, Calendar, Sparkles, Mic,
    Target, Zap, Award, TrendingUp, Star, Code, Crown, RotateCcw, MessageCircle
} from 'lucide-react';

// Animated 3D Background
function AnimatedBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating geometric shapes
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
        ];

        const colors = [0xf97316, 0xfbbf24, 0xef4444, 0x8b5cf6];

        for (let i = 0; i < 15; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: colors[i % colors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.1 + Math.random() * 0.1,
            });
            const mesh = new THREE.Mesh(geometry, material);

            const side = i % 2 === 0 ? -1 : 1;
            mesh.position.x = side * (20 + Math.random() * 25);
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 20 - 10;

            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                rotationSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 },
                floatSpeed: Math.random() * 0.3 + 0.1,
                floatOffset: Math.random() * Math.PI * 2,
            };

            shapes.push(mesh);
            scene.add(mesh);
        }

        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            shapes.forEach((shape) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
            });

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// Nav items
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mock Interview', href: '/mock-interview', icon: Mic },
    { name: 'Revision', href: '/revision', icon: RotateCcw },
    { name: 'Rewards', href: '/how-to-earn', icon: Trophy },
    { name: 'Connect', href: '/mentors', icon: MessageCircle },
];

// LeetCode Integration Section Component
function LeetCodeSection({ profile, token, API_URL, onProfileUpdate }) {
    const [syncing, setSyncing] = useState(false);
    const [linking, setLinking] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSync = async () => {
        setSyncing(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/profile/leetcode/sync`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                // Update profile with new stats
                onProfileUpdate(prev => ({
                    ...prev,
                    codingProfiles: {
                        ...prev.codingProfiles,
                        leetcode: data.data
                    }
                }));
            } else {
                setError(data.message || 'Sync failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const handleLink = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLinking(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/profile/leetcode/link`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username.trim() })
            });
            const data = await res.json();
            if (data.success) {
                onProfileUpdate(prev => ({
                    ...prev,
                    codingProfiles: {
                        ...prev.codingProfiles,
                        leetcode: data.data
                    }
                }));
                setShowLinkModal(false);
                setUsername('');
            } else {
                setError(data.message || 'Failed to link account');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLinking(false);
        }
    };

    const handleUnlink = async () => {
        if (!window.confirm('Are you sure you want to unlink your LeetCode account?')) return;

        try {
            const res = await fetch(`${API_URL}/profile/leetcode/unlink`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                onProfileUpdate(prev => ({
                    ...prev,
                    codingProfiles: {
                        ...prev.codingProfiles,
                        leetcode: null
                    }
                }));
            }
        } catch (err) {
            console.error('Unlink error:', err);
        }
    };

    const leetcode = profile?.codingProfiles?.leetcode;
    const isLinked = leetcode?.verified;

    return (
        <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-6 border border-orange-900/30">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFA116] rounded-xl flex items-center justify-center shadow-lg">
                        <Code className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">LeetCode Integration</h2>
                        <p className="text-xs text-orange-100/40">
                            {isLinked ? `@${leetcode.username}` : 'Sync your LeetCode progress'}
                        </p>
                    </div>
                </div>

                {isLinked && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FFA116]/20 hover:bg-[#FFA116]/30 border border-[#FFA116]/30 rounded-xl text-[#FFA116] text-sm font-medium transition-all disabled:opacity-50"
                        >
                            <RotateCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-orange-100/60 text-sm font-medium transition-all"
                        >
                            Change Account
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {isLinked ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-orange-950/30 rounded-xl p-4 text-center border border-orange-900/30">
                            <p className="text-3xl font-bold text-white">{leetcode.stats?.totalSolved || 0}</p>
                            <p className="text-xs text-orange-100/50">Total Solved</p>
                        </div>
                        <div className="bg-orange-950/30 rounded-xl p-4 text-center border border-green-500/20">
                            <p className="text-3xl font-bold text-green-400">{leetcode.stats?.easySolved || 0}</p>
                            <p className="text-xs text-orange-100/50">Easy</p>
                        </div>
                        <div className="bg-orange-950/30 rounded-xl p-4 text-center border border-yellow-500/20">
                            <p className="text-3xl font-bold text-yellow-400">{leetcode.stats?.mediumSolved || 0}</p>
                            <p className="text-xs text-orange-100/50">Medium</p>
                        </div>
                        <div className="bg-orange-950/30 rounded-xl p-4 text-center border border-red-500/20">
                            <p className="text-3xl font-bold text-red-400">{leetcode.stats?.hardSolved || 0}</p>
                            <p className="text-xs text-orange-100/50">Hard</p>
                        </div>
                    </div>
                    {leetcode.lastSynced && (
                        <p className="mt-4 text-xs text-orange-100/30 text-right">
                            Last synced: {new Date(leetcode.lastSynced).toLocaleString()}
                        </p>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔗</div>
                    <p className="text-orange-100/50 mb-4">LeetCode account connect karo apna progress dekhne ke liye!</p>
                    <button
                        onClick={() => setShowLinkModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFA116] text-black font-bold rounded-xl hover:bg-[#FFB340] transition-colors hover:scale-105"
                    >
                        Connect LeetCode
                    </button>
                </div>
            )}

            {/* Link/Change Account Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1008] border border-orange-900/50 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {isLinked ? 'Change LeetCode Account' : 'Connect LeetCode'}
                        </h3>
                        <p className="text-sm text-orange-100/50 mb-6">
                            Enter your LeetCode username to sync your progress instantly.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLink}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="LeetCode username"
                                className="w-full px-4 py-3 bg-orange-950/30 border border-orange-900/50 rounded-xl text-white placeholder:text-orange-100/30 focus:outline-none focus:border-[#FFA116]/50 mb-4"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowLinkModal(false); setError(''); setUsername(''); }}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-orange-100/60 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={linking || !username.trim()}
                                    className="flex-1 py-3 bg-[#FFA116] hover:bg-[#FFB340] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {linking ? 'Linking...' : 'Link Account'}
                                </button>
                            </div>
                        </form>

                        {isLinked && (
                            <button
                                onClick={handleUnlink}
                                className="w-full mt-4 py-2 text-red-400 text-sm hover:text-red-300 transition-colors"
                            >
                                Unlink current account
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Profile() {
    const { user, token, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityData, setActivityData] = useState({});
    const [activityStats, setActivityStats] = useState({
        totalSubmissions: 0,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProfile();
        fetchActivityCalendar();
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

    const fetchActivityCalendar = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/activity/calendar`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setActivityData(data.data.activities || {});
                setActivityStats(data.data.stats || {
                    totalSubmissions: 0,
                    activeDays: 0,
                    currentStreak: 0,
                    longestStreak: 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch activity calendar:', error);
        }
    };

    // Generate calendar grid for the past year
    const calendarData = useMemo(() => {
        const data = [];
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const startDate = new Date(oneYearAgo);
        const day = oneYearAgo.getDay();
        const diff = (day === 0 ? 6 : day - 1); // Adjust to start on Monday
        startDate.setDate(oneYearAgo.getDate() - diff);

        const currentDate = new Date(startDate);

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = activityData[dateStr] || 0;

            let intensity = 0;
            if (count > 0) {
                if (count === 1) intensity = 1;
                else if (count <= 3) intensity = 2;
                else if (count <= 6) intensity = 3;
                else intensity = 4;
            }

            data.push({ date: new Date(currentDate), dateStr, count, intensity });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return data;
    }, [activityData]);

    const weeks = useMemo(() => {
        const result = [];
        let week = [];

        for (let i = 0; i < calendarData.length; i++) {
            week.push(calendarData[i]);
            if (week.length === 7) {
                result.push(week);
                week = [];
            }
        }
        if (week.length > 0) result.push(week);

        return result;
    }, [calendarData]);

    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const firstDay = week[0];
            if (firstDay && firstDay.date.getMonth() !== lastMonth) {
                labels.push({
                    month: firstDay.date.toLocaleString('default', { month: 'short' }),
                    weekIndex
                });
                lastMonth = firstDay.date.getMonth();
            }
        });

        // If the first two labels are too close (e.g., Dec and Jan overlapping), 
        // remove the first one to keep it clean.
        if (labels.length >= 2 && labels[1].weekIndex - labels[0].weekIndex < 3) {
            return labels.slice(1);
        }

        return labels;
    }, [weeks]);

    const getIntensityColor = (intensity) => {
        switch (intensity) {
            case 0: return 'bg-orange-950/30';
            case 1: return 'bg-orange-800/50';
            case 2: return 'bg-orange-600/60';
            case 3: return 'bg-orange-500/80';
            case 4: return 'bg-orange-400';
            default: return 'bg-orange-950/30';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">☕</div>
                </div>
            </div>
        );
    }

    const userName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Babua';
    const userPoints = profile?.points || 0;
    const userLevel = profile?.level || 1;

    // Level progress calculation
    const levelThresholds = [0, 100, 300, 600, 1000, 2000];
    const currentLevelMin = levelThresholds[Math.min(userLevel - 1, levelThresholds.length - 1)] || 0;
    const nextLevelMin = levelThresholds[Math.min(userLevel, levelThresholds.length - 1)] || 2000;
    const levelProgress = Math.min(100, ((userPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100);

    const levelNames = ['Naya Babua', 'Padhai Shuru', 'DSA Explorer', 'Code Warrior', 'Offer Collector', 'Babua Legend'];
    const levelEmojis = ['🐣', '📚', '🔍', '⚔️', '💼', '👑'];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0a06 0%, #1a1008 50%, #0f0a06 100%)' }}>
            <AnimatedBackground />

            {/* Ambient Orbs */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>



            <main className="relative z-10 container mx-auto px-4 py-8">
                {/* Hero Profile Card */}
                <div className="relative mb-8">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 rounded-3xl blur-xl"></div>

                    <div className="relative bg-gradient-to-br from-orange-950/40 to-[#0f0a06]/60 backdrop-blur rounded-3xl border border-orange-800/30 overflow-hidden">
                        {/* Banner */}
                        <div className="h-32 bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-orange-600/30 relative">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bS0zMCAzMHY2aDZ2LTZoLTZ6bTAgLTMwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
                            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-300/30" />
                        </div>

                        <div className="px-8 pb-8">
                            {/* Avatar */}
                            <div className="relative -mt-16 mb-6 flex items-end gap-6">
                                <div className="relative group">
                                    {/* Outer Glow/Ring */}
                                    <div className="absolute -inset-1.5 bg-gradient-to-br from-orange-500/20 via-amber-400/20 to-orange-600/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>

                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 p-1.5 shadow-2xl shadow-orange-500/40 relative z-10">
                                        <div className="w-full h-full rounded-full bg-[#0f0a06] flex items-center justify-center overflow-hidden border-2 border-orange-950/50">
                                            {profile?.avatar ? (
                                                <img src={profile.avatar} alt={profile?.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-5xl font-bold bg-gradient-to-br from-orange-400 to-amber-500 bg-clip-text text-transparent">
                                                    {profile?.name?.charAt(0) || 'B'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Level Badge */}
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-lg shadow-lg border-4 border-[#0f0a06]">
                                        {levelEmojis[Math.min(userLevel - 1, 5)]}
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{profile?.name || 'Babua'}</h1>
                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Level {userLevel}
                                        </span>
                                    </div>
                                    <p className="text-orange-100/50 text-sm mb-3">{profile?.email}</p>
                                    <p className="text-orange-100/70">{profile?.bio || '✨ Apna bio add karo - Settings mein jao!'}</p>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to="/settings"
                                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </Link>
                                    <button
                                        onClick={() => { logout(); window.location.href = '/'; }}
                                        className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 transition-all flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Social & Info */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                {profile?.location && (
                                    <span className="flex items-center gap-1.5 text-sm text-orange-100/50 bg-orange-900/20 px-3 py-1.5 rounded-full">
                                        <MapPin className="w-3.5 h-3.5" /> {profile.location}
                                    </span>
                                )}
                                {profile?.college && (
                                    <span className="flex items-center gap-1.5 text-sm text-orange-100/50 bg-orange-900/20 px-3 py-1.5 rounded-full">
                                        <GraduationCap className="w-3.5 h-3.5" /> {profile.college}
                                    </span>
                                )}
                                <div className="flex items-center gap-2">
                                    {profile?.socialLinks?.linkedin && (
                                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.socialLinks?.github && (
                                        <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-500/30 transition-colors">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.socialLinks?.portfolio && (
                                        <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Level Progress */}
                            <div className="bg-orange-950/30 rounded-2xl p-4 border border-orange-900/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-orange-100/50 text-sm">Level Progress</span>
                                    <span className="text-orange-400 text-sm font-medium">{levelNames[Math.min(userLevel - 1, 5)]}</span>
                                </div>
                                <div className="h-3 bg-orange-950/50 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${levelProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-orange-100/40">
                                    <span>{userPoints} points</span>
                                    <span>{nextLevelMin} points for next level</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-900/30 group hover:border-cyan-500/50 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{activityStats.currentStreak || profile?.streakCount || 0}</div>
                        <div className="text-orange-100/50 text-sm">Day Streak 🔥</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-900/30 group hover:border-purple-500/50 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{userPoints}</div>
                        <div className="text-orange-100/50 text-sm">Babua Coins 💰</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-900/30 group hover:border-purple-500/50 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{profile?.quizzesTaken || 0}</div>
                        <div className="text-orange-100/50 text-sm">Quiz Taken 📝</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-5 border border-orange-900/30 group hover:border-cyan-500/50 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{activityStats.longestStreak || 0}</div>
                        <div className="text-orange-100/50 text-sm">Best Streak 🏆</div>
                    </div>
                </div>

                {/* Activity Calendar */}
                <div className="bg-gradient-to-br from-orange-950/40 to-transparent backdrop-blur rounded-2xl p-6 border border-orange-900/30 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-orange-400">{activityStats.totalSubmissions}</span>
                                    <span className="text-orange-100/50 font-normal text-sm">submissions in past year</span>
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-orange-100/50">
                            <span>Active: <span className="text-white font-medium">{activityStats.activeDays}</span> days</span>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="overflow-x-auto pb-2">
                        <div className="min-w-[750px]">
                            {/* Month Labels */}
                            <div className="relative h-6 mb-2 ml-8">
                                {monthLabels.map((label, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-xs text-orange-100/40 whitespace-nowrap"
                                        style={{ left: `${label.weekIndex * 14}px` }}
                                    >
                                        {label.month}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-1">
                                <div className="flex flex-col gap-1 mr-2 text-[10px] text-orange-100/30">
                                    <div className="h-[10px] flex items-center">Mon</div>
                                    <div className="h-[10px] flex items-center">Tue</div>
                                    <div className="h-[10px] flex items-center">Wed</div>
                                    <div className="h-[10px] flex items-center">Thu</div>
                                    <div className="h-[10px] flex items-center">Fri</div>
                                    <div className="h-[10px] flex items-center">Sat</div>
                                    <div className="h-[10px] flex items-center">Sun</div>
                                </div>

                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-1">
                                        {week.map((day, dayIndex) => (
                                            <div
                                                key={dayIndex}
                                                className={`w-[10px] h-[10px] rounded-sm ${getIntensityColor(day.intensity)} hover:ring-1 hover:ring-orange-400 transition-all cursor-pointer`}
                                                title={`${day.date.toDateString()}: ${day.count} activities`}
                                            ></div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-orange-100/40">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="w-[10px] h-[10px] rounded-sm bg-orange-950/30"></div>
                                    <div className="w-[10px] h-[10px] rounded-sm bg-orange-800/50"></div>
                                    <div className="w-[10px] h-[10px] rounded-sm bg-orange-600/60"></div>
                                    <div className="w-[10px] h-[10px] rounded-sm bg-orange-500/80"></div>
                                    <div className="w-[10px] h-[10px] rounded-sm bg-orange-400"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LeetCode Integration */}
                <LeetCodeSection
                    profile={profile}
                    token={token}
                    API_URL={API_URL}
                    onProfileUpdate={setProfile}
                />
            </main>
        </div>
    );
}
