import { FaDownload, FaCalendar, FaChartBar, FaFileExport, FaArrowLeft } from 'react-icons/fa';
import { supabase } from "../lib/supabase"; // adjust path if needed
import React, { useEffect, useState } from "react";

export default function AdminReports({ navigate, onLogout }) {
  const [users, setUsers] = useState([]);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, subscription_plan");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  // Revenue calculation helper
  const getMonthlyRevenue = (plan) => {
    switch (plan) {
      case "pro":
        return 20;
      case "premium":
        return 50;
      default:
        return 0;
    }
  };

  // CSV Export handler
  const handleExportAll = () => {
    if (!users.length) {
      alert("No users to export.");
      return;
    }

    const headers = ["User Name", "Email", "Monthly Revenue"];
    const rows = users.map((user) => [
      user.full_name || "",
      user.email || "",
      `$${getMonthlyRevenue(user.subscription_plan)}`
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic stats (optional)
  const totalRevenue = users.reduce(
    (sum, user) => sum + getMonthlyRevenue(user.subscription_plan),
    0
  );
  const activeSubscriptions = users.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">Reports & Analytics</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button onClick={handleExportAll} className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition flex items-center justify-center gap-2">
              <FaFileExport />
              <span className="hidden sm:inline">Export All</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition self-end sm:self-auto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Example dynamic stats (replace hardcoded values if you want live ones) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Total Revenue</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">${totalRevenue}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Calculated from subscriptions</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Active Subscriptions</h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">{activeSubscriptions}</p>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">All registered users</p>
          </div>
        </div>

        {/* Keep rest of your design unchanged... */}
      </div>
    </div>
  );
}
