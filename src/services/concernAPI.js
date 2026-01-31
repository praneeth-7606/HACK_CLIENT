import api from './api';

export const concernAPI = {
    // Public: Get all concerns (with filters)
    getAllConcerns: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        return api.get(`concerns?${params.toString()}`);
    },

    // Public: Get concern by ID
    getConcernById: (id) => api.get(`concerns/${id}`),

    // Private: Create concern (multipart/form-data)
    createConcern: (concernData) => {
        return api.post('concerns', concernData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Required for file upload
            }
        });
    },

    // Private: Get my concerns
    getMyConcerns: () => api.get('concerns/my/all'),

    // Admin: Update status
    updateStatus: (id, status) => api.put(`concerns/${id}/status`, { status }),

    // Admin/Owner: Delete concern
    deleteConcern: (id) => api.delete(`concerns/${id}`),

    // Upvote
    upvoteConcern: (id) => api.put(`concerns/${id}/upvote`),

    // Comments (embedded in concern)
    addComment: (concernId, text) => api.post(`concerns/${concernId}/comments`, { text }),

    // Citizen Stats
    getCitizenStats: () => api.get('concerns/citizen/stats')
};
