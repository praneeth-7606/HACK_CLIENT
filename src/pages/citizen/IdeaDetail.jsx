import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ideaAPI from '../../services/ideaAPI';
import { useAuth } from '../../context/AuthContext';
import {
    FiThumbsUp, FiThumbsDown, FiEye, FiClock, FiMapPin, FiDollarSign,
    FiCalendar, FiCheckCircle, FiAlertCircle, FiPackage, FiEdit, FiTrash2,
    FiAward, FiTrendingUp
} from 'react-icons/fi';
import './IdeaDetail.css';

const IdeaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasDownvoted, setHasDownvoted] = useState(false);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        fetchIdea();
    }, [id]);

    const fetchIdea = async () => {
        try {
            setLoading(true);
            const response = await ideaAPI.getIdeaById(id);
            setIdea(response.data.idea);
            setHasUpvoted(response.data.hasUpvoted);
            setHasDownvoted(response.data.hasDownvoted);
        } catch (error) {
            console.error('Error fetching idea:', error);
            alert('Failed to load idea');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (type) => {
        if (voting) return;
        
        try {
            setVoting(true);
            if (type === 'up') {
                await ideaAPI.upvoteIdea(id);
                setHasUpvoted(true);
                setHasDownvoted(false);
                setIdea(prev => ({
                    ...prev,
                    upvoteCount: prev.upvoteCount + (hasUpvoted ? 0 : 1),
                    downvoteCount: hasDownvoted ? prev.downvoteCount - 1 : prev.downvoteCount
                }));
            } else {
                await ideaAPI.downvoteIdea(id);
                setHasDownvoted(true);
                setHasUpvoted(false);
                setIdea(prev => ({
                    ...prev,
                    downvoteCount: prev.downvoteCount + (hasDownvoted ? 0 : 1),
                    upvoteCount: hasUpvoted ? prev.upvoteCount - 1 : prev.upvoteCount
                }));
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setVoting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this idea?')) return;

        try {
            await ideaAPI.deleteIdea(id);
            alert('Idea deleted successfully');
            navigate('/dashboard/ideas');
        } catch (error) {
            console.error('Error deleting idea:', error);
            alert('Failed to delete idea');
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

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading idea...</p>
                </div>
            </Layout>
        );
    }

    if (!idea) {
        return (
            <Layout>
                <div className="error-container">
                    <h2>Idea not found</h2>
                    <Link to="/dashboard/ideas" className="btn btn-primary">
                        Back to Ideas
                    </Link>
                </div>
            </Layout>
        );
    }

    const isOwner = user?._id === idea.submittedBy?._id;

    return (
        <Layout>
            <div className="idea-detail-page">
                {/* Header */}
                <div className="idea-detail-header">
                    <div className="header-top">
                        <div className="breadcrumb">
                            <Link to="/dashboard/ideas">Ideas</Link>
                            <span>/</span>
                            <span>{idea.title}</span>
                        </div>
                        {isOwner && (
                            <div className="header-actions">
                                <button className="btn-icon" onClick={() => navigate(`/dashboard/ideas/edit/${id}`)}>
                                    <FiEdit /> Edit
                                </button>
                                <button className="btn-icon btn-danger" onClick={handleDelete}>
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="header-content">
                        <div className="header-badges">
                            <span className="category-badge">{idea.category}</span>
                            <span className={`status-badge ${getStatusColor(idea.status)}`}>
                                {idea.status}
                            </span>
                            {idea.isFeatured && (
                                <span className="featured-badge">
                                    <FiAward /> Featured
                                </span>
                            )}
                        </div>

                        <h1>{idea.title}</h1>

                        <div className="header-meta">
                            <div className="submitter-info">
                                <div className="avatar">
                                    {idea.submittedBy?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="name">{idea.submittedBy?.name}</div>
                                    <div className="date">
                                        <FiClock /> {new Date(idea.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="stats-row">
                                <div className="stat">
                                    <FiEye />
                                    <span>{idea.viewCount} views</span>
                                </div>
                                <div className="stat">
                                    <FiMapPin />
                                    <span>{idea.targetArea}</span>
                                </div>
                                <div className="stat">
                                    <FiTrendingUp />
                                    <span>{idea.expectedImpact} Impact</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Voting Section */}
                <div className="voting-section">
                    <button
                        className={`vote-btn ${hasUpvoted ? 'active' : ''}`}
                        onClick={() => handleVote('up')}
                        disabled={voting}
                    >
                        <FiThumbsUp />
                        <span>{idea.upvoteCount}</span>
                    </button>
                    <button
                        className={`vote-btn ${hasDownvoted ? 'active' : ''}`}
                        onClick={() => handleVote('down')}
                        disabled={voting}
                    >
                        <FiThumbsDown />
                        <span>{idea.downvoteCount}</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="idea-content">
                    <div className="content-main">
                        {/* Description */}
                        <section className="content-section">
                            <h2>Description</h2>
                            <p>{idea.description}</p>
                        </section>

                        {/* Benefits */}
                        {idea.benefits && idea.benefits.length > 0 && (
                            <section className="content-section">
                                <h2><FiCheckCircle /> Expected Benefits</h2>
                                <ul className="list-styled">
                                    {idea.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Challenges */}
                        {idea.challenges && idea.challenges.length > 0 && (
                            <section className="content-section">
                                <h2><FiAlertCircle /> Potential Challenges</h2>
                                <ul className="list-styled">
                                    {idea.challenges.map((challenge, index) => (
                                        <li key={index}>{challenge}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Resources */}
                        {idea.resources && idea.resources.length > 0 && (
                            <section className="content-section">
                                <h2><FiPackage /> Required Resources</h2>
                                <ul className="list-styled">
                                    {idea.resources.map((resource, index) => (
                                        <li key={index}>{resource}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Government Response */}
                        {idea.governmentResponse?.message && (
                            <section className="content-section gov-response">
                                <h2>🏛️ Government Response</h2>
                                <div className="response-box">
                                    <p>{idea.governmentResponse.message}</p>
                                    {idea.governmentResponse.estimatedImplementationDate && (
                                        <div className="response-date">
                                            <FiCalendar />
                                            <span>
                                                Estimated Implementation: {new Date(idea.governmentResponse.estimatedImplementationDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Implementation Progress */}
                        {idea.implementation?.progress > 0 && (
                            <section className="content-section">
                                <h2>Implementation Progress</h2>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${idea.implementation.progress}%` }}
                                    >
                                        {idea.implementation.progress}%
                                    </div>
                                </div>
                                {idea.implementation.updates && idea.implementation.updates.length > 0 && (
                                    <div className="updates-list">
                                        {idea.implementation.updates.map((update, index) => (
                                            <div key={index} className="update-item">
                                                <div className="update-date">
                                                    {new Date(update.updatedAt).toLocaleDateString()}
                                                </div>
                                                <div className="update-message">{update.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="content-sidebar">
                        {/* Budget Info */}
                        {idea.estimatedBudget?.amount && (
                            <div className="info-card">
                                <h3><FiDollarSign /> Estimated Budget</h3>
                                <div className="budget-amount">
                                    ₹{idea.estimatedBudget.amount.toLocaleString()}
                                </div>
                                {idea.estimatedBudget.description && (
                                    <p className="budget-desc">{idea.estimatedBudget.description}</p>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        {idea.timeline?.proposed && (
                            <div className="info-card">
                                <h3><FiCalendar /> Timeline</h3>
                                <div className="timeline-info">
                                    <strong>{idea.timeline.proposed}</strong>
                                    {idea.timeline.description && (
                                        <p>{idea.timeline.description}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {idea.tags && idea.tags.length > 0 && (
                            <div className="info-card">
                                <h3>Tags</h3>
                                <div className="tags-list">
                                    {idea.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default IdeaDetail;
