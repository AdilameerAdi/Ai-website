import { supabase } from '../lib/supabase.js';

export const quoteService = {
  // Generate unique proposal number
  generateProposalNumber: async () => {
    try {
      const year = new Date().getFullYear();
      const { data, error } = await supabase
        .from('proposals')
        .select('proposal_number')
        .like('proposal_number', `PROP-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const nextNumber = data && data.length > 0 
        ? parseInt(data[0].proposal_number.split('-')[2]) + 1 
        : 1;
      
      return `PROP-${year}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating proposal number:', error);
      return `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    }
  },

  // Create new proposal
  createProposal: async (proposalData, userId) => {
    try {
      // Get the current authenticated user to ensure correct user_id
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('User not authenticated');
      }
      
      // Use the authenticated user's ID instead of the passed userId
      const authenticatedUserId = user.id;
      console.log('Using authenticated user ID:', authenticatedUserId);
      
      // Ensure user exists in users table before creating proposal
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authenticatedUserId)
        .single();
      
      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, create user record
        console.log('Creating user record for proposal creation:', authenticatedUserId);
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: authenticatedUserId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            password: 'AUTH_MANAGED',
            role: 'user',
            subscription_plan: 'free',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 5368709120,
            is_email_verified: user.email_confirmed_at ? true : false
          });
        
        if (createUserError) {
          // If user already exists (email conflict), that's fine - continue with proposal creation
          if (createUserError.code === '23505') {
            console.log('User already exists, continuing with proposal creation');
          } else {
            console.error('Failed to create user record:', createUserError);
            throw new Error('Failed to create user record: ' + createUserError.message);
          }
        }
        console.log('User record created successfully');
      }
      
      const proposalNumber = await quoteService.generateProposalNumber();
      
      // Calculate total from line items
      const totalAmount = proposalData.lineItems?.reduce((sum, item) => 
        sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0) || 0;

      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          user_id: authenticatedUserId, // Use authenticated user ID
          proposal_number: proposalNumber,
          title: proposalData.title,
          client_name: proposalData.clientName,
          client_email: proposalData.clientEmail,
          client_company: proposalData.clientCompany,
          description: proposalData.description,
          total_amount: totalAmount,
          currency: proposalData.currency || 'USD',
          status: proposalData.status || 'draft',
          valid_until: proposalData.validUntil,
          terms_conditions: proposalData.termsConditions,
          notes: proposalData.notes
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Insert line items if provided
      if (proposalData.lineItems && proposalData.lineItems.length > 0) {
        const lineItems = proposalData.lineItems.map((item, index) => ({
          proposal_id: proposal.id,
          item_name: item.name,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unitPrice),
          total_price: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          sort_order: index
        }));

        const { error: lineItemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }

      return { success: true, data: proposal };
    } catch (error) {
      console.error('Create proposal error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user proposals with pagination
  getUserProposals: async (userId, limit = 50, offset = 0, status = null) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      let query = supabase
        .from('proposals')
        .select(`
          *,
          proposal_line_items (
            id, item_name, description, quantity, unit_price, total_price, sort_order
          )
        `)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get proposals error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get single proposal by ID
  getProposal: async (proposalId, userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_line_items (
            id, item_name, description, quantity, unit_price, total_price, sort_order
          )
        `)
        .eq('id', proposalId)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Get proposal error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update proposal
  updateProposal: async (proposalId, userId, updateData) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      // Update proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposalId)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Update line items if provided
      if (updateData.lineItems) {
        // Delete existing line items
        await supabase
          .from('proposal_line_items')
          .delete()
          .eq('proposal_id', proposalId);

        // Insert new line items
        if (updateData.lineItems.length > 0) {
          const lineItems = updateData.lineItems.map((item, index) => ({
            proposal_id: proposalId,
            item_name: item.name,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unitPrice),
            total_price: parseFloat(item.quantity) * parseFloat(item.unitPrice),
            sort_order: index
          }));

          const { error: lineItemsError } = await supabase
            .from('proposal_line_items')
            .insert(lineItems);

          if (lineItemsError) throw lineItemsError;
        }

        // Recalculate total
        const totalAmount = updateData.lineItems.reduce((sum, item) => 
          sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0);

        await supabase
          .from('proposals')
          .update({ total_amount: totalAmount })
          .eq('id', proposalId);
      }

      return { success: true, data: proposal };
    } catch (error) {
      console.error('Update proposal error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete proposal
  deleteProposal: async (proposalId, userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID;

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete proposal error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update proposal status
  updateProposalStatus: async (proposalId, userId, status, additionalData = {}) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const updateData = { status, ...additionalData };
      
      // Add timestamps for specific status changes
      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (status === 'viewed') {
        updateData.viewed_at = new Date().toISOString();
      } else if (status === 'approved' || status === 'rejected') {
        updateData.responded_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposalId)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Update proposal status error:', error);
      return { success: false, error: error.message };
    }
  },

  // Search proposals
  searchProposals: async (userId, searchTerm, filters = {}) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      let query = supabase
        .from('proposals')
        .select(`
          *,
          proposal_line_items (
            id, item_name, description, quantity, unit_price, total_price, sort_order
          )
        `)
        .eq('user_id', authenticatedUserId) // Use authenticated user ID;

      // Add text search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,client_company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Add filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.minAmount) {
        query = query.gte('total_amount', filters.minAmount);
      }

      if (filters.maxAmount) {
        query = query.lte('total_amount', filters.maxAmount);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Search proposals error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get proposal statistics
  getProposalStats: async (userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select('status, total_amount, created_at')
        .eq('user_id', authenticatedUserId);

      if (error) throw error;

      const stats = {
        total: proposals.length,
        draft: proposals.filter(p => p.status === 'draft').length,
        sent: proposals.filter(p => p.status === 'sent').length,
        viewed: proposals.filter(p => p.status === 'viewed').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        rejected: proposals.filter(p => p.status === 'rejected').length,
        expired: proposals.filter(p => p.status === 'expired').length,
        totalValue: proposals.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0),
        approvedValue: proposals
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0),
        averageValue: proposals.length > 0 
          ? proposals.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0) / proposals.length 
          : 0,
        conversionRate: proposals.length > 0 
          ? (proposals.filter(p => p.status === 'approved').length / proposals.length) * 100 
          : 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get proposal stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update AI analysis for proposal
  updateAIAnalysis: async (proposalId, userId, aiAnalysis) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data, error } = await supabase
        .from('proposals')
        .update({
          ai_win_probability: aiAnalysis.winProbability,
          ai_suggested_pricing: aiAnalysis.suggestedPricing,
          ai_market_analysis: aiAnalysis.marketAnalysis,
          ai_risk_factors: aiAnalysis.riskFactors,
          ai_recommendations: aiAnalysis.recommendations
        })
        .eq('id', proposalId)
        .eq('user_id', authenticatedUserId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Update AI analysis error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get proposals needing AI analysis
  getProposalsForAIAnalysis: async (userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_line_items (
            id, item_name, description, quantity, unit_price, total_price
          )
        `)
        .eq('user_id', authenticatedUserId)
        .is('ai_win_probability', null)
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get proposals for AI analysis error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create proposal template
  createTemplate: async (userId, templateData) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data, error } = await supabase
        .from('proposal_templates')
        .insert({
          user_id: authenticatedUserId,
          name: templateData.name,
          description: templateData.description,
          template_data: templateData.data,
          is_shared: templateData.isShared || false
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Create template error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user templates
  getUserTemplates: async (userId) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return { success: false, error: 'User not authenticated' };
      }
      const authenticatedUserId = user.id;
      
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .or(`user_id.eq.${authenticatedUserId},is_shared.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get templates error:', error);
      return { success: false, error: error.message };
    }
  },

  // Use template (increment usage count)
  useTemplate: async (templateId) => {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .update({ usage_count: supabase.rpc('increment', { field: 'usage_count' }) })
        .eq('id', templateId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Use template error:', error);
      return { success: false, error: error.message };
    }
  }
};