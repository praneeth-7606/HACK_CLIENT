import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    FiTrendingUp, FiCheckCircle, FiClock, FiActivity,
    FiUsers, FiFileText, FiMessageSquare, FiZap, FiTarget, FiAward
} from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { concernAPI } from '../../services/concernAPI';
import { policyAPI } from '../../services/policyAPI';
import { userAPI } from '../../services/api';
import '../Pages.css';

const AdminStats = () => {
    const [concernStats, setConcernStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        inProgress: 0,
        byCategory: [],
        timeline: []
    });
    const [policyStats, setPolicyStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        underReview: 0
    });
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        citizens: 0,
        admins: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        try {
            await Promise.all([
                fetchConcernStats(),
                fetchPolicyStats(),
                fetchUserStats()
            ]);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConcernStats = async () => {
        try {
            const { data } = await concernAPI.getAllConcerns({ limit: 1000 });
            if (data.success) {
                processConcernStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch concern stats:', error);
        }
    };

    const fetchPolicyStats = async () => {
        try {
            const { data } = await policyAPI.getPolicyStats();
            if (data.success) {
                setPolicyStats({
                    total: data.data.stats.totalPolicies,
                    published: data.data.stats.publishedPolicies,
                    draft: data.data.stats.draftPolicies,
                    underReview: data.data.stats.underReviewPolicies
                });
            }
        } catch (error) {
            console.error('Failed to fetch policy stats:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const { data } = await userAPI.getStats();
            if (data.success) {
                setUserStats({
                    total: data.data.totalUsers,
                    active: data.data.activeUsers,
                    citizens: data.data.citizenCount,
                    admins: data.data.adminCount
                });
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const processConcernStats = (concerns) => {
        const total = concerns.length;
        const pending = concerns.filter(c => c.status === 'Pending').length;
        const resolved = concerns.filter(c => c.status === 'Resolved').length;
        const inProgress = concerns.filter(c => c.status === 'In Progress').length;

        const categories = {};
        concerns.forEach(c => {
            categories[c.category] = (categories[c.category] || 0) + 1;
        });
        const byCategory = Object.keys(categories).map(key => ({
            name: key,
            count: categories[key]
        })).sort((a, b) => b.count - a.count);

        const timeline = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const count = concerns.filter(c => {
                const cDate = new Date(c.createdAt);
                return cDate.toDateString() === date.toDateString();
            }).length;
            timeline.push({ name: dayName, concerns: count });
        }

        setConcernStats({ total, pending, resolved, inProgress, byCategory, timeline });
    };

    const StatCard = ({ title, value, icon: Icon, color, delay, trend, trendValue }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 100 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            style={{
                background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                border: `1px solid ${color}30`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-6)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ background: `radial-gradient(circle at top right, ${color}20, transparent)`, position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', pointerEvents: 'none' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        {title}
                    </p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1 }}>
                        {value}
                    </h2>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: trend === 'up' ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                            <FiTrendingUp style={{ transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'white',
                    boxShadow: `0 10px 30px ${color}40`
                }}>
                    <Icon />
                </div>
            </div>
        </motion.div>
    );

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

    const performanceData = [
        { metric: 'Response', value: 85 },
        { metric: 'Resolution', value: 72 },
        { metric: 'Satisfaction', value: 90 },
        { metric: 'Engagement', value: 78 },
        { metric: 'Efficiency', value: 88 }
    ];

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div style={{ marginBottom: 'var(--spacing-8)' }}>
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}>
                                    <FiActivity />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Analytics Dashboard
                                    </h1>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Real-time insights and performance metrics</p>
                                </div>
                            </motion.div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem' }}>
                                <div className="spinner" style={{ margin: '0 auto', width: '60px', height: '60px' }}></div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-4)' }}>
                                    <StatCard title="Total Concerns" value={concernStats.total} icon={FiMessageSquare} color="#6366f1" delay={0.1} trend="up" trendValue="+12% this week" />
                                    <StatCard title="Resolved Issues" value={concernStats.resolved} icon={FiCheckCircle} color="#10b981" delay={0.2} trend="up" trendValue="+8% this week" />
                                    <StatCard title="Active Users" value={userStats.active} icon={FiUsers} color="#8b5cf6" delay={0.3} trend="up" trendValue="+5% this week" />
                                    <StatCard title="Published Policies" value={policyStats.published} icon={FiFileText} color="#f59e0b" delay={0.4} trend="up" trendValue="+3 this month" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                                    {[
                                        { icon: FiClock, value: concernStats.pending, label: 'Pending', color: '#f59e0b', delay: 0.5 },
                                        { icon: FiZap, value: concernStats.inProgress, label: 'In Progress', color: '#3b82f6', delay: 0.6 },
                                        { icon: FiFileText, value: policyStats.draft, label: 'Draft Policies', color: '#ec4899', delay: 0.7 },
                                        { icon: FiTarget, value: policyStats.underReview, label: 'Under Review', color: '#14b8a6', delay: 0.8 }
                                    ].map((stat, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: stat.delay }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', border: '1px solid var(--border-color)' }}>
                                            <stat.icon style={{ fontSize: '1.5rem', color: stat.color }} />
                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>Activity Timeline</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Concerns reported over the last 7 days</p>
                                            </div>
                                            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiTrendingUp /> +12%
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={concernStats.timeline}>
                                                <defs>
                                                    <linearGradient id="colorConcerns" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'var(--bg-card)' }} />
                                                <Area type="monotone" dataKey="concerns" stroke="#6366f1" fillOpacity={1} fill="url(#colorConcerns)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>Performance</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System metrics</p>
                                            </div>
                                            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiAward /> Excellent
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart data={performanceData}>
                                                <PolarGrid stroke="var(--border-light)" />
                                                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                                <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'var(--bg-card)' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Category Distribution</h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <PieChart>
                                                <Pie data={concernStats.byCategory} cx="50%" cy="50%" innerRadius={80} outerRadius={130} fill="#8884d8" paddingAngle={3} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                    {concernStats.byCategory.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'var(--bg-card)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Top Categories</h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={concernStats.byCategory.slice(0, 6)} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-light)" />
                                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={100} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'var(--bg-card)' }} />
                                                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default AdminStats;
