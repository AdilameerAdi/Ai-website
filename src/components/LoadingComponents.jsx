import { useState, useEffect } from 'react';
import { FaSpinner, FaCircleNotch } from 'react-icons/fa';

// Basic Loading Spinner
export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-[#14B8A6]',
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-500',
    red: 'text-red-500',
    green: 'text-green-500'
  };

  return (
    <FaSpinner 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

// Pulse Loading Animation
export const LoadingPulse = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`} />
  );
};

// Skeleton Loading Components
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white p-6 rounded-xl border border-gray-200 animate-pulse ${className}`}>
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
    <div className="mt-4 flex space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20" />
      <div className="h-8 bg-gray-200 rounded w-16" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="flex space-x-6">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array(rows).fill(0).map((_, rowIndex) => (
      <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
        <div className="flex space-x-6 items-center">
          {Array(columns).fill(0).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`h-4 bg-gray-200 rounded animate-pulse flex-1 ${
                colIndex === 0 ? 'w-8' : ''
              }`}
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array(items).fill(0).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
        {showAvatar && (
          <div 
            className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div 
            className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"
            style={{ animationDelay: `${index * 100 + 50}ms` }}
          />
          <div 
            className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"
            style={{ animationDelay: `${index * 100 + 100}ms` }}
          />
        </div>
      </div>
    ))}
  </div>
);

// Full Page Loading Screen
export const PageLoader = ({ 
  message = 'Loading...', 
  subMessage = '', 
  logo = null,
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-6">
        {logo && (
          <div className="mb-8">
            {logo}
          </div>
        )}
        
        <div className="mb-6">
          <LoadingSpinner size="xlarge" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {message}
        </h2>
        
        {subMessage && (
          <p className="text-gray-600 mb-4">
            {subMessage}
          </p>
        )}
        
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-[#14B8A6] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ 
  isVisible = true, 
  message = 'Loading...', 
  backdrop = true,
  children 
}) => {
  if (!isVisible) return children || null;

  return (
    <div className="relative">
      {children}
      <div className={`
        absolute inset-0 flex items-center justify-center z-50
        ${backdrop ? 'bg-white bg-opacity-75 backdrop-blur-sm' : ''}
      `}>
        <div className="text-center">
          <LoadingSpinner size="large" />
          {message && (
            <p className="mt-3 text-gray-600 font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Button Loading State
export const LoadingButton = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...', 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button 
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          color="white" 
          className="mr-2" 
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
};

// Progressive Loading Component
export const ProgressiveLoader = ({ 
  steps = [], 
  currentStep = 0, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${index < currentStep 
              ? 'bg-green-500 text-white' 
              : index === currentStep 
                ? 'bg-[#14B8A6] text-white' 
                : 'bg-gray-200 text-gray-600'
            }
          `}>
            {index < currentStep ? (
              '✓'
            ) : index === currentStep ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              index + 1
            )}
          </div>
          <span className={`
            text-sm font-medium
            ${index <= currentStep ? 'text-gray-800' : 'text-gray-400'}
          `}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};

// Lazy Loading Component
export const LazyLoader = ({ 
  children, 
  fallback = <LoadingSpinner />, 
  threshold = 0.1,
  rootMargin = '50px' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold, rootMargin }
    );

    const element = document.getElementById('lazy-loader');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div id="lazy-loader">
      {isVisible ? children : fallback}
    </div>
  );
};

// Fade In Animation
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 300,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-all ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
      style={{ 
        transitionDuration: `${duration}ms` 
      }}
    >
      {children}
    </div>
  );
};

// Slide In Animation
export const SlideIn = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 300,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0';
    
    switch (direction) {
      case 'left': return '-translate-x-full';
      case 'right': return 'translate-x-full';
      case 'up': return '-translate-y-full';
      case 'down': return 'translate-y-full';
      default: return '-translate-x-full';
    }
  };

  return (
    <div 
      className={`
        transition-all ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${getTransform()}
        ${className}
      `}
      style={{ 
        transitionDuration: `${duration}ms` 
      }}
    >
      {children}
    </div>
  );
};

// Staggered Animation for Lists
export const StaggeredList = ({ 
  children, 
  staggerDelay = 100, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

// Loading States Hook
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = async (asyncFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setLoading,
    setError,
    withLoading
  };
};

export default {
  LoadingSpinner,
  LoadingPulse,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  PageLoader,
  LoadingOverlay,
  LoadingButton,
  ProgressiveLoader,
  LazyLoader,
  FadeIn,
  SlideIn,
  StaggeredList,
  useLoadingState
};