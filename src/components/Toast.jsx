import { useState, useEffect, createContext, useContext } from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';

// Toast Context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Individual Toast Component
const Toast = ({ id, type, title, message, duration, onClose, action }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = 'flex items-start p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm';
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case TOAST_TYPES.ERROR:
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case TOAST_TYPES.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case TOAST_TYPES.INFO:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  const getIcon = () => {
    const iconClasses = 'w-5 h-5 mt-0.5 flex-shrink-0';
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <FaCheck className={`${iconClasses} text-green-500`} />;
      case TOAST_TYPES.ERROR:
        return <FaTimesCircle className={`${iconClasses} text-red-500`} />;
      case TOAST_TYPES.WARNING:
        return <FaExclamationTriangle className={`${iconClasses} text-yellow-500`} />;
      case TOAST_TYPES.INFO:
        return <FaInfoCircle className={`${iconClasses} text-blue-500`} />;
      default:
        return <FaInfoCircle className={`${iconClasses} text-gray-500`} />;
    }
  };

  return (
    <div className={`${getToastStyles()} transform transition-all duration-300 ease-in-out`}>
      <div className="mr-3">
        {getIcon()}
      </div>
      
      <div className="flex-grow">
        {title && (
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
        
        {action && (
          <div className="mt-3">
            <button
              onClick={action.onClick}
              className="text-xs font-medium underline hover:no-underline focus:outline-none"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        aria-label="Dismiss"
      >
        <FaTimes className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onClose, position = 'top-right' }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 max-w-sm w-full pointer-events-none`}>
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 5000,
      ...toast
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Limit the number of toasts
      return updated.slice(0, maxToasts);
    });

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  const value = {
    addToast,
    removeToast,
    removeAllToasts,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, removeAllToasts } = context;

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ ...options, type: TOAST_TYPES.SUCCESS, message }),
    error: (message, options = {}) => addToast({ ...options, type: TOAST_TYPES.ERROR, message }),
    warning: (message, options = {}) => addToast({ ...options, type: TOAST_TYPES.WARNING, message }),
    info: (message, options = {}) => addToast({ ...options, type: TOAST_TYPES.INFO, message }),
    custom: (options) => addToast(options)
  };

  return {
    toast,
    removeToast,
    removeAllToasts
  };
};

// Higher-order component to wrap with toast functionality
export const withToast = (Component) => {
  const WrappedComponent = (props) => {
    const { toast } = useToast();
    return <Component {...props} toast={toast} />;
  };
  
  WrappedComponent.displayName = `withToast(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Toast notification presets
export const showErrorToast = (toast, error, options = {}) => {
  const message = error?.message || 'An error occurred';
  const title = error?.code ? `Error: ${error.code}` : 'Error';
  
  toast.error(message, {
    title,
    duration: 7000, // Show errors longer
    ...options
  });
};

export const showSuccessToast = (toast, message, options = {}) => {
  toast.success(message, {
    duration: 4000,
    ...options
  });
};

export const showValidationErrors = (toast, errors, options = {}) => {
  const errorMessages = Object.values(errors).filter(Boolean);
  
  if (errorMessages.length === 1) {
    toast.error(errorMessages[0], {
      title: 'Validation Error',
      ...options
    });
  } else if (errorMessages.length > 1) {
    toast.error(`Please fix ${errorMessages.length} validation errors`, {
      title: 'Validation Errors',
      ...options
    });
  }
};

export const showNetworkError = (toast, options = {}) => {
  toast.error('Please check your internet connection and try again', {
    title: 'Network Error',
    duration: 6000,
    action: {
      label: 'Retry',
      onClick: options.onRetry || (() => window.location.reload())
    },
    ...options
  });
};

export default Toast;