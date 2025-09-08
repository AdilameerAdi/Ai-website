export default function PrivacyPolicy({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-[#1C94B5] hover:underline"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-4xl text-center font-bold text-gray-800 mb-8">Privacy Policy</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Collection</h2>
            <p className="text-gray-600">
              Conseccomms collects information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. We may also collect limited technical data such as 
              device type, browser, and usage logs to improve service reliability.
            </p>
          </section>
          
          {/* AI Usage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Usage</h2>
            <p className="text-gray-600">
              Our ConsecIQ AI features process your data to provide intelligent suggestions, summaries, 
              and automation. All AI processing is performed securely, and your data remains private. 
              We do not use your personal data to train third-party AI systems.
            </p>
          </section>
          
          {/* Cookies & Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cookies & Tracking</h2>
            <p className="text-gray-600">
              We use cookies and similar technologies to enhance your experience, analyze trends, 
              and improve our services. You can control or disable cookies through your browser settings, 
              though some features may not function properly without them.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Sharing</h2>
            <p className="text-gray-600">
              We do not sell or rent your personal information. We may share your data only with trusted 
              third-party service providers who assist us in delivering our services, and only to the 
              extent necessary. All partners are required to follow strict confidentiality and security measures.
            </p>
          </section>
          
          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention</h2>
            <p className="text-gray-600">
              We retain your information for as long as your account is active or as needed to provide 
              services. You may request deletion of your account and associated data at any time, 
              subject to applicable legal obligations.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Security</h2>
            <p className="text-gray-600">
              We use industry-standard security measures, including encryption and secure storage, 
              to protect your personal data. While we take strong precautions, no method of transmission 
              or storage can be guaranteed to be 100% secure.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Children’s Privacy</h2>
            <p className="text-gray-600">
              Our services are not directed to children under 13. We do not knowingly collect personal 
              information from children. If we become aware of such data, we will delete it promptly.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Policy Updates</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time to reflect changes in technology, 
              laws, or our services. Updates will be posted on this page with the “Last Updated” date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at 
              <a href="mailto:privacy@conseccomms.com" className="text-[#1C94B5] hover:underline ml-1">
                privacy@conseccomms.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
