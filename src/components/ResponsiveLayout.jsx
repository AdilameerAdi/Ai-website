import { useState, useEffect } from 'react';
import ResponsiveNavbar from './ResponsiveNavbar';

export default function ResponsiveLayout({ 
  children, 
  user, 
  onLogout, 
  navigate, 
  currentPath,
  showNavbar = true,
  className = '' 
}) {
  const [screenSize, setScreenSize] = useState('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {showNavbar && (
        <ResponsiveNavbar
          user={user}
          onLogout={onLogout}
          navigate={navigate}
          currentPath={currentPath}
        />
      )}
      
      <main className="responsive-container">
        <div className={`
          transition-all duration-300 ease-in-out
          ${screenSize === 'mobile' ? 'px-4 py-6' : ''}
          ${screenSize === 'tablet' ? 'px-6 py-8' : ''}
          ${screenSize === 'desktop' ? 'px-8 py-8' : ''}
        `}>
          {children}
        </div>
      </main>
    </div>
  );
}

// Responsive Grid Component
export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-6',
  className = '' 
}) {
  return (
    <div className={`
      grid ${gap} ${className}
      grid-cols-${cols.mobile}
      md:grid-cols-${cols.tablet}
      lg:grid-cols-${cols.desktop}
    `}>
      {children}
    </div>
  );
}

// Responsive Card Component
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'responsive',
  hover = true 
}) {
  const paddingClasses = {
    responsive: 'p-4 sm:p-6 lg:p-8',
    small: 'p-3 sm:p-4 lg:p-6',
    large: 'p-6 sm:p-8 lg:p-10'
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-200
      ${paddingClasses[padding]}
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Responsive Button Component
export function ResponsiveButton({ 
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    medium: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base',
    large: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg'
  };

  const variantClasses = {
    primary: 'bg-[#14B8A6] text-white hover:bg-[#0d9488] focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    outline: 'border-2 border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Responsive Modal Component
export function ResponsiveModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium',
  className = '' 
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-none mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className={`
          relative bg-white rounded-xl shadow-xl w-full
          ${sizeClasses[size]}
          max-h-screen overflow-y-auto
          transform transition-all
          ${className}
        `}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Responsive Table Component
export function ResponsiveTable({ 
  headers, 
  children, 
  className = '',
  striped = false 
}) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full py-2 align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className={`min-w-full divide-y divide-gray-300 ${className}`}>
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y' : ''}`}>
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Responsive Input Component
export function ResponsiveInput({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          px-3 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent
          text-sm sm:text-base
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}