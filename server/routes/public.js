import express from 'express';
import SystemConfig from '../models/SystemConfig.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// @route   GET /api/public/config
// @desc    Get public system configuration (maintenance mode, etc.)
// @access  Public
router.get('/config', async (req, res) => {
    try {
        const maintenance = await SystemConfig.getConfig('maintenance');

        res.json({
            success: true,
            config: {
                maintenance: maintenance || { enabled: false, message: '' },
                serverTime: new Date()
            }
        });
    } catch (error) {
        console.error('Public config error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch config' });
    }
});

// @route   GET /api/public/announcements
// @desc    Get active announcements for display in Chai Tapri
// @access  Public
router.get('/announcements', async (req, res) => {
    try {
        const now = new Date();

        // Fetch active announcements that haven't expired
        const announcements = await Announcement.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate('createdBy', 'name avatar')
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            announcements
        });
    } catch (error) {
        console.error('Public announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
});

export default router;
