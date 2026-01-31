import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiZap,
    FiMessageSquare, FiFileText, FiAward, FiTrendingUp,
    FiClock, FiX, FiCheck
} from 'react-icons/fi';
import api from '../../services/api';
import './EnhancedNotifications.css';

const EnhancedNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/user-alerts');
            if (data.success) {
                const newNotifications = data.data;
                // Check for new unread notifications
                if (notifications.length > 0) {
                    const newUnread = newNotifications.filter(n => 
                        !n.isRead && !notifications.find(old => old._id === n._id)
                    );
                    if (newUnread.length > 0) {
                        playNotificationSound();
                    }
                }
                setNotifications(newNotifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const playNotificationSound = () => {
        // Create a simple notification sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'IdeaResponse': FiMessageSquare,
            'IdeaUpdate': FiZap,
            'IdeaSubmitted': FiZap,
            'AdminAlert': FiAlertCircle,
            'PolicyUpdate': FiFileText,
            'ConcernUpdate': FiCheckCircle,
            'Achievement': FiAward,
            'default': FiBell
        };
        return icons[type] || icons.default;
    };

    const getNotificationColor = (type) => {
        const colors = {
            'IdeaResponse': '#10b981',
            'IdeaUpdate': '#f59e0b',
            'IdeaSubmitted': '#3b82f6',
            'AdminAlert': '#ef4444',
            'PolicyUpdate': '#8b5cf6',
            'ConcernUpdate': '#06b6d4',
            'Achievement': '#f59e0b',
            'default': '#6366f1'
        };
        return colors[type] || colors.default;
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await api.patch(`/user-alerts/${notificationId}/read`);
            setNotifications(notifications.map(n => 
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/user-alerts/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                await api.patch(`/user-alerts/${notification._id}/read`);
                setNotifications(notifications.map(n => 
                    n._id === notification._id ? { ...n, isRead: true } : n
                ));
            }

            // Navigate based on notification type
            if (notification.type === 'IdeaResponse' || notification.type === 'IdeaUpdate' || notification.type === 'IdeaSubmitted') {
                if (notification.idea) {
                    navigate(`/dashboard/ideas/${notification.idea}`);
                } else {
                    navigate('/dashboard/ideas/my');
                }
            } else if (notification.type === 'AdminAlert' && notification.policy) {
                navigate(`/policies/${notification.policy}`);
            } else if (notification.concern) {
                navigate('/dashboard/concerns');
            }
        } catch (error) {
            console.error('Failed to handle notification click');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="enhanced-notifications">
            <div className="notifications-header">
                <div className="header-title">
                    <FiBell className="header-icon" />
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
                <div className="header-actions">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                            onClick={() => setFilter('read')}
                        >
                            Read
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={handleMarkAllRead}>
                            <FiCheck /> Mark all read
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="empty-state">
                    <FiBell className="empty-icon" />
                    <h3>No notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="notifications-list">
                        {filteredNotifications.map((notification, index) => {
                            const Icon = getNotificationIcon(notification.type);
                            const color = getNotificationColor(notification.type);

                            return (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{ '--notification-color': color }}
                                >
                                    <div className="notification-indicator"></div>
                                    
                                    <div className="notification-icon" style={{ background: `${color}15` }}>
                                        <Icon style={{ color }} />
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-header">
                                            <span className="notification-type" style={{ color }}>
                                                {notification.type.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="notification-time">
                                                <FiClock />
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="notification-message">{notification.message}</p>
                                    </div>

                                    {!notification.isRead && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                                            title="Mark as read"
                                        >
                                            <FiCheck />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};

const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
};

export default EnhancedNotifications;
