import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Ban,
    Lock,
    Key,
    RotateCcw,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Activity,
    Wallet,
    Trophy,
    Flame,
    BookOpen,
    TrendingUp,
    Briefcase,
    Globe,
    Award,
    Coins,
    Crown
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';
import {
    resetUserPassword,
    toggleUserAccess,
    refundTransaction,
    togglePasswordPermission,
    unlockFeature,
    banUser,
    unbanUser,
    creditPoints,
    updateUserRole,
    lockFeature
} from '../../services/adminService';

const UserDossier = ({ user: initialUser, wallet, activities, revisions, onRefresh }) => {
    const [user, setUser] = useState(initialUser);

    // Sync local user state with prop
    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReason, setCreditReason] = useState('');
    const [creditType, setCreditType] = useState('money');
    const [transactionMode, setTransactionMode] = useState('credit'); // 'credit' or 'debit'
    const [selectedRole, setSelectedRole] = useState(user?.role || 'student');
    const [expandedSections, setExpandedSections] = useState({
        activity: true,
        transactions: true,
        revisions: true,
    });
    const [isLoading, setIsLoading] = useState({
        password: false,
        access: false,
        refund: false,
        passwordPermission: false,
        credit: false,
        ban: false,
        role: false
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // Calculate total watch time from activities
    const totalWatchTime = activities?.reduce((acc, activity) => {
        return acc + activity.activities.filter((a) => a.type === 'video_watched').length * 10; // Estimate 10 min per video
    }, 0) || 0;

    // Handle password reset
    const handlePasswordReset = async () => {
        setIsLoading({ ...isLoading, password: true });
        try {
            // Generate a random password
            const newPassword = Math.random().toString(36).slice(-8) + 'A1!';
            await resetUserPassword(user._id, newPassword);
            toast.success(`Password reset! New password: ${newPassword}`);
            setShowPasswordModal(false);
        } catch (error) {
            toast.error('Failed to reset password');
        } finally {
            setIsLoading({ ...isLoading, password: false });
        }
    };

    // Handle ban/unban
    const handleBan = async () => {
        if (!banReason) {
            toast.error('Please provide a reason for the ban');
            return;
        }
        setIsLoading({ ...isLoading, ban: true });
        try {
            await banUser(user._id, banReason, banDuration ? parseInt(banDuration) : null);
            toast.success(`User ${user.name} has been banned`);
            setShowBanModal(false);
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to ban user');
        } finally {
            setIsLoading({ ...isLoading, ban: false });
        }
    };

    const handleUnban = async () => {
        if (!window.confirm(`Are you sure you want to unban ${user.name}?`)) return;
        setIsLoading({ ...isLoading, access: true });
        try {
            await unbanUser(user._id);
            toast.success(`User ${user.name} has been unbanned`);
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to unban user');
        } finally {
            setIsLoading({ ...isLoading, access: false });
        }
    };

    // Handle access toggle - DEPRECATED in favor of Ban/Unban but kept for legacy fallback logic if needed
    // We will replace the UI button to use handleUnban or showBanModal instead.

    // Handle password permission toggle
    const handlePasswordPermissionToggle = async () => {
        setIsLoading({ ...isLoading, passwordPermission: true });
        try {
            await togglePasswordPermission(user._id, !user.canChangePassword);
            toast.success(`Password change ${user.canChangePassword ? 'disabled' : 'enabled'} for user`);
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to update permission');
        } finally {
            setIsLoading({ ...isLoading, passwordPermission: false });
        }
    };

    // Handle credit points
    const handleCreditPoints = async () => {
        if (!creditAmount || parseFloat(creditAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        setIsLoading({ ...isLoading, credit: true });
        try {
            const finalAmount = transactionMode === 'debit' ? -parseFloat(creditAmount) : parseFloat(creditAmount);
            await creditPoints(user.email, finalAmount, creditReason, creditType);
            toast.success(`Successfully ${transactionMode === 'debit' ? 'deducted' : 'credited'} points`);
            setShowCreditModal(false);
            setCreditAmount('');
            setCreditReason('');
            setCreditType('money');
            // Refresh wallet/user data if needed (via prop or refetch)
            onRefresh?.(); // Assuming onRefresh handles invalidating queries or refetching data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to credit points');
        } finally {
            setIsLoading(prev => ({ ...prev, credit: false }));
        }
    };

    // Handle role change
    const handleRoleChange = async () => {
        if (selectedRole === user.role) {
            toast.error('Please select a different role');
            return;
        }
        setIsLoading({ ...isLoading, role: true });
        try {
            await updateUserRole(user._id, selectedRole);
            toast.success(`${user.name}'s role changed to ${selectedRole}`);
            setShowRoleModal(false);
            onRefresh?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change role');
        } finally {
            setIsLoading({ ...isLoading, role: false });
        }
    };

    // Handle unlock feature
    const handleUnlockFeature = async (feature) => {
        if (!window.confirm(`Are you sure you want to unlock ${feature} for ${user.name}?`)) return;
        try {
            await unlockFeature(user._id, feature);
            toast.success(`${feature} unlocked successfully`);
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to unlock feature');
        }
    };

    // Handle lock feature
    const handleLockFeature = async (feature) => {
        if (!window.confirm(`Are you sure you want to lock ${feature} for ${user.name}?`)) return;
        try {
            await lockFeature(user._id, feature);
            toast.success(`${feature} locked successfully`);
            onRefresh?.();
        } catch (error) {
            toast.error('Failed to lock feature');
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

    return (
        <div className="h-full overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/30">
            {/* Header - Basic Info */}
            <GlassCard neonColor="cyan" glow padding="p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
                            style={{
                                background: user.avatar
                                    ? `url(${user.avatar})`
                                    : 'linear-gradient(135deg, #00f0ff 0%, #bf00ff 100%)',
                                backgroundSize: 'cover',
                                boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                            }}
                        >
                            {!user.avatar && user.name?.[0]?.toUpperCase()}
                        </div>
                        {/* Level Badge */}
                        <div
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center 
                text-white font-bold text-sm border-4 border-gray-900"
                            style={{
                                background: 'linear-gradient(135deg, #bf00ff 0%, #00f0ff 100%)',
                            }}
                        >
                            {user.level}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium
                  ${user.role === 'admin'
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : user.role === 'mentor'
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                    }`}
                            >
                                {user.role.toUpperCase()}
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium
                  ${user.isActive
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                            >
                                {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Mail className="w-4 h-4 text-cyan-400" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="w-4 h-4 text-cyan-400" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user.location && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        {user.socialLinks && (
                            <div className="flex items-center gap-3 mt-3">
                                {user.socialLinks.github && (
                                    <a
                                        href={user.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks.linkedin && (
                                    <a
                                        href={user.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks.portfolio && (
                                    <a
                                        href={user.socialLinks.portfolio}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                                    >
                                        <Globe className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        <NeonButton
                            variant="primary"
                            size="sm"
                            icon={Lock}
                            onClick={() => setShowPasswordModal(true)}
                            loading={isLoading.password}
                        >
                            Reset Password
                        </NeonButton>
                        <NeonButton
                            variant="secondary" // Or warning
                            size="sm"
                            icon={Crown}
                            onClick={() => setShowRoleModal(true)}
                        >
                            Change Role
                        </NeonButton>
                        <NeonButton
                            variant={user.canChangePassword ? 'success' : 'secondary'}
                            size="sm"
                            icon={Key}
                            onClick={handlePasswordPermissionToggle}
                            loading={isLoading.passwordPermission}
                        >
                            {user.canChangePassword ? 'Can Change PW ✓' : 'Allow PW Change'}
                        </NeonButton>
                        <NeonButton
                            variant={user.isActive ? 'danger' : 'success'}
                            fullWidth
                            icon={user.isActive ? Ban : CheckCircle}
                            onClick={() => user.isActive ? setShowBanModal(true) : handleUnban()}
                            loading={isLoading.access || isLoading.ban}
                        >
                            {user.isActive ? 'Ban User' : 'Unban User'}
                        </NeonButton>
                        <NeonButton
                            variant="secondary"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => setShowRefundModal(true)}
                        >
                            Refund
                        </NeonButton>
                        <NeonButton
                            variant="success"
                            size="sm"
                            icon={Coins}
                            onClick={() => setShowCreditModal(true)}
                        >
                            Credit Points
                        </NeonButton>
                        <NeonButton
                            variant={user.adaptiveRevisionSubscription?.plan === 'premium' ? 'danger' : 'primary'}
                            size="sm"
                            icon={user.adaptiveRevisionSubscription?.plan === 'premium' ? Lock : Key}
                            onClick={() => user.adaptiveRevisionSubscription?.plan === 'premium' ? handleLockFeature('adaptiveRevision') : handleUnlockFeature('adaptiveRevision')}
                        >
                            {user.adaptiveRevisionSubscription?.plan === 'premium' ? 'Lock Adaptive' : 'Unlock Adaptive'}
                        </NeonButton>
                        <NeonButton
                            variant={user.mentorCircleSubscription?.plan === 'premium' ? 'danger' : 'primary'}
                            size="sm"
                            icon={user.mentorCircleSubscription?.plan === 'premium' ? Lock : Key}
                            onClick={() => user.mentorCircleSubscription?.plan === 'premium' ? handleLockFeature('mentorCircle') : handleUnlockFeature('mentorCircle')}
                        >
                            {user.mentorCircleSubscription?.plan === 'premium' ? 'Lock Mentor' : 'Unlock Mentor'}
                        </NeonButton>
                    </div>
                </div>
            </GlassCard >

            {/* Stats Row */}
            < div className="grid grid-cols-4 gap-4" >
                {/* Total Watch Time */}
                < GlassCard neonColor="cyan" padding="p-4" >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-cyan-500/10">
                            <Clock className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{Math.floor(totalWatchTime / 60)}h {totalWatchTime % 60}m</p>
                            <p className="text-xs text-gray-500">Total Watch Time</p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalWatchTime / 6000) * 100, 100)}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        />
                    </div>
                </GlassCard >

                {/* Total Spent */}
                < GlassCard neonColor="green" padding="p-4" >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-500/10">
                            <Wallet className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(wallet?.totalSpent)}</p>
                            <p className="text-xs text-gray-500">Lifetime Value</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        Balance: <span className="text-green-400">{formatCurrency(wallet?.balance)}</span>
                    </p>
                </GlassCard >

                {/* XP & Level */}
                < GlassCard neonColor="purple" padding="p-4" >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-500/10">
                            <Trophy className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{user.xpPoints.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">XP Points</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        Problems Solved: <span className="text-purple-400">{user.problemsSolved}</span>
                    </p>
                </GlassCard >

                {/* Streak */}
                < GlassCard neonColor="orange" padding="p-4" >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-orange-500/10">
                            <Flame className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{user.streakCount}</p>
                            <p className="text-xs text-gray-500">Current Streak</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        Longest: <span className="text-orange-400">{user.longestStreak} days</span>
                    </p>
                </GlassCard >
            </div >

            {/* Activity Logs */}
            < GlassCard neonColor="cyan" padding="p-0" >
                <button
                    onClick={() => toggleSection('activity')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">Activity Logs</h3>
                    </div>
                    {expandedSections.activity ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </button>

                <AnimatePresence>
                    {expandedSections.activity && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                {/* Last Active */}
                                <div className="p-3 rounded-xl bg-gray-800/30 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Last Active</span>
                                        <span className="text-sm text-white">
                                            {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                {/* Recent Activities */}
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {activities?.slice(0, 10).flatMap((day) =>
                                        day.activities.slice(0, 5).map((act, idx) => (
                                            <div
                                                key={`${day._id}-${idx}`}
                                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/20"
                                            >
                                                <div
                                                    className={`w-2 h-2 rounded-full ${act.type === 'video_watched'
                                                        ? 'bg-cyan-400'
                                                        : act.type === 'problem_solved'
                                                            ? 'bg-green-400'
                                                            : act.type === 'quiz_taken'
                                                                ? 'bg-purple-400'
                                                                : 'bg-orange-400'
                                                        }`}
                                                />
                                                <span className="text-sm text-gray-300 capitalize">
                                                    {act.type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-auto">
                                                    {format(new Date(act.timestamp), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    {(!activities || activities.length === 0) && (
                                        <p className="text-center text-gray-500 py-4">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard >

            {/* Transaction History */}
            < GlassCard neonColor="green" padding="p-0" >
                <button
                    onClick={() => toggleSection('transactions')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                    </div>
                    {expandedSections.transactions ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </button>

                <AnimatePresence>
                    {expandedSections.transactions && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {wallet?.transactions?.slice(0, 10).map((tx) => (
                                        <div
                                            key={tx._id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20"
                                        >
                                            <div
                                                className={`p-2 rounded-lg ${tx.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                                                    }`}
                                            >
                                                <TrendingUp
                                                    className={`w-4 h-4 ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400 rotate-180'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white capitalize">{tx.type.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-gray-500">{tx.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}
                                                >
                                                    {tx.amount >= 0 ? '+' : ''}
                                                    {formatCurrency(tx.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!wallet?.transactions || wallet.transactions.length === 0) && (
                                        <p className="text-center text-gray-500 py-4">No transactions</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard >

            {/* Revision History */}
            < GlassCard neonColor="purple" padding="p-0" >
                <button
                    onClick={() => toggleSection('revisions')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Revision History</h3>
                    </div>
                    {expandedSections.revisions ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </button>

                <AnimatePresence>
                    {expandedSections.revisions && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {revisions?.slice(0, 10).map((rev) => (
                                        <div
                                            key={rev._id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20"
                                        >
                                            <span className="text-2xl">
                                                {rev.understandingLevel === 'crystal'
                                                    ? '🚀'
                                                    : rev.understandingLevel === 'clear'
                                                        ? '😄'
                                                        : rev.understandingLevel === 'partial'
                                                            ? '🙂'
                                                            : '😕'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-white">{rev.topicTitle}</p>
                                                <p className="text-xs text-gray-500 capitalize">{rev.course}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${rev.understandingLevel === 'crystal'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : rev.understandingLevel === 'clear'
                                                        ? 'bg-cyan-500/20 text-cyan-400'
                                                        : rev.understandingLevel === 'partial'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {rev.understandingLevel}
                                            </span>
                                        </div>
                                    ))}
                                    {(!revisions || revisions.length === 0) && (
                                        <p className="text-center text-gray-500 py-4">No revisions yet</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard >

            {/* Password Reset Modal */}
            < AnimatePresence >
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md p-6 rounded-2xl"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                            }}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to reset the password for <strong>{user.name}</strong>?
                                A new random password will be generated.
                            </p>
                            <div className="flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    variant="primary"
                                    fullWidth
                                    onClick={handlePasswordReset}
                                    loading={isLoading.password}
                                >
                                    Reset Password
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Refund Modal */}
            < AnimatePresence >
                {showRefundModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRefundModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md p-6 rounded-2xl"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(191, 0, 255, 0.2)',
                            }}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Issue Refund</h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                    <textarea
                                        placeholder="Enter refund reason..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-purple-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowRefundModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton variant="secondary" fullWidth loading={isLoading.refund}>
                                    Process Refund
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Ban Modal */}
            < AnimatePresence >
                {showBanModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBanModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md p-6 rounded-2xl"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-red-500/20">
                                    <Ban className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ban User</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Are you sure you want to ban <strong className="text-white">{user.name}</strong>?
                                They will be logged out immediately and unable to access the platform.
                            </p>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Ban Reason</label>
                                    <textarea
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        placeholder="e.g., Violeted community guidelines, suspicious activity..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-red-500 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Duration (Hours) - Optional</label>
                                    <input
                                        type="number"
                                        value={banDuration}
                                        onChange={(e) => setBanDuration(e.target.value)}
                                        placeholder="Leave empty for permanent ban"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowBanModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    variant="danger"
                                    fullWidth
                                    onClick={handleBan}
                                    loading={isLoading.ban}
                                >
                                    Ban User
                                </NeonButton>
                            </div>
                        </motion.div >
                    </motion.div >
                )
                }
            </AnimatePresence >

            {/* Credit Points Modal */}
            < AnimatePresence >
                {showCreditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreditModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md p-6 rounded-2xl"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 255, 128, 0.2)',
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-green-500/20">
                                    <Coins className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Credit Points</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Add wallet balance to <strong className="text-white">{user.name}</strong>.
                            </p>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Points to Credit</label>
                                    <div className="flex gap-2 mb-3">
                                        <div className="flex flex-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                                            <button
                                                onClick={() => setCreditType('money')}
                                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${creditType === 'money' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Wallet (₹)
                                            </button>
                                            <button
                                                onClick={() => setCreditType('coins')}
                                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${creditType === 'coins' ? 'bg-yellow-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Coins (🪙)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mb-3">
                                        <div className="flex flex-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                                            <button
                                                onClick={() => setTransactionMode('credit')}
                                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${transactionMode === 'credit' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Credit (+ Add)
                                            </button>
                                            <button
                                                onClick={() => setTransactionMode('debit')}
                                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${transactionMode === 'debit' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                Debit (- Deduct)
                                            </button>
                                        </div>
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
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                    <input
                                        type="text"
                                        value={creditReason}
                                        onChange={(e) => setCreditReason(e.target.value)}
                                        placeholder="e.g., Contest Winner, Refund..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowCreditModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    variant="success"
                                    fullWidth
                                    onClick={handleCreditPoints}
                                    loading={isLoading.credit}
                                >
                                    {transactionMode === 'credit' ? 'Credit' : 'Deduct'} {creditType === 'money' ? 'Money' : 'Coins'}
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Role Change Modal */}
            < AnimatePresence >
                {showRoleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRoleModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md p-6 rounded-2xl"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(255, 165, 0, 0.2)',
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-orange-500/20">
                                    <Crown className="w-6 h-6 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Change User Role</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Update permission level for <strong className="text-white">{user.name}</strong>.
                            </p>

                            <div className="space-y-3 mb-6">
                                {['student', 'mentor', 'admin'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedRole === role
                                            ? 'bg-orange-500/10 border-orange-500/50'
                                            : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${role === 'admin' ? 'bg-purple-500' :
                                                role === 'mentor' ? 'bg-cyan-500' : 'bg-gray-500'
                                                }`} />
                                            <span className="text-white capitalize">{role}</span>
                                        </div>
                                        {selectedRole === role && <CheckCircle className="w-5 h-5 text-orange-400" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowRoleModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    variant="warning"
                                    fullWidth
                                    onClick={handleRoleChange}
                                    loading={isLoading.role}
                                >
                                    Update Role
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default UserDossier;
