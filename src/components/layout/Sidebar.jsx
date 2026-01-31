import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiUsers,
    FiSettings,
    FiBarChart2,
    FiMessageSquare,
    FiFileText,
    FiUser,
    FiBell,
    FiAlertCircle,
    FiMap,
    FiChevronLeft,
    FiChevronRight,
    FiAward,
    FiZap,
    FiDollarSign
} from 'react-icons/fi';
import './Layout.css';

const Sidebar = () => {
    const { user, isAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const adminLinks = [
        {
            section: 'DASHBOARD',
            items: [
                { to: '/admin', icon: FiHome, label: 'Overview', end: true },
                { to: '/admin/stats', icon: FiBarChart2, label: 'Analytics' },
            ]
        },
        {
            section: 'MANAGEMENT',
            items: [
                { to: '/admin/policies', icon: FiFileText, label: 'Policies' },
                { to: '/admin/concerns', icon: FiAlertCircle, label: 'Concerns' },
                { to: '/admin/ideas', icon: FiZap, label: 'Ideas' },
            ]
        },
        {
            section: 'AI AGENTS',
            items: [
                { to: '/admin/budget-planner', icon: FiDollarSign, label: 'Budget Planner', badge: 'AI' },
            ]
        },
        {
            section: 'SYSTEM',
            items: [
                { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
            ]
        }
    ];

    const citizenLinks = [
        {
            section: 'DASHBOARD',
            items: [
                { to: '/dashboard', icon: FiHome, label: 'Home', end: true },
                { to: '/dashboard/map', icon: FiMap, label: 'Issue Map' },
            ]
        },
        {
            section: 'MY ACTIVITY',
            items: [
                { to: '/dashboard/concerns/report', icon: FiAlertCircle, label: 'Report Issue', badge: 'New', end: true },
                { to: '/dashboard/concerns', icon: FiMessageSquare, label: 'My Concerns', end: true },
                { to: '/dashboard/ideas/my', icon: FiZap, label: 'My Ideas', end: true },
            ]
        },
        {
            section: 'RESOURCES',
            items: [
                { to: '/dashboard/policies', icon: FiFileText, label: 'Policies' },
                { to: '/dashboard/ideas', icon: FiZap, label: 'Innovation Hub' },
                { to: '/dashboard/leaderboard', icon: FiAward, label: 'Leaderboard' },
                { to: '/dashboard/notifications', icon: FiBell, label: 'Notifications' },
            ]
        },
        {
            section: 'ACCOUNT',
            items: [
                { to: '/dashboard/profile', icon: FiUser, label: 'Profile' },
            ]
        }
    ];

    const sections = isAdmin() ? adminLinks : citizenLinks;

    return (
        <>
            {/* Sidebar */}
            <aside className={`sidebar-modern ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Logo - Image + Text with Tagline */}
                <div className="sidebar-logo">
                    {!isCollapsed ? (
                        <>
                            <img src="/logo.png" alt="CivicConnect" className="sidebar-logo-img" />
                            <div className="sidebar-brand">
                                <span className="sidebar-brand-name">CivicConnect</span>
                                <span className="sidebar-brand-tagline">Empowering Communities</span>
                            </div>
                        </>
                    ) : (
                        <div className="sidebar-brand-collapsed">
                            <span>CC</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav-modern">
                    {sections.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            {!isCollapsed && <div className="section-divider">...</div>}
                            {!isCollapsed && <div className="section-label">{section.section}</div>}

                            {section.items.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? 'active' : ''}`
                                    }
                                    title={isCollapsed ? link.label : ''}
                                >
                                    <link.icon className="nav-icon" />
                                    {!isCollapsed && (
                                        <>
                                            <span className="nav-label">{link.label}</span>
                                            {link.badge && (
                                                <span className={`nav-badge ${link.badge === 'New' ? 'badge-new' : ''}`}>
                                                    {link.badge}
                                                </span>
                                            )}
                                            {link.outlined && (
                                                <span className="nav-badge badge-outlined">outlined</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <div className="user-name">{user?.name || 'User'}</div>
                            <div className="user-role">{user?.role || 'Citizen'}</div>
                        </div>
                    )}
                    <button className="user-settings" title="Settings">
                        <FiSettings />
                    </button>
                </div>

                {/* Toggle Button */}
                <button
                    className="sidebar-toggle-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
