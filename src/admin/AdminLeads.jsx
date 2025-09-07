import { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaFileCsv, FaArrowLeft, FaEye } from 'react-icons/fa';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';

export default function AdminLeads({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  
  // Mock leads data
  const [leadsData] = useState([
    { id: 1, name: 'Tech Corp Inc', email: 'contact@techcorp.com', company: 'Tech Corp Inc', source: 'website', status: 'new', created_at: '2024-01-20T10:30:00Z' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'Startup Solutions', source: 'demo_request', status: 'contacted', created_at: '2024-01-19T14:22:00Z' },
    { id: 3, name: 'Mike Johnson', email: 'mike@enterprise.com', company: 'Enterprise LLC', source: 'referral', status: 'qualified', created_at: '2024-01-18T09:15:00Z' }
  ]);

  const handleExportLeadsCSV = async () => {
    try {
      const result = await exportService.exportReportToCSV(leadsData, 'leads', 'leads-export.csv');
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
        alert('Leads data exported successfully!');
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export leads data');
    }
  };

  const handleViewLead = (id) => {
    alert(`View lead details for ID: ${id}`);
  };

  const handleContactLead = (id) => {
    alert(`Contact lead ID: ${id}`);
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
            <h1 className="text-3xl font-bold text-gray-800">Lead Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <button 
                onClick={handleExportLeadsCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Export leads data as CSV"
              >
                <FaFileCsv />
                Export CSV
              </button>
            </ProtectedComponent>
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
            <h3 className="text-lg font-semibold text-gray-800">Total Leads</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">1,867</p>
            <p className="text-sm text-gray-500">+124 this month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">New Leads</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">45</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Qualified</h3>
            <p className="text-3xl font-bold text-yellow-600">234</p>
            <p className="text-sm text-gray-500">Ready for contact</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Conversion Rate</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">23%</p>
            <p className="text-sm text-gray-500">Lead to customer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Sources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Website Form</span>
                <span className="font-semibold text-[#14B8A6]">687</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Demo Requests</span>
                <span className="font-semibold text-[#14B8A6]">423</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Roadmap Interest</span>
                <span className="font-semibold text-[#14B8A6]">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pricing Page</span>
                <span className="font-semibold text-[#14B8A6]">345</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Referrals</span>
                <span className="font-semibold text-[#14B8A6]">178</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Status Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">New Leads</span>
                  <span className="text-sm font-semibold text-blue-600">456 (24%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Contacted</span>
                  <span className="text-sm font-semibold text-yellow-600">678 (36%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Qualified</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">234 (13%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '13%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Converted</span>
                  <span className="text-sm font-semibold text-green-600">189 (10%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Lost</span>
                  <span className="text-sm font-semibold text-red-600">310 (17%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Leads</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Converted</option>
                  <option>Lost</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Sources</option>
                  <option>Website Form</option>
                  <option>Demo Request</option>
                  <option>Roadmap Interest</option>
                  <option>Pricing Page</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-semibold">
                        <FaUser />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                        <div className="text-sm text-gray-500">Marketing Director</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-900">sarah@techcorp.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-500">+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">TechCorp Solutions</div>
                    <div className="text-sm text-gray-500">Technology</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Demo Request
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Qualified
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400 text-xs" />
                      Jan 12, 2024
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Contact</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                        <FaUser />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mike Chen</div>
                        <div className="text-sm text-gray-500">CEO</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-900">mike@startup.co</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-500">+1 (555) 987-6543</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">StartupCo</div>
                    <div className="text-sm text-gray-500">Fintech</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Website Form
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400 text-xs" />
                      Jan 15, 2024
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Contact</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of{' '}
                <span className="font-medium">1,867</span> results
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