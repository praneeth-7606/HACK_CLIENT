import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
    FiHome,
    FiUser,
    FiLogOut,
    FiSettings,
    FiMenu,
    FiX,
    FiBell,
    FiCheck
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Layout.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/user-alerts');
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read first if not already read
            if (!notification.isRead) {
                await api.patch(`/user-alerts/${notification._id}/read`);
                setNotifications(notifications.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
            }

            // Redirection logic
            if (notification.type === 'AdminAlert' && notification.policy) {
                navigate(`/policies/${notification.policy}`);
            } else if (notification.concern) {
                if (user?.role === 'admin') {
                    navigate('/admin/concerns');
                } else {
                    navigate('/dashboard/concerns');
                }
            }

            setShowNotifications(false);
        } catch (error) {
            console.error('Failed to handle notification click');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
            

                {/* Desktop Navigation */}
                <div className="navbar-nav">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                                className="nav-link"
                            >
                                <FiHome />
                                <span>Dashboard</span>
                            </Link>

                            {/* Notifications */}
                            <div className="nav-notifications">
                                <button
                                    className="notification-trigger"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <FiBell />
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <h3>Notifications</h3>
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <div className="notification-empty">No notifications</div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification._id}
                                                        className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="notification-dot"></div>
                                                        <div className="notification-content">
                                                            <p className="notification-text">{notification.message}</p>
                                                            <span className="notification-time">
                                                                {new Date(notification.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {!notification.isRead && <FiCheck className="mark-read-icon" />}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="nav-user">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                                    alt={user?.name}
                                    className="nav-avatar"
                                />
                                <div className="nav-user-info">
                                    <span className="nav-username">{user?.name}</span>
                                    <span className="nav-role">{user?.role}</span>
                                </div>
                            </div>
                            <motion.button
                                className="btn btn-ghost nav-logout"
                                onClick={handleLogout}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiLogOut />
                                <span>Logout</span>
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    className="mobile-menu"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {isAuthenticated ? (
                        <>
                            <div className="mobile-user">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                                    alt={user?.name}
                                    className="mobile-avatar"
                                />
                                <div>
                                    <p className="mobile-username">{user?.name}</p>
                                    <p className="mobile-role">{user?.role}</p>
                                </div>
                            </div>
                            <Link
                                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                                className="mobile-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FiHome /> Dashboard
                            </Link>
                            <button className="mobile-link" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="mobile-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary btn-full"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
