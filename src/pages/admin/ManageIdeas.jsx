import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ideaAPI from '../../services/ideaAPI';
import { 
    FiThumbsUp, FiEye, FiFilter, FiSearch, FiMessageSquare,
    FiCheckCircle, FiXCircle, FiClock, FiX, FiSend, FiCalendar,
    FiTrendingUp, FiZap, FiAlertCircle, FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ManageIdeas.css';

const ManageIdeas = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        status: 'All',
        search: '',
        sortBy: 'createdAt'
    });
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseData, setResponseData] = useState({
        status: '',
        message: '',
        newStatus: '',
        estimatedImplementationDate: ''
    });

    useEffect(() => {
        fetchIdeas();
    }, [filters]);

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            const response = await ideaAPI.getAllIdeas(filters);
            setIdeas(response.data.ideas);
        } catch (error) {
            console.error('Error fetching ideas:', error);
            toast.error('Failed to load ideas');
        } finally {
            setLoading(false);
        }
    };

    const handleAddResponse = async (e) => {
        e.preventDefault();
        try {
            const response = await ideaAPI.addGovernmentResponse(selectedIdea._id, responseData);
            
            if (response.success) {
                setShowResponseModal(false);
                setResponseData({ status: '', message: '', newStatus: '', estimatedImplementationDate: '' });
                await fetchIdeas();
                toast.success('✓ Response added successfully!', {
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    }
                });
            }
        } catch (error) {
            console.error('Error adding response:', error);
            toast.error(error.response?.data?.message || 'Failed to add response');
        }
    };

    const categories = [
        'All', 'Revenue Generation', 'Infrastructure Development', 
        'Technology & Innovation', 'Agriculture & Farming', 'Education',
        'Healthcare', 'Environment & Sustainability', 'Transportation'
    ];

    const statuses = ['All', 'Submitted', 'Under Review', 'Shortlisted', 'Approved', 'Implemented', 'Rejected'];

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

    return (
        <Layout>
            <div className="manage-ideas-modern">
                {/* Hero Header */}
                <motion.div 
                    className="ideas-hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <div className="hero-icon">💡</div>
                        <h1 className="hero-title">
                            Manage <span className="gradient-text">Citizen Ideas</span>
                        </h1>
                        <p className="hero-subtitle">
                            Review, respond, and transform innovative ideas into reality
                        </p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-card-modern">
                        <div className="stat-icon submitted">
                            <FiClock />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{ideas.filter(i => i.status === 'Submitted').length}</div>
                            <div className="stat-label">Submitted</div>
                        </div>
                    </div>
                    <div className="stat-card-modern">
                        <div className="stat-icon review">
                            <FiAlertCircle />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{ideas.filter(i => i.status === 'Under Review').length}</div>
                            <div className="stat-label">Under Review</div>
                        </div>
                    </div>
                    <div className="stat-card-modern">
                        <div className="stat-icon approved">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{ideas.filter(i => i.status === 'Approved').length}</div>
                            <div className="stat-label">Approved</div>
                        </div>
                    </div>
                    <div className="stat-card-modern">
                        <div className="stat-icon implemented">
                            <FiZap />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{ideas.filter(i => i.status === 'Implemented').length}</div>
                            <div className="stat-label">Implemented</div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters Section */}
                <motion.div 
                    className="filters-modern"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="filter-group-modern">
                        <FiSearch className="filter-icon" />
                        <input
                            type="text"
                            placeholder="Search ideas..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                            className="search-input-modern"
                        />
                    </div>

                    <div className="filter-group-modern">
                        <FiFilter className="filter-icon" />
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters({...filters, category: e.target.value})}
                            className="select-modern"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group-modern">
                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="select-modern"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group-modern">
                        <FiTrendingUp className="filter-icon" />
                        <select 
                            value={filters.sortBy}
                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                            className="select-modern"
                        >
                            <option value="createdAt">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="upvoteCount">Most Upvoted</option>
                        </select>
                    </div>
                </motion.div>

                {/* Ideas Grid */}
                {loading ? (
                    <div className="loading-state-modern">
                        <div className="spinner-modern"></div>
                        <p>Loading ideas...</p>
                    </div>
                ) : ideas.length === 0 ? (
                    <motion.div 
                        className="empty-state-modern"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">💡</div>
                        <h3>No ideas found</h3>
                        <p>No citizen ideas match your filters</p>
                    </motion.div>
                ) : (
                    <div className="ideas-grid-modern">
                        {ideas.map((idea, index) => {
                            const StatusIcon = getStatusIcon(idea.status);
                            
                            return (
                                <motion.div
                                    key={idea._id}
                                    className="idea-card-modern"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="card-header-modern">
                                        <div className="card-badges">
                                            <span className="category-badge-modern">{idea.category}</span>
                                            <span className={`status-badge-modern ${getStatusColor(idea.status)}`}>
                                                <StatusIcon /> {idea.status}
                                            </span>
                                        </div>
                                    </div>

                                    <Link to={`/dashboard/ideas/${idea._id}`} className="card-title-modern">
                                        {idea.title}
                                    </Link>

                                    <p className="card-description-modern">
                                        {idea.description.substring(0, 120)}...
                                    </p>

                                    <div className="card-meta-modern">
                                        <div className="submitter-info-modern">
                                            <div className="avatar-modern">
                                                {idea.submittedBy?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span>{idea.submittedBy?.name}</span>
                                        </div>
                                        <div className="date-modern">
                                            <FiClock />
                                            {new Date(idea.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="card-stats-modern">
                                        <div className="stat-item-modern">
                                            <FiThumbsUp />
                                            <span>{idea.upvoteCount}</span>
                                        </div>
                                        <div className="stat-item-modern">
                                            <FiEye />
                                            <span>{idea.viewCount}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions-modern">
                                        <Link 
                                            to={`/dashboard/ideas/${idea._id}`}
                                            className="btn-modern btn-view"
                                        >
                                            <FiEye /> View
                                        </Link>
                                        <button
                                            className="btn-modern btn-respond"
                                            onClick={() => {
                                                setSelectedIdea(idea);
                                                setShowResponseModal(true);
                                            }}
                                        >
                                            <FiMessageSquare /> Respond
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Response Modal */}
                <AnimatePresence>
                    {showResponseModal && (
                        <motion.div 
                            className="modal-overlay-modern"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowResponseModal(false)}
                        >
                            <motion.div 
                                className="modal-content-modern"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="modal-header-modern">
                                    <div className="modal-icon">
                                        <FiMessageSquare />
                                    </div>
                                    <div>
                                        <h2>Add Government Response</h2>
                                        <p>Responding to: <strong>{selectedIdea?.title}</strong></p>
                                    </div>
                                    <button 
                                        className="modal-close"
                                        onClick={() => setShowResponseModal(false)}
                                    >
                                        <FiX />
                                    </button>
                                </div>

                                <form onSubmit={handleAddResponse} className="modal-form-modern">
                                    <div className="form-group-modal">
                                        <label className="form-label-modal">
                                            Response Status *
                                        </label>
                                        <select
                                            value={responseData.status}
                                            onChange={(e) => setResponseData({...responseData, status: e.target.value})}
                                            className="form-input-modal"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Acknowledged">Acknowledged</option>
                                            <option value="Under Consideration">Under Consideration</option>
                                            <option value="Approved for Implementation">Approved for Implementation</option>
                                            <option value="Not Feasible">Not Feasible</option>
                                        </select>
                                    </div>

                                    <div className="form-group-modal">
                                        <label className="form-label-modal">
                                            Update Idea Status
                                        </label>
                                        <select
                                            value={responseData.newStatus}
                                            onChange={(e) => setResponseData({...responseData, newStatus: e.target.value})}
                                            className="form-input-modal"
                                        >
                                            <option value="">Keep Current Status</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="On Hold">On Hold</option>
                                        </select>
                                    </div>

                                    <div className="form-group-modal">
                                        <label className="form-label-modal">
                                            Response Message *
                                        </label>
                                        <textarea
                                            value={responseData.message}
                                            onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                                            placeholder="Provide detailed feedback to the citizen..."
                                            className="form-textarea-modal"
                                            required
                                            rows={5}
                                        />
                                    </div>

                                    <div className="form-group-modal">
                                        <label className="form-label-modal">
                                            <FiCalendar /> Estimated Implementation Date
                                        </label>
                                        <input
                                            type="date"
                                            value={responseData.estimatedImplementationDate}
                                            onChange={(e) => setResponseData({...responseData, estimatedImplementationDate: e.target.value})}
                                            className="form-input-modal"
                                        />
                                    </div>

                                    <div className="modal-actions-modern">
                                        <button 
                                            type="button" 
                                            className="btn-modal btn-cancel"
                                            onClick={() => setShowResponseModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-modal btn-submit">
                                            <FiSend /> Submit Response
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default ManageIdeas;
