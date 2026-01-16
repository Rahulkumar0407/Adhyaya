import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    ArrowLeft, Calendar, Clock, Target, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, ChevronRight, Brain, Users, Zap,
    BarChart3, Award, BookOpen, RefreshCw
} from 'lucide-react';

// Interview type icons
const typeIcons = {
    hr: Users,
    dsa: Brain,
    coding: Zap,
    'system-design': Target
};

// Interview type colors
const typeColors = {
    hr: 'from-pink-500 to-rose-500',
    dsa: 'from-cyan-500 to-blue-500',
    coding: 'from-amber-500 to-orange-500',
    'system-design': 'from-purple-500 to-pink-500'
};

export default function InterviewHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [weakPoints, setWeakPoints] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const response = await api.get('/interview/history');
            if (response.data.success) {
                const fetchedInterviews = response.data.data.interviews || [];
                setInterviews(fetchedInterviews);
                calculateWeakPoints(fetchedInterviews);
            }
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
            // Try localStorage fallback
            const cached = localStorage.getItem('interview_history');
            if (cached) {
                const parsed = JSON.parse(cached);
                setInterviews(parsed);
                calculateWeakPoints(parsed);
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateWeakPoints = (interviewsData) => {
        const wpMap = {};

        interviewsData.forEach(interview => {
            // Aggregate weak points
            if (interview.weakPoints && Array.isArray(interview.weakPoints)) {
                interview.weakPoints.forEach(wp => {
                    const key = wp.trim();
                    if (!wpMap[key]) {
                        wpMap[key] = { topic: key, count: 0, lastSeen: interview.createdAt, improving: false };
                    }
                    wpMap[key].count++;
                    if (new Date(interview.createdAt) > new Date(wpMap[key].lastSeen)) {
                        wpMap[key].lastSeen = interview.createdAt;
                    }
                });
            }

            // Check if any weak point is now in strengths (improving)
            if (interview.strengths && Array.isArray(interview.strengths)) {
                interview.strengths.forEach(s => {
                    const key = s.trim();
                    if (wpMap[key]) {
                        wpMap[key].improving = true;
                    }
                });
            }
        });

        // Convert to array and sort by count
        const sortedWp = Object.values(wpMap).sort((a, b) => b.count - a.count);
        setWeakPoints(sortedWp);
    };

    const filteredInterviews = filter === 'all'
        ? interviews
        : interviews.filter(i => i.interviewType === filter);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
        if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your interview history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/mock-interview')}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black">Interview History</h1>
                                <p className="text-slate-400 text-sm">{interviews.length} sessions completed</p>
                            </div>
                        </div>
                        <Link
                            to="/mock-interview"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            New Interview
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Weak Points */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Weak Points Card */}
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    Weak Points
                                </h2>
                                <button
                                    onClick={fetchInterviews}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            {weakPoints.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-slate-400">No weak points identified yet!</p>
                                    <p className="text-slate-500 text-sm mt-1">Complete more interviews to get insights</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {weakPoints.slice(0, 8).map((wp, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border transition-all ${wp.improving
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-red-500/10 border-red-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">{wp.topic}</span>
                                                {wp.improving ? (
                                                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Improving
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-400 text-xs">
                                                        <TrendingDown className="w-3 h-3" />
                                                        Needs work
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                                                <span>Appeared {wp.count}x</span>
                                                <Link
                                                    to={`/dsa`}
                                                    className="text-cyan-400 hover:underline"
                                                >
                                                    Practice →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-cyan-400" />
                                Quick Stats
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Total Interviews</span>
                                    <span className="font-black text-xl">{interviews.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Average Score</span>
                                    <span className={`font-black text-xl ${getScoreColor(
                                        Math.round(interviews.reduce((a, b) => a + (b.overallScore || 0), 0) / Math.max(interviews.length, 1))
                                    )}`}>
                                        {Math.round(interviews.reduce((a, b) => a + (b.overallScore || 0), 0) / Math.max(interviews.length, 1))}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Best Score</span>
                                    <span className="font-black text-xl text-emerald-400">
                                        {Math.max(...interviews.map(i => i.overallScore || 0), 0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Interview List */}
                    <div className="lg:col-span-2">
                        {/* Filters */}
                        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
                            {['all', 'hr', 'dsa', 'coding', 'system-design'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${filter === type
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {type === 'all' ? 'All' : type.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Interview List */}
                        {filteredInterviews.length === 0 ? (
                            <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
                                <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
                                <p className="text-slate-400 mb-6">Start practicing to see your history here</p>
                                <Link
                                    to="/mock-interview"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold"
                                >
                                    Start Interview
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredInterviews.map((interview, idx) => {
                                    const Icon = typeIcons[interview.interviewType] || Brain;
                                    const color = typeColors[interview.interviewType] || 'from-cyan-500 to-blue-500';

                                    return (
                                        <div
                                            key={interview._id || idx}
                                            onClick={() => setSelectedInterview(selectedInterview === idx ? null : idx)}
                                            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center`}>
                                                            <Icon className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">
                                                                {interview.interviewType?.toUpperCase() || 'Interview'}
                                                                {interview.customRole && ` - ${interview.customRole}`}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(interview.createdAt).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {Math.round((interview.timeTaken || 0) / 60)} min
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-xl border font-black text-2xl ${getScoreBg(interview.overallScore)}`}>
                                                        <span className={getScoreColor(interview.overallScore)}>
                                                            {interview.overallScore || 0}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {selectedInterview === idx && (
                                                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {/* Strengths */}
                                                            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                                                <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Strengths
                                                                </h4>
                                                                <ul className="space-y-1">
                                                                    {(interview.strengths || []).slice(0, 4).map((s, i) => (
                                                                        <li key={i} className="text-sm text-slate-300">• {s}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Weak Points */}
                                                            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                                                                <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                                                                    <AlertTriangle className="w-4 h-4" />
                                                                    Areas to Improve
                                                                </h4>
                                                                <ul className="space-y-1">
                                                                    {(interview.weakPoints || []).slice(0, 4).map((w, i) => (
                                                                        <li key={i} className="text-sm text-slate-300">• {w}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        {/* Suggestions */}
                                                        {interview.suggestions && interview.suggestions.length > 0 && (
                                                            <div className="mt-4 bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                                                                <h4 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                                                    <BookOpen className="w-4 h-4" />
                                                                    Suggestions
                                                                </h4>
                                                                <ul className="space-y-1">
                                                                    {interview.suggestions.slice(0, 3).map((s, i) => (
                                                                        <li key={i} className="text-sm text-slate-300">• {s}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
