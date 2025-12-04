import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CompanyRegister from './components/Auth/CompanyRegistration';
import UserDashboard from './components/Dashboard/UserDashboard';
import CompanyDashboard from './components/Dashboard/CompanyDashboard';
import JobList from './components/Jobs/JobList';
import JobDetails from './components/Jobs/JobDetails';
import PostJob from './components/Jobs/PostJob';
import { Link } from 'react-router-dom';
import './App.css';

// Protected route component
function ProtectedRoute({ children, allowedUserTypes = [] }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userProfile?.userType)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

// Public route component (redirect if already logged in)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" />;
}

// Dashboard router component
function DashboardRouter() {
  const { userProfile } = useAuth();

  if (userProfile?.userType === 'company') {
    return <CompanyDashboard />;
  } else {
    return <UserDashboard />;
  }
}

// Home page component
function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Find Your Dream Job</h1>
        <p>Connect with top companies and discover amazing career opportunities</p>
        {!currentUser && (
          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            <Link to="/register" className="btn btn-secondary">Get Started</Link>
          </div>
        )}
        {currentUser && (
          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            <Link to="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Job Search</h3>
            <p>Find jobs that match your skills and preferences with our advanced search filters</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Top Companies</h3>
            <p>Connect with leading companies and startups looking for talented professionals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Apply</h3>
            <p>Apply to multiple jobs with just a few clicks using your saved profile</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Career Growth</h3>
            <p>Track your applications and get insights to improve your job search success</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Auth routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/company-register" element={
                <PublicRoute>
                  <CompanyRegister />
                </PublicRoute>
              } />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />

              <Route path="/post-job" element={
                <ProtectedRoute allowedUserTypes={['company']}>
                  <PostJob />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </JobProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;