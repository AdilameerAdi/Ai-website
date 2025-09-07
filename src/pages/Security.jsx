import { FaShieldAlt, FaLock, FaKey, FaUserShield, FaServer, FaCheckCircle } from 'react-icons/fa';

export default function Security({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-[#14B8A6] hover:underline flex items-center gap-2"
        >
          ← Back to Home
        </button>
        
        <div className="flex items-center gap-3 mb-8">
          <FaShieldAlt className="text-4xl text-[#14B8A6]" />
          <h1 className="text-4xl font-bold text-gray-800">Security</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <section className="mb-8">
            <p className="text-lg text-gray-600 mb-6">
              At Conseccomms, we take security seriously. Our platform is built with enterprise-grade security measures to protect your data and ensure business continuity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-[#14B8A6]" /> Data Encryption
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>256-bit AES encryption for data at rest</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>TLS 1.3 encryption for data in transit</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>End-to-end encryption for sensitive communications</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaKey className="text-[#14B8A6]" /> Access Control
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Multi-factor authentication (MFA)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Role-based access control (RBAC)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Single Sign-On (SSO) support</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Session management and automatic timeout</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaServer className="text-[#14B8A6]" /> Infrastructure Security
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Hosted on secure cloud infrastructure (AWS/Azure)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Regular security audits and penetration testing</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>DDoS protection and Web Application Firewall (WAF)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Automated backup and disaster recovery</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield className="text-[#14B8A6]" /> Compliance & Privacy
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>GDPR compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>SOC 2 Type II certified</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>ISO 27001 certification (in progress)</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-500 mt-1" />
                <span>Regular third-party security assessments</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security Best Practices</h2>
            <p className="text-gray-600 mb-4">We recommend all users follow these security best practices:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>Use strong, unique passwords for your account</li>
              <li>Enable two-factor authentication</li>
              <li>Regularly review account activity</li>
              <li>Keep your browser and devices updated</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Report Security Issues</h3>
            <p className="text-gray-600 mb-3">
              If you discover a security vulnerability, please report it to our security team immediately.
            </p>
            <a 
              href="mailto:security@conseccomms.com" 
              className="text-[#14B8A6] hover:underline font-medium"
            >
              security@conseccomms.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}