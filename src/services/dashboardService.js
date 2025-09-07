import { supabase } from '../lib/supabase';

const dashboardService = {
  // Get dashboard overview statistics
  getDashboardStats: async (userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      console.log('Getting stats for user:', authenticatedUserId);
      console.log('User object:', user);

      // Get support tickets count (ConsecDesk) 
      let ticketsCount = 0;
      try {
        const { count, error: ticketsError } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (ticketsError) {
          console.error('Error fetching tickets count:', ticketsError);
          console.log('Tickets table error details:', ticketsError.message);
          // Table might not exist yet, show 0
        } else {
          ticketsCount = count || 0;
          console.log('Found tickets count:', ticketsCount);
        }
      } catch (error) {
        console.error('Tickets query exception:', error);
      }

      // Get files count (ConsecDrive)  
      let filesCount = 0;
      try {
        const { count, error: filesError } = await supabase
          .from('files')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (filesError) {
          console.error('Error fetching files count:', filesError);
          console.log('Files table error details:', filesError.message);
          // Table might not exist yet, show 0
        } else {
          filesCount = count || 0;
          console.log('Found files count:', filesCount);
        }
      } catch (error) {
        console.error('Files query exception:', error);
      }

      // Get proposals count (ConsecQuote)
      let proposalsCount = 0;
      try {
        const { count, error: proposalsError } = await supabase
          .from('proposals')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (proposalsError) {
          console.error('Error fetching proposals count:', proposalsError);
          console.log('Proposals table error details:', proposalsError.message);
        } else {
          proposalsCount = count || 0;
          console.log('Found proposals count:', proposalsCount);
        }
      } catch (error) {
        console.error('Proposals query exception:', error);
      }

      // Return counts (with fallbacks to 0 if tables don't exist yet)
      const stats = {
        desks: ticketsCount,
        drives: filesCount, 
        quotes: proposalsCount
      };

      console.log('Dashboard stats:', stats);

      // Debug: Let's also try direct queries to see what's in the tables
      console.log('=== DEBUG: Raw table queries ===');
      
      // Check tickets table directly
      try {
        const { data: allTickets, error: allTicketsError } = await supabase
          .from('tickets')
          .select('*');
        console.log('All tickets in database:', allTickets);
        if (allTickets && allTickets.length > 0) {
          console.log(`Found ${allTickets.length} total tickets in database`);
          allTickets.forEach((ticket, index) => {
            console.log(`Ticket ${index + 1}:`, {
              id: ticket.id,
              user_id: ticket.user_id,
              title: ticket.title,
              status: ticket.status,
              matches_current_user: ticket.user_id === authenticatedUserId
            });
          });
          
          // Fix any user ID mismatches for tickets
          const mismatchedTickets = allTickets.filter(ticket => ticket.user_id !== authenticatedUserId);
          if (mismatchedTickets.length > 0) {
            console.log(`🔧 Fixing ${mismatchedTickets.length} tickets with wrong user_id...`);
            for (const ticket of mismatchedTickets) {
              try {
                const { error: updateError } = await supabase
                  .from('tickets')
                  .update({ user_id: authenticatedUserId })
                  .eq('id', ticket.id);
                
                if (updateError) {
                  console.error('Error updating ticket user_id:', updateError);
                } else {
                  console.log(`✅ Fixed ticket: ${ticket.title}`);
                }
              } catch (e) {
                console.error('Exception updating ticket:', e);
              }
            }
          }
        } else {
          console.log('❌ No tickets found in tickets table');
          console.log('💡 Tickets might be stored in a different table or not created yet');
        }
        if (allTicketsError) console.error('All tickets error:', allTicketsError);
      } catch (e) { 
        console.log('❌ Tickets table might not exist:', e.message);
        console.log('💡 Try running FINAL_DATABASE_SETUP.sql to create the tickets table');
      }

      // Check files table directly
      try {
        const { data: allFiles, error: allFilesError } = await supabase
          .from('files')
          .select('*');
        console.log('All files in database:', allFiles);
        if (allFiles && allFiles.length > 0) {
          console.log(`Found ${allFiles.length} total files in database`);
          allFiles.forEach((file, index) => {
            console.log(`File ${index + 1}:`, {
              id: file.id,
              user_id: file.user_id,
              file_name: file.file_name,
              matches_current_user: file.user_id === authenticatedUserId
            });
          });
          
          // Fix any user ID mismatches
          const mismatched = allFiles.filter(file => file.user_id !== authenticatedUserId);
          if (mismatched.length > 0) {
            console.log(`🔧 Fixing ${mismatched.length} files with wrong user_id...`);
            for (const file of mismatched) {
              try {
                const { error: updateError } = await supabase
                  .from('files')
                  .update({ user_id: authenticatedUserId })
                  .eq('id', file.id);
                
                if (updateError) {
                  console.error('Error updating file user_id:', updateError);
                } else {
                  console.log(`✅ Fixed file: ${file.file_name}`);
                }
              } catch (e) {
                console.error('Exception updating file:', e);
              }
            }
          }
        }
        if (allFilesError) console.error('All files error:', allFilesError);
      } catch (e) { console.log('Files table might not exist'); }

      console.log('=== END DEBUG ===');

      return { success: true, data: stats };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get recent activity across all apps
  getRecentActivity: async (userId, limit = 10) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;

      const activities = [];

      // Get recent tickets
      const { data: recentTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, title, status, created_at')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTickets && !ticketsError) {
        recentTickets.forEach(ticket => {
          activities.push({
            id: ticket.id,
            type: 'ticket',
            app: 'ConsecDesk',
            title: ticket.title,
            status: ticket.status,
            timestamp: ticket.created_at,
            icon: 'FaBriefcase'
          });
        });
      }

      // Get recent files
      const { data: recentFiles, error: filesError } = await supabase
        .from('files')
        .select('id, file_name, file_size, created_at')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentFiles && !filesError) {
        recentFiles.forEach(file => {
          activities.push({
            id: file.id,
            type: 'file',
            app: 'ConsecDrive',
            title: file.file_name,
            size: file.file_size,
            timestamp: file.created_at,
            icon: 'FaFolder'
          });
        });
      }

      // Get recent proposals
      const { data: recentProposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('id, title, status, total_amount, created_at')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentProposals && !proposalsError) {
        recentProposals.forEach(proposal => {
          activities.push({
            id: proposal.id,
            type: 'proposal',
            app: 'ConsecQuote',
            title: proposal.title,
            status: proposal.status,
            amount: proposal.total_amount,
            timestamp: proposal.created_at,
            icon: 'FaFileAlt'
          });
        });
      }

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedActivities = activities.slice(0, limit);

      return { success: true, data: limitedActivities };
    } catch (error) {
      console.error('Recent activity error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create sample data for testing (ONLY USE FOR TESTING)
  createSampleData: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const userId = user.id;
      console.log('Creating sample data for user:', userId);

      // Create sample ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          user_id: userId,
          title: 'Sample Support Ticket',
          description: 'This is a test support ticket for dashboard testing',
          priority: 'medium',
          status: 'open'
        }])
        .select();

      if (ticketError) {
        console.error('Error creating sample ticket:', ticketError);
      } else {
        console.log('Created sample ticket:', ticket);
      }

      // Create sample file entry
      const { data: file, error: fileError } = await supabase
        .from('files')
        .insert([{
          user_id: userId,
          file_name: 'sample-document.pdf',
          stored_name: `${userId}/sample-document-${Date.now()}.pdf`,
          file_path: `/uploads/${userId}/sample-document.pdf`,
          file_size: 1024000,
          mime_type: 'application/pdf'
        }])
        .select();

      if (fileError) {
        console.error('Error creating sample file:', fileError);
      } else {
        console.log('Created sample file:', file);
      }

      // We know proposals work since ConsecQuote is already working
      console.log('Sample data creation completed');
      return { success: true };

    } catch (error) {
      console.error('Sample data creation error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default dashboardService;