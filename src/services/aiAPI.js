import api from './api';

// AI API calls
export const aiAPI = {
    // Summarize a policy
    summarizePolicy: (policyId) => api.post(`/ai/summarize/${policyId}`),

    // Chat about a policy
    chatWithPolicy: (policyId, question) => api.post(`/ai/chat/${policyId}`, { question }),

    // Get suggested questions
    getSuggestedQuestions: (policyId) => api.get(`/ai/suggestions/${policyId}`),
};
