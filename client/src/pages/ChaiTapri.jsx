import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { io } from 'socket.io-client';
import {
    Hash, Search, Pin, Info, Send, Paperclip, Settings,
    MessageSquare, Megaphone, Code, Server, Database, Briefcase,
    Coffee, Users, ArrowLeft, Crown, Flame, Clock, CheckCircle,
    TrendingUp, Star, Sparkles, UserCheck, Calendar, Trophy
} from 'lucide-react';
import { BabuaLeaderboard } from '../components/leaderboard';

// Mentor Circle Section Component
const MentorCircleSection = ({ onJoin, isJoining }) => {
    const mentorshipFeatures = [
        { icon: Users, text: '25 students = 1 mentor', desc: 'Small groups for personal attention' },
        { icon: MessageSquare, text: 'Daily doubt-solving & guidance', desc: 'Get help when you need it' },
        { icon: Calendar, text: '1-month mentorship cycle', desc: 'Fresh start every month' },
        { icon: Coffee, text: 'Private Chai Tapri mentor group', desc: 'Exclusive community access' },
        { icon: CheckCircle, text: 'Focus on consistency & completion', desc: 'Build lasting habits' },
    ];

    const performanceCriteria = [
        { icon: Flame, label: 'Highest learning streak', color: 'from-orange-500 to-red-500' },
        { icon: Clock, label: 'Maximum focused study time', color: 'from-blue-500 to-cyan-500' },
        { icon: CheckCircle, label: 'Maximum course completion', color: 'from-green-500 to-emerald-500' },
        { icon: TrendingUp, label: 'Overall platform activity', color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="bg-gradient-to-b from-[#1a1410] via-[#1e1814] to-[#1a1410] border-t border-amber-900/30 py-16 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/30 rounded-full px-4 py-2 mb-4">
                        <Coffee className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm font-medium">Premium Feature</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        ☕ Chai Tapri – <span className="text-amber-400">Mentor Circle</span>
                    </h2>
                    <p className="text-amber-100/60 text-lg max-w-xl mx-auto">
                        Study together. Learn faster. Stay consistent.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Left: Mentorship Model */}
                    <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 border border-amber-800/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">How It Works</h3>
                        </div>
                        <div className="space-y-4">
                            {mentorshipFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-800/50 transition-colors">
                                            <Icon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{feature.text}</p>
                                            <p className="text-amber-100/50 text-sm">{feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Pricing Card */}
                    <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 border border-amber-800/30 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Simple Pricing</h3>
                        </div>

                        {/* Price Display */}
                        <div className="bg-amber-950/50 border border-amber-800/20 rounded-xl p-6 text-center mb-6">
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-amber-400 text-2xl">₹</span>
                                <span className="text-5xl font-bold text-white">60</span>
                                <span className="text-amber-100/60 text-lg">/ month</span>
                            </div>
                            <p className="text-amber-100/50 text-sm">Less than a cutting chai per day ☕</p>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 text-amber-100/70">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>No long-term commitment</span>
                            </div>
                            <div className="flex items-center gap-3 text-amber-100/70">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>Cancel anytime, no questions</span>
                            </div>
                            <div className="flex items-center gap-3 text-amber-100/70">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>New batch starts every month</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={onJoin}
                            disabled={isJoining}
                            className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoining ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <Coffee className="w-5 h-5" />
                                    Join Mentor Circle
                                </>
                            )}
                        </button>
                        <p className="text-center text-amber-100/40 text-xs mt-3">
                            Limited seats · New batch every month
                        </p>
                    </div>
                </div>

                {/* Performance-Based Entry Section */}
                <div className="bg-gradient-to-r from-amber-900/10 via-amber-800/20 to-amber-900/10 border border-amber-800/20 rounded-2xl p-6 md:p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-4">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-medium">Free Entry Possible!</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Earn Your Spot – <span className="text-amber-400">Merit-Based Selection</span>
                        </h3>
                        <p className="text-amber-100/60 max-w-2xl mx-auto">
                            Every month, <span className="text-amber-400 font-medium">1 student gets FREE access</span> to the Mentor Circle based on their performance. Keep grinding, and you might be next!
                        </p>
                    </div>

                    {/* Criteria Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {performanceCriteria.map((criteria, index) => {
                            const Icon = criteria.icon;
                            return (
                                <div key={index} className="bg-amber-950/40 border border-amber-800/20 rounded-xl p-4 text-center hover:bg-amber-900/30 transition-colors group">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${criteria.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-white font-medium text-sm">{criteria.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-amber-100/40 text-sm mt-6">
                        🎯 Stay consistent, complete courses, and be active – you could be the next free member!
                    </p>
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-10">
                    <p className="text-amber-100/40 text-sm italic">
                        "A small paid chai with a senior who guides you every day."
                    </p>
                </div>
            </div>
        </div>
    );
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Mock channels data
const channels = {
    community: [
        { id: 'announcements', name: 'Announcements', icon: Megaphone, hasNotification: false },
        { id: 'general', name: 'General Discussion', icon: MessageSquare },
        { id: 'babua-board', name: 'Babua Board', icon: Trophy, isSpecial: true },
    ],
    learning: [
        { id: 'dsa', name: 'DSA Help', icon: Code },
        { id: 'system-design', name: 'System Design Help', icon: Server },
        { id: 'dbms', name: 'DBMS Help', icon: Database },
        { id: 'career', name: 'Career Advice', icon: Briefcase },
    ],
};

const channelDescriptions = {
    'dsa': 'Discuss Data Structures & Algorithms problems, LeetCode solutions, and optimization.',
    'system-design': 'Share system design concepts, architecture patterns, and interview prep.',
    'dbms': 'Database design, SQL queries, normalization, and more.',
    'career': 'Interview tips, resume reviews, and career guidance.',
    'announcements': 'Important updates from the ADHYAYA team.',
    'general': 'Off-topic discussions, introductions, and community bonding.',
};

// Avatar colors based on user name
const getAvatarColor = (name) => {
    const colors = [
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-600',
        'from-pink-500 to-rose-600',
        'from-lime-500 to-green-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

// Format time for display
const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function ChaiTapri() {
    const { user, token, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showMentorCircle, setShowMentorCircle] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const messagesEndRef = useRef(null);

    const userName = user?.name || 'Guest';
    const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Get active channel info
    const getActiveChannelInfo = () => {
        for (const category of Object.values(channels)) {
            const found = category.find(c => c.id === activeChannel);
            if (found) return found;
        }
        return channels.learning[0];
    };

    const channelInfo = getActiveChannelInfo();

    // Initialize Socket.io
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            newSocket.emit('join-chat', activeChannel);
        });

        newSocket.on('new-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        newSocket.on('user-joined', ({ count }) => {
            setOnlineCount(count);
        });

        newSocket.on('user-left', ({ count }) => {
            setOnlineCount(count);
        });

        // Listen for new announcements in real-time
        newSocket.on('announcement:new', (announcement) => {
            setAnnouncements(prev => [announcement, ...prev]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave-chat', activeChannel);
            newSocket.disconnect();
        };
    }, []);

    // Change channel
    useEffect(() => {
        if (socket) {
            // Leave old channel and join new
            socket.emit('leave-chat', activeChannel);
            socket.emit('join-chat', activeChannel);
        }
        // Fetch announcements or messages based on channel
        if (activeChannel === 'announcements') {
            fetchAnnouncements();
        } else {
            fetchMessages();
        }
    }, [activeChannel, socket]);

    // Fetch messages from API
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/chat/${activeChannel}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch announcements from public API
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get('/public/announcements');
            if (response.data.success) {
                setAnnouncements(response.data.announcements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!message.trim() || !token) return;

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channel: activeChannel,
                    content: message.trim()
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoinMentorCircle = async () => {
        if (!user) {
            toast.error('Please login to join Mentor Circle');
            navigate('/login');
            return;
        }

        /* Check if already subscribed */
        if (user.mentorCircleSubscription?.plan === 'premium') {
            toast.success('You are already a member!');
            return;
        }

        setIsJoining(true);
        try {
            const response = await api.post('/wallet/unlock-feature', { feature: 'mentorCircle' });
            if (response.data.success) {
                toast.success('Welcome to Mentor Circle! 🎉');
                await refreshUser();
                /* Maybe switch view or show success confetti */
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Join failed';
            if (msg.includes('Insufficient balance')) {
                toast.error('Insufficient balance! Redirecting to wallet...', { duration: 3000 });
                setTimeout(() => navigate('/wallet'), 2000);
            } else {
                toast.error(msg);
            }
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="h-screen flex" style={{ background: 'linear-gradient(135deg, #1a1410 0%, #2d241c 50%, #1a1410 100%)' }}>
            {/* Left Sidebar */}
            <div className="w-64 bg-gradient-to-b from-[#1e1814] to-[#15110e] border-r border-amber-900/30 flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-amber-900/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-white">Chai Tapri</div>
                            <div className="text-xs text-amber-600/60">Community Hub</div>
                        </div>
                    </div>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    {/* Community Section */}
                    <div className="mb-6">
                        <div className="text-xs font-bold text-amber-600/50 uppercase tracking-wider px-2 mb-2">
                            Community
                        </div>
                        {channels.community.map((channel) => {
                            const Icon = channel.icon;
                            // Handle Babua Board specially
                            if (channel.id === 'babua-board') {
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => { setShowLeaderboard(true); setShowMentorCircle(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-all group ${showLeaderboard
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'text-amber-100/60 hover:bg-amber-900/20 hover:text-amber-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm font-medium">{channel.name}</span>
                                        <Flame className={`w-3 h-3 ml-auto ${showLeaderboard ? 'text-orange-400' : 'text-orange-500/50 group-hover:text-orange-400'}`} />
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={channel.id}
                                    onClick={() => { setActiveChannel(channel.id); setShowLeaderboard(false); setShowMentorCircle(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-all ${activeChannel === channel.id && !showLeaderboard && !showMentorCircle
                                        ? 'bg-amber-600/20 text-amber-400'
                                        : 'text-amber-100/60 hover:bg-amber-900/20 hover:text-amber-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{channel.name}</span>
                                    {channel.hasNotification && (
                                        <span className="w-2 h-2 bg-amber-500 rounded-full ml-auto animate-pulse"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Learning Channels Section */}
                    <div>
                        <div className="text-xs font-bold text-amber-600/50 uppercase tracking-wider px-2 mb-2">
                            Learning Channels
                        </div>
                        {channels.learning.map((channel) => {
                            const Icon = channel.icon;
                            return (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-all ${activeChannel === channel.id
                                        ? 'bg-amber-600/20 text-amber-400 border-l-2 border-amber-500'
                                        : 'text-amber-100/60 hover:bg-amber-900/20 hover:text-amber-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{channel.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mentor Circle Link in Sidebar */}
                    <div className="mt-6 pt-4 border-t border-amber-900/30">
                        <div className="text-xs font-bold text-amber-600/50 uppercase tracking-wider px-2 mb-2">
                            Premium
                        </div>
                        <button
                            onClick={() => { setShowMentorCircle(true); setShowLeaderboard(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 transition-all group ${showMentorCircle
                                ? 'bg-yellow-500/20 text-yellow-400 border-l-2 border-yellow-500'
                                : 'text-amber-100/60 hover:bg-amber-900/20 hover:text-amber-100'
                                }`}
                        >
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Mentor Circle</span>
                            <Sparkles className={`w-3 h-3 ml-auto ${showMentorCircle ? 'text-yellow-400' : 'text-yellow-500/50 group-hover:text-yellow-400'}`} />
                        </button>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-3 border-t border-amber-900/30">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-900/20 hover:bg-amber-900/30 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(userName)} rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-amber-500/30`}>
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate">{userName}</div>
                            <div className="text-amber-600/60 text-xs">Student • Active Now</div>
                        </div>
                        <button className="text-amber-600/50 hover:text-amber-400 transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Chat, Mentor Circle, or Leaderboard */}
            <div className="flex-1 flex flex-col">
                {showLeaderboard ? (
                    /* Leaderboard View */
                    <div className="flex-1 overflow-y-auto">
                        {/* Leaderboard Header */}
                        <div className="bg-[#1e1814]/80 backdrop-blur border-b border-amber-900/30 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <div>
                                    <div className="font-bold text-white">Babua Board</div>
                                    <div className="text-amber-100/40 text-sm">See who's grinding the hardest</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to Chat</span>
                            </button>
                        </div>

                        {/* Leaderboard Content */}
                        <BabuaLeaderboard />
                    </div>
                ) : showMentorCircle ? (
                    /* Mentor Circle View */
                    <div className="flex-1 overflow-y-auto">
                        {/* Mentor Circle Header */}
                        <div className="bg-[#1e1814]/80 backdrop-blur border-b border-amber-900/30 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Crown className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <div className="font-bold text-white">Mentor Circle</div>
                                    <div className="text-amber-100/40 text-sm">Premium mentorship program</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMentorCircle(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to Chat</span>
                            </button>
                        </div>

                        {/* Mentor Circle Content */}
                        <MentorCircleSection onJoin={handleJoinMentorCircle} isJoining={isJoining} />
                    </div>
                ) : (
                    /* Chat View */
                    <>
                        {/* Channel Header */}
                        <div className="bg-[#1e1814]/80 backdrop-blur border-b border-amber-900/30 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Hash className="w-5 h-5 text-amber-400" />
                                <div>
                                    <div className="font-bold text-white">{channelInfo.name}</div>
                                    <div className="text-amber-100/40 text-sm">{channelDescriptions[activeChannel]}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-amber-600/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search in channel..."
                                        className="bg-amber-900/30 border border-amber-800/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-amber-600/40 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-48"
                                    />
                                </div>
                                <button className="text-amber-600/50 hover:text-amber-400 transition-colors p-2">
                                    <Pin className="w-5 h-5" />
                                </button>
                                <button className="text-amber-600/50 hover:text-amber-400 transition-colors p-2">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {/* Online Users Banner */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <span className="text-amber-600/50 text-sm flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
                                    {onlineCount || 1} member{onlineCount !== 1 ? 's' : ''} online
                                </span>
                            </div>

                            {/* Date Separator */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-800/30 to-transparent"></div>
                                <span className="text-amber-600/50 text-xs font-medium px-3 py-1 bg-amber-900/30 rounded-full">Today</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-800/30 to-transparent"></div>
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : activeChannel === 'announcements' ? (
                                /* Announcements View */
                                announcements.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="text-4xl mb-3">📢</div>
                                        <p className="text-amber-600/60">No announcements yet. Stay tuned!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {announcements.map((ann) => {
                                            const typeColors = {
                                                info: 'from-blue-500 to-cyan-500',
                                                warning: 'from-amber-500 to-orange-500',
                                                success: 'from-emerald-500 to-green-500',
                                                urgent: 'from-red-500 to-rose-500',
                                                maintenance: 'from-purple-500 to-violet-500'
                                            };
                                            const typeBadgeColors = {
                                                info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                                warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                                                success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                                                urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
                                                maintenance: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            };
                                            const color = typeColors[ann.type] || typeColors.info;
                                            const badgeColor = typeBadgeColors[ann.type] || typeBadgeColors.info;

                                            return (
                                                <div key={ann._id} className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-5 hover:bg-amber-900/30 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                            <Megaphone className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                <h4 className="font-bold text-white">{ann.title}</h4>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeColor} uppercase font-bold`}>
                                                                    {ann.type}
                                                                </span>
                                                                {ann.isPinned && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                                        📌 Pinned
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-amber-100/70 whitespace-pre-wrap mb-3">{ann.message}</p>
                                                            <div className="flex items-center gap-3 text-xs text-amber-600/50">
                                                                <span>By Admin</span>
                                                                <span>•</span>
                                                                <span>{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>
                                                            {ann.action?.url && (
                                                                <a
                                                                    href={ann.action.url}
                                                                    className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    {ann.action.label || 'Learn More'} →
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-3">☕</div>
                                    <p className="text-amber-600/60">No messages yet. Be the first to say hi!</p>
                                </div>
                            ) : (
                                /* Messages */
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const msgUserName = msg.user?.name || 'Anonymous';
                                        const msgInitials = msgUserName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                                        return (
                                            <div key={msg._id} className="flex gap-4 group hover:bg-amber-900/10 p-3 -mx-3 rounded-xl transition-colors">
                                                {/* Avatar */}
                                                <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(msgUserName)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                                    {msgInitials}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-white">{msgUserName}</span>
                                                        <span className="text-amber-600/40 text-xs">{formatTime(msg.createdAt)}</span>
                                                    </div>

                                                    {/* Message Content */}
                                                    <p className="text-amber-100/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                                    {/* Code Block */}
                                                    {msg.code && msg.code.content && (
                                                        <div className="mt-3 bg-[#0d0a08] rounded-xl border border-amber-900/30 overflow-hidden">
                                                            <div className="flex items-center justify-between px-4 py-2 border-b border-amber-900/30 bg-amber-900/10">
                                                                <span className="text-amber-500 text-xs font-medium">{msg.code.language || 'code'}</span>
                                                            </div>
                                                            <pre className="p-4 text-sm overflow-x-auto">
                                                                <code className="text-amber-100/70 font-mono">{msg.code.content}</code>
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input - Hidden for announcements channel */}
                        {activeChannel === 'announcements' ? (
                            <div className="bg-[#1e1814]/80 backdrop-blur border-t border-amber-900/30 px-6 py-4">
                                <div className="max-w-4xl mx-auto text-center">
                                    <p className="text-amber-600/50 text-sm">
                                        📢 This is a read-only channel for official announcements from the ADHYAYA team.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#1e1814]/80 backdrop-blur border-t border-amber-900/30 px-6 py-4">
                                <div className="max-w-4xl mx-auto">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={token ? "Ask a question or help someone..." : "Login to send messages"}
                                            disabled={!token}
                                            className="w-full bg-amber-900/20 border border-amber-800/30 rounded-xl pl-4 pr-24 py-4 text-white placeholder-amber-600/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600/50 transition-all disabled:opacity-50"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button className="text-amber-600/50 hover:text-amber-400 p-2 transition-colors">
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={sendMessage}
                                                disabled={!token || !message.trim()}
                                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-2.5 rounded-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-amber-600/40 text-xs mt-2 px-1">
                                        <span className="text-amber-500">Enter</span> to send. <span className="text-amber-500">Shift + Enter</span> for new line. Markdown supported.
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Back to Dashboard Button */}
            <Link
                to="/dashboard"
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 transition-all z-50 group"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
