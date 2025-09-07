export const sentimentService = {
  // Basic sentiment analysis using keyword matching
  analyzeSentiment: (text) => {
    if (!text || typeof text !== 'string') {
      return {
        score: 0,
        sentiment: 'neutral',
        confidence: 0,
        keywords: []
      };
    }

    const positiveWords = [
      'excellent', 'great', 'amazing', 'fantastic', 'wonderful', 'outstanding',
      'perfect', 'love', 'awesome', 'brilliant', 'superb', 'incredible',
      'good', 'nice', 'helpful', 'useful', 'easy', 'fast', 'quick',
      'satisfied', 'happy', 'pleased', 'impressed', 'recommend', 'reliable'
    ];

    const negativeWords = [
      'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
      'useless', 'broken', 'slow', 'difficult', 'hard', 'confusing',
      'frustrating', 'annoying', 'disappointed', 'unsatisfied', 'poor',
      'failed', 'error', 'bug', 'problem', 'issue', 'complaint', 'crash'
    ];

    const intensifiers = ['very', 'extremely', 'really', 'absolutely', 'completely', 'totally'];
    const negators = ['not', 'no', 'never', 'nothing', 'none', 'neither'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let matchedKeywords = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let multiplier = 1;

      // Check for intensifiers
      if (i > 0 && intensifiers.includes(words[i - 1])) {
        multiplier = 1.5;
      }

      // Check for negators
      if (i > 0 && negators.includes(words[i - 1])) {
        multiplier = -1;
      }

      if (positiveWords.includes(word)) {
        score += 1 * multiplier;
        matchedKeywords.push({ word, type: 'positive', multiplier });
      } else if (negativeWords.includes(word)) {
        score -= 1 * multiplier;
        matchedKeywords.push({ word, type: 'negative', multiplier });
      }
    }

    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(1, words.length * 0.1)));
    
    let sentiment;
    let confidence;

    if (normalizedScore > 0.1) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + Math.abs(normalizedScore) * 0.4);
    } else if (normalizedScore < -0.1) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + Math.abs(normalizedScore) * 0.4);
    } else {
      sentiment = 'neutral';
      confidence = 0.3 + (1 - Math.abs(normalizedScore)) * 0.2;
    }

    return {
      score: parseFloat(normalizedScore.toFixed(3)),
      sentiment,
      confidence: parseFloat(confidence.toFixed(3)),
      keywords: matchedKeywords,
      wordCount: words.length
    };
  },

  // Analyze multiple feedback entries
  analyzeFeedbackBatch: (feedbackList) => {
    const results = feedbackList.map(feedback => ({
      id: feedback.id,
      ...sentimentService.analyzeSentiment(feedback.message || feedback.feedback || ''),
      originalText: feedback.message || feedback.feedback || '',
      category: feedback.category || feedback.type || 'general',
      priority: feedback.priority || 'medium',
      created: feedback.created_at || feedback.created || new Date().toISOString()
    }));

    // Calculate overall statistics
    const stats = sentimentService.calculateSentimentStats(results);

    return {
      results,
      stats,
      processedCount: results.length,
      processedAt: new Date().toISOString()
    };
  },

  // Calculate sentiment statistics
  calculateSentimentStats: (sentimentResults) => {
    const total = sentimentResults.length;
    if (total === 0) return {};

    const positive = sentimentResults.filter(r => r.sentiment === 'positive').length;
    const negative = sentimentResults.filter(r => r.sentiment === 'negative').length;
    const neutral = sentimentResults.filter(r => r.sentiment === 'neutral').length;

    const averageScore = sentimentResults.reduce((sum, r) => sum + r.score, 0) / total;
    const averageConfidence = sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / total;

    // Category breakdown
    const categoryStats = {};
    sentimentResults.forEach(result => {
      if (!categoryStats[result.category]) {
        categoryStats[result.category] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      categoryStats[result.category][result.sentiment]++;
      categoryStats[result.category].total++;
    });

    // Priority breakdown
    const priorityStats = {};
    sentimentResults.forEach(result => {
      if (!priorityStats[result.priority]) {
        priorityStats[result.priority] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      priorityStats[result.priority][result.sentiment]++;
      priorityStats[result.priority].total++;
    });

    // Time-based analysis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFeedback = sentimentResults.filter(r => 
      new Date(r.created) >= thirtyDaysAgo
    );

    const trends = {
      recentCount: recentFeedback.length,
      recentPositive: recentFeedback.filter(r => r.sentiment === 'positive').length,
      recentNegative: recentFeedback.filter(r => r.sentiment === 'negative').length,
      recentNeutral: recentFeedback.filter(r => r.sentiment === 'neutral').length
    };

    return {
      total,
      distribution: {
        positive: { count: positive, percentage: ((positive / total) * 100).toFixed(1) },
        negative: { count: negative, percentage: ((negative / total) * 100).toFixed(1) },
        neutral: { count: neutral, percentage: ((neutral / total) * 100).toFixed(1) }
      },
      averageScore: parseFloat(averageScore.toFixed(3)),
      averageConfidence: parseFloat(averageConfidence.toFixed(3)),
      categoryStats,
      priorityStats,
      trends
    };
  },

  // Get sentiment insights and recommendations
  getSentimentInsights: (stats) => {
    const insights = [];
    const recommendations = [];

    if (!stats.total) {
      return { insights: ['No feedback data available'], recommendations: [] };
    }

    const positivePercent = parseFloat(stats.distribution.positive.percentage);
    const negativePercent = parseFloat(stats.distribution.negative.percentage);

    // Overall sentiment insights
    if (positivePercent > 70) {
      insights.push(`Excellent feedback sentiment with ${positivePercent}% positive responses`);
    } else if (positivePercent > 50) {
      insights.push(`Good feedback sentiment with ${positivePercent}% positive responses`);
    } else if (negativePercent > 50) {
      insights.push(`Concerning feedback sentiment with ${negativePercent}% negative responses`);
      recommendations.push('Immediate attention needed to address negative feedback patterns');
    } else {
      insights.push(`Mixed feedback sentiment requiring attention`);
    }

    // Category insights
    if (stats.categoryStats) {
      Object.entries(stats.categoryStats).forEach(([category, data]) => {
        const catNegPercent = ((data.negative / data.total) * 100).toFixed(1);
        if (data.negative > data.positive && data.total > 2) {
          insights.push(`${category} category has ${catNegPercent}% negative feedback`);
          recommendations.push(`Focus improvement efforts on ${category} issues`);
        }
      });
    }

    // Trend insights
    if (stats.trends && stats.trends.recentCount > 0) {
      const recentPosPercent = ((stats.trends.recentPositive / stats.trends.recentCount) * 100).toFixed(1);
      const recentNegPercent = ((stats.trends.recentNegative / stats.trends.recentCount) * 100).toFixed(1);

      if (recentNegPercent > negativePercent + 10) {
        insights.push(`Recent feedback shows declining sentiment (${recentNegPercent}% negative vs ${negativePercent}% overall)`);
        recommendations.push('Monitor recent changes that may be impacting user satisfaction');
      } else if (recentPosPercent > positivePercent + 10) {
        insights.push(`Recent feedback shows improving sentiment (${recentPosPercent}% positive vs ${positivePercent}% overall)`);
      }
    }

    // Confidence insights
    if (stats.averageConfidence < 0.6) {
      insights.push('Low confidence in sentiment analysis suggests mixed or ambiguous feedback');
      recommendations.push('Consider manual review of feedback for better categorization');
    }

    return { insights, recommendations };
  },

  // Extract key themes from feedback
  extractThemes: (feedbackList) => {
    const allText = feedbackList.map(f => f.message || f.feedback || '').join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(word => word.length > 3);
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get top themes (excluding common words)
    const commonWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they'];
    const themes = Object.entries(wordCount)
      .filter(([word]) => !commonWords.includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ theme: word, frequency: count }));

    return themes;
  },

  // Generate sentiment report
  generateSentimentReport: (feedbackList) => {
    const analysis = sentimentService.analyzeFeedbackBatch(feedbackList);
    const insights = sentimentService.getSentimentInsights(analysis.stats);
    const themes = sentimentService.extractThemes(feedbackList);

    return {
      summary: {
        totalFeedback: analysis.processedCount,
        sentimentDistribution: analysis.stats.distribution,
        averageScore: analysis.stats.averageScore,
        averageConfidence: analysis.stats.averageConfidence
      },
      insights: insights.insights,
      recommendations: insights.recommendations,
      themes,
      categoryBreakdown: analysis.stats.categoryStats,
      priorityBreakdown: analysis.stats.priorityStats,
      trends: analysis.stats.trends,
      detailedResults: analysis.results,
      generatedAt: new Date().toISOString()
    };
  }
};