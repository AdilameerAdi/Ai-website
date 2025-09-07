export default function TermsOfService({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-[#14B8A6] hover:underline"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Terms of Service</h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">SaaS Usage</h2>
            <p className="text-gray-600">
              Conseccomms provides software as a service (SaaS) solutions. By using our services, 
              you agree to use them in accordance with these terms and applicable laws.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-600">
              All rights, title, and interest in and to the Conseccomms platform and services are 
              and will remain the exclusive property of Conseccomms and its licensors.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Responsibilities</h2>
            <p className="text-gray-600">
              You are responsible for maintaining the confidentiality of your account and password 
              and for all activities that occur under your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disclaimers</h2>
            <p className="text-gray-600">
              The services are provided "as is" and "as available" without warranties of any kind, 
              either express or implied.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              For questions about these Terms, please contact us at legal@conseccomms.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}