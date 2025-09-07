// Global error handling utilities
export class AppError extends Error {
  constructor(message, statusCode, code = 'GENERIC_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const ErrorCodes = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_TOO_LONG: 'VALIDATION_TOO_LONG',
  VALIDATION_TOO_SHORT: 'VALIDATION_TOO_SHORT',
  
  // File Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Database Errors
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Permission Errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',
  
  // Business Logic Errors
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED'
};

// User-friendly error messages
export const ErrorMessages = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action.',
  
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: 'This field is required.',
  [ErrorCodes.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address.',
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: 'Invalid format. Please check your input.',
  [ErrorCodes.VALIDATION_TOO_LONG]: 'This field is too long.',
  [ErrorCodes.VALIDATION_TOO_SHORT]: 'This field is too short.',
  
  [ErrorCodes.FILE_TOO_LARGE]: 'File size exceeds the maximum limit.',
  [ErrorCodes.FILE_INVALID_TYPE]: 'Invalid file type. Please select a supported file.',
  [ErrorCodes.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again.',
  [ErrorCodes.FILE_NOT_FOUND]: 'The requested file was not found.',
  
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ErrorCodes.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.SERVER_ERROR]: 'Server error. Please try again later.',
  
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 'Unable to connect to the database.',
  [ErrorCodes.DATABASE_QUERY_ERROR]: 'Database operation failed.',
  [ErrorCodes.RECORD_NOT_FOUND]: 'The requested record was not found.',
  [ErrorCodes.DUPLICATE_ENTRY]: 'This record already exists.',
  
  [ErrorCodes.PERMISSION_DENIED]: 'Access denied. You do not have permission to perform this action.',
  [ErrorCodes.INSUFFICIENT_PRIVILEGES]: 'Insufficient privileges. Contact your administrator.',
  
  [ErrorCodes.QUOTA_EXCEEDED]: 'You have exceeded your usage quota.',
  [ErrorCodes.FEATURE_NOT_AVAILABLE]: 'This feature is not available in your current plan.',
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 'This operation is not allowed.'
};

// Error handling middleware
export const handleError = (error) => {
  console.error('Application Error:', error);
  
  // Log error details for debugging
  const errorInfo = {
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', errorInfo);
  }
  
  return {
    message: ErrorMessages[error.code] || error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    statusCode: error.statusCode || 500
  };
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Network error handler for API calls
export const handleApiError = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Network error occurred' };
    }
    
    const error = new AppError(
      errorData.message || 'API request failed',
      response.status,
      errorData.code || ErrorCodes.NETWORK_ERROR
    );
    
    throw error;
  }
  return response;
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Required field validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = ErrorMessages[ErrorCodes.VALIDATION_REQUIRED_FIELD];
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return;
    
    // Email validation
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = ErrorMessages[ErrorCodes.VALIDATION_INVALID_EMAIL];
      return;
    }
    
    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Minimum ${rule.minLength} characters required`;
      return;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Maximum ${rule.maxLength} characters allowed`;
      return;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || ErrorMessages[ErrorCodes.VALIDATION_INVALID_FORMAT];
      return;
    }
    
    // Custom validation
    if (rule.validate) {
      const result = rule.validate(value);
      if (result !== true) {
        errors[field] = result;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// File validation helper
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles = 1
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push(ErrorMessages[ErrorCodes.VALIDATION_REQUIRED_FIELD]);
    return { isValid: false, errors };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Allowed file types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  AppError,
  ErrorCodes,
  ErrorMessages,
  handleError,
  asyncHandler,
  handleApiError,
  retryRequest,
  validateForm,
  validateFile
};