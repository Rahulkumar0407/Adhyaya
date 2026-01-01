// Activity service for recording user activities
import api from './api';

/**
 * Record an activity (video watched, quiz taken, etc.)
 * This also updates the user's streak
 * @param {string} token - Auth token (unused, handled by api interceptor)
 * @param {string} type - Activity type: 'video_watched', 'quiz_taken', 'problem_solved', 'lesson_completed'
 * @param {object} metadata - Additional data like courseId, lessonId, etc.
 */
export const recordActivity = async (token, type, metadata = {}) => {
    try {
        const response = await api.post('/profile/activity', { type, metadata });
        return response.data;
    } catch (error) {
        console.error('Failed to record activity:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get activity calendar data
 * @param {string} token - Auth token (unused, handled by api interceptor)
 */
export const getActivityCalendar = async (token) => {
    try {
        const response = await api.get('/profile/activity/calendar');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch activity calendar:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get streak information
 * @param {string} token - Auth token (unused, handled by api interceptor)
 */
export const getStreak = async (token) => {
    try {
        const response = await api.get('/profile/streak');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch streak:', error);
        return { success: false, error: error.message };
    }
};

export default {
    recordActivity,
    getActivityCalendar,
    getStreak
};
