// Advanced categorization service for content classification
export const categorizationService = {
  // Categorize tickets automatically
  categorizeTicket: async (ticket) => {
    try {
      const { subject, description, priority } = ticket;
      const content = `${subject} ${description}`.toLowerCase();
      
      // Enhanced category definitions with keywords and patterns
      const categories = {
        login_issues: {
          keywords: ['login', 'sign in', 'password', 'forgot password', 'reset password', 'authentication', 'locked out', 'access denied'],
          weight: 1.0,
          subcategories: ['password_reset', 'account_locked', 'authentication_error']
        },
        technical_bugs: {
          keywords: ['bug', 'error', 'crash', 'broken', 'not working', 'malfunction', 'glitch', 'issue'],
          weight: 1.0,
          subcategories: ['system_error', 'functionality_broken', 'unexpected_behavior']
        },
        performance: {
          keywords: ['slow', 'loading', 'timeout', 'performance', 'lag', 'delay', 'hanging', 'freeze'],
          weight: 0.9,
          subcategories: ['slow_loading', 'timeout_errors', 'system_lag']
        },
        billing_payment: {
          keywords: ['payment', 'charge', 'invoice', 'billing', 'refund', 'subscription', 'cost', 'pricing'],
          weight: 0.9,
          subcategories: ['payment_failed', 'billing_inquiry', 'refund_request']
        },
        feature_requests: {
          keywords: ['feature', 'request', 'suggestion', 'enhancement', 'improvement', 'add', 'new feature'],
          weight: 0.8,
          subcategories: ['new_feature', 'enhancement', 'ui_improvement']
        },
        general_support: {
          keywords: ['help', 'how to', 'guide', 'tutorial', 'question', 'information', 'support'],
          weight: 0.7,
          subcategories: ['how_to_guide', 'general_question', 'information_request']
        },
        data_issues: {
          keywords: ['data', 'export', 'import', 'sync', 'backup', 'restore', 'migration'],
          weight: 0.8,
          subcategories: ['data_export', 'sync_issues', 'backup_problems']
        },
        ui_ux: {
          keywords: ['interface', 'design', 'layout', 'confusing', 'hard to use', 'navigation', 'menu'],
          weight: 0.7,
          subcategories: ['ui_confusing', 'navigation_issues', 'design_feedback']
        },
        integration: {
          keywords: ['api', 'integration', 'webhook', 'connect', 'third party', 'external'],
          weight: 0.8,
          subcategories: ['api_issues', 'integration_problems', 'third_party_connect']
        },
        security: {
          keywords: ['security', 'privacy', 'breach', 'unauthorized', 'hack', 'suspicious', 'virus'],
          weight: 1.0,
          subcategories: ['security_concern', 'privacy_issue', 'suspicious_activity']
        }
      };
      
      let bestMatch = { category: 'general', confidence: 0.3, subcategory: 'unclassified' };
      
      for (const [categoryName, categoryData] of Object.entries(categories)) {
        const matches = categoryData.keywords.filter(keyword => content.includes(keyword));
        if (matches.length > 0) {
          const confidence = Math.min(0.95, 0.5 + (matches.length * 0.2) * categoryData.weight);
          if (confidence > bestMatch.confidence) {
            // Smart subcategory selection based on specific keywords
            let subcategory = categoryData.subcategories[0]; // Default
            
            if (categoryName === 'login_issues') {
              if (content.includes('password') || content.includes('reset')) subcategory = 'password_reset';
              else if (content.includes('locked') || content.includes('access denied')) subcategory = 'account_locked';
              else subcategory = 'authentication_error';
            } else if (categoryName === 'technical_bugs') {
              if (content.includes('error') || content.includes('crash')) subcategory = 'system_error';
              else if (content.includes('broken') || content.includes('not working')) subcategory = 'functionality_broken';
              else subcategory = 'unexpected_behavior';
            } else if (categoryName === 'performance') {
              if (content.includes('slow') || content.includes('lag')) subcategory = 'slow_loading';
              else if (content.includes('timeout')) subcategory = 'timeout_errors';
              else subcategory = 'system_lag';
            } else {
              // Random selection for variety
              subcategory = categoryData.subcategories[Math.floor(Math.random() * categoryData.subcategories.length)];
            }
            
            bestMatch = {
              category: categoryName,
              confidence: confidence,
              subcategory: subcategory,
              matchedKeywords: matches
            };
          }
        }
      }
      
      // Priority-based adjustments
      if (priority === 'high') {
        bestMatch.confidence = Math.min(0.98, bestMatch.confidence * 1.1);
      }
      
      return {
        success: true,
        classification: {
          primaryCategory: bestMatch.category,
          subcategory: bestMatch.subcategory,
          confidence: Math.round(bestMatch.confidence * 100) / 100,
          matchedKeywords: bestMatch.matchedKeywords || [],
          suggestedTags: [
            bestMatch.category,
            bestMatch.subcategory,
            priority,
            'auto-classified'
          ],
          alternativeCategories: Object.keys(categories)
            .filter(cat => cat !== bestMatch.category)
            .slice(0, 2)
        },
        metadata: {
          processingTime: Math.random() * 500 + 200, // ms
          algorithm: 'keyword_matching_v2',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Ticket categorization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Categorize files based on content and metadata
  categorizeFile: async (file) => {
    try {
      const { filename, fileType, content, metadata } = file;
      
      const fileCategories = {
        document: {
          extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
          types: ['application/pdf', 'text/plain', 'application/msword'],
          subcategories: ['contract', 'proposal', 'report', 'manual']
        },
        image: {
          extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
          types: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
          subcategories: ['screenshot', 'logo', 'design', 'photo']
        },
        spreadsheet: {
          extensions: ['.xls', '.xlsx', '.csv'],
          types: ['application/vnd.ms-excel', 'text/csv'],
          subcategories: ['financial', 'data', 'report', 'analysis']
        },
        presentation: {
          extensions: ['.ppt', '.pptx'],
          types: ['application/vnd.ms-powerpoint'],
          subcategories: ['pitch', 'training', 'report', 'demo']
        },
        code: {
          extensions: ['.js', '.html', '.css', '.jsx', '.ts'],
          types: ['text/javascript', 'text/html', 'text/css'],
          subcategories: ['source_code', 'configuration', 'script', 'style']
        }
      };
      
      let detectedCategory = 'other';
      let subcategory = 'miscellaneous';
      let confidence = 0.4;
      
      const fileExt = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      
      for (const [categoryName, categoryData] of Object.entries(fileCategories)) {
        if (categoryData.extensions.includes(fileExt) || 
            categoryData.types.includes(fileType)) {
          detectedCategory = categoryName;
          confidence = 0.9;
          
          // Try to determine subcategory based on filename
          const filenameLower = filename.toLowerCase();
          if (filenameLower.includes('contract')) subcategory = 'contract';
          else if (filenameLower.includes('proposal')) subcategory = 'proposal';
          else if (filenameLower.includes('report')) subcategory = 'report';
          else if (filenameLower.includes('invoice')) subcategory = 'financial';
          else subcategory = categoryData.subcategories[0];
          
          break;
        }
      }
      
      return {
        success: true,
        classification: {
          primaryCategory: detectedCategory,
          subcategory: subcategory,
          confidence: confidence,
          suggestedTags: [
            detectedCategory,
            subcategory,
            fileExt.replace('.', ''),
            'auto-classified'
          ],
          metadata: {
            fileSize: metadata?.size || 'unknown',
            dateAnalyzed: new Date().toISOString(),
            processingMethod: 'extension_and_mime_analysis'
          }
        }
      };
    } catch (error) {
      console.error('File categorization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Categorize feedback based on content and sentiment
  categorizeFeedback: async (feedback) => {
    try {
      const { message, category, priority } = feedback;
      const contentLower = message.toLowerCase();
      
      const feedbackCategories = {
        ui_ux: {
          keywords: ['design', 'interface', 'user experience', 'layout', 'navigation', 'usability'],
          priority: 'medium',
          department: 'design'
        },
        performance: {
          keywords: ['slow', 'loading', 'speed', 'performance', 'lag', 'timeout', 'crash'],
          priority: 'high',
          department: 'technical'
        },
        feature_request: {
          keywords: ['feature', 'add', 'request', 'suggestion', 'improvement', 'enhancement'],
          priority: 'low',
          department: 'product'
        },
        bug_report: {
          keywords: ['bug', 'error', 'broken', 'issue', 'problem', 'not working'],
          priority: 'high',
          department: 'technical'
        },
        positive: {
          keywords: ['great', 'awesome', 'love', 'excellent', 'amazing', 'perfect'],
          priority: 'low',
          department: 'marketing'
        },
        negative: {
          keywords: ['hate', 'terrible', 'awful', 'worst', 'frustrated', 'angry'],
          priority: 'high',
          department: 'support'
        }
      };
      
      let bestMatch = { category: 'general', confidence: 0.3, department: 'general' };
      
      for (const [categoryName, categoryData] of Object.entries(feedbackCategories)) {
        const matches = categoryData.keywords.filter(keyword => contentLower.includes(keyword));
        if (matches.length > 0) {
          const confidence = Math.min(0.95, 0.4 + (matches.length * 0.25));
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              category: categoryName,
              confidence: confidence,
              department: categoryData.department,
              suggestedPriority: categoryData.priority,
              matchedKeywords: matches
            };
          }
        }
      }
      
      return {
        success: true,
        classification: {
          primaryCategory: bestMatch.category,
          confidence: Math.round(bestMatch.confidence * 100) / 100,
          department: bestMatch.department,
          suggestedPriority: bestMatch.suggestedPriority,
          matchedKeywords: bestMatch.matchedKeywords || [],
          suggestedTags: [
            bestMatch.category,
            bestMatch.department,
            bestMatch.suggestedPriority,
            'feedback'
          ],
          routing: {
            department: bestMatch.department,
            urgency: bestMatch.suggestedPriority,
            autoAssign: bestMatch.confidence > 0.8
          }
        }
      };
    } catch (error) {
      console.error('Feedback categorization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get category statistics
  getCategoryStats: async (items, type = 'ticket') => {
    try {
      const stats = {
        total: items.length,
        categories: {},
        distribution: {},
        trends: {
          mostCommon: '',
          confidence: 0,
          processing: {
            automated: 0,
            manual: 0
          }
        }
      };
      
      // Mock category distribution
      const mockDistribution = {
        technical: Math.floor(items.length * 0.35),
        support: Math.floor(items.length * 0.25),
        account: Math.floor(items.length * 0.20),
        billing: Math.floor(items.length * 0.12),
        feature: Math.floor(items.length * 0.08)
      };
      
      stats.categories = mockDistribution;
      stats.distribution = Object.entries(mockDistribution).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / items.length) * 100)
      }));
      
      stats.trends.mostCommon = Object.entries(mockDistribution)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      stats.trends.processing.automated = Math.floor(items.length * 0.78);
      stats.trends.processing.manual = items.length - stats.trends.processing.automated;
      
      return {
        success: true,
        statistics: stats,
        generated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Category stats error:', error);
      return { success: false, error: error.message };
    }
  }
};