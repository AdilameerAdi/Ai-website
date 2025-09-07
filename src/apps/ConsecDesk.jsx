import { useState, useEffect } from 'react';
import { FaTicket, FaPlus, FaEye, FaClock, FaCheckCircle, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { ResponsiveGrid, ResponsiveCard, ResponsiveButton } from '../components/ResponsiveLayout';
import { SearchBar, SearchResults } from '../components/SearchComponents';
import { useTicketSearch } from '../hooks/useSearch';
import { supabase } from '../lib/supabase';

export default function ConsecDesk({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Search configuration
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });

  const {
    query,
    search,
    clearSearch,
    results: searchResults,
    totalCount,
    isSearching,
    isEmpty
  } = useTicketSearch(tickets, {
    maxResults: 20,
    sortBy: 'date'
  });

  // Filter configurations
  const filters = [
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ]
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      key: 'dateFrom',
      type: 'date',
      label: 'From Date'
    },
    {
      key: 'dateTo',
      type: 'date',
      label: 'To Date'
    }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date Created' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'relevance', label: 'Relevance' }
  ];

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockTickets = [
        {
          id: 1,
          title: 'Website not loading',
          description: 'The main website is showing a 500 error when trying to access the dashboard.',
          client_name: 'John Doe',
          status: 'open',
          priority: 'high',
          tags: ['website', 'error', 'urgent'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Email configuration help',
          description: 'Need help setting up email forwarding for the support team.',
          client_name: 'Jane Smith',
          status: 'in_progress',
          priority: 'medium',
          tags: ['email', 'configuration'],
          created_at: '2024-01-14T09:30:00Z',
          updated_at: '2024-01-15T08:45:00Z'
        },
        {
          id: 3,
          title: 'Login issues with mobile app',
          description: 'Users reporting they cannot login to the mobile application.',
          client_name: 'Bob Johnson',
          status: 'resolved',
          priority: 'medium',
          tags: ['mobile', 'login', 'authentication'],
          created_at: '2024-01-13T14:20:00Z',
          updated_at: '2024-01-14T16:30:00Z'
        }
      ];
      
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'medium':
        return <FaClock className="text-yellow-500" />;
      case 'low':
        return <FaClock className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const renderTicketItem = (ticket) => (
    <ResponsiveCard key={ticket.id} hover={true} className="cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getPriorityIcon(ticket.priority)}
            <h3 className="text-sm font-medium text-gray-900 truncate">
              #{ticket.id} - {ticket.title}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {ticket.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Client: {ticket.client_name}</span>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
          
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ticket.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <ResponsiveButton variant="outline" size="small">
            <FaEye className="mr-1" />
            View
          </ResponsiveButton>
        </div>
      </div>
    </ResponsiveCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">ConsecDesk</h1>
        <ResponsiveButton onClick={() => setShowCreateModal(true)}>
          <FaPlus className="mr-2" />
          New Ticket
        </ResponsiveButton>
      </div>

      {/* Search and Filters */}
      <ResponsiveCard>
        <SearchBar
          value={query}
          onChange={search}
          onClear={clearSearch}
          placeholder="Search tickets by title, description, client..."
          loading={isSearching}
          filters={filters}
          activeFilters={searchFilters}
          onFilterChange={(key, value) => setSearchFilters(prev => ({ ...prev, [key]: value }))}
          sortOptions={sortOptions}
        />
      </ResponsiveCard>

      {/* Stats Cards */}
      <ResponsiveGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }}>
        <ResponsiveCard className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {tickets.filter(t => t.status === 'open').length}
          </div>
          <div className="text-sm text-gray-600">Open</div>
        </ResponsiveCard>
        
        <ResponsiveCard className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </ResponsiveCard>
        
        <ResponsiveCard className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </ResponsiveCard>
        
        <ResponsiveCard className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {tickets.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        loading={loading}
        query={query}
        totalCount={totalCount}
        renderItem={renderTicketItem}
        emptyState={
          <ResponsiveCard className="text-center py-12">
            <FaTicket className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first support ticket</p>
            <ResponsiveButton onClick={() => setShowCreateModal(true)}>
              <FaPlus className="mr-2" />
              Create First Ticket
            </ResponsiveButton>
          </ResponsiveCard>
        }
      />
    </div>
  );
}