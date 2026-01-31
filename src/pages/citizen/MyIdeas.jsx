import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ideaAPI from '../../services/ideaAPI';
import {
    FiThumbsUp, FiEye, FiTrash2, FiPlus, FiFilter, FiClock,
    FiCheckCircle, FiAlertCircle, FiAward, FiZap, FiXCircle,
    FiMessageSquare, FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './MyIdeas.css';

const MyIdeas = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchMyIdeas();
    }, [filter]);

    const fetchMyIdeas = async () => {
        try {
            setLoading(true);
            const response = await ideaAPI.getAllIdeas({
                myIdeas: true,
                status: filter !== 'All' ? filter : undefined
            });
            setIdeas(response.data.ideas);
        } catch (error) {
            console.error('Error fetching ideas:', error);
            toast.error('Failed to load your ideas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this idea?')) return;

        try {
            await ideaAPI.deleteIdea(id);
            setIdeas(ideas.filter(idea => idea._id !== id));
            toast.success('Idea deleted successfully', {
                style: {
                    background: '#10b981',
                    color: '#fff',
                }
            });
        } catch (error) {
            console.error('Error deleting idea:', error);
            toast.error('Failed to delete idea');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Submitted': 'status-submitted',
            'Under Review': 'status-review',
            'Shortlisted': 'status-shortlisted',
            'Approved': 'status-approved',
            'Implemented': 'status-implemented',
            'Rejected': 'status-rejected'
        };
        return colors[status] || 'status-default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Submitted': FiClock,
            'Under Review': FiAlertCircle,
            'Shortlisted': FiAward,
            'Approved': FiCheckCircle,
            'Implemented': FiZap,
            'Rejected': FiXCircle
        };
        return icons[status] || FiClock;
    };

    const statuses = ['All', 'Submitted', 'Under Review', 'Shortlisted', 'Approved', 'Implemented', 'Rejected'];

    const statusCounts = {
        'All': ideas.length,
        'Submitted': ideas.filter(i => i.status === 'Submitted').length,
        'Under Review': ideas.filter(i => i.status === 'Under Review').length,
        'Shortlisted': ideas.filter(i => i.status === 'Shortlisted').length,
        'Approved': ideas.filter(i => i.status === 'Approved').length,
        'Implemented': ideas.filter(i => i.status === 'Implemented').length,
        'Rejected': ideas.filter(i => i.status === 'Rejected').length,
    };

    return (
        <Layout>
            <div className="my-ideas-modern">
                {/* Hero Header */}
                <motion.div
                    className="my-ideas-hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <div className="hero-icon">💡</div>
                        <h1 className="hero-title">
                            My <span className="gradient-text">Innovative Ideas</span>
                        </h1>
                        <p className="hero-subtitle">
                            Track and manage your submitted ideas
                        </p>
                        <Link to="/dashboard/ideas/submit" className="btn-hero">
                            <FiPlus /> Submit New Idea
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    className="stats-overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-card-my">
                        <div className="stat-icon-my total">
                            <FiZap />
                        </div>
                        <div className="stat-info-my">
                            <div className="stat-value-my">{ideas.length}</div>
                            <div className="stat-label-my">Total Ideas</div>
                        </div>
                    </div>
                    <div className="stat-card-my">
                        <div className="stat-icon-my pending">
                            <FiClock />
                        </div>
                        <div className="stat-info-my">
                            <div className="stat-value-my">{statusCounts['Submitted'] + statusCounts['Under Review']}</div>
                            <div className="stat-label-my">Pending</div>
                        </div>
                    </div>
                    <div className="stat-card-my">
                        <div className="stat-icon-my approved">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-info-my">
                            <div className="stat-value-my">{statusCounts['Approved']}</div>
                            <div className="stat-label-my">Approved</div>
                        </div>
                    </div>
                    <div className="stat-card-my">
                        <div className="stat-icon-my implemented">
                            <FiAward />
                        </div>
                        <div className="stat-info-my">
                            <div className="stat-value-my">{statusCounts['Implemented']}</div>
                            <div className="stat-label-my">Implemented</div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters Bar */}
                <motion.div
                    className="filters-bar-my"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="filter-tabs">
                        {statuses.map(status => (
                            <button
                                key={status}
                                className={`filter-tab ${filter === status ? 'active' : ''}`}
                                onClick={() => setFilter(status)}
                            >
                                {status}
                                {statusCounts[status] > 0 && (
                                    <span className="count-badge">{statusCounts[status]}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Ideas List */}
                {loading ? (
                    <div className="loading-state-my">
                        <div className="spinner-my"></div>
                        <p>Loading your ideas...</p>
                    </div>
                ) : ideas.length === 0 ? (
                    <motion.div
                        className="empty-state-my"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon-my">💡</div>
                        <h3>No ideas found</h3>
                        <p>Start sharing your innovative ideas with the government!</p>
                        <Link to="/dashboard/ideas/submit" className="btn-empty">
                            <FiPlus /> Submit Your First Idea
                        </Link>
                    </motion.div>
                ) : (
                    <div className="ideas-list-my">
                        <AnimatePresence>
                            {ideas.map((idea, index) => {
                                const StatusIcon = getStatusIcon(idea.status);

                                return (
                                    <motion.div
                                        key={idea._id}
                                        className="idea-item-my"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -3 }}
                                    >
                                        <div className="idea-container-my">
                                            <div className="idea-main-my">
                                                <div className="idea-header-my">
                                                    <Link to={`/dashboard/ideas/${idea._id}`} className="idea-title-my">
                                                        {idea.title}
                                                    </Link>
                                                    <span className={`status-badge-my ${getStatusColor(idea.status)}`}>
                                                        <StatusIcon /> {idea.status}
                                                    </span>
                                                </div>

                                                <p className="idea-description-my">
                                                    {idea.description.substring(0, 200)}...
                                                </p>

                                                <div className="idea-meta-my">
                                                    <span className="category-my">{idea.category}</span>
                                                    <span className="meta-item-my">
                                                        <FiThumbsUp /> {idea.upvoteCount} upvotes
                                                    </span>
                                                    <span className="meta-item-my">
                                                        <FiEye /> {idea.viewCount} views
                                                    </span>
                                                    <span className="date-my">
                                                        <FiClock /> {new Date(idea.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {idea.governmentResponse?.message && (
                                                    <div className="gov-response-preview-my">
                                                        <div className="response-header-my">
                                                            <FiMessageSquare />
                                                            <strong>Government Response:</strong>
                                                        </div>
                                                        <p>{idea.governmentResponse.message.substring(0, 150)}...</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="idea-actions-my">
                                                <Link
                                                    to={`/dashboard/ideas/${idea._id}`}
                                                    className="action-btn-my view"
                                                >
                                                    <FiEye /> View
                                                </Link>
                                                <button
                                                    className="action-btn-my delete"
                                                    onClick={() => handleDelete(idea._id)}
                                                    title="Delete this idea"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyIdeas;
