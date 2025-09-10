import { useState } from 'react';
import { FaSignOutAlt, FaHome, FaBriefcase, FaFolder, FaFileAlt, FaCog, FaBell, FaBars, FaTimes } from 'react-icons/fa';

export default function AppLayout({ 
  appName, 
  appIcon, 
  user, 
  navigate, 
  onLogout, 
  menuItems, 
  activeTab, 
  setActiveTab,
  onSettingsClick,
  children 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const mainApps = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaHome />, route: '/dashboard' },
    { id: 'desk', name: 'ConsecDesk', icon: <FaBriefcase />, route: '/desk' },
    { id: 'drive', name: 'ConsecDrive', icon: <FaFolder />, route: '/drive' },
    { id: 'quote', name: 'ConsecQuote', icon: <FaFileAlt />, route: '/quote' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
              </button>
              
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 w-72 sm:w-80 md:w-64 lg:w-64 xl:w-72 bg-white shadow-md border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:transition-none h-full overflow-y-auto`}>
          
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <FaTimes />
            </button>
          </div>

          {/* App Header */}
          <div className="px-4 pb-4 lg:p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#14B8A6] text-white rounded-lg flex-shrink-0">
                {appIcon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{appName}</h3>
                <p className="text-xs text-gray-500">Management Suite</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2 pb-20 lg:pb-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close mobile sidebar on selection
                }}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3 rounded-lg transition-all duration-200 min-h-[44px] ${
                  activeTab === item.id
                    ? "bg-[#14B8A6] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
              </button>
            ))}
          </nav>

        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile App Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom shadow-lg">
        <div className="flex">
          {mainApps.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(app.route)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[60px] transition-all duration-200 ${
                window.location.hash.slice(1) === app.route
                  ? 'text-[#14B8A6] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg sm:text-xl">{app.icon}</span>
              <span className="text-xs font-medium truncate leading-tight">{app.name.replace('Consec', '')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}