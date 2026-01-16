import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Megaphone,
    Users,
    Ban,
    Trash2,
    Plus,
    Send,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import { toast } from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    banUser,
    deleteCommunityPost,
    getReports
} from '../../services/adminService';

const CommunityCommand = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('announcements');
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetAudience: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch announcements
    const { data: announcementsData, isLoading: isLoadingAnnouncements } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: getAnnouncements
    });

    // Fetch reports
    const { data: reportsData, isLoading: isLoadingReports } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: getReports
    });

    const announcements = announcementsData?.announcements || [];
    const reports = reportsData?.reports || [];



    // Create announcement mutation
    const createMutation = useMutation({
        mutationFn: createAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-announcements']);
            toast.success('Announcement published!');
            setShowAnnouncementModal(false);
            setNewAnnouncement({ title: '', message: '', type: 'info', priority: 'medium', targetAudience: 'all' });
        },
        onError: () => toast.error('Failed to publish announcement')
    });

    // Delete announcement mutation
    const deleteMutation = useMutation({
        mutationFn: deleteAnnouncement,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-announcements']);
            toast.success('Announcement deleted');
        },
        onError: () => toast.error('Failed to delete announcement')
    });

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: deleteCommunityPost,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reports']);
            toast.success('Post deleted');
        },
        onError: () => toast.error('Failed to delete post')
    });

    // Ban user mutation
    const banMutation = useMutation({
        mutationFn: ({ userId, reason, duration }) => banUser(userId, reason, duration),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reports']);
            toast.success('User banned');
        },
        onError: () => toast.error('Failed to ban user')
    });

    const tabs = [
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
        { id: 'banned', label: 'Banned Users', icon: Ban },
    ];

    const handleCreateAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.message) {
            toast.error('Please fill in all fields');
            return;
        }
        createMutation.mutate(newAnnouncement);
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Community Command</h2>
                    <p className="text-gray-500">Manage announcements and moderate Chai Tapri</p>
                </div>
                <NeonButton
                    variant="primary"
                    icon={Megaphone}
                    onClick={() => setShowAnnouncementModal(true)}
                >
                    New Announcement
                </NeonButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Announcements', value: announcements.length, icon: Megaphone, color: 'cyan' },
                    { label: 'Reported Posts', value: reports.length, icon: AlertTriangle, color: 'orange' },
                    { label: 'Banned Users', value: 3, icon: Ban, color: 'red' },
                    { label: 'Active Users', value: '1.2K', icon: Users, color: 'green' },
                ].map((stat) => (
                    <motion.div key={stat.label} variants={itemVariants}>
                        <GlassCard neonColor={stat.color} padding="p-4">
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
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-900/50 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'announcements' && (
                    <motion.div
                        key="announcements"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GlassCard neonColor="cyan" padding="p-0">
                            <div className="p-4 border-b border-cyan-500/10">
                                <h3 className="text-lg font-semibold text-white">Recent Announcements</h3>
                            </div>
                            <div className="divide-y divide-gray-800/50">
                                {announcements.map((announcement) => (
                                    <div key={announcement._id} className="p-4 hover:bg-gray-800/20 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs ${announcement.type === 'feature' || announcement.type === 'success'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : announcement.type === 'warning'
                                                                ? 'bg-orange-500/20 text-orange-400'
                                                                : 'bg-cyan-500/20 text-cyan-400'
                                                            }`}
                                                    >
                                                        {announcement.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {format(new Date(announcement.createdAt), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <h4 className="text-white font-medium mb-1">{announcement.title}</h4>
                                                <p className="text-sm text-gray-400">{announcement.message}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700/50">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteMutation.mutate(announcement._id)}
                                                    disabled={deleteMutation.isLoading}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'moderation' && (
                    <motion.div
                        key="moderation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GlassCard neonColor="orange" padding="p-0">
                            <div className="p-4 border-b border-orange-500/10">
                                <h3 className="text-lg font-semibold text-white">Reported Posts</h3>
                            </div>
                            <div className="divide-y divide-gray-800/50">
                                {reports.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                                        <p>No reported posts! 🎉</p>
                                    </div>
                                ) : (
                                    reports.map((post) => (
                                        <div key={post.id} className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                                    {post.user?.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white font-medium">{post.user?.name || 'Unknown User'}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mb-2">{post.content}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                                            Reported: {post.reason}
                                                        </span>
                                                        <span className="text-xs text-gray-500">by {post.reportedBy}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <NeonButton
                                                        variant="danger"
                                                        size="sm"
                                                        icon={Trash2}
                                                        onClick={() => deletePostMutation.mutate(post.id)}
                                                        loading={deletePostMutation.isLoading}
                                                    >
                                                        Delete
                                                    </NeonButton>
                                                    <NeonButton
                                                        variant="danger"
                                                        size="sm"
                                                        icon={Ban}
                                                        onClick={() => {
                                                            const reason = window.prompt("Enter ban reason:");
                                                            if (reason) {
                                                                banMutation.mutate({ userId: post.user?._id, reason, duration: 24 });
                                                            }
                                                        }}
                                                        loading={banMutation.isLoading}
                                                    >
                                                        Ban (24h)
                                                    </NeonButton>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'banned' && (
                    <motion.div
                        key="banned"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GlassCard neonColor="red" padding="p-6">
                            <div className="text-center py-8 text-gray-500">
                                <Ban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Banned users list</p>
                                <p className="text-sm">No users are currently banned</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Announcement Modal */}
            <AnimatePresence>
                {showAnnouncementModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAnnouncementModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(15, 15, 25, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                            }}
                        >
                            <div className="p-6 border-b border-cyan-500/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Megaphone className="w-6 h-6 text-cyan-400" />
                                    Create Announcement
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'info', label: 'Info', color: 'cyan' },
                                            { id: 'feature', label: 'Feature', color: 'green' },
                                            { id: 'warning', label: 'Warning', color: 'orange' },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewAnnouncement({ ...newAnnouncement, type: type.id })}
                                                className={`px-4 py-2 rounded-lg text-sm transition-all ${newAnnouncement.type === type.id
                                                    ? `bg-${type.color}-500/20 text-${type.color}-400 border border-${type.color}-500/50`
                                                    : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        placeholder="Announcement title..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Content</label>
                                    <textarea
                                        value={newAnnouncement.message}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                        placeholder="Write your announcement..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white outline-none focus:border-cyan-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-cyan-500/10 flex gap-3">
                                <NeonButton variant="ghost" fullWidth onClick={() => setShowAnnouncementModal(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton variant="primary" fullWidth icon={Send} onClick={handleCreateAnnouncement}>
                                    Publish
                                </NeonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CommunityCommand;
