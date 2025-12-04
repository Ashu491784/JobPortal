import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updatePassword } from "firebase/auth";

export default function UpdateProfile() {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        password: '',
        confirmPassword
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setMessage('Password do not match');
        }

        try {
            setLoading(true);
            setMessage('');

            if (formData.displayName !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: formData.displayName
                });
            }

            if (formData.password) {
                await updatePassword(currentUser, formData.password);
            }
            setMessage('profile update successfully');
        } catch (error) {
            setMessage("Failed to update profile: " + error.message);
        }

        setLoading(false);
    }

    return (
        <div className="update-profile">
            <h2>Update Profile</h2>
            {message && <div className="message">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="displayName">Full Name</label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    className="auth-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Updating Account...' : 'Update'};
                </button>
            </form>
        </div>
    )
}