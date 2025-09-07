export default function Documentation({ navigate }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-[#14B8A6] hover:underline flex items-center gap-2"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Documentation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              Welcome to the Conseccomms documentation. Here you'll find comprehensive guides and documentation to help you start working with our platform as quickly as possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ConsecDesk</h2>
            <p className="text-gray-600 mb-4">
              Learn how to manage tickets, set up AI auto-replies, and navigate the client dashboard.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Dashboard Overview</li>
              <li>Creating and Managing Tickets</li>
              <li>AI Auto-Reply Configuration</li>
              <li>Generating Summaries</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ConsecDrive</h2>
            <p className="text-gray-600 mb-4">
              Discover how to upload, organize, and search your files with AI-powered features.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>File Upload and Download</li>
              <li>Folder Organization</li>
              <li>AI Tagging System</li>
              <li>Semantic Search</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ConsecQuote</h2>
            <p className="text-gray-600 mb-4">
              Master the proposal creation process with AI suggestions and tracking.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Creating Proposals</li>
              <li>AI-Powered Suggestions</li>
              <li>Tracking Proposal Status</li>
              <li>Exporting to PDF</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">API Reference</h2>
            <p className="text-gray-600">
              Complete API documentation coming soon. For immediate assistance, please contact our support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}