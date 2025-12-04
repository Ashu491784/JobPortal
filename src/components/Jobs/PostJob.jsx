import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { JOB_TYPES, EXPERIENCE_LEVELS, LOCATIONS, INDUSTRIES } from '../../utils/constants';
import './Jobs.css';

export default function PostJob() {
    const navigate = useNavigate();
    const { postJob } = useJobs();
    const { userProfile } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        benefits: '',
        location: '',
        jobType: '',
        experienceLevel: '',
        industry: '',
        salaryMin: '',
        salaryMax: '',
        skills: '',
        applicationDeadline: '',
        contactEmail: userProfile?.email || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if user is a company
    if (userProfile?.userType !== 'company') {
        return (
            <div className="post-job-container">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>Only companies can post jobs.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            // Prepare job data
            const jobData = {
                ...formData,
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
                skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : null
            };

            const jobId = await postJob(jobData);
            navigate(`/jobs/${jobId}`);
        } catch (error) {
            setError('Failed to post job: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-job-container">
            <div className="post-job-form">
                <h1>Post a New Job</h1>

                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="job-form"> <div className="form-section"> <h3>Job Information</h3>
                    <div className="form-group">
                        <label htmlFor="title">Job Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <select
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Location</option>
                                {LOCATIONS.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="jobType">Job Type *</label>
                            <select
                                id="jobType"
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Job Type</option>
                                {Object.values(JOB_TYPES).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="experienceLevel">Experience Level *</label>
                            <select
                                id="experienceLevel"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Experience Level</option>
                                {Object.values(EXPERIENCE_LEVELS).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="industry">Industry *</label>
                            <select
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Industry</option>
                                {INDUSTRIES.map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Job Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="6"
                            required
                            placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="requirements">Requirements *</label>
                        <textarea
                            id="requirements"
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows="5"
                            required
                            placeholder="List the required qualifications, experience, and skills..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="benefits">Benefits & Perks</label>
                        <textarea
                            id="benefits"
                            name="benefits"
                            value={formData.benefits}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Health insurance, flexible hours, remote work, etc..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="skills">Required Skills (comma separated)</label>
                        <input
                            type="text"
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="e.g. JavaScript, React, Node.js, MongoDB"
                        />
                    </div>
                </div>

                    <div className="form-section">
                        <h3>Compensation & Application</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="salaryMin">Minimum Salary ($)</label>
                                <input
                                    type="number"
                                    id="salaryMin"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    placeholder="50000"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="salaryMax">Maximum Salary ($)</label>
                                <input
                                    type="number"
                                    id="salaryMax"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    placeholder="80000"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="applicationDeadline">Application Deadline</label>
                                <input
                                    type="date"
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contactEmail">Contact Email *</label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    required
                                    placeholder="hr@company.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? 'Posting Job...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}