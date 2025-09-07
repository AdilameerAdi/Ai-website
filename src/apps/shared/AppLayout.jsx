import { FaSignOutAlt, FaHome, FaBriefcase, FaFolder, FaFileAlt, FaCog, FaBell } from 'react-icons/fa';

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
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <h1 className="text-2xl font-bold text-[#14B8A6]">Conseccomms</h1>
              </button>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-gray-400">/</span>
                <div className="flex items-center gap-2 text-gray-600">
                  {appIcon}
                  <span className="font-medium">{appName}</span>
                </div>
              </div>
            </div>

            {/* App Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {mainApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => navigate(app.route)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    window.location.hash.slice(1) === app.route
                      ? 'bg-[#14B8A6] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {app.icon}
                  <span className="hidden xl:inline">{app.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <FaBell />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.full_name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md border-r border-gray-200">
          {/* App Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#14B8A6] text-white rounded-lg">
                {appIcon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{appName}</h3>
                <p className="text-xs text-gray-500">Management Suite</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
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
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile App Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {mainApps.map((app) => (
            <button
              key={app.id}
              onClick={() => navigate(app.route)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
                window.location.hash.slice(1) === app.route
                  ? 'text-[#14B8A6]'
                  : 'text-gray-600'
              }`}
            >
              {app.icon}
              <span>{app.name.replace('Consec', '')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}