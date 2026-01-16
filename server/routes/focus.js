import express from 'express';
import FocusSession from '../models/FocusSession.js';
import FocusSettings from '../models/FocusSettings.js';
import BabuaLeaderboardService from '../src/services/babuaLeaderboardService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// SETTINGS ROUTES
// ==========================================

// @desc    Get user's focus settings
// @route   GET /api/focus/settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
    try {
        let settings = await FocusSettings.findOne({ userId: req.user._id });

        // Create default settings if none exist
        if (!settings) {
            settings = await FocusSettings.create({ userId: req.user._id });
        }

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching focus settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update focus settings
// @route   PATCH /api/focus/settings
// @access  Private
router.patch('/settings', protect, async (req, res) => {
    try {
        const allowedUpdates = [
            'defaultWorkDuration', 'defaultBreakDuration', 'longBreakDuration',
            'cyclesBeforeLongBreak', 'enableAdaptiveTimer', 'alertSensitivity',
            'enableSoundAlerts', 'enableVisualAlerts', 'gazeAwayThreshold',
            'enableFocusStreaks', 'enableChallenges'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        let settings = await FocusSettings.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error updating focus settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Grant webcam consent
// @route   POST /api/focus/settings/webcam-consent
// @access  Private
router.post('/settings/webcam-consent', protect, async (req, res) => {
    try {
        const settings = await FocusSettings.findOneAndUpdate(
            { userId: req.user._id },
            {
                $set: {
                    webcamConsentGiven: true,
                    webcamConsentDate: new Date(),
                    webcamConsentRevoked: false,
                    webcamMonitoringEnabled: true
                }
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: settings, message: 'Webcam consent granted' });
    } catch (error) {
        console.error('Error granting webcam consent:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Revoke webcam consent and delete webcam-derived data
// @route   DELETE /api/focus/settings/webcam-consent
// @access  Private
router.delete('/settings/webcam-consent', protect, async (req, res) => {
    try {
        // Update settings
        const settings = await FocusSettings.findOne({ userId: req.user._id });
        if (settings) {
            settings.revokeWebcamConsent();
            await settings.save();
        }

        // Clear webcam attention metrics from all sessions
        await FocusSession.updateMany(
            { userId: req.user._id, webcamEnabled: true },
            {
                $set: {
                    attentionMetrics: {},
                    webcamEnabled: false
                }
            }
        );

        res.json({ success: true, message: 'Webcam consent revoked and data deleted' });
    } catch (error) {
        console.error('Error revoking webcam consent:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ==========================================
// SESSION ROUTES
// ==========================================

// @desc    Start a new focus session
// @route   POST /api/focus/session/start
// @access  Private
router.post('/session/start', protect, async (req, res) => {
    try {
        const { sessionType, topic, plannedDuration, linkedResource, webcamEnabled } = req.body;

        // Check for any active sessions and close them
        await FocusSession.updateMany(
            { userId: req.user._id, status: 'active' },
            { $set: { status: 'abandoned', endTime: new Date() } }
        );

        // Get user settings for defaults
        const settings = await FocusSettings.findOne({ userId: req.user._id });
        const workDuration = plannedDuration || settings?.defaultWorkDuration || 25;

        // Create new session
        const session = await FocusSession.create({
            userId: req.user._id,
            sessionType: sessionType || 'general',
            topic,
            plannedDuration: workDuration,
            linkedResource,
            webcamEnabled: webcamEnabled && settings?.webcamConsentGiven,
            cycles: [{
                cycleNumber: 1,
                workDuration,
                breakDuration: settings?.defaultBreakDuration || 5,
                startTime: new Date()
            }]
        });

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error('Error starting focus session:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Pause a focus session
// @route   PATCH /api/focus/session/:id/pause
// @access  Private
router.patch('/session/:id/pause', protect, async (req, res) => {
    try {
        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Active session not found' });
        }

        session.status = 'paused';
        session.pausedAt = new Date();

        // Log as a distraction event
        session.distractionEvents.push({
            type: 'manual_pause',
            timestamp: new Date()
        });

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error pausing session:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Resume a paused session
// @route   PATCH /api/focus/session/:id/resume
// @access  Private
router.patch('/session/:id/resume', protect, async (req, res) => {
    try {
        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: 'paused'
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Paused session not found' });
        }

        // Calculate paused duration
        if (session.pausedAt) {
            const pausedDuration = (new Date() - session.pausedAt) / 1000; // seconds
            session.totalPausedTime += pausedDuration;
        }

        session.status = 'active';
        session.pausedAt = null;

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error resuming session:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    End a focus session
// @route   POST /api/focus/session/:id/end
// @access  Private
router.post('/session/:id/end', protect, async (req, res) => {
    try {
        const { completed, webcamEnabled, attentionMetrics } = req.body;

        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: { $in: ['active', 'paused'] }
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Finalize session
        session.endTime = new Date();
        session.status = completed ? 'completed' : 'abandoned';

        // Update webcam metrics if provided
        if (webcamEnabled !== undefined) session.webcamEnabled = webcamEnabled;
        if (attentionMetrics) session.attentionMetrics = attentionMetrics;

        // Calculate actual duration
        session.calculateActualDuration();

        // Calculate focus score
        session.calculateFocusScore();

        // Mark current cycle as completed
        if (session.cycles.length > 0) {
            const lastCycle = session.cycles[session.cycles.length - 1];
            lastCycle.completed = completed;
            lastCycle.endTime = new Date();
        }

        await session.save();

        // Update user's focus settings with aggregated stats
        const settings = await FocusSettings.findOne({ userId: req.user._id });
        if (settings) {
            settings.totalFocusMinutes += session.actualDuration;
            settings.totalSessions += 1;

            // Update average focus score
            settings.avgFocusScore = Math.round(
                ((settings.avgFocusScore * (settings.totalSessions - 1)) + session.focusScore) / settings.totalSessions
            );

            // Update focus streak if session was completed
            if (completed) {
                settings.updateFocusStreak();
            }

            await settings.save();
        }

        // Update Babua leaderboard stats
        let newTitles = [];
        try {
            const babuaResult = await BabuaLeaderboardService.updateStatsFromSession(
                req.user._id,
                session
            );
            newTitles = babuaResult.newTitles || [];
        } catch (babuaError) {
            console.error('Error updating Babua stats (non-critical):', babuaError);
        }

        res.json({
            success: true,
            data: session,
            newTitles: newTitles.length > 0 ? newTitles : undefined
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Log a distraction event
// @route   POST /api/focus/session/:id/distraction
// @access  Private
router.post('/session/:id/distraction', protect, async (req, res) => {
    try {
        const { type, duration } = req.body;

        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Active session not found' });
        }

        session.distractionEvents.push({
            type: type || 'idle',
            duration: duration || 0,
            timestamp: new Date()
        });

        session.totalDistractionTime += (duration || 0);

        // Update current cycle distraction count
        if (session.cycles.length > 0) {
            session.cycles[session.cycles.length - 1].distractionCount += 1;
        }

        await session.save();

        res.json({ success: true, data: { distractionCount: session.distractionEvents.length } });
    } catch (error) {
        console.error('Error logging distraction:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Log a break
// @route   POST /api/focus/session/:id/break
// @access  Private
router.post('/session/:id/break', protect, async (req, res) => {
    try {
        const { type, activity } = req.body;

        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.breaks.push({
            startTime: new Date(),
            type: type || 'user_initiated',
            activity: activity || 'other'
        });

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error logging break:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    End a break
// @route   PATCH /api/focus/session/:id/break/end
// @access  Private
router.patch('/session/:id/break/end', protect, async (req, res) => {
    try {
        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // End the last break
        if (session.breaks.length > 0) {
            const lastBreak = session.breaks[session.breaks.length - 1];
            if (!lastBreak.endTime) {
                lastBreak.endTime = new Date();
            }
        }

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error ending break:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Start next pomodoro cycle
// @route   POST /api/focus/session/:id/next-cycle
// @access  Private
router.post('/session/:id/next-cycle', protect, async (req, res) => {
    try {
        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
            status: { $in: ['active', 'paused'] }
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // End current cycle
        if (session.cycles.length > 0) {
            const lastCycle = session.cycles[session.cycles.length - 1];
            lastCycle.completed = true;
            lastCycle.endTime = new Date();
        }

        const settings = await FocusSettings.findOne({ userId: req.user._id });

        // Add new cycle
        session.currentCycle += 1;
        session.cycles.push({
            cycleNumber: session.currentCycle,
            workDuration: settings?.defaultWorkDuration || 25,
            breakDuration: settings?.defaultBreakDuration || 5,
            startTime: new Date()
        });

        session.status = 'active';

        await session.save();

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error starting next cycle:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get user's focus sessions
// @route   GET /api/focus/sessions
// @access  Private
router.get('/sessions', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }

        const sessions = await FocusSession.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await FocusSession.countDocuments(query);

        res.json({
            success: true,
            data: sessions,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/session/active', protect, async (req, res) => {
    try {
        const session = await FocusSession.findOne({
            userId: req.user._id,
            status: { $in: ['active', 'paused'] }
        });

        // Check if session is stale (started more than 24 hours ago)
        if (session) {
            const startTime = new Date(session.startTime).getTime();
            const now = Date.now();
            const timeoutThreshold = 15 * 60 * 1000; // 15 minutes

            if (now - startTime > timeoutThreshold) {
                // Auto-abandon stale session
                session.status = 'abandoned';
                session.endTime = new Date();
                session.calculateActualDuration();
                await session.save();

                return res.json({ success: true, data: null });
            }
        }

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error fetching active session:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get focus analytics
// @route   GET /api/focus/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get sessions in date range
        const sessions = await FocusSession.find({
            userId: req.user._id,
            createdAt: { $gte: startDate },
            status: { $in: ['completed', 'abandoned'] }
        }).sort({ createdAt: 1 });

        // Get user settings
        const settings = await FocusSettings.findOne({ userId: req.user._id });

        // Calculate analytics
        const totalMinutes = sessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0);
        const avgFocusScore = sessions.length > 0
            ? Math.round(sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length)
            : 0;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const completionRate = sessions.length > 0
            ? Math.round((completedSessions / sessions.length) * 100)
            : 0;

        // Daily breakdown
        const dailyStats = {};
        sessions.forEach(session => {
            const date = session.createdAt.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { minutes: 0, sessions: 0, avgScore: 0, scores: [] };
            }
            dailyStats[date].minutes += session.actualDuration || 0;
            dailyStats[date].sessions += 1;
            dailyStats[date].scores.push(session.focusScore);
        });

        // Calculate daily averages
        Object.keys(dailyStats).forEach(date => {
            const day = dailyStats[date];
            day.avgScore = Math.round(day.scores.reduce((a, b) => a + b, 0) / day.scores.length);
            delete day.scores;
        });

        // Hourly distribution for best focus time
        const hourlyDistribution = {};
        sessions.filter(s => s.status === 'completed').forEach(session => {
            const hour = session.startTime.getHours();
            if (!hourlyDistribution[hour]) {
                hourlyDistribution[hour] = { count: 0, totalScore: 0 };
            }
            hourlyDistribution[hour].count += 1;
            hourlyDistribution[hour].totalScore += session.focusScore;
        });

        // Find best focus hour
        let bestHour = null;
        let bestHourAvg = 0;
        Object.keys(hourlyDistribution).forEach(hour => {
            const avg = hourlyDistribution[hour].totalScore / hourlyDistribution[hour].count;
            if (avg > bestHourAvg && hourlyDistribution[hour].count >= 2) {
                bestHourAvg = avg;
                bestHour = parseInt(hour);
            }
        });

        // Distraction analysis
        const totalDistractions = sessions.reduce((acc, s) => acc + s.distractionEvents.length, 0);

        res.json({
            success: true,
            data: {
                summary: {
                    totalMinutes,
                    totalSessions: sessions.length,
                    completedSessions,
                    completionRate,
                    avgFocusScore,
                    totalDistractions,
                    focusStreak: settings?.focusStreak || 0,
                    longestStreak: settings?.longestFocusStreak || 0
                },
                dailyStats,
                bestFocusHour: bestHour,
                hourlyDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Submit webcam attention metrics (aggregated only)
// @route   POST /api/focus/session/:id/attention-metrics
// @access  Private
router.post('/session/:id/attention-metrics', protect, async (req, res) => {
    try {
        const { avgGazeScore, blinkRatePerMin, lookAwayCount, drowsinessEvents } = req.body;

        const session = await FocusSession.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Verify webcam consent
        const settings = await FocusSettings.findOne({ userId: req.user._id });
        if (!settings?.webcamConsentGiven) {
            return res.status(403).json({ success: false, message: 'Webcam consent not given' });
        }

        // Store only aggregated metrics, never raw video data
        session.attentionMetrics = {
            avgGazeScore,
            blinkRatePerMin,
            lookAwayCount,
            drowsinessEvents
        };

        await session.save();

        res.json({ success: true, data: session.attentionMetrics });
    } catch (error) {
        console.error('Error saving attention metrics:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
