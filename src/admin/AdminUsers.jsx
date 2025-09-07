import { useState } from 'react';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';
import { FaFileCsv, FaArrowLeft } from 'react-icons/fa';

export default function AdminUsers({ navigate, onLogout }) {
  const { user, hasPermission } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Mock users data
  const [usersData] = useState([
    { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'user', status: 'active', created_at: '2024-01-15T10:30:00Z', last_login: '2024-01-20T14:22:00Z' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'admin', status: 'active', created_at: '2024-01-14T09:15:00Z', last_login: '2024-01-19T16:45:00Z' },
    { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', role: 'user', status: 'inactive', created_at: '2024-01-10T11:30:00Z', last_login: '2024-01-15T08:20:00Z' }
  ]);

  const handleExportUsersCSV = async () => {
    try {
      const result = await exportService.exportReportToCSV(usersData, 'users', 'users-export.csv');
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
        alert('Users data exported successfully!');
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users data');
    }
  };

  const handleViewUser = (userId) => {
    alert(`View user details for ID: ${userId}`);
  };

  const handleEditUser = (userId) => {
    alert(`Edit user for ID: ${userId}`);
  };

  const handleBlockUser = (userId) => {
    if (confirm('Are you sure you want to block this user?')) {
      alert(`User ${userId} has been blocked`);
    }
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
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
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
            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">1,234</p>
            <p className="text-sm text-gray-500">+5.2% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">987</p>
            <p className="text-sm text-gray-500">80% active rate</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">New Signups</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">45</p>
            <p className="text-sm text-gray-500">This week</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Pro Users</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">156</p>
            <p className="text-sm text-gray-500">12.6% conversion</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">User List</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Users</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pro</option>
                </select>
                <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
                  <button 
                    onClick={handleExportUsersCSV}
                    className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition flex items-center gap-2"
                  >
                    <FaFileCsv />
                    Export CSV
                  </button>
                </ProtectedComponent>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-semibold">
                        JD
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                        <div className="text-sm text-gray-500">ID: #12345</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">john.doe@example.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pro
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 15, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewUser(12345)} className="text-[#14B8A6] hover:text-[#0d9488] mr-3">View</button>
                    <ProtectedComponent requiredPermissions={[PERMISSIONS.EDIT_ALL_USERS]}>
                      <button onClick={() => handleEditUser(12345)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    </ProtectedComponent>
                    <ProtectedComponent requiredPermissions={[PERMISSIONS.EDIT_ALL_USERS]}>
                      <button onClick={() => handleBlockUser(12345)} className="text-red-600 hover:text-red-900">Block</button>
                    </ProtectedComponent>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                        JS
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                        <div className="text-sm text-gray-500">ID: #12346</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">jane.smith@example.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Free
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Jan 12, 2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewUser(12345)} className="text-[#14B8A6] hover:text-[#0d9488] mr-3">View</button>
                    <ProtectedComponent requiredPermissions={[PERMISSIONS.EDIT_ALL_USERS]}>
                      <button onClick={() => handleEditUser(12345)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    </ProtectedComponent>
                    <ProtectedComponent requiredPermissions={[PERMISSIONS.EDIT_ALL_USERS]}>
                      <button onClick={() => handleBlockUser(12345)} className="text-red-600 hover:text-red-900">Block</button>
                    </ProtectedComponent>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of{' '}
                <span className="font-medium">1,234</span> results
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