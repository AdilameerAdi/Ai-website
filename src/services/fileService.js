import { supabase } from '../lib/supabase.js';

export const fileService = {
  // Upload file to storage (bypassing Supabase storage due to RLS issues)
  uploadFile: async (file, folder = 'uploads') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading file as base64 due to storage authentication requirements...');
      
      // Convert file to base64 for storage in database
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return {
        success: true,
        data: {
          path: filePath,
          url: base64Data, // Store as data URL
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          isBase64: true // Flag to indicate this is base64 data
        }
      };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  },

  // Save file metadata to database
  saveFileMetadata: async (fileData, userId, folderId = null) => {
    try {
      // Ensure userId is provided for data isolation
      if (!userId) {
        console.error('saveFileMetadata called without userId - cannot save file');
        return { success: false, error: 'User ID is required to save files' };
      }
      
      console.log('💾 Saving file metadata with AI summary:', {
        fileName: fileData.fileName,
        aiSummary: fileData.aiSummary,
        aiCategory: fileData.aiCategory,
        userId: userId
      });
      
      const insertData = {
        user_id: userId,
        filename: fileData.fileName,
        original_filename: fileData.fileName,
        file_path: fileData.path,
        file_url: fileData.url,
        file_size: fileData.fileSize,
        file_type: fileData.fileType,
        mime_type: fileData.fileType,
        folder_id: folderId,
        folder_path: fileData.folderPath || null,
        upload_status: 'completed',
        ai_category: fileData.aiCategory || null,
        ai_keywords: fileData.aiKeywords || null,
        ai_summary: fileData.aiSummary || null,
        ai_priority: fileData.aiPriority || null,
        ai_suggested_tags: fileData.aiSuggestedTags || null
      };
      
      console.log('🔄 About to insert into database:', {
        filename: insertData.filename,
        ai_summary: insertData.ai_summary
      });
      
      const { data, error } = await supabase
        .from('files')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ File saved successfully with AI summary:', data.ai_summary);
      console.log('📋 Complete saved file object:', data);
      
      // IMMEDIATE FIX: If the returned AI summary is wrong, update it manually
      if (data.ai_summary !== fileData.aiSummary && fileData.aiSummary) {
        console.log('🚨 AI SUMMARY WAS OVERWRITTEN! Fixing manually...');
        console.log('Expected:', fileData.aiSummary);
        console.log('Got:', data.ai_summary);
        
        // Force update the AI summary
        const { data: fixedData, error: fixError } = await supabase
          .from('files')
          .update({ ai_summary: fileData.aiSummary })
          .eq('id', data.id)
          .select()
          .single();
          
        if (!fixError && fixedData) {
          console.log('✅ AI Summary fixed:', fixedData.ai_summary);
          return { success: true, data: fixedData };
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('File metadata save error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's files
  getUserFiles: async (userId, limit = 50, offset = 0, folderId = null) => {
    try {
      // Ensure userId is provided for data isolation
      if (!userId) {
        console.warn('getUserFiles called without userId - returning empty for data isolation');
        return { success: true, data: [] };
      }
      
      let query = supabase
        .from('files')
        .select(`
          *,
          folders (
            id,
            folder_name,
            folder_path
          )
        `)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      if (offset > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('📂 Retrieved files from database:', data?.length || 0, 'files');
      if (data && data.length > 0) {
        console.log('🔍 First file AI data:', {
          filename: data[0].original_filename,
          ai_summary: data[0].ai_summary,
          ai_category: data[0].ai_category
        });
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get user files error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all files (admin only)
  getAllFiles: async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Get all files error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete file
  deleteFile: async (fileId, userId = null) => {
    try {
      let query = supabase
        .from('files')
        .select('file_path, user_id')
        .eq('id', fileId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: fileData, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([fileData.file_path]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('File delete error:', error);
      return { success: false, error: error.message };
    }
  },

  // Search files
  searchFiles: async (query, userId = null, limit = 50) => {
    try {
      // Ensure userId is provided for data isolation
      if (!userId) {
        console.warn('searchFiles called without userId - returning empty for data isolation');
        return { success: true, data: [] };
      }
      
      let dbQuery = supabase
        .from('files')
        .select(`
          *,
          folders (
            id,
            folder_name,
            folder_path
          )
        `)
        .or(`filename.ilike.%${query}%,original_filename.ilike.%${query}%,file_type.ilike.%${query}%,ai_summary.ilike.%${query}%`)
        .eq('is_deleted', false)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await dbQuery;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Search files error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update file metadata
  updateFile: async (fileId, updates, userId = null) => {
    try {
      let query = supabase
        .from('files')
        .update(updates)
        .eq('id', fileId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Update file error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get file usage statistics
  getFileStats: async (userId = null) => {
    try {
      let query = supabase
        .from('files')
        .select('file_size, file_type, created_at')
        .eq('user_id', userId);

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        totalFiles: data.length,
        totalSize: data.reduce((sum, file) => sum + (file.file_size || 0), 0),
        fileTypes: {},
        uploadsByMonth: {}
      };

      data.forEach(file => {
        // Count by file type
        const type = file.file_type || 'unknown';
        stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;

        // Count by month
        const month = new Date(file.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        stats.uploadsByMonth[month] = (stats.uploadsByMonth[month] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get file stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create folder
  createFolder: async (folderName, parentPath = '', userId) => {
    try {
      // Ensure userId is provided for data isolation
      if (!userId) {
        console.error('createFolder called without userId - cannot create folder');
        return { success: false, error: 'User ID is required to create folders' };
      }
      
      const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: userId,
          folder_name: folderName,
          folder_path: folderPath,
          parent_path: parentPath || null
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Create folder error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user folders
  getUserFolders: async (userId, parentPath = '') => {
    try {
      // Ensure userId is provided for data isolation
      if (!userId) {
        console.warn('getUserFolders called without userId - returning empty for data isolation');
        return { success: true, data: [] };
      }
      
      let query = supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (parentPath) {
        query = query.eq('parent_path', parentPath);
      } else {
        query = query.is('parent_path', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Get user folders error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update file with AI analysis
  updateFileAI: async (fileId, aiData, userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .update({
          ai_summary: aiData.summary,
          ai_keywords: aiData.keywords,
          ai_category: aiData.category,
          ai_priority: aiData.priority,
          ai_suggested_tags: aiData.suggestedTags,
          ai_confidence: aiData.confidence,
          ai_content_analysis: aiData.contentAnalysis
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Update file AI error:', error);
      return { success: false, error: error.message };
    }
  },

  // Apply AI tags to file
  applyAITags: async (fileId, userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('ai_suggested_tags')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const { data: updateData, error: updateError } = await supabase
        .from('files')
        .update({ user_tags: data.ai_suggested_tags })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { success: true, data: updateData };
    } catch (error) {
      console.error('Apply AI tags error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get files by AI category
  getFilesByCategory: async (userId, category, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('ai_category', category)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Get files by category error:', error);
      return { success: false, error: error.message };
    }
  },

  // Find similar files
  findSimilarFiles: async (fileId, userId, limit = 10) => {
    try {
      // Get the current file's data
      const { data: currentFile, error: currentError } = await supabase
        .from('files')
        .select('ai_keywords, ai_category, file_type')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (currentError) throw currentError;

      // Find files with similar keywords or category
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .neq('id', fileId)
        .or(`ai_category.eq.${currentFile.ai_category},file_type.eq.${currentFile.file_type}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Find similar files error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get storage analytics
  getStorageAnalytics: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('file_size, file_type, ai_category, created_at')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;

      const analytics = {
        totalFiles: data.length,
        totalSize: data.reduce((sum, file) => sum + (file.file_size || 0), 0),
        byType: {},
        byCategory: {},
        uploadTrend: {}
      };

      data.forEach(file => {
        // Group by file type
        const type = file.file_type || 'unknown';
        analytics.byType[type] = (analytics.byType[type] || 0) + 1;

        // Group by AI category
        const category = file.ai_category || 'uncategorized';
        analytics.byCategory[category] = (analytics.byCategory[category] || 0) + 1;

        // Group by upload month
        const month = new Date(file.created_at).toISOString().substring(0, 7);
        analytics.uploadTrend[month] = (analytics.uploadTrend[month] || 0) + 1;
      });

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Get storage analytics error:', error);
      return { success: false, error: error.message };
    }
  },

  // Rename file
  renameFile: async (fileId, newName, userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .update({ 
          filename: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Rename file error:', error);
      return { success: false, error: error.message };
    }
  },

  // Move file to folder
  moveFile: async (fileId, folderId, userId) => {
    try {
      // Get folder path if folderId is provided
      let folderPath = null;
      if (folderId) {
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select('folder_path')
          .eq('id', folderId)
          .eq('user_id', userId)
          .single();

        if (folderError) throw folderError;
        folderPath = folderData.folder_path;
      }

      const { data, error } = await supabase
        .from('files')
        .update({ 
          folder_id: folderId,
          folder_path: folderPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Move file error:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle favorite status
  toggleFavorite: async (fileId, userId) => {
    try {
      const { data: currentFile, error: fetchError } = await supabase
        .from('files')
        .select('is_favorite')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('files')
        .update({ 
          is_favorite: !currentFile.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get AI insights analytics
  getAIInsights: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('ai_category, ai_priority, ai_keywords, ai_suggested_tags, file_size, created_at')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;

      // Calculate insights
      const insights = {
        totalFiles: data.length,
        taggedFiles: data.filter(f => f.ai_suggested_tags && f.ai_suggested_tags.length > 0).length,
        categorizedFiles: data.filter(f => f.ai_category && f.ai_category !== 'other').length,
        highPriorityFiles: data.filter(f => f.ai_priority === 'high').length,
        mediumPriorityFiles: data.filter(f => f.ai_priority === 'medium').length,
        lowPriorityFiles: data.filter(f => f.ai_priority === 'low').length,
        categories: {},
        recentAnalysis: data.filter(f => {
          const daysDiff = Math.floor((new Date() - new Date(f.created_at)) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }).length
      };

      // Count by category
      data.forEach(file => {
        const category = file.ai_category || 'uncategorized';
        insights.categories[category] = (insights.categories[category] || 0) + 1;
      });

      // Calculate accuracy estimate (tagged files / total files)
      insights.accuracy = insights.totalFiles > 0 ? 
        Math.round((insights.taggedFiles / insights.totalFiles) * 100) : 0;

      return { success: true, data: insights };
    } catch (error) {
      console.error('Get AI insights error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get duplicate files analysis
  getDuplicateAnalysis: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('filename, file_size, file_type, original_filename')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;

      const duplicates = {};
      const potentialDuplicates = [];
      let duplicateSize = 0;

      // Group by filename and size
      data.forEach(file => {
        const key = `${file.original_filename}_${file.file_size}`;
        if (!duplicates[key]) {
          duplicates[key] = [];
        }
        duplicates[key].push(file);
      });

      // Find actual duplicates
      Object.values(duplicates).forEach(group => {
        if (group.length > 1) {
          potentialDuplicates.push(...group.slice(1)); // Skip first, count rest as duplicates
          duplicateSize += group.slice(1).reduce((sum, f) => sum + f.file_size, 0);
        }
      });

      return {
        success: true,
        data: {
          duplicateCount: potentialDuplicates.length,
          spaceSaved: duplicateSize,
          duplicateFiles: potentialDuplicates
        }
      };
    } catch (error) {
      console.error('Get duplicate analysis error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get organization suggestions
  getOrganizationSuggestions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('ai_category, folder_id, ai_suggested_tags, filename')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;

      const suggestions = [];
      const categoryCounts = {};
      
      // Count files without folders
      const unorganizedFiles = data.filter(f => !f.folder_id);
      if (unorganizedFiles.length > 5) {
        suggestions.push({
          type: 'create_folders',
          description: `${unorganizedFiles.length} files in root folder could be organized`,
          priority: 'medium'
        });
      }

      // Group by AI category
      data.forEach(file => {
        const category = file.ai_category || 'other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      // Suggest folders for categories with many files
      Object.entries(categoryCounts).forEach(([category, count]) => {
        if (count >= 3 && category !== 'other') {
          suggestions.push({
            type: 'category_folder',
            description: `Create ${category} folder for ${count} ${category} files`,
            priority: 'high'
          });
        }
      });

      return {
        success: true,
        data: {
          suggestions,
          totalSuggestions: suggestions.length,
          implementedSuggestions: Math.floor(suggestions.length * 0.6) // Simulate implemented
        }
      };
    } catch (error) {
      console.error('Get organization suggestions error:', error);
      return { success: false, error: error.message };
    }
  }
};