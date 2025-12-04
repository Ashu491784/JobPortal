import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Dashboard.css';

export default function UserDashboard() {
    const { userProfile } = useAuth();
    const { getUserApplications } = useJobs();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const userApps = await getUserApplications();
                setApplications(userApps);
            } catch (error) {
                console.error('Error loading applications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, [getUserApplications]);

    if (loading) {
        return <LoadingSpinner message="Loading your dashboard..." />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome back, {userProfile?.firstName}!</h1>
                    <p>Track your job applications and discover new opportunities</p>
                </div>
                <div className="quick-actions">
                    <Link to="/jobs" className="action-btn primary">
                        Browse Jobs
                    </Link>
                    <Link to="/profile" className="action-btn secondary">
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>{applications.length}</h3>
                            <p>Applications Submitted</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{applications.filter(app => app.status === 'pending').length}</h3>
                            <p>Pending Reviews</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{applications.filter(app => app.status === 'accepted').length}</h3>
                            <p>Interviews Scheduled</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👀</div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Profile Views</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="recent-applications">
                        <div className="section-header">
                            <h2>Recent Applications</h2>
                            <Link to="/applications" className="view-all">View All</Link>
                        </div>

                        {applications.length > 0 ? (
                            <div className="applications-list">
                                {applications.slice(0, 5).map(application => (
                                    <div key={application.id} className="application-item">
                                        <div className="application-info">
                                            <h4>{application.jobTitle}</h4>
                                            <p>{application.companyName}</p>
                                            <span className="application-date">
                                                Applied {formatDate(application.appliedAt)}
                                            </span>
                                        </div>
                                        <div className="application-status">
                                            <span className={`status-badge ${application.status}`}>
                                                {application.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't applied to any jobs yet.</p>
                                <Link to="/jobs" className="cta-link">Start browsing jobs</Link>
                            </div>
                        )}
                    </div>

                    <div className="profile-completion">
                        <div className="section-header">
                            <h2>Profile Completion</h2>
                        </div>

                        <div className="completion-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '75%' }}></div>
                            </div>
                            <span className="progress-text">75% Complete</span>
                        </div>

                        <div className="completion-items">
                            <div className="completion-item completed">
                                <span className="check-icon">✓</span>
                                <span>Basic Information</span>
                            </div>
                            <div className="completion-item completed">
                                <span className="check-icon">✓</span>
                                <span>Contact Details</span>
                            </div>
                            <div className="completion-item">
                                <span className="check-icon">○</span>
                                <span>Upload Resume</span>
                            </div>
                            <div className="completion-item">
                                <span className="check-icon">○</span>
                                <span>Add Portfolio</span>
                            </div>
                        </div>

                        <Link to="/profile" className="complete-profile-btn">
                            Complete Profile
                        </Link>
                    </div>
                </div>

                <div className="recommended-jobs">
                    <div className="section-header">
                        <h2>Recommended for You</h2>
                        <Link to="/jobs" className="view-all">View All</Link>
                    </div>

                    <div className="jobs-preview">
                        <p>Based on your profile and preferences</p>
                        <Link to="/jobs" className="browse-jobs-btn">
                            Browse Recommended Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}