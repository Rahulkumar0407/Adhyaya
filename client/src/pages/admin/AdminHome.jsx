import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    UserCog,
    Wallet,
    MessageCircle,
    Phone,
    TrendingUp,
    Activity,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Coins,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { getAdminStats, getRecentTransactions, creditPoints, creditAllUsers } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';

const AdminHome = () => {
    // Credit Points Modal State
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [creditEmail, setCreditEmail] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReason, setCreditReason] = useState('');
    const [creditLoading, setCreditLoading] = useState(false);
    const [creditResult, setCreditResult] = useState(null);
    const [creditError, setCreditError] = useState('');
    const [creditToAll, setCreditToAll] = useState(false);
    const [creditType, setCreditType] = useState('money');

    // Fetch admin stats
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getAdminStats,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Fetch recent transactions
    const { data: transactionsData, refetch: refetchTransactions } = useQuery({
        queryKey: ['admin-recent-transactions'],
        queryFn: () => getRecentTransactions(5),
        refetchInterval: 10000, // Refresh every 10 seconds
    });

    const stats = statsData || {
        totalUsers: 0,
        totalMentors: 0,
        totalRevenue: 0,
        activeDoubts: 0,
        activeCalls: 0,
        todayTransactions: 0,
    };

    const transactions = transactionsData?.transactions || [];

    // Handle credit points
    const handleCreditPoints = async () => {
        if ((!creditToAll && !creditEmail.trim()) || !creditAmount || parseFloat(creditAmount) <= 0) {
            setCreditError('Please enter valid details');
            return;
        }

        setCreditLoading(true);
        setCreditError('');
        setCreditResult(null);

        try {
            let result;
            if (creditToAll) {
                result = await creditAllUsers(parseFloat(creditAmount), creditReason, creditType);
            } else {
                result = await creditPoints(creditEmail.trim(), parseFloat(creditAmount), creditReason, creditType);
            }

            setCreditResult(result);
            refetchTransactions(); // Refresh transactions list
            // Reset form after success
            setCreditEmail('');
            setCreditAmount('');
            setCreditReason('');
            setCreditToAll(false);
            setCreditType('money');
        } catch (error) {
            setCreditError(error.response?.data?.message || 'Failed to credit points');
        } finally {
            setCreditLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Stat cards data
    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'cyan',
            change: '+12.5%',
            changeType: 'up',
        },
        {
            title: 'Active Mentors',
            value: stats.totalMentors,
            icon: UserCog,
            color: 'purple',
            change: '+5.2%',
            changeType: 'up',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: Wallet,
            color: 'green',
            change: '+28.4%',
            changeType: 'up',
        },
        {
            title: 'Active Doubts',
            value: stats.activeDoubts,
            icon: MessageCircle,
            color: 'orange',
            change: '-8.1%',
            changeType: 'down',
        },
        {
            title: 'Active Calls',
            value: stats.activeCalls,
            icon: Phone,
            color: 'cyan',
            change: '+3 now',
            changeType: 'up',
        },
        {
            title: "Today's Transactions",
            value: stats.todayTransactions,
            icon: TrendingUp,
            color: 'green',
            change: '+15.7%',
            changeType: 'up',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            <GlassCard neonColor={stat.color} glow elevated padding="p-6 h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <motion.div
                                        className="p-3 rounded-xl"
                                        style={{
                                            background: stat.color === 'cyan' ? 'rgba(0, 212, 255, 0.15)' :
                                                stat.color === 'purple' ? 'rgba(139, 92, 246, 0.15)' :
                                                    stat.color === 'green' ? 'rgba(16, 185, 129, 0.15)' :
                                                        stat.color === 'orange' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 212, 255, 0.15)',
                                            boxShadow: stat.color === 'cyan' ? '0 0 20px rgba(0, 212, 255, 0.2)' :
                                                stat.color === 'purple' ? '0 0 20px rgba(139, 92, 246, 0.2)' :
                                                    stat.color === 'green' ? '0 0 20px rgba(16, 185, 129, 0.2)' :
                                                        stat.color === 'orange' ? '0 0 20px rgba(245, 158, 11, 0.2)' : '0 0 20px rgba(0, 212, 255, 0.2)',
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <stat.icon className={`w-6 h-6 ${stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'purple' ? 'text-purple-400' : stat.color === 'green' ? 'text-emerald-400' : stat.color === 'orange' ? 'text-orange-400' : 'text-cyan-400'}`} />
                                    </motion.div>
                                    <div
                                        className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full ${stat.changeType === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}
                                    >
                                        {stat.changeType === 'up' ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4" />
                                        )}
                                        {stat.change}
                                    </div>
                                </div>
                                <motion.p
                                    className="text-3xl font-bold text-white mb-1 tracking-tight"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {isLoadingStats ? (
                                        <span className="inline-block w-20 h-8 bg-gray-700/50 rounded animate-pulse" />
                                    ) : stat.value}
                                </motion.p>
                                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions & Live Feed */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants}>
                        <GlassCard neonColor="purple" elevated padding="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-purple-500/15" style={{ boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)' }}>
                                    <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-lg font-semibold text-white tracking-tight">Quick Actions</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Credit Points', icon: '💰', onClick: () => setShowCreditModal(true) },
                                    { label: 'Send Announcement', icon: '📢' },
                                    { label: 'Generate Coupon', icon: '🎫' },
                                    { label: 'View Reports', icon: '📊' },
                                ].map((action) => (
                                    <motion.button
                                        key={action.label}
                                        onClick={action.onClick}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50
                                            hover:bg-purple-500/15 hover:border-purple-500/40 transition-all duration-300 group"
                                        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                                        <span className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors">
                                            {action.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Recent Transactions */}
                    <motion.div variants={itemVariants}>
                        <GlassCard neonColor="green" padding="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-5 h-5 text-green-400" />
                                <h2 className="text-lg font-semibold text-white">Live Transactions</h2>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-gray-500">Live</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {transactions.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No recent transactions</p>
                                ) : (
                                    transactions.map((tx, idx) => (
                                        <motion.div
                                            key={tx._id || idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/20"
                                        >
                                            <div
                                                className={`p-2 rounded-lg ${tx.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                                                    }`}
                                            >
                                                {tx.amount >= 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate capitalize">
                                                    {tx.type.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                                            </div>
                                            <p
                                                className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                            >
                                                {tx.amount >= 0 ? '+' : ''}
                                                {formatCurrency(tx.amount)}
                                            </p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* System Status */}
                <motion.div variants={itemVariants}>
                    <GlassCard neonColor="cyan" elevated padding="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-cyan-500/15" style={{ boxShadow: '0 0 16px rgba(0, 212, 255, 0.2)' }}>
                                <Activity className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white tracking-tight">System Status</h2>
                            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
                                <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'API Status', value: 'Operational', status: 'healthy' },
                                { label: 'Database', value: 'Connected', status: 'healthy' },
                                { label: 'Socket.io', value: '127 Connections', status: 'healthy' },
                                { label: 'Uptime', value: '99.98%', status: 'healthy' },
                            ].map((item) => (
                                <motion.div
                                    key={item.label}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full ${item.status === 'healthy'
                                            ? 'bg-emerald-500'
                                            : item.status === 'degraded'
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                            }`}
                                        style={{
                                            boxShadow: item.status === 'healthy' ? '0 0 10px rgba(16, 185, 129, 0.5)' :
                                                item.status === 'degraded' ? '0 0 10px rgba(234, 179, 8, 0.5)' :
                                                    '0 0 10px rgba(239, 68, 68, 0.5)',
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm text-white font-medium">{item.value}</p>
                                        <p className="text-xs text-gray-500">{item.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Credit Points Modal */}
            <AnimatePresence>
                {showCreditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowCreditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-500/20">
                                        <Coins className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Credit Points</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCreditModal(false);
                                        setCreditResult(null);
                                        setCreditError('');
                                    }}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Success Message */}
                            {creditResult && (
                                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-green-400 font-medium">Points Credited Successfully!</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {creditResult.data?.user?.name} ({creditResult.data?.user?.email})
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Balance: {creditResult.data?.oldBalance} → <span className="text-green-400 font-bold">{creditResult.data?.newBalance} points</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {creditError && (
                                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-400">{creditError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-400">User Email</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={creditToAll}
                                                onChange={(e) => setCreditToAll(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                                            />
                                            <span className="text-xs text-amber-500 font-medium">Credit to ALL users</span>
                                        </label>
                                    </div>
                                    <input
                                        type="email"
                                        value={creditEmail}
                                        onChange={(e) => setCreditEmail(e.target.value)}
                                        placeholder={creditToAll ? "All users will receive points" : "user@example.com"}
                                        disabled={creditToAll}
                                        className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors ${creditToAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                <label className="block text-sm font-medium text-gray-400 mb-2">Points to Credit</label>
                                <div className="flex bg-gray-800 p-1 rounded-xl mb-3 border border-gray-700">
                                    <button
                                        onClick={() => setCreditType('money')}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${creditType === 'money' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Wallet Money (₹)
                                    </button>
                                    <button
                                        onClick={() => setCreditType('coins')}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${creditType === 'coins' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Babua Coins (🪙)
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500">
                                        {creditType === 'money' ? '₹' : '🪙'}
                                    </span>
                                    <input
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(e.target.value)}
                                        placeholder="100"
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>


                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason (Optional)</label>
                                    <input
                                        type="text"
                                        value={creditReason}
                                        onChange={(e) => setCreditReason(e.target.value)}
                                        placeholder="e.g., Welcome bonus, Compensation"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={handleCreditPoints}
                                    disabled={creditLoading || (!creditToAll && !creditEmail.trim()) || !creditAmount}
                                    className={`w-full py-3 bg-gradient-to-r ${creditType === 'money' ? 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                >
                                    {creditLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="w-5 h-5" />
                                            Credit {creditAmount || '0'} {creditType === 'money' ? 'INR' : 'Coins'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default AdminHome;

