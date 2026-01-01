import Notification from '../models/Notification.js';

class NotificationService {
    /**
     * Create and send a notification
     */
    static async send(data, io = null) {
        const { userId, type, title, message, relatedTo, action, priority, data: metadata } = data;

        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            relatedTo,
            action,
            priority,
            data: metadata
        });

        // Emit via Socket.io if io instance provided
        if (io) {
            io.to(`user:${userId}`).emit('notification:new', notification);
        }

        return notification;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        return notification;
    }

    /**
     * Mark all as read
     */
    static async markAllAsRead(userId) {
        await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );
    }
}

export default NotificationService;
