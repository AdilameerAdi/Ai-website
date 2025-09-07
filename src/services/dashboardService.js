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

      // Get support tickets count (ConsecDesk)
      let ticketsCount = 0;
      try {
        const { count, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (ticketsError) {
          console.error('Error fetching tickets count:', ticketsError);
          console.log('Tickets table might not exist yet');
        } else {
          ticketsCount = count || 0;
        }
      } catch (error) {
        console.error('Tickets query failed:', error);
      }

      // Get files count (ConsecDrive)  
      let filesCount = 0;
      try {
        const { count, error: filesError } = await supabase
          .from('files')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (filesError) {
          console.error('Error fetching files count:', filesError);
          console.log('Files table might not exist yet');
        } else {
          filesCount = count || 0;
        }
      } catch (error) {
        console.error('Files query failed:', error);
      }

      // Get proposals count (ConsecQuote)
      let proposalsCount = 0;
      try {
        const { count, error: proposalsError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authenticatedUserId);

        if (proposalsError) {
          console.error('Error fetching proposals count:', proposalsError);
        } else {
          proposalsCount = count || 0;
        }
      } catch (error) {
        console.error('Proposals query failed:', error);
      }

      // Return counts (with fallbacks to 0 if tables don't exist yet)
      const stats = {
        desks: ticketsCount,
        drives: filesCount, 
        quotes: proposalsCount
      };

      console.log('Dashboard stats:', stats);

      // If we're getting all zeros but user says there's data, 
      // it means the tables don't exist yet. Return placeholder for development.
      if (ticketsCount === 0 && filesCount === 0 && proposalsCount === 0) {
        console.log('All counts are 0 - tables may not exist yet');
        // You can uncomment this for development to show placeholder data:
        // stats.desks = 1; // Placeholder for ticket mentioned by user
        // stats.drives = 1; // Placeholder for file mentioned by user
      }

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
        .from('support_tickets')
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
  }
};

export default dashboardService;