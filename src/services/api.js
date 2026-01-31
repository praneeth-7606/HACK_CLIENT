import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '') + '/';
const API_BASE_URL = API_URL.replace('/api/', '');

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export { API_BASE_URL };

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const { data } = await axios.post('/api/auth/refresh-token', {}, {
                    withCredentials: true
                });

                if (data.success && data.data.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: (userData) => api.post('auth/register', userData),
    login: (credentials) => api.post('auth/login', credentials),
    logout: () => api.post('auth/logout'),
    getProfile: () => api.get('auth/profile'),
    updateProfile: (data) => api.put('auth/profile', data),
    refreshToken: () => api.post('auth/refresh-token'),
};

// User API calls (Admin only)
export const userAPI = {
    getAllUsers: (params) => api.get('users', { params }),
    getUserById: (id) => api.get(`users/${id}`),
    updateUserStatus: (id, isActive) => api.patch(`users/${id}/status`, { isActive }),
    updateUserRole: (id, role) => api.patch(`users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`users/${id}`),
    getStats: () => api.get('users/stats'),
};

export default api;
