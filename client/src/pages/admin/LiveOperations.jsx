import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import {
    Activity,
    Phone,
    MessageCircle,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getActiveCalls, getDoubtsKanban, getRecentTransactions } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiveOperations = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [liveTransactions, setLiveTransactions] = useState([]);

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('admin:subscribe');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for real-time transaction updates
        newSocket.on('transaction:new', (transaction) => {
            setLiveTransactions((prev) => [transaction, ...prev].slice(0, 10));
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Fetch active calls
    const { data: callsData, isLoading: isLoadingCalls } = useQuery({
        queryKey: ['admin-active-calls'],
        queryFn: getActiveCalls,
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    // Fetch doubts kanban
    const { data: doubtsData, isLoading: isLoadingDoubts } = useQuery({
        queryKey: ['admin-doubts-kanban'],
        queryFn: getDoubtsKanban,
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    // Fetch recent transactions (fallback if no live data)
    const { data: transactionsData } = useQuery({
        queryKey: ['admin-recent-transactions-live'],
        queryFn: () => getRecentTransactions(10),
        refetchInterval: 5000,
    });

    const activeCalls = callsData?.calls || [];
    const roomStats = callsData?.roomStats || { totalRooms: 0, totalParticipants: 0 };
    const kanban = doubtsData?.kanban || { pending: [], inProgress: [], resolved: [] };
    const transactions = liveTransactions.length > 0 ? liveTransactions : (transactionsData?.transactions || []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(Math.abs(amount || 0));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Connection Status */}
            <div className="flex items-center gap-3 text-sm">
                <span
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                />
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                    {isConnected ? 'Connected to real-time feed' : 'Disconnected'}
                </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="cyan" glow padding="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-cyan-500/10">
                                <Phone className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{roomStats.totalRooms}</p>
                                <p className="text-sm text-gray-500">Active Rooms</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xl font-semibold text-cyan-400">{roomStats.totalParticipants}</p>
                                <p className="text-xs text-gray-500">Participants</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="orange" glow padding="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-orange-500/10">
                                <MessageCircle className="w-8 h-8 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{kanban.pending.length}</p>
                                <p className="text-sm text-gray-500">Pending Doubts</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xl font-semibold text-green-400">{kanban.resolved.length}</p>
                                <p className="text-xs text-gray-500">Resolved Today</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="green" glow padding="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-green-500/10">
                                <Activity className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{transactions.length}</p>
                                <p className="text-sm text-gray-500">Recent Transactions</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Transactions Feed */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="green" padding="p-0 h-[500px] flex flex-col">
                        <div className="flex items-center gap-3 p-4 border-b border-green-500/10">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <h2 className="text-lg font-semibold text-white">Transactions Feed</h2>
                            <div className="ml-auto flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-gray-500">Live</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {transactions.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500">No transactions yet</p>
                                </div>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <motion.div
                                        key={tx._id || idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30"
                                    >
                                        <div
                                            className={`p-2 rounded-lg ${tx.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                                                }`}
                                        >
                                            {tx.amount >= 0 ? (
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate capitalize">
                                                {tx.type?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                                        </div>
                                        <p
                                            className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            {tx.amount >= 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Active Calls */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="cyan" padding="p-0 h-[500px] flex flex-col">
                        <div className="flex items-center gap-3 p-4 border-b border-cyan-500/10">
                            <Phone className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold text-white">Ongoing Calls</h2>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                {activeCalls.length} Active
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoadingCalls ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                </div>
                            ) : activeCalls.length === 0 ? (
                                <div className="h-full flex items-center justify-center flex-col gap-3">
                                    <Phone className="w-12 h-12 text-gray-600" />
                                    <p className="text-gray-500">No active calls</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeCalls.map((call) => (
                                        <div
                                            key={call._id}
                                            className="p-4 rounded-xl bg-gray-800/30 border border-cyan-500/10"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {call.student?.name?.[0] || 'S'}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                                                            <Phone className="w-2 h-2 text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{call.student?.name}</p>
                                                        <p className="text-xs text-gray-500">Student</p>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">with</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-white text-right">
                                                            {call.mentor?.user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 text-right">Mentor</p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                        {call.mentor?.user?.name?.[0] || 'M'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Room: {call.roomId?.slice(-8)}</span>
                                                </div>
                                                <span className="text-cyan-400">₹{call.ratePerMinute}/min</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Doubts Kanban */}
            <motion.div variants={itemVariants}>
                <GlassCard neonColor="orange" padding="p-0">
                    <div className="flex items-center gap-3 p-4 border-b border-orange-500/10">
                        <MessageCircle className="w-5 h-5 text-orange-400" />
                        <h2 className="text-lg font-semibold text-white">Active Doubts</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4">
                        {/* Pending Column */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2 py-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-sm font-medium text-white">Pending</span>
                                <span className="ml-auto text-xs text-gray-500">{kanban.pending.length}</span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {kanban.pending.slice(0, 5).map((doubt) => (
                                    <div
                                        key={doubt._id}
                                        className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                                    >
                                        <p className="text-sm text-white truncate">{doubt.title}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{doubt.subject}</span>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-xs ${doubt.priority === 'urgent'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : doubt.priority === 'stuck'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                    }`}
                                            >
                                                {doubt.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2 py-1">
                                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                                <span className="text-sm font-medium text-white">In Progress</span>
                                <span className="ml-auto text-xs text-gray-500">{kanban.inProgress.length}</span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {kanban.inProgress.slice(0, 5).map((doubt) => (
                                    <div
                                        key={doubt._id}
                                        className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                                    >
                                        <p className="text-sm text-white truncate">{doubt.title}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{doubt.subject}</span>
                                            {doubt.assignedMentor && (
                                                <span className="text-xs text-cyan-400">
                                                    @ {doubt.assignedMentor.name?.split(' ')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resolved Column */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2 py-1">
                                <span className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm font-medium text-white">Resolved</span>
                                <span className="ml-auto text-xs text-gray-500">{kanban.resolved.length}</span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {kanban.resolved.slice(0, 5).map((doubt) => (
                                    <div
                                        key={doubt._id}
                                        className="p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                                    >
                                        <p className="text-sm text-white truncate">{doubt.title}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{doubt.subject}</span>
                                            {doubt.rating && (
                                                <span className="text-xs text-yellow-400">⭐ {doubt.rating}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};

export default LiveOperations;
