import { useState, useEffect } from "react";
import {
  FaUsers,
  FaFileAlt,
  FaChartBar,
  FaServer,
  FaDollarSign,
  FaUserTie,
  FaDownload,
  FaEye,
  FaCog,
  FaDatabase,
  FaCloudUploadAlt,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaSpinner,
} from "react-icons/fa";
import { exportService } from "../services/exportService";
import adminService from "../services/adminService";
import { supabase } from "../lib/supabase"; // ✅ supabase client

export default function AdminDashboard({ navigate, onLogout }) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    // System Settings modal state
  const [sysOpen, setSysOpen] = useState(false);
  const [sysLoading, setSysLoading] = useState(false);
  const [sysErr, setSysErr] = useState(null);
  const [sysForm, setSysForm] = useState({
    storage_limit_gb: 10240, // 10 TB default
    max_file_size_mb: 100,
    session_timeout_min: 30,
    backup_frequency: "daily", // daily, weekly, monthly
    maintenance_window: "02:00-04:00 UTC",
    onboarding_enabled: true,
    alerts_email: "",
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    storageUsed: "0 B",
    storageLimit: "10 TB",
    storagePercent: 0,
    activeProposals: 0,
    monthlyRevenue: 0,
    systemHealth: 98.5,
    pendingLeads: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [logsOpen, setLogsOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsErr, setLogsErr] = useState(null);
  const [logsData, setLogsData] = useState({
    latestLogin: null,
    latestProposal: null,
    latestFile: null,
  });


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
        setStats((prev) => ({ ...prev, ...statsResult.data }));
      } else {
        setError(statsResult.error);
      }

      // Load recent activity
      const activityResult = await adminService.getRecentActivity(8);
      if (activityResult.success) {
        setRecentActivity(activityResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const generateUserActivityReport = async () => {
    setIsGeneratingReport(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const result = await adminService.getUserActivityData(
        startDate.toISOString(),
        endDate
      );
      if (result.success) {
        const csvResult = await exportService.exportReportToCSV(
          result.data,
          "user-activity",
          "user-activity-report.csv"
        );
        if (csvResult.success) {
          alert("User activity report generated and downloaded successfully!");
        } else {
          alert("Failed to generate report: " + csvResult.error);
        }
      } else {
        alert("Failed to get user activity data: " + result.error);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      alert("Failed to generate user activity report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ✅ FIXED: Monthly Revenue aggregation with correct `user_id`
  const generateFinancialSummary = async () => {
  try {
    const now = new Date();

    // ✅ Correct current month range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // ✅ Fetch users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email");

    if (usersError) throw usersError;

    // ✅ Fetch proposals created within this month
    const { data: proposals, error: proposalsError } = await supabase
      .from("proposals")
      .select("user_id, total_amount, created_at")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString());

    if (proposalsError) throw proposalsError;

    // ✅ Map user revenues
    const userRevenueMap = {};
    proposals.forEach((p) => {
      const amount = Number(p.total_amount ?? 0); // safe parse
      userRevenueMap[p.user_id] = (userRevenueMap[p.user_id] || 0) + amount;
    });

    // ✅ Build CSV summary
    const summary = users.map((u) => ({
      user_id: u.id,
      full_name: u.full_name,
      email: u.email,
      monthly_revenue: userRevenueMap[u.id] || 0,
    }));

    // ✅ Calculate total
    const totalMonthlyRevenue = summary.reduce(
      (sum, u) => sum + u.monthly_revenue,
      0
    );

    // ✅ Update stats so dashboard card shows correct revenue
    setStats((prev) => ({
      ...prev,
      monthlyRevenue: totalMonthlyRevenue,
    }));

    // ✅ Download CSV
    const csv = [
      ["User ID", "User Name", "Email", "Monthly Revenue"],
      ...summary.map((u) => [
        u.user_id,
        u.full_name,
        u.email,
        `₹${u.monthly_revenue.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "financial_summary.csv";
    link.click();
  } catch (err) {
    console.error("Financial report error:", err);
    alert("Failed to generate financial summary");
  }
};


 // Add this function inside your AdminDashboard component
const generateSystemPerformance = async () => {
  try {
    // ===============================
    // 1. USER METRICS
    // ===============================
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: newUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const { count: activeUsers } = await supabase
      .from("user_activities")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // ===============================
    // 2. PROPOSAL METRICS
    // ===============================
    const { count: totalProposals } = await supabase
      .from("proposals")
      .select("*", { count: "exact", head: true });

    const { data: proposalsByStatus } = await supabase
      .from("proposals")
      .select("status");

    const statusCounts = {};
    proposalsByStatus?.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    const { data: revenueData } = await supabase
      .from("proposals")
      .select("total_amount")
      .eq("status", "accepted");

    const totalRevenue = revenueData?.reduce(
      (sum, p) => sum + (parseFloat(p.total_amount) || 0),
      0
    ) || 0;

    // ===============================
    // 3. SYSTEM HEALTH
    // ===============================
    const { data: storageData } = await supabase
      .from("users")
      .select("storage_used, storage_limit");

    const totalUsed = storageData?.reduce(
      (sum, u) => sum + (u.storage_used || 0),
      0
    ) || 0;
    const totalAvailable = storageData?.reduce(
      (sum, u) => sum + (u.storage_limit || 0),
      0
    ) || 0;

    // ===============================
    // 4. PERFORMANCE KPIs
    // ===============================
    const { count: dau } = await supabase
      .from("user_activities")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString());

    const { count: mau } = await supabase
      .from("user_activities")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stickiness = mau ? ((dau / mau) * 100).toFixed(1) + "%" : "0%";

    // ===============================
    // 5. BUILD REPORT
    // ===============================
    const report = {
      generatedAt: new Date().toISOString(),
      users: {
        total: totalUsers || 0,
        newThisMonth: newUsers || 0,
        activeLast7Days: activeUsers || 0,
      },
      proposals: {
        total: totalProposals || 0,
        byStatus: statusCounts,
        revenue: {
          total: totalRevenue,
          currency: "USD",
        },
      },
      system: {
        storageUsed: `${(totalUsed / 1e9).toFixed(2)} GB`,
        storageLimit: `${(totalAvailable / 1e9).toFixed(2)} GB`,
        errorRate: "N/A", // Replace if you track API errors
        avgResponseTime: "N/A", // Replace if you track request times
      },
      kpis: {
        dau: dau || 0,
        mau: mau || 0,
        stickiness,
      },
    };

    // ===============================
    // 6. DOWNLOAD JSON
    // ===============================
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "system_performance_report.json";
    link.click();

    console.log("✅ System Performance Report:", report);
  } catch (err) {
    console.error("System Performance Report Error:", err);
    alert("Failed to generate system performance report");
  }
};


    const viewSystemLogs = async () => {
    try {
      setLogsOpen(true);
      setLogsLoading(true);
      setLogsErr(null);

      // 1) Latest user login
      const { data: loginRows, error: loginErr } = await supabase
        .from("user_activities")
        .select(
          "id,user_id,activity_type,description,timestamp,ip_address,user_agent,metadata,created_at"
        )
        .eq("activity_type", "login")
        .order("timestamp", { ascending: false })
        .limit(1);

      if (loginErr) throw loginErr;
      const latestLogin = loginRows?.[0] || null;

      // 2) Latest proposal
      const { data: proposalRows, error: proposalErr } = await supabase
        .from("proposals")
        .select(
          "id,user_id,proposal_number,title,client_name,client_email,client_company,description,total_amount,currency,status,ai_win_probability,ai_suggested_pricing,ai_market_analysis,ai_risk_factors,ai_recommendations,valid_until,terms_conditions,notes,sent_at,viewed_at,responded_at,created_at,updated_at"
        )
        .order("created_at", { ascending: false })
        .limit(1);

      if (proposalErr) throw proposalErr;
      const latestProposal = proposalRows?.[0] || null;

      // 3) Latest file from this folder (matches user_* prefix)
      const { data: fileRows, error: fileErr } = await supabase
        .from("files")
        .select(
          "id,user_id,filename,original_filename,file_path,file_url,file_size,file_type,mime_type,folder_id,folder_path,ai_summary,ai_keywords,ai_category,ai_priority,ai_suggested_tags,ai_confidence,ai_content_analysis,user_tags,user_description,is_favorite,upload_status,is_deleted,deleted_at,created_at,updated_at"
        )
        .ilike("file_path", "user_%")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fileErr) throw fileErr;
      const latestFile = fileRows?.[0] || null;

      setLogsData({ latestLogin, latestProposal, latestFile });
    } catch (e) {
      console.error("Failed to load logs modal data:", e);
      setLogsErr("Failed to load data");
    } finally {
      setLogsLoading(false);
    }
  };


    const manageSystemSettings = async () => {
    try {
      setSysOpen(true);
      setSysLoading(true);
      setSysErr(null);

      // Fetch latest settings row
      const { data, error } = await supabase
        .from("system_settings")
        .select(
          "id, storage_limit_gb, max_file_size_mb, session_timeout_min, backup_frequency, maintenance_window, onboarding_enabled, alerts_email, updated_at"
        )
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data[0]) {
        const row = data[0];
        setSysForm({
          storage_limit_gb: Number(row.storage_limit_gb ?? 10240),
          max_file_size_mb: Number(row.max_file_size_mb ?? 100),
          session_timeout_min: Number(row.session_timeout_min ?? 30),
          backup_frequency: row.backup_frequency || "daily",
          maintenance_window: row.maintenance_window || "02:00-04:00 UTC",
          onboarding_enabled: Boolean(row.onboarding_enabled ?? true),
          alerts_email: row.alerts_email || "",
        });
      }
    } catch (e) {
      console.error("Failed to load system settings:", e);
      setSysErr("Failed to load settings from database");
    } finally {
      setSysLoading(false);
    }
  };

    const handleSysChange = (name, value) => {
    setSysForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveSystemSettings = async () => {
    try {
      setSysLoading(true);
      setSysErr(null);

      // Basic guard rails
      const payload = {
        storage_limit_gb: Number(sysForm.storage_limit_gb) || 0,
        max_file_size_mb: Number(sysForm.max_file_size_mb) || 0,
        session_timeout_min: Number(sysForm.session_timeout_min) || 0,
        backup_frequency: sysForm.backup_frequency || "daily",
        maintenance_window: sysForm.maintenance_window || "02:00-04:00 UTC",
        onboarding_enabled: !!sysForm.onboarding_enabled,
        alerts_email: sysForm.alerts_email || "",
        updated_at: new Date().toISOString(),
      };

      // Upsert a single global row
      const { error } = await supabase
        .from("system_settings")
        .upsert([{ id: "global", ...payload }], { onConflict: "id" });

      if (error) throw error;

      // Optional: reflect anything on dashboard state
      setStats((prev) => ({
        ...prev,
        storageLimit: `${payload.storage_limit_gb / 1024} TB`,
      }));
      setSysOpen(false);
    } catch (e) {
      console.error("Failed to save system settings:", e);
      setSysErr("Failed to save settings");
    } finally {
      setSysLoading(false);
    }
  };


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Dashboard...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we load your admin data
          </p>
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Welcome back, Administrator
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={loadDashboardData}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white border border-[#14B8A6] rounded-lg transition whitespace-nowrap"
            >
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-[#14B8A6]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Users
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1 hidden sm:block">
                  ↑ {stats.activeUsers} active
                </p>
              </div>
              <FaUsers className="text-2xl sm:text-3xl text-[#14B8A6] opacity-20 ml-2" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500">
                  Storage Used
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                  {stats.storageUsed}
                </p>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                  of {stats.storageLimit} ({stats.storagePercent}%)
                </p>
              </div>
              <FaDatabase className="text-2xl sm:text-3xl text-blue-500 opacity-20 ml-2" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500">
                  Active Proposals
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                  {stats.activeProposals}
                </p>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                  in progress
                </p>
              </div>
              <FaFileAlt className="text-2xl sm:text-3xl text-purple-500 opacity-20 ml-2" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-500">
                  Monthly Revenue
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                  ₹
                  {stats.monthlyRevenue >= 1000
                    ? `${(stats.monthlyRevenue / 1000).toFixed(1)}K`
                    : stats.monthlyRevenue.toFixed(0)}
                </p>
                <p
                  className={`text-sm mt-1 hidden sm:block ${
                    stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.revenueGrowth >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(stats.revenueGrowth || 0)}% vs last month
                </p>
              </div>
              <FaDollarSign className="text-2xl sm:text-3xl text-green-500 opacity-20 ml-2" />
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
                <span className="text-green-600 font-semibold">
                  {stats.systemHealth}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
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
                  <p className="text-sm font-medium text-gray-800">
                    Storage Warning
                  </p>
                  <p className="text-xs text-gray-600">Storage is 75% full</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <FaCheckCircle className="text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Backup Completed
                  </p>
                  <p className="text-xs text-gray-600">
                    Last backup: 2 hours ago
                  </p>
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
                recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "user"
                          ? "bg-blue-500"
                          : activity.type === "proposal"
                          ? "bg-purple-500"
                          : activity.type === "file"
                          ? "bg-green-500"
                          : activity.type === "ticket"
                          ? "bg-yellow-500"
                          : activity.type === "auth"
                          ? activity.subtype === "login"
                            ? "bg-emerald-500"
                            : "bg-orange-500"
                          : activity.type === "lead"
                          ? "bg-indigo-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium text-gray-700">
                          {activity.user}
                        </span>{" "}
                        • {activity.time}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {activity.details}
                        </p>
                      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Management Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Management Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-3 p-4 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
            >
              <FaUsers />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-sm opacity-90">View & edit users</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/leads")}
              className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaUserTie />
              <div className="text-left">
                <p className="font-medium">View Leads</p>
                <p className="text-sm opacity-90">Manage prospects</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/files")}
              className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaCloudUploadAlt />
              <div className="text-left">
                <p className="font-medium">File Management</p>
                <p className="text-sm opacity-90">Storage & uploads</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/proposals")}
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
              onClick={() => navigate("/admin/feedback")}
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

              {logsOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setLogsOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Latest System Items
                </h3>
                <div className="flex items-center gap-2">
                  {logsLoading && (
                    <span className="text-sm text-gray-500">Loading...</span>
                  )}
                  <button
                    onClick={() => setLogsOpen(false)}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {logsErr && (
                  <div className="text-sm text-red-600">{logsErr}</div>
                )}

                {/* Latest Login */}
                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Latest User Login
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      login
                    </span>
                  </div>
                  {logsData.latestLogin ? (
                    <div className="mt-3 text-sm text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div>
                          <span className="text-gray-500">User ID: </span>
                          <span className="font-medium">
                            {logsData.latestLogin.user_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">At: </span>
                          <span className="font-medium">
                            {new Date(
                              logsData.latestLogin.timestamp
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500">Description: </span>
                          <span className="font-medium">
                            {logsData.latestLogin.description}
                          </span>
                        </div>
                        {logsData.latestLogin.user_agent && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">Agent: </span>
                            <span className="font-medium break-words">
                              {logsData.latestLogin.user_agent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      No login found
                    </p>
                  )}
                </div>

                {/* Latest Proposal */}
                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Latest Proposal
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      proposals
                    </span>
                  </div>
                  {logsData.latestProposal ? (
                    <div className="mt-3 text-sm text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div>
                          <span className="text-gray-500">Number: </span>
                          <span className="font-medium">
                            {logsData.latestProposal.proposal_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created: </span>
                          <span className="font-medium">
                            {new Date(
                              logsData.latestProposal.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Client: </span>
                          <span className="font-medium">
                            {logsData.latestProposal.client_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount: </span>
                          <span className="font-medium">
                            {logsData.latestProposal.currency}{" "}
                            {Number(
                              logsData.latestProposal.total_amount || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500">Title: </span>
                          <span className="font-medium">
                            {logsData.latestProposal.title}
                          </span>
                        </div>
                        {logsData.latestProposal.description && (
                          <div className="md:col-span-2">
                            <span className="text-gray-500">
                              Description:{" "}
                            </span>
                            <span className="font-medium">
                              {logsData.latestProposal.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      No proposal found
                    </p>
                  )}
                </div>

                {/* Latest File */}
                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Latest File Upload
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      files
                    </span>
                  </div>
                  {logsData.latestFile ? (
                    <div className="mt-3 text-sm text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div className="md:col-span-2">
                          <span className="text-gray-500">Filename: </span>
                          <span className="font-medium">
                            {logsData.latestFile.original_filename ||
                              logsData.latestFile.filename}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Size: </span>
                          <span className="font-medium">
                            {logsData.latestFile.file_size} bytes
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type: </span>
                          <span className="font-medium">
                            {logsData.latestFile.mime_type}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500">Uploaded: </span>
                          <span className="font-medium">
                            {new Date(
                              logsData.latestFile.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                        {logsData.latestFile.file_url && (
                          <div className="md:col-span-2">
                            <a
                              href={logsData.latestFile.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-[#14B8A6] hover:underline"
                            >
                              Open file
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      No file found
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



              {sysOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSysOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  System Settings
                </h3>
                <div className="flex items-center gap-2">
                  {sysLoading && (
                    <span className="text-sm text-gray-500">Saving...</span>
                  )}
                  <button
                    onClick={() => setSysOpen(false)}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {sysErr && <div className="text-sm text-red-600">{sysErr}</div>}

                {/* Grid form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">Storage limit (GB)</span>
                    <input
                      type="number"
                      min={0}
                      value={sysForm.storage_limit_gb}
                      onChange={(e) =>
                        handleSysChange("storage_limit_gb", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your dashboard shows {stats.storageLimit}. This field controls that.
                    </p>
                  </label>

                  <label className="block">
                    <span className="text-sm text-gray-600">Max file size (MB)</span>
                    <input
                      type="number"
                      min={0}
                      value={sysForm.max_file_size_mb}
                      onChange={(e) =>
                        handleSysChange("max_file_size_mb", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-gray-600">Session timeout (minutes)</span>
                    <input
                      type="number"
                      min={5}
                      value={sysForm.session_timeout_min}
                      onChange={(e) =>
                        handleSysChange("session_timeout_min", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-gray-600">Backup frequency</span>
                    <select
                      value={sysForm.backup_frequency}
                      onChange={(e) =>
                        handleSysChange("backup_frequency", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-sm text-gray-600">Maintenance window</span>
                    <input
                      type="text"
                      value={sysForm.maintenance_window}
                      onChange={(e) =>
                        handleSysChange("maintenance_window", e.target.value)
                      }
                      placeholder="02:00-04:00 UTC"
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                  </label>

                  <label className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={!!sysForm.onboarding_enabled}
                      onChange={(e) =>
                        handleSysChange("onboarding_enabled", e.target.checked)
                      }
                      className="rounded border-gray-300 text-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                    <span className="text-sm text-gray-700">
                      Enable new user onboarding hints
                    </span>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-sm text-gray-600">Alerts email</span>
                    <input
                      type="email"
                      value={sysForm.alerts_email}
                      onChange={(e) =>
                        handleSysChange("alerts_email", e.target.value)
                      }
                      placeholder="alerts@yourcompany.com"
                      className="mt-1 w-full rounded-lg border-gray-300 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Where to send storage warnings, failed backups, and critical alerts.
                    </p>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSysOpen(false)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSystemSettings}
                    disabled={sysLoading}
                    className="px-4 py-2 text-sm rounded-lg bg-[#14B8A6] text-white hover:bg-[#0d9488] disabled:opacity-50"
                  >
                    Save settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


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
