import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    JobPortal
                </Link>

                <div className="nav-menu">
                    <div className="nav-links">
                        <Link
                            to="/jobs"
                            className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
                        >
                            Browse Jobs
                        </Link>

                        {currentUser && userProfile?.userType === 'company' && (
                            <Link
                                to="/post-job"
                                className={`nav-link ${isActive('/post-job') ? 'active' : ''}`}
                            >
                                Post Job
                            </Link>
                        )}

                        {currentUser ? (
                            <div className="nav-user">
                                <span className="nav-username">
                                    {userProfile?.userType === 'company'
                                        ? userProfile?.companyName
                                        : `${userProfile?.firstName} ${userProfile?.lastName}`
                                    }
                                </span>
                                <Link
                                    to="/dashboard"
                                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                >
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="nav-logout">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="nav-auth">
                                <Link
                                    to="/login"
                                    className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                >
                                    Login
                                </Link>
                                <div className="register-dropdown">
                                    <button className="register-toggle">Register ▼</button>
                                    <div className="register-menu">
                                        <Link to="/register" className="register-option">
                                            Job Seeker
                                        </Link>
                                        <Link to="/company-register" className="register-option">
                                            Company
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}