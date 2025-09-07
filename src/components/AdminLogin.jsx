import { useState } from 'react';
import { adminAuthService } from '../services/adminAuth';
import { testAdminConnection } from '../utils/testAdminConnection';

export default function AdminLogin({ isOpen, onClose, onAdminLoginSuccess }) {
  const [credentials, setCredentials] = useState({
    adminName: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError('');
    setConnectionStatus('');
    
    try {
      const result = await testAdminConnection();
      console.log('Connection test result:', result);
      
      if (result.success) {
        setConnectionStatus(`✅ Connection successful! Found ${result.totalAdmins} admin users`);
        console.log('Admin users found:', result.admins);
      } else {
        setError(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setError(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.adminName || !credentials.password) {
      setError('Please enter both admin name and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await adminAuthService.loginAdmin(
        credentials.adminName.trim(),
        credentials.password
      );

      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful!', result.admin);
        
        // Clear form
        setCredentials({ adminName: '', password: '' });
        
        // Call success callback
        onAdminLoginSuccess(result.admin);
        onClose();
      } else {
        setError(result.error || 'Invalid credentials');
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-center text-gray-500 mt-2">
            Access the admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {/* Connection Status */}
        {connectionStatus && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-xl text-sm">
            {connectionStatus}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Admin Username
            </label>
            <input
              type="text"
              value={credentials.adminName}
              onChange={(e) => handleInputChange('adminName', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Enter admin username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-xl font-semibold transition ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              "Login as Admin"
            )}
          </button>
        </form>

        {/* Test Connection Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-xl font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            🔍 Test Database Connection
          </button>
        </div>

        {/* Default Credentials Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800 font-medium mb-1">Default Admin Credentials:</p>
          <p className="text-sm text-blue-600">Username: <code className="bg-blue-100 px-1 rounded">admin</code></p>
          <p className="text-sm text-blue-600">Password: <code className="bg-blue-100 px-1 rounded">Admin123</code></p>
        </div>
      </div>
    </div>
  );
}