import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiPhone, FiCreditCard, FiMapPin, FiSave, FiEdit2 } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        userId: '', // Aadhar
        panNumber: '',
        phoneNumber: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                userId: user.aadharNumber || '', // Mapping aadharNumber to generic ID field in form if preferred, or specific
                panNumber: user.panNumber || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiData = {
                name: formData.name,
                aadharNumber: formData.userId,
                panNumber: formData.panNumber,
                phoneNumber: formData.phoneNumber,
                address: formData.address
            };

            const result = await updateProfile(apiData);
            if (result.success) {
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error('Failed to update profile');
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
                        <div className="page-header" style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>My Profile</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information</p>
                        </div>

                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Profile Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                                padding: '3rem 2rem',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem'
                            }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-600)',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {user?.name?.charAt(0) || <FiUser />}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>{user?.name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                                        <FiMail /> {user?.email}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9, marginTop: '0.25rem', fontSize: '0.9rem' }}>
                                        <FiShield /> {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} Account
                                    </div>
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    <FiEdit2 /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                            </div>

                            {/* Profile Details Form */}
                            <div style={{ padding: '2.5rem' }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiUser /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-input"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiPhone /> Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                className="form-input"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiCreditCard /> Aadhar Number
                                            </label>
                                            <input
                                                type="text"
                                                name="userId"
                                                className="form-input"
                                                value={formData.userId}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="12-digit Aadhar number"
                                                maxLength="12"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiCreditCard /> PAN Number
                                            </label>
                                            <input
                                                type="text"
                                                name="panNumber"
                                                className="form-input"
                                                value={formData.panNumber}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="PAN Number (e.g., ABCDE1234F)"
                                                maxLength="10"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </div>

                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiMapPin /> Residential Address
                                            </label>
                                            <textarea
                                                name="address"
                                                className="form-input"
                                                value={formData.address}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                placeholder="Enter your full address"
                                                rows="3"
                                                style={{ resize: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                                                <FiSave /> Save Changes
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default Profile;
