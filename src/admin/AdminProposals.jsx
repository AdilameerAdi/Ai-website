import { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';
import { exportService } from '../services/exportService';
import adminService from '../services/adminService';

export default function AdminProposals({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  
  // State for proposals data
  const [proposalsData, setProposalsData] = useState([]);
  const [proposalStats, setProposalStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    wonThisMonth: 0,
    wonValue: '$0',
    winRate: 0,
    monthlyProposals: 0,
    statusBreakdown: { draft: 0, sent: 0, 'under review': 0, won: 0, lost: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const proposalsPerPage = 10;
  
  // Load proposals data from database
  const loadProposalsData = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const [proposalsResult, statsResult] = await Promise.all([
        adminService.getAllProposals(page, proposalsPerPage, search, status),
        adminService.getProposalStats()
      ]);
      
      if (proposalsResult.success) {
        setProposalsData(proposalsResult.data);
        setTotalPages(proposalsResult.totalPages);
        setTotalCount(proposalsResult.totalCount);
        setCurrentPage(proposalsResult.currentPage);
      } else {
        throw new Error(proposalsResult.error);
      }
      
      if (statsResult.success) {
        setProposalStats(statsResult.data);
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError('Failed to load proposals data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount and when filters change
  useEffect(() => {
    loadProposalsData(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);
  
  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadProposalsData(1, searchTerm, statusFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  const handleDownloadProposal = async (proposalId) => {
    try {
      setDownloadingId(proposalId);
      const result = await adminService.generateProposalDownload(proposalId);
      
      if (result.success) {
        // Generate and download PDF
        const proposalData = result.data;
        const fileName = `${proposalData.proposal_number || 'Proposal'}_${proposalData.client_name || 'Client'}.json`;
        
        // Create downloadable JSON file (you can modify this to generate PDF)
        const dataStr = JSON.stringify(proposalData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`Proposal downloaded: ${fileName}`);
      } else {
        alert('Failed to download proposal: ' + result.error);
      }
    } catch (error) {
      console.error('Download proposal error:', error);
      alert('Failed to download proposal: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };
  
  const handleDeleteProposal = async (proposalId) => {
    const proposal = proposalsData.find(p => p.id === proposalId);
    const proposalName = proposal?.title || 'this proposal';
    
    if (confirm(`Are you sure you want to delete "${proposalName}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const result = await adminService.deleteProposal(proposalId);
        
        if (result.success) {
          alert('Proposal deleted successfully!');
          // Reload the proposals data
          await loadProposalsData(currentPage, searchTerm, statusFilter);
        } else {
          alert('Failed to delete proposal: ' + result.error);
        }
      } catch (error) {
        console.error('Delete proposal error:', error);
        alert('Failed to delete proposal: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const formatCurrency = (amount, currency = 'inr') => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading && proposalsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#14B8A6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">Proposal Management</h1>
          </div>
          <button 
            onClick={onLogout}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition self-end sm:self-auto"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Total Proposals</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{proposalStats.totalProposals.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">+{proposalStats.monthlyProposals} this month</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Active Proposals</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{proposalStats.activeProposals}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">In progress</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Won This Month</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 truncate">{proposalStats.wonThisMonth}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{proposalStats.wonValue} value</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Win Rate</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{proposalStats.winRate}%</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Success rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Draft</span>
                <span className="font-semibold text-gray-500">{proposalStats.statusBreakdown.draft}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sent</span>
                <span className="font-semibold text-blue-600">{proposalStats.statusBreakdown.sent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Under Review</span>
                <span className="font-semibold text-yellow-600">{proposalStats.statusBreakdown['under review'] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Won</span>
                <span className="font-semibold text-green-600">{proposalStats.statusBreakdown.won + (proposalStats.statusBreakdown.accepted || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lost</span>
                <span className="font-semibold text-red-600">{proposalStats.statusBreakdown.lost + (proposalStats.statusBreakdown.rejected || 0)}</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Monthly Proposal Value</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">January 2024</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">₹245K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">December 2023</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">₹189K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">November 2023</span>
                  <span className="text-sm font-semibold text-[#14B8A6]">₹312K</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#14B8A6] h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Proposals</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                />
                <select 
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="under review">Under Review</option>
                  <option value="won">Won</option>
                  <option value="accepted">Accepted</option>
                  <option value="lost">Lost</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Client</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Value</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                      <p>Error: {error}</p>
                      <button 
                        onClick={() => loadProposalsData(currentPage, searchTerm, statusFilter)}
                        className="mt-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : proposalsData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#14B8A6] mr-2"></div>
                          Loading proposals...
                        </div>
                      ) : (
                        'No proposals found'
                      )}
                    </td>
                  </tr>
                ) : (
                  proposalsData.map((proposal) => {
                    const getStatusColor = (status) => {
                      const statusLower = (status || 'draft').toLowerCase();
                      switch (statusLower) {
                        case 'draft': return 'bg-gray-100 text-gray-800';
                        case 'sent': return 'bg-blue-100 text-blue-800';
                        case 'under review': return 'bg-yellow-100 text-yellow-800';
                        case 'won':
                        case 'accepted': return 'bg-green-100 text-green-800';
                        case 'lost':
                        case 'rejected': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };
                    
                    const getStatusLabel = (status) => {
                      const statusLower = (status || 'draft').toLowerCase();
                      switch (statusLower) {
                        case 'under review': return 'Review';
                        case 'won': return 'Won';
                        case 'lost': return 'Lost';
                        case 'accepted': return 'Won';
                        case 'rejected': return 'Lost';
                        default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft';
                      }
                    };
                    
                    return (
                      <tr key={proposal.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaFileAlt className="text-blue-500 mr-2 sm:mr-3 text-sm sm:text-base" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {proposal.title || 'Untitled Proposal'}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {proposal.client_company || proposal.client_name} • {formatCurrency(proposal.total_amount, proposal.currency)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                {proposal.proposal_number || 'No Number'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-xs sm:text-sm text-gray-900 truncate">
                            {proposal.client_company || proposal.client_name || 'Unknown Client'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {proposal.client_email || 'No email'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 hidden md:table-cell">
                          {formatCurrency(proposal.total_amount, proposal.currency)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                            <span className="hidden sm:inline">{getStatusLabel(proposal.status)}</span>
                            <span className="sm:hidden">{getStatusLabel(proposal.status).charAt(0)}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          {formatDate(proposal.created_at)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                            <button 
                              onClick={() => handleDownloadProposal(proposal.id)}
                              className="text-blue-600 hover:text-blue-900 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading || downloadingId === proposal.id}
                              title="Download proposal"
                            >
                              {downloadingId === proposal.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 sm:hidden"></div>
                              ) : (
                                <FaDownload className="sm:hidden" />
                              )}
                              <span className="hidden sm:inline">
                                {downloadingId === proposal.id ? 'Downloading...' : 'Download'}
                              </span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProposal(proposal.id)}
                              className="text-red-600 hover:text-red-900 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading}
                              title="Delete proposal"
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
                Showing <span className="font-medium">{((currentPage - 1) * proposalsPerPage) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * proposalsPerPage, totalCount)}</span> of{' '}
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