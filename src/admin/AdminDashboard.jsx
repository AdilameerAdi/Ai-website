import { useState, useEffect } from 'react';
import { 
  FaUsers, FaFileAlt, FaChartBar, FaServer, FaDollarSign, FaUserTie, 
  FaDownload, FaEye, FaCog, FaDatabase, FaCloudUploadAlt, FaBell,
  FaExclamationTriangle, FaCheckCircle, FaClock, FaArrowUp, FaSpinner
} from 'react-icons/fa';
import { exportService } from '../services/exportService';
import adminService from '../services/adminService';

export default function AdminDashboard({ navigate, onLogout }) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    storageUsed: '0 B',
    storageLimit: '10 TB',
    storagePercent: 0,
    activeProposals: 0,
    monthlyRevenue: 0,
    systemHealth: 98.5,
    pendingLeads: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsResult = await adminService.getDashboardStats();
      if (statsResult.success) {
        setStats(prev => ({ ...prev, ...statsResult.data }));
      } else {
        setError(statsResult.error);
      }

      // Load recent activity
      const activityResult = await adminService.getRecentActivity(8);
      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateUserActivityReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Get real user activity data for the last 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const result = await adminService.getUserActivityData(startDate.toISOString(), endDate);
      if (result.success) {
        const csvResult = await exportService.exportReportToCSV(result.data, 'user-activity', 'user-activity-report.csv');
        if (csvResult.success) {
          alert('User activity report generated and downloaded successfully!');
        } else {
          alert('Failed to generate report: ' + csvResult.error);
        }
      } else {
        alert('Failed to get user activity data: ' + result.error);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate user activity report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateFinancialSummary = async () => {
    setIsGeneratingReport(true);
    try {
      // Mock financial data
      const financialData = [
        { month: 'January 2024', revenue: 45000, subscriptions: 234, churn: 12 },
        { month: 'December 2023', revenue: 42000, subscriptions: 225, churn: 8 },
        { month: 'November 2023', revenue: 38000, subscriptions: 218, churn: 15 }
      ];
      
      const result = await exportService.exportReportToCSV(financialData, 'financial', 'financial-summary.csv');
      if (result.success) {
        alert('Financial summary generated and downloaded successfully!');
      } else {
        alert('Failed to generate financial summary: ' + result.error);
      }
    } catch (error) {
      console.error('Financial report error:', error);
      alert('Failed to generate financial summary');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateSystemPerformance = async () => {
    setIsGeneratingReport(true);
    try {
      // Mock system performance data
      const performanceData = [
        { timestamp: '2024-01-20 10:00', cpuUsage: 45.2, memoryUsage: 67.8, diskUsage: 34.5, uptime: '99.9%' },
        { timestamp: '2024-01-20 09:00', cpuUsage: 52.1, memoryUsage: 71.2, diskUsage: 34.2, uptime: '99.9%' },
        { timestamp: '2024-01-20 08:00', cpuUsage: 38.7, memoryUsage: 65.3, diskUsage: 34.0, uptime: '99.9%' }
      ];
      
      const result = await exportService.exportReportToCSV(performanceData, 'performance', 'system-performance.csv');
      if (result.success) {
        alert('System performance report generated and downloaded successfully!');
      } else {
        alert('Failed to generate performance report: ' + result.error);
      }
    } catch (error) {
      console.error('Performance report error:', error);
      alert('Failed to generate system performance report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const viewSystemLogs = () => {
    alert('Opening system logs...\n\nRecent logs:\n2024-01-20 10:30 - User login: john@example.com\n2024-01-20 10:25 - File upload: proposal.pdf\n2024-01-20 10:20 - Database backup completed');
  };

  const manageSystemSettings = () => {
    alert('System Settings:\n\n• Storage Limit: 10TB\n• Max File Size: 100MB\n• Session Timeout: 30 minutes\n• Backup Frequency: Daily\n• Maintenance Window: 2-4 AM UTC');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500 mt-2">Please wait while we load your admin data</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2 mb-6">{error}</p>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white border border-[#14B8A6] rounded-lg transition"
            >
              Refresh Data
            </button>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#14B8A6]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">↑ {stats.activeUsers} active</p>
              </div>
              <FaUsers className="text-3xl text-[#14B8A6] opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.storageUsed}</p>
                <p className="text-sm text-gray-500 mt-1">of {stats.storageLimit} ({stats.storagePercent}%)</p>
              </div>
              <FaDatabase className="text-3xl text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Proposals</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.activeProposals}</p>
                <p className="text-sm text-gray-500 mt-1">in progress</p>
              </div>
              <FaFileAlt className="text-3xl text-purple-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-gray-800">
                  ${stats.monthlyRevenue >= 1000 
                    ? `${(stats.monthlyRevenue / 1000).toFixed(1)}K` 
                    : stats.monthlyRevenue.toFixed(0)}
                </p>
                <p className={`text-sm mt-1 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth || 0)}% vs last month
                </p>
              </div>
              <FaDollarSign className="text-3xl text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* System Health & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaServer className="text-[#14B8A6]" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Health</span>
                <span className="text-green-600 font-semibold">{stats.systemHealth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.systemHealth}%`}}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>CPU: 45%</span>
                <span>Memory: 68%</span>
                <span>Disk: 34%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-yellow-500" />
              System Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <FaExclamationTriangle className="text-yellow-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Storage Warning</p>
                  <p className="text-xs text-gray-600">Storage is 75% full</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Backup Completed</p>
                  <p className="text-xs text-gray-600">Last backup: 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 4).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'proposal' ? 'bg-purple-500' :
                      activity.type === 'file' ? 'bg-green-500' :
                      activity.type === 'ticket' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reports & Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-[#14B8A6]" />
            Reports & Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={generateUserActivityReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#14B8A6] hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FaArrowUp className="text-[#14B8A6]" />
              <div className="text-left">
                <p className="font-medium text-gray-800">User Activity</p>
                <p className="text-sm text-gray-600">Generate report</p>
              </div>
            </button>
            
            <button 
              onClick={generateFinancialSummary}
              disabled={isGeneratingReport}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FaDollarSign className="text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-800">Financial Summary</p>
                <p className="text-sm text-gray-600">Revenue & metrics</p>
              </div>
            </button>
            
            <button 
              onClick={generateSystemPerformance}
              disabled={isGeneratingReport}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FaServer className="text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-gray-800">System Performance</p>
                <p className="text-sm text-gray-600">Server metrics</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-gray-50 transition"
            >
              <FaEye className="text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-gray-800">View All Reports</p>
                <p className="text-sm text-gray-600">Detailed analytics</p>
              </div>
            </button>
          </div>
        </div>

        {/* Management Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Management Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-3 p-4 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
            >
              <FaUsers />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-sm opacity-90">View & edit users</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin/leads')}
              className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaUserTie />
              <div className="text-left">
                <p className="font-medium">View Leads</p>
                <p className="text-sm opacity-90">Manage prospects</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin/files')}
              className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaCloudUploadAlt />
              <div className="text-left">
                <p className="font-medium">File Management</p>
                <p className="text-sm opacity-90">Storage & uploads</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin/proposals')}
              className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaFileAlt />
              <div className="text-left">
                <p className="font-medium">Proposals</p>
                <p className="text-sm opacity-90">Track progress</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button 
              onClick={viewSystemLogs}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FaEye className="text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">View System Logs</p>
                <p className="text-sm text-gray-600">Access logs & events</p>
              </div>
            </button>
            
            <button 
              onClick={manageSystemSettings}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FaCog className="text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">System Settings</p>
                <p className="text-sm text-gray-600">Configure system</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/admin/feedback')}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FaBell className="text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">User Feedback</p>
                <p className="text-sm text-gray-600">View & respond</p>
              </div>
            </button>
          </div>
        </div>

        {isGeneratingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#14B8A6]"></div>
                <span className="text-gray-800">Generating report...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}