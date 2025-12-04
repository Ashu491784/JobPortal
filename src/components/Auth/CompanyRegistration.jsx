import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { INDUSTRIES } from '../../utils/constants';
import { validateURL } from '../../utils/helpers';
import './AuthForm.css';

export default function CompanyRegister() {
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
        website: '',
        industry: '',
        companySize: '',
        location: '',
        description: '',
        logo: '',
        contactPerson: '',
        contactPhone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signupCompany } = useAuth();
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

        if (formData.website && !validateURL(formData.website)) {
            return setError('Please enter a valid website URL');
        }

        if (formData.logo && !validateURL(formData.logo)) {
            return setError('Please enter a valid logo URL');
        }

        try {
            setError('');
            setLoading(true);

            // Prepare company data
            const companyData = {
                companyName: formData.companyName,
                website: formData.website,
                industry: formData.industry,
                companySize: formData.companySize,
                location: formData.location,
                description: formData.description,
                logo: formData.logo,
                contactPerson: formData.contactPerson,
                contactPhone: formData.contactPhone
            };

            await signupCompany(formData.email, formData.password, companyData);
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to create company account: ' + error.message);
        }

        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card large">
                <h2>Register Your Company</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="companyName">Company Name</label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your company name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Company Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter company email"
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
                                placeholder="Enter password"
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
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="website">Company Website</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://yourcompany.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="logo">Company Logo URL</label>
                            <input
                                type="url"
                                id="logo"
                                name="logo"
                                value={formData.logo}
                                onChange={handleChange}
                                placeholder="https://yourcompany.com/logo.png"
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
                                required
                            >
                                <option value="">Select Industry</option>
                                {INDUSTRIES.map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="companySize">Company Size</label>
                            <select
                                id="companySize"
                                name="companySize"
                                value={formData.companySize}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501-1000">501-1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Company Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="City, State, Country"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Company Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Brief description of your company"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="contactPerson">Contact Person</label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                placeholder="HR Manager / Recruiter name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactPhone">Contact Phone</label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="Contact phone number"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-button"
                    >
                        {loading ? 'Creating Company Account...' : 'Register Company'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
                <p className="auth-link">
                    Looking for a job? <Link to="/register">Register as Job Seeker</Link>
                </p>
            </div>
        </div>
    );
}