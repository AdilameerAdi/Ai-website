import { useState, useEffect } from "react";
import { useAuth, ProtectedComponent } from "../contexts/AuthContext";
import { PERMISSIONS } from "../services/auth";
import { exportService } from "../services/exportService";
import { FaFileCsv, FaArrowLeft, FaTrash } from "react-icons/fa";
import { supabase } from "../lib/supabase"; // ✅ fix import

export default function AdminUsers({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select(
            "id, full_name, email, role, subscription_status, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsersData(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Export CSV
  const handleExportUsersCSV = async () => {
    try {
      const result = await exportService.exportReportToCSV(
        usersData,
        "users",
        "users-export.csv"
      );
      if (result.success) {
        alert("Users data exported successfully!");
      } else {
        alert("Failed to export CSV: " + result.error);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export users data");
    }
  };

  // ✅ Delete user (after confirmation)
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsersData(usersData.filter((u) => u.id !== selectedUser.id));
      setShowPopup(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-[#14B8A6] hover:bg-gray-100 rounded-lg transition whitespace-nowrap"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
              User Management
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition self-end sm:self-auto"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Total Users
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-[#14B8A6] truncate">
              {usersData.length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                User List
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none w-full sm:w-auto"
                />
                <ProtectedComponent
                  requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}
                >
                  <button
                    onClick={handleExportUsersCSV}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition flex items-center gap-2 justify-center w-full sm:w-auto"
                  >
                    <FaFileCsv />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                </ProtectedComponent>
              </div>
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : usersData.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No users found.
              </div>
            ) : (
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {u.full_name?.[0]}
                          </div>
                          <div className="ml-2 sm:ml-4 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              {u.full_name}
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              ID: #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900 truncate">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            u.subscription_status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowPopup(true);
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedUser?.full_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
