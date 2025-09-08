import { useState } from "react";
import { apiService } from "../services/api.js";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

export default function ContactDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    subject: "General Inquiry"
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const result = await apiService.submitContact({
        fullName: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        message: formData.message,
        subject: formData.subject
      });

      if (result.success) {
        setSubmitted(true);
        setFormData({ 
          name: "", 
          email: "", 
          company: "", 
          phone: "",
          message: "",
          subject: "General Inquiry"
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(result.error || "Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 py-20" id="contact">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Reach out via form or contact us directly.
          </p>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#1C94B5] mt-1" />
              <span>
                A2 111 Hinjewadi Hill, Phase 1 Xrbia, Marunji, Pune, 
                Mulashi, Maharashtra, India, 411057
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-[#1C94B5]" />
              <a href="mailto:info@conseccomms.com" className="hover:underline">
                info@conseccomms.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-[#1C94B5]" />
              <a href="tel:+912067024727" className="hover:underline">
                +91 20 6702 4727
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-md space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name *"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address *"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
            />
          </div>

          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="Demo Request">Demo Request</option>
            <option value="Sales Question">Sales Question</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Partnership Inquiry">Partnership Inquiry</option>
            <option value="Other">Other</option>
          </select>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message *"
            rows="5"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1C94B5]"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-[#1C94B5] text-white rounded-lg font-semibold hover:bg-[#14748B] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
              <p className="font-medium">Thank you for contacting us!</p>
              <p className="text-sm">We'll get back to you within 24 hours.</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
