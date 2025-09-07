export default function PrivacyPolicy({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-[#14B8A6] hover:underline"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Privacy Policy</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Collection</h2>
            <p className="text-gray-600">
              Conseccomms collects information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Usage</h2>
            <p className="text-gray-600">
              Our ConsecIQ AI features process your data to provide intelligent suggestions, summaries, 
              and automation. All AI processing is done securely and your data remains private.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention</h2>
            <p className="text-gray-600">
              We retain your information for as long as your account is active or as needed to provide 
              services. You can request data deletion at any time.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at privacy@conseccomms.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}