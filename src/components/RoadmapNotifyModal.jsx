import { useState } from "react";
import { FaTimes, FaBell } from "react-icons/fa";
import { apiService } from "../services/api.js";

export default function RoadmapNotifyModal({ isOpen, onClose, appName, appTimeline, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    additionalInfo: ""
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiService.submitRoadmapNotification({
        appName,
        email: formData.email,
        fullName: formData.fullName,
        additionalInfo: formData.additionalInfo
      });

      if (result.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess(); // Call success callback
        setFormData({
          fullName: "",
          email: "",
          additionalInfo: ""
        });
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        setError(result.error || "Failed to signup for notifications. Please try again.");
      }
    } catch (error) {
      console.error("Roadmap notification error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSubmitted(false);
    setFormData({
      fullName: "",
      email: "",
      additionalInfo: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#14B8A6] rounded-lg">
              <FaBell className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Notify Me</h2>
              <p className="text-sm text-gray-600">{appName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg">
                <div className="flex items-center justify-center mb-3">
                  <FaBell className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
                <p className="mb-2">
                  We'll notify you as soon as <strong>{appName}</strong> is ready for launch.
                </p>
                <p className="text-sm text-green-600">
                  Expected timeline: <strong>{appTimeline}</strong>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Get notified when {appName} launches!
                </h3>
                <p className="text-gray-600 text-sm">
                  Expected timeline: <span className="font-medium text-[#14B8A6]">{appTimeline}</span>
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address *"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />

                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Any specific features or use cases you're interested in? (Optional)"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />

                <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                  <p className="text-sm text-teal-800">
                    💡 <strong>Early Access:</strong> Subscribers get first access to beta testing and special launch pricing!
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Subscribing..."
                  ) : (
                    <>
                      <FaBell size={16} />
                      Notify Me
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}