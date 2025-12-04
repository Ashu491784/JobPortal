import { Link } from "react-router-dom";
import { formatDate, formatSalary, truncateText } from "../../utils/helpers";
import './jobs.css';

export default function JobCard({ job }) {
    const {
        id, title, companyName, companyLogo, location,
        jobType, experienceLevel, salaryMin,
        salaryMax, description, skills, postedAt,
        applicationsCount
    } = job;

    return (
        <div className="job-card">
            <div className="job-card-header">
                <div className="company-info">
                    {companyLogo && (
                        <img
                            src={companyLogo}
                            alt={`${companyLogo} logo`}
                            className="company-logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <div className="company-details">
                        <h3 className="job-title">
                            <link to={`/jobs/${id}`}>{title}</link>
                        </h3>
                        <p className="company-name">{companyName}</p>
                    </div>
                </div>
                <div className="job-meta">
                    <span className="job-type">{jobType}</span>
                    <span className="experience-level">{experienceLevel}</span>
                </div>
            </div>

            <div className="job-card-body">
                <div className="job-info">
                    <div className="info-item">
                        <span className="info-icon">ℹ️</span>
                        <span>{location}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">💵</span>
                        <span>{formatSalary(salaryMin, salaryMax)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📆</span>
                        <span>{formatDate(postedAt)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">👷</span>
                        <span>{applicationsCount || 0}</span>
                    </div>
                </div>
                <p className="job-description">
                    {truncateText(description, 100)}
                </p>

                {skills && skills.length > 0 && (
                    <div className="job-skills">
                        {skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}</span>
                        ))}
                        {skills.length > 4 && (
                            <span className="skill-tag more">
                                +{skills.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="job-card-footer">
                <Link to={`/jobs/${id}`}
                    className="view-job-btn">
                    View Details </Link>
                <button className="save-job-btn" title="Save Job">
                    🩷
                </button>
            </div>
        </div>
    )
}