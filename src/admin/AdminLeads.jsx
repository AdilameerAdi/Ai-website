import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaFileCsv, FaArrowLeft } from 'react-icons/fa';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';
import { supabase } from '../lib/supabase'; // Import the Supabase client

export default function AdminLeads({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  
  // State for leads data and loading/error handling
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leads data from the database
  useEffect(() => {
    const fetchLeadsData = async () => {
      try {
        const { data, error } = await supabase
          .from('leads') // Replace with the correct table name
          .select('*') // You can customize the fields you want to fetch
          .order('created_at', { ascending: false }); // Sort by latest created

        if (error) {
          throw error;
        }

        setLeadsData(data);
      } catch (error) {
        setError('Failed to load leads data');
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsData();
  }, []); // Empty dependency array ensures the fetch runs only once when the component is mounted

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-[#14B8A6] hover:bg-gray-100 rounded-lg transition whitespace-nowrap"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">Lead Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <button 
                onClick={handleExportLeadsCSV}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Export leads data as CSV"
              >
                <FaFileCsv />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </ProtectedComponent>
            <button 
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition self-end sm:self-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Loading or Error State */}
        {loading && (
          <div className="text-center text-gray-500">Loading leads...</div>
        )}
        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}

        {/* Leads Data Display */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Total Leads</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{leadsData.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">+124 this month</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">New Leads</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">45</p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">This week</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Qualified</h3>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600 truncate">234</p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Ready for contact</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Conversion Rate</h3>
              <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">23%</p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Lead to customer</p>
            </div>
          </div>
        )}

        {/* Leads List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Leads</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                />
                <select className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto">
                  <option>All Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Converted</option>
                  <option>Lost</option>
                </select>
                <select className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto">
                  <option>All Sources</option>
                  <option>Website Form</option>
                  <option>Demo Request</option>
                  <option>Roadmap Interest</option>
                  <option>Pricing Page</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Source</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Created</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leadsData.map((lead) => (
                  <tr className="hover:bg-gray-50" key={lead.id}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                          <FaUser className="text-xs sm:text-sm" />
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{lead.name}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{lead.email}</div>
                          <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">{lead.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400 text-xs" />
                          <span className="text-xs sm:text-sm text-gray-900 truncate">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900 truncate">{lead.company}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400 text-xs" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                        <button onClick={() => handleViewLead(lead.id)} className="text-[#14B8A6] hover:text-[#0d9488] text-left">View</button>
                        <button onClick={() => handleContactLead(lead.id)} className="text-blue-600 hover:text-blue-900 text-left">Contact</button>
                        <button className="text-gray-600 hover:text-gray-900 text-left">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
