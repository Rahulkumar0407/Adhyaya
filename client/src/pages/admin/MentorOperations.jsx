import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserCog,
    Star,
    Clock,
    Phone,
    DollarSign,
    Eye,
    CheckCircle,
    XCircle,
    Clock3,
    Loader2,
    Search,
    Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMentors, updateMentorStatus } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';

const MentorOperations = () => {
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterOnline, setFilterOnline] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch mentors
    const { data: mentorsData, isLoading } = useQuery({
        queryKey: ['admin-mentors', filterStatus, filterOnline],
        queryFn: () => getMentors({ status: filterStatus, isOnline: filterOnline || undefined }),
        refetchInterval: 30000,
    });

    // Update mentor status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ mentorId, status, reason }) => updateMentorStatus(mentorId, status, reason),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-mentors']);
            toast.success('Mentor status updated');
            setSelectedMentor(null);
        },
        onError: () => {
            toast.error('Failed to update mentor status');
        },
    });

    const mentors = mentorsData?.mentors || [];

    // Filter mentors by search
    const filteredMentors = mentors.filter((mentor) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            mentor.user?.name?.toLowerCase().includes(searchLower) ||
            mentor.headline?.toLowerCase().includes(searchLower) ||
            mentor.expertise?.some((e) => e.toLowerCase().includes(searchLower))
        );
    });

    // Stats
    const stats = {
        total: mentors.length,
        online: mentors.filter((m) => m.isOnline).length,
        approved: mentors.filter((m) => m.applicationStatus === 'approved').length,
        pending: mentors.filter((m) => m.applicationStatus === 'pending').length,
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Mentors', value: stats.total, icon: UserCog, color: 'cyan' },
                    { label: 'Online Now', value: stats.online, icon: Clock3, color: 'green' },
                    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'purple' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
                ].map((stat) => (
                    <GlassCard key={stat.label} neonColor={stat.color} padding="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search mentors..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/50 border border-cyan-500/10 
              text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/30 transition-colors"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white outline-none"
                >
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select
                    value={filterOnline}
                    onChange={(e) => setFilterOnline(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white outline-none"
                >
                    <option value="">All</option>
                    <option value="true">Online</option>
                    <option value="false">Offline</option>
                </select>
            </div>

            {/* Mentors Table */}
            <GlassCard neonColor="cyan" padding="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cyan-500/10">
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Mentor</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Rate</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Rating</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Sessions</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Earnings</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredMentors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No mentors found
                                    </td>
                                </tr>
                            ) : (
                                filteredMentors.map((mentor) => (
                                    <tr
                                        key={mentor._id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                        style={{
                                                            background: mentor.user?.avatar
                                                                ? `url(${mentor.user.avatar})`
                                                                : 'linear-gradient(135deg, #00f0ff 0%, #bf00ff 100%)',
                                                            backgroundSize: 'cover',
                                                        }}
                                                    >
                                                        {!mentor.user?.avatar && mentor.user?.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    {mentor.isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{mentor.user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                        {mentor.headline}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                    mentor.applicationStatus
                                                )}`}
                                            >
                                                {mentor.applicationStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-cyan-400">₹{mentor.ratePerMinute}/min</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white">{mentor.rating?.toFixed(1) || '0.0'}</span>
                                                <span className="text-gray-500 text-xs">({mentor.totalReviews})</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-white">{mentor.totalSessions}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-green-400">{formatCurrency(mentor.totalEarned)}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <NeonButton
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Eye}
                                                    onClick={() => setSelectedMentor(mentor)}
                                                >
                                                    View
                                                </NeonButton>
                                                {mentor.applicationStatus === 'pending' && (
                                                    <>
                                                        <NeonButton
                                                            variant="success"
                                                            size="sm"
                                                            icon={CheckCircle}
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({
                                                                    mentorId: mentor._id,
                                                                    status: 'approved',
                                                                })
                                                            }
                                                            loading={updateStatusMutation.isLoading}
                                                        >
                                                            Approve
                                                        </NeonButton>
                                                        <NeonButton
                                                            variant="danger"
                                                            size="sm"
                                                            icon={XCircle}
                                                            onClick={() =>
                                                                updateStatusMutation.mutate({
                                                                    mentorId: mentor._id,
                                                                    status: 'rejected',
                                                                    reason: 'Does not meet requirements',
                                                                })
                                                            }
                                                            loading={updateStatusMutation.isLoading}
                                                        >
                                                            Reject
                                                        </NeonButton>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Mentor Detail Modal */}
            <AnimatePresence>
                {selectedMentor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMentor(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                            }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-cyan-500/10">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                                        style={{
                                            background: 'linear-gradient(135deg, #00f0ff 0%, #bf00ff 100%)',
                                        }}
                                    >
                                        {selectedMentor.user?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedMentor.user?.name}</h2>
                                        <p className="text-gray-400">{selectedMentor.headline}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                                selectedMentor.applicationStatus
                                            )}`}
                                        >
                                            {selectedMentor.applicationStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-800/30">
                                        <p className="text-2xl font-bold text-cyan-400">₹{selectedMentor.ratePerMinute}</p>
                                        <p className="text-xs text-gray-500">Per Minute</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-800/30">
                                        <p className="text-2xl font-bold text-yellow-400">{selectedMentor.rating?.toFixed(1)}</p>
                                        <p className="text-xs text-gray-500">Rating</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-800/30">
                                        <p className="text-2xl font-bold text-white">{selectedMentor.totalSessions}</p>
                                        <p className="text-xs text-gray-500">Sessions</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-800/30">
                                        <p className="text-2xl font-bold text-green-400">{formatCurrency(selectedMentor.totalEarned)}</p>
                                        <p className="text-xs text-gray-500">Earned</p>
                                    </div>
                                </div>

                                {/* Expertise */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMentor.expertise?.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedMentor.bio && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Bio</h3>
                                        <p className="text-gray-300">{selectedMentor.bio}</p>
                                    </div>
                                )}

                                {/* Mirror View Button */}
                                <NeonButton
                                    variant="secondary"
                                    fullWidth
                                    icon={Eye}
                                    onClick={() => {
                                        // Navigate to dashboard with user context
                                        navigate(`/dashboard?viewAs=${selectedMentor.user?._id}`);
                                        setSelectedMentor(null);
                                    }}
                                >
                                    View Dashboard As {selectedMentor.user?.name?.split(' ')[0]}
                                </NeonButton>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-cyan-500/10 flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setSelectedMentor(null)}>
                                    Close
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MentorOperations;
