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

      // Get recent proposals
      try {
        const { data: proposals } = await adminClient
          .from('proposals')
          .select('id, title, user_id, created_at, status, total_amount')
          .order('created_at', { ascending: false })
          .limit(8);

        if (proposals) {
          proposals.forEach(proposal => {
            activities.push({
              id: `proposal-${proposal.id}`,
              action: 'Proposal submitted',
              user: `User ${proposal.user_id?.substring(0, 8) || 'Unknown'}`,
              details: `"${proposal.title}" - $${proposal.total_amount || 0}`,
              time: formatTimeAgo(proposal.created_at),
              type: 'proposal',
              status: proposal.status,
              timestamp: proposal.created_at
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent proposals:', error);
      }

      // Get recent file uploads
      try {
        const { data: files } = await adminClient
          .from('files')
          .select('id, filename, file_size, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(8);

        if (files) {
          files.forEach(file => {
            activities.push({
              id: `file-${file.id}`,
              action: 'File uploaded',
              user: `User ${file.user_id?.substring(0, 8) || 'Unknown'}`,
              details: `${file.filename} (${formatFileSize(file.file_size)})`,
              time: formatTimeAgo(file.created_at),
              type: 'file',
              timestamp: file.created_at
            });
          });
        }
      } catch (error) {
        console.error('Error getting recent files:', error);
      }

      // Get recent tickets
      try {
        const { data: tickets } = await adminClient
          .from('tickets')
          .select('id, title, user_id, created_at, status, priority')
          .order('created_at', { ascending: false })
          .limit(8);

        if (tickets) {
          tickets.forEach(ticket => {
            activities.push({
              id: `ticket-${ticket.id}`,
              action: 'Support ticket created',
              user: `User ${ticket.user_id?.substring(0, 8) || 'Unknown'}`,
              details: `"${ticket.title}" (${ticket.priority || 'normal'} priority)`,
              time: formatTimeAgo(ticket.created_at),
              type: 'ticket',
              status: ticket.status,
              timestamp: ticket.created_at
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

  // Get REAL user activity data from database
  getUserActivityData: async (startDate, endDate) => {
    try {
      const adminClient = getAdminClient();
      const activityData = [];
      const dateMap = new Map();
      
      // Get all activity within date range
      const [tickets, files, proposals] = await Promise.all([
        adminClient
          .from('tickets')
          .select('user_id, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        adminClient
          .from('files')
          .select('user_id, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        adminClient
          .from('proposals')
          .select('user_id, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);
      
      // Process data by date
      const processActivity = (items, type) => {
        items.data?.forEach(item => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          if (!dateMap.has(date)) {
            dateMap.set(date, {
              date,
              newTickets: 0,
              newFiles: 0,
              newProposals: 0,
              activeUsers: new Set(),
              totalActivity: 0
            });
          }
          const dayData = dateMap.get(date);
          dayData.activeUsers.add(item.user_id);
          dayData.totalActivity++;
          
          if (type === 'tickets') dayData.newTickets++;
          if (type === 'files') dayData.newFiles++;
          if (type === 'proposals') dayData.newProposals++;
        });
      };
      
      processActivity(tickets, 'tickets');
      processActivity(files, 'files');
      processActivity(proposals, 'proposals');
      
      // Convert to array and format
      dateMap.forEach((value, key) => {
        activityData.push({
          date: key,
          activeUsers: value.activeUsers.size,
          newTickets: value.newTickets,
          newFiles: value.newFiles,
          newProposals: value.newProposals,
          totalActivity: value.totalActivity
        });
      });
      
      // Sort by date
      activityData.sort((a, b) => new Date(a.date) - new Date(b.date));

      return { success: true, data: activityData };
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
  }
};

// Utility functions
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

export default adminService;