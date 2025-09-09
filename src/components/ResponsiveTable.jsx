import React from 'react';

/**
 * ResponsiveTable Component
 * 
 * A wrapper component that makes tables responsive across different screen sizes
 * 
 * Features:
 * - Horizontal scrolling on small screens
 * - Mobile-optimized spacing and typography
 * - Enhanced styling for better mobile visibility
 * - Touch-friendly scrolling
 */

export const ResponsiveTable = ({ children, className = "" }) => {
  return (
    <div className={`overflow-x-auto shadow-sm border border-gray-200 rounded-lg ${className}`}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
};

/**
 * ResponsiveTableHeader Component
 * 
 * Responsive table header with mobile-optimized styling
 */
export const ResponsiveTableHeader = ({ children, className = "" }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

/**
 * ResponsiveTableHeaderCell Component
 * 
 * Mobile-optimized table header cell
 */
export const ResponsiveTableHeaderCell = ({ 
  children, 
  className = "", 
  hideOnMobile = false,
  hideOnTablet = false 
}) => {
  const mobileClass = hideOnMobile ? 'hidden sm:table-cell' : '';
  const tabletClass = hideOnTablet ? 'hidden md:table-cell' : '';
  
  return (
    <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${mobileClass} ${tabletClass} ${className}`}>
      {children}
    </th>
  );
};

/**
 * ResponsiveTableBody Component
 * 
 * Responsive table body with mobile-optimized styling
 */
export const ResponsiveTableBody = ({ children, className = "" }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

/**
 * ResponsiveTableRow Component
 * 
 * Mobile-optimized table row
 */
export const ResponsiveTableRow = ({ children, className = "", onClick }) => {
  const clickableClass = onClick ? 'hover:bg-gray-50 cursor-pointer' : '';
  
  return (
    <tr className={`${clickableClass} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};

/**
 * ResponsiveTableCell Component
 * 
 * Mobile-optimized table cell with responsive spacing and text sizing
 */
export const ResponsiveTableCell = ({ 
  children, 
  className = "", 
  hideOnMobile = false,
  hideOnTablet = false,
  mobileContent = null 
}) => {
  const mobileClass = hideOnMobile ? 'hidden sm:table-cell' : '';
  const tabletClass = hideOnTablet ? 'hidden md:table-cell' : '';
  
  return (
    <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${mobileClass} ${tabletClass} ${className}`}>
      {/* Show mobile-specific content on small screens if provided */}
      {mobileContent ? (
        <>
          <div className="sm:hidden">{mobileContent}</div>
          <div className="hidden sm:block">{children}</div>
        </>
      ) : (
        children
      )}
    </td>
  );
};

/**
 * ResponsiveTableMobileCard Component
 * 
 * Alternative mobile layout that shows table data as cards on small screens
 * Use this when table has too many columns for mobile
 */
export const ResponsiveTableMobileCard = ({ children, className = "" }) => {
  return (
    <div className={`sm:hidden bg-white border border-gray-200 rounded-lg p-4 mb-3 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Full Responsive Table Component
 * 
 * Complete responsive table with all optimizations
 */
export const FullResponsiveTable = ({ 
  headers = [], 
  data = [], 
  renderRow, 
  className = "",
  emptyMessage = "No data available"
}) => {
  return (
    <ResponsiveTable className={className}>
      <table className="w-full min-w-full divide-y divide-gray-200">
        <ResponsiveTableHeader>
          <tr>
            {headers.map((header, index) => (
              <ResponsiveTableHeaderCell 
                key={index}
                hideOnMobile={header.hideOnMobile}
                hideOnTablet={header.hideOnTablet}
              >
                {header.label}
              </ResponsiveTableHeaderCell>
            ))}
          </tr>
        </ResponsiveTableHeader>
        <ResponsiveTableBody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={headers.length} 
                className="px-6 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </ResponsiveTableBody>
      </table>
    </ResponsiveTable>
  );
};

export default ResponsiveTable;