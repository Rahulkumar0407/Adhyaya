import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Wallet, Gift, MessageCircle, Trophy, Flame, Megaphone, ArrowLeft, Trash2 } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            const notifs = response.data.data?.notifications || response.data.data || [];
            setNotifications(notifs);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        const iconMap = {
            'wallet-credit': Wallet,
            'bonus': Gift,
            'payment-success': Wallet,
            'doubt-reply': MessageCircle,
            'badge-earned': Trophy,
            'level-up': Flame,
            'announcement': Megaphone,
            'default': Bell
        };
        return iconMap[type] || iconMap.default;
    };

    // Get color based on notification type
    const getNotificationColor = (type) => {
        const colorMap = {
            'wallet-credit': 'from-green-500 to-emerald-600',
            'bonus': 'from-amber-500 to-orange-600',
            'payment-success': 'from-green-500 to-emerald-600',
            'doubt-reply': 'from-cyan-500 to-blue-600',
            'badge-earned': 'from-purple-500 to-violet-600',
            'level-up': 'from-orange-500 to-red-600',
            'announcement': 'from-blue-500 to-indigo-600',
            'default': 'from-gray-500 to-gray-600'
        };
        return colorMap[type] || colorMap.default;
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Bell className="w-6 h-6 text-orange-400" />
                                    Notifications
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-xl text-sm font-medium transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mt-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-600 border-t-orange-400 rounded-full animate-spin" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                        <h2 className="text-xl font-bold text-gray-400 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h2>
                        <p className="text-gray-600">
                            {filter === 'unread'
                                ? 'You\'re all caught up! 🎉'
                                : 'We\'ll notify you when something happens'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification, index) => {
                            const Icon = getNotificationIcon(notification.type);
                            const gradient = getNotificationColor(notification.type);

                            return (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${!notification.isRead
                                            ? 'bg-gray-900/80 border-gray-700 hover:border-gray-600'
                                            : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-900/60'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-gray-600">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                {notification.action?.url && (
                                                    <a
                                                        href={notification.action.url}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                                    >
                                                        {notification.action.label || 'View'} →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
