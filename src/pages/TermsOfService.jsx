export default function TermsOfService({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-[#1C94B5] hover:underline"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-center mb-8">Effective Date: September 2025</p>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By signing up or using Conseccomms services (ConsecDesk, ConsecDrive, ConsecQuote), 
              you agree to these Terms of Service.
            </p>
          </section>

          {/* Services Provided */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Services Provided</h2>
            <p className="text-gray-600">
              Access to SaaS apps: ConsecDesk, ConsecDrive, ConsecQuote. <br />
              Roadmap apps (e.g., ConsecMeet, ConsecMail, etc.) are Coming Soon and may change. <br />
              AI features are powered by ConsecIQ.
            </p>
          </section>

          {/* Accounts & Access */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Accounts & Access</h2>
            <p className="text-gray-600">
              Users must provide accurate information during signup. <br />
              Free users receive basic access; paid tiers provide additional features. <br />
              You are responsible for safeguarding login credentials.
            </p>
          </section>

          {/* Subscription & Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Subscription & Payments</h2>
            <p className="text-gray-600">
              Pricing plans: Free, Growth, Business, Pro, Enterprise. <br />
              Paid plans are billed monthly or annually. <br />
              Enterprise contracts may include custom pricing.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-600">
              You agree not to: <br />
              • Upload harmful, illegal, or infringing content. <br />
              • Misuse AI features for fraudulent or abusive purposes. <br />
              • Attempt unauthorized access to the system.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600">
              Conseccomms and ConsecIQ are proprietary technologies. <br />
              You retain ownership of your uploaded files and created proposals.
            </p>
          </section>

          {/* AI Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. AI Disclaimer</h2>
            <p className="text-gray-600">
              ConsecIQ provides AI-based suggestions, summaries, and insights. <br />
              These outputs are recommendations only and not guaranteed to be error-free.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Termination</h2>
            <p className="text-gray-600">
              We may suspend accounts violating these Terms. <br />
              Users may cancel anytime; refunds are governed by applicable law.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600">
              Conseccomms is provided “as is.” <br />
              We are not liable for indirect damages, data loss, or AI misinterpretations.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Governing Law</h2>
            <p className="text-gray-600">
              These Terms are governed by the laws of India, 
              and disputes will fall under the jurisdiction of Mumbai courts.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
            <p className="text-gray-600">
              For support, email:{" "}
              <a 
                href="mailto:support@conseccomms.com" 
                className="text-[#1C94B5] hover:underline"
              >
                support@conseccomms.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
