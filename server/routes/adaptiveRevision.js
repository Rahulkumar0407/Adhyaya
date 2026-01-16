import express from 'express';
import { protect } from '../middleware/auth.js';
import AdaptiveRevision from '../models/AdaptiveRevision.js';
import LectureProgress from '../models/LectureProgress.js';
import {
    generateRevisionSchedule,
    adjustScheduleBasedOnPerformance,
    generateCatchupPlan,
    getSmartSuggestions
} from '../services/revisionScheduler.js';

import { checkGlobalLimit } from '../middleware/checkLimit.js';

const router = express.Router();

// ========================================
// LECTURE UNDERSTANDING FEEDBACK
// ========================================

/**
 * @route   POST /api/adaptive-revision/feedback
 * @desc    Submit understanding after completing a lecture
 * @access  Private
 */
router.post('/feedback', protect, checkGlobalLimit('adaptiveRevision'), async (req, res) => {
    try {
        const {
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            understandingLevel,
            notes,
            timeSpent,
            videoWatchedFully
        } = req.body;

        // Validate required fields
        if (!course || !topicId || !topicTitle || !understandingLevel) {
            return res.status(400).json({
                success: false,
                message: 'course, topicId, topicTitle, and understandingLevel are required'
            });
        }

        // Get user with subscription info
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        // Initialize subscription if not exists
        if (!user.adaptiveRevisionSubscription) {
            user.adaptiveRevisionSubscription = {
                plan: 'free_trial',
                lecturesUsed: 0,
                maxFreeLectures: 3
            };
        }

        const subscription = user.adaptiveRevisionSubscription;

        // Check if this is a NEW lecture (not updating existing)
        let lectureProgress = await LectureProgress.findOne({
            user: req.user._id,
            course,
            topicId,
            lessonId: lessonId || null
        });

        const isNewLecture = !lectureProgress;

        // Check subscription limits for NEW lectures only
        if (isNewLecture && subscription.plan === 'free_trial') {
            if (subscription.lecturesUsed >= subscription.maxFreeLectures) {
                return res.status(403).json({
                    success: false,
                    message: 'Free trial limit reached. Upgrade to Premium for unlimited access.',
                    requiresUpgrade: true,
                    lecturesUsed: subscription.lecturesUsed,
                    maxFreeLectures: subscription.maxFreeLectures
                });
            }
        }

        // Check if premium expired
        if (subscription.plan === 'premium' && subscription.expiresAt) {
            if (new Date() > new Date(subscription.expiresAt)) {
                subscription.plan = 'expired';
                await user.save();
                return res.status(403).json({
                    success: false,
                    message: 'Your premium subscription has expired. Please renew.',
                    requiresUpgrade: true,
                    expired: true
                });
            }
        }

        if (lectureProgress) {
            // Update existing progress
            await lectureProgress.updateUnderstanding(understandingLevel);
            if (notes) lectureProgress.notes = notes;
            if (timeSpent) lectureProgress.timeSpent = timeSpent;
            if (videoWatchedFully !== undefined) lectureProgress.videoWatchedFully = videoWatchedFully;
            await lectureProgress.save();
        } else {
            // Create new progress
            lectureProgress = await LectureProgress.create({
                user: req.user._id,
                course,
                topicId,
                topicTitle,
                lessonId,
                lessonTitle,
                understandingLevel,
                notes,
                timeSpent,
                videoWatchedFully
            });

            // Increment lectures used for free trial
            if (subscription.plan === 'free_trial') {
                subscription.lecturesUsed += 1;
            }
        }

        // Generate revision schedule if not already done
        let revisions = [];
        if (!lectureProgress.revisionGenerated) {
            const result = await generateRevisionSchedule(lectureProgress._id);
            revisions = result.revisions;
        }

        // Award points for completing lecture
        user.babuaCoins += 5; // 5 coins for completing with feedback
        user.updateStreak();
        await user.save();

        res.json({
            success: true,
            data: {
                lectureProgress,
                revisionsCreated: revisions.length,
                coinsEarned: 5,
                subscription: {
                    plan: subscription.plan,
                    lecturesUsed: subscription.lecturesUsed,
                    maxFreeLectures: subscription.maxFreeLectures,
                    remaining: subscription.plan === 'free_trial'
                        ? subscription.maxFreeLectures - subscription.lecturesUsed
                        : 'unlimited'
                }
            }
        });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// REVISION PLAN VIEWS
// ========================================

/**
 * @route   GET /api/adaptive-revision/plan
 * @desc    Get revision plan (day/week/month view)
 * @access  Private
 */
router.get('/plan', protect, async (req, res) => {
    try {
        const { view = 'week' } = req.query;

        const revisions = await AdaptiveRevision.getRevisionPlan(req.user._id, view);

        // Group by date
        const grouped = {};
        revisions.forEach(rev => {
            const dateKey = rev.scheduledDate.toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(rev);
        });

        res.json({
            success: true,
            data: {
                view,
                total: revisions.length,
                revisions,
                grouped
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/adaptive-revision/today
 * @desc    Get today's revision targets
 * @access  Private
 */
router.get('/today', protect, async (req, res) => {
    try {
        const revisions = await AdaptiveRevision.getTodayRevisions(req.user._id);
        const overdue = await AdaptiveRevision.getOverdueRevisions(req.user._id);

        res.json({
            success: true,
            data: {
                today: revisions,
                todayCount: revisions.length,
                overdue,
                overdueCount: overdue.length,
                totalPending: revisions.length + overdue.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/adaptive-revision/missed
 * @desc    Get overdue/missed revisions
 * @access  Private
 */
router.get('/missed', protect, async (req, res) => {
    try {
        const missed = await AdaptiveRevision.getOverdueRevisions(req.user._id);

        res.json({
            success: true,
            data: {
                missed,
                count: missed.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/adaptive-revision/upcoming
 * @desc    Get upcoming revisions (next N days)
 * @access  Private
 */
router.get('/upcoming', protect, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const revisions = await AdaptiveRevision.getUpcomingRevisions(req.user._id, parseInt(days));

        res.json({
            success: true,
            data: {
                revisions,
                count: revisions.length,
                days: parseInt(days)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// REVISION COMPLETION
// ========================================

/**
 * @route   POST /api/adaptive-revision/complete/:id
 * @desc    Mark a revision as complete with performance
 * @access  Private
 */
router.post('/complete/:id', protect, async (req, res) => {
    try {
        const { accuracy, timeSpent, quizId } = req.body;

        const revision = await AdaptiveRevision.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!revision) {
            return res.status(404).json({
                success: false,
                message: 'Revision not found'
            });
        }

        await revision.complete({
            accuracy,
            attempts: (revision.performance?.attempts || 0) + 1,
            quizId
        });

        revision.actualTimeSpent = timeSpent;
        await revision.save();

        // Adjust future schedule based on performance
        let adjustment = null;
        if (accuracy !== undefined) {
            adjustment = await adjustScheduleBasedOnPerformance(
                req.user._id,
                revision.topicId,
                revision.course,
                accuracy
            );
        }

        // Award coins
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        let coinsEarned = 5;
        if (accuracy >= 85) coinsEarned = 15;
        else if (accuracy >= 70) coinsEarned = 10;

        user.babuaCoins += coinsEarned;
        user.updateStreak();
        await user.save();

        res.json({
            success: true,
            data: {
                revision,
                adjustment,
                coinsEarned
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/adaptive-revision/reschedule/:id
 * @desc    Reschedule a revision to a new date
 * @access  Private
 */
router.post('/reschedule/:id', protect, async (req, res) => {
    try {
        const { newDate, reason } = req.body;

        const revision = await AdaptiveRevision.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!revision) {
            return res.status(404).json({
                success: false,
                message: 'Revision not found'
            });
        }

        if (revision.rescheduleCount >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum reschedule limit (3) reached'
            });
        }

        await revision.reschedule(new Date(newDate), reason);

        res.json({
            success: true,
            data: revision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// STATS & INSIGHTS
// ========================================

/**
 * @route   GET /api/adaptive-revision/stats
 * @desc    Get retention score, streak, completion stats
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const { course } = req.query;

        const retentionScore = await AdaptiveRevision.getRetentionScore(req.user._id, course);
        const streak = await AdaptiveRevision.getRevisionStreak(req.user._id);
        const todayCount = (await AdaptiveRevision.getTodayRevisions(req.user._id)).length;
        const overdueCount = (await AdaptiveRevision.getOverdueRevisions(req.user._id)).length;

        // Understanding distribution
        const understandingStats = course
            ? await LectureProgress.getUnderstandingStats(req.user._id, course)
            : null;

        res.json({
            success: true,
            data: {
                retentionScore: retentionScore.score,
                streak,
                todayCount,
                overdueCount,
                completionRate: retentionScore.completionRate,
                avgAccuracy: retentionScore.avgAccuracy,
                totalRevisions: retentionScore.total,
                completedRevisions: retentionScore.completed,
                missedRevisions: retentionScore.missed,
                understandingStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// SMART FEATURES
// ========================================

/**
 * @route   POST /api/adaptive-revision/catchup
 * @desc    Generate smart catch-up plan for missed revisions
 * @access  Private
 */
router.post('/catchup', protect, async (req, res) => {
    try {
        const result = await generateCatchupPlan(req.user._id);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   GET /api/adaptive-revision/suggestions
 * @desc    Get smart suggestions for weak topics
 * @access  Private
 */
router.get('/suggestions', protect, async (req, res) => {
    try {
        const suggestions = await getSmartSuggestions(req.user._id);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/adaptive-revision/custom
 * @desc    User creates their own custom revision
 * @access  Private
 */
router.post('/custom', protect, async (req, res) => {
    try {
        const {
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            scheduledDate,
            revisionType,
            estimatedMinutes
        } = req.body;

        if (!course || !topicId || !topicTitle || !scheduledDate) {
            return res.status(400).json({
                success: false,
                message: 'course, topicId, topicTitle, and scheduledDate are required'
            });
        }

        const revision = await AdaptiveRevision.create({
            user: req.user._id,
            course,
            topicId,
            topicTitle,
            lessonId,
            lessonTitle,
            initialUnderstanding: 'partial', // Default for custom
            scheduledDate: new Date(scheduledDate),
            intervalDay: 0, // Custom
            revisionType: revisionType || 'recall',
            priority: 'medium',
            whyScheduled: 'Self-scheduled revision',
            estimatedMinutes: estimatedMinutes || 10
        });

        res.json({
            success: true,
            data: revision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

/**
 * @route   GET /api/adaptive-revision/subscription
 * @desc    Get user's adaptive revision subscription status
 * @access  Private
 */
router.get('/subscription', protect, async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        // Initialize subscription if not exists
        if (!user.adaptiveRevisionSubscription) {
            user.adaptiveRevisionSubscription = {
                plan: 'free_trial',
                lecturesUsed: 0,
                maxFreeLectures: 3
            };
            await user.save();
        }

        const subscription = user.adaptiveRevisionSubscription;

        // Check if premium expired
        let isExpired = false;
        if (subscription.plan === 'premium' && subscription.expiresAt) {
            if (new Date() > new Date(subscription.expiresAt)) {
                subscription.plan = 'expired';
                isExpired = true;
                await user.save();
            }
        }

        res.json({
            success: true,
            data: {
                plan: subscription.plan,
                lecturesUsed: subscription.lecturesUsed,
                maxFreeLectures: subscription.maxFreeLectures,
                remaining: subscription.plan === 'free_trial'
                    ? Math.max(0, subscription.maxFreeLectures - subscription.lecturesUsed)
                    : 'unlimited',
                canAddMore: subscription.plan === 'premium' ||
                    (subscription.plan === 'free_trial' && subscription.lecturesUsed < subscription.maxFreeLectures),
                subscribedAt: subscription.subscribedAt,
                expiresAt: subscription.expiresAt,
                isExpired,
                price: {
                    amount: 60,
                    currency: 'INR',
                    period: 'month'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/adaptive-revision/subscribe
 * @desc    Request premium subscription (requires admin verification after payment)
 * @access  Private
 */
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment reference required. Please use wallet payment or contact admin.'
            });
        }

        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user._id);

        // Mark payment as pending admin verification
        // Admin will need to manually verify and upgrade via admin panel
        user.adaptiveRevisionSubscription = {
            ...user.adaptiveRevisionSubscription,
            pendingPaymentId: paymentId,
            pendingPaymentDate: new Date(),
            pendingUpgrade: true
        };

        await user.save();

        res.json({
            success: true,
            message: 'Payment recorded! Your subscription will be activated within 24 hours after admin verification.',
            data: {
                status: 'pending_verification',
                paymentId: paymentId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/adaptive-revision/subscribe-with-wallet
 * @desc    Upgrade to premium subscription using wallet balance
 * @access  Private
 */
router.post('/subscribe-with-wallet', protect, async (req, res) => {
    try {
        const PREMIUM_PRICE = 60; // ₹60 per month

        const User = (await import('../models/User.js')).default;
        const Wallet = (await import('../models/Wallet.js')).default;

        const user = await User.findById(req.user._id);
        let wallet = await Wallet.findOne({ user: req.user._id });

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = await Wallet.create({ user: req.user._id, balance: 0 });
        }

        // Check if user has sufficient balance
        if (wallet.balance < PREMIUM_PRICE) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. You need ₹${PREMIUM_PRICE} but have ₹${wallet.balance}.`,
                requiredAmount: PREMIUM_PRICE,
                currentBalance: wallet.balance,
                shortfall: PREMIUM_PRICE - wallet.balance
            });
        }

        // Deduct from wallet
        wallet.balance -= PREMIUM_PRICE;
        wallet.transactions.push({
            type: 'subscription',
            amount: -PREMIUM_PRICE,
            description: 'Adaptive Revision Premium - 1 Month',
            status: 'completed',
            metadata: {
                feature: 'adaptive-revision',
                plan: 'premium',
                duration: '30 days'
            }
        });
        await wallet.save();

        // Upgrade subscription
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        user.adaptiveRevisionSubscription = {
            plan: 'premium',
            lecturesUsed: user.adaptiveRevisionSubscription?.lecturesUsed || 0,
            maxFreeLectures: 3, // Keep for reference
            subscribedAt: now,
            expiresAt: expiresAt,
            paymentId: `wallet_${Date.now()}`
        };

        await user.save();

        res.json({
            success: true,
            message: 'Successfully upgraded to Premium!',
            data: {
                plan: 'premium',
                subscribedAt: now,
                expiresAt: expiresAt,
                amountDeducted: PREMIUM_PRICE,
                newWalletBalance: wallet.balance
            }
        });
    } catch (error) {
        console.error('Wallet subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
