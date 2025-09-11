import { supabase } from '../lib/supabase';

export const userSyncService = {
  // Ensure authenticated user exists in users table
  ensureUserExists: async () => {
    try {
      // Get the current authenticated user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user found');
        return { success: false, error: 'User not authenticated' };
      }

      const authUserId = user.id;
      const userEmail = user.email;
      const userFullName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          userEmail?.split('@')[0] || 
                          'User';

      // Check if user already exists in our users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', authUserId)
        .single();

      if (existingUser) {
        console.log('User already exists in users table:', existingUser.email);
        return { success: true, user: existingUser, action: 'exists' };
      }

      // If user doesn't exist, create them
      console.log('Creating user record for authenticated user:', authUserId);
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: userEmail,
          full_name: userFullName,
          password: 'AUTH_MANAGED',
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active',
          storage_used: 0,
          storage_limit: 5368709120, // 5GB default
          is_email_verified: user.email_confirmed_at ? true : false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create user record:', insertError);
        
        // If it's a unique constraint violation (user already exists), that's OK
        if (insertError.code === '23505') {
          console.log('User already exists (race condition), fetching existing user');
          const { data: existingUserRetry } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', authUserId)
            .single();
          
          return { success: true, user: existingUserRetry, action: 'exists' };
        }
        
        return { success: false, error: insertError.message };
      }

      console.log('User record created successfully:', newUser.email);
      return { success: true, user: newUser, action: 'created' };

    } catch (error) {
      console.error('Error in ensureUserExists:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is authenticated and synced
  checkUserStatus: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { 
          success: true, 
          authenticated: false, 
          synced: false, 
          message: 'User not authenticated' 
        };
      }

      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('id, email, full_name, role, subscription_status')
        .eq('id', user.id)
        .single();

      if (dbError || !dbUser) {
        return { 
          success: true, 
          authenticated: true, 
          synced: false, 
          authUser: user,
          message: 'User authenticated but not synced to database' 
        };
      }

      return { 
        success: true, 
        authenticated: true, 
        synced: true, 
        authUser: user,
        dbUser: dbUser,
        message: 'User authenticated and synced' 
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};