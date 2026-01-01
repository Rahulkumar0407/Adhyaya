import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Edit3, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PendingCallsManager = () => {
    const [pendingCalls, setPendingCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [newDuration, setNewDuration] = useState(30);

    const durationOptions = [5, 10, 15, 30, 45, 60, 90, 120];

    useEffect(() => {
        fetchPendingCalls();
    }, []);

    const fetchPendingCalls = async () => {
        try {
            const response = await api.get('/calls/mentor/pending');
            if (response.data.success) {
                setPendingCalls(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pending calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModifyDuration = async (callId) => {
        try {
            const response = await api.patch(`/calls/${callId}/modify-duration`, {
                newDuration
            });
            if (response.data.success) {
                toast.success(`Duration updated to ${newDuration} mins`);
                setEditingId(null);
                fetchPendingCalls();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update duration');
        }
    };

    const handleAccept = async (callId) => {
        try {
            const response = await api.patch(`/calls/${callId}/accept`);
            if (response.data.success) {
                toast.success('Call confirmed!');
                fetchPendingCalls();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept call');
        }
    };

    const handleDecline = async (callId) => {
        try {
            const response = await api.patch(`/calls/${callId}/decline`, {
                reason: 'Not available at this time'
            });
            if (response.data.success) {
                toast.success('Call declined');
                fetchPendingCalls();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to decline call');
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-slate-800 rounded-xl" />
                ))}
            </div>
        );
    }

    if (pendingCalls.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-400 mb-1">No Pending Requests</h3>
                <p className="text-slate-600 text-sm">New booking requests will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-500" />
                Pending Call Requests
                <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">
                    {pendingCalls.length}
                </span>
            </h3>

            <AnimatePresence>
                {pendingCalls.map(call => (
                    <motion.div
                        key={call._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                    {call.student?.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{call.student?.name || 'Student'}</h4>
                                    <p className="text-slate-500 text-sm">{call.student?.email}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                                Pending
                            </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(call.scheduledFor).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(call.scheduledFor).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>

                        {/* Duration Section */}
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Requested Duration</span>
                                {editingId === call._id ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={newDuration}
                                            onChange={(e) => setNewDuration(parseInt(e.target.value))}
                                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
                                        >
                                            {durationOptions.map(d => (
                                                <option key={d} value={d}>{d} mins</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleModifyDuration(call._id)}
                                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">{call.scheduledDuration || 30} mins</span>
                                        <button
                                            onClick={() => {
                                                setEditingId(call._id);
                                                setNewDuration(call.scheduledDuration || 30);
                                            }}
                                            className="p-1.5 bg-slate-700 text-slate-400 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                                            title="Modify Duration"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {call.mentorModifiedDuration && (
                                <p className="text-xs text-amber-400 mt-1">⚡ You modified this duration</p>
                            )}
                        </div>

                        {/* Notes */}
                        {call.notes && (
                            <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Student's Topic</p>
                                <p className="text-slate-300 text-sm">{call.notes}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAccept(call._id)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Accept
                            </button>
                            <button
                                onClick={() => handleDecline(call._id)}
                                className="flex-1 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center gap-2 border border-slate-700"
                            >
                                <X className="w-4 h-4" />
                                Decline
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default PendingCallsManager;
