import { useState, useEffect, useRef } from "react";
import { FaUser, FaEnvelope, FaBriefcase, FaFolder, FaFileAlt, FaHome, FaCog, FaChartBar, FaBell, FaEye, FaEyeSlash, FaShieldAlt, FaBrain, FaRobot, FaMagic, FaLightbulb, FaChevronDown, FaChevronUp, FaTicketAlt, FaComment, FaUpload, FaEdit, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { ResponsiveGrid, ResponsiveCard, ResponsiveButton } from '../components/ResponsiveLayout';
import { QuickSearch } from '../components/SearchComponents';
import dashboardService from '../services/dashboardService';
import searchService from '../services/searchService';
import { aiService } from '../services/aiService';

// Import the actual app components
import ConsecDesk from '../apps/desk/ConsecDesk';
import ConsecDrive from '../apps/drive/ConsecDrive';
import ConsecQuote from '../apps/quote/ConsecQuote';

export default function UserDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const dropdownRef = useRef(null);
  const [userStats, setUserStats] = useState({
    desks: 0,
    drives: 0,
    quotes: 0,
    aiInsights: 0,
    aiAnalyzed: 0
  });
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: localStorage.getItem('notifications_email') === 'true',
    browser: localStorage.getItem('notifications_browser') === 'true',
    ticketUpdates: localStorage.getItem('notifications_tickets') === 'true',
    aiInsights: localStorage.getItem('notifications_ai') === 'true'
  });
  const [dashboardSettings, setDashboardSettings] = useState({
    autoRefresh: localStorage.getItem('dashboard_autoRefresh') === 'true',
    refreshInterval: parseInt(localStorage.getItem('dashboard_refreshInterval') || '30'),
    compactView: localStorage.getItem('dashboard_compactView') === 'true',
    darkMode: localStorage.getItem('dashboard_darkMode') === 'true'
  });
  const [privacy, setPrivacy] = useState({
    aiAnalysis: localStorage.getItem('privacy_aiAnalysis') !== 'false',
    dataSharing: localStorage.getItem('privacy_dataSharing') === 'true',
    analytics: localStorage.getItem('privacy_analytics') !== 'false'
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Load dashboard stats when component mounts
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  // Auto-refresh stats when switching to overview tab
  useEffect(() => {
    if (user && activeTab === "overview") {
      loadDashboardStats();
    }
  }, [user, activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const result = await dashboardService.getDashboardStats(user.id);
      if (result.success) {
        setUserStats(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };


  // Generate AI insights for dashboard
  const generateDashboardInsights = async () => {
    try {
      setLoadingAI(true);
      
      const result = await aiService.generateInsights({
        tickets: userStats.desks,
        files: userStats.drives,
        proposals: userStats.quotes
      }, 'user');
      
      if (result.success) {
        setAiInsights(result.insights);
        setUserStats(prev => ({
          ...prev,
          aiInsights: result.insights.length,
          aiAnalyzed: prev.drives + prev.desks + prev.quotes
        }));
      }
    } catch (error) {
      console.error('AI insights error:', error);
    } finally {
      setLoadingAI(false);
    }
  };


  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: settingsForm.fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      alert('Profile settings saved successfully!');
    } catch (error) {
      console.error('Settings update error:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate required fields are filled
    if (!settingsForm.newPassword || !settingsForm.confirmPassword) {
      alert('Please fill in the new password and confirmation fields!');
      return;
    }

    // Validate new password and confirm password match
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // Validate new password length
    if (settingsForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    // Validate current password is different from new password (if current password is provided)
    if (settingsForm.currentPassword && settingsForm.currentPassword === settingsForm.newPassword) {
      alert('New password must be different from current password!');
      return;
    }

    setSettingsLoading(true);
    try {
      // Since Supabase doesn't have a direct "verify current password" method,
      // we'll rely on the updateUser method which requires a valid session
      // If the session is invalid, it will fail appropriately
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: settingsForm.newPassword
      });

      if (updateError) {
        // Handle specific error cases
        if (updateError.message.includes('Invalid refresh token') || 
            updateError.message.includes('session') || 
            updateError.status === 401) {
          alert('Your session has expired. Please log out and log back in to change your password.');
        } else if (updateError.message.includes('Password')) {
          alert('Failed to update password. Please check your current password and try again.');
        } else {
          alert('Failed to update password: ' + updateError.message);
        }
        throw updateError;
      }

      // Clear the form
      setSettingsForm({ 
        ...settingsForm, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      });

      // Show success message
      alert('Password updated successfully! You will be logged out and need to login with your new password.');

      // Wait a moment for user to read the message, then logout
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          onLogout(); // Call the logout callback to redirect to login
        } catch (logoutError) {
          console.error('Logout error:', logoutError);
          // Force logout even if there's an error
          onLogout();
        }
      }, 2000);

    } catch (error) {
      console.error('Password update error:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    localStorage.setItem(`notifications_${key === 'ticketUpdates' ? 'tickets' : key === 'aiInsights' ? 'ai' : key}`, value.toString());
    
    if (key === 'browser' && value && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleDashboardSettingChange = (key, value) => {
    const newSettings = { ...dashboardSettings, [key]: value };
    setDashboardSettings(newSettings);
    localStorage.setItem(`dashboard_${key}`, value.toString());
  };

  const handlePrivacyChange = (key, value) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    localStorage.setItem(`privacy_${key}`, value.toString());
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: <FaHome /> },
    { 
      id: "desk", 
      label: "ConsecDesk", 
      icon: <FaBriefcase />, 
      hasDropdown: true,
      dropdownItems: [
        { id: "support-tickets", label: "Support Tickets", icon: <FaTicketAlt /> }
      ]
    },
    { 
      id: "drive", 
      label: "ConsecDrive", 
      icon: <FaFolder />, 
      hasDropdown: true,
      dropdownItems: [
        { id: "upload-files", label: "Upload Files", icon: <FaUpload /> }
      ]
    },
    { 
      id: "quote", 
      label: "ConsecQuote", 
      icon: <FaFileAlt />, 
      hasDropdown: true,
      dropdownItems: [
        { id: "create-quote", label: "Create Quote", icon: <FaPlus /> }
      ]
    },
    { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { id: "settings", label: "Settings", icon: <FaCog /> }
  ];

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleDropdownToggle = (itemId, event) => {
    if (openDropdown === itemId) {
      setOpenDropdown(null);
    } else {
      // Calculate position for fixed positioning
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
      setOpenDropdown(itemId);
    }
  };

  const handleDropdownItemClick = (parentId, itemId) => {
    console.log(`Clicked ${parentId} -> ${itemId}`);
    // Handle specific dropdown item actions here
    switch(parentId) {
      case 'desk':
        handleDeskAction(itemId);
        break;
      case 'drive':
        handleDriveAction(itemId);
        break;
      case 'quote':
        handleQuoteAction(itemId);
        break;
    }
    setOpenDropdown(null);
  };

  const handleDeskAction = (actionId) => {
    switch(actionId) {
      case 'support-tickets':
        // Show full ConsecDesk app within UserDashboard
        setActiveTab('desk-full');
        break;
      case 'consec-iq':
        // Show ConsecIQ insights within dashboard
        setActiveTab('desk-insights');
        break;
      case 'notifications':
        // Show notifications within dashboard
        setActiveTab('desk-notifications');
        break;
      case 'feedback':
        // Show feedback form within dashboard
        setActiveTab('desk-feedback');
        break;
    }
  };

  const handleDriveAction = (actionId) => {
    switch(actionId) {
      case 'upload-files':
      case 'my-files':
      case 'shared-files':
      case 'recent-files':
        // Show full ConsecDrive app within UserDashboard
        setActiveTab('drive-full');
        break;
    }
  };

  const handleQuoteAction = (actionId) => {
    switch(actionId) {
      case 'create-quote':
      case 'my-quotes':
      case 'templates':
      case 'analytics-quotes':
        // Show full ConsecQuote app within UserDashboard
        setActiveTab('quote-full');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="responsive-container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#14B8A6]">Conseccomms</h1>
              <span className="hidden sm:inline text-gray-400">/</span>
              <span className="hidden sm:inline text-gray-600 font-medium">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.user_metadata?.full_name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm touch-friendly"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200 relative z-[100]">
        <div className="responsive-container">
          <div className="flex gap-1 p-2 overflow-x-auto" ref={dropdownRef}>
            {menuItems.map((item) => (
              <div key={item.id} className="relative z-[110]">
                {item.hasDropdown ? (
                  <div className="relative group flex">
                    {/* Main button that navigates to the app */}
                    <button
                      onClick={() => {
                        // Direct navigation to the main app
                        switch(item.id) {
                          case 'desk':
                            setActiveTab('desk-full');
                            break;
                          case 'drive':
                            setActiveTab('drive-full');
                            break;
                          case 'quote':
                            setActiveTab('quote-full');
                            break;
                          default:
                            setActiveTab(item.id);
                        }
                        setOpenDropdown(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-l-lg transition whitespace-nowrap flex-1 ${
                        activeTab === item.id || activeTab.startsWith(item.id)
                          ? "bg-[#14B8A6] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                    {/* Dropdown toggle button */}
                    <button
                      onClick={(e) => handleDropdownToggle(item.id, e)}
                      className={`px-2 py-2 rounded-r-lg transition border-l ${
                        activeTab === item.id || activeTab.startsWith(item.id)
                          ? "bg-[#14B8A6] text-white border-white/20"
                          : "text-gray-700 hover:bg-gray-100 border-gray-300"
                      }`}
                    >
                      <span className="text-sm">
                        {openDropdown === item.id ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setOpenDropdown(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                      activeTab === item.id
                        ? "bg-[#14B8A6] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Dropdown Menu - rendered outside navigation container */}
      {openDropdown && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-48 z-[9999] max-h-64 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          {menuItems.find(item => item.id === openDropdown)?.dropdownItems.map((dropdownItem) => (
            <button
              key={dropdownItem.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDropdownItemClick(openDropdown, dropdownItem.id);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm text-left"
            >
              <span>{dropdownItem.icon}</span>
              <span>{dropdownItem.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex h-[calc(100vh-8rem)] relative overflow-visible">
        {/* Main Content - Full Width */}
        <main className="flex-1 overflow-auto mobile-scroll">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 pb-20 md:pb-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h2>
              </div>
              
              {/* Stats Cards */}
              <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} className="mb-6 sm:mb-8">
                <ResponsiveCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">ConsecDesk Tickets</p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] mt-1 sm:mt-2">
                        {statsLoading ? '...' : userStats.desks}
                      </p>
                    </div>
                    <FaBriefcase className="text-3xl sm:text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </ResponsiveCard>
                
                <ResponsiveCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">Files in Drive</p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] mt-1 sm:mt-2">
                        {statsLoading ? '...' : userStats.drives}
                      </p>
                    </div>
                    <FaFolder className="text-3xl sm:text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </ResponsiveCard>
                
                <ResponsiveCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm">Quotes Generated</p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] mt-1 sm:mt-2">
                        {statsLoading ? '...' : userStats.quotes}
                      </p>
                    </div>
                    <FaFileAlt className="text-3xl sm:text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </ResponsiveCard>
              </ResponsiveGrid>

              {/* AI Insights Section */}
              <ResponsiveCard className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FaBrain className="text-2xl text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-800">AI Insights Dashboard</h3>
                  </div>
                  <button
                    onClick={generateDashboardInsights}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <FaMagic className="text-sm" />
                    {loadingAI ? 'Generating...' : 'Generate Insights'}
                  </button>
                </div>
                
                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} className="mb-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FaRobot className="text-3xl text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{userStats.aiAnalyzed}</p>
                    <p className="text-sm text-gray-600">Files Analyzed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FaLightbulb className="text-3xl text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{userStats.aiInsights}</p>
                    <p className="text-sm text-gray-600">AI Insights</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FaChartBar className="text-3xl text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">94%</p>
                    <p className="text-sm text-gray-600">AI Accuracy</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <FaBriefcase className="text-3xl text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">12</p>
                    <p className="text-sm text-gray-600">Smart Replies</p>
                  </div>
                </ResponsiveGrid>
                
                {aiInsights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Recent AI Insights:</h4>
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <FaLightbulb className="text-yellow-500 mt-1" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ResponsiveCard>

              

              {/* Quick Search */}
              <ResponsiveCard className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Quick Search</h3>
                <QuickSearch
                  placeholder="Search tickets, files, proposals..."
                  searchService={searchService}
                  onResultSelect={(result) => {
                    // Handle navigation based on result type
                    switch(result.type) {
                      case 'ticket':
                        setActiveTab('desk');
                        break;
                      case 'file':
                        setActiveTab('drive');
                        break;
                      case 'proposal':
                        setActiveTab('quote');
                        break;
                      default:
                        break;
                    }
                  }}
                />
              </ResponsiveCard>

              {/* User Info Card */}
              <ResponsiveCard>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Account Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <FaUser className="text-[#14B8A6] flex-shrink-0" />
                    <span className="text-gray-600 text-sm sm:text-base">Name:</span>
                    <span className="font-medium text-sm sm:text-base break-all">{user?.full_name || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <FaEnvelope className="text-[#14B8A6] flex-shrink-0" />
                    <span className="text-gray-600 text-sm sm:text-base">Email:</span>
                    <span className="font-medium text-sm sm:text-base break-all">{user?.email}</span>
                  </div>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {/* ConsecDesk Dropdown Views */}
          {activeTab === "desk-insights" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">ConsecIQ Insights</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaBrain className="text-4xl sm:text-6xl text-purple-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">View intelligent insights and analytics for your support desk.</p>
                  <ResponsiveButton onClick={generateDashboardInsights} disabled={loadingAI}>
                    {loadingAI ? 'Generating...' : 'Generate AI Insights'}
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {activeTab === "desk-notifications" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Notifications</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaBell className="text-4xl sm:text-6xl text-blue-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Notification Center</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">View and manage your notifications and alerts.</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-left">
                      <p className="text-sm text-gray-700">No new notifications</p>
                    </div>
                  </div>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {activeTab === "desk-feedback" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Feedback</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaComment className="text-4xl sm:text-6xl text-green-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Send Feedback</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Share your feedback and suggestions with us.</p>
                  <div className="max-w-md mx-auto">
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows="4"
                      placeholder="Your feedback..."
                    ></textarea>
                    <ResponsiveButton className="mt-3">
                      Send Feedback
                    </ResponsiveButton>
                  </div>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {/* Full ConsecDesk App */}
          {activeTab === "desk-full" && (
            <div className="w-full -m-4 sm:-m-6 lg:-m-8">
              <div className="overflow-hidden">
                <ConsecDesk user={user} navigate={navigate} onLogout={onLogout} hideBottomNav={true} />
              </div>
            </div>
          )}

          {/* Full ConsecDrive App */}
          {activeTab === "drive-full" && (
            <div className="w-full -m-4 sm:-m-6 lg:-m-8">
              <div className="overflow-hidden">
                <ConsecDrive user={user} navigate={navigate} onLogout={onLogout} hideBottomNav={true} />
              </div>
            </div>
          )}

          {/* Full ConsecQuote App */}
          {activeTab === "quote-full" && (
            <div className="w-full -m-4 sm:-m-6 lg:-m-8">
              <div className="overflow-hidden">
                <ConsecQuote user={user} navigate={navigate} onLogout={onLogout} hideBottomNav={true} />
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Analytics</h2>
              <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
                <ResponsiveCard>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Activity Overview</h3>
                  <div className="h-40 sm:h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-400 text-sm sm:text-base">Chart placeholder</p>
                  </div>
                </ResponsiveCard>
                <ResponsiveCard>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Recent Activity</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="text-xs sm:text-sm text-gray-600">• Created new ticket #1234</li>
                    <li className="text-xs sm:text-sm text-gray-600">• Uploaded 3 files to Drive</li>
                    <li className="text-xs sm:text-sm text-gray-600">• Generated quote for Client XYZ</li>
                  </ul>
                </ResponsiveCard>
              </ResponsiveGrid>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Settings</h2>
              
              {/* Settings Navigation */}
              <div className="mb-6">
                <div className="flex overflow-x-auto gap-2 border-b border-gray-200 -mb-px">
                  {[
                    { id: 'profile', label: 'Profile', icon: <FaUser /> },
                    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
                    { id: 'dashboard', label: 'Dashboard', icon: <FaCog /> },
                    { id: 'privacy', label: 'Privacy', icon: <FaShieldAlt /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                        activeSettingsTab === tab.id
                          ? 'border-[#14B8A6] text-[#14B8A6]'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <span className="flex-shrink-0">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Settings */}
              {activeSettingsTab === 'profile' && (
                <div className="space-y-6">
                  <ResponsiveCard>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={settingsForm.fullName}
                          onChange={(e) => setSettingsForm({...settingsForm, fullName: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          disabled
                          className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if you need to update your email.</p>
                      </div>
                      <ResponsiveButton 
                        size="medium" 
                        onClick={handleSaveSettings}
                        disabled={settingsLoading}
                      >
                        {settingsLoading ? 'Saving...' : 'Save Profile'}
                      </ResponsiveButton>
                    </div>
                  </ResponsiveCard>

                  <ResponsiveCard>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password <span className="text-gray-500">(optional for verification)</span></label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={settingsForm.currentPassword}
                            onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
                            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={settingsForm.newPassword}
                          onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={settingsForm.confirmPassword}
                          onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <ResponsiveButton 
                        size="medium" 
                        onClick={handlePasswordChange}
                        disabled={settingsLoading || !settingsForm.newPassword || !settingsForm.confirmPassword}
                      >
                        {settingsLoading ? 'Updating...' : 'Update Password'}
                      </ResponsiveButton>
                    </div>
                  </ResponsiveCard>
                </div>
              )}

              {/* Notification Settings */}
              {activeSettingsTab === 'notifications' && (
                <ResponsiveCard>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Notification Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Browser Notifications</h4>
                        <p className="text-sm text-gray-500">Show desktop notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.browser}
                          onChange={(e) => handleNotificationChange('browser', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Ticket Updates</h4>
                        <p className="text-sm text-gray-500">Notifications for ticket status changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.ticketUpdates}
                          onChange={(e) => handleNotificationChange('ticketUpdates', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="font-medium text-gray-900">AI Insights</h4>
                        <p className="text-sm text-gray-500">Notifications for AI analysis and suggestions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.aiInsights}
                          onChange={(e) => handleNotificationChange('aiInsights', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                  </div>
                </ResponsiveCard>
              )}

              {/* Dashboard Settings */}
              {activeSettingsTab === 'dashboard' && (
                <ResponsiveCard>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Dashboard Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Auto Refresh</h4>
                        <p className="text-sm text-gray-500">Automatically refresh dashboard data</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dashboardSettings.autoRefresh}
                          onChange={(e) => handleDashboardSettingChange('autoRefresh', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    {dashboardSettings.autoRefresh && (
                      <div className="py-4 border-b border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval (seconds)</label>
                        <select
                          value={dashboardSettings.refreshInterval}
                          onChange={(e) => handleDashboardSettingChange('refreshInterval', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                        >
                          <option value={15}>15 seconds</option>
                          <option value={30}>30 seconds</option>
                          <option value={60}>1 minute</option>
                          <option value={300}>5 minutes</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Compact View</h4>
                        <p className="text-sm text-gray-500">Use smaller cards and compact layout</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dashboardSettings.compactView}
                          onChange={(e) => handleDashboardSettingChange('compactView', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Dark Mode</h4>
                        <p className="text-sm text-gray-500">Use dark theme (coming soon)</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dashboardSettings.darkMode}
                          onChange={(e) => handleDashboardSettingChange('darkMode', e.target.checked)}
                          className="sr-only peer"
                          disabled
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6] opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </ResponsiveCard>
              )}

              {/* Privacy Settings */}
              {activeSettingsTab === 'privacy' && (
                <ResponsiveCard>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Privacy & Security</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">AI Analysis</h4>
                        <p className="text-sm text-gray-500">Allow AI to analyze your content for insights</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.aiAnalysis}
                          onChange={(e) => handlePrivacyChange('aiAnalysis', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Data Sharing</h4>
                        <p className="text-sm text-gray-500">Share anonymized data to improve services</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.dataSharing}
                          onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Usage Analytics</h4>
                        <p className="text-sm text-gray-500">Allow collection of usage statistics</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.analytics}
                          onChange={(e) => handlePrivacyChange('analytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#14B8A6]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#14B8A6]"></div>
                      </label>
                    </div>
                  </div>
                </ResponsiveCard>
              )}
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom shadow-lg">
        <div className="flex min-h-[60px]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs touch-friendly ${
              activeTab === 'overview' ? 'text-[#14B8A6]' : 'text-gray-600'
            }`}
          >
            <FaHome className="text-lg" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('desk-full')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs touch-friendly ${
              activeTab.includes('desk') ? 'text-[#14B8A6]' : 'text-gray-600'
            }`}
          >
            <FaBriefcase className="text-lg" />
            <span>Desk</span>
          </button>
          
          <button
            onClick={() => setActiveTab('drive-full')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs touch-friendly ${
              activeTab.includes('drive') ? 'text-[#14B8A6]' : 'text-gray-600'
            }`}
          >
            <FaFolder className="text-lg" />
            <span>Drive</span>
          </button>
          
          <button
            onClick={() => setActiveTab('quote-full')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs touch-friendly ${
              activeTab.includes('quote') ? 'text-[#14B8A6]' : 'text-gray-600'
            }`}
          >
            <FaFileAlt className="text-lg" />
            <span>Quote</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs touch-friendly ${
              activeTab === 'settings' ? 'text-[#14B8A6]' : 'text-gray-600'
            }`}
          >
            <FaCog className="text-lg" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}