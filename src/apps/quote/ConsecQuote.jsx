import { useState, useEffect } from 'react';
import { FaFileAlt, FaPlus, FaEdit, FaEye, FaDownload, FaChartBar, FaHome, FaSearch, FaBrain, FaLightbulb, FaRocket, FaExclamationTriangle, FaFilePdf, FaFileCsv, FaTrash, FaTimes } from 'react-icons/fa';
import AppLayout from '../shared/AppLayout';
import { apiService } from '../../services/api.js';
import { exportService } from '../../services/exportService.js';
import { quoteService } from '../../services/quoteService.js';

export default function ConsecQuote({ user, navigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [proposalStats, setProposalStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    description: '',
    currency: 'USD',
    validUntil: '',
    termsConditions: '',
    notes: ''
  });
  const [lineItems, setLineItems] = useState([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [editingProposal, setEditingProposal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  
  
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    if (user) {
      loadProposals();
      loadProposalStats();
    }
  }, [user]);

  // Load proposals from database
  const loadProposals = async () => {
    try {
      setLoading(true);
      const result = await quoteService.getUserProposals(user.id);
      if (result.success) {
        setProposals(result.data || []);
      } else {
        console.error('Error loading proposals:', result.error);
        setProposals([]);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      setProposals([])
    } finally {
      setLoading(false);
    }
  };

  // Load proposal statistics
  const loadProposalStats = async () => {
    try {
      const result = await quoteService.getProposalStats(user.id);
      if (result.success) {
        setProposalStats(result.data);
      }
    } catch (error) {
      console.error('Error loading proposal stats:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    
    // Auto-calculate total for quantity/price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = parseFloat(updatedItems[index].quantity || 0) * parseFloat(updatedItems[index].unitPrice || 0);
    }
    
    setLineItems(updatedItems);
  };

  // Add new line item
  const addLineItem = () => {
    setLineItems([...lineItems, { name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  // Remove line item
  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Handle proposal creation/update
  const handleSubmitProposal = async (status = 'draft') => {
    if (!formData.title.trim() || !formData.clientName.trim()) {
      alert('Please fill in the required fields (Title and Client Name)');
      return;
    }

    setSubmitting(true);
    try {
      const proposalData = {
        ...formData,
        lineItems,
        status
      };

      const result = await quoteService.createProposal(proposalData, user.id);


      if (result.success) {
        alert(`Proposal ${editingProposal ? 'updated' : 'created'} successfully!`);
        resetForm();
        await loadProposals();
        await loadProposalStats();
        setActiveTab('proposals');
      } else {
        alert(`Failed to ${editingProposal ? 'update' : 'create'} proposal: ` + result.error);
      }
    } catch (error) {
      console.error('Proposal submission error:', error);
      alert(`Failed to ${editingProposal ? 'update' : 'create'} proposal`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      description: '',
      currency: 'USD',
      validUntil: '',
      termsConditions: '',
      notes: ''
    });
    setLineItems([{ name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setEditingProposal(null);
  };

  // Handle proposal editing
  const handleEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setFormData({
      title: proposal.title || '',
      clientName: proposal.client_name || proposal.client || '',
      clientEmail: proposal.client_email || '',
      clientCompany: proposal.client_company || '',
      description: proposal.description || '',
      currency: proposal.currency || 'USD',
      validUntil: proposal.valid_until ? proposal.valid_until.split('T')[0] : '',
      termsConditions: proposal.terms_conditions || '',
      notes: proposal.notes || ''
    });
    
    // Set line items from database
    if (proposal.proposal_line_items && proposal.proposal_line_items.length > 0) {
      setLineItems(proposal.proposal_line_items.map(item => ({
        name: item.item_name,
        description: item.description || '',
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unit_price),
        total: parseFloat(item.total_price)
      })));
    } else {
      // Default empty line item if no items exist
      setLineItems([{ name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
    
    setActiveTab('create');
  };

  // Handle proposal deletion
  const handleDeleteProposal = async (proposalId) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      const result = await quoteService.deleteProposal(proposalId, user.id);
      if (result.success) {
        alert('Proposal deleted successfully!');
        await loadProposals();
        await loadProposalStats();
      } else {
        alert('Failed to delete proposal: ' + result.error);
      }
    } catch (error) {
      console.error('Delete proposal error:', error);
      alert('Failed to delete proposal');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (proposalId, newStatus) => {
    try {
      const result = await quoteService.updateProposalStatus(proposalId, user.id, newStatus);
      if (result.success) {
        alert('Proposal status updated successfully!');
        await loadProposals();
        await loadProposalStats();
      } else {
        alert('Failed to update status: ' + result.error);
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProposals();
      return;
    }

    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      
      const result = await quoteService.searchProposals(user.id, searchQuery, filters);
      if (result.success) {
        setProposals(result.data);
      } else {
        console.error('Search failed:', result.error);
        alert('Search failed: ' + result.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const handleExportProposalToPDF = async (proposal) => {
    try {
      const result = await exportService.exportProposalToPDF(proposal);
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
      } else {
        alert('Failed to export PDF: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export proposal');
    }
  };

  const handleExportAllProposalsToCSV = async () => {
    try {
      const result = await exportService.exportProposalsToCSV(proposals);
      if (result.success) {
        console.log('Exported all proposals to CSV');
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export proposals');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'create', label: 'Create Quote', icon: <FaPlus /> },
    { id: 'proposals', label: 'All Proposals', icon: <FaFileAlt /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <FaBrain /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': 
      case 'viewed':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">ConsecQuote Dashboard</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Proposals</p>
                    <p className="text-3xl font-bold text-[#14B8A6] mt-2">{proposalStats.total || proposals.length}</p>
                  </div>
                  <FaFileAlt className="text-4xl text-[#14B8A6] opacity-20" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Approved</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {proposalStats.approved || proposals.filter(p => (p.status || '').toLowerCase() === 'approved').length}
                    </p>
                  </div>
                  <FaFileAlt className="text-4xl text-green-600 opacity-20" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                      {proposalStats.sent || proposals.filter(p => (p.status || '').toLowerCase() === 'pending' || (p.status || '').toLowerCase() === 'sent').length}
                    </p>
                  </div>
                  <FaFileAlt className="text-4xl text-yellow-600 opacity-20" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Value</p>
                    <p className="text-3xl font-bold text-[#14B8A6] mt-2">
                      ${proposalStats.totalValue ? Math.round(proposalStats.totalValue).toLocaleString() : '75K'}
                    </p>
                  </div>
                  <FaChartBar className="text-4xl text-[#14B8A6] opacity-20" />
                </div>
              </div>
            </div>

            {/* ConsecIQ AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaBrain className="text-2xl text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">AI Win Predictions</h3>
                </div>
                <div className="space-y-3">
                  {proposals.map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{p.title.substring(0, 20)}...</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (p.aiAnalysis?.winProbability || 75) >= 80 ? 'bg-green-100 text-green-700' :
                        (p.aiAnalysis?.winProbability || 75) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.aiAnalysis?.winProbability || 75}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Pricing Optimization</h3>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${proposals.reduce((sum, p) => sum + (p.aiAnalysis?.suggestedPricing || (p.total_amount ? p.total_amount * 1.15 : 15000)), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">AI-Suggested Total</p>
                  <p className="text-xs text-green-700 mt-2">
                    +${Math.floor(proposals.reduce((sum, p) => sum + (p.aiAnalysis?.suggestedPricing || (p.total_amount ? p.total_amount * 1.15 : 15000)), 0) - proposals.reduce((sum, p) => sum + (p.total_amount || 10000), 0)).toLocaleString()} potential increase
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaRocket className="text-2xl text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('ai-insights')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
                  >
                    View AI Analysis
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm">
                    Generate Suggestions
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm">
                    Optimize Pricing
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Proposals</h3>
              <div className="space-y-4">
                {proposals.slice(0, 3).map((proposal) => (
                  <div key={proposal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <FaFileAlt className="text-[#14B8A6] text-xl" />
                      <div>
                        <h4 className="font-medium text-gray-800">{proposal.title}</h4>
                        <p className="text-gray-500 text-sm">{proposal.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <span className="font-semibold text-gray-800">{proposal.amount}</span>
                      <button 
                        onClick={() => setSelectedProposal(proposal)}
                        className="text-[#14B8A6] hover:underline"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'create':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Proposal</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
                </h3>
                {editingProposal && (
                  <p className="text-gray-600 text-sm mt-1">
                    Editing: {editingProposal.title}
                  </p>
                )}
              </div>
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmitProposal('draft'); }}>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                      placeholder="Enter proposal title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                      placeholder="client@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Company</label>
                    <input
                      type="text"
                      name="clientCompany"
                      value={formData.clientCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                      placeholder="Company name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    placeholder="Project description and scope..."
                  ></textarea>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium text-gray-700">Line Items</label>
                    <button 
                      type="button"
                      onClick={addLineItem}
                      className="flex items-center gap-2 px-3 py-2 text-[#14B8A6] border border-[#14B8A6] rounded-lg hover:bg-[#14B8A6] hover:text-white transition"
                    >
                      <FaPlus />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#14B8A6] focus:outline-none"
                                placeholder="Item description"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#14B8A6] focus:outline-none"
                                placeholder="1"
                                min="1"
                                step="1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#14B8A6] focus:outline-none"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800">
                                ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeLineItem(index)}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                                disabled={lineItems.length === 1}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-800">
                          Total: ${lineItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                  <textarea
                    rows={3}
                    name="termsConditions"
                    value={formData.termsConditions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    placeholder="Payment terms, delivery schedule, etc..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    placeholder="Internal notes (not visible to client)..."
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSubmitProposal('sent')}
                    disabled={submitting}
                    className="px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingProposal ? 'Update & Send' : 'Create & Send'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingProposal ? 'Save Changes' : 'Save as Draft'}
                  </button>
                  {editingProposal && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        );

      case 'proposals':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">All Proposals</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportAllProposalsToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  title="Export all proposals as CSV"
                >
                  <FaFileCsv />
                  Export CSV
                </button>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                >
                  <FaPlus />
                  New Proposal
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg flex-1 max-w-md">
                <FaSearch className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="outline-none flex-1"
                />
                <button
                  onClick={handleSearch}
                  className="text-[#14B8A6] hover:text-[#0d9488] transition"
                  title="Search"
                >
                  <FaSearch />
                </button>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadProposals();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition ml-1"
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  // Auto-search when filter changes
                  if (searchQuery || e.target.value) {
                    handleSearch();
                  } else {
                    loadProposals();
                  }
                }}
                className="px-4 py-2 bg-white border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Proposals Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/6"></div></td>
                        </tr>
                      ))
                    ) : proposals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg mb-2">No proposals found</p>
                          <p className="text-gray-400 text-sm mb-4">
                            {searchQuery ? 'Try adjusting your search terms' : 'Create your first proposal to get started'}
                          </p>
                          <button 
                            onClick={() => setActiveTab('create')}
                            className="px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                          >
                            Create New Proposal
                          </button>
                        </td>
                      </tr>
                    ) : (
                      proposals.map((proposal) => {
                        const displayTitle = proposal.title || (proposal.client && proposal.amount ? `${proposal.client} - ${proposal.amount}` : 'Untitled Proposal');
                        const displayClient = proposal.client_name || proposal.client || 'Unknown Client';
                        const displayAmount = proposal.total_amount ? `$${parseFloat(proposal.total_amount).toLocaleString()}` : (proposal.amount || '$0');
                        const displayStatus = proposal.status || 'Draft';
                        const displayDate = proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : (proposal.created || new Date().toLocaleDateString());
                        
                        return (
                          <tr key={proposal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <FaFileAlt className="text-[#14B8A6]" />
                                <span className="font-medium text-gray-900">{displayTitle}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{displayClient}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{displayAmount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={displayStatus}
                                onChange={(e) => handleStatusUpdate(proposal.id, e.target.value)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${getStatusColor(displayStatus)}`}
                              >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="viewed">Viewed</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{displayDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setSelectedProposal(proposal)}
                                  className="text-[#14B8A6] hover:text-[#0d9488]"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button 
                                  onClick={() => handleEditProposal(proposal)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit Proposal"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  onClick={() => handleExportProposalToPDF(proposal)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Export as PDF"
                                >
                                  <FaFilePdf />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProposal(proposal.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Proposal"
                                >
                                  <FaTrash />
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
            </div>
          </div>
        );

      case 'ai-insights':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaBrain className="text-3xl text-purple-600" />
                <h2 className="text-3xl font-bold text-gray-800">ConsecIQ AI Insights</h2>
              </div>
              <div className="text-sm text-gray-500">Powered by Advanced AI Analytics</div>
            </div>
            
            {/* AI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaRocket className="text-2xl text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Average Win Rate</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(proposals.reduce((sum, p) => sum + (p.aiAnalysis?.winProbability || 0), 0) / proposals.length)}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Based on AI analysis</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Revenue Potential</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  +${Math.floor((proposals.reduce((sum, p) => sum + (p.aiAnalysis?.suggestedPricing || 0), 0) - 75000)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Optimization opportunity</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaExclamationTriangle className="text-2xl text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">High-Risk Proposals</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {proposals.filter(p => p.aiAnalysis?.winProbability < 70).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Need attention</p>
              </div>
            </div>

            {/* Detailed AI Analysis for Each Proposal */}
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{proposal.title}</h3>
                      <p className="text-gray-600">{proposal.client} • {proposal.amount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Win Probability</p>
                        <p className={`text-2xl font-bold ${
                          (proposal.aiAnalysis?.winProbability || 75) >= 80 ? 'text-green-600' :
                          (proposal.aiAnalysis?.winProbability || 75) >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {proposal.aiAnalysis?.winProbability || 75}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">AI Confidence</p>
                        <p className="text-2xl font-bold text-purple-600">{proposal.aiAnalysis?.confidence || 82}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaLightbulb className="text-green-600" />
                        Market Analysis
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{proposal.aiAnalysis?.marketAnalysis || 'Based on current market trends and competitor analysis, this proposal shows strong potential with favorable market conditions.'}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaRocket className="text-blue-600" />
                        AI Recommendations
                      </h4>
                      <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{proposal.aiAnalysis?.recommendations || 'Consider emphasizing unique value propositions and competitive advantages. Focus on ROI metrics and client-specific benefits to increase conversion probability.'}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaExclamationTriangle className="text-orange-600" />
                      Risk Factors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(proposal.aiAnalysis?.riskFactors || ['Timeline constraints', 'Budget sensitivity', 'Competition']).map((risk, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Current Price: <span className="font-semibold">{proposal.total_amount ? `$${proposal.total_amount.toLocaleString()}` : proposal.amount}</span></p>
                        <p className="text-sm text-gray-600">AI Suggested: <span className="font-semibold text-green-600">${(proposal.aiAnalysis?.suggestedPricing || (proposal.total_amount ? proposal.total_amount * 1.15 : 15000)).toLocaleString()}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          +${Math.floor((proposal.aiAnalysis?.suggestedPricing || (proposal.total_amount ? proposal.total_amount * 1.15 : 15000)) - (proposal.total_amount || 10000)).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Potential increase</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Proposal Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Approved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${proposalStats.total > 0 ? (proposalStats.approved / proposalStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {proposalStats.total > 0 ? Math.round((proposalStats.approved / proposalStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sent/Viewed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full" 
                          style={{ width: `${proposalStats.total > 0 ? ((proposalStats.sent + proposalStats.viewed) / proposalStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {proposalStats.total > 0 ? Math.round(((proposalStats.sent + proposalStats.viewed) / proposalStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Draft</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-gray-500 rounded-full" 
                          style={{ width: `${proposalStats.total > 0 ? (proposalStats.draft / proposalStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {proposalStats.total > 0 ? Math.round((proposalStats.draft / proposalStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rejected</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-red-500 rounded-full" 
                          style={{ width: `${proposalStats.total > 0 ? (proposalStats.rejected / proposalStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {proposalStats.total > 0 ? Math.round((proposalStats.rejected / proposalStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${proposalStats.totalValue ? Math.round(proposalStats.totalValue).toLocaleString() : '0'}
                      </p>
                    </div>
                    <FaChartBar className="text-3xl text-green-600 opacity-20" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Approved Value</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${proposalStats.approvedValue ? Math.round(proposalStats.approvedValue).toLocaleString() : '0'}
                      </p>
                    </div>
                    <FaFileAlt className="text-3xl text-blue-600 opacity-20" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Average Value</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${proposalStats.averageValue ? Math.round(proposalStats.averageValue).toLocaleString() : '0'}
                      </p>
                    </div>
                    <FaLightbulb className="text-3xl text-yellow-600 opacity-20" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {proposalStats.conversionRate ? proposalStats.conversionRate.toFixed(1) : '0'}%
                      </p>
                    </div>
                    <FaRocket className="text-3xl text-purple-600 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AppLayout
      appName="ConsecQuote"
      appIcon={<FaFileAlt />}
      user={user}
      navigate={navigate}
      onLogout={onLogout}
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
      
      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{selectedProposal.title}</h3>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{selectedProposal.client_name || selectedProposal.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-2xl text-[#14B8A6]">
                    {selectedProposal.total_amount ? `$${parseFloat(selectedProposal.total_amount).toLocaleString()}` : selectedProposal.amount}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Line Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Rate</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedProposal.proposal_line_items || selectedProposal.items || []).map((item, index) => {
                        const itemName = item.item_name || item.name;
                        const itemQuantity = item.quantity || 1;
                        const itemRate = item.unit_price || item.rate || item.unitPrice || 0;
                        const itemTotal = item.total_price || item.total || (itemQuantity * itemRate);
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2">{itemName}</td>
                            <td className="px-4 py-2">{itemQuantity}</td>
                            <td className="px-4 py-2">${parseFloat(itemRate).toLocaleString()}</td>
                            <td className="px-4 py-2 font-semibold">${parseFloat(itemTotal).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                  <FaDownload className="inline mr-2" />
                  Download PDF
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  <FaEdit className="inline mr-2" />
                  Edit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}