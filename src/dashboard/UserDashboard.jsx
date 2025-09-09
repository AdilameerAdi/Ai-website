import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaBriefcase, FaFolder, FaFileAlt, FaSignOutAlt, FaHome, FaCog, FaChartBar, FaBars, FaTimes, FaBell, FaEye, FaEyeSlash, FaShieldAlt, FaBrain, FaRobot, FaMagic, FaLightbulb } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import ResponsiveLayout, { ResponsiveGrid, ResponsiveCard, ResponsiveButton } from '../components/ResponsiveLayout';
import { QuickSearch } from '../components/SearchComponents';
import dashboardService from '../services/dashboardService';
import searchService from '../services/searchService';
import { authService } from '../services/auth';
import { aiService } from '../services/aiService';

export default function UserDashboard({ user, onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const createSampleData = async () => {
    try {
      const result = await dashboardService.createSampleData();
      if (result.success) {
        alert('Sample data created! Refresh the page to see updated counts.');
        loadDashboardStats(); // Refresh stats
      } else {
        alert('Failed to create sample data: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data');
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

  const handleLogout = async () => {
    try {
      // Log logout activity before signing out
      await authService.logout(user?.id);
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    onLogout();
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
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (settingsForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setSettingsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: settingsForm.newPassword
      });

      if (error) throw error;

      setSettingsForm({ ...settingsForm, currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully!');
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
    { id: "desk", label: "ConsecDesk", icon: <FaBriefcase /> },
    { id: "drive", label: "ConsecDrive", icon: <FaFolder /> },
    { id: "quote", label: "ConsecQuote", icon: <FaFileAlt /> },
    { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { id: "settings", label: "Settings", icon: <FaCog /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="responsive-container">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-[#14B8A6]">Conseccomms</h1>
              <span className="hidden sm:inline text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-gray-700 text-sm lg:text-base">Welcome, {user?.full_name || user?.email}</span>
              <span className="sm:hidden text-gray-700 text-sm">Hi, {user?.full_name?.split(' ')[0] || user?.email.split('@')[0]}</span>
              <ResponsiveButton
                onClick={handleLogout}
                variant="outline"
                size="small"
                className="flex items-center gap-2 hover:bg-gray-50"
              >
                <FaSignOutAlt className="text-red-500" />
                <span className="hidden sm:inline text-gray-700">Logout</span>
              </ResponsiveButton>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-16 md:top-0
        `}>
          <nav className="p-4 space-y-2 h-full overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-[#14B8A6] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
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

              {/* Database Test (Temporary - Remove after testing) */}
              {(userStats.desks === 0 && userStats.drives === 0 && userStats.quotes === 0) && (
                <ResponsiveCard className="mb-6 sm:mb-8 bg-yellow-50 border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Database Setup Test</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    All counts are showing 0. This means either:
                    <br />• The database tables don't exist yet (run FINAL_DATABASE_SETUP.sql)
                    <br />• The tables are empty (click button below to create test data)
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={createSampleData}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                    >
                      Create Test Data (Tickets + Files)
                    </button>
                    <button
                      onClick={() => window.open('https://supabase.com', '_blank')}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      Open Supabase Dashboard
                    </button>
                  </div>
                </ResponsiveCard>
              )}

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

          {/* ConsecDesk Tab */}
          {activeTab === "desk" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">ConsecDesk</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaBriefcase className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Client Management System</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Manage client tickets, track conversations, and provide support.</p>
                  <ResponsiveButton onClick={() => navigate('/desk')}>
                    Create New Ticket
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {/* ConsecDrive Tab */}
          {activeTab === "drive" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">ConsecDrive</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaFolder className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Cloud Storage</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Store, organize, and share your files securely in the cloud.</p>
                  <ResponsiveButton onClick={() => navigate('/drive')}>
                    Upload Files
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {/* ConsecQuote Tab */}
          {activeTab === "quote" && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">ConsecQuote</h2>
              <ResponsiveCard padding="large">
                <div className="text-center py-8 sm:py-12">
                  <FaFileAlt className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Quote Generation</h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">Create professional quotes and proposals for your clients.</p>
                  <ResponsiveButton onClick={() => navigate('/quote')}>
                    Generate Quote
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={settingsForm.newPassword}
                          onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
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
    </div>
  );
}