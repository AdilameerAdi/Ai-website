import { useState, useEffect } from 'react';
import { FaFile, FaFolder, FaDownload, FaTrash, FaFileCsv, FaArrowLeft } from 'react-icons/fa';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';
import adminService from '../services/adminService';

export default function AdminFiles({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  
  // State for files data
  const [filesData, setFilesData] = useState([]);
  const [fileStats, setFileStats] = useState({
    totalFiles: 0,
    storageUsed: '0 B',
    activeUsers: 0,
    avgFileSize: '0 B',
    weeklyGrowth: 0,
    typeBreakdown: { pdfs: 0, images: 0, documents: 0, other: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const filesPerPage = 10;

  // Load files data from database
  const loadFilesData = async (page = 1, search = '', filter = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const [filesResult, statsResult] = await Promise.all([
        adminService.getAllFiles(page, filesPerPage, search, filter),
        adminService.getFileStats()
      ]);
      
      if (filesResult.success) {
        setFilesData(filesResult.data);
        setTotalPages(filesResult.totalPages);
        setTotalCount(filesResult.totalCount);
        setCurrentPage(filesResult.currentPage);
      } else {
        throw new Error(filesResult.error);
      }
      
      if (statsResult.success) {
        setFileStats(statsResult.data);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount and when filters change
  useEffect(() => {
    loadFilesData(currentPage, searchTerm, filterType);
  }, [currentPage, searchTerm, filterType]);
  
  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadFilesData(1, searchTerm, filterType);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
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


  const handleDownloadFile = async (fileId) => {
    const file = filesData.find(f => f.id === fileId);
    const fileName = file?.filename || file?.original_filename || 'download';
    
    try {
      setDownloadingId(fileId);
      console.log('📥 Initiating download for file:', fileName);
      
      const result = await adminService.getFileDownloadUrl(fileId);
      
      if (result.success && result.data.file_url) {
        // Create a temporary link element for download
        const link = document.createElement('a');
        link.href = result.data.file_url;
        link.download = fileName;
        
        // For external URLs (like Supabase storage), open in new tab
        // This handles CORS and authentication issues
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ File download initiated:', fileName);
        
        // Show success notification
        alert(`Download started for "${fileName}"`);
      } else {
        console.error('Download failed:', result.error);
        alert('Failed to download file: ' + (result.error || 'File URL not available'));
      }
    } catch (error) {
      console.error('Download file error:', error);
      alert('Failed to download file: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteFile = async (fileId) => {
    const fileName = filesData.find(f => f.id === fileId)?.filename || 'this file';
    
    if (confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const result = await adminService.deleteFile(fileId);
        
        if (result.success) {
          alert('File deleted successfully!');
          // Reload the files data to reflect the deletion
          await loadFilesData(currentPage, searchTerm, filterType);
        } else {
          alert('Failed to delete file: ' + result.error);
        }
      } catch (error) {
        console.error('Delete file error:', error);
        alert('Failed to delete file: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };
  
  if (loading && filesData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#14B8A6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">File Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <button 
                onClick={handleExportFilesCSV}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Export files data as CSV"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Total Files</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{fileStats.totalFiles.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">+{fileStats.weeklyGrowth} this week</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Storage Used</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{fileStats.storageUsed}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Total storage</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Active Users</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{fileStats.activeUsers}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">With files</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Avg File Size</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{fileStats.avgFileSize}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Per file</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">File Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PDFs</span>
                <span className="font-semibold text-[#14B8A6]">{fileStats.typeBreakdown.pdfs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Images</span>
                <span className="font-semibold text-[#14B8A6]">{fileStats.typeBreakdown.images.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documents</span>
                <span className="font-semibold text-[#14B8A6]">{fileStats.typeBreakdown.documents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Other</span>
                <span className="font-semibold text-[#14B8A6]">{fileStats.typeBreakdown.other.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Storage Usage by User Type</h3>
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
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Files</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                />
                <select 
                  value={filterType}
                  onChange={handleFilterChange}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Types</option>
                  <option value="pdfs">PDFs</option>
                  <option value="images">Images</option>
                  <option value="documents">Documents</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Owner</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Modified</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                      <p>Error: {error}</p>
                      <button 
                        onClick={() => loadFilesData(currentPage, searchTerm, filterType)}
                        className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : filesData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#14B8A6] mr-2"></div>
                          Loading files...
                        </div>
                      ) : (
                        'No files found'
                      )}
                    </td>
                  </tr>
                ) : (
                  filesData.map((file) => {
                    const getFileIcon = (mimeType) => {
                      if (!mimeType) return FaFile;
                      if (mimeType === 'application/pdf') return FaFile;
                      if (mimeType.startsWith('image/')) return FaFile;
                      return FaFile;
                    };
                    
                    const getFileTypeColor = (mimeType) => {
                      if (!mimeType) return 'bg-gray-100 text-gray-800';
                      if (mimeType === 'application/pdf') return 'bg-red-100 text-red-800';
                      if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
                      if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-100 text-blue-800';
                      return 'bg-gray-100 text-gray-800';
                    };
                    
                    const getFileTypeLabel = (mimeType) => {
                      if (!mimeType) return 'Unknown';
                      if (mimeType === 'application/pdf') return 'PDF';
                      if (mimeType.startsWith('image/')) return 'Image';
                      if (mimeType.includes('document') || mimeType.includes('word')) return 'Doc';
                      return 'File';
                    };

                    const FileIcon = getFileIcon(file.mime_type);
                    
                    return (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileIcon className="text-[#14B8A6] mr-2 sm:mr-3 text-sm sm:text-base" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {file.filename || file.original_filename || 'Unknown File'}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {file.users?.email || 'unknown@example.com'}
                              </div>
                              <div className="text-xs text-gray-500 hidden sm:block">
                                {file.folder_path || '/'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900 truncate">
                            {file.users?.email || 'unknown@example.com'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {file.users?.full_name || 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          {formatFileSize(file.file_size)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.mime_type)}`}>
                            <span className="hidden sm:inline">{getFileTypeLabel(file.mime_type)}</span>
                            <span className="sm:hidden">{getFileTypeLabel(file.mime_type).charAt(0)}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          {formatTimeAgo(file.created_at)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                            <button 
                              onClick={() => handleDownloadFile(file.id)} 
                              className="text-blue-600 hover:text-blue-900 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading || downloadingId === file.id}
                              title="Download file"
                            >
                              {downloadingId === file.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 sm:hidden"></div>
                              ) : (
                                <FaDownload className="sm:hidden" />
                              )}
                              <span className="hidden sm:inline">
                                {downloadingId === file.id ? 'Downloading...' : 'Download'}
                              </span>
                            </button>
                            <button 
                              onClick={() => handleDeleteFile(file.id)} 
                              className="text-red-600 hover:text-red-900 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                              title="Delete file"
                            >
                              <FaTrash className="sm:hidden" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * filesPerPage) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * filesPerPage, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount.toLocaleString()}</span> results
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, currentPage - 2) + i;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                        pageNumber === currentPage
                          ? 'bg-[#14B8A6] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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