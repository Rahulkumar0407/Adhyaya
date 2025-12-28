import Notification from '../models/Notification.js';
import NotificationService from '../services/notificationService.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getMyNotifications = catchAsync(async (req, res, next) => {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
    });
});

export const markAsRead = catchAsync(async (req, res, next) => {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { notification }
    });
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
    await NotificationService.markAllAsRead(req.user.id);

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
    });
});
