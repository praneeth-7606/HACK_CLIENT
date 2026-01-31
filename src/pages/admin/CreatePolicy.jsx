import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiSave,
    FiX,
    FiFileText,
    FiTag,
    FiCalendar,
    FiUpload
} from 'react-icons/fi';
import { policyAPI } from '../../services/policyAPI';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const CreatePolicy = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Infrastructure',
        status: 'Draft',
        documentUrl: '',
        effectiveDate: '',
        tags: ''
    });
    const [errors, setErrors] = useState({});

    const categories = [
        'Health',
        'Education',
        'Infrastructure',
        'Environment',
        'Economy',
        'Transportation',
        'Public Safety',
        'Housing',
        'Technology',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim() || formData.title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        }

        if (!formData.description.trim() || formData.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('status', formData.status);

            if (formData.documentUrl) {
                formDataToSend.append('documentUrl', formData.documentUrl);
            }

            if (formData.effectiveDate) {
                formDataToSend.append('effectiveDate', formData.effectiveDate);
            }

            // Add PDF file if selected
            if (pdfFile) {
                formDataToSend.append('policyPdf', pdfFile);
            }

            // Convert tags string to array
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            if (tagsArray.length > 0) {
                formDataToSend.append('tags', JSON.stringify(tagsArray));
            }

            const { data } = await policyAPI.createPolicy(formDataToSend);

            if (data.success) {
                toast.success('Policy created successfully! 🎉');
                navigate('/admin/policies');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create policy';
            toast.error(message);
        } finally {
            setLoading(false);
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
                        <div className="dashboard-header">
                            <div>
                                <h1 className="dashboard-title">Create New Policy</h1>
                                <p className="dashboard-subtitle">
                                    Add a new government policy for citizens to review
                                </p>
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => navigate('/admin/policies')}
                            >
                                <FiX /> Cancel
                            </button>
                        </div>

                        <form className="policy-form" onSubmit={handleSubmit}>
                            <div className="section-card">
                                <h3 className="section-card-title">Policy Information</h3>

                                {/* Title */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiFileText /> Policy Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        className={`form-input ${errors.title ? 'error' : ''}`}
                                        placeholder="e.g., New Public Transportation Initiative"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                    {errors.title && <span className="form-error">{errors.title}</span>}
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        {formData.title.length}/200 characters
                                    </small>
                                </div>

                                {/* Category & Status */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiTag /> Category *
                                        </label>
                                        <select
                                            name="category"
                                            className="form-input"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            name="status"
                                            className="form-input"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Published">Published</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Full Description *</label>
                                    <textarea
                                        name="description"
                                        className={`form-input ${errors.description ? 'error' : ''}`}
                                        placeholder="Provide a detailed description of the policy, its objectives, and expected impact..."
                                        rows="8"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                    {errors.description && (
                                        <span className="form-error">{errors.description}</span>
                                    )}
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        {formData.description.length} characters
                                    </small>
                                </div>

                                {/* Document URL */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiUpload /> Document URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="documentUrl"
                                        className="form-input"
                                        placeholder="https://example.com/policy-document.pdf"
                                        value={formData.documentUrl}
                                        onChange={handleChange}
                                    />
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        Link to official policy document or PDF
                                    </small>
                                </div>

                                {/* Dates */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiCalendar /> Effective Date
                                        </label>
                                        <input
                                            type="date"
                                            name="effectiveDate"
                                            className="form-input"
                                            value={formData.effectiveDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* PDF Upload */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiUpload /> Upload Policy PDF (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-input"
                                        onChange={(e) => setPdfFile(e.target.files[0])}
                                    />
                                    {pdfFile && (
                                        <small style={{ color: 'var(--secondary-600)', display: 'block', marginTop: '0.5rem' }}>
                                            ✓ Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </small>
                                    )}
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        Upload PDF document for AI-powered analysis (Max 10MB)
                                    </small>
                                </div>

                                {/* Tags */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiTag /> Tags (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        className="form-input"
                                        placeholder="infrastructure, roads, public transport"
                                        value={formData.tags}
                                        onChange={handleChange}
                                    />
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        Separate tags with commas
                                    </small>
                                </div>

                                {/* Submit Buttons */}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/admin/policies')}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? (
                                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                        ) : (
                                            <>
                                                <FiSave />
                                                <span>Create Policy</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </main>
            </div>

            <style jsx>{`
        .policy-form {
          max-width: 900px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-4);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-3);
          margin-top: var(--spacing-6);
          padding-top: var(--spacing-6);
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </>
    );
};

export default CreatePolicy;
