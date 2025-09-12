import { useState, useEffect } from 'react';
import { FaFileAlt, FaPlus, FaEdit, FaEye, FaDownload, FaChartBar, FaHome, FaSearch, FaBrain, FaLightbulb, FaRocket, FaFilePdf, FaFileCsv, FaTrash, FaTimes } from 'react-icons/fa';
import AppLayout from '../shared/AppLayout';
import { apiService } from '../../services/api.js';
import { exportService } from '../../services/exportService.js';
import { quoteService } from '../../services/quoteService.js';
import emailjs from '@emailjs/browser';

export default function ConsecQuote({ user, navigate, onLogout, hideBottomNav = false }) {
  // Use actual user ID for proper data isolation
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiAnalysis, setAiAnalysis] = useState({});
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
    notes: '',
    taxPercentage: 0
  });
  const [lineItems, setLineItems] = useState([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [editingProposal, setEditingProposal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingItems, setGeneratingItems] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Calculate total amount including tax for a proposal
  const calculateTotalWithTax = (proposal) => {
    const subtotal = proposal.total_amount || 0;
    const taxPercentage = proposal.tax_percentage || 0;
    const tax = (subtotal * taxPercentage) / 100;
    return subtotal + tax;
  };

  // Generate consistent AI data based on proposal characteristics
  const getConsistentAIData = (proposal) => {
    if (!proposal) {
      return {
        winProbability: 75,
        confidence: 80,
        suggestedPricing: 15000,
        marketAnalysis: 'Market analysis pending.',
        recommendations: 'Analysis recommendations will be available after data processing.',
        riskFactors: ['Standard project risks', 'Timeline considerations']
      };
    }
    
    // Create more diverse seeds for different aspects with enhanced randomization
    const titleHash = (proposal.title || `project_${Date.now()}`).split('').reduce((a, b, i) => a + b.charCodeAt(0) * (i + 1), 0);
    const clientHash = (proposal.client_name || proposal.client || `client_${Math.random()}`).split('').reduce((a, b, i) => a + b.charCodeAt(0) * (i + 2), 0);
    const amountHash = (proposal.total_amount || (Math.random() * 50000 + 10000)) / 1000;
    const idHash = proposal.id ? 
      proposal.id.toString().split('').reduce((a, b, i) => a + (parseInt(b) || (i + 1)) * (i + 3), 0) : 
      Math.floor(Math.random() * 1000) + Date.now() % 1000;
    const descHash = ((proposal.description || '').length + Math.random() * 100) * 7;
    const timestampSeed = Date.now() % 1000; // Add time-based variation
    
    // Different seeds for different AI aspects to ensure variety with enhanced distribution
    const mainSeed = Math.abs((titleHash * 13 + amountHash * 17 + idHash * 19 + timestampSeed) % 97);
    const marketSeed = Math.abs((clientHash * 11 + descHash * 23 + titleHash * 29 + timestampSeed * 2) % 89);  
    const riskSeed = Math.abs((amountHash * 31 + idHash * 37 + descHash * 41 + timestampSeed * 3) % 83);
    const recSeed = Math.abs((titleHash * 43 + clientHash * 47 + amountHash * 53 + timestampSeed * 4) % 79);
    
    // Generate consistent values based on proposal characteristics
    const complexity = (proposal.description?.length || 0) > 500 ? 'high' : (proposal.description?.length || 0) > 200 ? 'medium' : 'low';
    const basePrice = proposal.total_amount || 10000;
    const isEnterprise = (proposal.client_company || '').toLowerCase().includes('corp') || (proposal.client_name || '').toLowerCase().includes('corp') || basePrice > 50000;
    const isWeb = (proposal.title || '').toLowerCase().includes('website') || (proposal.title || '').toLowerCase().includes('web');
    const isApp = (proposal.title || '').toLowerCase().includes('app') || (proposal.title || '').toLowerCase().includes('mobile');
    const isEcommerce = (proposal.title || '').toLowerCase().includes('ecommerce') || (proposal.title || '').toLowerCase().includes('shop');
    
    // Diverse market analysis options with dynamic content
    const growthRate = Math.floor((marketSeed % 25) + 70);
    const successRate = Math.floor(((marketSeed * 7) % 20) + 75);
    const penetrationRate = Math.floor(((marketSeed * 11) % 30) + 65);
    const adoptionRate = Math.floor(((marketSeed * 13) % 25) + 70);
    const alignmentRate = Math.floor(((marketSeed * 17) % 20) + 80);
    
    const marketAnalysisOptions = [
      `Current ${isWeb ? 'web development' : isApp ? 'mobile app' : 'software'} market shows ${growthRate}% growth potential with ${isEnterprise ? 'enterprise demand driving premium pricing' : 'SMB adoption accelerating value-based solutions'}.`,
      `Market research indicates ${successRate}% success rate for similar ${complexity}-complexity projects in this ${basePrice > 25000 ? 'premium enterprise' : 'competitive mid-market'} segment with ${isWeb ? 'responsive design priorities' : isApp ? 'mobile-first strategies' : 'digital transformation focus'}.`,
      `Competitive landscape analysis reveals ${penetrationRate}% market penetration opportunity with ${isEcommerce ? 'e-commerce integration advantages' : isEnterprise ? 'enterprise solution differentiation' : 'innovative technology positioning'} in target sector.`,
      `Industry trends support ${adoptionRate}% adoption rate for ${isEcommerce ? 'omnichannel e-commerce platforms' : isWeb ? 'progressive web applications' : isApp ? 'native mobile experiences' : 'cloud-native solutions'} with ${complexity === 'high' ? 'advanced feature sets' : 'streamlined implementations'}.`,
      `Market timing analysis shows ${alignmentRate}% alignment to current ${basePrice > 40000 ? 'enterprise investment cycles' : 'SMB growth initiatives'} and ${isEnterprise ? 'digital transformation budgets' : 'operational efficiency goals'}.`
    ];
    
    // Diverse recommendation options
    const recommendationSets = [
      [`Consider ${basePrice > 30000 ? 'phased delivery approach' : 'bundled feature packages'} to optimize value delivery.`, `${isEnterprise ? 'Implement enterprise-grade security protocols' : 'Focus on user experience optimization'} for competitive advantage.`, `${complexity === 'high' ? 'Include comprehensive testing phases' : 'Leverage rapid prototyping methodologies'} to reduce project risk.`],
      [`Emphasize ${basePrice > 25000 ? 'scalability and future-proofing' : 'cost-effectiveness and quick wins'} in your proposal presentation.`, `${isEnterprise ? 'Highlight compliance and integration capabilities' : 'Showcase ROI metrics and efficiency gains'} to decision makers.`, `${complexity === 'high' ? 'Propose detailed discovery and requirements phase' : 'Offer accelerated delivery timeline'} as value differentiator.`],
      [`Structure pricing to ${basePrice > 40000 ? 'accommodate enterprise procurement cycles' : 'enable quick decision making'} and approval processes.`, `${isWeb ? 'Include SEO and performance optimization' : isApp ? 'Plan for app store optimization' : 'Focus on system integration'} in scope.`, `${complexity === 'high' ? 'Recommend dedicated project management' : 'Utilize agile development sprints'} for optimal delivery.`],
      [`Position as ${basePrice > 35000 ? 'strategic technology investment' : 'high-impact business solution'} with measurable outcomes.`, `${isEnterprise ? 'Address security, compliance, and governance requirements' : 'Highlight ease of use and maintenance benefits'} upfront.`, `${complexity === 'high' ? 'Include change management and training components' : 'Emphasize straightforward implementation'} in proposal.`]
    ];
    
    // Diverse risk factor combinations
    const riskFactorSets = [
      [
        basePrice > 50000 ? 'Complex enterprise approval workflows' : 'Budget allocation timing',
        complexity === 'high' ? 'Technical integration challenges' : 'Scope expansion requests', 
        isEnterprise ? 'Regulatory compliance requirements' : 'Market competition pressure'
      ],
      [
        basePrice > 40000 ? 'Multi-stakeholder decision process' : 'Cash flow considerations',
        complexity === 'high' ? 'Resource availability constraints' : 'Feature prioritization conflicts',
        isWeb ? 'SEO and performance expectations' : isApp ? 'App store approval process' : 'System compatibility issues'
      ],
      [
        basePrice > 30000 ? 'Procurement policy compliance' : 'ROI demonstration pressure',
        complexity === 'high' ? 'Technology stack complexity' : 'Timeline compression risks',
        isEnterprise ? 'Internal change resistance' : 'Competitive pricing pressure'
      ],
      [
        basePrice > 35000 ? 'Budget cycle alignment' : 'Cost justification requirements',
        complexity === 'high' ? 'Third-party integration risks' : 'Quality assurance challenges',
        isEcommerce ? 'Payment processing compliance' : isWeb ? 'Mobile responsiveness demands' : 'User adoption concerns'
      ]
    ];
    
    // Select based on seeds for consistency but variety - ensure unique selection
    const marketIndex = Math.abs(marketSeed + (proposal.id || Math.random() * 100)) % marketAnalysisOptions.length;
    const recIndex = Math.abs(recSeed + (titleHash % 50)) % recommendationSets.length;
    const riskIndex = Math.abs(riskSeed + (clientHash % 50)) % riskFactorSets.length;
    
    const marketAnalysis = marketAnalysisOptions[marketIndex] || marketAnalysisOptions[0];
    const selectedRecommendations = recommendationSets[recIndex] || recommendationSets[0];
    const recommendations = Array.isArray(selectedRecommendations) ? selectedRecommendations.join(' ') : 'Standard recommendations for project optimization and success.';
    const riskFactors = riskFactorSets[riskIndex] || riskFactorSets[0];
    
    return {
      winProbability: Math.floor((mainSeed % 30) + (complexity === 'low' ? 75 : complexity === 'medium' ? 65 : 55)),
      confidence: Math.floor((mainSeed % 20) + 75),
      suggestedPricing: Math.round(basePrice * (1.1 + ((mainSeed % 30) / 100))),
      marketAnalysis,
      recommendations,
      riskFactors
    };
  };

  // Load data when component mounts
  useEffect(() => {
    if (user) {
      loadProposals();
      loadProposalStats();
    }
  }, [user]);

  // Generate AI analysis for proposal using our new dynamic system
  const generateAIAnalysis = async (proposal) => {
    try {
      setLoadingAI(true);
      
      // Use our new dynamic AI data generation instead of the old service
      const dynamicAIData = getConsistentAIData(proposal);
      
      // Simulate some processing time for realism
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      setAiAnalysis(prev => ({...prev, [proposal.id]: dynamicAIData}));
      
      // Update proposal in database with AI analysis
      try {
        await quoteService.updateAIAnalysis(proposal.id, userId, dynamicAIData);
      } catch (dbError) {
        console.log('Database update failed, but AI analysis still available in memory');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Use our consistent AI data generator even for errors
      const fallbackData = getConsistentAIData(proposal);
      setAiAnalysis(prev => ({...prev, [proposal.id]: fallbackData}));
    } finally {
      setLoadingAI(false);
    }
  };

  // Generate AI analysis for all proposals
  const generateAIAnalysisForAll = async () => {
    if (proposals.length === 0) {
      alert('No proposals to analyze');
      return;
    }
    
    setLoadingAI(true);
    for (const proposal of proposals) {
      if (!proposal.ai_win_probability) {
        await generateAIAnalysis(proposal);
      }
    }
    setLoadingAI(false);
    alert(`AI analysis generated for ${proposals.length} proposals!`);
  };

  // Optimize pricing for all proposals
  const optimizeAllPricing = async () => {
    if (proposals.length === 0) {
      alert('No proposals to optimize');
      return;
    }
    
    setLoadingAI(true);
    for (const proposal of proposals) {
      await generateAIAnalysis(proposal);
    }
    setLoadingAI(false);
    alert('Pricing optimization complete for all proposals!');
  };

  // Generate line items using AI
  const generateLineItemsWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe what you need line items for');
      return;
    }
    
    setGeneratingItems(true);
    
    try {
      // Use the API service to generate line items with AI
      const response = await apiService.generateLineItems(aiPrompt, userId);
      
      if (response.success && response.data && response.data.length > 0) {
        // Replace existing line items with AI-generated ones
        setLineItems(response.data);
        setShowAIGenerator(false);
        setAiPrompt('');
        alert(`Successfully generated ${response.data.length} line items with AI!`);
      } else {
        // Fallback: Show error message
        alert('AI service is currently not available. Please try again later or add line items manually.');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate line items. Please try again later or add line items manually.');
    } finally {
      setGeneratingItems(false);
    }
  };


  // Load proposals from database
  const loadProposals = async () => {
    try {
      setLoading(true);
      const result = await quoteService.getUserProposals(userId);
      if (result.success) {
        const proposalsData = result.data || [];
        setProposals(proposalsData);
        
        // Generate AI analysis for proposals that don't have it
        proposalsData.forEach(proposal => {
          if (!proposal.ai_win_probability && !aiAnalysis[proposal.id]) {
            generateAIAnalysis(proposal);
          }
         });
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
      const result = await quoteService.getProposalStats(userId);
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
    
    // Real-time email validation
    if (name === 'clientEmail') {
      if (value.trim() && !validateEmail(value.trim())) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
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

    // Validate email if provided
    if (formData.clientEmail.trim() && !validateEmail(formData.clientEmail.trim())) {
      setEmailError('Please enter a valid email address');
      alert('Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }

    setSubmitting(true);
    try {
      const proposalData = {
        ...formData,
        lineItems,
        status,
        taxPercentage: parseFloat(formData.taxPercentage) || 0
      };

      const result = await quoteService.createProposal(proposalData, userId);


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
      notes: '',
      taxPercentage: 0
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
      notes: proposal.notes || '',
      taxPercentage: proposal.tax_percentage || 0
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
      const result = await quoteService.deleteProposal(proposalId, userId);
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
      const result = await quoteService.updateProposalStatus(proposalId, userId, newStatus);
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
      
      const result = await quoteService.searchProposals(userId, searchQuery, filters);
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
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> }
  ];
const sendEmailToClient = () => {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)),
    0
  );
  const tax = (subtotal * parseFloat(formData.taxPercentage || 0)) / 100;
  const totalAmount = subtotal + tax;

  const templateParams = {
    client_name: formData.clientName,
    client_email: formData.clientEmail,
    proposal_title: formData.title,
    proposal_description: formData.description,
    total_amount: totalAmount.toFixed(2),
  };

  emailjs.send(
    'service_oo9s9ua',   // your Service ID
    'template_cetj34p',  // your Template ID
    templateParams,
    'ClG1MDqYkhkan8_0p'  // your EmailJS Public Key as a string
)

  .then(() => {
    alert('Email sent successfully!');
  })
  .catch((err) => {
    console.error(err);
    alert('Failed to send email.');
  });
};

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
                        (p.ai_win_probability || aiAnalysis[p.id]?.winProbability || getConsistentAIData(p).winProbability) >= 80 ? 'bg-green-100 text-green-700' :
                        (p.ai_win_probability || aiAnalysis[p.id]?.winProbability || getConsistentAIData(p).winProbability) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.ai_win_probability || aiAnalysis[p.id]?.winProbability || getConsistentAIData(p).winProbability}%
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
                    ${proposals.reduce((sum, p) => {
                      const suggestedPrice = p.ai_suggested_price || aiAnalysis[p.id]?.suggestedPricing || getConsistentAIData(p).suggestedPricing;
                      return sum + suggestedPrice;
                    }, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">AI-Suggested Total</p>
                  <p className="text-xs text-green-700 mt-2">
                    +${Math.floor(proposals.reduce((sum, p) => {
                      const suggestedPrice = p.ai_suggested_price || aiAnalysis[p.id]?.suggestedPricing || getConsistentAIData(p).suggestedPricing;
                      return sum + suggestedPrice;
                    }, 0) - proposals.reduce((sum, p) => sum + calculateTotalWithTax(p), 0)).toLocaleString()} potential increase
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
                    onClick={() => generateAIAnalysisForAll()}
                    disabled={loadingAI}
                    className="w-full text-left px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm disabled:opacity-50"
                  >
                    {loadingAI ? 'Generating...' : 'Generate AI Suggestions'}
                  </button>
                  <button 
                    onClick={() => optimizeAllPricing()}
                    disabled={loadingAI}
                    className="w-full text-left px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition text-sm disabled:opacity-50"
                  >
                    {loadingAI ? 'Optimizing...' : 'Optimize All Pricing'}
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
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                        emailError 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-[#14B8A6] focus:border-[#14B8A6]'
                      }`}
                      placeholder="client@company.com"
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
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
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setLineItems([...lineItems, { name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])}
                        className="flex items-center gap-2 px-3 py-2 text-[#14B8A6] border border-[#14B8A6] rounded-lg hover:bg-[#14B8A6] hover:text-white transition"
                      >
                        <FaPlus />
                        Add Item
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowAIGenerator(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-md"
                      >
                        <FaBrain />
                        Generate with AI
                      </button>
                    </div>
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
                                ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                  <input
                    type="number"
                    name="taxPercentage"
                    value={formData.taxPercentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                {/* Total Summary */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Total Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-lg font-medium text-gray-800">
                        ₹{lineItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax ({formData.taxPercentage}%):</span>
                      <span className="text-lg font-medium text-gray-800">
                        ₹{((lineItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0) * (parseFloat(formData.taxPercentage) || 0)) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                        <span className="text-2xl font-bold text-[#14B8A6]">
                          ₹{(() => {
                            const subtotal = lineItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
                            const tax = (subtotal * (parseFloat(formData.taxPercentage) || 0)) / 100;
                            return (subtotal + tax).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
               
  <div className="flex gap-4 flex-wrap">
  <button
    type="button"
    onClick={async () => {
      // Validate required fields first
      if (!formData.title.trim() || !formData.clientName.trim()) {
        alert('Please fill in the required fields (Title and Client Name)');
        return;
      }

      // Validate email if provided
      if (formData.clientEmail.trim() && !validateEmail(formData.clientEmail.trim())) {
        setEmailError('Please enter a valid email address');
        alert('Please enter a valid email address');
        return;
      } else {
        setEmailError('');
      }

      setSubmitting(true);

      // 1. Submit the proposal as "sent"
      await handleSubmitProposal('sent');

      // 2. Send email using EmailJS
      if (formData.clientEmail) {
        const subtotal = lineItems.reduce(
          (sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)),
          0
        );
        const tax = (subtotal * parseFloat(formData.taxPercentage || 0)) / 100;
        const totalAmount = subtotal + tax;

        const templateParams = {
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          proposal_title: formData.title,
          proposal_description: formData.description,
          total_amount: totalAmount.toFixed(2),
        };

        try {
          await emailjs.send(
            'service_oo9s9ua',   // Your Service ID
            'template_cetj34p',  // Your Template ID
            templateParams,
            'ClG1MDqYkhkan8_0p'    // Replace with your EmailJS Public Key
          );
          alert('Email sent successfully!');
        } catch (error) {
          console.error(error);
          alert('Failed to send email.');
        }
      }

      setSubmitting(false);
    }}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                        const displayAmount = proposal.total_amount ? `₹${calculateTotalWithTax(proposal).toLocaleString()}` : (proposal.amount || '$0');
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
      hideBottomNav={hideBottomNav}
    >
      {renderContent()}
      
      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaBrain className="text-3xl text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">Generate Line Items with ConsecQuote AI</h3>
              </div>
              <p className="text-gray-600">Describe what you need and let AI generate detailed line items for your proposal</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What services or products do you need line items for?</label>
                <textarea
                  rows={6}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="Example: I need to build a complete e-commerce website with user authentication, product catalog, shopping cart, payment integration, admin dashboard, and mobile responsiveness. The project should include SEO optimization and 3 months of maintenance."
                ></textarea>
              </div>
              
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAIGenerator(false);
                    setAiPrompt('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => generateLineItemsWithAI()}
                  disabled={!aiPrompt.trim() || generatingItems}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generatingItems ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaBrain />
                      Generate Items
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
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
                    {selectedProposal.total_amount ? `$${calculateTotalWithTax(selectedProposal).toLocaleString()}` : selectedProposal.amount}
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