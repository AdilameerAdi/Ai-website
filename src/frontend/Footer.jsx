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

  // Smooth scroll function
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const targetPosition = element.offsetTop - 80; // Adjust for fixed header
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = Math.abs(distance) > 1000 ? 1200 : 800;

      let start = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressRatio = Math.min(progress / duration, 1);
        const easeInOutCubic =
          progressRatio < 0.5
            ? 4 * progressRatio * progressRatio * progressRatio
            : (progressRatio - 1) *
                (2 * progressRatio - 2) *
                (2 * progressRatio - 2) +
              1;
        window.scrollTo(0, startPosition + distance * easeInOutCubic);
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  };

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
          <h3 className="font-semibold mt-4">1. Introduction</h3>
          <p>
            Conseccomms is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when you
            use our services, including ConsecDesk, ConsecDrive, and ConsecQuote.
          </p>
          <h3 className="font-semibold mt-4">2. Information We Collect</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Account Information:</strong> Name, email, company details.</li>
            <li><strong>Usage Data:</strong> Login activity, files uploaded, proposals created.</li>
            <li><strong>Feedback & Interest Data:</strong> Demo requests, pricing interest, roadmap notifications, feedback form submissions.</li>
            <li><strong>Technical Data:</strong> Browser type, device, IP address.</li>
          </ul>
          <h3 className="font-semibold mt-4">3. How We Use Your Data</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>To provide access to ConsecDesk, ConsecDrive, and ConsecQuote.</li>
            <li>To improve user experience through ConsecIQ AI features (e.g., smart replies, tagging, proposals).</li>
            <li>To notify you about new features and roadmap updates.</li>
            <li>To maintain system security and compliance.</li>
          </ul>
          <h3 className="font-semibold mt-4">4. Data Sharing</h3>
          <p>We do not sell your data. Information may only be shared with:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Cloud hosting partners (Google Cloud, Firebase).</li>
            <li>Legal or regulatory authorities when required by law.</li>
          </ul>
          <h3 className="font-semibold mt-4">5. Data Retention</h3>
          <p>We retain data as long as your account is active or as required for legal/compliance purposes.</p>
          <h3 className="font-semibold mt-4">6. Security</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Data is encrypted at rest and in transit.</li>
            <li>Access is role-based and monitored.</li>
          </ul>
          <h3 className="font-semibold mt-4">7. User Rights</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access or download your data.</li>
            <li>Correct inaccurate details.</li>
            <li>Delete your account (subject to compliance needs).</li>
          </ul>
          <h3 className="font-semibold mt-4">8. Contact Us</h3>
          <p>For questions, contact us at: <strong>support@conseccomms.com</strong></p>
        </>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <>
          <p><strong>Effective Date:</strong> September 2025</p>
          <p><strong>Company:</strong> Conseccomms Pvt Ltd</p>
          <h3 className="font-semibold mt-4">1. Acceptance of Terms</h3>
          <p>By signing up or using Conseccomms services (ConsecDesk, ConsecDrive, ConsecQuote), you agree to these Terms of Service.</p>
          <h3 className="font-semibold mt-4">2. Services Provided</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access to SaaS apps: ConsecDesk, ConsecDrive, ConsecQuote.</li>
            <li>Roadmap apps (e.g., ConsecMeet, ConsecMail) are Coming Soon and may change.</li>
            <li>AI features are powered by ConsecIQ.</li>
          </ul>
          <h3 className="font-semibold mt-4">3. Accounts & Access</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Users must provide accurate information during signup.</li>
            <li>Free users receive basic access; paid tiers provide additional features.</li>
            <li>You are responsible for safeguarding login credentials.</li>
          </ul>
          <h3 className="font-semibold mt-4">4. Subscription & Payments</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Pricing plans: Free, Growth, Business, Pro, Enterprise.</li>
            <li>Paid plans are billed monthly or annually.</li>
            <li>Enterprise contracts may include custom pricing.</li>
          </ul>
          <h3 className="font-semibold mt-4">5. Acceptable Use</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Do not upload harmful, illegal, or infringing content.</li>
            <li>Do not misuse AI features for fraudulent or abusive purposes.</li>
            <li>Do not attempt unauthorized access to the system.</li>
          </ul>
          <h3 className="font-semibold mt-4">6. Intellectual Property</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>Conseccomms and ConsecIQ are proprietary technologies.</li>
            <li>You retain ownership of your uploaded files and created proposals.</li>
          </ul>
          <h3 className="font-semibold mt-4">7. AI Disclaimer</h3>
          <p>ConsecIQ provides AI-based suggestions, summaries, and insights. These outputs are recommendations only and not guaranteed to be error-free.</p>
          <h3 className="font-semibold mt-4">8. Termination</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li>We may suspend accounts violating these Terms.</li>
            <li>Users may cancel anytime; refunds are governed by applicable law.</li>
          </ul>
          <h3 className="font-semibold mt-4">9. Limitation of Liability</h3>
          <p>Conseccomms is provided “as is.” We are not liable for indirect damages, data loss, or AI misinterpretations.</p>
          <h3 className="font-semibold mt-4">10. Governing Law</h3>
          <p>These Terms are governed by the laws of India, and disputes will fall under the jurisdiction of Mumbai courts.</p>
          <h3 className="font-semibold mt-4">11. Contact Us</h3>
          <p>For support, email: <strong>support@conseccomms.com</strong></p>
        </>
      ),
    },
    refund: {
      title: "Refund & Cancellation Policy",
      body: (
        <>
          <p><strong>Effective Date:</strong> September 2025</p>
          <p><strong>Company:</strong> Conseccomms Pvt Ltd (“we,” “our,” “us”)</p>
          <h3 className="font-semibold mt-4">1. Free Plan</h3>
          <p>Our Start Free plan allows users to explore ConsecDesk, ConsecDrive, and ConsecQuote at no cost. Since it is free, it is not eligible for refunds.</p>
          <h3 className="font-semibold mt-4">2. Paid Subscriptions</h3>
          <p>Conseccomms offers Growth, Business, Pro, and Enterprise subscription plans. Subscriptions are billed monthly or annually depending on your chosen plan.</p>
          <h3 className="font-semibold mt-4">3. Refunds</h3>
          <p>We do not provide refunds for monthly subscriptions once billed.</p>
          <p>For annual subscriptions, refunds may be issued on a pro-rata basis only if:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Service downtime exceeds 15 consecutive days.</li>
            <li>A billing error has occurred.</li>
          </ul>
          <h3 className="font-semibold mt-4">4. Cancellations</h3>
          <p>You may cancel your subscription at any time via the Billing/Account settings. Once cancelled, you will retain access until the end of the current billing cycle. No partial refunds are issued for cancellations during an active billing cycle.</p>
          <h3 className="font-semibold mt-4">5. Enterprise Contracts</h3>
          <p>Enterprise plans operate under custom agreements. Refund and cancellation terms are defined in the contract signed with the client.</p>
          <h3 className="font-semibold mt-4">6. Contact Us</h3>
          <p>For refund or cancellation requests, email us at <strong>support@conseccomms.com</strong></p>
        </>
      ),
    },
  };

  return (
    <footer className="relative py-16 bg-[#1F2937] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Company Info */}
          <div>
            <img src={logo} alt="Conseccomms Logo" className="w-48 h-30 mb-4 object-contain" />
            <div className="space-y-2 text-sm">
              <p>
                A2 111 Hinjewadi Hill, Phase 1 Xrbia, Marunji, Pune, Mulashi, Maharashtra, India, 411057
              </p>
              <p>
                📧{" "}
                <a href="mailto:info@conseccomms.com" className="underline hover:text-white transition">
                  info@conseccomms.com
                </a>
              </p>
              <p>☎ +91 20 6702 4727</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Quick Links</h4>
            <ul className="space-y-2">
              {["home","features","pricing","roadmap","faqs","contact","feedback"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => smoothScrollTo(link)}
                    className="hover:text-white transition underline text-left w-full"
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-[#14B8A6] pb-2">Legal</h4>
            <ul className="space-y-2 text-sm">
              {["privacy","terms","refund"].map((modal) => (
                <li key={modal}>
                  <button
                    onClick={() => setActiveModal(modal)}
                    className="hover:text-white transition underline"
                  >
                    {modal === "privacy" ? "Privacy Policy" : modal === "terms" ? "Terms of Service" : "Refund & Cancellation Policy"}
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-lg font-semibold text-white mt-6 mb-4 border-b border-[#14B8A6] pb-2">Follow Us</h4>
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
