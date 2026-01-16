import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const adminApi = axios.create({
    baseURL: `${API_URL}/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); // Fixed: was 'token'
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==================== USER MANAGEMENT ====================

export const searchUsers = async (query = '', filters = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);

    const response = await adminApi.get(`/users?${params.toString()}`);
    return response.data;
};

export const getUserDossier = async (userId) => {
    const response = await adminApi.get(`/users/${userId}`);
    return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
    const response = await adminApi.post(`/users/${userId}/reset-password`, { newPassword });
    return response.data;
};

export const toggleUserAccess = async (userId, isActive) => {
    const response = await adminApi.post(`/users/${userId}/toggle-access`, { isActive });
    return response.data;
};

export const refundTransaction = async (userId, transactionId, amount, reason) => {
    const response = await adminApi.post(`/users/${userId}/refund`, { transactionId, amount, reason });
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await adminApi.patch(`/users/${userId}/role`, { role });
    return response.data;
};

export const togglePasswordPermission = async (userId, canChangePassword) => {
    const response = await adminApi.post(`/users/${userId}/toggle-password-permission`, { canChangePassword });
    return response.data;
};

export const unlockFeature = async (userId, feature, durationDays) => {
    const response = await adminApi.post(`/users/${userId}/unlock-feature`, { feature, durationDays });
    return response.data;
};

export const lockFeature = async (userId, feature) => {
    const response = await adminApi.post(`/users/${userId}/lock-feature`, { feature });
    return response.data;
};

// Credit points to user by email or ID
export const creditPoints = async (email, amount, reason = '', type = 'money') => {
    const response = await adminApi.post('/users/credit-points', { email, amount, reason, type });
    return response.data;
};

// ==================== MENTOR MANAGEMENT ====================

export const getMentors = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.isOnline !== undefined) params.append('isOnline', filters.isOnline);

    const response = await adminApi.get(`/mentors?${params.toString()}`);
    return response.data;
};

export const getMentorDetails = async (mentorId) => {
    const response = await adminApi.get(`/mentors/${mentorId}`);
    return response.data;
};

export const updateMentorStatus = async (mentorId, status, reason) => {
    const response = await adminApi.patch(`/mentors/${mentorId}/status`, { status, reason });
    return response.data;
};

// ==================== TRANSACTIONS ====================

export const getRecentTransactions = async (limit = 10) => {
    const response = await adminApi.get(`/transactions/recent?limit=${limit}`);
    return response.data;
};

export const getAllTransactions = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);

    const response = await adminApi.get(`/transactions?${params.toString()}`);
    return response.data;
};

// ==================== DOUBTS ====================

export const getDoubtsKanban = async () => {
    const response = await adminApi.get('/doubts/kanban');
    return response.data;
};

export const getAllDoubts = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.subject) params.append('subject', filters.subject);

    const response = await adminApi.get(`/doubts?${params.toString()}`);
    return response.data;
};

export const reassignDoubt = async (doubtId, mentorId) => {
    const response = await adminApi.post(`/doubts/${doubtId}/reassign`, { mentorId });
    return response.data;
};

// ==================== CALLS ====================

export const getActiveCalls = async () => {
    const response = await adminApi.get('/calls/active');
    return response.data;
};

export const getCallHistory = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const response = await adminApi.get(`/calls?${params.toString()}`);
    return response.data;
};

// ==================== SERVER HEALTH ====================

export const getServerHealth = async () => {
    const response = await adminApi.get('/health');
    return response.data;
};

// ==================== ANALYTICS ====================

export const getAdminStats = async () => {
    const response = await adminApi.get('/stats');
    return response.data;
};

export const getRevenueAnalytics = async (period = '7d') => {
    const response = await adminApi.get(`/analytics/revenue?period=${period}`);
    return response.data;
};

export const getUserGrowthAnalytics = async (period = '30d') => {
    const response = await adminApi.get(`/analytics/users?period=${period}`);
    return response.data;
};

// ==================== COUPONS ====================

export const getCoupons = async () => {
    const response = await adminApi.get('/coupons');
    return response.data;
};

export const createCoupon = async (couponData) => {
    const response = await adminApi.post('/coupons', couponData);
    return response.data;
};

export const updateCoupon = async (couponId, couponData) => {
    const response = await adminApi.patch(`/coupons/${couponId}`, couponData);
    return response.data;
};

export const deleteCoupon = async (couponId) => {
    const response = await adminApi.delete(`/coupons/${couponId}`);
    return response.data;
};

// ==================== COMMUNITY / ANNOUNCEMENTS ====================

export const getAnnouncements = async () => {
    const response = await adminApi.get('/announcements');
    return response.data;
};

export const createAnnouncement = async (announcementData) => {
    const response = await adminApi.post('/announcements', announcementData);
    return response.data;
};

export const deleteAnnouncement = async (announcementId) => {
    const response = await adminApi.delete(`/announcements/${announcementId}`);
    return response.data;
};

export const banUser = async (userId, reason, duration) => {
    const response = await adminApi.post(`/users/${userId}/ban`, { reason, duration });
    return response.data;
};

export const unbanUser = async (userId) => {
    const response = await adminApi.post(`/users/${userId}/unban`);
    return response.data;
};

export const getReports = async () => {
    const response = await adminApi.get('/community/reports');
    return response.data;
};

export const deleteCommunityPost = async (postId) => {
    const response = await adminApi.delete(`/community/posts/${postId}`);
    return response.data;
};

// ==================== COURSE MANAGEMENT ====================

export const getCourses = async () => {
    const response = await adminApi.get('/courses');
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await adminApi.post('/courses', courseData);
    return response.data;
};

export const updateCourse = async (courseId, courseData) => {
    const response = await adminApi.patch(`/courses/${courseId}`, courseData);
    return response.data;
};

export const deleteCourse = async (courseId) => {
    const response = await adminApi.delete(`/courses/${courseId}`);
    return response.data;
};

// ==================== SYSTEM OPERATIONS ====================

export const getSystemConfig = async () => {
    const response = await adminApi.get('/system/config');
    return response.data;
};

export const toggleMaintenanceMode = async (enabled, message) => {
    const response = await adminApi.post('/system/maintenance', { enabled, message });
    return response.data;
};

export const updateUsageLimits = async (limits) => {
    const response = await adminApi.post('/system/limits', { limits });
    return response.data;
};

export const creditAllUsers = async (amount, reason, type = 'money') => {
    const response = await adminApi.post('/users/credit-all', { amount, reason, type });
    return response.data;
};

export const globalSearch = async (query) => {
    const response = await adminApi.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

export default adminApi;
