import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDollarSign, FiZap, FiTrendingUp, FiCheckCircle, FiEdit3,
    FiDownload, FiAlertCircle, FiClock, FiAward, FiBarChart2
} from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import agentAPI from '../../services/agentAPI';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
    const [totalBudget, setTotalBudget] = useState('');
    const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedAllocations, setEditedAllocations] = useState([]);
    const [insufficientBudgetInfo, setInsufficientBudgetInfo] = useState(null);

    const handleAnalyze = async () => {
        if (!totalBudget || totalBudget <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        try {
            setAnalyzing(true);
            setInsufficientBudgetInfo(null); // Reset previous warnings
            const response = await agentAPI.analyzeBudget(Number(totalBudget), fiscalYear);
            
            if (response.success) {
                setResult(response.data);
                setEditedAllocations(response.data.allocations);
            } else if (response.insufficientBudget) {
                // Store insufficient budget info to display
                setInsufficientBudgetInfo(response);
            } else {
                alert(response.message || 'Failed to analyze budget');
            }
        } catch (error) {
            console.error('Budget analysis error:', error);
            alert(error.response?.data?.message || 'Failed to analyze budget');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleEditAllocation = (index, field, value) => {
        const updated = [...editedAllocations];
        updated[index] = { ...updated[index], [field]: value };
        setEditedAllocations(updated);
    };

    const handleSaveEdits = async () => {
        try {
            setLoading(true);
            await agentAPI.updateBudgetAllocation(result._id, {
                allocations: editedAllocations
            });
            setResult({ ...result, allocations: editedAllocations });
            setEditMode(false);
            alert('Budget allocation updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update budget allocation');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve this budget allocation? This will update all idea statuses and notify citizens.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await agentAPI.approveBudgetAllocation(result._id);
            
            if (response.success) {
                setResult({ ...result, status: 'Approved' });
                alert('Budget allocation approved! All citizens have been notified.');
            }
        } catch (error) {
            console.error('Approval error:', error);
            alert('Failed to approve budget allocation');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setLoading(true);
            const blob = await agentAPI.downloadPDFReport(result._id);
            
            // Check if blob is valid
            if (!blob || blob.size === 0) {
                throw new Error('Received empty PDF file');
            }
            
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `Budget_Allocation_${fiscalYear}_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to download PDF report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': '#10b981',
            'Medium': '#f59e0b',
            'Low': '#6366f1'
        };
        return colors[priority] || '#6366f1';
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    // Prepare chart data
    const pieChartData = result?.allocations.map(a => ({
        name: a.idea?.title || 'Unknown',
        value: a.allocatedBudget,
        priority: a.priority
    })) || [];

    const barChartData = result?.allocations.map(a => ({
        name: (a.idea?.title || 'Unknown').substring(0, 20) + '...',
        budget: a.allocatedBudget / 100000, // Convert to lakhs
        score: a.priorityScore
    })) || [];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <div className="budget-planner">
            <div className="planner-header">
                <div className="header-content">
                    <FiDollarSign className="header-icon" />
                    <div>
                        <h1>AI Budget Planner Agent</h1>
                        <p>Intelligent budget allocation for approved civic innovation ideas</p>
                    </div>
                </div>
            </div>

            {/* Input Section */}
            {!result && !insufficientBudgetInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="input-section"
                >
                    <div className="input-card">
                        <div className="card-icon">
                            <FiZap />
                        </div>
                        <h2>Start Budget Analysis</h2>
                        <p>Enter the total budget available for civic innovation projects</p>

                        <div className="input-group">
                            <label>Total Budget (₹)</label>
                            <input
                                type="number"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(e.target.value)}
                                placeholder="e.g., 50000000 (5 Crore)"
                                className="budget-input"
                            />
                        </div>

                        <div className="input-group">
                            <label>Fiscal Year</label>
                            <input
                                type="text"
                                value={fiscalYear}
                                onChange={(e) => setFiscalYear(e.target.value)}
                                placeholder="e.g., 2025"
                                className="year-input"
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="analyze-btn"
                        >
                            {analyzing ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <FiZap /> Analyze & Allocate Budget
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Insufficient Budget Warning */}
            {insufficientBudgetInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="insufficient-budget-section"
                >
                    <div className="warning-card">
                        <div className="warning-icon">
                            <FiAlertCircle />
                        </div>
                        <h2>⚠️ Insufficient Budget</h2>
                        <p className="warning-message">{insufficientBudgetInfo.message}</p>

                        <div className="budget-comparison">
                            <div className="comparison-item">
                                <span className="label">Provided Budget</span>
                                <span className="value provided">{formatCurrency(insufficientBudgetInfo.data.providedBudget)}</span>
                            </div>
                            <div className="comparison-arrow">→</div>
                            <div className="comparison-item">
                                <span className="label">Minimum Required</span>
                                <span className="value required">{formatCurrency(insufficientBudgetInfo.data.estimatedMinimumBudget)}</span>
                            </div>
                        </div>

                        <div className="shortfall-info">
                            <FiAlertCircle />
                            <span>Shortfall: <strong>{formatCurrency(insufficientBudgetInfo.data.shortfall)}</strong></span>
                        </div>

                        <div className="recommendation-box">
                            <h4>💡 Recommendation</h4>
                            <p>{insufficientBudgetInfo.data.recommendation}</p>
                        </div>

                        <div className="warning-actions">
                            <button 
                                onClick={() => {
                                    setInsufficientBudgetInfo(null);
                                    setTotalBudget(insufficientBudgetInfo.data.estimatedMinimumBudget.toString());
                                }}
                                className="adjust-btn"
                            >
                                <FiCheckCircle /> Use Recommended Budget
                            </button>
                            <button 
                                onClick={() => setInsufficientBudgetInfo(null)}
                                className="back-btn"
                            >
                                <FiEdit3 /> Adjust Manually
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Results Section */}
            {result && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="results-section"
                >
                    {/* Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="card-icon-small" style={{ background: '#10b98115' }}>
                                <FiDollarSign style={{ color: '#10b981' }} />
                            </div>
                            <div>
                                <p className="card-label">Total Budget</p>
                                <h3>{formatCurrency(result.totalBudget)}</h3>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon-small" style={{ background: '#3b82f615' }}>
                                <FiTrendingUp style={{ color: '#3b82f6' }} />
                            </div>
                            <div>
                                <p className="card-label">Allocated</p>
                                <h3>{formatCurrency(result.allocatedBudget)}</h3>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon-small" style={{ background: '#f59e0b15' }}>
                                <FiAlertCircle style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <p className="card-label">Reserve</p>
                                <h3>{formatCurrency(result.contingencyReserve)}</h3>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon-small" style={{ background: '#8b5cf615' }}>
                                <FiAward style={{ color: '#8b5cf6' }} />
                            </div>
                            <div>
                                <p className="card-label">Ideas Funded</p>
                                <h3>{result.allocations.length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div className="ai-summary-card">
                        <div className="summary-header">
                            <FiZap className="summary-icon" />
                            <h3>AI Analysis Summary</h3>
                        </div>
                        <p className="summary-text">{result.summary}</p>
                        
                        {result.recommendations && result.recommendations.length > 0 && (
                            <div className="recommendations">
                                <h4>Key Recommendations:</h4>
                                <ul>
                                    {result.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Charts */}
                    <div className="charts-section">
                        <div className="chart-card">
                            <h3><FiBarChart2 /> Budget Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name.substring(0, 15)}...`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3><FiTrendingUp /> Priority Scores vs Budget</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="budget" fill="#3b82f6" name="Budget (Lakhs)" />
                                    <Bar yAxisId="right" dataKey="score" fill="#10b981" name="Priority Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Allocations List */}
                    <div className="allocations-section">
                        <div className="section-header">
                            <h2>Budget Allocations (Priority Ranked)</h2>
                            <div className="action-buttons">
                                {result.status !== 'Approved' && (
                                    <>
                                        <button
                                            onClick={() => setEditMode(!editMode)}
                                            className="edit-btn"
                                        >
                                            <FiEdit3 /> {editMode ? 'Cancel Edit' : 'Edit Allocations'}
                                        </button>
                                        {editMode && (
                                            <button onClick={handleSaveEdits} className="save-btn">
                                                <FiCheckCircle /> Save Changes
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={handleDownloadPDF} className="download-btn" disabled={loading}>
                                    <FiDownload /> Download PDF
                                </button>
                                {result.status !== 'Approved' && (
                                    <button onClick={handleApprove} className="approve-btn" disabled={loading}>
                                        <FiCheckCircle /> Approve & Notify Citizens
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="allocations-list">
                            {(editMode ? editedAllocations : result.allocations).map((allocation, index) => (
                                <motion.div
                                    key={allocation.idea?._id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="allocation-card"
                                    style={{ '--priority-color': getPriorityColor(allocation.priority) }}
                                >
                                    <div className="allocation-rank">#{index + 1}</div>
                                    
                                    <div className="allocation-content">
                                        <div className="allocation-header">
                                            <h3>{allocation.idea?.title || 'Unknown Idea'}</h3>
                                            <div className="priority-badge" style={{ background: getPriorityColor(allocation.priority) }}>
                                                {allocation.priority} Priority
                                            </div>
                                        </div>

                                        <div className="allocation-meta">
                                            <span><FiBarChart2 /> {allocation.idea?.category}</span>
                                            <span><FiClock /> {allocation.estimatedTimeline}</span>
                                            <span><FiTrendingUp /> ROI: {allocation.expectedROI}</span>
                                            <span><FiAward /> Score: {allocation.priorityScore}/100</span>
                                        </div>

                                        {editMode ? (
                                            <div className="edit-fields">
                                                <input
                                                    type="number"
                                                    value={allocation.allocatedBudget}
                                                    onChange={(e) => handleEditAllocation(index, 'allocatedBudget', Number(e.target.value))}
                                                    className="edit-input"
                                                />
                                                <select
                                                    value={allocation.priority}
                                                    onChange={(e) => handleEditAllocation(index, 'priority', e.target.value)}
                                                    className="edit-select"
                                                >
                                                    <option value="High">High</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Low">Low</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="allocation-budget">
                                                <FiDollarSign />
                                                <span className="budget-amount">{formatCurrency(allocation.allocatedBudget)}</span>
                                            </div>
                                        )}

                                        <p className="justification">{allocation.justification}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setResult(null)} className="new-analysis-btn">
                        <FiZap /> Start New Analysis
                    </button>
                </motion.div>
            )}
        </div>
        
    );
};

export default BudgetPlanner;
