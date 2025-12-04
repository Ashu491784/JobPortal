import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatSalary } from '../../utils/helpers';
import Modal from '../../components/Common/Model';
import './Jobs.css';

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getJobById, applyToJob } = useJobs();
    const { currentUser, userProfile } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: '',
        resume: '',
        additionalInfo: ''
    });

    // Load job details
    useEffect(() => {
        const loadJob = async () => {
            try {
                const jobData = await getJobById(id);
                if (jobData) {
                    setJob(jobData);
                } else {
                    navigate('/jobs');
                }
            } catch (error) {
                console.error('Error loading job:', error);
                navigate('/jobs');
            } finally {
                setLoading(false);
            }
        };

        loadJob();
    }, [id, getJobById, navigate]);

    // Handle application submission
    const handleApply = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (userProfile?.userType !== 'job_seeker') {
            alert('Only job seekers can apply to jobs');
            return;
        }

        try {
            setApplying(true);
            await applyToJob(id, applicationData);
            setShowApplicationModal(false);
            alert('Application submitted successfully!');
        } catch (error) {
            console.error('Error applying to job:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="job-details-container">
                <div className="loading">Loading job details...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="job-details-container">
                <div className="error">Job not found</div>
            </div>
        );
    }

    return (
        <div className="job-details-container">
            <div className="job-details">
                <div className="job-header">
                    <div className="job-title-section">
                        <div className="company-info">
                            {job.companyLogo && (
                                <img
                                    src={job.companyLogo}
                                    alt={`${job.companyName} logo`}
                                    className="company-logo large"
                                />
                            )}
                            <div>
                                <h1>{job.title}</h1>
                                <h2>{job.companyName}</h2>
                            </div>
                        </div>
                        <div className="job-actions">
                            {currentUser && userProfile?.userType === 'job_seeker' && (
                                <button
                                    onClick={() => setShowApplicationModal(true)}
                                    className="apply-btn"
                                >
                                    Apply Now
                                </button>
                            )}
                            <button className="save-btn">Save Job</button>
                        </div>
                    </div>

                    <div className="job-meta-details">
                        <div className="meta-item">
                            <span className="meta-label">Location:</span>
                            <span>{job.location}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Job Type:</span>
                            <span>{job.jobType}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Experience:</span>
                            <span>{job.experienceLevel}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Salary:</span>
                            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Posted:</span>
                            <span>{formatDate(job.postedAt)}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Applications:</span>
                            <span>{job.applicationsCount || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="job-content">
                    <div className="job-description-section">
                        <h3>Job Description</h3>
                        <div className="job-description">
                            {job.description.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    {job.requirements && (
                        <div className="job-requirements-section">
                            <h3>Requirements</h3>
                            <div className="job-requirements">
                                {job.requirements.split('\n').map((requirement, index) => (
                                    <p key={index}>{requirement}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.benefits && (
                        <div className="job-benefits-section">
                            <h3>Benefits</h3>
                            <div className="job-benefits">
                                {job.benefits.split('\n').map((benefit, index) => (
                                    <p key={index}>{benefit}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.skills && job.skills.length > 0 && (
                        <div className="job-skills-section">
                            <h3>Required Skills</h3>
                            <div className="skills-list">
                                {job.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag large">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="company-info-section">
                    <h3>About {job.companyName}</h3>
                    <p>{job.companyDescription || 'No company description available.'}</p>
                    {job.companyWebsite && (
                        <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="company-website"
                        >
                            Visit Company Website
                        </a>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {showApplicationModal && (
                <Modal
                    title="Apply for this Job"
                    onClose={() => setShowApplicationModal(false)}
                >
                    <form onSubmit={handleApply} className="application-form">
                        <div className="form-group">
                            <label htmlFor="coverLetter">Cover Letter</label>
                            <textarea
                                id="coverLetter"
                                value={applicationData.coverLetter}
                                onChange={(e) => setApplicationData(prev => ({
                                    ...prev,
                                    coverLetter: e.target.value
                                }))}
                                rows="6"
                                placeholder="Tell us why you're interested in this position..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="resume">Resume URL</label>
                            <input
                                type="url"
                                id="resume"
                                value={applicationData.resume}
                                onChange={(e) => setApplicationData(prev => ({
                                    ...prev,
                                    resume: e.target.value
                                }))}
                                placeholder="Link to your resume"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="additionalInfo">Additional Information (Optional)</label>
                            <textarea
                                id="additionalInfo"
                                value={applicationData.additionalInfo}
                                onChange={(e) => setApplicationData(prev => ({
                                    ...prev,
                                    additionalInfo: e.target.value
                                }))}
                                rows="3"
                                placeholder="Any additional information you'd like to share..."
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setShowApplicationModal(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={applying}
                                className="submit-btn"
                            >
                                {applying ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}