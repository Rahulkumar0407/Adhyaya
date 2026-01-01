import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, LogIn, Crown, Target, ChevronRight, Copy, Check } from 'lucide-react';

export default function Pods() {
    const [pods, setPods] = useState([]);
    const [myPod, setMyPod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPodName, setNewPodName] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => { fetchPods(); }, []);

    const fetchPods = async () => {
        try {
            const [podsRes, myPodRes] = await Promise.all([api.get('/pods'), api.get('/pods/my')]);
            setPods(podsRes.data.data.pods);
            setMyPod(myPodRes.data.data?.pod);
        } catch (error) {
            setPods([
                { _id: '1', name: 'DSA Warriors', members: [{}, {}, {}], maxMembers: 6, inviteCode: 'ABC123' },
                { _id: '2', name: 'Pattern Masters', members: [{}, {}, {}, {}], maxMembers: 6, inviteCode: 'XYZ789' },
            ]);
        } finally { setLoading(false); }
    };

    const handleCreate = async () => {
        if (!newPodName.trim()) return;
        try {
            await api.post('/pods', { name: newPodName });
            toast.success('Pod created!');
            fetchPods();
            setShowCreate(false);
            setNewPodName('');
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to create pod'); }
    };

    const handleJoin = async (podId) => {
        try {
            await api.post(`/pods/${podId}/join`);
            toast.success('Joined pod!');
            fetchPods();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to join pod'); }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-babua-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen pt-20 pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Accountability Pods</h1>
                        <p className="text-white/60">3-6 students. Weekly goals. No toxic leaderboards.</p>
                    </div>
                    {!myPod && <button onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus className="w-4 h-4" />Create Pod</button>}
                </div>

                {myPod && (
                    <div className="card bg-gradient-to-br from-babua-primary/20 to-babua-secondary/20 border-babua-primary/30 mb-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className="badge badge-foundational mb-2">Your Pod</span>
                                <h2 className="text-2xl font-bold text-white">{myPod.name}</h2>
                            </div>
                            <button onClick={() => copyCode(myPod.inviteCode)} className="btn btn-secondary py-2 px-3 text-sm">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {myPod.inviteCode}
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-2">
                                {(myPod.members || []).slice(0, 5).map((m, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-babua-primary to-babua-secondary flex items-center justify-center text-white text-sm border-2 border-babua-darker">
                                        {m.user?.name?.charAt(0) || 'U'}
                                    </div>
                                ))}
                            </div>
                            <span className="text-white/60 text-sm">{myPod.members?.length || 0}/{myPod.maxMembers || 6} members</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-xl font-bold text-white">12</div><div className="text-xs text-white/50">Problems This Week</div></div>
                            <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-xl font-bold text-white">85%</div><div className="text-xs text-white/50">Goal Progress</div></div>
                            <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-xl font-bold text-white">#2</div><div className="text-xs text-white/50">Your Rank</div></div>
                        </div>
                    </div>
                )}

                {showCreate && (
                    <div className="card mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Pod</h3>
                        <div className="flex gap-4">
                            <input type="text" value={newPodName} onChange={(e) => setNewPodName(e.target.value)} placeholder="Pod name..." className="input flex-1" />
                            <button onClick={handleCreate} className="btn btn-primary">Create</button>
                            <button onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                )}

                {!myPod && (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Available Pods</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pods.map((pod) => (
                                <div key={pod._id} className="card card-hover">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-babua-primary/20 rounded-lg"><Users className="w-5 h-5 text-babua-primary" /></div>
                                        <div><h4 className="font-semibold text-white">{pod.name}</h4><p className="text-xs text-white/50">{pod.members?.length || 0}/{pod.maxMembers || 6} members</p></div>
                                    </div>
                                    <button onClick={() => handleJoin(pod._id)} className="btn btn-primary w-full py-2 text-sm"><LogIn className="w-4 h-4" />Join Pod</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
