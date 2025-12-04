import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    return (
        <div className="dashboard-container">
            <div className="user-info-card">
                <h2>User Information</h2>
                <div className="user-details">
                    <p><strong>Name: </strong>
                        {currentUser?.displayName || 'Not Found'}</p>
                    <p><strong>Email:</strong>{currentUser?.email}</p>
                    <p><strong>User ID:</strong>{currentUser?.uid}</p>
                    <p><strong>Email Verified:</strong>
                        {currentUser?.emailVerified ? 'yes' : 'No'}</p>
                </div>
            </div>

            <div className="features-card">
                <h2>Available Features</h2>
                <div className="feature-list">
                    <div className="feature-item">
                        <h3>Profile Management</h3>
                        <p>Update your profile information</p>
                    </div>
                    <div className="feature-item">
                        <h3>Security Settings</h3>
                        <p>Manage your password and security settings</p>
                    </div>
                    <div className="feature-item">
                        <h3>Data Analytics</h3>
                        <p>View your usage statistics</p>
                    </div>
                </div>
            </div>
        </div>
    );
}