import { forwardRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheck } from 'react-icons/fa';

// Base Input Component with validation
export const Input = forwardRef(({
  label,
  error,
  success,
  helper,
  required,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const baseClasses = `
    w-full px-4 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : 'border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`${baseClasses} ${stateClasses} ${isPassword ? 'pr-10' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : helper ? `${props.name}-helper` : undefined}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaExclamationCircle className="text-red-500" />
          </div>
        )}
        
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaCheck className="text-green-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p id={`${props.name}-helper`} className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component with validation
export const Textarea = forwardRef(({
  label,
  error,
  success,
  helper,
  required,
  className = '',
  rows = 4,
  maxLength,
  ...props
}, ref) => {
  const [charCount, setCharCount] = useState(props.value?.length || 0);

  const baseClasses = `
    w-full px-4 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    resize-vertical
  `;

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : 'border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]';

  const handleChange = (e) => {
    if (maxLength) {
      setCharCount(e.target.value.length);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseClasses} ${stateClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : helper ? `${props.name}-helper` : undefined}
          maxLength={maxLength}
          {...props}
          onChange={handleChange}
        />
        
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p id={`${props.name}-helper`} className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component with validation
export const Select = forwardRef(({
  label,
  error,
  success,
  helper,
  required,
  placeholder = 'Please select...',
  options = [],
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-4 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    appearance-none bg-white
  `;

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : 'border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : helper ? `${props.name}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {error && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            <FaExclamationCircle className="text-red-500" />
          </div>
        )}
        
        {success && !error && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            <FaCheck className="text-green-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p id={`${props.name}-helper`} className="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component with validation
export const Checkbox = forwardRef(({
  label,
  description,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-4 h-4 text-[#14B8A6] border-gray-300 rounded
              focus:ring-[#14B8A6] focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : description ? `${props.name}-description` : undefined}
            {...props}
          />
        </div>
        
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={props.id || props.name} className="font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
            {description && (
              <p id={`${props.name}-description`} className="text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Group Component
export const RadioGroup = ({ label, options = [], error, name, value, onChange, className = '' }) => {
  return (
    <div className="w-full">
      {label && (
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">{label}</legend>
          <div className={`space-y-2 ${className}`}>
            {options.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className={`
                    w-4 h-4 text-[#14B8A6] border-gray-300
                    focus:ring-[#14B8A6] focus:ring-2
                    ${error ? 'border-red-300' : ''}
                  `}
                  aria-invalid={!!error}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// File Upload Component
export const FileUpload = ({
  label,
  error,
  helper,
  required,
  accept,
  multiple,
  maxSize,
  onFileChange,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    setFiles(newFiles);
    if (onFileChange) {
      onFileChange(newFiles);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFileChange) {
      onFileChange(updatedFiles);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-[#14B8A6] bg-teal-50' : error ? 'border-red-300' : 'border-gray-300'}
          hover:border-[#14B8A6] hover:bg-teal-50
          ${className}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-gray-600">
            <span className="font-medium text-[#14B8A6]">Click to upload</span> or drag and drop
          </div>
          {maxSize && (
            <p className="text-xs text-gray-500">Max file size: {formatFileSize(maxSize)}</p>
          )}
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FaExclamationCircle className="flex-shrink-0" />
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};

export default {
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  FileUpload
};