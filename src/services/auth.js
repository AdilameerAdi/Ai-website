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

  // Logout user with activity logging
  logout: async (userId = null) => {
    try {
      // Log logout activity before signing out
      if (userId) {
        try {
          await authService.logUserActivity(userId, 'logout', 'User logged out');
        } catch (logError) {
          console.error('Error logging logout activity:', logError);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Log user login activity
  logUserLogin: async (userId, userEmail) => {
    try {
      // Ensure user exists in users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, create user record
        console.log('Creating user record during login for:', userId);
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userEmail?.split('@')[0] || 'User',
            password: 'AUTH_MANAGED',
            role: 'user',
            subscription_plan: 'free',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 5368709120,
            is_email_verified: false
          });
        
        if (createUserError) {
          console.error('Error creating user record during login:', createUserError);
          return { success: false, error: createUserError.message };
        }
        console.log('User record created successfully');
      } else if (!userCheckError) {
        // User exists, update last_login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
      }
      
      // Log the activity
      await authService.logUserActivity(userId, 'login', `User ${userEmail} logged in`);

      return { success: true };
    } catch (error) {
      console.error('Error logging login activity:', error);
      return { success: false, error: error.message };
    }
  },

  // Generic user activity logger
  logUserActivity: async (userId, activityType, description) => {
    try {
      // First ensure user exists in users table to avoid foreign key constraint violation
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, skip logging activity
        console.warn('User does not exist for activity logging, skipping:', userId);
        return { success: false, error: 'User does not exist' };
      } else if (userCheckError) {
        console.error('Error checking user existence for activity log:', userCheckError);
        // Still try to log the activity, but warn about the issue
      }
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          description: description,
          timestamp: new Date().toISOString(),
          ip_address: null, // Would be populated from request in real app
          user_agent: navigator.userAgent
        });

      if (error) {
        // If table doesn't exist, we'll handle gracefully
        if (error.code === '42P01') {
          console.log('User activities table does not exist - activity logging disabled');
          return { success: false, error: 'Activity logging not available' };
        }
        
        // If foreign key constraint violation, log warning but don't fail the operation
        if (error.code === '23503') {
          console.warn('Foreign key constraint violation in user_activities, user may not exist:', userId);
          return { success: false, error: 'User reference error' };
        }
        
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('Error logging user activity:', error);
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