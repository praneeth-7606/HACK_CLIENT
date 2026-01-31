import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify token by fetching profile
                    const { data } = await authAPI.getProfile();
                    if (data.success) {
                        setUser(data.data.user);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Register function
    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            const { data } = await authAPI.register(userData);

            if (data.success) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                setUser(data.data.user);
                setIsAuthenticated(true);
                toast.success(data.message || 'Registration successful!');
                return { success: true, user: data.data.user };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = useCallback(async (credentials) => {
        try {
            setLoading(true);
            const { data } = await authAPI.login(credentials);

            if (data.success) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                setUser(data.data.user);
                setIsAuthenticated(true);
                toast.success(data.message || 'Login successful!');
                return { success: true, user: data.data.user };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            toast.success('Logged out successfully');
        }
    }, []);

    // Update profile
    const updateProfile = useCallback(async (profileData) => {
        try {
            const { data } = await authAPI.updateProfile(profileData);
            if (data.success) {
                setUser(data.data.user);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                toast.success('Profile updated successfully');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
            return { success: false, error: message };
        }
    }, []);

    // Check if user has specific role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    // Check if user is admin
    const isAdmin = useCallback(() => {
        return user?.role === 'admin';
    }, [user]);

    // Check if user is citizen
    const isCitizen = useCallback(() => {
        return user?.role === 'citizen';
    }, [user]);

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updateProfile,
        hasRole,
        isAdmin,
        isCitizen,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
