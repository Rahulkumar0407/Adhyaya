import api from './api';

// Interview Service for API calls
export const interviewService = {
    // Save completed interview
    saveInterview: async (data) => {
        try {
            const response = await api.post('/interview', data);
            return response.data;
        } catch (error) {
            console.error('Error saving interview:', error);
            throw error;
        }
    },

    // Get interview history
    getHistory: async (params = {}) => {
        try {
            const { limit = 10, page = 1, type } = params;
            const queryParams = new URLSearchParams({ limit, page });
            if (type) queryParams.append('type', type);

            const response = await api.get(`/interview/history?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching interview history:', error);
            throw error;
        }
    },

    // Get single interview details
    getInterview: async (id) => {
        try {
            const response = await api.get(`/interview/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching interview:', error);
            throw error;
        }
    },

    // Get placement readiness stats
    getReadinessStats: async () => {
        try {
            const response = await api.get('/interview/stats/readiness');
            return response.data;
        } catch (error) {
            console.error('Error fetching readiness stats:', error);
            throw error;
        }
    },

    // Get pattern analysis
    getPatternAnalysis: async () => {
        try {
            const response = await api.get('/interview/stats/patterns');
            return response.data;
        } catch (error) {
            console.error('Error fetching pattern analysis:', error);
            throw error;
        }
    },

    // Get interview streak
    getStreak: async () => {
        try {
            const response = await api.get('/interview/stats/streak');
            return response.data;
        } catch (error) {
            console.error('Error fetching streak:', error);
            throw error;
        }
    },

    // Get all patterns (reference data)
    getPatterns: async (category = null) => {
        try {
            const url = category
                ? `/interview/patterns/all?category=${category}`
                : '/interview/patterns/all';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching patterns:', error);
            throw error;
        }
    },

    // Extract pattern from AI response
    extractPattern: (questionText) => {
        const match = questionText.match(/\[PATTERN:(\w+)\]/i);
        if (match) {
            return match[1].toLowerCase();
        }
        return null;
    },

    // Clean question text (remove pattern tag)
    cleanQuestionText: (questionText) => {
        return questionText.replace(/\[PATTERN:\w+\]/gi, '').trim();
    }
};

export default interviewService;
