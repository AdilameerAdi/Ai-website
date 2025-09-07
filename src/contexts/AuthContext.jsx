import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, PERMISSIONS } from '../services/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        setUser(result.user);
        setError(null);
      } else {
        setUser(null);
        setError(result.error);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    setError(null);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  const hasPermission = (permission) => {
    return authService.hasPermission(user, permission);
  };

  const hasAnyPermission = (permissions) => {
    return authService.hasAnyPermission(user, permissions);
  };

  const hasAllPermissions = (permissions) => {
    return authService.hasAllPermissions(user, permissions);
  };

  const canAccessResource = (resource, action = 'view') => {
    return authService.canAccessResource(user, resource, action);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isSuperAdmin: user?.isSuperAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting components
export const ProtectedComponent = ({ 
  children, 
  fallback = null, 
  requiredPermissions = [], 
  requireAll = true,
  resource = null,
  action = 'view'
}) => {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } = useAuth();

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-32"></div>;
  }

  if (!user) {
    return fallback || <div className="text-gray-500 text-sm">Authentication required</div>;
  }

  // Check resource-based permissions
  if (resource) {
    const canAccess = canAccessResource(resource, action);
    if (!canAccess) {
      return fallback || <div className="text-red-500 text-sm">Access denied</div>;
    }
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return fallback || <div className="text-red-500 text-sm">Insufficient permissions</div>;
    }
  }

  return children;
};

// Hook for conditional rendering based on permissions
export const usePermissions = () => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } = useAuth();

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    can: {
      // User permissions
      viewOwnData: hasPermission(PERMISSIONS.VIEW_OWN_DATA),
      editOwnData: hasPermission(PERMISSIONS.EDIT_OWN_DATA),
      createProposals: hasPermission(PERMISSIONS.CREATE_PROPOSALS),
      uploadFiles: hasPermission(PERMISSIONS.UPLOAD_FILES),
      submitTickets: hasPermission(PERMISSIONS.SUBMIT_TICKETS),
      
      // Admin permissions
      viewAllUsers: hasPermission(PERMISSIONS.VIEW_ALL_USERS),
      editAllUsers: hasPermission(PERMISSIONS.EDIT_ALL_USERS),
      viewAllProposals: hasPermission(PERMISSIONS.VIEW_ALL_PROPOSALS),
      viewAllFiles: hasPermission(PERMISSIONS.VIEW_ALL_FILES),
      viewAllTickets: hasPermission(PERMISSIONS.VIEW_ALL_TICKETS),
      manageLeads: hasPermission(PERMISSIONS.MANAGE_LEADS),
      viewReports: hasPermission(PERMISSIONS.VIEW_REPORTS),
      moderateFeedback: hasPermission(PERMISSIONS.MODERATE_FEEDBACK),
      
      // Super Admin permissions
      manageAdmins: hasPermission(PERMISSIONS.MANAGE_ADMINS),
      systemConfig: hasPermission(PERMISSIONS.SYSTEM_CONFIG),
      deleteAnyData: hasPermission(PERMISSIONS.DELETE_ANY_DATA),
      viewAuditLogs: hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
      
      // Resource access
      accessAdmin: canAccessResource('admin', 'access'),
      viewProposals: canAccessResource('proposals', 'view'),
      editProposals: canAccessResource('proposals', 'edit'),
      viewFiles: canAccessResource('files', 'view'),
      editFiles: canAccessResource('files', 'edit'),
      viewTickets: canAccessResource('tickets', 'view'),
      createTickets: canAccessResource('tickets', 'create'),
      editTickets: canAccessResource('tickets', 'edit')
    }
  };
};