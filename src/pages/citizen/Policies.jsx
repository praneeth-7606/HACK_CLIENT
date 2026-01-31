import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiTag,
    FiFilter,
    FiSearch,
    FiEye,
    FiThumbsUp,
    FiClock
} from 'react-icons/fi';
import { policyAPI } from '../../services/policyAPI';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';
import './CitizenPages.css';

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        search: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 6;
    useEffect(() => {
        fetchPolicies();
    }, [filters, currentPage]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const params = {
                status: 'Published',
                page: currentPage,
                limit: ITEMS_PER_PAGE
            };
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.search) params.search = filters.search;

            const { data } = await policyAPI.getAllPolicies(params);
            if (data.success) {
                setPolicies(data.data.policies);
                setTotalPages(Math.ceil((data.data.total || policies.length) / ITEMS_PER_PAGE));
            }
        } catch (error) {
            toast.error('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSupport = async (policyId) => {
        try {
            const { data } = await policyAPI.supportPolicy(policyId);
            if (data.success) {
                toast.success(data.message);
                // Update the support count locally
                setPolicies(policies.map(p =>
                    p._id === policyId
                        ? { ...p, supportCount: data.data.supportCount }
                        : p
                ));
            }
        } catch (error) {
            toast.error('Failed to support policy');
        }
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
                        <div className="page-header-modern">
                            <div>
                                <h1>Government Policies</h1>
                                <p>
                                    Learn about current policies and show your support
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filter-bar-modern">
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <FiSearch /> Search Policies
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search by title or description..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <FiFilter /> Filter by Category
                                    </label>
                                    <select
                                        className="form-input"
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Health">Health</option>
                                        <option value="Education">Education</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Environment">Environment</option>
                                        <option value="Economy">Economy</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Public Safety">Public Safety</option>
                                        <option value="Housing">Housing</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Policies Grid */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : policies.length === 0 ? (
                            <div className="empty-state">
                                <p style={{ color: 'var(--text-muted)' }}>No policies found</p>
                            </div>
                        ) : (
                            <>
                                <div className="policies-grid-enhanced">
                                    {policies.map((policy) => (
                                        <motion.div
                                            key={policy._id}
                                            className="policy-card-enhanced"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ y: -5 }}
                                        >
                                            {/* Category Badge - Top Right */}
                                            <div className="policy-category-badge">
                                                <FiTag size={12} />
                                                {policy.category}
                                            </div>

                                            {/* Date */}
                                            <div className="policy-date">
                                                <FiClock size={14} />
                                                {new Date(policy.createdAt).toLocaleDateString()}
                                            </div>

                                            {/* Title */}
                                            <Link
                                                to={`/policies/${policy._id}`}
                                                className="policy-title-link-enhanced"
                                            >
                                                <h3 className="policy-title-enhanced">{policy.title}</h3>
                                            </Link>

                                            {/* Description */}
                                            <p className="policy-description-enhanced">
                                                {policy.description.substring(0, 180)}...
                                            </p>

                                            {/* Stats and Actions */}
                                            <div className="policy-footer-enhanced">
                                                <div className="policy-stats-enhanced">
                                                    <span className="stat-item">
                                                        <FiEye size={16} />
                                                        {policy.viewCount}
                                                    </span>
                                                    <span className="stat-item">
                                                        <FiThumbsUp size={16} />
                                                        {policy.supportCount}
                                                    </span>
                                                </div>

                                                <div className="policy-actions-enhanced">
                                                    <button
                                                        className="btn-support"
                                                        onClick={() => handleSupport(policy._id)}
                                                    >
                                                        <FiThumbsUp size={16} />
                                                        Support
                                                    </button>
                                                    <Link
                                                        to={`/policies/${policy._id}`}
                                                        className="btn-read-more"
                                                    >
                                                        Read More →
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>

                                        <div className="pagination-numbers">
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            className="pagination-btn"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default Policies;
