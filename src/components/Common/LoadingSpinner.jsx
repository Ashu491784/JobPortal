import './Common.css';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
    return (
        <div className="loading-spinner-container">
            <div className={`loading-spinner ${size}`}></div>
            {message && <p className='loading-message'>{message}</p>}
        </div>
    );
}