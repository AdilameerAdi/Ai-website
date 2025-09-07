import { useState } from "react";
import { FaLinkedin, FaTwitter, FaInstagram, FaBrain, FaRocket, FaShieldAlt, FaHeadset } from "react-icons/fa";
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
        fullName: "" // Newsletter signups might not have names
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
    <footer className="relative py-16" style={{ background: "#31BFAF", color: "#f0f0f0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <img src={logo} alt="Conseccomms Logo" className="w-48 h-30 mb-4 object-contain" />
            <p className="text-gray-200 text-sm mb-6">
              Empowering businesses with AI-powered solutions. Inspiring Brilliance, Streaming to Digital Horizons.
            </p>
            <div className="space-y-2 text-gray-200 text-sm mb-6">
              <p>📍 Mumbai, Maharashtra, India</p>
              <p>📧 <a href="mailto:info@conseccomms.com" className="underline hover:text-white transition">info@conseccomms.com</a></p>
              <p>📞 <a href="mailto:support@conseccomms.com" className="underline hover:text-white transition">support@conseccomms.com</a></p>
            </div>
            
            {/* Social Media */}
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

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="hover:text-white transition flex items-center gap-2"><FaRocket size={14} /> Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
              <li><a href="#roadmap" className="hover:text-white transition">Product Roadmap</a></li>
              <li><a href="#contact" className="hover:text-white transition">Request Demo</a></li>
              <li><a href="#feedback" className="hover:text-white transition">Give Feedback</a></li>
            </ul>
          </div>

          {/* Apps & Solutions */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Solutions</h4>
            <ul className="space-y-3">
              <li><span className="text-gray-200 flex items-center gap-2"><FaHeadset size={14} /> ConsecDesk</span></li>
              <li><span className="text-gray-200">ConsecDrive</span></li>
              <li><span className="text-gray-200">ConsecQuote</span></li>
              <li><span className="text-gray-200 flex items-center gap-2"><FaBrain size={14} /> ConsecIQ AI</span></li>
              <li><span className="text-gray-300 text-sm">+ 6 more coming soon</span></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Support</h4>
            <ul className="space-y-3">
              <li><a href="#faqs" className="hover:text-white transition">Help Center</a></li>
              <li><a href="mailto:support@conseccomms.com" className="hover:text-white transition">Contact Support</a></li>
              <li><a href="#/documentation" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#/security" className="hover:text-white transition flex items-center gap-2"><FaShieldAlt size={14} /> Security</a></li>
            </ul>
            
            <h5 className="text-md font-semibold text-white mt-6 mb-3">Legal</h5>
            <ul className="space-y-2">
              <li><a href="#/privacy" className="hover:text-white transition text-sm">Privacy Policy</a></li>
              <li><a href="#/terms" className="hover:text-white transition text-sm">Terms of Service</a></li>
              <li><a href="#/privacy" className="hover:text-white transition text-sm">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-[#14B8A6]/30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
              <p className="text-gray-200 text-sm">Get the latest updates on new features and releases.</p>
              {error && <p className="text-red-300 text-xs mt-1">{error}</p>}
              {subscribed && <p className="text-green-300 text-xs mt-1">✓ Successfully subscribed!</p>}
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </form>
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
