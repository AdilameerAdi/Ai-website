import { supabase } from '../lib/supabase.js';

// Role definitions
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Permission definitions
export const PERMISSIONS = {
  // User permissions
  VIEW_OWN_DATA: 'view_own_data',
  EDIT_OWN_DATA: 'edit_own_data',
  CREATE_PROPOSALS: 'create_proposals',
  UPLOAD_FILES: 'upload_files',
  SUBMIT_TICKETS: 'submit_tickets',
  
  // Admin permissions
  VIEW_ALL_USERS: 'view_all_users',
  EDIT_ALL_USERS: 'edit_all_users',
  VIEW_ALL_PROPOSALS: 'view_all_proposals',
  VIEW_ALL_FILES: 'view_all_files',
  VIEW_ALL_TICKETS: 'view_all_tickets',
  MANAGE_LEADS: 'manage_leads',
  VIEW_REPORTS: 'view_reports',
  MODERATE_FEEDBACK: 'moderate_feedback',
  
  // Super Admin permissions
  MANAGE_ADMINS: 'manage_admins',
  SYSTEM_CONFIG: 'system_config',
  DELETE_ANY_DATA: 'delete_any_data',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
};

// Define base permissions for each role
const USER_PERMISSIONS = [
  PERMISSIONS.VIEW_OWN_DATA,
  PERMISSIONS.EDIT_OWN_DATA,
  PERMISSIONS.CREATE_PROPOSALS,
  PERMISSIONS.UPLOAD_FILES,
  PERMISSIONS.SUBMIT_TICKETS
];

const ADMIN_PERMISSIONS = [
  ...USER_PERMISSIONS,
  PERMISSIONS.VIEW_ALL_USERS,
  PERMISSIONS.EDIT_ALL_USERS,
  PERMISSIONS.VIEW_ALL_PROPOSALS,
  PERMISSIONS.VIEW_ALL_FILES,
  PERMISSIONS.VIEW_ALL_TICKETS,
  PERMISSIONS.MANAGE_LEADS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.MODERATE_FEEDBACK
];

// Role-permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.USER]: USER_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: [
    ...ADMIN_PERMISSIONS,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.DELETE_ANY_DATA,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ]
};

export const authService = {
  // Get current user with role and permissions
  getCurrentUser: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get user details from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'User data not found' };
      }

      // Add permissions to user object
      const permissions = ROLE_PERMISSIONS[userData.role] || [];
      
      return { 
        success: true, 
        user: {
          ...userData,
          permissions,
          isAdmin: userData.role === ROLES.ADMIN || userData.role === ROLES.SUPER_ADMIN,
          isSuperAdmin: userData.role === ROLES.SUPER_ADMIN
        }
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has specific permission
  hasPermission: (user, permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  },

  // Check if user has any of the specified permissions
  hasAnyPermission: (user, permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  },

  // Check if user has all of the specified permissions
  hasAllPermissions: (user, permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  },

  // Update user role (admin only)
  updateUserRole: async (userId, newRole, currentUser) => {
    try {
      // Check if current user has permission to manage users
      if (!authService.hasPermission(currentUser, PERMISSIONS.EDIT_ALL_USERS)) {
        return { success: false, error: 'Insufficient permissions to update user roles' };
      }

      // Super admin check for admin role changes
      if (newRole === ROLES.ADMIN && !authService.hasPermission(currentUser, PERMISSIONS.MANAGE_ADMINS)) {
        return { success: false, error: 'Only super admins can create admin users' };
      }

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user can access a specific resource
  canAccessResource: (user, resource, action = 'view') => {
    const permissionMap = {
      'proposals': {
        'view': user?.isAdmin ? PERMISSIONS.VIEW_ALL_PROPOSALS : PERMISSIONS.VIEW_OWN_DATA,
        'create': PERMISSIONS.CREATE_PROPOSALS,
        'edit': user?.isAdmin ? PERMISSIONS.VIEW_ALL_PROPOSALS : PERMISSIONS.EDIT_OWN_DATA
      },
      'files': {
        'view': user?.isAdmin ? PERMISSIONS.VIEW_ALL_FILES : PERMISSIONS.VIEW_OWN_DATA,
        'upload': PERMISSIONS.UPLOAD_FILES,
        'edit': user?.isAdmin ? PERMISSIONS.VIEW_ALL_FILES : PERMISSIONS.EDIT_OWN_DATA
      },
      'tickets': {
        'view': user?.isAdmin ? PERMISSIONS.VIEW_ALL_TICKETS : PERMISSIONS.VIEW_OWN_DATA,
        'create': PERMISSIONS.SUBMIT_TICKETS,
        'edit': user?.isAdmin ? PERMISSIONS.VIEW_ALL_TICKETS : PERMISSIONS.EDIT_OWN_DATA
      },
      'users': {
        'view': PERMISSIONS.VIEW_ALL_USERS,
        'edit': PERMISSIONS.EDIT_ALL_USERS
      },
      'reports': {
        'view': PERMISSIONS.VIEW_REPORTS
      },
      'admin': {
        'access': PERMISSIONS.VIEW_ALL_USERS
      }
    };

    const requiredPermission = permissionMap[resource]?.[action];
    if (!requiredPermission) return false;

    return authService.hasPermission(user, requiredPermission);
  },

  // Logout user
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create audit log entry
  createAuditLog: async (userId, action, resourceType, resourceId, oldValues = null, newValues = null) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: null, // Would be populated from request in real app
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating audit log:', error);
      return { success: false, error: error.message };
    }
  }
};

// Authentication helper functions for checking permissions
export const checkAuthStatus = async () => {
  return await authService.getCurrentUser();
};

export const checkUserPermissions = (user, requiredPermissions) => {
  if (!user || requiredPermissions.length === 0) return true;
  return authService.hasAllPermissions(user, requiredPermissions);
};

// Note: Higher-order component (withAuth) should be implemented in .jsx files
// due to JSX syntax requirements. Import these helper functions instead.