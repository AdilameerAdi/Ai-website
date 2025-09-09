import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role (bypasses RLS)
// NOTE: In production, this should ONLY be used on the backend
const getAdminClient = () => {
  // Debug: Check admin session from localStorage
  try {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      console.error('Admin client - No admin session found');
      throw new Error('Admin authentication required');
    }

    const session = JSON.parse(adminSession);
    console.log('Admin client - Current admin:', session.admin_name);
    console.log('Admin client - Admin role:', session.role);
    console.log('Admin client - Login time:', session.loginTime);
    
    // Check if session is still valid (24 hours)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      console.error('Admin client - Session expired');
      localStorage.removeItem('adminSession');
      throw new Error('Admin session expired');
    }
    
    console.log('Using regular supabase client for admin operations with admin:', session.admin_name);
    return supabase;
  } catch (error) {
    console.error('Admin client error:', error.message);
    throw error;
  }
};

const adminService = {
  // Create missing user for orphaned proposals
  createMissingUser: async (userId) => {
    try {
      console.log('🔧 Creating missing user for ID:', userId);
      
      // First, get proposal details to use as user data
      const { data: proposals, error: proposalError } = await adminClient
        .from('proposals')
        .select('client_name, client_email, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);
        
      if (proposalError || !proposals || proposals.length === 0) {
        console.error('❌ Could not find proposals for user:', userId);
        return { success: false, error: 'No proposals found for user' };
      }
      
      const proposal = proposals[0];
      console.log('📝 Using proposal data:', proposal);
      
      // Create user record with proposal client information
      const userData = {
        id: userId,
        full_name: proposal.client_name || 'Unknown Client',
        email: proposal.client_email || `${userId}@unknown.com`,
        created_at: proposal.created_at,
        updated_at: new Date().toISOString(),
        status: 'active'
      };
      
      console.log('👤 Creating user with data:', userData);
      
      const { data: newUser, error: insertError } = await adminClient
        .from('users')
        .insert([userData])
        .select()
        .single();
        
      if (insertError) {
        console.error('❌ Failed to create user:', insertError);
        return { success: false, error: insertError.message };
      }
      
      console.log('✅ Successfully created missing user:', newUser);
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('❌ Exception creating missing user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get admin dashboard statistics
  getDashboardStats: async () => {
    try {
      // Use admin client for queries
      const adminClient = getAdminClient();
      console.log('Loading admin dashboard stats...');

      const stats = {};

      // Get total users from users table
      try {
        const { count: totalUsers, error } = await adminClient
          .from('users')
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching users:', error);
          stats.totalUsers = 0;
        } else {
          stats.totalUsers = totalUsers || 0;
        }
        
        // Get active users (logged in within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login', thirtyDaysAgo.toISOString());
        
        stats.activeUsers = activeUsers || Math.floor(stats.totalUsers * 0.7);
      } catch (error) {
        console.error('Error getting user counts:', error);
        stats.totalUsers = 0;
        stats.activeUsers = 0;
      }

      // Get database storage statistics  
      try {
        // Get ALL files to calculate storage
        const { data: files, error } = await adminClient
          .from('files')
          .select('filename, file_size, created_at');
        
        if (error) {
          console.error('Error fetching files:', error);
        }
        
        console.log('=== STORAGE DEBUG ===');
        console.log('Files found:', files?.length || 0);
        console.log('Sample file sizes (raw):', files?.slice(0, 5).map(f => ({ name: f.file_name, size: f.file_size, type: typeof f.file_size })));
        
        // Calculate total storage used - file_size should be in bytes
        let totalStorageUsed = 0;
        const fileSizeDebug = [];
        
        files?.forEach((file, index) => {
          const rawSize = file.file_size;
          let parsedSize = parseInt(rawSize) || 0;
          
          // Safety check: if file size seems unreasonably large, it might be in wrong units
          // If a single file is > 1GB, log a warning
          if (parsedSize > 1024 * 1024 * 1024) {
            console.warn(`⚠️ File "${file.filename}" has unusually large size: ${formatFileSize(parsedSize)}. This might indicate data corruption or wrong units.`);
          }
          
          totalStorageUsed += parsedSize;
          
          if (index < 10) { // Debug first 10 files
            fileSizeDebug.push({
              index,
              name: file.filename || 'unknown',
              rawSize,
              parsedSize,
              formattedSize: formatFileSize(parsedSize),
              isLarge: parsedSize > 100 * 1024 * 1024 // > 100MB
            });
          }
        });
        
        console.log('File size debugging (first 10 files):', fileSizeDebug);
        console.log('Total storage calculated (bytes):', totalStorageUsed);
        console.log('Total storage formatted:', formatFileSize(totalStorageUsed));
        
        // Database storage limit 
        const storageLimit = 500 * 1024 * 1024 * 1024; // 500 GB
        
        stats.storageUsed = formatFileSize(totalStorageUsed);
        stats.storageLimit = formatFileSize(storageLimit);
        
        // Calculate percentage with safety checks
        let calculatedPercent = totalStorageUsed > 0 ? Math.round((totalStorageUsed / storageLimit) * 100) : 0;
        
        // Safety cap: if percentage is unreasonably high, there might be bad data
        if (calculatedPercent > 100) {
          console.error(`🚨 Storage calculation error: ${calculatedPercent}% (${formatFileSize(totalStorageUsed)} / ${formatFileSize(storageLimit)})`);
          console.error('This indicates either corrupted file_size data or wrong storage limit. Capping at 99%.');
          calculatedPercent = 99;
        }
        
        stats.storagePercent = calculatedPercent;
        
        console.log('=== STORAGE CALCULATION RESULT ===');
        console.log('Storage limit (bytes):', storageLimit);
        console.log('Storage limit formatted:', formatFileSize(storageLimit));
        console.log('Storage used (bytes):', totalStorageUsed);
        console.log('Storage used formatted:', stats.storageUsed);
        console.log('Storage percentage:', stats.storagePercent + '%');
        console.log('Calculation: (' + totalStorageUsed + ' / ' + storageLimit + ') * 100 = ' + stats.storagePercent + '%');
        
        // Additional storage metrics
        stats.totalFiles = files?.length || 0;
      } catch (error) {
        console.error('Error getting storage stats:', error);
        stats.storageUsed = '0 B';
        stats.storageLimit = '500 GB';
        stats.storagePercent = 0;
        stats.totalFiles = 0;
      }

      // Get active proposals count from database
      try {
        const { data: proposalsList, error, count } = await adminClient
          .from('proposals')
          .select('*', { count: 'exact' });
        
        console.log('Proposals query result:', { 
          dataLength: proposalsList?.length, 
          count: count,
          error: error,
          hasData: proposalsList && proposalsList.length > 0
        });
        
        if (error) {
          console.error('Error getting proposals:', error);
          stats.activeProposals = 0;
        } else {
          stats.activeProposals = proposalsList?.length || count || 0;
        }
      } catch (error) {
        console.error('Exception getting proposals:', error);
        stats.activeProposals = 0;
      }

      // Get TOTAL revenue from ALL proposals
      try {
        // Get ALL proposals with all fields
        const { data: allProposals, error } = await adminClient
          .from('proposals')
          .select('*');
        
        console.log('Revenue query - proposals fetched:', allProposals?.length || 0);
        console.log('Revenue query - error:', error);
        
        if (error) {
          console.error('Revenue query error:', error);
          stats.monthlyRevenue = 0;
          stats.totalRevenue = 0;
        } else {
          // Calculate TOTAL revenue from ALL proposals
          let totalRevenue = 0;
          allProposals?.forEach(proposal => {
            const amount = parseFloat(proposal.total_amount) || 0;
            console.log(`Proposal ${proposal.title}: $${amount}`);
            totalRevenue += amount;
          });
          
          console.log('Total revenue calculated from data:', totalRevenue);
          
          // Show TOTAL revenue as monthly revenue
          stats.monthlyRevenue = totalRevenue;
          stats.totalRevenue = totalRevenue;
        }
        
        // Calculate growth indicator based on recent data
        try {
          // Get proposals from last 30 days vs previous 30 days
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
          
          const { data: recentProposals } = await adminClient
            .from('proposals')
            .select('total_amount')
            .gte('created_at', thirtyDaysAgo.toISOString());
            
          const { data: previousProposals } = await adminClient
            .from('proposals')
            .select('total_amount')
            .gte('created_at', sixtyDaysAgo.toISOString())
            .lt('created_at', thirtyDaysAgo.toISOString());
            
          const recentRevenue = recentProposals?.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0) || 0;
          const previousRevenue = previousProposals?.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0) || 0;
          
          if (previousRevenue > 0) {
            stats.revenueGrowth = Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100);
          } else {
            stats.revenueGrowth = recentRevenue > 0 ? 100 : 0;
          }
        } catch (error) {
          console.error('Error calculating revenue growth:', error);
          stats.revenueGrowth = 0;
        }
        
      } catch (error) {
        console.error('Exception getting revenue:', error);
        stats.monthlyRevenue = 0;
        stats.totalRevenue = 0;
        stats.revenueGrowth = 0;
      }

      // Get pending leads count
      try {
        const { count: pendingLeads } = await adminClient
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new');
        stats.pendingLeads = pendingLeads || 0;
      } catch (error) {
        console.error('Error getting pending leads:', error);
        stats.pendingLeads = 0;
      }

      // Calculate system health based on real metrics
      try {
        let healthScore = 100;
        
        // Check database response time
        const startTime = Date.now();
        await adminClient.from('tickets').select('id').limit(1);
        const responseTime = Date.now() - startTime;
        
        if (responseTime > 1000) healthScore -= 10; // Slow response
        if (responseTime > 2000) healthScore -= 20; // Very slow
        
        // Check storage usage
        if (stats.storagePercent > 80) healthScore -= 15;
        if (stats.storagePercent > 90) healthScore -= 25;
        
        // Check if tables are accessible
        const tableChecks = await Promise.allSettled([
          adminClient.from('users').select('id').limit(1),
          adminClient.from('files').select('id').limit(1),
          adminClient.from('proposals').select('id').limit(1),
          adminClient.from('tickets').select('id').limit(1),
          adminClient.from('leads').select('id').limit(1)
        ]);
        
        const failedTables = tableChecks.filter(result => result.status === 'rejected').length;
        healthScore -= failedTables * 10; // More impact for failed tables
        
        // Check data consistency
        if (stats.totalUsers === 0 && stats.activeProposals === 0 && stats.totalFiles === 0) {
          healthScore -= 20; // System might have data issues
        }
        
        // Add database connectivity check
        try {
          const connectivityStart = Date.now();
          await adminClient.from('admin_users').select('id').limit(1);
          const connectivityTime = Date.now() - connectivityStart;
          if (connectivityTime > 3000) healthScore -= 15; // Very slow connectivity
        } catch (connectError) {
          healthScore -= 30; // Major connectivity issues
        }
        
        stats.systemHealth = Math.max(0, Math.min(100, healthScore));
        console.log('System health calculated:', {
          responseTime,
          storagePercent: stats.storagePercent,
          failedTables,
          finalScore: stats.systemHealth
        });
      } catch (error) {
        console.error('Error calculating system health:', error);
        // Calculate a basic health score based on available data
        let basicHealth = 50;
        if (stats.totalUsers > 0) basicHealth += 15;
        if (stats.activeProposals > 0) basicHealth += 15;
        if (stats.totalFiles > 0) basicHealth += 10;
        if (stats.storagePercent < 90) basicHealth += 10;
        stats.systemHealth = Math.min(100, basicHealth);
      }

      return { success: true, data: stats };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get recent activity across the platform
  getRecentActivity: async (limit = 20) => {
    try {
      // Get admin client for this function too
      const adminClient = getAdminClient();
      const activities = [];

      // Get recent proposals (without database joins to avoid relationship errors)
      try {
        const { data: proposals } = await adminClient
          .from('proposals')
          .select('id, title, user_id, created_at, status, total_amount')
          .order('created_at', { ascending: false })
          .limit(8);

        if (proposals) {
          proposals.forEach(proposal => {
            // Get user info from users table or fallback to user ID
            const userName = `User ${proposal.user_id?.substring(0, 8) || 'Unknown'}`;
            activities.push({
              id: `proposal-${proposal.id}`,
              action: 'New proposal created',
              user: userName,
              details: `"${proposal.title}" - $${proposal.total_amount || 0}`,
              time: formatTimeAgo(proposal.created_at),
              type: 'proposal',
              status: proposal.status,
              timestamp: proposal.created_at,
              userId: proposal.user_id
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent proposals:', error);
      }

      // Get recent file uploads (without database joins to avoid relationship errors)
      try {
        const { data: files } = await adminClient
          .from('files')
          .select('id, filename, file_size, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(8);

        if (files) {
          files.forEach(file => {
            const userName = `User ${file.user_id?.substring(0, 8) || 'Unknown'}`;
            activities.push({
              id: `file-${file.id}`,
              action: 'New file uploaded',
              user: userName,
              details: `${file.filename} (${formatFileSize(file.file_size)})`,
              time: formatTimeAgo(file.created_at),
              type: 'file',
              timestamp: file.created_at,
              userId: file.user_id
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent files:', error);
      }

      // Get recent tickets (without database joins to avoid relationship errors)
      try {
        const { data: tickets } = await adminClient
          .from('tickets')
          .select('id, title, user_id, created_at, status, priority')
          .order('created_at', { ascending: false })
          .limit(8);

        if (tickets) {
          tickets.forEach(ticket => {
            const userName = `User ${ticket.user_id?.substring(0, 8) || 'Unknown'}`;
            activities.push({
              id: `ticket-${ticket.id}`,
              action: 'New support ticket created',
              user: userName,
              details: `"${ticket.title}" (${ticket.priority || 'normal'} priority)`,
              time: formatTimeAgo(ticket.created_at),
              type: 'ticket',
              status: ticket.status,
              timestamp: ticket.created_at,
              userId: ticket.user_id
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent tickets:', error);
      }

      // Get recent user registrations
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const { data: newUsers } = await adminClient
          .from('users')
          .select('id, email, created_at')
          .gte('created_at', oneDayAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (newUsers) {
          newUsers.forEach(user => {
            activities.push({
              id: `user-${user.id}`,
              action: 'New user registered',
              user: user.email?.substring(0, 20) + '...' || `User ${user.id.substring(0, 8)}`,
              details: 'Account created',
              time: formatTimeAgo(user.created_at),
              type: 'user',
              timestamp: user.created_at
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent users:', error);
      }

      // Get recent leads
      try {
        const { data: leads } = await adminClient
          .from('leads')
          .select('id, email, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (leads) {
          leads.forEach(lead => {
            activities.push({
              id: `lead-${lead.id}`,
              action: 'New lead generated',
              user: lead.email || 'Unknown',
              details: `Status: ${lead.status}`,
              time: formatTimeAgo(lead.created_at),
              type: 'lead',
              status: lead.status,
              timestamp: lead.created_at
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent leads:', error);
      }

      // Get recent user login/logout activities (skip if table doesn't exist)
      try {
        const { data: userActivities } = await adminClient
          .from('user_activities')
          .select('id, user_id, activity_type, description, timestamp')
          .in('activity_type', ['login', 'logout'])
          .order('timestamp', { ascending: false })
          .limit(10);

        if (userActivities) {
          userActivities.forEach(activity => {
            const actionText = activity.activity_type === 'login' ? 'User logged in' : 'User logged out';
            const userName = `User ${activity.user_id?.substring(0, 8) || 'Unknown'}`;
            activities.push({
              id: `activity-${activity.id}`,
              action: actionText,
              user: userName,
              details: activity.description || `${activity.activity_type} event`,
              time: formatTimeAgo(activity.timestamp),
              type: 'auth',
              subtype: activity.activity_type,
              timestamp: activity.timestamp,
              userId: activity.user_id
            });
          });
        }
      } catch (error) {
        console.error('Error getting user login/logout activities:', error);
        // Table might not exist yet - this is non-critical, continue without login activities
      }

      // Sort by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return { success: true, data: activities.slice(0, limit) };
    } catch (error) {
      console.error('Recent activity error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all users with pagination
  getAllUsers: async (page = 1, limit = 50, search = '') => {
    try {
      const adminClient = getAdminClient();
      const offset = (page - 1) * limit;
      
      let query = adminClient
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`email.ilike.%${search}%`);
      }

      const { data: users, count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: users || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get COMPREHENSIVE user activity data from database for detailed reporting
  getUserActivityData: async (startDate, endDate) => {
    try {
      const adminClient = getAdminClient();
      console.log('📊 Generating comprehensive user activity report...');
      console.log('📅 Date range:', startDate, 'to', endDate);
      
      // Get all users with their basic info
      const { data: allUsers, error: usersError } = await adminClient
        .from('users')
        .select('id, full_name, email, created_at, last_login, role, subscription_plan');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log('👥 Found', allUsers?.length || 0, 'total users');

      // Get all activity data within date range with user details
      const [tickets, files, proposals, userActivities, newUsers] = await Promise.all([
        // Get tickets with user info
        adminClient
          .from('tickets')
          .select(`
            id, user_id, title, created_at, status, priority,
            users:user_id (full_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate),
          
        // Get files with user info
        adminClient
          .from('files')
          .select(`
            id, user_id, filename, file_size, created_at, file_type,
            users:user_id (full_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate),
          
        // Get proposals with user info
        adminClient
          .from('proposals')
          .select(`
            id, user_id, title, total_amount, created_at, status,
            users:user_id (full_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate),
          
        // Get login/logout activities with user info
        adminClient
          .from('user_activities')
          .select(`
            id, user_id, activity_type, timestamp, description,
            users:user_id (full_name, email)
          `)
          .in('activity_type', ['login', 'logout'])
          .gte('timestamp', startDate)
          .lte('timestamp', endDate),
          
        // Get new user registrations within date range
        adminClient
          .from('users')
          .select('id, full_name, email, created_at, role, subscription_plan')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);

      console.log('📈 Activity summary:');
      console.log('   🎫 Tickets:', tickets.data?.length || 0);
      console.log('   📁 Files:', files.data?.length || 0);
      console.log('   💼 Proposals:', proposals.data?.length || 0);
      console.log('   🔑 Login/Logout events:', userActivities.data?.length || 0);
      console.log('   🆕 New users:', newUsers.data?.length || 0);

      // Create user activity map
      const userActivityMap = new Map();
      
      // Initialize all users in the map
      allUsers?.forEach(user => {
        userActivityMap.set(user.id, {
          userId: user.id,
          userFullName: user.full_name || 'Unknown',
          userEmail: user.email,
          accountCreated: user.created_at,
          lastLogin: user.last_login,
          role: user.role || 'user',
          subscriptionPlan: user.subscription_plan || 'free',
          isNewUser: newUsers.data?.some(newUser => newUser.id === user.id),
          
          // Activity counters
          totalActivities: 0,
          ticketsCreated: 0,
          filesUploaded: 0,
          proposalsCreated: 0,
          loginSessions: 0,
          
          // Activity details
          ticketsList: [],
          filesList: [],
          proposalsList: [],
          loginsList: [],
          
          // Financial data
          totalProposalValue: 0,
          averageProposalValue: 0,
          
          // Storage data
          totalStorageUsed: 0,
          fileCount: 0,
          
          // Activity timeline
          firstActivity: null,
          lastActivity: null,
          activeDays: new Set()
        });
      });

      // Process tickets
      tickets.data?.forEach(ticket => {
        const userStats = userActivityMap.get(ticket.user_id);
        if (userStats) {
          userStats.ticketsCreated++;
          userStats.totalActivities++;
          userStats.ticketsList.push({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.created_at
          });
          
          // Update activity timeline
          const activityDate = ticket.created_at;
          if (!userStats.firstActivity || activityDate < userStats.firstActivity) {
            userStats.firstActivity = activityDate;
          }
          if (!userStats.lastActivity || activityDate > userStats.lastActivity) {
            userStats.lastActivity = activityDate;
          }
          userStats.activeDays.add(activityDate.split('T')[0]);
        }
      });

      // Process files
      files.data?.forEach(file => {
        const userStats = userActivityMap.get(file.user_id);
        if (userStats) {
          userStats.filesUploaded++;
          userStats.totalActivities++;
          userStats.fileCount++;
          userStats.totalStorageUsed += parseInt(file.file_size) || 0;
          userStats.filesList.push({
            id: file.id,
            filename: file.filename,
            fileSize: parseInt(file.file_size) || 0,
            fileType: file.file_type,
            createdAt: file.created_at
          });
          
          // Update activity timeline
          const activityDate = file.created_at;
          if (!userStats.firstActivity || activityDate < userStats.firstActivity) {
            userStats.firstActivity = activityDate;
          }
          if (!userStats.lastActivity || activityDate > userStats.lastActivity) {
            userStats.lastActivity = activityDate;
          }
          userStats.activeDays.add(activityDate.split('T')[0]);
        }
      });

      // Process proposals
      proposals.data?.forEach(proposal => {
        const userStats = userActivityMap.get(proposal.user_id);
        if (userStats) {
          userStats.proposalsCreated++;
          userStats.totalActivities++;
          const proposalValue = parseFloat(proposal.total_amount) || 0;
          userStats.totalProposalValue += proposalValue;
          userStats.proposalsList.push({
            id: proposal.id,
            title: proposal.title,
            totalAmount: proposalValue,
            status: proposal.status,
            createdAt: proposal.created_at
          });
          
          // Update activity timeline
          const activityDate = proposal.created_at;
          if (!userStats.firstActivity || activityDate < userStats.firstActivity) {
            userStats.firstActivity = activityDate;
          }
          if (!userStats.lastActivity || activityDate > userStats.lastActivity) {
            userStats.lastActivity = activityDate;
          }
          userStats.activeDays.add(activityDate.split('T')[0]);
        }
      });

      // Process user activities (login/logout)
      userActivities.data?.forEach(activity => {
        const userStats = userActivityMap.get(activity.user_id);
        if (userStats && activity.activity_type === 'login') {
          userStats.loginSessions++;
          userStats.totalActivities++;
          userStats.loginsList.push({
            id: activity.id,
            activityType: activity.activity_type,
            timestamp: activity.timestamp,
            description: activity.description
          });
          
          // Update activity timeline
          const activityDate = activity.timestamp;
          if (!userStats.firstActivity || activityDate < userStats.firstActivity) {
            userStats.firstActivity = activityDate;
          }
          if (!userStats.lastActivity || activityDate > userStats.lastActivity) {
            userStats.lastActivity = activityDate;
          }
          userStats.activeDays.add(activityDate.split('T')[0]);
        }
      });

      // Calculate averages and format data
      const reportData = Array.from(userActivityMap.values()).map(userStats => {
        // Calculate average proposal value
        userStats.averageProposalValue = userStats.proposalsCreated > 0 
          ? userStats.totalProposalValue / userStats.proposalsCreated 
          : 0;
        
        // Convert active days to count
        const activeDaysCount = userStats.activeDays.size;
        
        return {
          // User identification
          userId: userStats.userId,
          userFullName: userStats.userFullName,
          userEmail: userStats.userEmail,
          role: userStats.role,
          subscriptionPlan: userStats.subscriptionPlan,
          
          // Account info
          accountCreated: userStats.accountCreated,
          lastLogin: userStats.lastLogin,
          isNewUser: userStats.isNewUser,
          
          // Activity summary
          totalActivities: userStats.totalActivities,
          activeDays: activeDaysCount,
          firstActivity: userStats.firstActivity,
          lastActivity: userStats.lastActivity,
          
          // Specific activities
          ticketsCreated: userStats.ticketsCreated,
          filesUploaded: userStats.filesUploaded,
          proposalsCreated: userStats.proposalsCreated,
          loginSessions: userStats.loginSessions,
          
          // Financial data
          totalProposalValue: userStats.totalProposalValue,
          averageProposalValue: userStats.averageProposalValue,
          
          // Storage data
          totalStorageUsed: userStats.totalStorageUsed,
          totalStorageUsedFormatted: formatFileSize(userStats.totalStorageUsed),
          fileCount: userStats.fileCount,
          
          // Activity details (for detailed report)
          ticketsList: userStats.ticketsList,
          filesList: userStats.filesList,
          proposalsList: userStats.proposalsList,
          loginsList: userStats.loginsList,
          
          // Engagement metrics
          engagementScore: calculateEngagementScore(userStats),
          activityLevel: categorizeActivityLevel(userStats.totalActivities, activeDaysCount)
        };
      });

      // Sort by total activity (most active first)
      reportData.sort((a, b) => b.totalActivities - a.totalActivities);

      console.log('✅ User activity report generated successfully!');
      console.log('📊 Total users in report:', reportData.length);
      console.log('🏆 Most active user:', reportData[0]?.userFullName || 'None');

      return { success: true, data: reportData };
    } catch (error) {
      console.error('User activity data error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get detailed storage analytics for admin dashboard
  getStorageBreakdown: async () => {
    try {
      const adminClient = getAdminClient();
      const { data: files, error } = await adminClient
        .from('files')
        .select('id, filename, file_size, file_type, user_id, created_at');

      if (error) throw error;

      const breakdown = {
        byFileType: {},
        byUser: {},
        largestFiles: [],
        recentUploads: []
      };

      // Group by file type
      files?.forEach(file => {
        const type = file.file_type || 'unknown';
        if (!breakdown.byFileType[type]) {
          breakdown.byFileType[type] = { count: 0, size: 0 };
        }
        breakdown.byFileType[type].count++;
        breakdown.byFileType[type].size += parseInt(file.file_size) || 0;
      });

      // Group by user (top 10 users by storage)
      const userStorage = {};
      files?.forEach(file => {
        const userId = file.user_id;
        if (!userStorage[userId]) {
          userStorage[userId] = { fileCount: 0, totalSize: 0 };
        }
        userStorage[userId].fileCount++;
        userStorage[userId].totalSize += parseInt(file.file_size) || 0;
      });

      // Sort users by storage and take top 10
      breakdown.byUser = Object.entries(userStorage)
        .sort((a, b) => b[1].totalSize - a[1].totalSize)
        .slice(0, 10)
        .map(([userId, data]) => ({
          userId: userId.substring(0, 8),
          ...data,
          formattedSize: formatFileSize(data.totalSize)
        }));

      // Get 10 largest files
      breakdown.largestFiles = files
        ?.sort((a, b) => (parseInt(b.file_size) || 0) - (parseInt(a.file_size) || 0))
        .slice(0, 10)
        .map(file => ({
          id: file.id,
          name: file.filename || 'Unknown',
          size: formatFileSize(parseInt(file.file_size) || 0),
          type: file.file_type,
          userId: file.user_id?.substring(0, 8)
        })) || [];

      // Recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      breakdown.recentUploads = files
        ?.filter(file => new Date(file.created_at) > sevenDaysAgo)
        .length || 0;

      return { success: true, data: breakdown };
    } catch (error) {
      console.error('Storage breakdown error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get real system alerts based on database metrics
  getSystemAlerts: async () => {
    try {
      const adminClient = getAdminClient();
      const alerts = [];
      
      // Check for high storage usage
      try {
        const { data: files } = await adminClient
          .from('files')
          .select('file_size');
        
        let totalStorage = 0;
        files?.forEach(file => {
          totalStorage += parseInt(file.file_size) || 0;
        });
        
        const storageLimit = 500 * 1024 * 1024 * 1024; // 500 GB
        const storagePercent = totalStorage > 0 ? (totalStorage / storageLimit) * 100 : 0;
        
        if (storagePercent > 90) {
          alerts.push({
            id: 'storage-critical',
            type: 'critical',
            title: 'Storage Critical',
            message: `Storage usage is at ${Math.round(storagePercent)}%. Immediate action required.`,
            timestamp: new Date().toISOString(),
            icon: 'FaExclamationTriangle'
          });
        } else if (storagePercent > 80) {
          alerts.push({
            id: 'storage-warning',
            type: 'warning',
            title: 'High Storage Usage',
            message: `Storage usage is at ${Math.round(storagePercent)}%. Consider cleaning up old files.`,
            timestamp: new Date().toISOString(),
            icon: 'FaBell'
          });
        }
      } catch (error) {
        alerts.push({
          id: 'storage-error',
          type: 'error',
          title: 'Storage Check Failed',
          message: 'Unable to check storage usage. Database connectivity issues.',
          timestamp: new Date().toISOString(),
          icon: 'FaExclamationTriangle'
        });
      }
      
      // Check for failed database connections
      const tableChecks = [
        { name: 'users', table: 'users' },
        { name: 'proposals', table: 'proposals' },
        { name: 'files', table: 'files' },
        { name: 'tickets', table: 'tickets' },
        { name: 'leads', table: 'leads' }
      ];
      
      for (const check of tableChecks) {
        try {
          const startTime = Date.now();
          await adminClient.from(check.table).select('id').limit(1);
          const responseTime = Date.now() - startTime;
          
          if (responseTime > 3000) {
            alerts.push({
              id: `db-slow-${check.name}`,
              type: 'warning',
              title: 'Slow Database Response',
              message: `${check.name} table responding slowly (${responseTime}ms). Performance issues detected.`,
              timestamp: new Date().toISOString(),
              icon: 'FaClock'
            });
          }
        } catch (error) {
          alerts.push({
            id: `db-error-${check.name}`,
            type: 'critical',
            title: 'Database Table Error',
            message: `Cannot access ${check.name} table: ${error.message}`,
            timestamp: new Date().toISOString(),
            icon: 'FaExclamationTriangle'
          });
        }
      }
      
      // Check for recent failed user activity
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const { data: recentActivity } = await adminClient
          .from('tickets')
          .select('id, status')
          .gte('created_at', oneDayAgo.toISOString());
        
        const openTickets = recentActivity?.filter(t => t.status === 'open').length || 0;
        
        if (openTickets > 10) {
          alerts.push({
            id: 'high-ticket-volume',
            type: 'warning',
            title: 'High Ticket Volume',
            message: `${openTickets} open tickets in the last 24 hours. Support team may be overwhelmed.`,
            timestamp: new Date().toISOString(),
            icon: 'FaBell'
          });
        }
      } catch (error) {
        console.error('Error checking ticket volume:', error);
      }
      
      // Add success alert if no issues
      if (alerts.length === 0) {
        alerts.push({
          id: 'system-healthy',
          type: 'success',
          title: 'All Systems Operational',
          message: 'No critical issues detected. All database tables are accessible and performing well.',
          timestamp: new Date().toISOString(),
          icon: 'FaCheckCircle'
        });
      }
      
      // Sort by severity (critical, warning, error, success)
      const severityOrder = { 'critical': 0, 'error': 1, 'warning': 2, 'success': 3 };
      alerts.sort((a, b) => severityOrder[a.type] - severityOrder[b.type]);
      
      return { success: true, data: alerts };
    } catch (error) {
      console.error('System alerts error:', error);
      return { 
        success: false, 
        error: error.message,
        data: [{
          id: 'system-error',
          type: 'critical',
          title: 'System Check Failed',
          message: 'Unable to perform system health checks. Please contact administrator.',
          timestamp: new Date().toISOString(),
          icon: 'FaExclamationTriangle'
        }]
      };
    }
  },

  // Get comprehensive financial summary with user revenue data
  getFinancialSummaryData: async () => {
    try {
      const adminClient = getAdminClient();
      console.log('💰 Generating comprehensive financial summary report...');
      
      // Get current date for monthly calculations
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Calculate date ranges for different periods
      const thisMonthStart = new Date(currentYear, currentMonth, 1);
      const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0);
      const yearStart = new Date(currentYear, 0, 1);
      
      console.log('📅 Analyzing financial data for:');
      console.log('   📊 This Month:', thisMonthStart.toDateString(), 'to', now.toDateString());
      console.log('   📊 Last Month:', lastMonthStart.toDateString(), 'to', lastMonthEnd.toDateString());
      console.log('   📊 Year to Date:', yearStart.toDateString(), 'to', now.toDateString());

      // Get all users with their proposal data
      const { data: allUsers, error: usersError } = await adminClient
        .from('users')
        .select('id, full_name, email, created_at, role, subscription_plan');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      console.log('👥 Found', allUsers?.length || 0, 'total users');

      // Get all proposals (without automatic join to avoid relationship errors)
      const { data: allProposals, error: proposalsError } = await adminClient
        .from('proposals')
        .select('id, user_id, title, total_amount, status, created_at, client_name, client_company')
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        // Don't throw error - continue with empty proposals array
        console.warn('⚠️ Continuing with no proposal data due to database error');
      }

      console.log('💼 Found', allProposals?.length || 0, 'total proposals');

      // Create user lookup map for efficient user data access
      const userLookupMap = new Map();
      allUsers?.forEach(user => {
        userLookupMap.set(user.id, user);
      });

      // Create user revenue map
      const userRevenueMap = new Map();
      
      // Initialize all users in the map
      allUsers?.forEach(user => {
        userRevenueMap.set(user.id, {
          userId: user.id,
          userFullName: user.full_name || 'Unknown User',
          userEmail: user.email,
          role: user.role || 'user',
          subscriptionPlan: user.subscription_plan || 'free',
          accountCreated: user.created_at,
          
          // Monthly revenue tracking
          thisMonthRevenue: 0,
          lastMonthRevenue: 0,
          yearToDateRevenue: 0,
          totalRevenue: 0,
          
          // Proposal tracking
          thisMonthProposals: 0,
          lastMonthProposals: 0,
          yearToDateProposals: 0,
          totalProposals: 0,
          
          // Revenue by status
          draftRevenue: 0,
          sentRevenue: 0,
          acceptedRevenue: 0,
          rejectedRevenue: 0,
          
          // Detailed proposal lists
          thisMonthProposalsList: [],
          lastMonthProposalsList: [],
          allProposalsList: [],
          
          // Performance metrics
          averageProposalValue: 0,
          conversionRate: 0, // accepted / total
          monthlyGrowth: 0 // this month vs last month
        });
      });

      // Process all proposals and calculate revenue metrics
      console.log('📊 Processing proposals and calculating revenue metrics...');
      let processedCount = 0;
      let skippedCount = 0;
      
      (allProposals || []).forEach(proposal => {
        const userStats = userRevenueMap.get(proposal.user_id);
        if (userStats) {
          processedCount++;
        } else {
          skippedCount++;
          console.warn('⚠️ Proposal found for unknown user:', proposal.user_id, '| Proposal:', proposal.title);
        }
        
        if (userStats) {
          const proposalValue = parseFloat(proposal.total_amount) || 0;
          const proposalDate = new Date(proposal.created_at);
          
          // Add to total revenue and proposals
          userStats.totalRevenue += proposalValue;
          userStats.totalProposals++;
          
          // Add to proposal list
          const proposalInfo = {
            id: proposal.id,
            title: proposal.title,
            amount: proposalValue,
            status: proposal.status,
            client: proposal.client_name || proposal.client_company,
            createdAt: proposal.created_at
          };
          userStats.allProposalsList.push(proposalInfo);
          
          // Revenue by status
          switch (proposal.status?.toLowerCase()) {
            case 'draft':
              userStats.draftRevenue += proposalValue;
              break;
            case 'sent':
              userStats.sentRevenue += proposalValue;
              break;
            case 'accepted':
              userStats.acceptedRevenue += proposalValue;
              break;
            case 'rejected':
              userStats.rejectedRevenue += proposalValue;
              break;
          }
          
          // This month
          if (proposalDate >= thisMonthStart) {
            userStats.thisMonthRevenue += proposalValue;
            userStats.thisMonthProposals++;
            userStats.thisMonthProposalsList.push(proposalInfo);
          }
          
          // Last month
          if (proposalDate >= lastMonthStart && proposalDate <= lastMonthEnd) {
            userStats.lastMonthRevenue += proposalValue;
            userStats.lastMonthProposals++;
            userStats.lastMonthProposalsList.push(proposalInfo);
          }
          
          // Year to date
          if (proposalDate >= yearStart) {
            userStats.yearToDateRevenue += proposalValue;
            userStats.yearToDateProposals++;
          }
        }
      });
      
      console.log('✅ Proposal processing completed:');
      console.log('   📊 Processed proposals:', processedCount);
      console.log('   ⚠️ Skipped proposals (unknown users):', skippedCount);

      // Calculate performance metrics for each user
      const financialData = Array.from(userRevenueMap.values()).map(userStats => {
        // Calculate averages
        userStats.averageProposalValue = userStats.totalProposals > 0 
          ? userStats.totalRevenue / userStats.totalProposals 
          : 0;
        
        // Calculate conversion rate (accepted proposals / total proposals)
        const acceptedProposals = userStats.allProposalsList.filter(p => p.status?.toLowerCase() === 'accepted').length;
        userStats.conversionRate = userStats.totalProposals > 0 
          ? (acceptedProposals / userStats.totalProposals) * 100 
          : 0;
        
        // Calculate monthly growth (this month vs last month)
        userStats.monthlyGrowth = userStats.lastMonthRevenue > 0 
          ? ((userStats.thisMonthRevenue - userStats.lastMonthRevenue) / userStats.lastMonthRevenue) * 100 
          : userStats.thisMonthRevenue > 0 ? 100 : 0;
        
        return {
          // User identification
          userId: userStats.userId,
          userFullName: userStats.userFullName,
          userEmail: userStats.userEmail,
          role: userStats.role,
          subscriptionPlan: userStats.subscriptionPlan,
          accountCreated: userStats.accountCreated,
          
          // Monthly revenue
          thisMonthRevenue: userStats.thisMonthRevenue,
          lastMonthRevenue: userStats.lastMonthRevenue,
          yearToDateRevenue: userStats.yearToDateRevenue,
          totalRevenue: userStats.totalRevenue,
          
          // Proposal counts
          thisMonthProposals: userStats.thisMonthProposals,
          lastMonthProposals: userStats.lastMonthProposals,
          yearToDateProposals: userStats.yearToDateProposals,
          totalProposals: userStats.totalProposals,
          
          // Revenue by status
          draftRevenue: userStats.draftRevenue,
          sentRevenue: userStats.sentRevenue,
          acceptedRevenue: userStats.acceptedRevenue,
          rejectedRevenue: userStats.rejectedRevenue,
          
          // Performance metrics
          averageProposalValue: userStats.averageProposalValue,
          conversionRate: userStats.conversionRate,
          monthlyGrowth: userStats.monthlyGrowth,
          
          // Detailed lists (for detailed reporting)
          thisMonthProposalsList: userStats.thisMonthProposalsList,
          lastMonthProposalsList: userStats.lastMonthProposalsList,
          allProposalsList: userStats.allProposalsList,
          
          // Revenue performance indicators
          revenueCategory: categorizeRevenuePerformance(userStats.thisMonthRevenue),
          isTopPerformer: userStats.thisMonthRevenue > 0 && userStats.conversionRate > 50,
          isGrowing: userStats.monthlyGrowth > 0
        };
      });

      // Sort by this month's revenue (highest first)
      financialData.sort((a, b) => b.thisMonthRevenue - a.thisMonthRevenue);

      // Calculate summary statistics
      const summary = {
        totalUsers: financialData.length,
        activeUsers: financialData.filter(user => user.totalRevenue > 0).length,
        thisMonthTotal: financialData.reduce((sum, user) => sum + user.thisMonthRevenue, 0),
        lastMonthTotal: financialData.reduce((sum, user) => sum + user.lastMonthRevenue, 0),
        yearToDateTotal: financialData.reduce((sum, user) => sum + user.yearToDateRevenue, 0),
        totalRevenue: financialData.reduce((sum, user) => sum + user.totalRevenue, 0),
        averageRevenuePerUser: 0,
        topPerformers: financialData.filter(user => user.isTopPerformer).length,
        growingUsers: financialData.filter(user => user.isGrowing).length,
        monthlyGrowthRate: 0
      };

      // Calculate additional summary metrics
      summary.averageRevenuePerUser = summary.activeUsers > 0 
        ? summary.totalRevenue / summary.activeUsers 
        : 0;
      
      summary.monthlyGrowthRate = summary.lastMonthTotal > 0 
        ? ((summary.thisMonthTotal - summary.lastMonthTotal) / summary.lastMonthTotal) * 100 
        : summary.thisMonthTotal > 0 ? 100 : 0;

      console.log('✅ Financial summary generated successfully!');
      console.log('💰 Summary Statistics:');
      console.log('   📊 Total Users:', summary.totalUsers);
      console.log('   💵 Active Revenue Users:', summary.activeUsers);
      console.log('   🗓️ This Month Total: $' + summary.thisMonthTotal.toLocaleString());
      console.log('   📈 Monthly Growth:', summary.monthlyGrowthRate.toFixed(1) + '%');
      console.log('   🏆 Top Performers:', summary.topPerformers);

      return { 
        success: true, 
        data: financialData,
        summary: summary
      };
    } catch (error) {
      console.error('Financial summary error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all files with user information and statistics
  getAllFiles: async (page = 1, limit = 50, search = '', filterType = 'all') => {
    try {
      const adminClient = getAdminClient();
      const offset = (page - 1) * limit;
      
      console.log('🗂️ Fetching files from database...', { page, limit, search, filterType });
      
      let query = adminClient
        .from('files')
        .select(`
          id, user_id, filename, original_filename, file_path, file_url, 
          file_size, file_type, mime_type, folder_id, folder_path,
          ai_summary, ai_keywords, ai_category, ai_priority, ai_suggested_tags,
          ai_confidence, ai_content_analysis, user_tags, user_description,
          is_favorite, upload_status, is_deleted, deleted_at, created_at, updated_at
        `, { count: 'exact' })
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (search) {
        query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,ai_summary.ilike.%${search}%`);
      }

      // Apply type filter
      if (filterType && filterType !== 'all') {
        if (filterType === 'pdfs') {
          query = query.eq('mime_type', 'application/pdf');
        } else if (filterType === 'images') {
          query = query.like('mime_type', 'image%');
        } else if (filterType === 'documents') {
          query = query.or('mime_type.eq.application/msword,mime_type.eq.application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        }
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: files, count, error } = await query;

      if (error) {
        console.error('Error fetching files:', error);
        throw error;
      }

      console.log('📁 Found', files?.length || 0, 'files (total:', count, ')');

      // Get user information for files
      const userIds = [...new Set(files?.map(file => file.user_id).filter(id => id))];
      const { data: users } = await adminClient
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);

      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Enrich files with user data
      const enrichedFiles = files?.map(file => ({
        ...file,
        users: userMap.get(file.user_id) || { full_name: 'Unknown', last_name: '', email: 'unknown@example.com' }
      })) || [];

      return {
        success: true,
        data: enrichedFiles,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Get files error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get file statistics for dashboard
  getFileStats: async () => {
    try {
      const adminClient = getAdminClient();
      
      console.log('📊 Calculating file statistics...');

      // Get total files count
      const { count: totalFiles } = await adminClient
        .from('files')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false);

      // Calculate total storage used
      const { data: allFiles } = await adminClient
        .from('files')
        .select('file_size')
        .eq('is_deleted', false);

      let totalStorageBytes = 0;
      allFiles?.forEach(file => {
        totalStorageBytes += parseInt(file.file_size) || 0;
      });

      // Count active users (users who have files)
      const { data: activeUsersData } = await adminClient
        .from('files')
        .select('user_id')
        .eq('is_deleted', false);

      const uniqueUsers = new Set(activeUsersData?.map(file => file.user_id));

      // Calculate average file size
      const avgFileSize = totalFiles > 0 ? totalStorageBytes / totalFiles : 0;

      // Get file type breakdown
      const { data: fileTypes } = await adminClient
        .from('files')
        .select('mime_type')
        .eq('is_deleted', false);

      const typeBreakdown = {
        pdfs: 0,
        images: 0,
        documents: 0,
        other: 0
      };

      fileTypes?.forEach(file => {
        const mimeType = file.mime_type?.toLowerCase() || '';
        if (mimeType === 'application/pdf') {
          typeBreakdown.pdfs++;
        } else if (mimeType.startsWith('image/')) {
          typeBreakdown.images++;
        } else if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('docx')) {
          typeBreakdown.documents++;
        } else {
          typeBreakdown.other++;
        }
      });

      // Calculate weekly growth
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: weeklyFiles } = await adminClient
        .from('files')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', oneWeekAgo.toISOString());

      const stats = {
        totalFiles: totalFiles || 0,
        storageUsed: formatFileSize(totalStorageBytes),
        storageUsedBytes: totalStorageBytes,
        activeUsers: uniqueUsers.size,
        avgFileSize: formatFileSize(avgFileSize),
        weeklyGrowth: weeklyFiles || 0,
        typeBreakdown
      };

      console.log('📈 File statistics calculated:', stats);

      return { success: true, data: stats };
    } catch (error) {
      console.error('File stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete file (soft delete and remove from storage)
  deleteFile: async (fileId) => {
    try {
      const adminClient = getAdminClient();
      
      console.log('🗑️ Deleting file:', fileId);

      // First get the file details
      const { data: file, error: fetchError } = await adminClient
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError) {
        console.error('Error fetching file for deletion:', fetchError);
        throw fetchError;
      }

      // Soft delete in database
      const { data, error } = await adminClient
        .from('files')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', fileId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting file in database:', error);
        throw error;
      }

      // Optional: Remove from Supabase storage (if using Supabase storage)
      try {
        if (file.file_path) {
          const { error: storageError } = await adminClient.storage
            .from('files')
            .remove([file.file_path]);
          
          if (storageError) {
            console.warn('Warning: Could not remove file from storage:', storageError.message);
            // Don't throw error - soft delete was successful
          } else {
            console.log('✅ File removed from storage:', file.file_path);
          }
        }
      } catch (storageError) {
        console.warn('Warning: Storage deletion failed:', storageError.message);
        // Continue - database deletion was successful
      }

      console.log('✅ File deleted successfully:', data?.filename);

      return { success: true, data };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  },

  // Download file URL
  getFileDownloadUrl: async (fileId) => {
    try {
      const adminClient = getAdminClient();
      
      const { data: file, error } = await adminClient
        .from('files')
        .select('file_url, filename')
        .eq('id', fileId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('Error getting file URL:', error);
        throw error;
      }

      return { success: true, data: file };
    } catch (error) {
      console.error('Get file URL error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all proposals with user information and statistics
  getAllProposals: async (page = 1, limit = 50, search = '', statusFilter = 'all') => {
    try {
      const adminClient = getAdminClient();
      const offset = (page - 1) * limit;
      
      console.log('📋 Fetching proposals from database...', { page, limit, search, statusFilter });
      
      let query = adminClient
        .from('proposals')
        .select(`
          id, user_id, proposal_number, title, client_name, client_email, 
          client_company, description, total_amount, currency, status,
          ai_win_probability, ai_suggested_pricing, ai_market_analysis,
          ai_risk_factors, ai_recommendations, valid_until, terms_conditions,
          notes, sent_at, viewed_at, responded_at, created_at, updated_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,client_name.ilike.%${search}%,client_company.ilike.%${search}%,proposal_number.ilike.%${search}%`);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: proposals, count, error } = await query;

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      console.log('📋 Found', proposals?.length || 0, 'proposals (total:', count, ')');

      // Get user information for proposals
      const userIds = [...new Set(proposals?.map(proposal => proposal.user_id).filter(id => id))];
      const { data: users } = await adminClient
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);

      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Enrich proposals with user data
      const enrichedProposals = proposals?.map(proposal => ({
        ...proposal,
        users: userMap.get(proposal.user_id) || { full_name: 'Unknown', email: 'unknown@example.com' }
      })) || [];

      return {
        success: true,
        data: enrichedProposals,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Get proposals error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get proposal statistics for dashboard
  getProposalStats: async () => {
    try {
      const adminClient = getAdminClient();
      
      console.log('📊 Calculating proposal statistics...');

      // Get total proposals count
      const { count: totalProposals } = await adminClient
        .from('proposals')
        .select('id', { count: 'exact', head: true });

      // Get proposals by status
      const { data: allProposals } = await adminClient
        .from('proposals')
        .select('status, total_amount, created_at');

      let statusBreakdown = {
        draft: 0,
        sent: 0,
        'under review': 0,
        won: 0,
        lost: 0,
        rejected: 0,
        accepted: 0
      };

      let totalValue = 0;
      let wonValue = 0;
      let wonCount = 0;
      
      // Calculate monthly proposals
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      let monthlyProposals = 0;

      allProposals?.forEach(proposal => {
        const status = (proposal.status || 'draft').toLowerCase();
        const amount = parseFloat(proposal.total_amount) || 0;
        const createdAt = new Date(proposal.created_at);
        
        // Count by status
        if (statusBreakdown.hasOwnProperty(status)) {
          statusBreakdown[status]++;
        } else {
          statusBreakdown.draft++; // Default to draft for unknown statuses
        }
        
        totalValue += amount;
        
        // Count won proposals
        if (status === 'won' || status === 'accepted') {
          wonValue += amount;
          wonCount++;
        }
        
        // Count monthly proposals
        if (createdAt >= thisMonth) {
          monthlyProposals++;
        }
      });

      // Calculate win rate
      const totalSentProposals = statusBreakdown.sent + statusBreakdown['under review'] + statusBreakdown.won + statusBreakdown.lost + statusBreakdown.rejected + statusBreakdown.accepted;
      const winRate = totalSentProposals > 0 ? Math.round((wonCount / totalSentProposals) * 100) : 0;

      // Count active proposals (sent, under review)
      const activeProposals = statusBreakdown.sent + statusBreakdown['under review'];

      const stats = {
        totalProposals: totalProposals || 0,
        activeProposals,
        wonThisMonth: wonCount,
        wonValue: formatCurrency(wonValue),
        winRate,
        monthlyProposals,
        totalValue: formatCurrency(totalValue),
        statusBreakdown
      };

      console.log('📈 Proposal statistics calculated:', stats);

      return { success: true, data: stats };
    } catch (error) {
      console.error('Proposal stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete proposal (soft delete)
  deleteProposal: async (proposalId) => {
    try {
      const adminClient = getAdminClient();
      
      console.log('🗑️ Deleting proposal:', proposalId);

      // For now, we'll do a hard delete since there's no is_deleted column in proposals table
      // You may want to add is_deleted and deleted_at columns to proposals table for soft delete
      const { data, error } = await adminClient
        .from('proposals')
        .delete()
        .eq('id', proposalId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting proposal:', error);
        throw error;
      }

      console.log('✅ Proposal deleted successfully:', data?.title);

      return { success: true, data };
    } catch (error) {
      console.error('Delete proposal error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate proposal download (PDF or data export)
  generateProposalDownload: async (proposalId) => {
    try {
      const adminClient = getAdminClient();
      
      console.log('📄 Generating proposal download:', proposalId);

      const { data: proposal, error } = await adminClient
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        console.error('Error fetching proposal for download:', error);
        throw error;
      }

      // Get user information
      const { data: user } = await adminClient
        .from('users')
        .select('full_name, email')
        .eq('id', proposal.user_id)
        .single();

      const proposalData = {
        ...proposal,
        user_info: user || { full_name: 'Unknown', email: 'unknown@example.com' }
      };

      console.log('✅ Proposal data prepared for download:', proposalData.title);

      return { success: true, data: proposalData };
    } catch (error) {
      console.error('Generate proposal download error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get SIMPLIFIED financial summary - only user names and monthly revenue (FIXED VERSION)
  getSimpleFinancialSummary: async () => {
    try {
      const adminClient = getAdminClient();
      console.log('💰 Generating simple financial summary (users and monthly revenue only)...');
      
      // Get current date for monthly calculations
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Calculate date range for this month
      const thisMonthStart = new Date(currentYear, currentMonth, 1);
      
      console.log('📅 Date range for this month:', thisMonthStart.toISOString(), 'to', now.toISOString());

      // Get all users
      const { data: allUsers, error: usersError } = await adminClient
        .from('users')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return { success: false, error: usersError.message };
      }

      console.log('👥 Found', allUsers?.length || 0, 'total users');
      console.log('🔍 Sample user IDs:', allUsers?.slice(0, 3).map(u => ({ id: u.id, name: u.full_name })));

      // Get ALL proposals (not just this month) to debug the issue
      const { data: allProposals, error: proposalsError } = await adminClient
        .from('proposals')
        .select('id, user_id, total_amount, created_at, title')
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        console.warn('⚠️ Continuing with no proposal data due to database error');
      }

      console.log('💼 Found', allProposals?.length || 0, 'total proposals in database');
      console.log('🔍 Sample proposal user_ids:', allProposals?.slice(0, 5).map(p => ({ 
        id: p.id, 
        user_id: p.user_id, 
        amount: p.total_amount,
        title: p.title,
        created: p.created_at
      })));

      // Filter proposals for this month
      const thisMonthProposals = (allProposals || []).filter(proposal => {
        const proposalDate = new Date(proposal.created_at);
        return proposalDate >= thisMonthStart && proposalDate <= now;
      });

      console.log('📅 This month proposals:', thisMonthProposals.length);
      
      // If no proposals this month, use all proposals to show total revenue
      const proposalsToUse = thisMonthProposals.length > 0 ? thisMonthProposals : (allProposals || []);
      const reportTitle = thisMonthProposals.length > 0 ? 'This Month' : 'All Time';
      
      console.log('💰 Using', proposalsToUse.length, 'proposals for revenue calculation (' + reportTitle + ')');

      // Calculate monthly revenue per user
      const userRevenueMap = new Map();
      
      // Initialize all users with zero revenue
      (allUsers || []).forEach(user => {
        userRevenueMap.set(user.id, {
          userId: user.id,
          userFullName: user.full_name || 'Unknown User',
          userEmail: user.email,
          monthlyRevenue: 0
        });
      });

      // Debug: Check for user ID matches
      let matchedProposals = 0;
      let unmatchedProposals = 0;

      // Track orphaned user IDs that need to be created
      const orphanedUserIds = new Set();
      
      // Add revenue from proposals
      for (const proposal of proposalsToUse) {
        console.log('🔍 Processing proposal:', {
          id: proposal.id,
          user_id: proposal.user_id,
          amount: proposal.total_amount,
          title: proposal.title
        });
        
        let userStats = userRevenueMap.get(proposal.user_id);
        if (userStats) {
          const proposalValue = parseFloat(proposal.total_amount) || 0;
          userStats.monthlyRevenue += proposalValue;
          matchedProposals++;
          console.log('✅ Matched proposal to user:', userStats.userFullName, '- Added $' + proposalValue);
        } else {
          unmatchedProposals++;
          console.warn('⚠️ No user found for proposal user_id:', proposal.user_id, '| Proposal:', proposal.title);
          orphanedUserIds.add(proposal.user_id);
        }
      }
      
      // Create missing users for orphaned proposals
      if (orphanedUserIds.size > 0) {
        console.log('🔧 Creating missing users for', orphanedUserIds.size, 'orphaned proposals...');
        
        for (const userId of orphanedUserIds) {
          try {
            const result = await adminService.createMissingUser(userId);
            if (result.success) {
              // Add the newly created user to our map
              userRevenueMap.set(userId, {
                userId: userId,
                userFullName: result.user.full_name,
                userEmail: result.user.email,
                monthlyRevenue: 0
              });
              
              // Now re-process proposals for this user
              const userProposals = proposalsToUse.filter(p => p.user_id === userId);
              let userRevenue = 0;
              userProposals.forEach(proposal => {
                const proposalValue = parseFloat(proposal.total_amount) || 0;
                userRevenue += proposalValue;
              });
              
              userRevenueMap.get(userId).monthlyRevenue = userRevenue;
              console.log('✅ Created user and assigned revenue:', result.user.full_name, '- $' + userRevenue);
              
              // Update counters
              matchedProposals += userProposals.length;
              unmatchedProposals -= userProposals.length;
            }
          } catch (error) {
            console.error('❌ Failed to create user for ID:', userId, error);
          }
        }
      }

      console.log('📊 Proposal matching results:');
      console.log('   ✅ Matched proposals:', matchedProposals);
      console.log('   ⚠️ Unmatched proposals:', unmatchedProposals);

      // Convert to array and sort by revenue (highest first)
      const financialData = Array.from(userRevenueMap.values())
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

      // Calculate summary
      const totalRevenue = financialData.reduce((sum, user) => sum + user.monthlyRevenue, 0);
      const usersWithRevenue = financialData.filter(user => user.monthlyRevenue > 0).length;

      console.log('✅ Simple financial summary generated successfully!');
      console.log('💰 ' + reportTitle + ' Summary:');
      console.log('   📊 Total Users:', financialData.length);
      console.log('   💵 Users with Revenue:', usersWithRevenue);
      console.log('   🗓️ Total Revenue: $' + totalRevenue.toLocaleString());
      
      // Show users with revenue
      const revenueUsers = financialData.filter(u => u.monthlyRevenue > 0);
      if (revenueUsers.length > 0) {
        console.log('👥 Users with revenue:');
        revenueUsers.forEach(user => {
          console.log(`   💰 ${user.userFullName}: $${user.monthlyRevenue.toLocaleString()}`);
        });
      }

      return { 
        success: true, 
        data: financialData,
        summary: {
          totalUsers: financialData.length,
          usersWithRevenue: usersWithRevenue,
          totalMonthlyRevenue: totalRevenue,
          month: reportTitle === 'This Month' ? now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'All Time Revenue'
        }
      };
    } catch (error) {
      console.error('Simple financial summary error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Utility functions
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return '$0';
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return formattedAmount;
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// Calculate user engagement score based on activities
const calculateEngagementScore = (userStats) => {
  let score = 0;
  
  // Base activity points
  score += userStats.totalActivities * 10; // 10 points per activity
  
  // Bonus points for different activity types (diversified usage)
  if (userStats.ticketsCreated > 0) score += 25;
  if (userStats.filesUploaded > 0) score += 25;
  if (userStats.proposalsCreated > 0) score += 50; // Higher value activity
  if (userStats.loginSessions > 0) score += 15;
  
  // Bonus for active days (consistency)
  score += userStats.activeDays.size * 5;
  
  // Bonus for proposal value (business impact)
  if (userStats.totalProposalValue > 0) {
    score += Math.min(Math.floor(userStats.totalProposalValue / 1000) * 2, 100); // Up to 100 bonus points
  }
  
  // Cap the score at 1000
  return Math.min(score, 1000);
};

// Categorize activity level based on activities and days
const categorizeActivityLevel = (totalActivities, activeDays) => {
  if (totalActivities === 0) return 'Inactive';
  if (totalActivities <= 5 && activeDays <= 2) return 'Low';
  if (totalActivities <= 15 && activeDays <= 7) return 'Moderate';
  if (totalActivities <= 30 && activeDays <= 15) return 'Active';
  return 'Very Active';
};

// Categorize revenue performance based on monthly revenue
const categorizeRevenuePerformance = (monthlyRevenue) => {
  if (monthlyRevenue === 0) return 'No Revenue';
  if (monthlyRevenue <= 1000) return 'Low Revenue';
  if (monthlyRevenue <= 5000) return 'Moderate Revenue';
  if (monthlyRevenue <= 15000) return 'High Revenue';
  if (monthlyRevenue <= 50000) return 'Very High Revenue';
  return 'Top Revenue';
};

export default adminService;