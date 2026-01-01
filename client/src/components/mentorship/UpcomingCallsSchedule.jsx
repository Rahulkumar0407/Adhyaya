import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UpcomingCallsSchedule = () => {
    const [confirmedCalls, setConfirmedCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfirmedCalls();
    }, []);

    const fetchConfirmedCalls = async () => {
        try {
            const response = await api.get('/calls/mentor/confirmed');
            if (response.data.success) {
                setConfirmedCalls(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching confirmed calls:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-slate-800 rounded-xl" />
                ))}
            </div>
        );
    }

    if (confirmedCalls.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800">
                <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No upcoming calls scheduled</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-800/50 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Upcoming Calls
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {confirmedCalls.length}
                </span>
            </div>
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                {confirmedCalls.map(call => (
                    <div key={call._id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                    {call.student?.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">{call.student?.name}</h4>
                                    <p className="text-slate-500 text-xs">{call.scheduledDuration} mins session</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                                Confirmed
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(call.scheduledFor).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(call.scheduledFor).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <Link
                            to={`/call/${call.roomId}`}
                            className="w-full py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Video className="w-3.5 h-3.5" />
                            Join When Ready
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingCallsSchedule;
