// Route prefetch registry - maps routes to their lazy import functions
// Used by PrefetchLink to preload components on hover

export const routeImports = {
    '/dashboard': () => import('../pages/Dashboard'),
    '/mock-interview': () => import('../pages/MockInterview'),
    '/revision': () => import('../pages/RevisionPage'),
    '/mentors': () => import('../pages/MentorConnect'),
    '/how-to-earn': () => import('../pages/HowToEarn'),
    '/jobs': () => import('../pages/Jobs'),
    '/mentor-dashboard': () => import('../pages/MentorDashboard'),
    '/doubts/mentor-analytics': () => import('../pages/MentorAnalytics'),
    '/wallet': () => import('../pages/WalletPage'),
    '/revisions': () => import('../pages/Revisions'),
    '/leaderboard': () => import('../pages/Leaderboard'),
    '/pods': () => import('../pages/Pods'),
    '/profile': () => import('../pages/Profile'),
    '/settings': () => import('../pages/Settings'),
    '/dsa': () => import('../pages/DSAPatterns'),
    '/courses': () => import('../pages/CourseIndex'),
    '/community': () => import('../pages/Community'),
    '/doubts': () => import('../pages/DoubtDashboard'),
    '/adaptive-revision': () => import('../pages/AdaptiveRevision'),
    '/about': () => import('../pages/About'),
    '/login': () => import('../pages/Login'),
    '/register': () => import('../pages/Register'),
};

// Cache to track already-prefetched routes
const prefetchedRoutes = new Set();

/**
 * Prefetch a route's component
 * @param {string} path - The route path to prefetch
 */
export const prefetchRoute = (path) => {
    // Normalize path (remove query params and hash)
    const normalizedPath = path.split('?')[0].split('#')[0];

    // Check if already prefetched
    if (prefetchedRoutes.has(normalizedPath)) {
        return;
    }

    // Find matching route import
    const importFn = routeImports[normalizedPath];

    if (importFn) {
        prefetchedRoutes.add(normalizedPath);
        // Trigger the dynamic import (this loads the chunk)
        importFn().catch(() => {
            // Remove from cache on error so it can be retried
            prefetchedRoutes.delete(normalizedPath);
        });
    }
};

/**
 * Check if a route has been prefetched
 * @param {string} path - The route path to check
 * @returns {boolean}
 */
export const isRoutePrefetched = (path) => {
    const normalizedPath = path.split('?')[0].split('#')[0];
    return prefetchedRoutes.has(normalizedPath);
};
