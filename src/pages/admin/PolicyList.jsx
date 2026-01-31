import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiFilter,
    FiSearch
} from 'react-icons/fi';
import { policyAPI } from '../../services/policyAPI';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const PolicyList = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'All',
        status: 'All',
        search: ''
    });

    useEffect(() => {
        fetchPolicies();
    }, [filters]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const params = { limit: 100 }; // Increase limit to show more policies
            if (filters.category !== 'All') params.category = filters.category;
            if (filters.status !== 'All') params.status = filters.status;
            if (filters.search) params.search = filters.search;

            const { data } = await policyAPI.getAllPolicies(params);
            if (data.success) {
                setPolicies(data.data.policies);
            }
        } catch (error) {
            console.error('Fetch policies error:', error);
            toast.error('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;

        try {
            const { data } = await policyAPI.deletePolicy(id);
            if (data.success) {
                toast.success(data.message);
                fetchPolicies();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete policy');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Draft': 'badge-warning',
            'Under Review': 'badge-primary',
            'Published': 'badge-success',
            'Archived': 'badge-danger'
        };
        return colors[status] || 'badge-primary';
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
                                <h1 className="dashboard-title">Policy Management</h1>
                                <p className="dashboard-subtitle">
                                    Manage all government policies
                                </p>
                            </div>
                            <Link to="/admin/policies/create" className="btn btn-primary">
                                <FiPlus /> Create Policy
                            </Link>
                        </div>

                        {/* Filters */}
                        <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                            <div className="filters-grid">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <FiSearch /> Search
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search policies..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <FiFilter /> Category
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

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <FiFilter /> Status
                                    </label>
                                    <select
                                        className="form-input"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Published">Published</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Policies Table */}
                        <div className="section-card">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                                </div>
                            ) : policies.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <p>No policies found</p>
                                    <Link to="/admin/policies/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                        <FiPlus /> Create First Policy
                                    </Link>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Views</th>
                                            <th>Support</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {policies.map((policy) => (
                                            <tr key={policy._id}>
                                                <td>
                                                    <div style={{ padding: '0.5rem 0' }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                            {policy.title}
                                                        </div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {policy.description}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {policy.category.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusColor(policy.status)}`} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {policy.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{policy.viewCount}</td>
                                                <td style={{ fontWeight: 500 }}>{policy.supportCount}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {new Date(policy.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => navigate(`/policies/${policy._id}`)}
                                                            title="View Details"
                                                            style={{ padding: '6px' }}
                                                        >
                                                            <FiEye style={{ fontSize: '1.1rem' }} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => navigate(`/admin/policies/edit/${policy._id}`)}
                                                            title="Edit Policy"
                                                            style={{ padding: '6px' }}
                                                        >
                                                            <FiEdit2 style={{ fontSize: '1.1rem' }} />
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleDelete(policy._id)}
                                                            title="Delete Policy"
                                                            style={{ color: 'var(--accent-rose)', padding: '6px' }}
                                                        >
                                                            <FiTrash2 style={{ fontSize: '1.1rem' }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                </main>
            </div>

        </>
    );
};

export default PolicyList;
