import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiTrendingUp,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter
} from 'react-icons/fi';
import { userAPI } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                userAPI.getStats(),
                userAPI.getAllUsers({ limit: 10 })
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data.stats);
            }
            if (usersRes.data.success) {
                setUsers(usersRes.data.data.users);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const { data } = await userAPI.updateUserStatus(userId, !currentStatus);
            if (data.success) {
                toast.success(data.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const { data } = await userAPI.deleteUser(userId);
            if (data.success) {
                toast.success(data.message);
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Welcome Card */}
                        <div className="welcome-card">
                            <h2>👋 Welcome to Admin Dashboard</h2>
                            <p>Manage users, monitor platform activity, and keep things running smoothly.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="dashboard-grid">
                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="stat-card-header">
                                    <div className="stat-card-icon primary">
                                        <FiUsers />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats?.totalUsers || 0}</div>
                                <div className="stat-card-label">Total Users</div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="stat-card-header">
                                    <div className="stat-card-icon success">
                                        <FiUserCheck />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats?.activeUsers || 0}</div>
                                <div className="stat-card-label">Active Users</div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="stat-card-header">
                                    <div className="stat-card-icon warning">
                                        <FiUserX />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats?.inactiveUsers || 0}</div>
                                <div className="stat-card-label">Inactive Users</div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="stat-card-header">
                                    <div className="stat-card-icon primary">
                                        <FiTrendingUp />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats?.newUsersThisWeek || 0}</div>
                                <div className="stat-card-label">New This Week</div>
                            </motion.div>
                        </div>

                        {/* Users Table */}
                        <div className="section-card">
                            <div className="section-card-header">
                                <h3 className="section-card-title">Recent Users</h3>
                                <div className="input-wrapper" style={{ width: '250px' }}>
                                    <FiSearch className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="user-avatar"
                                                            />
                                                            <div>
                                                                <div className="user-name">{user.name}</div>
                                                                <div className="user-email">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'success'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {user.isActive ? <FiUserX /> : <FiUserCheck />}
                                                            </button>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                title="Delete"
                                                                style={{ color: 'var(--accent-rose)' }}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No users found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;
