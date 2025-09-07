import { useState, useEffect } from 'react';
import { FaThumbsUp, FaThumbsDown, FaComment, FaStar, FaBrain, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaMinusCircle, FaFilePdf, FaFileCsv, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { sentimentService } from '../services/sentimentService';
import { exportService } from '../services/exportService';
import { useAuth, ProtectedComponent } from '../contexts/AuthContext';
import { PERMISSIONS } from '../services/auth';

export default function AdminFeedback({ navigate, onLogout }) {
  const { hasPermission } = useAuth();
  const [sentimentReport, setSentimentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleExportFeedback = async () => {
    try {
      const result = await exportService.exportReportToCSV(feedbackData, 'feedback', 'feedback-export.csv');
      if (result.success) {
        alert('Feedback data exported successfully!');
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export feedback data');
    }
  };

  const handleResolveFeedback = (id) => {
    alert(`Feedback ${id} marked as resolved`);
  };

  const handleArchiveFeedback = (id) => {
    if (confirm('Are you sure you want to archive this feedback?')) {
      alert(`Feedback ${id} archived`);
    }
  };

  // Mock feedback data
  const [feedbackData] = useState([
    {
      id: 1,
      message: "The new dashboard is absolutely fantastic! Love the clean design and easy navigation. It makes my work so much more efficient.",
      category: 'ui_ux',
      priority: 'low',
      user_name: 'John Doe',
      created_at: '2024-01-20T10:30:00Z',
      status: 'resolved'
    },
    {
      id: 2,
      message: "Having terrible issues with file uploads. The system crashes every time I try to upload large files. Very frustrating!",
      category: 'technical',
      priority: 'high',
      user_name: 'Sarah Wilson',
      created_at: '2024-01-19T14:22:00Z',
      status: 'open'
    },
    {
      id: 3,
      message: "The quote generation feature is good but could use some improvements. Sometimes it takes too long to load.",
      category: 'feature',
      priority: 'medium',
      user_name: 'Mike Chen',
      created_at: '2024-01-18T09:15:00Z',
      status: 'in_progress'
    },
    {
      id: 4,
      message: "Customer support is excellent! Quick response time and very helpful staff. Keep up the great work!",
      category: 'support',
      priority: 'low',
      user_name: 'Lisa Anderson',
      created_at: '2024-01-17T16:45:00Z',
      status: 'resolved'
    },
    {
      id: 5,
      message: "The mobile app is completely broken. Nothing works properly. This is unacceptable for a professional tool.",
      category: 'mobile',
      priority: 'high',
      user_name: 'David Brown',
      created_at: '2024-01-16T11:30:00Z',
      status: 'open'
    },
    {
      id: 6,
      message: "Pricing is reasonable and the features are comprehensive. Overall satisfied with the service.",
      category: 'pricing',
      priority: 'low',
      user_name: 'Emma Davis',
      created_at: '2024-01-15T13:20:00Z',
      status: 'resolved'
    },
    {
      id: 7,
      message: "Security features are robust and give me peace of mind when handling sensitive client data.",
      category: 'security',
      priority: 'medium',
      user_name: 'Robert Johnson',
      created_at: '2024-01-14T08:45:00Z',
      status: 'resolved'
    },
    {
      id: 8,
      message: "The reporting dashboard needs work. Hard to find the metrics I need and export options are limited.",
      category: 'reporting',
      priority: 'medium',
      user_name: 'Jennifer Lee',
      created_at: '2024-01-13T15:10:00Z',
      status: 'in_progress'
    }
  ]);

  // Load sentiment analysis on mount
  useEffect(() => {
    const analyzeData = async () => {
      try {
        setLoading(true);
        const report = sentimentService.generateSentimentReport(feedbackData);
        setSentimentReport(report);
      } catch (error) {
        console.error('Sentiment analysis error:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, [feedbackData]);

  // Export functions
  const handleExportSentimentPDF = async () => {
    if (!sentimentReport) return;
    
    try {
      const result = await exportService.exportSentimentReportToPDF(sentimentReport);
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
      } else {
        alert('Failed to export PDF: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export sentiment report');
    }
  };

  const handleExportFeedbackCSV = async () => {
    try {
      const result = await exportService.exportReportToCSV(feedbackData, 'feedback', 'feedback-export.csv');
      if (result.success) {
        console.log(`Exported ${result.fileName}`);
      } else {
        alert('Failed to export CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export feedback data');
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <FaCheckCircle className="text-green-500" />;
      case 'negative':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaMinusCircle className="text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !sentimentReport) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14B8A6]"></div>
            <span className="ml-3 text-gray-600">Analyzing sentiment...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Feedback Analytics</h1>
          <div className="flex items-center gap-3">
            <ProtectedComponent requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
              <button 
                onClick={handleExportSentimentPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                title="Export sentiment report as PDF"
              >
                <FaFilePdf />
                Export Report
              </button>
              <button 
                onClick={handleExportFeedbackCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Export feedback data as CSV"
              >
                <FaFileCsv />
                Export CSV
              </button>
            </ProtectedComponent>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaBrain className="text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-800">Total Analyzed</h3>
            </div>
            <p className="text-3xl font-bold text-[#14B8A6]">{sentimentReport.summary.totalFeedback}</p>
            <p className="text-sm text-gray-500">AI-powered analysis</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Positive</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{sentimentReport.summary.sentimentDistribution.positive.percentage}%</p>
            <p className="text-sm text-gray-500">{sentimentReport.summary.sentimentDistribution.positive.count} responses</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Negative</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{sentimentReport.summary.sentimentDistribution.negative.percentage}%</p>
            <p className="text-sm text-gray-500">{sentimentReport.summary.sentimentDistribution.negative.count} responses</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Avg Score</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{sentimentReport.summary.averageScore}</p>
            <p className="text-sm text-gray-500">Confidence: {(sentimentReport.summary.averageConfidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-500" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {sentimentReport.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-500" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {sentimentReport.recommendations.length > 0 ? (
                sentimentReport.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <FaExclamationTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                  <p>No immediate action required. Sentiment levels are healthy!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Themes */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaComment className="text-blue-500" />
            Key Themes
          </h3>
          <div className="flex flex-wrap gap-3">
            {sentimentReport.themes.map((theme, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <span className="font-medium text-gray-700">{theme.theme}</span>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {theme.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback by Category</h3>
            <div className="space-y-4">
              {Object.entries(sentimentReport.categoryBreakdown || {}).map(([category, data]) => (
                <div key={category} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <FaComment className="text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">{category.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">{data.total} responses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#14B8A6]">{data.total}</p>
                      <p className="text-sm text-gray-500">{((data.total / sentimentReport.summary.totalFeedback) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="font-semibold text-green-700">{data.positive}</p>
                      <p className="text-green-600">Positive</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="font-semibold text-gray-700">{data.neutral}</p>
                      <p className="text-gray-600">Neutral</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="font-semibold text-red-700">{data.negative}</p>
                      <p className="text-red-600">Negative</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis Trends</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Positive</span>
                  <span className="text-sm font-semibold text-green-600">2,696 (78%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Neutral</span>
                  <span className="text-sm font-semibold text-gray-600">553 (16%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '16%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Negative</span>
                  <span className="text-sm font-semibold text-red-600">207 (6%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">App-Specific Feedback</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ConsecDrive</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#14B8A6]">4.5</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ConsecQuote</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#14B8A6]">4.2</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ConsecDesk</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#14B8A6]">3.9</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { word: 'easy to use', count: 234 },
                { word: 'great features', count: 189 },
                { word: 'slow loading', count: 156 },
                { word: 'love it', count: 143 },
                { word: 'needs improvement', count: 98 },
                { word: 'excellent support', count: 87 },
                { word: 'bug fix needed', count: 76 },
                { word: 'intuitive design', count: 65 }
              ].map((keyword, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#14B8A6] hover:text-white transition cursor-pointer"
                >
                  {keyword.word} ({keyword.count})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Sentiment Analysis */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaBrain className="text-purple-500" />
                Detailed Sentiment Analysis
              </h2>
              <div className="flex gap-4">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(sentimentReport.categoryBreakdown || {}).map(category => (
                    <option key={category} value={category}>{category.replace('_', ' ')}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search feedback..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Categories</option>
                  <option>Feature Requests</option>
                  <option>Bug Reports</option>
                  <option>General Feedback</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none">
                  <option>All Sentiments</option>
                  <option>Positive</option>
                  <option>Neutral</option>
                  <option>Negative</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {sentimentReport.detailedResults
              .filter(result => selectedCategory === 'all' || result.category === selectedCategory)
              .map((result, index) => (
                <div key={result.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-semibold">
                        {feedbackData.find(f => f.id === result.id)?.user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{feedbackData.find(f => f.id === result.id)?.user_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500 capitalize">{result.category.replace('_', ' ')} • {new Date(result.created).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="text-gray-600">Score: <span className="font-medium">{result.score}</span></p>
                        <p className="text-gray-500">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(result.sentiment)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(result.sentiment)}`}>
                          {result.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3 italic">
                    "{result.originalText}"
                  </p>
                  {result.keywords.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Key sentiment indicators:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.slice(0, 5).map((keyword, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              keyword.type === 'positive' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {keyword.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <ProtectedComponent requiredPermissions={[PERMISSIONS.MODERATE_FEEDBACK]}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{result.wordCount} words</span>
                        <span className="capitalize">{result.priority} priority</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm text-[#14B8A6] border border-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                          Respond
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition">
                          Archive
                        </button>
                      </div>
                    </div>
                  </ProtectedComponent>
                </div>
              ))}
          
            {/* Additional feedback items */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                    MC
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Mike Chen</p>
                    <p className="text-sm text-gray-500">mike@startup.co</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Negative
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2].map((star) => (
                      <FaStar key={star} className="text-yellow-400 text-sm" />
                    ))}
                    {[3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-gray-300 text-sm" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                "The proposal editor in ConsecQuote keeps crashing when I try to add more than 20 line items. This is really frustrating and affecting my workflow."
              </p>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>ConsecQuote</span>
                  <span>Bug Report</span>
                  <span>5 hours ago</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm text-[#14B8A6] border border-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                    Respond
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition">
                    Priority
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    EW
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Emily Wilson</p>
                    <p className="text-sm text-gray-500">emily@design.agency</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Neutral
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <FaStar key={star} className="text-yellow-400 text-sm" />
                    ))}
                    <FaStar className="text-gray-300 text-sm" />
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                "Overall satisfied with ConsecDesk, but would love to see more customization options for ticket categories and automated responses."
              </p>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>ConsecDesk</span>
                  <span>Feature Request</span>
                  <span>1 day ago</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm text-[#14B8A6] border border-[#14B8A6] rounded hover:bg-[#14B8A6] hover:text-white transition">
                    Respond
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition">
                    Archive
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                  <span className="font-medium">3,456</span> results
                </div>
                <div className="flex space-x-1">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm bg-[#14B8A6] text-white rounded hover:bg-[#0d9488]">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}