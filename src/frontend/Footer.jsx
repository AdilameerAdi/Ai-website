import { useState } from "react";
import {
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import logo from "../img/log.png";
import { apiService } from "../services/api.js";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'refund'

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await apiService.submitNewsletterSignup({
        email: email.trim(),
        fullName: "",
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

  // Modal content
  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      body: (
        <>
          <p><strong>Effective Date:</strong> September 2025</p>
          <p><strong>Company:</strong> Conseccomms Pvt Ltd (“we,” “our,” “us”)</p>
          <h3 className="font-semibold mt-4">Introduction</h3>
          <p>
            Conseccomms is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when you
            use our services, including ConsecDesk, ConsecDrive, and ConsecQuote.
          </p>
          <h3 className="font-semibold mt-4">Information We Collect</h3>
          <ul className="list-disc ml-6">
            <li>Account Information: Name, email, company details.</li>
            <li>Usage Data: Login activity, files uploaded, proposals created.</li>
            <li>Feedback & Interest Data: Demo requests, pricing interest, feedback.</li>
            <li>Technical Data: Browser type, device, IP address.</li>
          </ul>
          <h3 className="font-semibold mt-4">User Rights</h3>
          <p>
            You can request access, correction, or deletion of your data by emailing:
            <strong> support@conseccomms.com</strong>
          </p>
        </>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <>
          <p><strong>Effective Date:</strong> September 2025</p>
          <p><strong>Company:</strong> Conseccomms Pvt Ltd</p>
          <h3 className="font-semibold mt-4">Acceptance of Terms</h3>
          <p>
            By signing up or using Conseccomms services (ConsecDesk, ConsecDrive,
            ConsecQuote), you agree to these Terms of Service.
          </p>
          <h3 className="font-semibold mt-4">Subscription & Payments</h3>
          <p>
            Pricing plans include Free, Growth, Business, Pro, and Enterprise.
            Paid plans are billed monthly or annually.
          </p>
          <h3 className="font-semibold mt-4">Limitation of Liability</h3>
          <p>
            Conseccomms is provided “as is.” We are not liable for indirect damages,
            data loss, or AI misinterpretations.
          </p>
          <p className="mt-2">
            For support: <strong>support@conseccomms.com</strong>
          </p>
        </>
      ),
    },
    refund: {
      title: "Refund & Cancellation Policy",
      body: (
        <>
          <p><strong>Effective Date:</strong> September 2025</p>
          <p><strong>Company:</strong> Conseccomms Pvt Ltd</p>
          <h3 className="font-semibold mt-4">Refunds</h3>
          <p>
            Monthly subscriptions are non-refundable. Annual subscriptions may be
            refunded pro-rata if service downtime exceeds 15 consecutive days or
            if a billing error occurs.
          </p>
          <h3 className="font-semibold mt-4">Cancellations</h3>
          <p>
            You may cancel anytime via account settings. Access remains until the
            end of the billing cycle. No partial refunds.
          </p>
          <h3 className="font-semibold mt-4">Enterprise Contracts</h3>
          <p>
            Refund & cancellation terms are defined in the signed enterprise contract.
          </p>
          <p className="mt-2">
            For requests: <strong>support@conseccomms.com</strong>
          </p>
        </>
      ),
    },
  };

  return (
    <footer
      className="relative py-16"
      style={{ background: "#1F2937", color: "#f0f0f0" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Company Info */}
          <div>
            <img
              src={logo}
              alt="Conseccomms Logo"
              className="w-48 h-30 mb-4 object-contain"
            />

            <div className="space-y-2 text-gray-200 text-sm">
              <p>
                A2 111 Hinjewadi Hill, Phase 1 Xrbia, Marunji, Pune, Mulashi,
                Maharashtra, India, 411057
              </p>
              <p>
                📧{" "}
                <a
                  href="mailto:info@conseccomms.com"
                  className="underline hover:text-white transition"
                >
                  info@conseccomms.com
                </a>
              </p>
              <p>☎ +91 20 6702 4727</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">
              Quick Links
            </h4>
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
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="hover:text-white transition underline"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("terms")}
                  className="hover:text-white transition underline"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("refund")}
                  className="hover:text-white transition underline"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
            </ul>

            <h4 className="text-lg font-semibold text-white mt-6 mb-4 border-b border-[#14B8A6] pb-2">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/conseccomms" target="_blank" rel="noopener noreferrer"><FaLinkedin size={24} /></a>
              <a href="https://www.x.com/conseccomms" target="_blank" rel="noopener noreferrer"><FaXTwitter size={24} /></a>
              <a href="https://www.instagram.com/conseccomms" target="_blank" rel="noopener noreferrer"><FaInstagram size={24} /></a>
              <a href="https://www.facebook.com/conseccomms" target="_blank" rel="noopener noreferrer"><FaFacebook size={24} /></a>
              <a href="https://www.youtube.com/@conseccomms" target="_blank" rel="noopener noreferrer"><FaYoutube size={24} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-white text-gray-800 max-w-2xl w-full rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-4">{modalContent[activeModal].title}</h2>
            <div className="space-y-2 text-sm leading-relaxed">
              {modalContent[activeModal].body}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bottom Copyright */}
      <div className="mt-16 border-t border-[#14B8A6] pt-6 text-center text-gray-200 text-sm">
        © 2025 Conseccomms Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
}
