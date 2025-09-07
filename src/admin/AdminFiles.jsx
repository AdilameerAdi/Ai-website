import { useState } from 'react';
import { FaFile, FaFolder, FaDownload, FaTrash, FaEye, FaFileCsv, FaArrowLeft } from 'react-icons/fa';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';

export default function AdminFiles({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  
  // Mock files data
  const [filesData] = useState([
    { id: 1, filename: 'project-proposal.pdf', users: { first_name: 'John', last_name: 'Doe' }, file_size: 2048000, file_type: 'application/pdf', created_at: '2024-01-15T10:30:00Z' },
    { id: 2, filename: 'design-mockup.png', users: { first_name: 'Jane', last_name: 'Smith' }, file_size: 5242880, file_type: 'image/png', created_at: '2024-01-14T09:15:00Z' },
    { id: 3, filename: 'report.docx', users: { first_name: 'Mike', last_name: 'Johnson' }, file_size: 1024000, file_type: 'application/docx', created_at: '2024-01-10T11:30:00Z' }
  ]);

  const handleExportFilesCSV = async () => {
    try {
      const result = await exportService.exportReportToCSV(filesData, 'files', 'files-export.csv');
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
        alert('Files data exported successfully!');
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export files data');
    }
  };

  const handleViewFile = (fileId) => {
    alert(`View file details for ID: ${fileId}`);
  };

  const handleDownloadFile = (fileId) => {
    alert(`Download file ID: ${fileId}`);
  };

  const handleDeleteFile = (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      alert(`File ${fileId} has been deleted`);
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
            <h1 className="text-3xl font-bold text-gray-800">File Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <button 
                onClick={handleExportFilesCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Export files data as CSV"
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
            <h3 className="text-lg font-semibold text-gray-800">Total Files</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">12,543</p>
            <p className="text-sm text-gray-500">+128 this week</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Storage Used</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">2.8 TB</p>
            <p className="text-sm text-gray-500">of 10 TB capacity</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">987</p>
            <p className="text-sm text-gray-500">With files</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Avg File Size</h3>
            <p className="text-3xl font-bold text-[#14B8A6]">2.4 MB</p>
            <p className="text-sm text-gray-500">Per file</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">File Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PDFs</span>
                <span className="font-semibold text-[#14B8A6]">4,523</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Images</span>
                <span className="font-semibold text-[#14B8A6]">3,210</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documents</span>
                <span className="font-semibold text-[#14B8A6]">2,845</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Other</span>
                <span className="font-semibold text-[#14B8A6]">1,965</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Storage Usage by User Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Pro Users</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">1.8 TB (64%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Free Users</span>
                  <span className="text-sm font-semibold text-gray-500">1.0 TB (36%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Files</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Types</option>
                  <option>PDFs</option>
                  <option>Images</option>
                  <option>Documents</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFile className="text-red-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Annual Report 2024.pdf</div>
                        <div className="text-sm text-gray-500">/Business/Reports</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">john.doe@example.com</div>
                    <div className="text-sm text-gray-500">Pro User</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3.2 MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      PDF
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaEye />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaDownload />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFolder className="text-[#14B8A6] mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Project Assets</div>
                        <div className="text-sm text-gray-500">/Projects/Client Work</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">jane.smith@example.com</div>
                    <div className="text-sm text-gray-500">Free User</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    45.8 MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Folder
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#14B8A6] hover:text-[#0d9488] mr-3">
                      <FaEye />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FaDownload />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of{' '}
                <span className="font-medium">12,543</span> results
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