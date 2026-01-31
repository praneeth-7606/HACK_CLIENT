import api from './api';

const ideaAPI = {
    // Get all ideas with filters
    getAllIdeas: async (params = {}) => {
        const response = await api.get('/ideas', { params });
        return response.data;
    },

    // Get single idea by ID
    getIdeaById: async (id) => {
        const response = await api.get(`/ideas/${id}`);
        return response.data;
    },

    // Submit new idea
    submitIdea: async (ideaData) => {
        const response = await api.post('/ideas', ideaData);
        return response.data;
    },

    // Update idea
    updateIdea: async (id, ideaData) => {
        const response = await api.put(`/ideas/${id}`, ideaData);
        return response.data;
    },

    // Delete idea
    deleteIdea: async (id) => {
        const response = await api.delete(`/ideas/${id}`);
        return response.data;
    },

    // Upvote idea
    upvoteIdea: async (id) => {
        const response = await api.post(`/ideas/${id}/upvote`);
        return response.data;
    },

    // Downvote idea
    downvoteIdea: async (id) => {
        const response = await api.post(`/ideas/${id}/downvote`);
        return response.data;
    },

    // Add government response (Admin)
    addGovernmentResponse: async (id, responseData) => {
        const response = await api.post(`/ideas/${id}/response`, responseData);
        return response.data;
    },

    // Update implementation (Admin)
    updateImplementation: async (id, implementationData) => {
        const response = await api.put(`/ideas/${id}/implementation`, implementationData);
        return response.data;
    },

    // Get idea statistics (Admin)
    getIdeaStats: async () => {
        const response = await api.get('/ideas/admin/stats');
        return response.data;
    }
};

export default ideaAPI;
