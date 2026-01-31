import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const from = location.state?.from?.pathname || null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await login(formData);
        if (result.success) {
            // Redirect based on role
            const redirectPath = from || (result.user.role === 'admin' ? '/admin' : '/dashboard');
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
                        Bridging Citizens and Governance
                    </p>
                    <div className="auth-features">
                        <div className="feature-item">
                            <span className="feature-icon">🗳️</span>
                            <span>Voice your concerns</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <span>Track policy changes</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🤝</span>
                            <span>Engage with governance</span>
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
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue to your dashboard</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
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

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter your password"
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
                            {errors.password && <span className="form-error">{errors.password}</span>}
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
                                    <FiLogIn />
                                    <span>Sign In</span>
                                    <FiArrowRight className="arrow-icon" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
