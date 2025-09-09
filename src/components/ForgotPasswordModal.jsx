import { useState } from "react";
import { FaTimes, FaEnvelope, FaLock } from "react-icons/fa";
import { apiService } from "../services/api.js";

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiService.requestPasswordReset(email);
      
      if (result.success) {
        setSuccess(result.message);
        setStep('reset');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          handleClose();
          if (onBackToLogin) onBackToLogin();
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-[95vw] sm:max-w-md w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#14B8A6] rounded-lg">
              <FaLock className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Reset Password</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {step === 'request' ? 'Enter your email to receive reset instructions' : 'Enter the reset token and new password'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 flex-shrink-0 ml-2"
            aria-label="Close modal"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-3 sm:p-4 md:p-6">
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-3 sm:space-y-4">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
                    <FaEnvelope size={24} className="sm:w-8 sm:h-8 text-[#14B8A6]" />
                  </div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm px-2">
                  Enter your email address and we'll send you a reset token to recover your account.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm sm:text-base min-h-[44px]"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {success}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 sm:px-6 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 bg-green-100 rounded-full">
                    <FaEnvelope size={24} className="sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm px-2">
                  Check your email for a reset token, then enter it below with your new password.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter the reset token from your email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm sm:text-base min-h-[44px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: For demo purposes, check the browser console for the reset token.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength="6"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm sm:text-base min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 sm:mb-2 font-medium text-sm sm:text-base">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength="6"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm sm:text-base min-h-[44px]"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {success}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="flex-1 py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base min-h-[44px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 sm:px-6 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {step === 'request' && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => {
                  handleClose();
                  if (onBackToLogin) onBackToLogin();
                }}
                className="text-xs sm:text-sm text-[#14B8A6] hover:underline min-h-[44px] inline-flex items-center justify-center px-2"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}