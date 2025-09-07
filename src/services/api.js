import { supabase } from '../lib/supabase.js';

export const apiService = {
  // Demo request submission
  submitDemoRequest: async (data) => {
    try {
      const leadData = {
        source: 'demo_request',
        email: data.email,
        full_name: data.fullName,
        company: data.company,
        phone: data.phone,
        message: data.message,
        interested_in: data.interestedIn || 'Full Platform Demo',
        company_size: data.companySize,
        current_solution: data.currentSolution,
        status: 'new'
      };

      const { data: result, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting demo request:', error);
      return { success: false, error: error.message };
    }
  },

  // Pricing inquiry submission
  submitPricingInquiry: async (data) => {
    try {
      const leadData = {
        source: 'pricing_inquiry',
        email: data.email,
        full_name: data.fullName,
        company: data.company,
        phone: data.phone,
        message: data.message,
        interested_in: data.planType || 'Pricing Information',
        company_size: data.companySize,
        current_solution: data.currentSolution,
        status: 'new'
      };

      const { data: result, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting pricing inquiry:', error);
      return { success: false, error: error.message };
    }
  },

  // Contact form submission
  submitContact: async (data) => {
    try {
      const leadData = {
        source: 'contact_form',
        email: data.email,
        full_name: data.fullName,
        company: data.company,
        phone: data.phone,
        message: data.message,
        interested_in: data.subject || 'General Inquiry',
        status: 'new'
      };

      const { data: result, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: error.message };
    }
  },

  // Roadmap app notification signup
  submitRoadmapNotification: async (data) => {
    try {
      const notificationData = {
        app_name: data.appName,
        email: data.email,
        full_name: data.fullName,
        additional_info: data.additionalInfo,
        notified: false
      };

      const { data: result, error } = await supabase
        .from('roadmap_notifications')
        .insert([notificationData])
        .select();

      if (error) {
        // Handle duplicate entries gracefully
        if (error.code === '23505') {
          return { success: false, error: 'You are already subscribed to notifications for this app.' };
        }
        throw error;
      }

      // Also create a lead entry for tracking
      const leadData = {
        source: 'roadmap_notify',
        email: data.email,
        full_name: data.fullName,
        interested_in: data.appName,
        message: `Signed up for ${data.appName} notifications. Additional info: ${data.additionalInfo}`,
        status: 'new'
      };

      await supabase.from('leads').insert([leadData]);

      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting roadmap notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Newsletter subscription
  submitNewsletterSignup: async (data) => {
    try {
      const leadData = {
        source: 'newsletter_signup',
        email: data.email,
        full_name: data.fullName,
        interested_in: 'Newsletter',
        message: 'Newsletter subscription',
        status: 'new'
      };

      const { data: result, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting newsletter signup:', error);
      return { success: false, error: error.message };
    }
  },

  // General feedback submission
  submitFeedback: async (data) => {
    try {
      const feedbackData = {
        user_id: data.userId || null,
        category: data.category,
        subject: data.subject,
        message: data.message,
        rating: data.rating || null,
        status: 'new'
      };

      const { data: result, error } = await supabase
        .from('feedback')
        .insert([feedbackData])
        .select();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all leads (for admin panel)
  getLeads: async (filters = {}) => {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { success: false, error: error.message };
    }
  },

  // Get roadmap notifications (for admin panel)
  getRoadmapNotifications: async (appName = null) => {
    try {
      let query = supabase
        .from('roadmap_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appName) {
        query = query.eq('app_name', appName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching roadmap notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Update lead status (for admin panel)
  updateLeadStatus: async (leadId, status, notes = null) => {
    try {
      const updateData = {
        status,
        last_contacted: status === 'contacted' ? new Date().toISOString() : null
      };

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating lead status:', error);
      return { success: false, error: error.message };
    }
  },

  // Password Reset Functions
  requestPasswordReset: async (email) => {
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return { success: false, error: 'No account found with this email address.' };
      }

      // Generate reset token (in production, use crypto.randomBytes)
      const resetToken = Math.random().toString(36).substr(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Store reset token in database
      const { error: tokenError } = await supabase
        .from('password_resets')
        .insert({
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (tokenError) throw tokenError;

      // In a real application, you would send an email here
      console.log(`Password reset requested for ${email}. Reset token: ${resetToken}`);
      
      return { success: true, message: 'Password reset instructions sent to your email.' };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      // Check if token is valid and not expired
      const { data: resetRecord, error: tokenError } = await supabase
        .from('password_resets')
        .select('*, users(*)')
        .eq('token', token)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetRecord) {
        return { success: false, error: 'Invalid or expired reset token.' };
      }

      // Update user password (in production, hash the password!)
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword }) // Note: This should be hashed in production
        .eq('id', resetRecord.user_id);

      if (updateError) throw updateError;

      // Mark reset token as used
      const { error: markUsedError } = await supabase
        .from('password_resets')
        .update({ used: true })
        .eq('id', resetRecord.id);

      if (markUsedError) throw markUsedError;

      // Also update Supabase Auth password if user exists in auth
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (authError) {
        console.log('Auth password update error (non-critical):', authError);
      }

      return { success: true, message: 'Password reset successfully. You can now login with your new password.' };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  },

  // AI Analysis Functions for ConsecQuote
  analyzeProposal: async (proposalData) => {
    try {
      // Simulate AI analysis (in production, this would call actual AI services)
      const { title, description, total_amount, client_name, client_company } = proposalData;
      
      // Mock AI analysis based on proposal content
      const aiAnalysis = {
        ai_win_probability: Math.floor(Math.random() * 40 + 60), // 60-100%
        ai_suggested_pricing: total_amount * (0.9 + Math.random() * 0.2), // ±10% of current pricing
        ai_market_analysis: generateMarketAnalysis(title, total_amount),
        ai_risk_factors: generateRiskFactors(title, total_amount),
        ai_recommendations: generateRecommendations(title, total_amount, client_company),
        ai_confidence_score: Math.floor(Math.random() * 20 + 80) // 80-100%
      };

      return { success: true, data: aiAnalysis };
    } catch (error) {
      console.error('Error analyzing proposal:', error);
      return { success: false, error: error.message };
    }
  },

  generateProposalSuggestions: async (projectType, budget, clientInfo) => {
    try {
      // Simulate AI-powered proposal suggestions
      const suggestions = {
        recommendedItems: generateRecommendedItems(projectType, budget),
        pricingStrategy: generatePricingStrategy(budget, clientInfo),
        timelineEstimate: generateTimelineEstimate(projectType, budget),
        competitivePricing: generateCompetitivePricing(projectType, budget)
      };

      return { success: true, data: suggestions };
    } catch (error) {
      console.error('Error generating proposal suggestions:', error);
      return { success: false, error: error.message };
    }
  },

  optimizeProposalPricing: async (items, clientProfile, projectComplexity) => {
    try {
      // AI-powered pricing optimization
      const optimizedPricing = items.map(item => ({
        ...item,
        originalPrice: item.unit_price,
        optimizedPrice: item.unit_price * (0.95 + Math.random() * 0.1), // ±5% optimization
        reasoning: generatePricingReasoning(item, clientProfile, projectComplexity)
      }));

      return { success: true, data: optimizedPricing };
    } catch (error) {
      console.error('Error optimizing pricing:', error);
      return { success: false, error: error.message };
    }
  }
};

// Helper functions for AI analysis (mock implementations)
function generateMarketAnalysis(projectTitle, amount) {
  const analyses = [
    `Based on current market trends, ${projectTitle.toLowerCase()} projects are in high demand with 15-20% growth rate.`,
    `Market analysis shows competitive pricing for ${projectTitle.toLowerCase()} ranges from $${Math.floor(amount * 0.8).toLocaleString()} to $${Math.floor(amount * 1.3).toLocaleString()}.`,
    `Industry benchmarks indicate strong market potential for ${projectTitle.toLowerCase()} with average deal size of $${Math.floor(amount * 1.1).toLocaleString()}.`
  ];
  return analyses[Math.floor(Math.random() * analyses.length)];
}

function generateRiskFactors(projectTitle, amount) {
  const riskFactors = [
    ['Scope creep potential', 'Timeline dependencies', 'Resource availability'],
    ['Technical complexity', 'Client communication', 'Integration challenges'],
    ['Budget constraints', 'Market competition', 'Regulatory requirements']
  ];
  return riskFactors[Math.floor(Math.random() * riskFactors.length)];
}

function generateRecommendations(projectTitle, amount, clientCompany) {
  const recommendations = [
    `Consider adding maintenance and support package for additional 20% recurring revenue.`,
    `Recommend phased delivery approach to reduce risk and improve cash flow.`,
    `Suggest including training and documentation to increase value proposition by 15%.`
  ];
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

function generateRecommendedItems(projectType, budget) {
  const itemSuggestions = {
    'website': [
      { name: 'Responsive Design', description: 'Mobile-first responsive design', estimatedPrice: budget * 0.15 },
      { name: 'SEO Optimization', description: 'On-page SEO and analytics setup', estimatedPrice: budget * 0.1 },
      { name: 'Content Management', description: 'CMS integration and training', estimatedPrice: budget * 0.12 }
    ],
    'mobile': [
      { name: 'Cross-platform Development', description: 'React Native or Flutter', estimatedPrice: budget * 0.3 },
      { name: 'Backend API', description: 'RESTful API development', estimatedPrice: budget * 0.2 },
      { name: 'App Store Publishing', description: 'Publishing and optimization', estimatedPrice: budget * 0.05 }
    ],
    'default': [
      { name: 'Project Management', description: 'Dedicated project management', estimatedPrice: budget * 0.1 },
      { name: 'Quality Assurance', description: 'Comprehensive testing', estimatedPrice: budget * 0.15 },
      { name: 'Documentation', description: 'Technical documentation', estimatedPrice: budget * 0.08 }
    ]
  };
  
  const type = Object.keys(itemSuggestions).find(key => 
    projectType.toLowerCase().includes(key)) || 'default';
  
  return itemSuggestions[type];
}

function generatePricingStrategy(budget, clientInfo) {
  const strategies = [
    'Value-based pricing recommended for this client profile',
    'Competitive pricing strategy with 10% market premium',
    'Tiered pricing approach with optional add-ons'
  ];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

function generateTimelineEstimate(projectType, budget) {
  const baseWeeks = Math.ceil(budget / 5000); // Rough estimate: $5k per week
  return `Estimated ${baseWeeks}-${baseWeeks + 2} weeks for completion`;
}

function generateCompetitivePricing(projectType, budget) {
  return {
    marketLow: Math.floor(budget * 0.8),
    marketHigh: Math.floor(budget * 1.4),
    recommendedPrice: Math.floor(budget * 1.1),
    confidence: Math.floor(Math.random() * 20 + 80)
  };
}

function generatePricingReasoning(item, clientProfile, complexity) {
  const reasons = [
    'Market analysis suggests 5% price optimization opportunity',
    'Client profile indicates value-conscious buyer, adjust pricing accordingly',
    'Complexity analysis recommends premium pricing for specialized work'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}