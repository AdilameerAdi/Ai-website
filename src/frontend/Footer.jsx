import { useState } from "react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import logo from "../img/log.png";
import { apiService } from "../services/api.js";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await apiService.submitNewsletterSignup({
        email: email.trim(),
        fullName: ""
      });

      if (result.success) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setError(result.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative py-16" style={{ background: "#1F2937", color: "#f0f0f0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Company Info */}
          <div>
            <img src={logo} alt="Conseccomms Logo" className="w-48 h-30 mb-4 object-contain" />
            <p className="text-gray-200 text-sm mb-4">
              Inspiring Brilliance, Streaming to Digital Horizons.
            </p>
            <div className="space-y-2 text-gray-200 text-sm">
              <p>📍 Mumbai, Maharashtra, India</p>
              <p>📧 <a href="mailto:info@conseccomms.com" className="underline hover:text-white transition">info@conseccomms.com</a></p>
              <p>☎ +91-XXXXXXXXXX</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-white transition">Home</a></li>
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#roadmap" className="hover:text-white transition">Roadmap</a></li>
              <li><a href="#faqs" className="hover:text-white transition">FAQs</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              <li><a href="#feedback" className="hover:text-white transition">Feedback</a></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#refund" className="hover:text-white transition">Refund & Cancellation Policy</a></li>
            </ul>

            <h4 className="text-lg font-semibold text-white mt-6 mb-4 border-b border-[#14B8A6] pb-2">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/conseccomms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition transform hover:scale-110">
                <FaLinkedin size={24} />
              </a>
              <a href="https://twitter.com/conseccomms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition transform hover:scale-110">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com/conseccomms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition transform hover:scale-110">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="mt-16 border-t border-[#14B8A6] pt-6 text-center text-gray-200 text-sm">
        © 2025 Conseccomms Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}
