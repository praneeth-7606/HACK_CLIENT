import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FiMessageSquare,
    FiFileText,
    FiTrendingUp,
    FiPlus,
    FiEye,
    FiBell,
    FiCheckCircle,
    FiClock
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { concernAPI } from '../../services/concernAPI';
import { policyAPI } from '../../services/policyAPI';
import '../Pages.css';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        myConcerns: 0,
        inProgress: 0,
        unreadNotifications: 0,
        policiesAvailable: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsRes = await concernAPI.getCitizenStats();

            // Get policies count
            const policiesRes = await policyAPI.getAllPolicies();

            if (statsRes.data.success) {
                setStats({
                    ...statsRes.data.data.stats,
                    policiesAvailable: policiesRes.data.data.pagination?.totalPolicies || policiesRes.data.data.policies?.length || 0
                });

                // Activities are already mapped in the backend now
                setRecentActivity(statsRes.data.data.recentActivities);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { icon: FiPlus, label: 'Submit Concern', path: '/dashboard/concerns/report', color: 'primary' },
        { icon: FiFileText, label: 'View Policies', path: '/dashboard/policies', color: 'secondary' },
        { icon: FiBell, label: 'Notifications', path: '/dashboard/notifications', color: 'secondary' },
    ];

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

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
                            <h2>👋 Welcome back, {user?.name}!</h2>
                            <p>Your voice matters. Start engaging with your community today.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="dashboard-grid">
                            <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                <div className="stat-card-header">
                                    <div className="stat-card-icon primary">
                                        <FiMessageSquare />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats.myConcerns}</div>
                                <div className="stat-card-label">My Concerns</div>
                            </motion.div>

                            <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                <div className="stat-card-header">
                                    <div className="stat-card-icon success">
                                        <FiTrendingUp />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats.inProgress}</div>
                                <div className="stat-card-label">In Progress</div>
                            </motion.div>

                            <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                <div className="stat-card-header">
                                    <div className="stat-card-icon warning">
                                        <FiEye />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats.policiesAvailable}</div>
                                <div className="stat-card-label">Policies Available</div>
                            </motion.div>

                            <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                                <div className="stat-card-header">
                                    <div className="stat-card-icon primary">
                                        <FiBell />
                                    </div>
                                </div>
                                <div className="stat-card-value">{stats.unreadNotifications}</div>
                                <div className="stat-card-label">Unread Alerts</div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <div className="section-card">
                            <div className="section-card-header">
                                <h3 className="section-card-title">Quick Actions</h3>
                            </div>
                            <div className="quick-actions">
                                {quickActions.map((action) => (
                                    <motion.button
                                        key={action.label}
                                        className="quick-action-btn"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(action.path)}
                                    >
                                        <div className={`quick-action-icon ${action.color}`}>
                                            <action.icon />
                                        </div>
                                        <span className="quick-action-text">{action.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="section-card">
                            <div className="section-card-header">
                                <h3 className="section-card-title">Recent Community Activity</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/concerns')}>View Concerns</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/policies')}>View Policies</button>
                                </div>
                            </div>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading activity...</div>
                            ) : recentActivity.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity.</div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Activity</th>
                                            <th>Author</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map((activity, index) => (
                                            <tr key={`${activity.type}-${activity.id}`}>
                                                <td>
                                                    <div
                                                        className="user-cell"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(activity.type === 'concern' ? '/dashboard/concerns' : `/policies/${activity.id}`)}
                                                    >
                                                        <div className={`stat-card-icon ${activity.type === 'concern' ? 'primary' : 'warning'}`} style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                                                            {activity.type === 'concern' ? <FiMessageSquare /> : <FiFileText />}
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{activity.title}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.9rem' }}>{activity.author}</td>
                                                <td>
                                                    <span className={`badge ${activity.status === 'Resolved' || activity.status === 'Published' ? 'badge-success' :
                                                        activity.status === 'In Progress' || activity.status === 'Under Review' ? 'badge-warning' :
                                                            'badge-primary'
                                                        }`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getTimeAgo(activity.date)}</td>
                                            </tr>
                                        ))}
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

export default CitizenDashboard;
