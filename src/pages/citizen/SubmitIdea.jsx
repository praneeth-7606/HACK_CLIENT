import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ideaAPI from '../../services/ideaAPI';
import { 
    FiSend, FiX, FiDollarSign, FiCalendar, 
    FiCheckCircle, FiAlertCircle, FiPackage, FiTag, FiMapPin,
    FiTrendingUp, FiArrowRight, FiArrowLeft, FiZap, FiTarget, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SubmitIdea.css';

const SubmitIdea = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subCategory: '',
        targetArea: '',
        expectedImpact: 'Local',
        estimatedBudget: {
            amount: '',
            description: ''
        },
        timeline: {
            proposed: '',
            description: ''
        },
        benefits: [''],
        challenges: [''],
        resources: [''],
        tags: '',
        visibility: 'Public'
    });

    const totalSteps = 4;

    const categories = [
        'Revenue Generation',
        'Infrastructure Development',
        'Technology & Innovation',
        'Agriculture & Farming',
        'Education',
        'Healthcare',
        'Environment & Sustainability',
        'Transportation',
        'Tourism',
        'Public Safety',
        'Urban Planning',
        'Rural Development',
        'Employment & Skills',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayField = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                benefits: formData.benefits.filter(b => b.trim()),
                challenges: formData.challenges.filter(c => c.trim()),
                resources: formData.resources.filter(r => r.trim()),
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            await ideaAPI.submitIdea(submitData);
            toast.success('🎉 Idea submitted successfully!', {
                duration: 4000,
                style: {
                    background: '#10b981',
                    color: '#fff',
                }
            });
            navigate('/dashboard/ideas');
        } catch (error) {
            console.error('Error submitting idea:', error);
            toast.error(error.response?.data?.message || 'Failed to submit idea');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const progressPercentage = (currentStep / totalSteps) * 100;

    const stepTitles = [
        { icon: FiStar, title: 'Basic Information', desc: 'Tell us about your idea' },
        { icon: FiDollarSign, title: 'Budget & Timeline', desc: 'Financial planning' },
        { icon: FiTarget, title: 'Impact Analysis', desc: 'Benefits & challenges' },
        { icon: FiZap, title: 'Final Details', desc: 'Resources & tags' }
    ];

    return (
        <Layout>
            <div className="submit-idea-modern">
                {/* Hero Header */}
                <motion.div 
                    className="idea-hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <motion.div 
                            className="hero-icon"
                            animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                        >
                            💡
                        </motion.div>
                        <h1 className="hero-title">
                            Share Your <span className="gradient-text">Innovative Idea</span>
                        </h1>
                        <p className="hero-subtitle">
                            Transform your vision into reality. Help build a better community together.
                        </p>
                    </div>
                </motion.div>

                {/* Progress Stepper */}
                <motion.div 
                    className="stepper-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stepper-progress-bar">
                        <motion.div 
                            className="stepper-progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="stepper-steps">
                        {stepTitles.map((step, index) => {
                            const stepNumber = index + 1;
                            const isActive = currentStep === stepNumber;
                            const isCompleted = currentStep > stepNumber;
                            const StepIcon = step.icon;

                            return (
                                <motion.div
                                    key={stepNumber}
                                    className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="step-circle">
                                        {isCompleted ? (
                                            <FiCheckCircle className="step-check" />
                                        ) : (
                                            <StepIcon className="step-icon" />
                                        )}
                                    </div>
                                    <div className="step-info">
                                        <div className="step-title">{step.title}</div>
                                        <div className="step-desc">{step.desc}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="idea-form-modern">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="form-step"
                            >
                                <div className="step-header">
                                    <FiStar className="step-header-icon" />
                                    <h2>Basic Information</h2>
                                    <p>Let's start with the fundamentals of your innovative idea</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            <FiStar /> Idea Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Give your idea a compelling title..."
                                            className="form-input-modern"
                                            required
                                            minLength={10}
                                            maxLength={200}
                                        />
                                        <div className="input-hint">
                                            {formData.title.length}/200 characters
                                        </div>
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe your idea in detail. What problem does it solve? How will it benefit the community?"
                                            className="form-textarea-modern"
                                            required
                                            minLength={50}
                                            rows={6}
                                        />
                                        <div className="input-hint">
                                            {formData.description.length} characters (minimum 50)
                                        </div>
                                    </div>

                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            <FiTag /> Category *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="form-select-modern"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            Sub-Category
                                        </label>
                                        <input
                                            type="text"
                                            name="subCategory"
                                            value={formData.subCategory}
                                            onChange={handleChange}
                                            placeholder="Optional sub-category"
                                            className="form-input-modern"
                                        />
                                    </div>

                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            <FiMapPin /> Target Area/Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="targetArea"
                                            value={formData.targetArea}
                                            onChange={handleChange}
                                            placeholder="e.g., Hyderabad, Telangana"
                                            className="form-input-modern"
                                            required
                                        />
                                    </div>

                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            <FiTrendingUp /> Expected Impact *
                                        </label>
                                        <select
                                            name="expectedImpact"
                                            value={formData.expectedImpact}
                                            onChange={handleChange}
                                            className="form-select-modern"
                                            required
                                        >
                                            <option value="Local">Local</option>
                                            <option value="District">District</option>
                                            <option value="State">State</option>
                                            <option value="National">National</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Budget & Timeline */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="form-step"
                            >
                                <div className="step-header">
                                    <FiDollarSign className="step-header-icon" />
                                    <h2>Budget & Timeline</h2>
                                    <p>Help us understand the financial and time requirements</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            <FiDollarSign /> Estimated Budget (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="estimatedBudget.amount"
                                            value={formData.estimatedBudget.amount}
                                            onChange={handleChange}
                                            placeholder="Approximate budget required"
                                            className="form-input-modern"
                                            min={0}
                                        />
                                    </div>

                                    <div className="form-group-modern">
                                        <label className="form-label-modern">
                                            <FiCalendar /> Proposed Timeline
                                        </label>
                                        <input
                                            type="text"
                                            name="timeline.proposed"
                                            value={formData.timeline.proposed}
                                            onChange={handleChange}
                                            placeholder="e.g., 6 months, 1 year"
                                            className="form-input-modern"
                                        />
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            Budget Description
                                        </label>
                                        <textarea
                                            name="estimatedBudget.description"
                                            value={formData.estimatedBudget.description}
                                            onChange={handleChange}
                                            placeholder="Explain how the budget will be utilized..."
                                            className="form-textarea-modern"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            Timeline Description
                                        </label>
                                        <textarea
                                            name="timeline.description"
                                            value={formData.timeline.description}
                                            onChange={handleChange}
                                            placeholder="Describe the implementation timeline..."
                                            className="form-textarea-modern"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Impact Analysis */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="form-step"
                            >
                                <div className="step-header">
                                    <FiTarget className="step-header-icon" />
                                    <h2>Impact Analysis</h2>
                                    <p>Outline the benefits and potential challenges</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            <FiCheckCircle /> Expected Benefits
                                        </label>
                                        {formData.benefits.map((benefit, index) => (
                                            <div key={index} className="array-input-group">
                                                <input
                                                    type="text"
                                                    value={benefit}
                                                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                                                    placeholder={`Benefit ${index + 1}`}
                                                    className="form-input-modern"
                                                />
                                                {formData.benefits.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayField('benefits', index)}
                                                        className="remove-btn-modern"
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayField('benefits')}
                                            className="add-field-btn-modern"
                                        >
                                            + Add Benefit
                                        </button>
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            <FiAlertCircle /> Potential Challenges
                                        </label>
                                        {formData.challenges.map((challenge, index) => (
                                            <div key={index} className="array-input-group">
                                                <input
                                                    type="text"
                                                    value={challenge}
                                                    onChange={(e) => handleArrayChange('challenges', index, e.target.value)}
                                                    placeholder={`Challenge ${index + 1}`}
                                                    className="form-input-modern"
                                                />
                                                {formData.challenges.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayField('challenges', index)}
                                                        className="remove-btn-modern"
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayField('challenges')}
                                            className="add-field-btn-modern"
                                        >
                                            + Add Challenge
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Final Details */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="form-step"
                            >
                                <div className="step-header">
                                    <FiZap className="step-header-icon" />
                                    <h2>Final Details</h2>
                                    <p>Add resources and tags to complete your submission</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            <FiPackage /> Required Resources
                                        </label>
                                        {formData.resources.map((resource, index) => (
                                            <div key={index} className="array-input-group">
                                                <input
                                                    type="text"
                                                    value={resource}
                                                    onChange={(e) => handleArrayChange('resources', index, e.target.value)}
                                                    placeholder={`Resource ${index + 1}`}
                                                    className="form-input-modern"
                                                />
                                                {formData.resources.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayField('resources', index)}
                                                        className="remove-btn-modern"
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayField('resources')}
                                            className="add-field-btn-modern"
                                        >
                                            + Add Resource
                                        </button>
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            <FiTag /> Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder="e.g., innovation, sustainability, community"
                                            className="form-input-modern"
                                        />
                                        <div className="input-hint">
                                            Add relevant tags to help categorize your idea
                                        </div>
                                    </div>

                                    <div className="form-group-modern full-width">
                                        <label className="form-label-modern">
                                            Visibility
                                        </label>
                                        <div className="radio-group-modern">
                                            <label className="radio-label-modern">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    value="Public"
                                                    checked={formData.visibility === 'Public'}
                                                    onChange={handleChange}
                                                />
                                                <span className="radio-custom"></span>
                                                <div className="radio-content">
                                                    <div className="radio-title">Public</div>
                                                    <div className="radio-desc">Visible to everyone</div>
                                                </div>
                                            </label>
                                            <label className="radio-label-modern">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    value="Private"
                                                    checked={formData.visibility === 'Private'}
                                                    onChange={handleChange}
                                                />
                                                <span className="radio-custom"></span>
                                                <div className="radio-content">
                                                    <div className="radio-title">Private</div>
                                                    <div className="radio-desc">Only visible to admins</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <motion.button
                                type="button"
                                onClick={prevStep}
                                className="btn-nav btn-prev"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FiArrowLeft /> Previous
                            </motion.button>
                        )}
                        
                        {currentStep < totalSteps ? (
                            <motion.button
                                type="button"
                                onClick={nextStep}
                                className="btn-nav btn-next"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Next <FiArrowRight />
                            </motion.button>
                        ) : (
                            <motion.button
                                type="submit"
                                className="btn-nav btn-submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> Submit Idea
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default SubmitIdea;
