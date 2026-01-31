import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFilter, FiMapPin, FiClock, FiAlertCircle, FiThumbsUp, FiMessageSquare, FiSend, FiUser, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { concernAPI } from '../../services/concernAPI';
import { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../Pages.css';
import './CitizenPages.css';

const ConcernList = () => {
    const { user } = useAuth();
    const [concerns, setConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'All',
        category: 'All'
    });

    // Engagement State
    const [activeComments, setActiveComments] = useState({}); // { concernId: boolean }
    const [commentsData, setCommentsData] = useState({}); // { concernId: [comments] }
    const [commentInputs, setCommentInputs] = useState({}); // { concernId: string }
    const [loadingComments, setLoadingComments] = useState({}); // { concernId: boolean }

    useEffect(() => {
        fetchConcerns();
    }, [filters]);

    // Initialize comments data when concerns are loaded
    useEffect(() => {
        if (concerns.length > 0) {
            const initialCommentsData = {};
            concerns.forEach(concern => {
                if (concern.comments && concern.comments.length > 0) {
                    initialCommentsData[concern._id] = concern.comments;
                }
            });
            setCommentsData(initialCommentsData);
        }
    }, [concerns]);

    const fetchConcerns = async () => {
        try {
            setLoading(true);
            const { data } = await concernAPI.getAllConcerns(filters);
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

    const handleUpvote = async (concernId) => {
        try {
            const { data } = await concernAPI.upvoteConcern(concernId);

            if (data.success) {
                // Update with the response from server
                setConcerns(prev => prev.map(c => {
                    if (c._id === concernId) {
                        return data.data;
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error('Upvote failed:', error);
            toast.error('Failed to upvote');
        }
    };

    const toggleComments = async (concernId) => {
        const isOpen = activeComments[concernId];
        setActiveComments(prev => ({ ...prev, [concernId]: !isOpen }));

        // Comments are already embedded in the concern object
        if (!isOpen) {
            const concern = concerns.find(c => c._id === concernId);
            if (concern && concern.comments) {
                setCommentsData(prev => ({ ...prev, [concernId]: concern.comments }));
            }
        }
    };

    const fetchComments = async (concernId) => {
        // Not needed anymore - comments are embedded
        const concern = concerns.find(c => c._id === concernId);
        if (concern && concern.comments) {
            setCommentsData(prev => ({ ...prev, [concernId]: concern.comments }));
        }
    };

    const handleCommentSubmit = async (concernId, e) => {
        e.preventDefault();
        const text = commentInputs[concernId]?.trim();

        if (!text) return;

        try {
            const { data } = await concernAPI.addComment(concernId, text);
            if (data.success) {
                // Update the concern in the list with the new comment
                setConcerns(prev => prev.map(c => {
                    if (c._id === concernId) {
                        return {
                            ...c,
                            comments: [...(c.comments || []), data.data]
                        };
                    }
                    return c;
                }));

                // Update local comments data
                setCommentsData(prev => ({
                    ...prev,
                    [concernId]: [...(prev[concernId] || []), data.data]
                }));

                setCommentInputs(prev => ({ ...prev, [concernId]: '' }));
                toast.success('Comment added');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            toast.error('Failed to post comment');
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'badge-success';
            case 'In Progress': return 'badge-primary';
            case 'Rejected': return 'badge-danger';
            default: return 'badge-warning';
        }
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="container"
                    >
                        <div className="page-header-modern">
                            <div className="page-header-actions">
                                <div>
                                    <h1>Community Concerns</h1>
                                    <p>View and report issues in your neighborhood</p>
                                </div>
                                <Link to="/dashboard/concerns/report" className="btn btn-primary">
                                    <FiPlus /> Report New Issue
                                </Link>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filter-bar-modern">
                            <div className="filter-bar-header">
                                <FiFilter />
                                <span>Filters</span>
                            </div>
                            <div className="filters-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <select
                                        name="status"
                                        className="form-input"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <select
                                        name="category"
                                        className="form-input"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Sanitation">Sanitation</option>
                                        <option value="Public Safety">Public Safety</option>
                                        <option value="Health">Health</option>
                                        <option value="Environment">Environment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Concerns Grid */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : concerns.length === 0 ? (
                            <div className="empty-state">
                                <FiAlertCircle size={48} />
                                <h3>No concerns found</h3>
                                <p>Be the first to report an issue in your community.</p>
                                <Link to="/dashboard/concerns/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    Report Concern
                                </Link>
                            </div>
                        ) : (
                            <div className="grid-layout">
                                {concerns.map((concern, index) => {
                                    const isUpvoted = concern.upvotes?.some(upvote =>
                                        typeof upvote === 'object' ? upvote._id === user?._id : upvote === user?._id
                                    );
                                    const upvoteCount = concern.upvotes?.length || 0;
                                    const showComments = activeComments[concern._id];
                                    const comments = commentsData[concern._id] || concern.comments || [];

                                    return (
                                        <motion.div
                                            key={concern._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card concern-card"
                                            style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}
                                        >
                                            {concern.imageUrl && (
                                                <div style={{ height: '200px', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
                                                    <img
                                                        src={`${API_BASE_URL}${concern.imageUrl}`}
                                                        alt={concern.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            console.error('Image load error:', concern.imageUrl);
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">Image not available</div>';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span className={`badge ${getStatusColor(concern.status)}`}>
                                                        {concern.status}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {new Date(concern.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '700' }}>{concern.title}</h3>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                    <FiMapPin size={14} /> {concern.location}
                                                </div>

                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
                                                    {concern.description.length > 100
                                                        ? concern.description.substring(0, 100) + '...'
                                                        : concern.description}
                                                </p>

                                                {/* Official Response Highlight */}
                                                {comments.some(c => c.isOfficial) && (
                                                    <div style={{
                                                        background: 'var(--primary-50)',
                                                        border: '1px solid var(--primary-100)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        padding: '1rem',
                                                        marginBottom: '1.5rem',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.85rem' }}>
                                                            <FiCheckCircle size={14} /> OFFICIAL RESPONSE
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--primary-900)', lineBreak: 'anywhere' }}>
                                                            "{comments.filter(c => c.isOfficial).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].text}"
                                                        </p>
                                                    </div>
                                                )}

                                                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div className="avatar" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '0.8rem' }}>
                                                            {concern.createdBy?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {concern.createdBy?.name || 'Unknown'}
                                                        </span>
                                                    </div>

                                                    {/* Engagement Buttons */}
                                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => handleUpvote(concern._id)}
                                                            style={{
                                                                color: isUpvoted ? 'var(--primary-600)' : 'var(--text-secondary)',
                                                                background: isUpvoted ? 'var(--primary-50)' : 'transparent',
                                                                padding: '0.4rem 0.8rem',
                                                                width: 'auto',
                                                                borderRadius: 'var(--radius-full)',
                                                                border: isUpvoted ? '1px solid var(--primary-200)' : '1px solid transparent',
                                                                gap: '0.4rem'
                                                            }}
                                                        >
                                                            <FiThumbsUp style={{ fill: isUpvoted ? 'currentColor' : 'none' }} />
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{upvoteCount}</span>
                                                        </button>

                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => toggleComments(concern._id)}
                                                            style={{
                                                                color: showComments ? 'var(--primary-600)' : 'var(--text-secondary)',
                                                                background: showComments ? 'var(--bg-secondary)' : 'transparent',
                                                                padding: '0.4rem 0.8rem',
                                                                width: 'auto',
                                                                borderRadius: 'var(--radius-full)',
                                                                gap: '0.4rem'
                                                            }}
                                                        >
                                                            <FiMessageSquare />
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Comment</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Comments Section */}
                                                <AnimatePresence>
                                                    {showComments && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            style={{ overflow: 'hidden' }}
                                                        >
                                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                                {/* Comment Form */}
                                                                <form onSubmit={(e) => handleCommentSubmit(concern._id, e)} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        {user?.name?.charAt(0) || <FiUser />}
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        placeholder="Write a comment..."
                                                                        value={commentInputs[concern._id] || ''}
                                                                        onChange={(e) => setCommentInputs({ ...commentInputs, [concern._id]: e.target.value })}
                                                                        style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!commentInputs[concern._id]}
                                                                        className="btn btn-primary"
                                                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    >
                                                                        <FiSend />
                                                                    </button>
                                                                </form>

                                                                {/* Comments List */}
                                                                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                    {loadingComments[concern._id] ? (
                                                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Loading comments...</div>
                                                                    ) : comments.length === 0 ? (
                                                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet. Be the first!</div>
                                                                    ) : (
                                                                        comments.map(comment => (
                                                                            <div key={comment._id} style={{ display: 'flex', gap: '0.8rem' }}>
                                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                                                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                                                </div>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <div style={{ background: 'white', padding: '0.6rem 0.8rem', borderRadius: '0 1rem 1rem 1rem', display: 'inline-block', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                                            {comment.user?.name || 'User'}
                                                                                            {comment.isOfficial && (
                                                                                                <span style={{ background: 'var(--primary-600)', color: 'white', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>OFFICIAL</span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{comment.text}</div>
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem', marginTop: '0.2rem' }}>
                                                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default ConcernList;
