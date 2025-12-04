import './Common.css';
import { useEffect } from 'react';

export default function Modal({ title, children, onClose, size = 'medium' }) {
    //close modal on escape kay
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        }
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className='modal-close' onClick={onClose}>x</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}