import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import { FiArrowRight, FiUsers, FiMessageSquare, FiBarChart2, FiShield } from 'react-icons/fi';
import './Pages.css';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    const features = [
        {
            icon: FiMessageSquare,
            title: 'Voice Your Concerns',
            description: 'Submit issues and concerns directly to your local government with our streamlined platform.',
        },
        {
            icon: FiBarChart2,
            title: 'Track Progress',
            description: 'Follow the status of your submissions and see real changes being made in your community.',
        },
        {
            icon: FiUsers,
            title: 'Community Engagement',
            description: 'Connect with fellow citizens and support causes that matter to your neighborhood.',
        },
        {
            icon: FiShield,
            title: 'Transparent Governance',
            description: 'Access policy documents, budgets, and government decisions in an easy-to-understand format.',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Active Citizens' },
        { value: '5K+', label: 'Issues Resolved' },
        { value: '50+', label: 'Government Partners' },
        { value: '98%', label: 'Satisfaction Rate' },
    ];

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient"></div>
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="hero-orb"
                            style={{
                                left: `${10 + i * 16}%`,
                                top: `${20 + (i % 3) * 25}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.2 }}
                        />
                    ))}
                </div>

                <div className="container hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <motion.span
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            🏛️ Bridging Citizens & Governance
                        </motion.span>

                        <h1 className="hero-title">
                            Your Voice,{' '}
                            <span className="gradient-text">Your City,</span>
                            <br />
                            Your Future
                        </h1>

                        <p className="hero-description">
                            CivicConnect empowers citizens to participate in governance,
                            voice concerns, and track policy changes. Together, we build
                            better communities.
                        </p>

                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <Link
                                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="btn btn-primary btn-lg"
                                >
                                    Go to Dashboard
                                    <FiArrowRight />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started Free
                                        <FiArrowRight />
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Stats */}


                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">
                            Why Choose <span className="gradient-text">CivicConnect</span>?
                        </h2>
                        <p className="section-description">
                            We're building the future of civic engagement, one feature at a time.
                        </p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="feature-icon">
                                    <feature.icon />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2>Ready to Make a Difference?</h2>
                        <p>Join thousands of citizens already shaping their communities.</p>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start Your Journey
                                <FiArrowRight />
                            </Link>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <span>🏛️</span>
                            <span>CivicConnect</span>
                        </div>
                        <p className="footer-text">
                            © 2024 CivicConnect. Built for DevVoid Hackathon.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
