import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Dashboard.css';

export default function CompanyDashboard() {
    const { userProfile } = useAuth();
    const { getCompanyJobs } = useJobs();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompanyJobs = async () => {
            try {
                const companyJobs = await getCompanyJobs();
                setJobs(companyJobs);
            } catch (error) {
                console.error('Error loading company jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCompanyJobs();
    }, [getCompanyJobs]);

    if (loading) {
        return <LoadingSpinner message="Loading your dashboard..." />;
    }

    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);
    const activeJobs = jobs.filter(job => job.isActive).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome, {userProfile?.companyName}!</h1>
                    <p>Manage your job postings and find the best talent</p>
                </div>
                <div className="quick-actions">
                    <Link to="/post-job" className="action-btn primary">
                        Post New Job
                    </Link>
                    <Link to="/company-profile" className="action-btn secondary">
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <h3>{jobs.length}</h3>
                            <p>Total Job Posts</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-info">
                            <h3>{activeJobs}</h3>
                            <p>Active Jobs</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{totalApplications}</h3>
                            <p>Total Applications</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Profile Views</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="recent-jobs">
                        <div className="section-header">
                            <h2>Your Job Postings</h2>
                            <Link to="/manage-jobs" className="view-all">Manage All</Link>
                        </div>

                        {jobs.length > 0 ? (
                            <div className="jobs-list">
                                {jobs.slice(0, 5).map(job => (
                                    <div key={job.id} className="job-item">
                                        <div className="job-info">
                                            <h4>{job.title}</h4>
                                            <p>{job.location} • {job.jobType}</p>
                                            <span className="job-date">
                                                Posted {formatDate(job.postedAt)}
                                            </span>
                                        </div>
                                        <div className="job-stats">
                                            <span className="applications-count">
                                                {job.applicationsCount || 0} applications
                                            </span>
                                            <span className={`status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                                                {job.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="job-actions">
                                            <Link to={`/jobs/${job.id}`} className="view-btn">View</Link>
                                            <Link to={`/jobs/${job.id}/applications`} className="applications-btn">
                                                Applications
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't posted any jobs yet.</p>
                                <Link to="/post-job" className="cta-link">Post your first job</Link>
                            </div>
                        )}
                    </div>

                    <div className="company-profile">
                        <div className="section-header">
                            <h2>Company Profile</h2>
                        </div>

                        <div className="profile-summary">
                            {userProfile?.logo && (
                                <img
                                    src={userProfile.logo}
                                    alt={`${userProfile.companyName} logo`}
                                    className="company-logo-large"
                                />
                            )}
                            <div className="profile-info">
                                <h3>{userProfile?.companyName}</h3>
                                <p>{userProfile?.industry}</p>
                                <p>{userProfile?.location}</p>
                                {userProfile?.website && (
                                    <a
                                        href={userProfile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="website-link"
                                    >
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="profile-completion">
                            <div className="completion-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '85%' }}></div>
                                </div>
                                <span className="progress-text">85% Complete</span>
                            </div>

                            <Link to="/company-profile" className="complete-profile-btn">
                                Complete Profile
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="recent-applications">
                    <div className="section-header">
                        <h2>Recent Applications</h2>
                        <Link to="/applications" className="view-all">View All</Link>
                    </div>

                    <div className="applications-preview">
                        <p>Review and manage candidate applications</p>
                        <Link to="/applications" className="review-applications-btn">
                            Review Applications
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}