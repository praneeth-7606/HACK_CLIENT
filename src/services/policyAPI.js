import api from './api';

// Policy API calls
export const policyAPI = {
    // Get all policies with filters
    getAllPolicies: (params) => api.get('/policies', { params }),

    // Get single policy by ID
    getPolicyById: (id) => api.get(`/policies/${id}`),

    // Create a new policy
    createPolicy: (policyData) => {
        // Support both FormData and regular objects
        const config = policyData instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        return api.post('/policies', policyData, config);
    },

    // Update policy (admin only)
    updatePolicy: (id, policyData) => {
        const config = policyData instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        return api.put(`/policies/${id}`, policyData, config);
    },

    // Delete policy (admin only)
    deletePolicy: (id) => api.delete(`/policies/${id}`),

    // Get policy stats (admin only)
    getPolicyStats: () => api.get('/policies/admin/stats'),

    // Support/upvote a policy
    supportPolicy: (id) => api.post(`/policies/${id}/support`),
};
