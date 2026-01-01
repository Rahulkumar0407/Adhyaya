import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, CheckCircle2, AlertCircle, ChevronRight, Calendar, RefreshCw, Trophy } from 'lucide-react';

export default function Revisions() {
    const [revisions, setRevisions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('due');

    useEffect(() => { fetchRevisions(); }, []);

    const fetchRevisions = async () => {
        try {
            const [revisionsRes, statsRes] = await Promise.all([api.get('/revisions'), api.get('/revisions/stats')]);
            setRevisions(revisionsRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            setRevisions([
                { _id: '1', problem: { title: 'Two Sum II', slug: 'two-sum-sorted', difficulty: 'medium' }, pattern: { name: 'Two Pointers', slug: 'two-pointers-opposite' }, currentPhase: 3, day1: { completed: true }, day3: { date: new Date(), completed: false }, day7: { date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), completed: false }, day30: { date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), completed: false }, masteryLevel: 'learning' },
                { _id: '2', problem: { title: 'Container With Most Water', slug: 'container-most-water', difficulty: 'medium' }, pattern: { name: 'Two Pointers' }, currentPhase: 7, day1: { completed: true }, day3: { completed: true }, day7: { date: new Date(), completed: false }, day30: { completed: false }, masteryLevel: 'practicing' },
            ]);
            setStats({ total: 15, completed: 8, due: 2, adherenceRate: 73, mastery: { learning: 4, practicing: 5, mastering: 3, mastered: 3 } });
        } finally { setLoading(false); }
    };

    const getDue = () => revisions.filter(r => !r.isFullyCompleted && ((r.currentPhase === 3 && !r.day3?.completed) || (r.currentPhase === 7 && !r.day7?.completed) || (r.currentPhase === 30 && !r.day30?.completed)));

    if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-babua-primary border-t-transparent rounded-full animate-spin" /></div>;

    const dueRevisions = getDue();

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Revision Schedule</h1>
                    <p className="text-white/60">Babua Protocol: Day 1 → Day 3 → Day 7 → Day 30</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-amber-500/20 rounded-lg"><AlertCircle className="w-5 h-5 text-amber-400" /></div><div><div className="text-2xl font-bold text-white">{stats.due}</div><div className="text-xs text-white/50">Due Now</div></div></div></div>
                        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg"><RefreshCw className="w-5 h-5 text-purple-400" /></div><div><div className="text-2xl font-bold text-white">{stats.total}</div><div className="text-xs text-white/50">Total</div></div></div></div>
                        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div><div><div className="text-2xl font-bold text-white">{stats.adherenceRate}%</div><div className="text-xs text-white/50">Adherence</div></div></div></div>
                        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-lg"><Trophy className="w-5 h-5 text-yellow-400" /></div><div><div className="text-2xl font-bold text-white">{stats.mastery?.mastered || 0}</div><div className="text-xs text-white/50">Mastered</div></div></div></div>
                    </div>
                )}

                <div className="space-y-4">
                    {dueRevisions.length > 0 ? dueRevisions.map((rev) => (
                        <div key={rev._id} className="card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-500/20 rounded-xl"><Clock className="w-6 h-6 text-cyan-400" /></div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1"><span className="badge badge-cyan">Day {rev.currentPhase}</span><span className={`badge badge-${rev.problem?.difficulty}`}>{rev.problem?.difficulty}</span></div>
                                        <h3 className="text-lg font-semibold text-white">{rev.problem?.title}</h3>
                                        <p className="text-sm text-white/50">{rev.pattern?.name}</p>
                                    </div>
                                </div>
                                <Link to={`/problems/${rev.problem?.slug}`} className="btn btn-primary py-2 px-4">Start <ChevronRight className="w-4 h-4" /></Link>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full ${rev.day1?.completed ? 'bg-babua-success' : 'bg-white/20'}`}></span><span className="text-xs text-white/50">D1</span>
                                <div className="flex-1 h-0.5 bg-white/10" />
                                <span className={`w-4 h-4 rounded-full ${rev.day3?.completed ? 'bg-babua-success' : rev.currentPhase === 3 ? 'bg-babua-primary animate-pulse' : 'bg-white/20'}`}></span><span className="text-xs text-white/50">D3</span>
                                <div className="flex-1 h-0.5 bg-white/10" />
                                <span className={`w-4 h-4 rounded-full ${rev.day7?.completed ? 'bg-babua-success' : rev.currentPhase === 7 ? 'bg-babua-primary animate-pulse' : 'bg-white/20'}`}></span><span className="text-xs text-white/50">D7</span>
                                <div className="flex-1 h-0.5 bg-white/10" />
                                <span className={`w-4 h-4 rounded-full ${rev.day30?.completed ? 'bg-babua-success' : rev.currentPhase === 30 ? 'bg-babua-primary animate-pulse' : 'bg-white/20'}`}></span><span className="text-xs text-white/50">D30</span>
                            </div>
                        </div>
                    )) : (
                        <div className="card text-center py-12"><CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-4" /><h3 className="text-lg font-medium text-white mb-2">All caught up!</h3><p className="text-white/50">No revisions due right now.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}
