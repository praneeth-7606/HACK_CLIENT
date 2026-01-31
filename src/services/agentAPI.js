import api from './api';

// Budget Planner Agent APIs
export const analyzeBudget = async (totalBudget, fiscalYear) => {
    const response = await api.post('/agents/budget-planner/analyze', {
        totalBudget,
        fiscalYear
    });
    return response.data;
};

export const getAllBudgetAllocations = async () => {
    const response = await api.get('/agents/budget-planner');
    return response.data;
};

export const updateBudgetAllocation = async (id, data) => {
    const response = await api.put(`/agents/budget-planner/${id}`, data);
    return response.data;
};

export const approveBudgetAllocation = async (id) => {
    const response = await api.post(`/agents/budget-planner/${id}/approve`);
    return response.data;
};

export const downloadPDFReport = async (id) => {
    const response = await api.get(`/agents/budget-planner/${id}/pdf`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    });
    return response.data;
};

export default {
    analyzeBudget,
    getAllBudgetAllocations,
    updateBudgetAllocation,
    approveBudgetAllocation,
    downloadPDFReport
};
