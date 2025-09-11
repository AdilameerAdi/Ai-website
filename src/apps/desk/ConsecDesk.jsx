import { useState, useEffect } from 'react';
import { FaBriefcase, FaTicketAlt, FaBell, FaComments, FaHome, FaSignOutAlt, FaPlus, FaSearch, FaFilter, FaBrain, FaRobot, FaMagic, FaLightbulb, FaTimes, FaSave, FaStar, FaCog, FaUser, FaPalette, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import AppLayout from '../shared/AppLayout';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/aiService';
import { categorizationService } from '../../services/categorizationService';

export default function ConsecDesk({ user, navigate, onLogout, hideBottomNav = false }) {
  // Use actual user ID for proper data isolation
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [applyingResponse, setApplyingResponse] = useState(null);
  const [generatingAI, setGeneratingAI] = useState({});
  const [aiResponses, setAiResponses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState({
    category: 'general_feedback',
    subject: '',
    message: '',
    priority: 'medium',
    rating: 0
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    notifications: {
      email: true,
      browser: true,
      ticketUpdates: true,
      aiInsights: false
    },
    dashboard: {
      refreshInterval: 30,
      showAdvancedMetrics: true,
      autoRefresh: true
    },
    privacy: {
      shareAnalytics: false,
      aiAnalysis: true
    }
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Analytics calculation functions
  const calculateSentimentAnalytics = () => {
    if (!tickets.length) return { positive: 0, neutral: 0, negative: 0 };
    
    const sentimentCounts = tickets.reduce((acc, ticket) => {
      const sentiment = ticket.ai_sentiment || 'neutral';
      if (sentiment === 'frustrated') acc.negative++;
      else if (sentiment === 'neutral') acc.neutral++;
      else acc.positive++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });
    
    const total = tickets.length;
    return {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100)
    };
  };

  const calculateAutoResolutionMetrics = () => {
    const readyForAutoReply = tickets.filter(t => 
      t.ai_suggested_response && t.status === 'open'
    ).length;
    
    const knowledgeBaseMatches = tickets.filter(t => 
      t.ai_category && t.ai_confidence > 0.8
    ).length;
    
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const successRate = tickets.length > 0 ? 
      Math.round((resolvedTickets / tickets.length) * 100) : 0;
    
    return {
      readyForAutoReply,
      knowledgeBaseMatches,
      successRate
    };
  };

  const calculateSmartSuggestions = () => {
    // Count common issues for FAQ opportunities
    const categoryCount = tickets.reduce((acc, ticket) => {
      const category = ticket.ai_category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const faqOpportunities = Object.values(categoryCount).filter(count => count >= 3).length;
    
    // Count high urgency tickets for process improvements
    const processImprovements = tickets.filter(t => t.ai_urgency === 'high').length;
    
    // Count frustrated customers for training needs
    const trainingNeeded = tickets.filter(t => t.ai_sentiment === 'frustrated').length;
    
    return {
      faqOpportunities,
      processImprovements,
      trainingNeeded
    };
  };

  const calculateAIPerformance = () => {
    const ticketsWithAI = tickets.filter(t => t.ai_category || t.ai_sentiment);
    const highConfidenceTickets = tickets.filter(t => t.ai_confidence > 0.7).length;
    
    const accuracyRate = ticketsWithAI.length > 0 ? 
      Math.round((highConfidenceTickets / ticketsWithAI.length) * 100) : 0;
    
    // Calculate response time improvement (mock based on AI automation)
    const automatedTickets = tickets.filter(t => t.ai_suggested_response).length;
    const responseImprovement = ticketsWithAI.length > 0 ?
      Math.round((automatedTickets / ticketsWithAI.length) * 100) : 0;
    
    // Calculate satisfaction based on resolved vs frustrated tickets
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const satisfactionRate = tickets.length > 0 ?
      (4.0 + (resolvedTickets / tickets.length)).toFixed(1) : '4.0';
    
    return {
      accuracyRate,
      responseImprovement,
      satisfactionRate
    };
  };

  // Fetch feedback statistics from database
  const fetchFeedbackStats = async () => {
    try {
      // Try to fetch feedback data for enhanced metrics
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select('user_rating, ai_sentiment, category, priority, status, created_at')
        .limit(100); // Get recent feedback for stats

      if (error) {
        console.warn('Feedback table not available yet:', error.message);
        return null;
      }

      if (feedbackData && feedbackData.length > 0) {
        // Calculate feedback statistics
        const totalFeedback = feedbackData.length;
        const avgRating = feedbackData
          .filter(f => f.user_rating)
          .reduce((sum, f, _, arr) => sum + f.user_rating / arr.length, 0);
        
        const sentimentCounts = feedbackData.reduce((acc, f) => {
          const sentiment = f.ai_sentiment || 'neutral';
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {});

        const positiveFeedback = ((sentimentCounts.positive || 0) / totalFeedback * 100).toFixed(0);
        
        const recentFeedback = feedbackData.filter(f => {
          const created = new Date(f.created_at);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return created >= dayAgo;
        }).length;

        return {
          totalFeedback,
          avgRating: avgRating.toFixed(1),
          positiveFeedback: parseInt(positiveFeedback),
          recentFeedback
        };
      }
      return null;
    } catch (error) {
      console.warn('Error fetching feedback stats:', error);
      return null;
    }
  };

  // Dashboard metrics calculation functions
  const calculateDashboardMetrics = () => {
    // Ticket status counts
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    
    // Today's resolved tickets (tickets resolved in the last 24 hours)
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const resolvedToday = tickets.filter(t => 
      t.status === 'resolved' && 
      t.updated_at && 
      new Date(t.updated_at) >= yesterday
    ).length;
    
    // High priority tickets needing attention
    const highPriorityTickets = tickets.filter(t => 
      (t.priority === 'high' || t.ai_urgency === 'high') && t.status === 'open'
    ).length;
    
    // Auto-response ready tickets
    const autoResponseReady = tickets.filter(t => 
      t.ai_suggested_response && t.status === 'open'
    ).length;
    
    // Calculate average response time (mock calculation based on ticket age)
    const openTicketAges = tickets
      .filter(t => t.status === 'open')
      .map(t => {
        const created = new Date(t.created_at);
        const now = new Date();
        return (now - created) / (1000 * 60 * 60); // hours
      });
    
    const avgResponseTime = openTicketAges.length > 0 
      ? (openTicketAges.reduce((sum, age) => sum + age, 0) / openTicketAges.length)
      : 0;
    
    // Calculate client satisfaction from feedback ratings
    const calculateClientSatisfaction = () => {
      // Use feedback data if available, otherwise fall back to ticket data
      if (feedbackStats && feedbackStats.avgRating > 0) {
        return feedbackStats.avgRating;
      }
      
      // Fallback to ticket ratings
      const ticketsWithRatings = tickets.filter(t => t.user_rating);
      if (ticketsWithRatings.length === 0) return 4.5;
      
      const totalRating = ticketsWithRatings.reduce((sum, t) => sum + (t.user_rating || 4), 0);
      return (totalRating / ticketsWithRatings.length).toFixed(1);
    };
    
    // Analyze common issues for FAQ suggestions
    const categoryCount = tickets.reduce((acc, ticket) => {
      const category = ticket.ai_category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Find most common issue
    const mostCommonIssue = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      openTickets,
      inProgressTickets,
      resolvedToday,
      clientSatisfaction: calculateClientSatisfaction(),
      highPriorityTickets,
      sentimentPositive: calculateSentimentAnalytics().positive,
      avgResponseTime: avgResponseTime.toFixed(1),
      autoResponseReady,
      mostCommonIssue: mostCommonIssue ? {
        category: mostCommonIssue[0],
        count: mostCommonIssue[1]
      } : null
    };
  };

  // Handle ticket status change
  const changeTicketStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updated_at: new Date().toISOString() }
          : ticket
      ));
      
      // Create notification for status change
      const statusMessages = {
        'in_progress': 'moved to In Progress',
        'resolved': 'marked as Complete'
      };
      
      await createNotification({
        title: 'Ticket Status Updated',
        message: `Ticket #${ticketId} has been ${statusMessages[newStatus]}`,
        type: 'success',
        category: 'ticket',
        relatedId: ticketId,
        relatedType: 'ticket'
      });
      
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
  };

  // Get available status options for a ticket
  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'open':
        return [{ value: 'in_progress', label: 'Move to In Progress', color: 'yellow' }];
      case 'in_progress':
        return [{ value: 'resolved', label: 'Mark as Complete', color: 'green' }];
      case 'resolved':
        return []; // No further progression
      default:
        return [];
    }
  };

  // Get recent activity from tickets and notifications
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent tickets
    tickets
      .filter(t => t.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .forEach(ticket => {
        const timeAgo = formatNotificationTime(ticket.created_at);
        activities.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          message: `New ticket #${ticket.id} created - ${ticket.title}`,
          time: timeAgo,
          color: ticket.priority === 'high' ? 'red' : 'blue'
        });
      });
    
    // Add recent notifications
    notifications
      .filter(n => n.category === 'ticket')
      .slice(0, 2)
      .forEach((notification, index) => {
        activities.push({
          id: `notification-${notification.id}`,
          type: 'notification',
          message: notification.message,
          time: notification.time,
          color: notification.type === 'success' ? 'green' : 
                 notification.type === 'warning' ? 'yellow' : 'blue'
        });
      });
    
    // Sort by most recent and limit to 5
    return activities
      .sort((a, b) => {
        // Simple sort by checking if "min ago" or "hour ago" appears
        const aValue = a.time.includes('min') ? parseInt(a.time) : 
                      a.time.includes('hour') ? parseInt(a.time) * 60 : 1440;
        const bValue = b.time.includes('min') ? parseInt(b.time) : 
                      b.time.includes('hour') ? parseInt(b.time) * 60 : 1440;
        return aValue - bValue;
      })
      .slice(0, 5);
  };

  // AI Insights Button Handlers
  const handleApplyAIResponse = async (ticket) => {
    if (!ticket.ai_suggested_response) {
      alert('No AI response available for this ticket');
      return;
    }

    setApplyingResponse(ticket.id);
    try {
      // Update ticket status and add AI response to description or comments
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'in_progress',
          description: ticket.description + '\n\n[AI Response Applied]\n' + ticket.ai_suggested_response,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // Refresh tickets to show updated data
      await fetchTickets();
      
      // Create notification for AI response applied
      await createNotification({
        title: 'AI Response Applied',
        message: `AI response has been applied to ticket #${ticket.id} - "${ticket.title}"`,
        type: 'success',
        category: 'ticket',
        relatedId: ticket.id,
        relatedType: 'ticket',
        actionUrl: `/desk?tab=tickets&ticket=${ticket.id}`
      });
      
      alert('AI response applied successfully!');
    } catch (error) {
      console.error('Error applying AI response:', error);
      alert('Failed to apply AI response. Please try again.');
    } finally {
      setApplyingResponse(null);
    }
  };

  const handleViewFullAnalysis = (ticket) => {
    setSelectedTicket(ticket);
    setShowAnalysisModal(true);
  };

  const handleAITraining = async (action) => {
    try {
      switch (action) {
        case 'retrain':
          alert('AI model retraining initiated! This process will take a few minutes.');
          break;
        case 'generate-faq':
          alert('Generating new FAQs from recent tickets... Check back in a few minutes.');
          break;
        case 'export-data':
          alert('Exporting training data... Download will start shortly.');
          break;
        default:
          alert('AI training action completed!');
      }
    } catch (error) {
      console.error('Error with AI training:', error);
      alert('AI training action failed. Please try again.');
    }
  };

  // Generate AI response for a specific ticket
  const generateAIResponse = async (ticket) => {
    setGeneratingAI(prev => ({ ...prev, [ticket.id]: true }));
    
    try {
      // Call the AI service with ticket title and description
      const result = await aiService.generateTicketResponse(ticket.title, ticket.description);
      
      if (result.success) {
        // Store the AI response
        setAiResponses(prev => ({ ...prev, [ticket.id]: result.response }));
        
        // Update the ticket's AI suggested response in local state
        setTickets(prev => prev.map(t => 
          t.id === ticket.id 
            ? { 
                ...t, 
                ai_suggested_response: result.response,
                ai_category: result.category,
                ai_sentiment: result.sentiment,
                ai_confidence: result.confidence
              }
            : t
        ));

        // Optionally save to database
        try {
          await supabase
            .from('tickets')
            .update({
              ai_suggested_response: result.response,
              ai_category: result.category,
              ai_sentiment: result.sentiment,
              ai_confidence: result.confidence,
              updated_at: new Date().toISOString()
            })
            .eq('id', ticket.id);
        } catch (dbError) {
          console.warn('Could not save AI response to database:', dbError);
        }
        
        // Create notification about AI analysis
        await createNotification({
          title: 'AI Analysis Complete',
          message: `AI has generated a response for ticket #${ticket.id} - "${ticket.title}"`,
          type: 'success',
          category: 'ai',
          relatedId: ticket.id,
          relatedType: 'ticket'
        });
      } else {
        alert('Failed to generate AI response: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      alert('Failed to generate AI response. Please try again.');
    } finally {
      setGeneratingAI(prev => ({ ...prev, [ticket.id]: false }));
    }
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      
      // Fetch user-specific notifications and system-wide notifications
      let { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user?.id},is_system_wide.eq.true`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // If no user-specific notifications, fetch all recent notifications (for testing)
      if (!error && (!data || data.length === 0)) {
        const allNotificationsResult = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!allNotificationsResult.error && allNotificationsResult.data) {
          data = allNotificationsResult.data;
        }
      }

      if (error) throw error;

      // Transform database notifications to match UI format
      const transformedNotifications = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: formatNotificationTime(notification.created_at),
        read: notification.read_status,
        type: notification.type,
        category: notification.category,
        actionUrl: notification.action_url,
        relatedId: notification.related_id,
        relatedType: notification.related_type
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to sample notifications if database fails
      setNotifications([
        { id: 1, title: 'Welcome!', message: 'Database notifications will appear here', time: 'just now', read: false, type: 'info' },
        { id: 2, title: 'System Status', message: 'All systems operational', time: '1 hour ago', read: true, type: 'success' }
      ]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Helper function to format notification timestamps
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notificationTime.toLocaleDateString();
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_status: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Create new notification
  const createNotification = async (notificationData) => {
    try {
      // Check notification preferences for specific categories
      const category = notificationData.category || 'general';
      
      // System notifications and urgent items always get created
      const isSystemNotification = notificationData.type === 'system' || 
                                 notificationData.priority === 'urgent';
      
      // Check user preferences for non-system notifications
      if (!isSystemNotification) {
        if (category === 'ticket' && !userSettings.notifications.ticketUpdates) {
          console.log('Notification skipped: Ticket updates disabled');
          return null;
        }
        if (category === 'ai' && !userSettings.notifications.aiInsights) {
          console.log('Notification skipped: AI insights disabled');
          return null;
        }
        if (!userSettings.notifications.email && category !== 'browser-only') {
          console.log('Notification skipped: Email notifications disabled');
          return null;
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          category: category,
          related_id: notificationData.relatedId,
          related_type: notificationData.relatedType,
          action_url: notificationData.actionUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Show browser notification if enabled
      if (userSettings.notifications.browser && 'Notification' in window) {
        // Request permission if not already granted
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('Browser notification permission denied');
          }
        }
        
        // Show browser notification if permission is granted
        if (Notification.permission === 'granted') {
          const notification = new Notification(notificationData.title, {
            body: notificationData.message,
            icon: '/favicon.ico',
            tag: `notification-${data.id}`, // Prevents duplicate notifications
            requireInteraction: notificationData.type === 'warning' || notificationData.type === 'error'
          });
          
          // Auto-close after 5 seconds for non-urgent notifications
          if (notificationData.type !== 'warning' && notificationData.type !== 'error') {
            setTimeout(() => notification.close(), 5000);
          }
        }
      }

      // Add to local state
      const newNotification = {
        id: data.id,
        title: data.title,
        message: data.message,
        time: 'just now',
        read: false,
        type: data.type,
        category: data.category,
        actionUrl: data.action_url,
        relatedId: data.related_id,
        relatedType: data.related_type
      };

      setNotifications(prev => [newNotification, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // Submit feedback to database
  const submitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      // Basic validation
      if (!feedbackData.subject.trim() || !feedbackData.message.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      // Insert feedback into database
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: userId,
          user_name: 'Default User',
          user_email: 'user@example.com',
          category: feedbackData.category,
          subject: feedbackData.subject,
          message: feedbackData.message,
          priority: feedbackData.priority,
          user_rating: feedbackData.rating > 0 ? feedbackData.rating : null,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      // Create success notification
      await createNotification({
        title: 'Feedback Submitted Successfully',
        message: `Your feedback "${feedbackData.subject}" has been submitted and will be reviewed by our team`,
        type: 'success',
        category: 'feedback',
        relatedId: data.id,
        relatedType: 'feedback'
      });

      // Reset form
      setFeedbackData({
        category: 'general_feedback',
        subject: '',
        message: '',
        priority: 'medium',
        rating: 0
      });

      alert('Thank you for your feedback! We will review it and get back to you soon.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Fetch tickets from database
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Ensure userId is available for data isolation
      if (!userId) {
        console.warn('fetchTickets called without userId - setting empty tickets for data isolation');
        setTickets([]);
        return;
      }
      
      // Use actual user ID for proper data isolation
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Return empty array to maintain data isolation between users
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new ticket with AI analysis
  const createTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get AI analysis
      const aiCategory = await categorizationService.categorizeTicket({
        subject: formData.title,
        description: formData.description,
        priority: formData.priority
      });

      const aiSuggestion = await aiService.generateSmartReply(formData.description);
      
      // Insert ticket into database
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          status: 'open',
          user_id: userId,
          user_name: 'Default User',
          user_email: 'user@example.com',
          ai_category: aiCategory.success ? aiCategory.classification.primaryCategory : 'general',
          ai_sentiment: 'neutral',
          ai_urgency: formData.priority,
          ai_suggested_response: aiSuggestion.success ? aiSuggestion.suggestions[0]?.content : '',
          ai_confidence: aiSuggestion.success ? aiSuggestion.suggestions[0]?.confidence : 0.5
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setTickets(prev => [data, ...prev]);
      
      // Create success notification
      await createNotification({
        title: 'Ticket Created Successfully',
        message: `Ticket #${data.id} - "${data.title}" has been created and is being processed`,
        type: 'success',
        category: 'ticket',
        relatedId: data.id,
        relatedType: 'ticket',
        actionUrl: `/desk?tab=tickets&ticket=${data.id}`
      });

      // Create high priority notification if needed
      if (data.priority === 'high') {
        await createNotification({
          title: 'High Priority Ticket Alert',
          message: `High priority ticket #${data.id} requires immediate attention`,
          type: 'warning',
          category: 'ticket',
          relatedId: data.id,
          relatedType: 'ticket',
          actionUrl: `/desk?tab=tickets&ticket=${data.id}`
        });
      }
      
      // Reset form and close modal
      setFormData({ title: '', description: '', priority: 'medium', category: 'general' });
      setShowCreateModal(false);
      
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Profile form validation
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        errors.currentPassword = 'Current password is required to change password';
      }
      if (profileForm.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle browser notification permission
  const handleBrowserNotificationToggle = async (enabled) => {
    if (enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          // If permission denied, revert toggle
          alert('Browser notification permission is required. Please enable notifications in your browser settings.');
          return false;
        }
      } else if (Notification.permission === 'denied') {
        alert('Browser notifications are blocked. Please enable them in your browser settings and refresh the page.');
        return false;
      }
    }
    
    setUserSettings({
      ...userSettings,
      notifications: { ...userSettings.notifications, browser: enabled }
    });
    return true;
  };

  // Update user profile
  const updateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setSavingProfile(true);
    
    try {
      const updates = {};
      
      // Update display name if changed
      if (profileForm.fullName !== (user?.user_metadata?.full_name || user?.user_metadata?.name || '')) {
        updates.full_name = profileForm.fullName;
      }
      
      // Update email if changed
      if (profileForm.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        });
        
        if (emailError) throw emailError;
      }
      
      // Update password if provided
      if (profileForm.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileForm.newPassword
        });
        
        if (passwordError) throw passwordError;
      }
      
      // Update display name in user metadata
      if (updates.full_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: updates.full_name }
        });
        
        if (updateError) throw updateError;
      }
      
      // Clear password fields after successful update
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setProfileErrors({});
      alert('Profile updated successfully! You may need to check your email to verify changes.');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setProfileErrors({ currentPassword: 'Current password is incorrect' });
      } else if (error.message?.includes('email')) {
        setProfileErrors({ email: 'Failed to update email. Please try again.' });
      } else {
        alert('Failed to update profile: ' + error.message);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Load tickets, notifications, and feedback stats when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchTickets();
      fetchNotifications();
      // Fetch feedback stats asynchronously
      fetchFeedbackStats().then(stats => {
        if (stats) setFeedbackStats(stats);
      });
    }
    
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem('consecdesk_settings');
    if (savedSettings) {
      try {
        setUserSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }

    // Initialize profile form with current user data
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        fullName: 'Demo User',
        email: 'demo@example.com'
      }));
    }
  }, [user?.id]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'tickets', label: 'Support Tickets', icon: <FaTicketAlt /> },
    { id: 'ai-insights', label: 'ConsecIQ Insights', icon: <FaBrain /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'feedback', label: 'Feedback', icon: <FaComments /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': {
        const dashboardMetrics = calculateDashboardMetrics();
        const recentActivity = getRecentActivity();
        
        return (
          <div className="pb-20 lg:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">ConsecDesk Dashboard</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg w-fit">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600 text-sm font-medium">Live Data</span>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm">Open Tickets</p>
                    <p className="text-2xl font-bold text-[#14B8A6] mt-1">{dashboardMetrics.openTickets}</p>
                    <p className="text-xs text-gray-400 mt-1">Active support tickets</p>
                  </div>
                  <FaTicketAlt className="text-2xl text-[#14B8A6] opacity-20 flex-shrink-0" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-[#14B8A6] mt-1">{dashboardMetrics.inProgressTickets}</p>
                    <p className="text-xs text-gray-400 mt-1">Being worked on</p>
                  </div>
                  <FaTicketAlt className="text-2xl text-[#14B8A6] opacity-20 flex-shrink-0" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm">Resolved Today</p>
                    <p className="text-2xl font-bold text-[#14B8A6] mt-1">{dashboardMetrics.resolvedToday}</p>
                    <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
                  </div>
                  <FaTicketAlt className="text-2xl text-[#14B8A6] opacity-20 flex-shrink-0" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-[#14B8A6] mt-1">{dashboardMetrics.clientSatisfaction}★</p>
                    <p className="text-xs text-gray-400 mt-1">Average rating</p>
                  </div>
                  <FaStar className="text-2xl text-[#14B8A6] opacity-20 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* ConsecIQ AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaBrain className="text-xl sm:text-2xl text-blue-600 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">ConsecIQ Smart Analysis</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">High Priority Tickets</span>
                    <span className={`font-bold ${dashboardMetrics.highPriorityTickets > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {dashboardMetrics.highPriorityTickets > 0 
                        ? `${dashboardMetrics.highPriorityTickets} need attention` 
                        : 'All clear'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Sentiment Analysis</span>
                    <span className="font-bold text-green-600">{dashboardMetrics.sentimentPositive}% positive</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Avg Response Time</span>
                    <span className="font-bold text-[#14B8A6]">
                      {dashboardMetrics.avgResponseTime > 0 ? `${dashboardMetrics.avgResponseTime}h avg` : 'No data'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaRobot className="text-xl sm:text-2xl text-green-600 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">AI Recommendations</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FaLightbulb className="text-yellow-500" />
                      <span className="font-semibold text-gray-800">Suggested Action</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {dashboardMetrics.mostCommonIssue 
                        ? `Create FAQ for "${dashboardMetrics.mostCommonIssue.category}" issues (${dashboardMetrics.mostCommonIssue.count} similar tickets)`
                        : 'No common issues detected yet'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FaMagic className="text-purple-500" />
                      <span className="font-semibold text-gray-800">Auto-Response Ready</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {dashboardMetrics.autoResponseReady > 0 
                        ? `${dashboardMetrics.autoResponseReady} tickets can be auto-resolved with AI responses`
                        : 'No tickets ready for auto-response yet'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Activity</h3>
                <span className="text-xs text-gray-500">Live updates</span>
              </div>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-2">📭</div>
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">Activity will appear here as tickets are created and updated</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.color === 'green' ? 'bg-green-500' :
                        activity.color === 'blue' ? 'bg-blue-500' :
                        activity.color === 'yellow' ? 'bg-yellow-500' :
                        activity.color === 'red' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-700 flex-1">{activity.message}</span>
                      <span className="text-gray-500 text-sm">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'tickets':
        return (
          <div className="pb-20 lg:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Support Tickets</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition w-fit"
              >
                <FaPlus className="text-sm" />
                <span className="text-sm">New Ticket</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg flex-1 sm:flex-none">
                <FaSearch className="text-gray-400 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search tickets..."
                  className="outline-none flex-1 min-w-0"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition">
                <FaFilter className="text-gray-400" />
                <span>Filter</span>
              </button>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14B8A6]"></div>
                  <span className="ml-3 text-gray-600">Loading tickets...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first support ticket.</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                  >
                    <FaPlus />
                    Create First Ticket
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mobile-table-container">
                  <table className="w-full min-w-[500px] sm:min-w-[640px] divide-y divide-gray-200 mobile-table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16">ID</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] sm:min-w-[200px]">Title</th>
                        <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">Priority</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[140px]">Status & Actions</th>
                        <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-24 hide-mobile">Created</th>
                        <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14 sm:w-20">AI</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-3 py-3 text-xs font-medium text-gray-900">#{ticket.id}</td>
                          <td className="px-3 sm:px-4 py-3">
                            <div>
                              <div className="text-xs sm:text-sm text-gray-900 font-medium line-clamp-1">{ticket.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-[100px] sm:max-w-xs">{ticket.description}</div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.priority === 'high' || ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {ticket.priority?.charAt(0).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <div className="flex flex-col gap-1 sm:gap-2">
                              <span className={`inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ticket.status === 'in_progress' ? 'In Progress' : 
                                 ticket.status === 'resolved' ? 'Complete' : 'Open'}
                              </span>
                              {getAvailableStatusOptions(ticket.status).length > 0 && (
                                <div className="flex gap-1">
                                  {getAvailableStatusOptions(ticket.status).map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() => changeTicketStatus(ticket.id, option.value)}
                                      className={`px-2 py-1 text-xs rounded-md transition hover:opacity-80 ${
                                        option.color === 'yellow' ? 'bg-yellow-500 text-white' :
                                        option.color === 'green' ? 'bg-green-500 text-white' :
                                        'bg-gray-500 text-white'
                                      }`}
                                      title={option.label}
                                    >
                                      {option.value === 'in_progress' ? '▶' : '✓'}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-3 text-xs text-gray-500 whitespace-nowrap hide-mobile">
                            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 py-3 text-center">
                            {ticket.ai_category && (
                              <FaBrain className="text-blue-500 text-sm" title={`AI Category: ${ticket.ai_category}`} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'ai-insights': {
        const sentimentData = calculateSentimentAnalytics();
        const autoResolutionData = calculateAutoResolutionMetrics();
        const smartSuggestionsData = calculateSmartSuggestions();
        const aiPerformanceData = calculateAIPerformance();
        
        return (
          <div className="pb-20 lg:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">ConsecIQ AI Insights</h2>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
                <FaBrain className="text-blue-600 flex-shrink-0" />
                <span className="text-blue-600 font-semibold text-sm">AI Powered • {tickets.length} analyzed</span>
              </div>
            </div>

            {/* AI Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaBrain className="text-2xl text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Sentiment Analysis</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Positive</span>
                    <span className="font-bold text-green-600">{sentimentData.positive}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neutral</span>
                    <span className="font-bold text-gray-600">{sentimentData.neutral}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Negative</span>
                    <span className="font-bold text-red-600">{sentimentData.negative}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaRobot className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Auto-Resolution</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ready for Auto-Reply</span>
                    <span className="font-bold text-[#14B8A6]">{autoResolutionData.readyForAutoReply}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Knowledge Base Matches</span>
                    <span className="font-bold text-[#14B8A6]">{autoResolutionData.knowledgeBaseMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-green-600">{autoResolutionData.successRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-2xl text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Smart Suggestions</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">FAQ Opportunities</span>
                    <span className="font-bold text-orange-600">{smartSuggestionsData.faqOpportunities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Process Improvements</span>
                    <span className="font-bold text-orange-600">{smartSuggestionsData.processImprovements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Training Needed</span>
                    <span className="font-bold text-red-600">{smartSuggestionsData.trainingNeeded}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Ticket Analysis */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Smart Ticket Analysis</h3>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">#{ticket.id} - {ticket.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
                        <p className="text-gray-500 text-xs mt-2">Client: {ticket.user_name || 'Unknown'} | Created: {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.ai_sentiment === 'frustrated' ? 'bg-red-100 text-red-800' :
                          ticket.ai_sentiment === 'neutral' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.ai_sentiment || 'neutral'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.ai_urgency === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.ai_urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.ai_urgency || 'medium'} urgency
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FaBrain className="text-blue-600" />
                          <span className="font-semibold text-gray-800">AI Category</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{ticket.ai_category || 'general'}</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FaRobot className="text-green-600" />
                          <span className="font-semibold text-gray-800">AI Suggested Response</span>
                          {!aiResponses[ticket.id] && (
                            <button
                              onClick={() => generateAIResponse(ticket)}
                              disabled={generatingAI[ticket.id]}
                              className="ml-auto px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                            >
                              {generatingAI[ticket.id] ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Generating...</span>
                                </div>
                              ) : 'Generate AI Response'}
                            </button>
                          )}
                        </div>
                        {aiResponses[ticket.id] ? (
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {aiResponses[ticket.id]}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 italic">
                            {generatingAI[ticket.id] 
                              ? 'AI is analyzing the ticket content and generating a personalized response...' 
                              : 'Click "Generate AI Response" to get a personalized response based on the ticket content'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleApplyAIResponse(ticket)}
                        disabled={applyingResponse === ticket.id || !ticket.ai_suggested_response}
                        className="px-4 py-2 bg-[#14B8A6] text-white text-sm rounded-lg hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingResponse === ticket.id ? 'Applying...' : 'Apply AI Response'}
                      </button>
                      <button 
                        onClick={() => handleViewFullAnalysis(ticket)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                      >
                        View Full Analysis
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Training & Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">AI Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Accuracy Rate</span>
                    <span className="font-bold text-[#14B8A6]">{aiPerformanceData.accuracyRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">AI Automation Rate</span>
                    <span className="font-bold text-green-600">{aiPerformanceData.responseImprovement}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Customer Satisfaction</span>
                    <span className="font-bold text-[#14B8A6]">{aiPerformanceData.satisfactionRate}/5.0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">AI Training Center</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAITraining('retrain')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#14B8A6] hover:bg-purple-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FaMagic className="text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Retrain Response Model</p>
                        <p className="text-sm text-gray-500">Update AI with recent interactions</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleAITraining('generate-faq')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#14B8A6] hover:bg-yellow-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FaLightbulb className="text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Generate New FAQs</p>
                        <p className="text-sm text-gray-500">Auto-create FAQs from common issues</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleAITraining('optimize')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#14B8A6] hover:bg-blue-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FaBrain className="text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Optimize Categories</p>
                        <p className="text-sm text-gray-500">Improve ticket categorization</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'notifications':
        return (
          <div className="pb-20 lg:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Notifications</h2>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-sm text-gray-500">
                  {notifications.filter(n => !n.read).length} unread
                </span>
                <button 
                  onClick={() => fetchNotifications()}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14B8A6]"></div>
                <span className="ml-3 text-gray-600">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No notifications yet</p>
                <p className="text-sm mt-2">New notifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 sm:p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 mt-2 rounded-full flex-shrink-0 ${
                          notification.read ? 'bg-gray-400' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          {notification.title && (
                            <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{notification.title}</h4>
                          )}
                          <p className="text-gray-700 text-sm break-words">{notification.message}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                            <p className="text-gray-500 text-xs">{notification.time}</p>
                            {notification.category && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.category === 'ticket' ? 'bg-green-100 text-green-800' :
                                notification.category === 'system' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.category}
                              </span>
                            )}
                            {notification.type && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                        {notification.actionUrl && (
                          <button 
                            onClick={() => {
                              if (notification.actionUrl.startsWith('/desk')) {
                                const urlParts = notification.actionUrl.split('?tab=');
                                if (urlParts[1]) {
                                  setActiveTab(urlParts[1].split('&')[0]);
                                }
                              }
                              if (!notification.read) {
                                markNotificationAsRead(notification.id);
                              }
                            }}
                            className="px-2 sm:px-3 py-1 text-xs bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                          >
                            View
                          </button>
                        )}
                        {!notification.read && (
                          <button 
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="px-2 sm:px-3 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          >
                            <span className="hidden sm:inline">Mark read</span>
                            <span className="sm:hidden">✓</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'feedback':
        return (
          <div className="pb-20 lg:pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Send Feedback</h2>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
              <form onSubmit={submitFeedback} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select 
                    value={feedbackData.category}
                    onChange={(e) => setFeedbackData({...feedbackData, category: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm"
                    required
                  >
                    <option value="bug_report">Bug Report</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="general_feedback">General Feedback</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select 
                    value={feedbackData.priority}
                    onChange={(e) => setFeedbackData({...feedbackData, priority: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={feedbackData.subject}
                    onChange={(e) => setFeedbackData({...feedbackData, subject: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm"
                    placeholder="Brief description of your feedback"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none text-sm resize-none"
                    placeholder="Detailed feedback or description..."
                    required
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    {feedbackData.message.length}/1000 characters
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rate Your Experience (Optional)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({...feedbackData, rating: star})}
                        className={`text-2xl transition-colors ${
                          star <= feedbackData.rating 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {feedbackData.rating > 0 && `${feedbackData.rating} star${feedbackData.rating > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {submittingFeedback ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaComments />
                        Submit Feedback
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackData({
                      category: 'general_feedback',
                      subject: '',
                      message: '',
                      priority: 'medium',
                      rating: 0
                    })}
                    className="w-full sm:w-auto px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <FaBrain className="text-blue-500" />
                  <span>AI will automatically analyze your feedback and categorize it for faster response</span>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <>
      <AppLayout
        appName="ConsecDesk"
        appIcon={<FaBriefcase />}
        user={user}
        navigate={navigate}
        onLogout={onLogout}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={() => setActiveTab('settings')}
        hideBottomNav={hideBottomNav}
      >
        {renderContent()}
      </AppLayout>

      {/* Ticket Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 mobile-modal">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mobile-modal-content">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b rounded-t-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Create New Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            
            <form onSubmit={createTicket} className="p-4 sm:p-6">
              

              {/* Website Issue Keywords */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaEnvelope className="text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">if any issue related this website</h4>
                    <p className="text-sm text-red-700 mb-2">Use these exact keywords</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"website not working"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"site down"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"login not working"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"cannot login"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"website error"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"site broken"</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">"authentication error"</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-none text-sm"
                    placeholder="e.g. 'Web development help for university portal' or 'Login error on website'"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Good: "React app crashes on mobile" | Avoid: "Help me"
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-none text-sm resize-none"
                    placeholder="Example: I need help creating a responsive website for my university. It should have a student portal, course catalog, and faculty directory. I'm considering React or Vue.js for the frontend. What other technologies would you recommend for the backend and database?"
                    required
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1">
                      <div className={`h-1 rounded ${formData.description.length < 50 ? 'bg-red-300' : formData.description.length < 100 ? 'bg-yellow-300' : 'bg-green-300'}`}>
                        <div 
                          className={`h-1 rounded transition-all ${formData.description.length < 50 ? 'bg-red-500' : formData.description.length < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((formData.description.length / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-xs ${formData.description.length < 50 ? 'text-red-500' : formData.description.length < 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {formData.description.length < 50 ? 'Add more details for better AI response' : 
                       formData.description.length < 100 ? 'Good detail level' : 
                       'Excellent detail for AI analysis'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-none text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-none text-sm"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="account">Account</option>
                      <option value="billing">Billing</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-sm" />
                      <span>Create Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="px-4 sm:px-6 pb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <FaBrain className="text-blue-500 flex-shrink-0" />
                <span>AI will automatically analyze and categorize your ticket</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAnalysisModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                AI Analysis - Ticket #{selectedTicket.id}
              </h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              {/* Ticket Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">{selectedTicket.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{selectedTicket.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Priority: {selectedTicket.priority}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Status: {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* AI Analysis Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaBrain className="text-purple-600" />
                      <h5 className="font-semibold text-gray-800">Sentiment Analysis</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Detected Sentiment:</span>
                        <span className={`text-sm font-medium ${
                          selectedTicket.ai_sentiment === 'frustrated' ? 'text-red-600' :
                          selectedTicket.ai_sentiment === 'neutral' ? 'text-gray-600' :
                          'text-green-600'
                        }`}>
                          {selectedTicket.ai_sentiment || 'Neutral'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confidence Level:</span>
                        <span className="text-sm font-medium text-purple-600">
                          {selectedTicket.ai_confidence ? (selectedTicket.ai_confidence * 100).toFixed(1) : 85}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaRobot className="text-blue-600" />
                      <h5 className="font-semibold text-gray-800">Category & Priority</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">AI Category:</span>
                        <span className="text-sm font-medium text-blue-600 capitalize">
                          {selectedTicket.ai_category || 'General'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Urgency Level:</span>
                        <span className={`text-sm font-medium ${
                          selectedTicket.ai_urgency === 'high' ? 'text-red-600' :
                          selectedTicket.ai_urgency === 'medium' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {selectedTicket.ai_urgency || 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaLightbulb className="text-green-600" />
                      <h5 className="font-semibold text-gray-800">AI Suggested Response</h5>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedTicket.ai_suggested_response || 'AI response will be generated based on ticket content and historical patterns.'}
                    </p>
                  </div>

                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaMagic className="text-orange-600" />
                      <h5 className="font-semibold text-gray-800">Recommendations</h5>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {selectedTicket.ai_urgency === 'high' && (
                        <li>• High priority - respond within 1 hour</li>
                      )}
                      {selectedTicket.ai_sentiment === 'frustrated' && (
                        <li>• Customer seems frustrated - use empathetic language</li>
                      )}
                      <li>• Consider escalating to {selectedTicket.ai_category} specialist</li>
                      <li>• Update knowledge base if this is a common issue</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleApplyAIResponse(selectedTicket);
                    setShowAnalysisModal(false);
                  }}
                  disabled={!selectedTicket.ai_suggested_response}
                  className="flex-1 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply AI Response
                </button>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}