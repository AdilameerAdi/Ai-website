import { supabase } from '../lib/supabase.js';

// Test function to check admin table connection
export const testAdminConnection = async () => {
  try {
    console.log('Testing admin_users table connection...');
    
    // Test 1: Check if table exists and is accessible
    const { data: allAdmins, error: selectError } = await supabase
      .from('admin_users')
      .select('*');
    
    console.log('All admins query result:', { allAdmins, selectError });
    
    if (selectError) {
      console.error('Error accessing admin_users table:', selectError);
      return {
        success: false,
        error: `Table access error: ${selectError.message}`,
        details: selectError
      };
    }
    
    // Test 2: Check specific admin user
    const { data: specificAdmin, error: specificError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('admin_name', 'admin')
      .single();
    
    console.log('Specific admin query result:', { specificAdmin, specificError });
    
    return {
      success: true,
      totalAdmins: allAdmins?.length || 0,
      admins: allAdmins,
      specificAdmin: specificAdmin
    };
    
  } catch (error) {
    console.error('Test connection error:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export default testAdminConnection;