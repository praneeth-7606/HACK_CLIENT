import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCamera, FiCheck, FiMapPin, FiTag, FiType, FiX } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { concernAPI } from '../../services/concernAPI';
import toast from 'react-hot-toast';
import '../Pages.css';

const ReportConcern = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        location: '',
        description: ''
    });

    const categories = [
        'Infrastructure',
        'Sanitation',
        'Public Safety',
        'Health',
        'Environment',
        'Transportation',
        'Utlities',
        'Other'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size should be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.category || !formData.location || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('location', formData.location);
            if (formData.lat) data.append('lat', formData.lat);
            if (formData.lng) data.append('lng', formData.lng);
            data.append('description', formData.description);
            if (file) {
                data.append('image', file);
            }

            const response = await concernAPI.createConcern(data);

            if (response.data.success) {
                toast.success('Concern reported successfully!');
                navigate('/dashboard/concerns');
            }
        } catch (error) {
            console.error('Report concern error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit concern');
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
                        className="container"
                        style={{ maxWidth: '800px' }}
                    >
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: 'var(--accent-rose)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '1.5rem'
                                }}>
                                    <FiAlertCircle />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.2rem' }}>Report a Concern</h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>Help us improve our community by reporting issues.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label"><FiType /> Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        placeholder="Brief title of the issue (e.g., Pothole on Main St)"
                                        value={formData.title}
                                        onChange={handleChange}
                                        maxLength={100}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label"><FiTag /> Category</label>
                                        <div className="select-wrapper">
                                            <select
                                                name="category"
                                                className="form-input"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label"><FiMapPin /> Location</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                name="location"
                                                className="form-input"
                                                placeholder="Location address or landmark"
                                                value={formData.location}
                                                onChange={handleChange}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => {
                                                    if (navigator.geolocation) {
                                                        const loadingToast = toast.loading('Getting current location...');
                                                        navigator.geolocation.getCurrentPosition(
                                                            (position) => {
                                                                const { latitude, longitude } = position.coords;
                                                                setFormData({
                                                                    ...formData,
                                                                    lat: latitude,
                                                                    lng: longitude,
                                                                    // Simple heuristic for display if address is empty
                                                                    location: formData.location || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                                                                });
                                                                toast.success('Location detected!', { id: loadingToast });
                                                            },
                                                            (error) => {
                                                                console.error("Geo error:", error);
                                                                toast.error('Could not get location. Please enter manually.', { id: loadingToast });
                                                            }
                                                        );
                                                    } else {
                                                        toast.error('Geolocation is not supported by your browser.');
                                                    }
                                                }}
                                                style={{ padding: '0 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                                title="Use Current Location"
                                            >
                                                📍
                                            </button>
                                        </div>
                                        {formData.lat && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success-700)', marginTop: '0.25rem' }}>
                                                <FiCheck /> Coordinates captured: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Side by Side Description and Upload */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            className="form-input"
                                            style={{ flex: 1, minHeight: '200px', resize: 'vertical' }}
                                            placeholder="Please provide specific details about the issue..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            maxLength={1000}
                                        ></textarea>
                                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                            {formData.description.length}/1000 characters
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label"><FiCamera /> Upload Evidence (Optional)</label>

                                        {!preview ? (
                                            <div
                                                onClick={() => document.getElementById('file-upload').click()}
                                                style={{
                                                    border: '2px dashed var(--border-color)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    padding: '2rem',
                                                    height: '240px', /* Match text area height approx */
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    background: 'var(--bg-tertiary)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--primary-500)';
                                                    e.currentTarget.style.background = 'var(--primary-50)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                                }}
                                            >
                                                <FiCamera size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                                                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Click to upload image</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG up to 5MB</p>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative', height: '240px' }}>
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: 'var(--radius-lg)',
                                                        border: '1px solid var(--border-color)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        right: '10px',
                                                        background: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/dashboard/concerns')}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                        style={{ flex: 2 }}
                                    >
                                        {loading ? (
                                            <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
                                        ) : (
                                            <>Submit Concern <FiCheck /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default ReportConcern;
