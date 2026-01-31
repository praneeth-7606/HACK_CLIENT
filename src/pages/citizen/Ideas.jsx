import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ideaAPI from '../../services/ideaAPI';
import { useAuth } from '../../context/AuthContext';
import {
    FiThumbsUp, FiThumbsDown, FiEye, FiClock, FiTrendingUp,
    FiFilter, FiSearch, FiPlus, FiAward, FiDollarSign, FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import './Ideas.css';

const Ideas = () => {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        status: 'All',
        search: ''
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchIdeas();
    }, [filters]);

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            const response = await ideaAPI.getAllIdeas(filters);
            setIdeas(response.data.ideas);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching ideas:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'All', 'Revenue Generation', 'Infrastructure Development',
        'Technology & Innovation', 'Agriculture & Farming', 'Education',
        'Healthcare', 'Environment & Sustainability', 'Transportation',
        'Tourism', 'Urban Planning', 'Rural Development'
    ];

    const statuses = ['All', 'Submitted', 'Under Review', 'Shortlisted', 'Approved', 'Funded', 'Implemented'];

    const getStatusColor = (status) => {
        const colors = {
            'Submitted': 'status-submitted',
            'Under Review': 'status-review',
            'Shortlisted': 'status-shortlisted',
            'Approved': 'status-approved',
            'Funded': 'status-funded',
            'Implemented': 'status-implemented',
            'Rejected': 'status-rejected'
        };
        return colors[status] || 'status-default';
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <Layout>
            <div className="ideas-page">
                {/* Hero Section */}
                <div className="ideas-hero">
                    <div className="hero-content">
                        <h1>💡 Civic Innovation Hub</h1>
                        <p>Share your innovative ideas to make our community better</p>
                        <Link to="/dashboard/ideas/submit" className="btn btn-primary">
                            <FiPlus /> Submit Your Idea
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="ideas-filters">
                    <div className="filter-group">
                        <label className="filter-label">
                            <FiFilter />
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">
                            <FiFilter />
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="search-group">
                        <label className="filter-label">
                            <FiSearch />
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search ideas..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>

                {/* Ideas Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading ideas...</p>
                    </div>
                ) : ideas.length === 0 ? (
                    <div className="empty-state">
                        <FiAward size={64} />
                        <h3>No ideas found</h3>
                        <p>Be the first to submit an innovative idea!</p>
                        <Link to="/dashboard/ideas/submit" className="btn btn-primary">
                            Submit Idea
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="ideas-grid">
                            {ideas.map(idea => {
                                const isOwner = user?._id === idea.submittedBy?._id;

                                return (
                                    <div
                                        key={idea._id}
                                        className="idea-card-enhanced"
                                    >
                                        {/* Card Header with Title and Delete Icon */}
                                        <div className="idea-card-header-row">
                                            <Link
                                                to={`/dashboard/ideas/${idea._id}`}
                                                className="idea-title-link"
                                            >
                                                <h3 className="idea-title">{idea.title}</h3>
                                            </Link>

                                            {isOwner && (
                                                <button
                                                    className="delete-icon-btn"
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        if (window.confirm('Delete this idea?')) {
                                                            try {
                                                                await ideaAPI.deleteIdea(idea._id);
                                                                fetchIdeas();
                                                            } catch (error) {
                                                                console.error('Delete failed:', error);
                                                            }
                                                        }
                                                    }}
                                                    title="Delete idea"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <Link
                                            to={`/dashboard/ideas/${idea._id}`}
                                            className="idea-description-link"
                                        >
                                            <p className="idea-description">
                                                {idea.description.length > 150
                                                    ? `${idea.description.substring(0, 150)}...`
                                                    : idea.description}
                                            </p>
                                        </Link>

                                        {/* Category and Status Badges */}
                                        <div className="idea-badges-row">
                                            <span className="idea-category">{idea.category}</span>
                                            <span className={`idea-status ${getStatusColor(idea.status)}`}>
                                                {idea.status === 'Funded' && <FiCheckCircle />}
                                                {idea.status}
                                            </span>
                                        </div>

                                        {/* Meta Information */}
                                        <div className="idea-meta-enhanced">
                                            <div className="meta-item">
                                                <FiThumbsUp />
                                                <span>{idea.upvoteCount} upvotes</span>
                                            </div>
                                            <div className="meta-item">
                                                <FiEye />
                                                <span>{idea.viewCount} views</span>
                                            </div>
                                            <div className="meta-item">
                                                <FiClock />
                                                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Government Response (if exists) */}
                                        {idea.governmentResponse?.message && (
                                            <div className="gov-response-preview">
                                                <div className="response-header">
                                                    <span className="response-icon">🏛️</span>
                                                    <span className="response-label">Government Response:</span>
                                                </div>
                                                <p className="response-text">
                                                    {idea.governmentResponse.message.length > 100
                                                        ? `${idea.governmentResponse.message.substring(0, 100)}...`
                                                        : idea.governmentResponse.message}
                                                </p>
                                            </div>
                                        )}

                                        {/* Budget Badge for Funded Ideas */}
                                        {idea.status === 'Funded' && idea.budgetAllocation?.allocatedBudget && (
                                            <div className="funded-badge-enhanced">
                                                <FiDollarSign />
                                                <span>{formatCurrency(idea.budgetAllocation.allocatedBudget)}</span>
                                                <span className="funded-label">FUNDED</span>
                                            </div>
                                        )}

                                        {/* Featured Badge */}
                                        {idea.isFeatured && (
                                            <div className="featured-badge-enhanced">
                                                <FiAward /> Featured
                                            </div>
                                        )}

                                        {/* Card Footer */}
                                        <div className="idea-footer-enhanced">
                                            <Link
                                                to={`/dashboard/ideas/${idea._id}`}
                                                className="view-details-link"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {pagination.hasMore && (
                            <div className="load-more">
                                <button className="btn btn-secondary">
                                    Load More Ideas
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Ideas;
