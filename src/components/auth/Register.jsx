import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'citizen',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['#f43f5e', '#f43f5e', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        if (result.success) {
            const redirectPath = result.user.role === 'admin' ? '/admin' : '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    };

    return (
        <div className="auth-page">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-bg-gradient"></div>
                <div className="auth-bg-pattern"></div>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="floating-orb"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + i * 18}%`,
                            animationDelay: `${i * 0.5}s`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                    />
                ))}
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Left Side - Branding */}
                <motion.div
                    className="auth-branding"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="auth-logo">
                        <div className="logo-icon">
                            <span>🏛️</span>
                        </div>
                        <h1>CivicConnect</h1>
                    </div>
                    <p className="auth-tagline">
                        Join the movement for better governance
                    </p>
                    <div className="auth-features">
                        <div className="feature-item">
                            <span className="feature-icon">✨</span>
                            <span>Make your voice heard</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔒</span>
                            <span>Secure & private</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌍</span>
                            <span>Community driven</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    className="auth-form-container"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="auth-form-header">
                        <h2>Create Account</h2>
                        <p>Start your civic engagement journey</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        {/* Role Selection */}
                        <div className="form-group">
                            <label className="form-label">Register As</label>
                            <div className="role-selector">
                                <motion.button
                                    type="button"
                                    className={`role-option ${formData.role === 'citizen' ? 'active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, role: 'citizen' }))}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="role-icon">👤</span>
                                    <span className="role-name">Citizen</span>
                                    <span className="role-desc">Voice concerns & provide feedback</span>
                                    {formData.role === 'citizen' && <FiCheck className="role-check" />}
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, role: 'admin' }))}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="role-icon">🏛️</span>
                                    <span className="role-name">Administrator</span>
                                    <span className="role-desc">Manage platform & respond</span>
                                    {formData.role === 'admin' && <FiCheck className="role-check" />}
                                </motion.button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`strength-bar ${i < passwordStrength ? 'filled' : ''}`}
                                                style={{ backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '' }}
                                            />
                                        ))}
                                    </div>
                                    <span className="strength-label" style={{ color: strengthColors[passwordStrength - 1] }}>
                                        {strengthLabels[passwordStrength] || ''}
                                    </span>
                                </div>
                            )}
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                        </div>

                        {/* Terms */}
                        <div className="form-group">
                            <label className="terms-label">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="terms-checkbox"
                                />
                                <span className="checkmark"></span>
                                <span>
                                    I agree to the <a href="#" className="auth-link">Terms of Service</a> and{' '}
                                    <a href="#" className="auth-link">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.terms && <span className="form-error">{errors.terms}</span>}
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg auth-submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                            ) : (
                                <>
                                    <FiUserPlus />
                                    <span>Create Account</span>
                                    <FiArrowRight className="arrow-icon" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
