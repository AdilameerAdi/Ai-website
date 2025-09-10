import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';

// Landing Page Components
import LandingPage from '../pages/LandingPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import Documentation from '../pages/Documentation';
import Security from '../pages/Security';

// User Dashboard (All apps integrated)
import UserDashboard from '../dashboard/UserDashboard';

// Admin Panel
import AdminDashboard from '../admin/AdminDashboard';
import AdminUsers from '../admin/AdminUsers';
import AdminFiles from '../admin/AdminFiles';
import AdminProposals from '../admin/AdminProposals';
import AdminLeads from '../admin/AdminLeads';
import AdminReports from '../admin/AdminReports';
import AdminFeedback from '../admin/AdminFeedback';

export default function AppRouter() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const { user, loading, isAuthenticated, login, logout, canAccessResource } = useAuth();

  // Initialize router
  useEffect(() => {
    // Get current route from URL hash or pathname
    const route = window.location.hash.slice(1) || window.location.pathname;
    setCurrentRoute(route || '/');

    // Listen for route changes
    const handleRouteChange = () => {
      const route = window.location.hash.slice(1) || window.location.pathname;
      setCurrentRoute(route || '/');
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Navigation helper
  const navigate = (path) => {
    window.location.hash = path;
    setCurrentRoute(path);
  };

  // Authentication handlers
  const handleLoginSuccess = (userData) => {
    login(userData);
    
    // Redirect based on role
    if (userData.isAdmin || userData.isSuperAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading Conseccomms...</span>
        </div>
      </div>
    );
  }

  // Route protection for admin routes
  const isAdminRoute = currentRoute.startsWith('/admin');
  const isUserRoute = ['/dashboard', '/desk', '/drive', '/quote'].includes(currentRoute);
  
  if ((isAdminRoute || isUserRoute) && !isAuthenticated) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (isAdminRoute && !canAccessResource('admin', 'access')) {
    return <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>;
  }

  // Router Component
  const Router = ({ route, user, navigate, onLogout }) => {
    const commonProps = { user, navigate, onLogout };

    switch (route) {
      // Landing & Legal Pages
      case '/':
        return <LandingPage onLoginSuccess={handleLoginSuccess} />;
      case '/privacy':
        return <PrivacyPolicy navigate={navigate} />;
      case '/terms':
        return <TermsOfService navigate={navigate} />;
      case '/documentation':
      case '/docs':
        return <Documentation navigate={navigate} />;
      case '/security':
        return <Security navigate={navigate} />;

      // User Dashboard (All functionality integrated)
      case '/dashboard':
      case '/desk':
      case '/drive':
      case '/quote':
        return <UserDashboard {...commonProps} />;

      // Admin Panel Routes
      case '/admin':
      case '/admin/dashboard':
        return <AdminDashboard {...commonProps} />;
      case '/admin/users':
        return <AdminUsers {...commonProps} />;
      case '/admin/files':
        return <AdminFiles {...commonProps} />;
      case '/admin/proposals':
        return <AdminProposals {...commonProps} />;
      case '/admin/leads':
        return <AdminLeads {...commonProps} />;
      case '/admin/reports':
        return <AdminReports {...commonProps} />;
      case '/admin/feedback':
        return <AdminFeedback {...commonProps} />;

      // 404 Not Found
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Router 
      route={currentRoute} 
      user={user}
      navigate={navigate}
      onLogout={handleLogout}
    />
  );
}