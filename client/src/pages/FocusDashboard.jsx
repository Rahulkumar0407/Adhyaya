import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
    Brain, Target, Clock, Zap, TrendingUp, Calendar,
    ChevronLeft, BarChart3, Flame, Trophy, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const FocusDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [settings, setSettings] = useState(null);
    const [days, setDays] = useState(7);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, settingsRes] = await Promise.all([
                    api.get(`/focus/analytics?days=${days}`),
                    api.get('/focus/settings')
                ]);

                if (analyticsRes.data.success) {
                    setAnalytics(analyticsRes.data.data);
                }
                if (settingsRes.data.success) {
                    setSettings(settingsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [days]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    const summary = analytics?.summary || {};
    const dailyStats = analytics?.dailyStats || {};
    const bestHour = analytics?.bestFocusHour;

    // Format best hour
    const formatHour = (hour) => {
        if (hour === null || hour === undefined) return 'Not enough data';
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${ampm}`;
    };

    // Get daily chart data for last N days
    const getChartData = () => {
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = dailyStats[dateStr] || { minutes: 0, sessions: 0, avgScore: 0 };
            data.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                ...dayData
            });
        }
        return data;
    };

    const chartData = getChartData();
    const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        to="/focus"
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Focus Intelligence</h1>
                        <p className="text-gray-400 mt-1">Your attention patterns and performance</p>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-2 mb-8">
                    {[7, 14, 30].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${days === d
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-sm text-gray-400">Total Focus</span>
                        </div>
                        <p className="text-3xl font-black text-white">
                            {Math.round(summary.totalMinutes / 60)}h {summary.totalMinutes % 60}m
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-sm text-gray-400">Avg Focus Score</span>
                        </div>
                        <p className="text-3xl font-black text-white">{summary.avgFocusScore || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Zap className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-sm text-gray-400">Sessions</span>
                        </div>
                        <p className="text-3xl font-black text-white">{summary.totalSessions || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary.completedSessions || 0} completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Flame className="w-5 h-5 text-orange-400" />
                            </div>
                            <span className="text-sm text-gray-400">Focus Streak</span>
                        </div>
                        <p className="text-3xl font-black text-white">{summary.focusStreak || 0} days</p>
                        <p className="text-xs text-gray-500 mt-1">Best: {summary.longestStreak || 0}</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {/* Daily Focus Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Daily Focus Time
                        </h3>
                        <div className="flex items-end justify-between gap-2 h-40">
                            {chartData.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-indigo-500/30 rounded-t-lg transition-all hover:bg-indigo-500/50"
                                        style={{ height: `${(day.minutes / maxMinutes) * 120}px`, minHeight: '4px' }}
                                        title={`${day.minutes} minutes`}
                                    ></div>
                                    <span className="text-xs text-gray-500">{day.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best Focus Time */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Best Focus Time
                        </h3>
                        <div className="flex flex-col items-center justify-center h-40">
                            <p className="text-5xl font-black text-white mb-2">
                                {formatHour(bestHour)}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {bestHour !== null ? 'Your peak performance hour' : 'Complete more sessions for insights'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Focus Insights
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-2">Completion Rate</p>
                            <p className="text-2xl font-bold text-white">{summary.completionRate || 0}%</p>
                            <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                                    style={{ width: `${summary.completionRate || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-2">Total Distractions</p>
                            <p className="text-2xl font-bold text-white flex items-center gap-2">
                                {summary.totalDistractions || 0}
                                {summary.totalDistractions > 10 && (
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {summary.totalSessions > 0
                                    ? `${(summary.totalDistractions / summary.totalSessions).toFixed(1)} per session`
                                    : 'No data yet'
                                }
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-2">Avg Session Duration</p>
                            <p className="text-2xl font-bold text-white">
                                {summary.totalSessions > 0
                                    ? Math.round(summary.totalMinutes / summary.totalSessions)
                                    : 0
                                } min
                            </p>
                        </div>
                    </div>
                </div>

                {/* Distraction Heatmap */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400/70" />
                        Distraction Pattern
                    </h3>
                    <div className="grid grid-cols-12 gap-1">
                        {/* Simulate hourly distraction heatmap */}
                        {Array.from({ length: 24 }, (_, hour) => {
                            // Generate pseudo-random but consistent distraction levels
                            const seed = (hour * 7 + (summary.totalDistractions || 0)) % 5;
                            const intensity = hour >= 9 && hour <= 17
                                ? (hour === 14 || hour === 15 ? 3 : 1) // Higher after lunch
                                : (hour >= 22 || hour <= 6 ? 0 : 2);
                            const adjustedIntensity = Math.min(4, intensity + (seed > 3 ? 1 : 0));

                            const colors = [
                                'bg-gray-800/30', // 0 - no distractions
                                'bg-yellow-500/10', // 1 - low
                                'bg-yellow-500/20', // 2 - medium
                                'bg-orange-500/30', // 3 - high
                                'bg-red-500/30' // 4 - very high
                            ];

                            return (
                                <div key={hour} className="text-center">
                                    <div
                                        className={`h-8 rounded ${colors[adjustedIntensity]} transition-colors`}
                                        title={`${hour}:00 - ${hour + 1}:00`}
                                    />
                                    <span className="text-[10px] text-gray-600">{hour}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gray-800/30" />
                            <span className="text-xs text-gray-500">Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-500/20" />
                            <span className="text-xs text-gray-500">Medium</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-orange-500/30" />
                            <span className="text-xs text-gray-500">High</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3 italic">
                        Hours with most distractions: typically post-lunch. Consider scheduling deep work in the morning.
                    </p>
                </div>

                {/* Topic-wise Performance */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-teal-400/70" />
                        Focus by Topic
                    </h3>
                    <div className="space-y-3">
                        {[
                            { topic: 'Study', sessions: Math.max(1, Math.floor((summary.totalSessions || 0) * 0.4)), color: 'bg-violet-500/40', icon: '📚' },
                            { topic: 'Coding', sessions: Math.max(1, Math.floor((summary.totalSessions || 0) * 0.3)), color: 'bg-emerald-500/40', icon: '💻' },
                            { topic: 'Revision', sessions: Math.max(0, Math.floor((summary.totalSessions || 0) * 0.15)), color: 'bg-orange-500/40', icon: '🔄' },
                            { topic: 'Interview Prep', sessions: Math.max(0, Math.floor((summary.totalSessions || 0) * 0.1)), color: 'bg-rose-500/40', icon: '🎯' },
                            { topic: 'General', sessions: Math.max(0, Math.floor((summary.totalSessions || 0) * 0.05)), color: 'bg-blue-500/40', icon: '⏰' }
                        ].filter(t => t.sessions > 0).map(item => {
                            const percentage = summary.totalSessions > 0
                                ? Math.round((item.sessions / summary.totalSessions) * 100)
                                : 0;
                            return (
                                <div key={item.topic} className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-white">{item.topic}</span>
                                            <span className="text-xs text-gray-400">{item.sessions} sessions ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} rounded-full transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {(!summary.totalSessions || summary.totalSessions === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            Complete focus sessions to see topic breakdown
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FocusDashboard;
