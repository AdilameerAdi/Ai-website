import { useState } from 'react';
import { FaBars, FaTimes, FaUser, FaCog } from 'react-icons/fa';

export default function ResponsiveNavbar({ user, onLogout, navigate, currentPath = '/' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: null },
    { label: 'ConsecDesk', path: '/desk', icon: null },
    { label: 'ConsecDrive', path: '/drive', icon: null },
    { label: 'ConsecQuote', path: '/quote', icon: null },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: null });
  }

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigate('/')}
                className="text-xl font-bold text-[#14B8A6] hover:text-[#0d9488] transition"
              >
                Conseccomms
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    currentPath === item.path
                      ? 'bg-[#14B8A6] text-white'
                      : 'text-gray-600 hover:text-[#14B8A6] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                    <FaUser className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-[#14B8A6] hover:bg-gray-50 transition"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#14B8A6]">Menu</h2>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-[#14B8A6] hover:bg-gray-50 transition"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-[#14B8A6] rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {user.role && (
                <div className="text-xs text-gray-500 uppercase font-medium">
                  {user.role.replace('_', ' ')}
                </div>
              )}
            </div>
          )}

          {/* Mobile Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition ${
                  currentPath === item.path
                    ? 'bg-[#14B8A6] text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#14B8A6]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Footer */}
          {user && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  onLogout();
                  closeMobileMenu();
                }}
                className="w-full px-4 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}