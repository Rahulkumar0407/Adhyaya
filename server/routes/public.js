import express from 'express';
import SystemConfig from '../models/SystemConfig.js';
import User from '../models/User.js';

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

export default router;
