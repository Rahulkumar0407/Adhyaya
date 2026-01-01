import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Clock, Users,
    Star, Award, Zap, Activity, Calendar
} from 'lucide-react';
import api from '../services/api';

const MentorAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // week, month, all

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            // In a real app, passing timeRange would filter backend data
            const response = await api.get('/doubts/analytics/mentor');
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Activity className="w-16 h-16 text-orange-400 animate-pulse" />
            </div>
        );
    }

    const earnings = analytics?.earnings || { total: 0, thisMonth: 0 };
    const performance = analytics?.performance || { avgResponseTime: 0, resolutionRate: 0, avgRating: 0 };
    const topicStats = analytics?.topicStats || [];
    const recentActivity = analytics?.recentActivity || []; // Placeholder if not in backend yet

    return (
        <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 mb-2">Mentor Analytics</h1>
                        <p className="text-slate-400 font-medium">Track your impact, earnings, and performance</p>
                    </motion.div>

                    <div className="flex bg-slate-900/60 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                        {['week', 'month', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${timeRange === range
                                    ? 'bg-gradient-to-r from-indigo-600 to-rose-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="w-20 h-20 text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-indigo-400" />
                            </div>
                            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">+12% growth</span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">₹{earnings.total}</p>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Total Revenue</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-rose-500/5 to-pink-500/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star className="w-20 h-20 text-rose-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-500/10 rounded-2xl">
                                <Star className="w-6 h-6 text-rose-400" />
                            </div>
                            <span className="text-rose-400 font-black text-[10px] uppercase tracking-widest">{performance.avgRating} Rating</span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">Expert</p>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Mentor Status</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <Clock className="w-6 h-6 text-slate-300" />
                            </div>
                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Fastest response</span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">{performance.avgResponseTime}m</p>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Avg Response</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <Activity className="w-6 h-6 text-slate-300" />
                            </div>
                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{performance.resolutionRate}% Rate</span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">{analytics?.totalDoubtsResolved || 0}</p>
                        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Closed Cases</p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Topic Performance */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Award className="w-6 h-6 text-indigo-400" />
                            Expertise Distribution
                        </h2>

                        <div className="space-y-8">
                            {topicStats.length === 0 ? (
                                <p className="text-slate-500 text-center py-12 font-medium">No activity data yet.</p>
                            ) : topicStats.map((topic, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs mb-3 font-black uppercase tracking-widest">
                                        <span className="text-slate-300">{topic.subTopic}</span>
                                        <span className="text-indigo-400">{topic.count} resolved</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(topic.count / Math.max(...topicStats.map(t => t.count))) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (idx * 0.1) }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Earnings Trend */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-rose-400" />
                            Revenue Momentum
                        </h2>

                        <div className="flex items-end justify-between h-48 gap-3 mb-6 px-2">
                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/5 rounded-2xl relative group overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1.2, ease: "backOut", delay: 0.7 + (i * 0.1) }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-2xl group-hover:from-rose-500 group-hover:to-rose-300 transition-all opacity-80"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 px-2 font-black uppercase tracking-[0.2em]">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>

                        <div className="mt-10 p-6 bg-indigo-500/10 rounded-[1.5rem] border border-indigo-500/20 shadow-inner">
                            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Optimization Tip
                            </h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Demand peaks on weekends between <span className="text-white">6 PM - 10 PM</span>. Online mentors during these hours see 2x revenue.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MentorAnalytics;
