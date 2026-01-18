import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import Doubt from '../models/Doubt.js';
import Call from '../models/Call.js';
import Wallet from '../models/Wallet.js';
import Activity from '../models/Activity.js';
import LectureProgress from '../models/LectureProgress.js';
import jwt from 'jsonwebtoken';
import Coupon from '../models/Coupon.js';
import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Post from '../models/Post.js'; // Assuming you have a Post model for community
import NotificationService from '../src/services/notificationService.js';
import Notification from '../models/Notification.js';
import SystemConfig from '../models/SystemConfig.js';

const router = express.Router();

// Middleware to verify JWT and check admin role
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Apply admin auth to all routes
router.use(adminAuth);

// ==================== ADMIN STATS ====================

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalMentors,
            activeDoubts,
            activeCalls,
            todayStart,
        ] = await Promise.all([
            User.countDocuments(),
            Mentor.countDocuments({ applicationStatus: 'approved' }),
            Doubt.countDocuments({ status: { $nin: ['resolved', 'answered'] } }),
            Call.countDocuments({ status: 'ongoing' }),
            new Date().setHours(0, 0, 0, 0),
        ]);

        // Calculate total revenue from all wallets
        const walletStats = await Wallet.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalTopups' },
                },
            },
        ]);

        // Count today's transactions
        const todayTransactions = await Wallet.aggregate([
            { $unwind: '$transactions' },
            {
                $match: {
                    'transactions.createdAt': { $gte: new Date(todayStart) },
                },
            },
            { $count: 'count' },
        ]);

        res.json({
            success: true,
            totalUsers,
            totalMentors,
            totalRevenue: walletStats[0]?.totalRevenue || 0,
            activeDoubts,
            activeCalls,
            todayTransactions: todayTransactions[0]?.count || 0,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - Search and list users
router.get('/users', async (req, res) => {
    try {
        const { search, role, isActive, limit = 50, page = 1 } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const stats = {
            total: await User.countDocuments(),
            active: await User.countDocuments({ isActive: true }),
            students: await User.countDocuments({ role: 'student' }),
            mentors: await User.countDocuments({ role: 'mentor' }),
            admins: await User.countDocuments({ role: 'admin' }),
        };

        res.json({ success: true, users, stats });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/:id - Get full user dossier
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch related data
        const [wallet, activities, revisions] = await Promise.all([
            Wallet.findOne({ user: user._id }),
            Activity.find({ user: user._id }).sort({ date: -1 }).limit(30),
            LectureProgress.find({ user: user._id }).sort({ completedAt: -1 }).limit(20),
        ]);

        res.json({
            success: true,
            user,
            wallet,
            activities,
            revisions,
        });
    } catch (error) {
        console.error('User dossier error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user dossier' });
    }
});

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

// POST /api/admin/users/:id/toggle-access
router.post('/users/:id/toggle-access', async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user, message: `User ${isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        console.error('Toggle access error:', error);
        res.status(500).json({ success: false, message: 'Failed to update access' });
    }
});

// POST /api/admin/users/:id/unlock-feature
router.post('/users/:id/unlock-feature', async (req, res) => {
    try {
        const { feature, durationDays = 30 } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        if (feature === 'adaptiveRevision') {
            user.adaptiveRevisionSubscription = {
                plan: 'premium',
                lecturesUsed: 0,
                maxFreeLectures: 9999, // unlimited
                subscribedAt: new Date(),
                expiresAt: expiresAt,
                paymentId: 'admin_override_' + Date.now()
            };
        } else if (feature === 'mentorCircle') {
            user.mentorCircleSubscription = {
                plan: 'premium',
                subscribedAt: new Date(),
                expiresAt: expiresAt,
                paymentId: 'admin_override_' + Date.now()
            };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid feature specified' });
        }

        await user.save();
        await user.save();

        // Send notification
        try {
            await NotificationService.send({
                userId: user._id,
                type: 'achievement',
                title: '🔓 Premium Feature Unlocked!',
                message: `An admin has manually unlocked the ${feature} feature for you. Enjoy your premium access!`,
                priority: 'high',
                action: {
                    label: 'View Features',
                    url: feature === 'mentorCircle' ? '/chai-tapri' : '/revision'
                }
            }, req.app.get('io'));
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.json({ success: true, message: `${feature} unlocked successfully` });

    } catch (error) {
        console.error('Unlock feature error:', error);
        res.status(500).json({ success: false, message: 'Failed to unlock feature' });
    }
});

// POST /api/admin/users/:id/lock-feature
router.post('/users/:id/lock-feature', async (req, res) => {
    try {
        const { feature } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (feature === 'adaptiveRevision') {
            user.adaptiveRevisionSubscription = undefined; // Remove subscription
        } else if (feature === 'mentorCircle') {
            user.mentorCircleSubscription = undefined; // Remove subscription
        } else {
            return res.status(400).json({ success: false, message: 'Invalid feature specified' });
        }

        await user.save();

        res.json({ success: true, message: `${feature} locked successfully` });

    } catch (error) {
        console.error('Lock feature error:', error);
        res.status(500).json({ success: false, message: 'Failed to lock feature' });
    }
});

// POST /api/admin/users/:id/refund
router.post('/users/:id/refund', async (req, res) => {
    try {
        const { amount, reason } = req.body;

        const wallet = await Wallet.findOne({ user: req.params.id });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }

        await wallet.refund(parseFloat(amount), null, reason);

        // Send notification
        try {
            await NotificationService.send({
                userId: req.params.id,
                type: 'wallet-credit', // Refunds are technically credits
                title: '💸 Refund Processed',
                message: `A refund of ₹${amount} has been credited to your wallet. ${reason ? `Reason: ${reason}` : ''}`,
                priority: 'normal',
                action: {
                    label: 'View Wallet',
                    url: '/wallet'
                },
                data: { amount: parseFloat(amount), reason }
            }, req.app.get('io'));
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.json({ success: true, message: 'Refund processed successfully' });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ success: false, message: 'Failed to process refund' });
    }
});

// POST /api/admin/users/:id/ban
router.post('/users/:id/ban', async (req, res) => {
    try {
        const { reason, duration } = req.body; // duration in hours
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot ban admin' });

        user.isActive = false;
        user.banReason = reason;

        // Invalidate tokens
        user.refreshToken = null;

        if (duration) {
            user.bannedUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
        }

        await user.save();

        // Emit socket event to force logout
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${user._id}`).emit('user:banned', {
                reason: reason || 'Violation of terms',
                bannedUntil: user.bannedUntil
            });
            // Also disconnect sockets for this user
            const sockets = await io.in(`user:${user._id}`).fetchSockets();
            sockets.forEach(socket => {
                socket.emit('force_disconnect', { reason: 'Account Banned' });
                socket.disconnect(true);
            });
        }

        res.json({ success: true, message: 'User banned successfully' });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ success: false, message: 'Failed to ban user' });
    }
});

// POST /api/admin/users/:id/unban
router.post('/users/:id/unban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isActive = true;
        user.banReason = undefined;
        user.bannedUntil = undefined;

        await user.save();
        res.json({ success: true, message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ success: false, message: 'Failed to unban user' });
    }
});

// GET /api/admin/community/reports
router.get('/community/reports', async (req, res) => {
    try {
        const posts = await Post.find({ 'reports.0': { $exists: true } })
            .populate('user', 'name avatar')
            .populate('reports.user', 'name') // Populate reporter name
            .sort({ 'reports.createdAt': -1 });

        // Map to simpler structure
        const reports = posts.map(post => ({
            id: post._id,
            content: post.content,
            user: post.user,
            reportCount: post.reports.length,
            reason: post.reports[post.reports.length - 1].reason,
            reportedBy: post.reports[post.reports.length - 1].user?.name || 'Unknown',
            createdAt: post.reports[post.reports.length - 1].createdAt
        }));

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reported posts' });
    }
});

// DELETE /api/admin/community/posts/:id
router.delete('/community/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});

// ==================== COURSE MANAGEMENT ====================

// GET /api/admin/courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        console.error('Fetch courses error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
});

// POST /api/admin/courses
router.post('/courses', async (req, res) => {
    try {
        const { title, slug, description, type, price, status } = req.body;

        let courseSlug = slug;
        if (!courseSlug) {
            courseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        const existing = await Course.findOne({ slug: courseSlug });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Course slug already exists' });
        }

        const course = new Course({
            title,
            slug: courseSlug,
            description,
            type,
            price,
            status,
            createdBy: req.user._id
        });

        await course.save();
        res.status(201).json({ success: true, course, message: 'Course created successfully' });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ success: false, message: 'Failed to create course' });
    }
});

// PATCH /api/admin/courses/:id
router.patch('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        res.json({ success: true, course, message: 'Course updated successfully' });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, message: 'Failed to update course' });
    }
});

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
});

// POST /api/admin/users/credit-points - Credit points to user by email
router.post('/users/credit-points', async (req, res) => {
    try {
        const { email, userId, amount, reason, type = 'money' } = req.body;

        if (!amount) { // Allow negative for debit
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // Find user by email or ID
        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase().trim() });
        } else if (userId) {
            user = await User.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let oldBalance = 0;
        let newBalance = 0;
        let currencySymbol = '₹';

        if (type === 'coins') {
            // Credit Babua Coins logic
            oldBalance = user.babuaCoins || 0;
            user.babuaCoins = (user.babuaCoins || 0) + parseFloat(amount);
            await user.save();
            newBalance = user.babuaCoins;
            currencySymbol = '🪙';

            // Send notification for COINS
            try {
                await NotificationService.send({
                    userId: user._id,
                    type: 'achievement', // Use achievement or similar type for gamification
                    title: '🪙 Babua Coins Credited!',
                    message: reason || `You received ${amount} Babua Coins from Admin!`,
                    priority: 'high',
                    action: {
                        label: 'View Profile',
                        url: '/profile' // Or wherever coins are shown
                    },
                    data: {
                        amount: parseFloat(amount),
                        newBalance: newBalance,
                        creditedBy: 'Admin'
                    }
                }, req.app.get('io'));
            } catch (notifError) {
                console.log('Notification not sent (optional):', notifError.message);
            }

        } else {
            // Credit Wallet Money logic (Default)
            let wallet = await Wallet.findOne({ user: user._id });
            if (!wallet) {
                wallet = new Wallet({ user: user._id });
            }

            oldBalance = wallet.balance;
            const creditDescription = reason || `Bonus credit: ₹${amount}`;

            // Add bonus points
            wallet.balance += parseFloat(amount);
            wallet.totalTopups += parseFloat(amount);
            wallet.transactions.push({
                type: 'topup',
                amount: parseFloat(amount),
                description: creditDescription,
                status: 'completed',
                balanceAfter: wallet.balance,
                metadata: {
                    gateway: 'admin_credit',
                    creditedBy: req.user._id
                }
            });

            await wallet.save();
            newBalance = wallet.balance;

            // Send notification to user
            try {
                await NotificationService.send({
                    userId: user._id,
                    type: 'wallet-credit',
                    title: '💰 Wallet Credited!',
                    message: creditDescription,
                    priority: 'high',
                    action: {
                        label: 'View Wallet',
                        url: '/wallet'
                    },
                    data: {
                        amount: parseFloat(amount),
                        newBalance: wallet.balance,
                        creditedBy: 'Admin'
                    }
                }, req.app.get('io'));
            } catch (notifError) {
                console.log('Notification not sent (optional):', notifError.message);
            }
        }

        res.json({
            success: true,
            message: `Successfully credited ${currencySymbol}${amount} to ${user.email}`,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                oldBalance,
                newBalance,
                credited: parseFloat(amount),
                type
            }
        });
    } catch (error) {
        console.error('Credit points error:', error);
        res.status(500).json({ success: false, message: 'Failed to credit points' });
    }
});

// POST /api/admin/users/credit-all - Credit points to ALL active users
router.post('/users/credit-all', async (req, res) => {
    try {
        const { amount, reason, type = 'money' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // 1. Find all active users (students & mentors)
        const users = await User.find({ isActive: true }).select('_id');

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'No active users found' });
        }

        const creditDescription = reason || `Bonus credit: ${type === 'coins' ? '🪙' : '₹'}${amount}`;

        if (type === 'coins') {
            // --- Coins Logic ---
            await User.updateMany(
                { isActive: true },
                { $inc: { babuaCoins: parseFloat(amount) } }
            );

            // Notifications for Coins
            const notificationOps = users.map(user => ({
                insertOne: {
                    document: {
                        user: user._id,
                        type: 'achievement',
                        title: '🪙 Babua Coins Credited!',
                        message: creditDescription,
                        priority: 'high',
                        action: { label: 'View Profile', url: '/profile' },
                        isRead: false,
                        channels: { inApp: true, email: false, push: false },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }));

            await mongoose.models.Notification.bulkWrite(notificationOps);

            // Global Socket Emit
            const io = req.app.get('io');
            if (io) {
                io.emit('notification:global', {
                    title: '🪙 Babua Coins Credited!',
                    message: creditDescription
                });
            }

        } else {
            // --- Wallet Money Logic (Existing) ---
            const bulkOps = users.map(user => ({
                updateOne: {
                    filter: { user: user._id },
                    update: {
                        $inc: { balance: parseFloat(amount), totalTopups: parseFloat(amount) },
                        $push: {
                            transactions: {
                                _id: new mongoose.Types.ObjectId(),
                                type: 'topup',
                                amount: parseFloat(amount),
                                description: creditDescription,
                                status: 'completed',
                                balanceAfter: 0,
                                metadata: {
                                    gateway: 'admin_bulk_credit',
                                    creditedBy: req.user._id
                                },
                                createdAt: new Date()
                            }
                        }
                    },
                    upsert: true
                }
            }));

            await Wallet.bulkWrite(bulkOps);

            // Notifications for Money
            const notificationOps = users.map(user => ({
                insertOne: {
                    document: {
                        user: user._id,
                        type: 'wallet-credit',
                        title: '💰 Bonus Points Credited!',
                        message: creditDescription,
                        priority: 'high',
                        action: { label: 'View Wallet', url: '/wallet' },
                        isRead: false,
                        channels: { inApp: true, email: false, push: false },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }));

            await mongoose.models.Notification.bulkWrite(notificationOps);

            // Global Socket Emit
            const io = req.app.get('io');
            if (io) {
                io.emit('notification:global', {
                    title: '💰 Bonus Points Credited!',
                    message: creditDescription
                });
            }
        }

        res.json({
            success: true,
            message: `Successfully credited ${type === 'coins' ? '🪙' : '₹'}${amount} to ${users.length} users`,
            count: users.length,
            type
        });

    } catch (error) {
        console.error('Credit all users error:', error);
        res.status(500).json({ success: false, message: 'Failed to credit all users' });
    }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'mentor', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user, message: 'Role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update role' });
    }
});

// POST /api/admin/users/:id/toggle-password-permission
// Grant or revoke user's ability to change their own password
router.post('/users/:id/toggle-password-permission', async (req, res) => {
    try {
        const { canChangePassword } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { canChangePassword: !!canChangePassword },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user,
            message: `Password change permission ${canChangePassword ? 'granted' : 'revoked'}`
        });
    } catch (error) {
        console.error('Toggle password permission error:', error);
        res.status(500).json({ success: false, message: 'Failed to update permission' });
    }
});

// ==================== MENTOR MANAGEMENT ====================

// GET /api/admin/mentors
router.get('/mentors', async (req, res) => {
    try {
        const { status, isOnline } = req.query;

        const query = {};
        if (status) query.applicationStatus = status;
        if (isOnline !== undefined) query.isOnline = isOnline === 'true';

        const mentors = await Mentor.find(query)
            .populate('user', 'name email avatar')
            .sort({ rating: -1 });

        res.json({ success: true, mentors });
    } catch (error) {
        console.error('Mentors fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
    }
});

// PATCH /api/admin/mentors/:id/status
router.patch('/mentors/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;

        const updateData = { applicationStatus: status };
        if (status === 'rejected') {
            updateData.rejectionReason = reason;
        } else if (status === 'approved') {
            updateData.isVerified = true;
            updateData.verifiedAt = new Date();
        }

        const mentor = await Mentor.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        // Update user role if approved
        if (status === 'approved') {
            await User.findByIdAndUpdate(mentor.user, { role: 'mentor' });
        }

        res.json({ success: true, mentor });
    } catch (error) {
        console.error('Mentor status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update mentor status' });
    }
});

// ==================== TRANSACTIONS ====================

// GET /api/admin/transactions/recent
router.get('/transactions/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const wallets = await Wallet.aggregate([
            { $unwind: '$transactions' },
            { $sort: { 'transactions.createdAt': -1 } },
            { $limit: parseInt(limit) },
            {
                $project: {
                    _id: '$transactions._id',
                    type: '$transactions.type',
                    amount: '$transactions.amount',
                    description: '$transactions.description',
                    status: '$transactions.status',
                    createdAt: '$transactions.createdAt',
                    userId: '$user',
                },
            },
        ]);

        res.json({ success: true, transactions: wallets });
    } catch (error) {
        console.error('Transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
});

// ==================== DOUBTS ====================

// GET /api/admin/doubts/kanban
router.get('/doubts/kanban', async (req, res) => {
    try {
        const doubts = await Doubt.find()
            .populate('student', 'name avatar')
            .populate('assignedMentor', 'name avatar')
            .sort({ priority: -1, createdAt: -1 })
            .limit(100);

        // Group by status
        const kanban = {
            pending: doubts.filter((d) => d.status === 'pending' || d.status === 'ai-reviewed'),
            inProgress: doubts.filter((d) => d.status === 'mentor-assigned' || d.status === 'in-progress'),
            resolved: doubts.filter((d) => d.status === 'answered' || d.status === 'resolved'),
        };

        res.json({ success: true, kanban });
    } catch (error) {
        console.error('Doubts kanban error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch doubts' });
    }
});

// ==================== CALLS ====================

// GET /api/admin/calls/active
router.get('/calls/active', async (req, res) => {
    try {
        const activeCalls = await Call.find({ status: 'ongoing' })
            .populate('student', 'name avatar')
            .populate({
                path: 'mentor',
                populate: { path: 'user', select: 'name avatar' },
            });

        // Calculate room counts
        const roomStats = {
            totalRooms: activeCalls.length,
            totalParticipants: activeCalls.length * 2, // Each call has 2 participants
        };

        res.json({ success: true, calls: activeCalls, roomStats });
    } catch (error) {
        console.error('Active calls error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch active calls' });
    }
});

// ==================== SERVER HEALTH ====================

// GET /api/admin/health
router.get('/health', async (req, res) => {
    try {
        const startTime = Date.now();

        // Test database connection
        await User.findOne().select('_id').lean();
        const dbLatency = Date.now() - startTime;

        res.json({
            success: true,
            status: 'healthy',
            apiLatency: 0, // Calculated on client
            dbStatus: 'connected',
            dbLatency,
            uptime: process.uptime(),
            memoryUsage: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                percentage: Math.round(
                    (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
                ),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'down',
            dbStatus: 'disconnected',
            message: error.message,
        });
    }
});

// ==================== GLOBAL SEARCH ====================

// GET /api/admin/search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, users: [], mentors: [], courses: [] });
        }

        const [users, mentors] = await Promise.all([
            User.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } },
                ],
            })
                .select('_id name email role avatar')
                .limit(5),
            Mentor.find({
                $or: [
                    { headline: { $regex: q, $options: 'i' } },
                    { expertise: { $regex: q, $options: 'i' } },
                ],
            })
                .populate('user', 'name avatar')
                .limit(5),
        ]);

        res.json({ success: true, users, mentors, courses: [] });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});



// ==================== SYSTEM OPERATIONS ====================

// GET /api/admin/system/config
router.get('/system/config', async (req, res) => {
    try {
        const maintenance = await SystemConfig.getConfig('maintenance');
        const limits = await SystemConfig.getConfig('limits');

        res.json({
            success: true,
            config: {
                maintenance: maintenance || { enabled: false, message: '' },
                limits: limits || {
                    mockInterview: { max: 100, current: 0 },
                    quiz: { max: 500, current: 0 },
                    adaptiveRevision: { max: 200, current: 0 }
                }
            }
        });
    } catch (error) {
        console.error('Fetch system config error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch config' });
    }
});

// POST /api/admin/system/maintenance
router.post('/system/maintenance', async (req, res) => {
    try {
        const { enabled, message } = req.body;

        const config = await SystemConfig.setConfig('maintenance', {
            enabled,
            message: message || 'We are currently undergoing scheduled maintenance. We will be back soon!'
        }, req.user._id);

        // Broadcast maintenance change
        const io = req.app.get('io');
        if (io) {
            io.emit('system:maintenance', {
                enabled,
                message: config.value.message
            });

            // If enabled, force disconnect regular users (except admin, though backend doesn't know who is admin easily via socket without querying)
            // But client-side will handle the "logout" logic.
        }

        res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, config: config.value });
    } catch (error) {
        console.error('Maintenance toggle error:', error);
        res.status(500).json({ success: false, message: 'Failed to update maintenance mode' });
    }
});

// POST /api/admin/system/limits
router.post('/system/limits', async (req, res) => {
    try {
        const { limits } = req.body;
        // limits structure: { mockInterview: { max: 10 }, quiz: { max: 50 } }

        // Fetch existing to preserve 'current' counts if not resetting
        const existing = await SystemConfig.getConfig('limits') || {};

        const newLimits = {
            mockInterview: {
                max: limits.mockInterview?.max ?? (existing.mockInterview?.max || 100),
                current: existing.mockInterview?.current || 0
            },
            quiz: {
                max: limits.quiz?.max ?? (existing.quiz?.max || 500),
                current: existing.quiz?.current || 0
            },
            adaptiveRevision: {
                max: limits.adaptiveRevision?.max ?? (existing.adaptiveRevision?.max || 200),
                current: existing.adaptiveRevision?.current || 0
            }
        };

        const config = await SystemConfig.setConfig('limits', newLimits, req.user._id);
        res.json({ success: true, message: 'Usage limits updated', config: config.value });
    } catch (error) {
        console.error('Limit update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update limits' });
    }
});

// POST /api/admin/users/credit-all - Credit all active users
router.post('/users/credit-all', async (req, res) => {
    try {
        const { amount, reason, type = 'money' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const users = await User.find({ isActive: true }).select('_id');

        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'No active users found' });
        }

        if (type === 'coins') {
            // Simplified bulk update for Coins
            const result = await User.updateMany(
                { isActive: true },
                { $inc: { babuaCoins: parseFloat(amount) } }
            );

            // Send global notification via socket
            const io = req.app.get('io');
            io.emit('notification_global', {
                type: 'achievement',
                title: '🎉 Bonus Babua Coins!',
                message: reason || `Everyone received ${amount} Babua Coins! Enjoy!`,
                priority: 'high',
                data: { amount: parseFloat(amount) }
            });

            // Create individual generic notifications (optional, but good for history)
            const notificationOps = users.map(user => ({
                insertOne: {
                    document: {
                        userId: user._id,
                        type: 'achievement',
                        title: '🪙 Bonus Babua Coins!',
                        message: reason || `Global bonus: ${amount} Coins credited.`,
                        isRead: false,
                        priority: 'normal',
                        action: { label: 'View Profile', url: '/profile' },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }));

            // Batch insert notifications
            if (notificationOps.length > 0) {
                await mongoose.model('Notification').bulkWrite(notificationOps);
            }

            res.json({
                success: true,
                message: `Successfully credited 🪙${amount} to ${users.length} users`,
                count: users.length,
                type: 'coins'
            });

        } else {
            // Wallet Money Logic (Existing)
            const creditDescription = reason || `Global Bonus: ₹${amount}`;

            // Prepare wallet updates
            const bulkOps = users.map(user => ({
                updateOne: {
                    filter: { user: user._id },
                    update: {
                        $inc: { balance: parseFloat(amount), totalTopups: parseFloat(amount) },
                        $push: {
                            transactions: {
                                type: 'topup',
                                amount: parseFloat(amount),
                                description: creditDescription,
                                status: 'completed',
                                balanceAfter: 0, // Note: This won't be accurate in bulk write without fetching
                                metadata: {
                                    gateway: 'admin_bulk_credit',
                                    creditedBy: req.user._id,
                                    timestamp: new Date()
                                }
                            }
                        },
                        $setOnInsert: { user: user._id } // Create if not exists
                    },
                    upsert: true
                }
            }));

            await Wallet.bulkWrite(bulkOps);

            // Create global notification record for each user
            const notificationOps = users.map(user => ({
                insertOne: {
                    document: {
                        userId: user._id,
                        type: 'wallet-credit',
                        title: '💰 Global Bonus Credited!',
                        message: creditDescription,
                        isRead: false,
                        priority: 'high',
                        action: { label: 'View Wallet', url: '/wallet' },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }));

            await mongoose.model('Notification').bulkWrite(notificationOps);

            // Emit global event
            const io = req.app.get('io');
            io.emit('notification_global', {
                type: 'wallet-credit',
                title: '💰 Bonus Credit!',
                message: creditDescription,
                priority: 'high',
                data: { amount: parseFloat(amount) }
            });

            res.json({
                success: true,
                message: `Successfully credited ₹${amount} to ${users.length} users`,
                count: users.length
            });
        }

    } catch (error) {
        console.error('Credit all users error:', error);
        res.status(500).json({ success: false, message: 'Failed to credit all users' });
    }
});

// ==================== COUPON MANAGEMENT ====================

// GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error('Fetch coupons error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
});

// POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
    try {
        const { code, discountType, discountValue, validTo, usageLimit, minPurchase } = req.body;

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            validTo,
            usageLimit: usageLimit || null,
            minPurchase: minPurchase || 0,
            createdBy: req.user._id
        });

        await coupon.save();
        res.status(201).json({ success: true, coupon, message: 'Coupon created successfully' });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to create coupon' });
    }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
});

// ==================== COMMUNITY MODERATION ====================



// DELETE /api/admin/community/posts/:id
router.delete('/community/posts/:id', async (req, res) => {
    try {
        // Assuming Post model exists
        // await Post.findByIdAndDelete(req.params.id);
        // For now, mockup success
        res.json({ success: true, message: 'Post deleted (mock)' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});

// ==================== ANNOUNCEMENTS ====================

// GET /api/admin/announcements
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (error) {
        console.error('Fetch announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
});

// POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
    try {
        const { title, message, type, priority, targetAudience } = req.body;

        const announcement = new Announcement({
            title,
            message,
            type,
            priority,
            targetAudience,
            createdBy: req.user._id
        });

        await announcement.save();

        // Send notification to all users
        try {
            const io = req.app.get('io');

            // Build query for target users
            const userQuery = { isActive: true };
            if (targetAudience === 'students') userQuery.role = 'student';
            if (targetAudience === 'mentors') userQuery.role = 'mentor';

            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(u => u._id);

            // Send in batches or handle via queue in production
            for (const userId of userIds) {
                // Don't await individual sends to avoid timeout
                NotificationService.send({
                    userId,
                    type: 'announcement',
                    title: `📢 ${title}`,
                    message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
                    priority: priority === 'critical' ? 'urgent' : 'high',
                    data: { announcementId: announcement._id }
                }, io).catch(err => console.error(`Failed to notify user ${userId}`, err));
            }
        } catch (notifError) {
            console.error('Announcement notification error:', notifError);
        }

        // Emit socket event for real-time announcement updates in Chai Tapri
        const io = req.app.get('io');
        if (io) {
            io.emit('announcement:new', announcement);
        }

        res.status(201).json({ success: true, announcement, message: 'Announcement sent successfully' });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
});

// DELETE /api/admin/announcements/:id
router.delete('/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement' });
    }
});

// ==================== SYSTEM OPERATIONS ====================

// GET /api/admin/system/config
router.get('/system/config', async (req, res) => {
    try {
        const [maintenance, limits, globalSettings] = await Promise.all([
            SystemConfig.getConfig('maintenance'),
            SystemConfig.getConfig('limits'),
            SystemConfig.getConfig('global_settings')
        ]);

        res.json({
            success: true,
            config: {
                maintenance: maintenance || { enabled: false, message: '' },
                limits: limits || {},
                globalSettings: globalSettings || {}
            }
        });
    } catch (error) {
        console.error('Get system config error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch system config' });
    }
});

// POST /api/admin/system/maintenance
// POST /api/admin/system/maintenance
router.post('/system/maintenance', async (req, res) => {
    try {
        const { enabled, message } = req.body;

        const config = await SystemConfig.setConfig('maintenance', {
            enabled,
            message: message || 'System is under maintenance. Please try again later.'
        }, req.user._id);

        // Notify all clients via socket
        const io = req.app.get('io');
        if (io) {
            io.emit('system:maintenance', config.value);
        }

        res.json({ success: true, message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, config: config.value });
    } catch (error) {
        console.error('Toggle maintenance mode error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle maintenance mode' });
    }
});

// POST /api/admin/system/limits
router.post('/system/limits', async (req, res) => {
    try {
        const { limits } = req.body;

        const currentLimits = await SystemConfig.getConfig('limits') || {};
        const newLimits = { ...currentLimits, ...limits };

        const config = await SystemConfig.setConfig('limits', newLimits, req.user._id);

        res.json({ success: true, message: 'Usage limits updated', config: config.value });
    } catch (error) {
        console.error('Update limits error:', error);
        res.status(500).json({ success: false, message: 'Failed to update limits' });
    }
});

// ==========================================
// Payment Verification Routes
// ==========================================

// Get all pending transactions
router.get('/transactions/pending', async (req, res) => {
    try {
        // Find wallets that have pending transactions with manual gateway
        const wallets = await Wallet.find({
            'transactions.status': 'pending',
            'transactions.paymentGateway': 'manual'
        }).populate('user', 'name email');

        let pendingTransactions = [];

        wallets.forEach(wallet => {
            wallet.transactions.forEach(tx => {
                if (tx.status === 'pending' && tx.paymentGateway === 'manual') {
                    pendingTransactions.push({
                        _id: tx._id,
                        user: wallet.user,
                        amount: tx.amount,
                        utrNumber: tx.gatewayTransactionId,
                        orderId: tx.gatewayOrderId,
                        createdAt: tx.createdAt,
                        description: tx.description
                    });
                }
            });
        });

        // Sort by newest first
        pendingTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: pendingTransactions.length,
            transactions: pendingTransactions
        });
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending transactions' });
    }
});

// Approve a transaction
router.post('/transactions/:transactionId/approve', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const wallet = await Wallet.findOne({ 'transactions._id': transactionId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const transaction = wallet.transactions.id(transactionId);
        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction is not in pending state' });
        }

        // Approve transaction
        transaction.status = 'completed';
        wallet.balance += transaction.amount;
        wallet.totalTopups += transaction.amount;
        transaction.balanceAfter = wallet.balance;

        await wallet.save();

        // Notify user
        await Notification.create({
            user: wallet.user,
            title: 'Payment Approved! 🎉',
            message: `Your payment of ₹${transaction.amount} has been verified and added to your wallet.`,
            type: 'success',
            link: '/wallet'
        });

        res.json({ success: true, message: 'Transaction approved successfully' });
    } catch (error) {
        console.error('Error approving transaction:', error);
        res.status(500).json({ success: false, message: 'Failed to approve transaction' });
    }
});

// Reject a transaction
router.post('/transactions/:transactionId/reject', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const wallet = await Wallet.findOne({ 'transactions._id': transactionId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const transaction = wallet.transactions.id(transactionId);
        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction is not in pending state' });
        }

        // Reject transaction
        transaction.status = 'failed';
        await wallet.save();

        // Notify user
        await Notification.create({
            user: wallet.user,
            title: 'Payment Verification Failed ❌',
            message: `Your payment for ₹${transaction.amount} (UTR: ${transaction.gatewayTransactionId}) could not be verified. Please contact support.`,
            type: 'error',
            link: '/wallet'
        });

        res.json({ success: true, message: 'Transaction rejected successfully' });
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.status(500).json({ success: false, message: 'Failed to reject transaction' });
    }
});

export default router;
