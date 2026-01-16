import SystemConfig from '../models/SystemConfig.js';

export const checkGlobalLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            // Bypass for admins
            if (req.user && req.user.role === 'admin') {
                return next();
            }

            const limitsConfig = await SystemConfig.findOne({ key: 'limits' });

            if (!limitsConfig) {
                // If no config, assume unlimited (or safe default)
                return next();
            }

            let limits = limitsConfig.value;
            const now = new Date();
            const lastUpdated = new Date(limitsConfig.updatedAt); // or separate reset field

            // Check for daily reset (simple check: if date is different)
            // Note: This resets ALL limits at once
            const isDifferentDay = now.getDate() !== lastUpdated.getDate() ||
                now.getMonth() !== lastUpdated.getMonth() ||
                now.getFullYear() !== lastUpdated.getFullYear();

            if (isDifferentDay) {
                // Reset counters
                Object.keys(limits).forEach(key => {
                    if (limits[key].current !== undefined) {
                        limits[key].current = 0;
                    }
                });

                // Save reset
                await SystemConfig.setConfig('limits', limits);
                console.log('Daily limits reset triggered');
            }

            // Check specific limit
            const limit = limits[limitType];
            if (!limit) {
                return next(); // No limit defined for this type
            }

            if (limit.current >= limit.max) {
                return res.status(429).json({
                    success: false,
                    message: `Daily global limit reached for ${limitType}. Please try again tomorrow or contact admin.`
                });
            }

            // Increment usage
            // Note: This has a race condition in high concurrency but acceptable for rough limits
            limits[limitType].current = (limits[limitType].current || 0) + 1;

            // We need to save this increment
            // Using setConfig to ensure we update the value
            await SystemConfig.setConfig('limits', limits);

            next();
        } catch (error) {
            console.error(`Check limit error for ${limitType}:`, error);
            // Fail open or closed? Fail open to avoid blocking users on error? 
            // Better fail open for UX unless critical cost
            next();
        }
    };
};
