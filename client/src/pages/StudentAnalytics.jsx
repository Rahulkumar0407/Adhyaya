import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Brain, Clock, Target,
    AlertCircle, CheckCircle, Star, Zap, Award
} from 'lucide-react';
import api from '../services/api';

const StudentAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/doubts/analytics/student');
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
                <Brain className="w-16 h-16 text-cyan-400 animate-pulse" />
            </div>
        );
    }

    const weakTopics = analytics?.weakTopics || [];
    const totalDoubts = analytics?.totalDoubtsAsked || 0;
    const resolvedDoubts = analytics?.resolvedDoubts || 0;
    const avgResolutionSpeed = analytics?.avgResolutionSpeed || 0;
    const totalSpent = analytics?.totalSpent || 0;

    const resolvedRate = totalDoubts > 0 ? ((resolvedDoubts / totalDoubts) * 100).toFixed(0) : 0;

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden">
            {/* Background */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-white mb-2">Your Learning Analytics</h1>
                    <p className="text-slate-400">Track your progress and identify areas for improvement</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Brain className="w-8 h-8 text-cyan-400" />
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">{totalDoubts}</p>
                        <p className="text-sm text-slate-400">Total Doubts Asked</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">{resolvedRate}%</span>
                        </div>
                        <p className="text-3xl font-black text-white mb-1">{resolvedDoubts}</p>
                        <p className="text-sm text-slate-400">Resolved</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">{avgResolutionSpeed.toFixed(0)}</p>
                        <p className="text-sm text-slate-400">Avg Response (min)</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-violet-400" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">₹{totalSpent}</p>
                        <p className="text-sm text-slate-400">Total Spent</p>
                    </motion.div>
                </div>

                {/* Weak Topics Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-1">Weak Topics Heatmap</h2>
                            <p className="text-sm text-slate-400">Areas that need more attention 🎯</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-orange-400" />
                    </div>

                    {weakTopics.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No weak topics detected yet!</p>
                            <p className="text-sm text-slate-600 mt-2">Keep learning and we'll track your progress</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {weakTopics.slice(0, 10).map((topic, idx) => {
                                const intensity = Math.min((topic.doubtCount / Math.max(...weakTopics.map(t => t.doubtCount))) * 100, 100);
                                const color =
                                    intensity > 70 ? 'red' :
                                        intensity > 40 ? 'orange' :
                                            'amber';

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white">
                                                    {topic.subject?.toUpperCase()}
                                                </span>
                                                <span className="text-sm text-slate-400">→</span>
                                                <span className="text-sm text-slate-300">{topic.subTopic}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">{topic.doubtCount} doubts</span>
                                                <span className={`text-xs font-bold text-${color}-400`}>
                                                    {intensity.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${intensity}%` }}
                                                transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
                                                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Insights & Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">Quick Insights</h3>
                        </div>
                        <ul className="space-y-3">
                            {avgResolutionSpeed < 60 && (
                                <li className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span>Great! You're getting quick responses from mentors</span>
                                </li>
                            )}
                            {resolvedRate > 80 && (
                                <li className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span>Excellent resolution rate! Keep it up</span>
                                </li>
                            )}
                            {weakTopics.length > 0 && (
                                <li className="flex items-start gap-2 text-sm text-slate-300">
                                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <span>Focus more on {weakTopics[0].subTopic} to strengthen your understanding</span>
                                </li>
                            )}
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <Star className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                                <span>Average spend: ₹{totalDoubts > 0 ? (totalSpent / totalDoubts).toFixed(0) : 0} per doubt</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-orange-400" />
                            <h3 className="text-xl font-bold text-white">Recommendations</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-orange-400 font-bold">1.</span>
                                <span>Review resolved doubts to reinforce concepts</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-orange-400 font-bold">2.</span>
                                <span>Practice more problems in weak topics</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-orange-400 font-bold">3.</span>
                                <span>Ask follow-up questions within free limit</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <span className="text-orange-400 font-bold">4.</span>
                                <span>Rate mentors to help us improve matching</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentAnalytics;
