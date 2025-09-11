import { supabase } from '../lib/supabase';
import { userSyncService } from './userSyncService';

const searchService = {
  // Search across all data types
  searchAll: async (query, limit = 10, userId = null) => {
    try {
      // Get the current user ID from the session if not provided
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      // If still no user ID, return empty results
      if (!userId) {
        return { success: true, data: [], totalCount: 0 };
      }
      
      const results = [];

      // Search tickets
      try {
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select('id, title, description, status, created_at')
          .eq('user_id', userId)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);

        if (!ticketsError && tickets) {
          tickets.forEach(ticket => {
            results.push({
              id: `ticket-${ticket.id}`,
              title: ticket.title,
              description: ticket.description,
              type: 'ticket',
              app: 'ConsecDesk',
              status: ticket.status,
              created_at: ticket.created_at,
              _searchScore: calculateSearchScore(query, ticket.title + ' ' + ticket.description)
            });
          });
        }
      } catch (error) {
        console.error('Error searching tickets:', error);
      }

      // Search files
      try {
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('id, file_name, file_path, file_size, created_at')
          .eq('user_id', userId)
          .ilike('file_name', `%${query}%`)
          .limit(limit);

        if (!filesError && files) {
          files.forEach(file => {
            results.push({
              id: `file-${file.id}`,
              title: file.file_name,
              description: `File size: ${formatFileSize(file.file_size)}`,
              type: 'file',
              app: 'ConsecDrive',
              file_size: file.file_size,
              created_at: file.created_at,
              _searchScore: calculateSearchScore(query, file.file_name)
            });
          });
        }
      } catch (error) {
        console.error('Error searching files:', error);
      }

      // Search proposals
      try {
        const { data: proposals, error: proposalsError } = await supabase
          .from('proposals')
          .select('id, title, description, status, total_amount, created_at')
          .eq('user_id', userId)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);

        if (!proposalsError && proposals) {
          proposals.forEach(proposal => {
            results.push({
              id: `proposal-${proposal.id}`,
              title: proposal.title,
              description: proposal.description,
              type: 'proposal',
              app: 'ConsecQuote',
              status: proposal.status,
              amount: proposal.total_amount,
              created_at: proposal.created_at,
              _searchScore: calculateSearchScore(query, proposal.title + ' ' + proposal.description)
            });
          });
        }
      } catch (error) {
        console.error('Error searching proposals:', error);
      }

      // Sort by search score and relevance
      results.sort((a, b) => {
        // First by search score
        if (b._searchScore !== a._searchScore) {
          return b._searchScore - a._searchScore;
        }
        // Then by date
        return new Date(b.created_at) - new Date(a.created_at);
      });

      return {
        success: true,
        data: results.slice(0, limit),
        totalCount: results.length
      };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Calculate search score based on how well the query matches
const calculateSearchScore = (query, text) => {
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 70;
  
  // Word match gets lower score
  const queryWords = queryLower.split(' ');
  const textWords = textLower.split(' ');
  let matchingWords = 0;
  
  queryWords.forEach(queryWord => {
    if (textWords.some(textWord => textWord.includes(queryWord))) {
      matchingWords++;
    }
  });
  
  return (matchingWords / queryWords.length) * 50;
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default searchService;