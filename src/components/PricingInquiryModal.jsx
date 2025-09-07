import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { apiService } from "../services/api.js";

export default function PricingInquiryModal({ isOpen, onClose, selectedPlan = null }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    companySize: "",
    currentSolution: "",
    planType: selectedPlan || "",
    message: ""
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
      const result = await apiService.submitPricingInquiry(formData);

      if (result.success) {
        setSubmitted(true);
        setFormData({
          fullName: "",
          email: "",
          company: "",
          phone: "",
          companySize: "",
          currentSolution: "",
          planType: selectedPlan || "",
          message: ""
        });
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        setError(result.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Pricing inquiry error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedPlan ? `Inquire About ${selectedPlan} Plan` : 'Pricing Inquiry'}
          </h2>
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
            <div className="text-center py-12">
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Inquiry Submitted!</h3>
                <p>Thank you for your interest in our {selectedPlan} plan. Our sales team will contact you within 24 hours with detailed information and pricing options.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Business Email *"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company Name *"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  <option value="">Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
                <select
                  name="planType"
                  value={formData.planType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  <option value="">Plan of Interest</option>
                  <option value="Start Free">Start Free</option>
                  <option value="Growth">Growth Plan</option>
                  <option value="Business">Business Plan</option>
                  <option value="Pro">Pro Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                  <option value="Custom">Custom Solution</option>
                </select>
              </div>

              <input
                type="text"
                name="currentSolution"
                value={formData.currentSolution}
                onChange={handleChange}
                placeholder="Current Solution/Software (Optional)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your specific needs, questions, or requirements (Optional)"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                  className="flex-1 py-3 px-6 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Send Inquiry"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}