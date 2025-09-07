import { FaDownload, FaCalendar, FaChartBar, FaFileExport, FaArrowLeft } from 'react-icons/fa';

export default function AdminReports({ navigate, onLogout }) {
  const handleExportAll = () => {
    alert('Exporting all reports...');
  };

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
            <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={handleExportAll} className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition flex items-center gap-2">
              <FaFileExport />
              Export All
            </button>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">$2.4M</p>
            <p className="text-sm text-gray-500">+18% from last quarter</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">1,234</p>
            <p className="text-sm text-gray-500">987 Pro, 247 Free</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Churn Rate</h3>
            <p className="text-3xl font-bold text-yellow-600">2.3%</p>
            <p className="text-sm text-gray-500">Below industry avg</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Customer LTV</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">$1,950</p>
            <p className="text-sm text-gray-500">Average lifetime value</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue Trend</h3>
              <button className="text-[#14B8A6] hover:text-[#0d9488] flex items-center gap-2">
                <FaDownload />
                Export
              </button>
            </div>
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
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">October 2023</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">$278K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">App Usage Analytics</h3>
              <button className="text-[#14B8A6] hover:text-[#0d9488] flex items-center gap-2">
                <FaChartBar />
                Details
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">ConsecDrive</p>
                  <p className="text-sm text-gray-500">File Management</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#14B8A6]">98%</p>
                  <p className="text-sm text-gray-500">Usage Rate</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">ConsecQuote</p>
                  <p className="text-sm text-gray-500">Proposal System</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#14B8A6]">78%</p>
                  <p className="text-sm text-gray-500">Usage Rate</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">ConsecDesk</p>
                  <p className="text-sm text-gray-500">Support System</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#14B8A6]">65%</p>
                  <p className="text-sm text-gray-500">Usage Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Custom Reports</h2>
              <div className="flex gap-4">
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <button className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">User Activity Report</h4>
                  <FaCalendar className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed analysis of user engagement, login patterns, and app usage statistics.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-[#14B8A6] text-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                    Generate
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition">
                    <FaDownload />
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Financial Summary</h4>
                  <FaChartBar className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Revenue breakdown, subscription metrics, and payment analytics for specified period.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-[#14B8A6] text-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                    Generate
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition">
                    <FaDownload />
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">System Performance</h4>
                  <FaFileExport className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Storage usage, API calls, system uptime, and performance metrics overview.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-[#14B8A6] text-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                    Generate
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition">
                    <FaDownload />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Export History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Q4 2023 User Activity</div>
                    <div className="text-sm text-gray-500">Comprehensive user metrics</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      User Activity
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Oct 1 - Dec 31, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 5, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaDownload />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Financial Summary December</div>
                    <div className="text-sm text-gray-500">Revenue and subscription data</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Financial
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Dec 1 - Dec 31, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 3, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-gray-400 mr-3" disabled>
                      <FaDownload />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}