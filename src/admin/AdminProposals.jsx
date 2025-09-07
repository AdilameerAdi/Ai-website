import { FaFileAlt, FaEye, FaDownload, FaEdit, FaArrowLeft } from 'react-icons/fa';

export default function AdminProposals({ navigate, onLogout }) {
  const handleViewProposal = (id) => alert(`View proposal ${id}`);
  const handleEditProposal = (id) => alert(`Edit proposal ${id}`);
  const handleDownloadProposal = (id) => alert(`Download proposal ${id}`);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#14B8A6] hover:bg-gray-100 rounded-lg transition"
            >
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Proposal Management</h1>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Total Proposals</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">2,456</p>
            <p className="text-sm text-gray-500">+45 this month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Active Proposals</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">189</p>
            <p className="text-sm text-gray-500">In progress</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Won This Month</h3>
            <p className="text-3xl font-bold text-green-600">23</p>
            <p className="text-sm text-gray-500">$145K value</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Win Rate</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">68%</p>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Draft</span>
                <span className="font-semibold text-gray-500">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sent</span>
                <span className="font-semibold text-blue-600">123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Under Review</span>
                <span className="font-semibold text-yellow-600">67</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Won</span>
                <span className="font-semibold text-green-600">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lost</span>
                <span className="font-semibold text-red-600">42</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Proposal Value</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">January 2024</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">$245K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">December 2023</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">$189K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">November 2023</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">$312K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Proposals</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search proposals..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Status</option>
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Under Review</option>
                  <option>Won</option>
                  <option>Lost</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Website Redesign Project</div>
                        <div className="text-sm text-gray-500">PRO-2024-001</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Acme Corporation</div>
                    <div className="text-sm text-gray-500">john.doe@acme.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $25,500
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Under Review
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 10, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaEye />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEdit />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Mobile App Development</div>
                        <div className="text-sm text-gray-500">PRO-2024-002</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Tech Solutions Inc</div>
                    <div className="text-sm text-gray-500">sarah@techsol.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $45,000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Won
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 8, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaEye />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEdit />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Branding Package</div>
                        <div className="text-sm text-gray-500">PRO-2024-003</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">StartupXYZ</div>
                    <div className="text-sm text-gray-500">mike@startupxyz.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $12,800
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Sent
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 5, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaEye />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaEdit />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                <span className="font-medium">2,456</span> results
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm bg-[#14B8A6] text-white rounded hover:bg-[#0d9488]">
                  1
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}