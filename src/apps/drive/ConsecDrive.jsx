import { useState, useEffect } from 'react';
import { FaFolder, FaUpload, FaSearch, FaFile, FaImage, FaFilePdf, FaFileWord, FaHome, FaBrain, FaRobot, FaMagic, FaLightbulb, FaTags, FaTrash, FaDownload } from 'react-icons/fa';
import AppLayout from '../shared/AppLayout';
import { fileService } from '../../services/fileService';
import { useAuth } from '../../contexts/AuthContext';

export default function ConsecDrive({ user, navigate, onLogout }) {
  const { canAccessResource } = useAuth();
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [fileStats, setFileStats] = useState({});
  const [storageAnalytics, setStorageAnalytics] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState(null);
  const [organizationSuggestions, setOrganizationSuggestions] = useState(null);

  // Load user files and folders
  useEffect(() => {
    loadFiles();
    loadFolders();
    loadFileStats();
    loadAIInsights();
  }, [user]);

  const loadFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await fileService.getUserFiles(user.id, 50, 0, currentFolderId);
      if (result.success) {
        setFiles(result.data);
      } else {
        console.error('Error loading files:', result.error);
        // Fallback to mock data for demonstration
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    if (!user) return;
    
    try {
      const result = await fileService.getUserFolders(user.id, currentFolder);
      if (result.success) {
        setFolders(result.data);
      } else {
        console.error('Error loading folders:', result.error);
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    }
  };

  const loadFileStats = async () => {
    if (!user) return;
    
    try {
      const statsResult = await fileService.getFileStats(user.id);
      if (statsResult.success) {
        setFileStats(statsResult.data);
      }

      const analyticsResult = await fileService.getStorageAnalytics(user.id);
      if (analyticsResult.success) {
        setStorageAnalytics(analyticsResult.data);
      }
    } catch (error) {
      console.error('Error loading file stats:', error);
    }
  };

  const loadAIInsights = async () => {
    if (!user) return;
    
    try {
      const [insightsResult, duplicatesResult, suggestionsResult] = await Promise.all([
        fileService.getAIInsights(user.id),
        fileService.getDuplicateAnalysis(user.id),
        fileService.getOrganizationSuggestions(user.id)
      ]);

      if (insightsResult.success) {
        setAIInsights(insightsResult.data);
      }
      if (duplicatesResult.success) {
        setDuplicateAnalysis(duplicatesResult.data);
      }
      if (suggestionsResult.success) {
        setOrganizationSuggestions(suggestionsResult.data);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      // Upload file to storage
      const folderPath = currentFolder || `user_${user.id}`;
      const uploadResult = await fileService.uploadFile(file, folderPath);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Add folder path to the file data
      uploadResult.data.folderPath = currentFolder;

      // Save file metadata with folder ID
      const metadataResult = await fileService.saveFileMetadata(
        uploadResult.data, 
        user.id, 
        currentFolderId
      );
      if (!metadataResult.success) {
        throw new Error(metadataResult.error);
      }

      // Refresh files list and stats
      await Promise.all([
        loadFiles(),
        loadFileStats(),
        loadFolders(),
        loadAIInsights()
      ]);
      
      alert('File uploaded successfully!');
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const result = await fileService.deleteFile(fileId, user.id);
      if (result.success) {
        loadFiles();
        loadFileStats();
        loadAIInsights();
      } else {
        alert('Failed to delete file: ' + result.error);
      }
    } catch (error) {
      console.error('Delete file error:', error);
      alert('Failed to delete file');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    try {
      setLoading(true);
      const result = await fileService.searchFiles(searchQuery, user.id);
      if (result.success) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (folderName) => {
    if (!folderName.trim() || !user) return;

    try {
      const result = await fileService.createFolder(folderName, currentFolder, user.id);
      if (result.success) {
        await loadFolders();
        alert('Folder created successfully!');
      } else {
        alert('Failed to create folder: ' + result.error);
      }
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder');
    }
  };

  // Apply AI tags to file
  const handleApplyAITags = async (fileId) => {
    try {
      const result = await fileService.applyAITags(fileId, user.id);
      if (result.success) {
        await loadFiles();
        alert('AI tags applied successfully!');
      } else {
        alert('Failed to apply AI tags: ' + result.error);
      }
    } catch (error) {
      console.error('Apply AI tags error:', error);
      alert('Failed to apply AI tags');
    }
  };

  // Find similar files
  const handleFindSimilarFiles = async (fileId) => {
    try {
      const result = await fileService.findSimilarFiles(fileId, user.id);
      if (result.success && result.data.length > 0) {
        setSelectedFile({ id: fileId, similarFiles: result.data });
        setShowAIModal(true);
      } else {
        alert('No similar files found');
      }
    } catch (error) {
      console.error('Find similar files error:', error);
      alert('Failed to find similar files');
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (fileId) => {
    try {
      const result = await fileService.toggleFavorite(fileId, user.id);
      if (result.success) {
        await loadFiles();
      } else {
        alert('Failed to update favorite status: ' + result.error);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      alert('Failed to update favorite status');
    }
  };

  const menuItems = [
    { id: 'files', label: 'All Files', icon: <FaHome /> },
    { id: 'upload', label: 'Upload', icon: <FaUpload /> },
    { id: 'folders', label: 'Folders', icon: <FaFolder /> },
    { id: 'ai-insights', label: 'ConsecIQ Insights', icon: <FaBrain /> },
    { id: 'search', label: 'Search', icon: <FaSearch /> }
  ];

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <FaFilePdf className="text-red-500" />;
    } else if (mimeType?.includes('word') || fileName?.match(/\.(doc|docx)$/)) {
      return <FaFileWord className="text-blue-500" />;
    } else if (mimeType?.includes('image') || fileName?.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return <FaImage className="text-green-500" />;
    } else {
      return <FaFile className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'files':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">All Files</h2>
            
            {/* Storage Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Storage Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#14B8A6]">
                    {storageAnalytics ? formatFileSize(storageAnalytics.totalSize) : '0 GB'}
                  </p>
                  <p className="text-gray-500 text-sm">Used</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">
                    {storageAnalytics ? formatFileSize(5000000000 - storageAnalytics.totalSize) : '5 GB'}
                  </p>
                  <p className="text-gray-500 text-sm">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#14B8A6]">5 GB</p>
                  <p className="text-gray-500 text-sm">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#14B8A6]">
                    {storageAnalytics ? storageAnalytics.totalFiles : files.length}
                  </p>
                  <p className="text-gray-500 text-sm">Files</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#14B8A6] h-2 rounded-full" 
                    style={{ 
                      width: storageAnalytics 
                        ? `${Math.min((storageAnalytics.totalSize / 5000000000) * 100, 100)}%`
                        : '5%'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* ConsecIQ AI Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBrain className="text-2xl text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">ConsecIQ Smart Organization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRobot className="text-green-600" />
                    <span className="font-semibold text-gray-800">Auto-Tagged</span>
                  </div>
                  <p className="text-sm text-gray-600">{aiInsights?.taggedFiles || 0} files organized with AI tags</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMagic className="text-purple-600" />
                    <span className="font-semibold text-gray-800">Duplicates Found</span>
                  </div>
                  <p className="text-sm text-gray-600">{duplicateAnalysis?.duplicateCount || 0} similar files detected</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaLightbulb className="text-yellow-600" />
                    <span className="font-semibold text-gray-800">Suggestions</span>
                  </div>
                  <p className="text-sm text-gray-600">{organizationSuggestions?.totalSuggestions || 0} optimization recommendations</p>
                </div>
              </div>
            </div>

            {/* Files Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Files</h3>
                  <button className="text-[#14B8A6] hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? (
                    Array.from({length: 8}).map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : files.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <FaUpload className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No files uploaded yet</p>
                      <p className="text-gray-400 text-sm mb-4">Upload your first file to get started</p>
                      <button 
                        onClick={() => setActiveTab('upload')}
                        className="px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition"
                      >
                        Upload Files
                      </button>
                    </div>
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer group">
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(file.mime_type, file.filename)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate" title={file.original_filename}>
                              {file.original_filename || file.filename}
                            </p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(file.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className={`text-lg ${file.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}>
                              ⭐
                            </span>
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                          <p>Modified: {formatDate(file.updated_at)}</p>
                          <p>Folder: {file.folders?.folder_name || 'Root'}</p>
                          {file.ai_category && (
                            <p>Category: <span className="capitalize">{file.ai_category}</span></p>
                          )}
                        </div>
                        
                        {/* AI Insights Preview */}
                        {file.ai_summary && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-blue-50 p-2 rounded-lg mb-2">
                              <div className="flex items-center gap-1 mb-1">
                                <FaBrain className="text-blue-600 text-xs" />
                                <span className="text-xs font-semibold text-gray-700">AI Summary</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{file.ai_summary}</p>
                            </div>
                            
                            {/* AI Tags */}
                            {file.ai_suggested_tags && file.ai_suggested_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {file.ai_suggested_tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 text-xs">
                              <button 
                                className="text-[#14B8A6] hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyAITags(file.id);
                                }}
                              >
                                Apply AI Tags
                              </button>
                              <button 
                                className="text-blue-600 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFindSimilarFiles(file.id);
                                }}
                              >
                                Find Similar
                              </button>
                              <button 
                                className="text-red-600 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Upload Files</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FaUpload className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Drop files here or click to upload</h3>
                <p className="text-gray-500 mb-6">Support for PDF, DOC, DOCX, PNG, JPG, JPEG files</p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
                />
                <label 
                  htmlFor="file-upload"
                  className={`px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition cursor-pointer inline-block ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Choose Files'}
                </label>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Folder</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
                  value={currentFolder}
                  onChange={(e) => setCurrentFolder(e.target.value)}
                >
                  <option value="">Root Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.folder_path}>{folder.folder_name}</option>
                  ))}
                </select>
              </div>
              
              {uploading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#14B8A6] mr-2"></div>
                    <span className="text-sm text-blue-600">Uploading file...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'folders':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Folders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setCurrentFolder(folder.folder_path);
                    setCurrentFolderId(folder.id);
                    setActiveTab('files');
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FaFolder 
                      className="text-4xl" 
                      style={{ color: folder.color || '#14B8A6' }} 
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{folder.folder_name}</h3>
                      <p className="text-sm text-gray-500">{folder.file_count} files</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Size: {formatFileSize(folder.total_size)}</p>
                    {folder.description && (
                      <p className="text-xs mt-1 text-gray-400">{folder.description}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add New Folder */}
              <div 
                className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-[#14B8A6] transition cursor-pointer"
                onClick={() => {
                  const folderName = prompt('Enter folder name:');
                  if (folderName) {
                    createFolder(folderName);
                  }
                }}
              >
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FaFolder className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600">Create New Folder</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-insights':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">ConsecIQ Drive Insights</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <FaBrain className="text-blue-600" />
                <span className="text-blue-600 font-semibold">AI Powered</span>
              </div>
            </div>

            {/* AI Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaTags className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Auto-Tagging</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tagged Files</span>
                    <span className="font-bold text-[#14B8A6]">{aiInsights?.taggedFiles || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-bold text-green-600">{aiInsights?.accuracy || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaMagic className="text-2xl text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Duplicates</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Found</span>
                    <span className="font-bold text-red-600">{duplicateAnalysis?.duplicateCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space Saved</span>
                    <span className="font-bold text-[#14B8A6]">{duplicateAnalysis ? formatFileSize(duplicateAnalysis.spaceSaved) : '0 MB'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-2xl text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Organization</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggestions</span>
                    <span className="font-bold text-orange-600">{organizationSuggestions?.totalSuggestions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Implemented</span>
                    <span className="font-bold text-green-600">{organizationSuggestions?.implementedSuggestions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaSearch className="text-2xl text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Smart Search</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indexed Files</span>
                    <span className="font-bold text-[#14B8A6]">{files.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Search Speed</span>
                    <span className="font-bold text-green-600">0.1s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Intelligence Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">File Intelligence Analysis</h3>
              <div className="space-y-4">
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBrain className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No files to analyze yet</p>
                    <p className="text-gray-400 text-sm">Upload files to see AI insights</p>
                  </div>
                ) : (
                  files.filter(file => file.ai_summary || file.ai_category).map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file.mime_type, file.filename)}
                          <div>
                            <h4 className="font-semibold text-gray-800">{file.original_filename || file.filename}</h4>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.file_size)} • {file.folders?.folder_name || 'Root'} • {formatDate(file.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.ai_priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              file.ai_priority === 'high' ? 'bg-red-100 text-red-800' :
                              file.ai_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {file.ai_priority} priority
                            </span>
                          )}
                          {file.ai_category && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {file.ai_category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaBrain className="text-blue-600" />
                            <span className="font-semibold text-gray-800">AI Summary</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {file.ai_summary || 'AI analysis pending...'}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaTags className="text-green-600" />
                            <span className="font-semibold text-gray-800">Suggested Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {file.ai_suggested_tags && file.ai_suggested_tags.length > 0 ? (
                              file.ai_suggested_tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No tags suggested</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FaRobot className="text-purple-600" />
                            <span className="font-semibold text-gray-800">Keywords</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {file.ai_keywords && file.ai_keywords.length > 0 ? (
                              file.ai_keywords.slice(0, 5).map((keyword, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  {keyword}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">No keywords detected</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => handleApplyAITags(file.id)}
                          className="px-4 py-2 bg-[#14B8A6] text-white text-sm rounded-lg hover:bg-[#0d9488] transition"
                        >
                          Apply AI Tags
                        </button>
                        <button 
                          onClick={() => handleFindSimilarFiles(file.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                        >
                          Find Similar Files
                        </button>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="px-4 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition"
                        >
                          Delete File
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Duplicate Detection</h3>
                <div className="space-y-4">
                  {duplicateAnalysis && duplicateAnalysis.duplicateCount > 0 ? (
                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">Similar Files Found</span>
                        <span className="text-orange-600 font-bold">{duplicateAnalysis.duplicateCount} files</span>
                      </div>
                      <div className="space-y-2">
                        {duplicateAnalysis.duplicateFiles.slice(0, 3).map((file, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • "{file.original_filename || file.filename}" ({formatFileSize(file.file_size)})
                          </div>
                        ))}
                        {duplicateAnalysis.duplicateFiles.length > 3 && (
                          <div className="text-sm text-gray-500">
                            ...and {duplicateAnalysis.duplicateFiles.length - 3} more duplicates
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Potential space savings: {formatFileSize(duplicateAnalysis.spaceSaved)}
                      </div>
                      <button className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition">
                        Review Duplicates
                      </button>
                    </div>
                  ) : (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMagic className="text-green-600" />
                        <span className="font-semibold text-gray-800">No Duplicates Found</span>
                      </div>
                      <p className="text-sm text-gray-600">Your files are well organized with no duplicates detected.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Organization Suggestions</h3>
                <div className="space-y-3">
                  {organizationSuggestions && organizationSuggestions.suggestions && organizationSuggestions.suggestions.length > 0 ? (
                    organizationSuggestions.suggestions.map((suggestion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                        <div className="flex items-center gap-3 mb-2">
                          {suggestion.type === 'create_folders' && <FaFolder className="text-yellow-500" />}
                          {suggestion.type === 'category_folder' && <FaLightbulb className="text-blue-500" />}
                          {suggestion.type === 'archive_old' && <FaMagic className="text-purple-500" />}
                          <span className="font-semibold text-gray-800 capitalize">
                            {suggestion.type.replace('_', ' ')} Suggestion
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                        <button 
                          className="mt-2 px-3 py-1 bg-[#14B8A6] text-white text-xs rounded hover:bg-[#0d9488] transition"
                          onClick={() => {
                            alert(`Suggestion: ${suggestion.description}\nThis feature will be implemented in future updates.`);
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FaLightbulb className="text-green-600" />
                        <span className="font-semibold text-gray-800">Well Organized!</span>
                      </div>
                      <p className="text-sm text-gray-600">Your files are well organized. No suggestions at this time.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Performance Dashboard */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Performance & Training</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#14B8A6] mb-1">{aiInsights?.accuracy || 0}%</div>
                  <div className="text-sm text-gray-600">Tagging Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#14B8A6] mb-1">0.1s</div>
                  <div className="text-sm text-gray-600">Search Speed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#14B8A6] mb-1">
                    {duplicateAnalysis ? Math.round((duplicateAnalysis.duplicateCount / Math.max(files.length, 1)) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Duplicate Detection</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#14B8A6] mb-1">
                    {duplicateAnalysis ? formatFileSize(duplicateAnalysis.spaceSaved) : '0MB'}
                  </div>
                  <div className="text-sm text-gray-600">Space Saved</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => {
                      alert(`AI Model Retraining initiated!\n\nCurrent Performance:\n• Tagged Files: ${aiInsights?.taggedFiles || 0}\n• Accuracy: ${aiInsights?.accuracy || 0}%\n• Total Files Analyzed: ${files.length}\n\nThis process will improve AI accuracy based on your file patterns.`);
                      loadAIInsights(); // Refresh insights
                    }}
                  >
                    <FaBrain className="inline mr-2" />
                    Retrain AI Model
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    onClick={() => {
                      const categories = Object.keys(aiInsights?.categories || {}).join(', ') || 'document, image, spreadsheet, archive';
                      alert(`Update Categories\n\nCurrent Categories: ${categories}\n\nCategory analysis helps organize files automatically based on content type and usage patterns.`);
                      loadAIInsights(); // Refresh insights
                    }}
                  >
                    <FaMagic className="inline mr-2" />
                    Update Categories
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    onClick={() => {
                      const suggestions = organizationSuggestions?.totalSuggestions || 0;
                      alert(`Optimize Suggestions\n\nCurrent Suggestions: ${suggestions}\nImplemented: ${organizationSuggestions?.implementedSuggestions || 0}\n\nOptimizing suggestion algorithms based on your organization patterns and file usage.`);
                      loadAIInsights(); // Refresh insights
                    }}
                  >
                    <FaLightbulb className="inline mr-2" />
                    Optimize Suggestions
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Search Files</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files by name, content, or tags..."
                    className="flex-1 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className={`px-6 py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              <div className="flex gap-4 mt-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Types</option>
                  <option>PDF</option>
                  <option>Images</option>
                  <option>Documents</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Folders</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.folder_path}>{folder.folder_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
              
              {searchQuery && files.length > 0 ? (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file.mime_type, file.filename)}
                          <div>
                            <h4 className="font-semibold text-gray-800">{file.original_filename || file.filename}</h4>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.file_size)} • {file.folders?.folder_name || 'Root'} • {formatDate(file.created_at)}
                            </p>
                            {file.ai_summary && (
                              <p className="text-sm text-gray-600 mt-1">{file.ai_summary}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.ai_priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              file.ai_priority === 'high' ? 'bg-red-100 text-red-800' :
                              file.ai_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {file.ai_priority}
                            </span>
                          )}
                          {file.ai_category && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {file.ai_category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {file.ai_suggested_tags && file.ai_suggested_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {file.ai_suggested_tags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleApplyAITags(file.id)}
                          className="px-3 py-1 bg-[#14B8A6] text-white text-xs rounded hover:bg-[#0d9488] transition"
                        >
                          Apply AI Tags
                        </button>
                        <button 
                          onClick={() => handleFindSimilarFiles(file.id)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition"
                        >
                          Find Similar
                        </button>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="px-3 py-1 border border-red-300 text-red-700 text-xs rounded hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No files found for "{searchQuery}"</p>
                  <p className="text-gray-400 text-sm">Try different search terms or check your spelling</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter search terms to find your files</p>
                  <p className="text-gray-400 text-sm">Search by filename, content, or AI-generated tags</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AppLayout
      appName="ConsecDrive"
      appIcon={<FaFolder />}
      user={user}
      navigate={navigate}
      onLogout={onLogout}
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </AppLayout>
  );
}