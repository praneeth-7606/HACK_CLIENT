import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiTag,
    FiCalendar,
    FiEye,
    FiThumbsUp,
    FiMessageCircle,
    FiSend,
    FiFileText,
    FiZap,
    FiCheckCircle
} from 'react-icons/fi';
import { policyAPI } from '../../services/policyAPI';
import { aiAPI } from '../../services/aiAPI';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import '../Pages.css';

const PolicyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasSupported, setHasSupported] = useState(false);
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Note: showChat state removed as it is now always visible in the new layout

    useEffect(() => {
        fetchPolicy();
        fetchSuggestions();
    }, [id]);

    const fetchPolicy = async () => {
        try {
            setLoading(true);
            const { data } = await policyAPI.getPolicyById(id);
            if (data.success) {
                setPolicy(data.data.policy);
                setHasSupported(data.data.hasSupported || false);
                if (data.data.policy.summary) {
                    setSummary(data.data.policy.summary);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch policy');
            navigate('/dashboard/policies');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const { data } = await aiAPI.getSuggestedQuestions(id);
            if (data.success) {
                setSuggestedQuestions(data.data.questions);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            setLoadingSummary(true);
            const { data } = await aiAPI.summarizePolicy(id);
            if (data.success) {
                setSummary(data.data.summary);
                if (!data.cached) {
                    toast.success('AI summary generated!');
                }
            }
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleSendMessage = async (question) => {
        const messageText = question || currentQuestion;
        if ((!messageText.trim()) || sendingMessage) return;

        // Add user message to chat
        const userMessage = {
            role: 'user',
            text: messageText,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        setCurrentQuestion('');

        try {
            setSendingMessage(true);
            const { data } = await aiAPI.chatWithPolicy(id, messageText);

            if (data.success) {
                const aiMessage = {
                    role: 'ai',
                    text: data.data.answer,
                    timestamp: new Date()
                };
                setChatMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            toast.error('Failed to get response from AI');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleSupportPolicy = async () => {
        if (hasSupported) {
            toast.error('You have already supported this policy');
            return;
        }

        try {
            const { data } = await policyAPI.supportPolicy(id);
            if (data.success) {
                setPolicy(prev => ({
                    ...prev,
                    supportCount: data.data.supportCount
                }));
                setHasSupported(true);
                toast.success('Thank you for your support! 🎉');
            }
        } catch (error) {
            if (error.response?.data?.alreadySupported) {
                setHasSupported(true);
                toast.error('You have already supported this policy');
            } else {
                toast.error('Failed to support policy');
            }
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-layout">
                    <Sidebar />
                    <main className="dashboard-main">
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    if (!policy) return null;

    return (
        <>
            <Navbar />
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ maxWidth: '1400px', margin: '0 auto' }}
                    >
                        {/* Back Button */}
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigate(-1)}
                            style={{ marginBottom: 'var(--spacing-4)', paddingLeft: 0 }}
                        >
                            <FiArrowLeft /> Back to Policies
                        </button>

                        {/* Policy Header Card - High End Design */}
                        <div className="policy-header-card glass-card">
                            <div className="policy-header-top">
                                <div className="policy-badges">
                                    <span className="badge badge-primary">
                                        <FiTag /> {policy.category}
                                    </span>
                                    <span className={`badge ${policy.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                                        {policy.status}
                                    </span>
                                </div>
                                <div className="policy-actions">
                                    <button
                                        className={`btn ${hasSupported ? 'btn-success' : 'btn-primary'}`}
                                        onClick={handleSupportPolicy}
                                        disabled={hasSupported}
                                    >
                                        {hasSupported ? (
                                            <>
                                                <FiCheckCircle size={18} /> Supported
                                            </>
                                        ) : (
                                            <>
                                                <FiThumbsUp size={18} /> Support Policy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <h1 className="policy-title-hero">{policy.title}</h1>

                            <div className="policy-stats-grid">
                                <div className="stat-item">
                                    <div className="stat-icon"><FiCalendar /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Published</span>
                                        <span className="stat-value">{new Date(policy.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon"><FiEye /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Views</span>
                                        <span className="stat-value">{policy.viewCount}</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon"><FiThumbsUp /></div>
                                    <div className="stat-info">
                                        <span className="stat-label">Supporters</span>
                                        <span className="stat-value">{policy.supportCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="policy-content-layout">
                            {/* Left Column: AI & Content */}
                            <div className="content-column main">
                                {/* AI Summary Section */}
                                <div className="section-card ai-summary-modern">
                                    <div className="section-header-modern">
                                        <div className="header-icon-container">
                                            <FiZap className="icon-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="section-title-modern">AI Executive Summary</h3>
                                            <p className="section-subtitle">Key takeaways powered by Gemini AI</p>
                                        </div>
                                        {!summary && (
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={handleGenerateSummary}
                                                disabled={loadingSummary}
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                {loadingSummary ? 'Generating...' : 'Generate Now'}
                                            </button>
                                        )}
                                    </div>

                                    {summary ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="summary-content-modern"
                                        >
                                            {summary}
                                        </motion.div>
                                    ) : (
                                        <div className="empty-state-modern" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                            <p>Generate a concise summary to understand this policy in seconds.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Full Policy Content */}
                                <div className="section-card">
                                    <h3 className="section-title-modern" style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiFileText style={{ color: 'var(--primary-600)' }} /> Policy Details
                                    </h3>
                                    <div className="policy-text-content" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                                        {policy.description}
                                    </div>

                                    {policy.documentUrl && (
                                        <div className="document-download-area" style={{ marginTop: '2rem' }}>
                                            <a
                                                href={policy.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="document-link"
                                            >
                                                <div className="doc-icon"><FiFileText /></div>
                                                <div className="doc-info">
                                                    <span className="doc-name">Official Documentation</span>
                                                    <span className="doc-type">PDF Document</span>
                                                </div>
                                                <div className="doc-action">View</div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Chat Interface */}
                            <div className="content-column side">
                                <div className="chat-interface-extreme">
                                    <div className="chat-header-extreme">
                                        <div className="chat-status-dot"></div>
                                        <h3>AI Policy Assistant</h3>
                                    </div>

                                    <div className="chat-messages-extreme">
                                        {chatMessages.length === 0 ? (
                                            <div className="chat-welcome">
                                                <div className="bot-avatar-large">
                                                    <FiMessageCircle />
                                                </div>
                                                <h4 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>How can I help you?</h4>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                                    Ask me anything about this policy. I'm trained to answer your questions accurately.
                                                </p>

                                                {suggestedQuestions.length > 0 && (
                                                    <div className="suggestions-list">
                                                        {suggestedQuestions.map((q, i) => (
                                                            <button key={i} onClick={() => handleSendMessage(q)}>
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="messages-scroll">
                                                {chatMessages.map((msg, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`message-bubble ${msg.role}`}
                                                    >
                                                        <div className="message-avatar">
                                                            {msg.role === 'ai' ? <FiZap /> : <div className="user-avatar-placeholder">U</div>}
                                                        </div>
                                                        <div className="message-text">
                                                            {msg.text}
                                                            <span className="message-time">
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {sendingMessage && (
                                                    <div className="message-bubble ai">
                                                        <div className="message-avatar"><FiZap /></div>
                                                        <div className="typing-dots" style={{ padding: '10px 15px', background: 'white', borderRadius: '18px', borderTopLeftRadius: '4px' }}>
                                                            <span></span><span></span><span></span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="chat-input-extreme">
                                        <input
                                            type="text"
                                            placeholder="Type your question..."
                                            value={currentQuestion}
                                            onChange={(e) => setCurrentQuestion(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            className="send-button-extreme"
                                            onClick={() => handleSendMessage()}
                                            disabled={!currentQuestion.trim() || sendingMessage}
                                        >
                                            <FiSend />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default PolicyDetail;
