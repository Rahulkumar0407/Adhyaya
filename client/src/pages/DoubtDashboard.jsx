import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle2, Brain, AlertCircle, Star, TrendingUp } from 'lucide-react';
import api from '../services/api';

const DoubtDashboard = () => {
    const [doubts, setDoubts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoubts();
    }, [filter]);

    const fetchDoubts = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await api.get('/doubts/my-doubts', { params });

            if (response.data.success) {
                setDoubts(response.data.data.doubts);
            }
        } catch (error) {
            console.error('Failed to fetch doubts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filters = [
        { id: 'all', label: 'All Doubts', icon: Brain },
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'answered', label: 'Answered', icon: CheckCircle2 },
        { id: 'resolved', label: 'Resolved', icon: Star }
    ];

    const statusConfig = {
        'pending': { color: 'amber', label: 'Waiting for Mentor' },
        'ai-reviewed': { color: 'violet', label: 'AI Reviewed' },
        'mentor-assigned': { color: 'cyan', label: 'Mentor Assigned' },
        'answered': { color: 'emerald', label: 'Answered' },
        'resolved': { color: 'green', label: 'Resolved' }
    };

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden">
            {/* Background */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">My Doubts</h1>
                        <p className="text-slate-400">Track your learning journey</p>
                    </div>
                    <Link
                        to="/doubts/ask"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Ask New Doubt
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2">
                        {filters.map(f => {
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${filter === f.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 inline mr-2" />
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>

                    <Link
                        to="/doubts/analytics"
                        className="w-full md:w-auto text-center px-6 py-3 rounded-xl bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        <TrendingUp className="w-5 h-5" />
                        View Analytics
                    </Link>
                </div>

                {/* Doubts List */}
                {loading ? (
                    <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-slate-400">Loading doubts...</p>
                    </div>
                ) : doubts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
                        <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No doubts yet</h3>
                        <p className="text-slate-400 mb-6">Start asking questions to get expert help</p>
                        <Link
                            to="/doubts/ask"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            Ask Your First Doubt
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {doubts.map(doubt => {
                            const config = statusConfig[doubt.status];
                            return (
                                <motion.div
                                    key={doubt._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Link
                                        to={`/doubts/${doubt._id}`}
                                        className="block bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{doubt.title}</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                                    <span className="px-2 py-1 rounded bg-slate-800 text-cyan-400 font-medium">
                                                        {doubt.subject}
                                                    </span>
                                                    <span>{doubt.subTopic}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(doubt.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={`px-3 py-1 rounded-full mb-2 bg-${config.color}-500/20 border border-${config.color}-500/50`}>
                                                    <span className={`text-xs font-bold text-${config.color}-400`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                {doubt.priority === 'stuck' && (
                                                    <div className="flex items-center gap-1 text-xs text-orange-400">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Priority
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {doubt.assignedMentor && (
                                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-xl">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {doubt.assignedMentor.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white">{doubt.assignedMentor.name}</p>
                                                    {doubt.mentorMatchScore && (
                                                        <p className="text-xs text-cyan-400">{doubt.mentorMatchScore}% Match</p>
                                                    )}
                                                </div>
                                                {doubt.rating && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                        <span className="text-sm font-bold text-white">{doubt.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">
                                                {doubt.actualResponseTime
                                                    ? `Responded in ${doubt.actualResponseTime} min`
                                                    : `Est. ${doubt.estimatedResponseTime} min`}
                                            </span>
                                            <span className="text-white font-bold">₹{doubt.totalPrice}</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoubtDashboard;
