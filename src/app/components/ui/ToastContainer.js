'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Create a context for the toast notifications
const ToastContext = createContext();

// Toast component
const Toast = ({ id, message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match this with the exit animation duration
  };

  useEffect(() => {
    // Automatically remove toast after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [id]);

  let icon, gradient, iconBg;
  
  switch (type) {
    case 'success':
      icon = '✓';
      gradient = 'linear-gradient(90deg, var(--color-success) 0%, #25a244 100%)';
      iconBg = 'var(--color-success)';
      break;
    case 'error':
      icon = '✕';
      gradient = 'linear-gradient(90deg, var(--color-danger) 0%, #d92452 100%)';
      iconBg = 'var(--color-danger)';
      break;
    case 'warning':
      icon = '!';
      gradient = 'linear-gradient(90deg, var(--color-warning) 0%, #f9a826 100%)';
      iconBg = 'var(--color-warning)';
      break;
    default:
      icon = 'i';
      gradient = 'linear-gradient(90deg, var(--color-info) 0%, #30b3ee 100%)';
      iconBg = 'var(--color-info)';
  }

  return (
    <div 
      className={`toast-item ${isExiting ? 'toast-exit' : 'toast-enter'}`} 
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(44, 40, 40, 0.85)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        overflow: 'hidden',
        position: 'relative',
        border: 'none',
      }}
    >
      <div className="d-flex align-items-stretch" style={{ overflow: 'hidden' }}>
        {/* Colored left border with icon */}
        <div style={{
          width: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: gradient,
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          {icon}
        </div>
        
        {/* Message */}
        <div style={{ 
          flex: 1, 
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {message}
        </div>
        
        {/* Close button */}
        <button
          className="toast-close-btn"
          onClick={handleClose}
          aria-label="Close"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0 16px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'var(--color-gray-600)',
            transition: 'color 0.2s ease'
          }}
        >
          &times;
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="toast-progress-bar" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        background: gradient,
        animation: 'toast-progress 5s linear forwards'
      }}></div>
      
      <style jsx>{`
        .toast-item {
          transition: all 0.3s ease;
        }
        
        .toast-enter {
          opacity: 0;
          transform: translateX(40px);
          animation: toast-enter-animation 0.3s forwards;
        }
        
        .toast-exit {
          opacity: 1;
          transform: translateX(0);
          animation: toast-exit-animation 0.3s forwards;
        }
        
        .toast-close-btn:hover {
          color: var(--color-gray-900);
        }
        
        @keyframes toast-enter-animation {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes toast-exit-animation {
          to {
            opacity: 0;
            transform: translateX(40px);
          }
        }
        
        @keyframes toast-progress {
          0% {
            width: 100%;
          }
          100% {
            width: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Toast container component
export const ToastContainer = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        top: '3.5rem',
        right: '1.5rem',
        zIndex: 9999,
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 