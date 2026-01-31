import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiToggleLeft, FiToggleRight, FiCpu, FiMessageSquare, FiShield, FiBell } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        aiAnalysis: true,
        communityComments: true,
        autoModeration: true,
        emailNotifications: false,
        publicRegistration: true,
        maintenanceMode: false
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Settings saved successfully');
        }, 1000);
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
                        <div className="dashboard-header">
                            <div>
                                <h1 className="dashboard-title">Platform Settings</h1>
                                <p className="dashboard-subtitle">Configure system-wide preferences and features</p>
                            </div>
                            <motion.button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                ) : (
                                    <>
                                        <FiSave />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="settings-grid">
                            {/* AI Features */}
                            <div className="section-card">
                                <div className="card-header-icon primary">
                                    <FiCpu />
                                </div>
                                <h3 className="section-card-title">AI Features</h3>
                                <p className="section-card-subtitle">Manage artificial intelligence capabilities</p>

                                <div className="settings-list">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">AI Policy Analysis</span>
                                            <span className="setting-desc">Enable automated summaries for new policies</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.aiAnalysis ? 'active' : ''}`}
                                            onClick={() => handleToggle('aiAnalysis')}
                                        >
                                            {settings.aiAnalysis ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">Auto-Moderation</span>
                                            <span className="setting-desc">AI filtering of harmful comments</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.autoModeration ? 'active' : ''}`}
                                            onClick={() => handleToggle('autoModeration')}
                                        >
                                            {settings.autoModeration ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Community Interaction */}
                            <div className="section-card">
                                <div className="card-header-icon success">
                                    <FiMessageSquare />
                                </div>
                                <h3 className="section-card-title">Community</h3>
                                <p className="section-card-subtitle">Manage user interaction settings</p>

                                <div className="settings-list">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">Public Comments</span>
                                            <span className="setting-desc">Allow citizens to comment on policies</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.communityComments ? 'active' : ''}`}
                                            onClick={() => handleToggle('communityComments')}
                                        >
                                            {settings.communityComments ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">Public Registration</span>
                                            <span className="setting-desc">Allow new user sign-ups</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.publicRegistration ? 'active' : ''}`}
                                            onClick={() => handleToggle('publicRegistration')}
                                        >
                                            {settings.publicRegistration ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* System */}
                            <div className="section-card">
                                <div className="card-header-icon warning">
                                    <FiShield />
                                </div>
                                <h3 className="section-card-title">System</h3>
                                <p className="section-card-subtitle">Core platform configurations</p>

                                <div className="settings-list">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">Email Notifications</span>
                                            <span className="setting-desc">Send system alerts via email</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                                            onClick={() => handleToggle('emailNotifications')}
                                        >
                                            {settings.emailNotifications ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-label">Maintenance Mode</span>
                                            <span className="setting-desc">Disable public access temporarily</span>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.maintenanceMode ? 'active' : ''}`}
                                            onClick={() => handleToggle('maintenanceMode')}
                                        >
                                            {settings.maintenanceMode ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            <style jsx>{`
                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: var(--spacing-6);
                }

                .card-header-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    margin-bottom: var(--spacing-4);
                }

                .card-header-icon.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary-500); }
                .card-header-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }
                .card-header-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--accent-amber); }

                .section-card-title {
                    font-size: var(--font-size-xl);
                    font-weight: 600;
                    margin-bottom: var(--spacing-1);
                }

                .section-card-subtitle {
                    color: var(--text-muted);
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--spacing-6);
                }

                .settings-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-4);
                }

                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: var(--spacing-4);
                    border-bottom: 1px solid var(--border-color);
                }

                .setting-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .setting-info {
                    display: flex;
                    flex-direction: column;
                }

                .setting-label {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .setting-desc {
                    font-size: var(--font-size-sm);
                    color: var(--text-muted);
                }

                .toggle-btn {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    transition: color 0.3s ease;
                }

                .toggle-btn.active {
                    color: var(--primary-500);
                }
            `}</style>
        </>
    );
};

export default Settings;
