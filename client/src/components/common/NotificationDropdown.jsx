import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Wallet, Gift, MessageCircle, Trophy, Flame, Megaphone, X } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            // Handle both response formats: { success: true, data: [...] } or { status: 'success', data: { notifications: [...] } }
            const notifs = response.data.data?.notifications || response.data.data || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.isRead).length || 0);
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
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
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
            'wallet-credit': 'text-green-400 bg-green-500/10',
            'bonus': 'text-amber-400 bg-amber-500/10',
            'payment-success': 'text-green-400 bg-green-500/10',
            'doubt-reply': 'text-cyan-400 bg-cyan-500/10',
            'badge-earned': 'text-purple-400 bg-purple-500/10',
            'level-up': 'text-orange-400 bg-orange-500/10',
            'announcement': 'text-blue-400 bg-blue-500/10',
            'default': 'text-gray-400 bg-gray-500/10'
        };
        return colorMap[type] || colorMap.default;
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch on mount and when opened
    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-500 hover:text-orange-400 p-2 transition-colors group"
            >
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 rounded-full text-[10px] font-bold text-white border-2 border-[#0a0a0a]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Bell className="w-4 h-4 text-orange-400" />
                                Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                    >
                                        <CheckCheck className="w-3 h-3" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="w-6 h-6 border-2 border-gray-600 border-t-orange-400 rounded-full animate-spin mx-auto mb-2" />
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                    <p className="text-gray-600 text-xs mt-1">We'll notify you when something happens</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800/50">
                                    {notifications.map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);
                                        const colorClass = getNotificationColor(notification.type);

                                        return (
                                            <div
                                                key={notification._id}
                                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                                                className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-gray-800/30' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`p-2 rounded-xl ${colorClass}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 mt-2">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {notification.action?.url && (
                                                    <a
                                                        href={notification.action.url}
                                                        className="mt-2 ml-10 inline-block text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                                    >
                                                        {notification.action.label || 'View'} →
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-800 bg-gray-900/80">
                                <button
                                    onClick={() => window.location.href = '/notifications'}
                                    className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
