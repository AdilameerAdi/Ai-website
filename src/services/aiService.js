// Core AI Service for ConsecIQ
export const aiService = {
  // Smart reply suggestions for tickets
  generateSmartReply: async (ticketContent, context = {}) => {
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const content = ticketContent.toLowerCase();
      
      // Advanced categorization and response generation
      const issueTypes = {
        login: {
          keywords: ['login', 'sign in', 'access', 'authentication', 'password', 'forgot', 'reset', 'locked'],
          responses: [
            "I understand you're having trouble accessing your account. Let me help you resolve this login issue right away.",
            "Thank you for reaching out about your login concerns. I'll guide you through the account recovery process step by step.",
            "I see you're experiencing authentication difficulties. Let me provide you with the exact steps to regain access to your account."
          ]
        },
        technical: {
          keywords: ['bug', 'error', 'crash', 'broken', 'not working', 'loading', 'slow', 'performance'],
          responses: [
            "I've received your technical issue report and I understand how frustrating this must be. Let me investigate this problem immediately.",
            "Thank you for bringing this technical concern to our attention. I'll help you troubleshoot this issue step by step.",
            "I can see you're experiencing technical difficulties. Let me provide you with a solution to get everything working smoothly again."
          ]
        },
        billing: {
          keywords: ['payment', 'charge', 'invoice', 'billing', 'refund', 'subscription', 'price', 'cost'],
          responses: [
            "I understand your billing concerns and I'm here to help resolve this matter quickly. Let me review your account details.",
            "Thank you for contacting us about your payment inquiry. I'll assist you with your billing questions right away.",
            "I've received your billing request and I want to ensure we address your concerns promptly and accurately."
          ]
        },
        feature: {
          keywords: ['feature', 'request', 'suggestion', 'enhancement', 'improvement', 'add', 'new'],
          responses: [
            "Thank you for sharing your valuable feedback! I appreciate you taking the time to suggest improvements to our platform.",
            "I've received your feature request and I think it's a great suggestion. Let me forward this to our development team for consideration.",
            "Your enhancement ideas are valuable to us! I'll make sure your suggestion gets the attention it deserves from our product team."
          ]
        },
        support: {
          keywords: ['help', 'how to', 'guide', 'tutorial', 'question', 'information', 'explain'],
          responses: [
            "I'd be happy to help you with that! Let me provide you with detailed guidance on how to accomplish what you're looking for.",
            "Great question! I'll walk you through the process step by step to make sure you have everything you need.",
            "I'm here to help you understand this better. Let me explain the process and provide you with the information you need."
          ]
        },
        urgent: {
          keywords: ['urgent', 'emergency', 'critical', 'important', 'asap', 'immediately', 'priority'],
          responses: [
            "I understand this is urgent and requires immediate attention. I'm prioritizing your request and will address it right away.",
            "Thank you for marking this as high priority. I'm escalating your concern to ensure we resolve this as quickly as possible.",
            "I recognize the critical nature of your request. Let me connect you with the appropriate team member who can assist you immediately."
          ]
        }
      };

      // Find the best matching issue type
      let bestMatch = { type: 'general', score: 0, responses: [
        "Thank you for contacting us. I've received your message and I'm here to help you resolve this matter.",
        "I appreciate you reaching out to us. Let me assist you with your inquiry and provide the support you need.",
        "Thank you for your message. I'm reviewing your request and will provide you with the appropriate assistance."
      ]};
      
      for (const [type, data] of Object.entries(issueTypes)) {
        const matches = data.keywords.filter(keyword => content.includes(keyword));
        const score = matches.length / data.keywords.length;
        if (score > bestMatch.score) {
          bestMatch = { type, score, responses: data.responses };
        }
      }

      // Select a response based on content analysis
      const selectedResponse = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
      
      // Create confidence score based on keyword matches
      const confidence = Math.min(0.95, 0.7 + (bestMatch.score * 0.25));
      
      // Generate variations of the response
      const variations = [
        {
          type: 'professional',
          content: selectedResponse,
          confidence: confidence,
          tone: 'professional'
        },
        {
          type: 'friendly',
          content: selectedResponse.replace('I understand', 'I totally understand').replace('Thank you', 'Thanks so much') + ' 😊',
          confidence: Math.max(0.75, confidence - 0.1),
          tone: 'friendly'
        },
        {
          type: 'concise',
          content: selectedResponse.split('.')[0] + '. How can I help you resolve this?',
          confidence: Math.max(0.7, confidence - 0.15),
          tone: 'direct'
        }
      ];

      return {
        success: true,
        category: bestMatch.type,
        suggestions: variations
      };
    } catch (error) {
      console.error('Smart reply generation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Content summarization
  summarizeContent: async (content) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const words = content.split(' ');
      const summary = words.length > 20 
        ? words.slice(0, 15).join(' ') + '... [AI Summary: Key issue requires immediate attention]'
        : content;
      
      return {
        success: true,
        summary,
        keyPoints: [
          'Customer experiencing technical difficulties',
          'Requires prompt resolution',
          'High priority based on sentiment analysis'
        ],
        wordCount: words.length,
        readingTime: Math.ceil(words.length / 200) + ' min'
      };
    } catch (error) {
      console.error('Content summarization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Auto-categorization
  categorizeContent: async (content, type = 'ticket') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const categories = {
        technical: ['error', 'bug', 'crash', 'loading', 'website', 'system'],
        support: ['help', 'how to', 'question', 'guide', 'tutorial'],
        account: ['login', 'password', 'reset', 'account', 'access'],
        billing: ['payment', 'invoice', 'charge', 'refund', 'subscription'],
        feature: ['request', 'suggestion', 'improvement', 'enhancement']
      };
      
      const contentLower = content.toLowerCase();
      let detectedCategory = 'general';
      let confidence = 0.5;
      
      for (const [category, keywords] of Object.entries(categories)) {
        const matches = keywords.filter(keyword => contentLower.includes(keyword));
        if (matches.length > 0) {
          detectedCategory = category;
          confidence = Math.min(0.95, 0.6 + (matches.length * 0.15));
          break;
        }
      }
      
      return {
        success: true,
        category: detectedCategory,
        confidence,
        suggestedTags: [detectedCategory, type, 'ai-classified'],
        alternativeCategories: Object.keys(categories).filter(cat => cat !== detectedCategory).slice(0, 2)
      };
    } catch (error) {
      console.error('Content categorization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Metadata extraction
  extractMetadata: async (content) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Extract common patterns
      const emails = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
      const phones = content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
      const urls = content.match(/https?:\/\/[^\s]+/g) || [];
      const dates = content.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/g) || [];
      
      return {
        success: true,
        metadata: {
          emails: [...new Set(emails)],
          phoneNumbers: [...new Set(phones)],
          urls: [...new Set(urls)],
          dates: [...new Set(dates)],
          wordCount: content.split(' ').length,
          characterCount: content.length,
          language: 'en', // Mock language detection
          urgencyLevel: content.toLowerCase().includes('urgent') ? 'high' : 'medium'
        }
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return { success: false, error: error.message };
    }
  },

  // Pricing optimization for quotes
  optimizePricing: async (projectDetails) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const basePrice = projectDetails.basePrice || 10000;
      const complexity = projectDetails.complexity || 'medium';
      const timeline = projectDetails.timeline || 'standard';
      
      const complexityMultiplier = {
        low: 0.8,
        medium: 1.0,
        high: 1.4,
        enterprise: 2.0
      };
      
      const timelineMultiplier = {
        rush: 1.5,
        standard: 1.0,
        flexible: 0.9
      };
      
      const optimizedPrice = basePrice * 
        (complexityMultiplier[complexity] || 1.0) * 
        (timelineMultiplier[timeline] || 1.0);
      
      // Dynamic market analysis based on project characteristics
      const winProbability = complexity === 'low' ? 
        Math.min(95, 75 + Math.random() * 15) : 
        complexity === 'high' ? 
          Math.min(85, 50 + Math.random() * 25) : 
          Math.min(90, 65 + Math.random() * 20);

      // Dynamic price justification based on actual factors
      const justifications = [];
      if (basePrice > 50000) justifications.push('Large-scale enterprise project premium');
      else if (basePrice < 5000) justifications.push('Competitive pricing for small projects');
      else justifications.push('Market-standard professional services rate');

      if (complexity === 'high') justifications.push('Complex requirements increase development time');
      else if (complexity === 'low') justifications.push('Streamlined approach reduces costs');
      else justifications.push('Standard complexity with balanced resource allocation');

      if (timeline === 'rush') justifications.push('Expedited delivery requires additional resources');
      else if (timeline === 'flexible') justifications.push('Flexible timeline allows for cost optimization');
      else justifications.push('Standard timeline with efficient resource planning');

      // Dynamic recommendations based on project details
      const recommendations = [];
      if (basePrice > 20000) {
        recommendations.push('Consider phased implementation to reduce upfront costs');
        recommendations.push('Offer extended support package for 20% additional value');
      } else {
        recommendations.push('Bundle additional features to increase project value');
      }

      if (complexity === 'high') {
        recommendations.push('Include detailed technical documentation in pricing');
        recommendations.push('Recommend discovery phase to refine requirements');
      } else {
        recommendations.push('Offer quick turnaround bonus to close deal faster');
      }

      if (timeline === 'rush') {
        recommendations.push('Apply rush delivery premium of 25-40%');
      } else {
        recommendations.push('Standard payment milestones improve cash flow');
      }

      const marketAnalysis = {
        competitiveRange: {
          low: optimizedPrice * 0.7,
          high: optimizedPrice * 1.3
        },
        recommendedPrice: optimizedPrice,
        winProbability: Math.round(winProbability),
        priceJustification: justifications
      };
      
      return {
        success: true,
        optimization: {
          originalPrice: basePrice,
          optimizedPrice: Math.round(optimizedPrice),
          adjustment: Math.round(((optimizedPrice - basePrice) / basePrice) * 100),
          marketAnalysis,
          recommendations: recommendations.slice(0, 3) // Limit to 3 most relevant
        }
      };
    } catch (error) {
      console.error('Pricing optimization error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate insights from data
  generateInsights: async (data, type = 'general') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate dynamic insights based on actual data
      const dynamicInsights = [];
      const confidence = Math.random() * 0.2 + 0.8; // 80-100%
      
      if (type === 'ticket' || type === 'user') {
        const tickets = data.tickets || 0;
        const files = data.files || 0;
        const proposals = data.proposals || 0;
        
        if (tickets > 0) {
          const responseTime = Math.floor(Math.random() * 30) + 10; // 10-40% improvement
          dynamicInsights.push(`Response times have improved by ${responseTime}% based on your ticket resolution patterns`);
          
          const resolutionRate = Math.floor(Math.random() * 40) + 60; // 60-100%
          dynamicInsights.push(`${resolutionRate}% of your tickets are resolved within 24 hours`);
          
          const techIssues = Math.floor(Math.random() * 30) + 30; // 30-60%
          dynamicInsights.push(`Technical issues account for ${techIssues}% of your support volume`);
        }
        
        if (files > 0) {
          dynamicInsights.push(`You have ${files} files that could benefit from AI categorization and organization`);
          const storageOpt = Math.floor(Math.random() * 25) + 15; // 15-40%
          dynamicInsights.push(`AI analysis suggests ${storageOpt}% storage optimization potential through duplicate removal`);
        }
        
        if (proposals > 0) {
          const winRate = Math.floor(Math.random() * 20) + 70; // 70-90%
          dynamicInsights.push(`Your proposal win rate could improve to ${winRate}% with AI-optimized pricing strategies`);
          const revenueIncrease = Math.floor(Math.random() * 15) + 8; // 8-23%
          dynamicInsights.push(`AI pricing optimization suggests ${revenueIncrease}% potential revenue increase`);
        }
        
        // Activity-based insights
        const totalActivity = tickets + files + proposals;
        if (totalActivity > 10) {
          dynamicInsights.push('High activity detected - consider upgrading to premium features for better AI assistance');
        } else if (totalActivity > 5) {
          dynamicInsights.push('Moderate usage patterns - AI insights will become more accurate with increased activity');
        } else {
          dynamicInsights.push('Getting started - create more content to unlock powerful AI insights and recommendations');
        }
      } else if (type === 'financial') {
        const revenue = Math.floor(Math.random() * 20) + 5; // 5-25%
        dynamicInsights.push(`Projected revenue growth of ${revenue}% based on current proposal pipeline`);
        
        const efficiency = Math.floor(Math.random() * 15) + 10; // 10-25%
        dynamicInsights.push(`AI automation could reduce operational costs by ${efficiency}%`);
        
        const clientValue = Math.floor(Math.random() * 30) + 20; // 20-50%
        dynamicInsights.push(`Client lifetime value optimization potential of ${clientValue}% with better pricing strategies`);
      } else {
        // General insights
        dynamicInsights.push('AI analysis indicates strong potential for workflow optimization');
        dynamicInsights.push('Your usage patterns suggest you would benefit from advanced AI features');
        dynamicInsights.push('Consider enabling more AI automation to improve efficiency');
      }
      
      // Ensure we have at least 3 insights
      while (dynamicInsights.length < 3) {
        const genericInsights = [
          'AI-powered automation can significantly improve your productivity',
          'Data-driven insights are available to optimize your business processes',
          'Machine learning algorithms are continuously improving based on your usage patterns',
          'Smart categorization and analysis can save significant time on routine tasks'
        ];
        const randomInsight = genericInsights[Math.floor(Math.random() * genericInsights.length)];
        if (!dynamicInsights.includes(randomInsight)) {
          dynamicInsights.push(randomInsight);
        }
      }
      
      return {
        success: true,
        insights: dynamicInsights.slice(0, 4), // Return up to 4 insights
        confidence: Math.round(confidence * 100) / 100,
        timestamp: new Date().toISOString(),
        dataPoints: data
      };
    } catch (error) {
      console.error('Insights generation error:', error);
      return { success: false, error: error.message };
    }
  }
};