import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiMapPin, FiTrash2, FiAlertCircle, FiImage, FiCalendar, FiActivity, FiTool, FiShield, FiHeart } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { concernAPI } from '../../services/concernAPI';
import { API_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import '../Pages.css';

const ManageConcerns = () => {
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [responses, setResponses] = useState({}); // { concernId: string }
    const [submittingResponse, setSubmittingResponse] = useState({}); // { concernId: boolean }

    useEffect(() => {
        fetchConcerns();
    }, [statusFilter]);

    const fetchConcerns = async () => {
        try {
            setLoading(true);
            const { data } = await concernAPI.getAllConcerns({
                status: statusFilter !== 'All' ? statusFilter : undefined
            });
            if (data.success) {
                setConcerns(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch concerns:', error);
            toast.error('Failed to load concerns');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data } = await concernAPI.updateStatus(id, newStatus);
            if (data.success) {
                toast.success(`Concern marked as ${newStatus}`);
                fetchConcerns(); // Refresh list
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this concern?')) return;

        try {
            const { data } = await concernAPI.deleteConcern(id);
            if (data.success) {
                toast.success('Concern deleted successfully');
                setConcerns(concerns.filter(c => c._id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete concern');
        }
    };

    const handleSendResponse = async (id) => {
        const text = responses[id]?.trim();
        if (!text) return;

        try {
            setSubmittingResponse(prev => ({ ...prev, [id]: true }));
            const { data } = await concernAPI.addComment(id, text);
            if (data.success) {
                toast.success('Official response posted');
                setResponses(prev => ({ ...prev, [id]: '' }));
                fetchConcerns(); // Refresh to show comments count or update local state
            }
        } catch (error) {
            console.error('Failed to post response:', error);
            toast.error('Failed to post response');
        } finally {
            setSubmittingResponse(prev => ({ ...prev, [id]: false }));
        }
    };

    // Helper functions for colors and icons
    const getCategoryStyles = (category) => {
        const styles = {
            'Infrastructure': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '#3B82F6', icon: FiTool },
            'Sanitation': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '#10B981', icon: FiActivity },
            'Public Safety': { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '#EF4444', icon: FiShield },
            'Health': { bg: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', border: '#EC4899', icon: FiHeart },
            'Environment': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: '#22C55E', icon: FiActivity },
            'Other': { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280', border: '#6B7280', icon: FiAlertCircle }
        };
        return styles[category] || styles['Other'];
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Resolved': return { bg: '#ECFDF5', color: '#059669', badge: 'badge-success' };
            case 'In Progress': return { bg: '#EFF6FF', color: '#2563EB', badge: 'badge-primary' };
            case 'Rejected': return { bg: '#FEF2F2', color: '#DC2626', badge: 'badge-danger' };
            default: return { bg: '#FFFBEB', color: '#D97706', badge: 'badge-warning' };
        }
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <div className="page-header">
                        <div>
                            <h1 style={{ marginBottom: '0.5rem', background: 'linear-gradient(to right, #2563EB, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Manage Concerns</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Review and update community issues</p>
                        </div>
                        <div className="select-wrapper" style={{ width: '200px' }}>
                            <select
                                className="form-input"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--radius-full)' }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : concerns.length === 0 ? (
                        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                            <FiAlertCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--primary-500)' }} />
                            <h3>No concerns found</h3>
                            <p>Everything seems to be running smoothly.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {concerns.map((concern, index) => {
                                const catStyle = getCategoryStyles(concern.category);
                                const statusStyle = getStatusStyles(concern.status);
                                const CatIcon = catStyle.icon;

                                return (
                                    <motion.div
                                        key={concern._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card"
                                        style={{
                                            display: 'flex',
                                            gap: '1.5rem',
                                            padding: '1.5rem',
                                            alignItems: 'flex-start',
                                            borderLeft: `5px solid ${catStyle.border}`,
                                            background: 'linear-gradient(to right, #ffffff, #fafafa)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                                        }}
                                        whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                                    >
                                        {/* Image Thumbnail */}
                                        <div style={{
                                            width: '140px',
                                            height: '140px',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            background: 'var(--bg-tertiary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: 'inner 0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {concern.imageUrl ? (
                                                <img
                                                    src={`${API_BASE_URL}${concern.imageUrl}`}
                                                    alt="Evidence"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/140x140?text=No+Img'; }}
                                                />
                                            ) : (
                                                <div style={{ color: catStyle.color, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <CatIcon size={32} />
                                                    <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 600 }}>No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <span
                                                        className={`badge`}
                                                        style={{
                                                            background: statusStyle.bg,
                                                            color: statusStyle.color,
                                                            border: `1px solid ${statusStyle.color}30`,
                                                            padding: '0.35rem 0.75rem'
                                                        }}
                                                    >
                                                        {concern.status.toUpperCase()}
                                                    </span>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: catStyle.bg,
                                                            color: catStyle.color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.35rem 0.75rem'
                                                        }}
                                                    >
                                                        <CatIcon size={14} />
                                                        {concern.category}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                                                    <FiCalendar size={14} />
                                                    {new Date(concern.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>{concern.title}</h3>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
                                                <FiMapPin size={16} /> <span style={{ fontWeight: 500 }}>{concern.location}</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
                                                <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.8rem', background: '#3B82F6', color: 'white' }}>
                                                    {concern.createdBy?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span>Reported by <b style={{ color: 'var(--text-primary)' }}>{concern.createdBy?.name || 'Unknown'}</b> ({concern.createdBy?.email})</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '180px' }}>
                                            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-menu)' }}>
                                                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                                                    Update Workflow
                                                </label>
                                                <div className="select-wrapper">
                                                    <select
                                                        className="form-input"
                                                        value={concern.status}
                                                        onChange={(e) => handleStatusUpdate(concern._id, e.target.value)}
                                                        style={{ padding: '0.5rem', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-menu)' }}>
                                                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                                                    Official Response
                                                </label>
                                                <textarea
                                                    className="form-input"
                                                    placeholder="Type official reply..."
                                                    value={responses[concern._id] || ''}
                                                    onChange={(e) => setResponses({ ...responses, [concern._id]: e.target.value })}
                                                    style={{ minHeight: '80px', fontSize: '0.85rem', marginBottom: '0.5rem', resize: 'none' }}
                                                />
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                                                    disabled={!responses[concern._id]?.trim() || submittingResponse[concern._id]}
                                                    onClick={() => handleSendResponse(concern._id)}
                                                >
                                                    {submittingResponse[concern._id] ? 'Sending...' : 'Post Response'}
                                                </button>
                                            </div>

                                            <button
                                                className="btn btn-outline danger"
                                                onClick={() => handleDelete(concern._id)}
                                                style={{ justifyContent: 'center', width: '100%', borderColor: '#fee2e2', color: '#dc2626', background: '#fef2f2' }}
                                            >
                                                <FiTrash2 /> Delete Record
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ManageConcerns;
