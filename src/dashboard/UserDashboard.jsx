import { useState } from "react";
import { FaUser, FaEnvelope, FaBriefcase, FaFolder, FaFileAlt, FaSignOutAlt, FaHome, FaCog, FaChartBar } from "react-icons/fa";
import { supabase } from "../lib/supabase";

export default function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats] = useState({
    desks: 5,
    drives: 12,
    quotes: 8
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#14B8A6]">ConsecComms</h1>
              <span className="text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.full_name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">ConsecDesk Tickets</p>
                      <p className="text-3xl font-bold text-[#14B8A6] mt-2">{userStats.desks}</p>
                    </div>
                    <FaBriefcase className="text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Files in Drive</p>
                      <p className="text-3xl font-bold text-[#14B8A6] mt-2">{userStats.drives}</p>
                    </div>
                    <FaFolder className="text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Quotes Generated</p>
                      <p className="text-3xl font-bold text-[#14B8A6] mt-2">{userStats.quotes}</p>
                    </div>
                    <FaFileAlt className="text-4xl text-[#14B8A6] opacity-20" />
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-[#14B8A6]" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{user?.full_name || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-[#14B8A6]" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ConsecDesk Tab */}
          {activeTab === "desk" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">ConsecDesk</h2>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Client Management System</h3>
                  <p className="text-gray-500">Manage client tickets, track conversations, and provide support.</p>
                  <button className="mt-6 px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                    Create New Ticket
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ConsecDrive Tab */}
          {activeTab === "drive" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">ConsecDrive</h2>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <FaFolder className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Cloud Storage</h3>
                  <p className="text-gray-500">Store, organize, and share your files securely in the cloud.</p>
                  <button className="mt-6 px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                    Upload Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ConsecQuote Tab */}
          {activeTab === "quote" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">ConsecQuote</h2>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Quote Generation</h3>
                  <p className="text-gray-500">Create professional quotes and proposals for your clients.</p>
                  <button className="mt-6 px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                    Generate Quote
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Overview</h3>
                  <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-400">Chart placeholder</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                  <ul className="space-y-3">
                    <li className="text-sm text-gray-600">• Created new ticket #1234</li>
                    <li className="text-sm text-gray-600">• Uploaded 3 files to Drive</li>
                    <li className="text-sm text-gray-600">• Generated quote for Client XYZ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.full_name}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <button className="px-6 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}