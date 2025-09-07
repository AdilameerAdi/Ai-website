import { supabase } from '../lib/supabase.js';

export const adminAuthService = {
  // Admin login function
  loginAdmin: async (adminName, password) => {
    try {
      console.log('Admin login attempt:', { adminName, password });
      
      // Query admin_users table for credentials
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('admin_name', adminName)
        .eq('password', password) // In production, use hashed passwords!
        .eq('is_active', true)
        .single();

      console.log('Supabase response:', { adminUser, error });

      if (error) {
        console.error('Supabase error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      if (!adminUser) {
        console.log('No admin user found with provided credentials');
        return {
          success: false,
          error: 'Invalid admin credentials'
        };
      }

      // Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', adminUser.id);

      // Store admin session in localStorage
      const adminSession = {
        id: adminUser.id,
        admin_name: adminUser.admin_name,
        role: adminUser.role,
        loginTime: new Date().toISOString(),
        isAdmin: true
      };

      localStorage.setItem('adminSession', JSON.stringify(adminSession));

      return {
        success: true,
        admin: adminSession
      };

    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },

  // Check if admin is currently logged in
  isAdminLoggedIn: () => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return false;

      const session = JSON.parse(adminSession);
      
      // Check if session is still valid (24 hours)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        localStorage.removeItem('adminSession');
        return false;
      }

      return session.isAdmin === true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  },

  // Get current admin session
  getCurrentAdmin: () => {
    try {
      const adminSession = localStorage.getItem('adminSession');
      if (!adminSession) return null;

      return JSON.parse(adminSession);
    } catch (error) {
      console.error('Get admin session error:', error);
      return null;
    }
  },

  // Logout admin
  logoutAdmin: () => {
    localStorage.removeItem('adminSession');
    return { success: true };
  },

  // Validate admin session
  validateAdminSession: async (adminId) => {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id, admin_name, role, is_active')
        .eq('id', adminId)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        return { success: false, error: 'Invalid session' };
      }

      return { success: true, admin: adminUser };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }
};

export default adminAuthService;