import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiCheckCircle, FiUsers } from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../Pages.css';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/leaderboard');
            if (data.success) {
                setLeaders(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            toast.error('Failed to load leaderboard');
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
                    >
                        <div className="page-header" style={{ textAlign: 'center', display: 'block', marginBottom: '3rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                borderRadius: '24px',
                                color: 'white',
                                fontSize: '2.5rem',
                                marginBottom: '1.5rem',
                                boxShadow: '0 10px 20px rgba(255, 165, 0, 0.3)'
                            }}>
                                <FiAward />
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Community Heroes</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Recognizing the citizens making our neighborhood better</p>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : (
                            <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {leaders.map((leader, index) => (
                                    <motion.div
                                        key={leader._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="card glass-card"
                                        style={{
                                            padding: '2rem',
                                            textAlign: 'center',
                                            position: 'relative',
                                            border: index === 0 ? '2px solid #FFD700' : '1px solid var(--border-light)',
                                            background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'white'
                                        }}
                                    >
                                        {index < 3 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-15px',
                                                right: '20px',
                                                background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                                color: 'white',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '800',
                                                fontSize: '1.2rem',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                #{index + 1}
                                            </div>
                                        )}

                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            margin: '0 auto 1.5rem',
                                            background: 'var(--primary-100)',
                                            color: 'var(--primary-700)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            fontWeight: '700',
                                            border: '4px solid white',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                                        }}>
                                            {leader.name?.charAt(0) || 'U'}
                                        </div>

                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>{leader.name}</h3>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                    <FiTrendingUp /> Reports
                                                </div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>{leader.reportCount}</div>
                                            </div>
                                            <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                    <FiCheckCircle /> Resolved
                                                </div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-600)' }}>{leader.resolvedCount}</div>
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '0.8rem',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)'
                                        }}>
                                            Impact Score: {leader.reportCount * 10 + leader.resolvedCount * 50}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default Leaderboard;
