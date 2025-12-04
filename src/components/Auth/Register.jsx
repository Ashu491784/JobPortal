import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { INDUSTRIES } from '../../utils/constants';
import './AuthForm.css';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        industry: '',
        experience: '',
        skills: '',
        resume: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signupJobSeeker } = useAuth();
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);

            // Prepare user data
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                location: formData.location,
                industry: formData.industry,
                experience: formData.experience,
                skills: formData.skills.split(',').map(skill => skill.trim()),
                resume: formData.resume
            };

            await signupJobSeeker(formData.email, formData.password, userData);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create account: ' + error.message);
        }

        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card large">
                <h2>Create Job Seeker Account</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder="Enter your first name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                placeholder="Enter your last name"
                            />
                        </div>
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

                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, State"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="industry">Industry</label>
                            <select
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                            >
                                <option value="">Select Industry</option>
                                {INDUSTRIES.map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="experience">Years of Experience</label>
                            <select
                                id="experience"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                            >
                                <option value="">Select Experience</option>
                                <option value="0-1">0-1 years</option>
                                <option value="2-3">2-3 years</option>
                                <option value="4-6">4-6 years</option>
                                <option value="7-10">7-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="skills">Skills (comma separated)</label>
                        <input
                            type="text"
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="e.g. JavaScript, React, Node.js"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="resume">Resume URL (optional)</label>
                        <input
                            type="url"
                            id="resume"
                            name="resume"
                            value={formData.resume}
                            onChange={handleChange}
                            placeholder="Link to your resume"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-button"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
                <p className="auth-link">
                    Want to hire talent? <Link to="/company-register">Register as Company</Link>
                </p>
            </div>
        </div>
    );
}