import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

// Search utilities
export const searchUtils = {
  // Normalize text for searching (remove accents, lowercase, etc.)
  normalizeText: (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  },

  // Calculate relevance score for a match
  calculateRelevance: (text, query, field = 'content') => {
    const normalizedText = searchUtils.normalizeText(text);
    const normalizedQuery = searchUtils.normalizeText(query);
    
    if (!normalizedText || !normalizedQuery) return 0;

    let score = 0;
    const words = normalizedQuery.split(' ').filter(Boolean);

    // Exact match bonus
    if (normalizedText === normalizedQuery) {
      score += 100;
    }

    // Starts with query bonus
    if (normalizedText.startsWith(normalizedQuery)) {
      score += 50;
    }

    // Contains full query bonus
    if (normalizedText.includes(normalizedQuery)) {
      score += 25;
    }

    // Word match scoring
    words.forEach(word => {
      if (normalizedText.includes(word)) {
        // Word appears bonus
        score += 10;
        
        // Position bonus (earlier = better)
        const position = normalizedText.indexOf(word);
        const positionScore = Math.max(0, 5 - (position / normalizedText.length) * 5);
        score += positionScore;
        
        // Word boundary bonus
        const wordBoundaryRegex = new RegExp(`\\b${word}\\b`);
        if (wordBoundaryRegex.test(normalizedText)) {
          score += 5;
        }
      }
    });

    // Field-specific bonuses
    const fieldMultipliers = {
      title: 2.0,
      name: 2.0,
      email: 1.5,
      description: 1.2,
      content: 1.0,
      tags: 1.3
    };

    score *= fieldMultipliers[field] || 1.0;

    return score;
  },

  // Highlight search terms in text
  highlightMatches: (text, query, className = 'bg-yellow-200') => {
    if (!text || !query) return text;
    
    const normalizedQuery = searchUtils.normalizeText(query);
    const words = normalizedQuery.split(' ').filter(Boolean);
    
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="${className}">$1</mark>`
      );
    });
    
    return highlightedText;
  },

  // Extract context around matches
  extractContext: (text, query, contextLength = 100) => {
    if (!text || !query) return text;
    
    const normalizedText = searchUtils.normalizeText(text);
    const normalizedQuery = searchUtils.normalizeText(query);
    const queryIndex = normalizedText.indexOf(normalizedQuery);
    
    if (queryIndex === -1) return text;
    
    const start = Math.max(0, queryIndex - contextLength / 2);
    const end = Math.min(text.length, queryIndex + normalizedQuery.length + contextLength / 2);
    
    let context = text.substring(start, end);
    
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }
};

// Main search hook
export const useSearch = (
  data = [],
  searchFields = ['name', 'title', 'content'],
  options = {}
) => {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 50,
    sortBy = 'relevance', // 'relevance', 'date', 'alphabetical'
    filterFn = null,
    transformFn = null,
    enableHighlight = true,
    highlightClassName = 'bg-yellow-200'
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce query updates
  const debouncedSetQuery = useCallback(
    debounce((newQuery) => {
      setDebouncedQuery(newQuery);
      setIsSearching(false);
    }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsSearching(true);
      debouncedSetQuery(query);
    }
  }, [query, debouncedQuery, debouncedSetQuery]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return {
        results: data.slice(0, maxResults),
        totalCount: data.length,
        hasMore: data.length > maxResults,
        query: debouncedQuery
      };
    }

    let filteredData = data;

    // Apply custom filter if provided
    if (filterFn) {
      filteredData = data.filter(filterFn);
    }

    // Search and score results
    const scoredResults = filteredData
      .map(item => {
        let totalScore = 0;
        let bestField = '';
        let bestMatch = '';

        // Calculate relevance score for each field
        searchFields.forEach(field => {
          const fieldValue = getNestedValue(item, field);
          const fieldScore = searchUtils.calculateRelevance(fieldValue, debouncedQuery, field);
          
          if (fieldScore > totalScore) {
            totalScore = fieldScore;
            bestField = field;
            bestMatch = fieldValue;
          }
        });

        // Transform item if transform function provided
        const transformedItem = transformFn ? transformFn(item) : item;

        return {
          ...transformedItem,
          _searchScore: totalScore,
          _searchField: bestField,
          _searchMatch: bestMatch,
          _highlighted: enableHighlight ? highlightSearchTerms(transformedItem, debouncedQuery) : null
        };
      })
      .filter(item => item._searchScore > 0);

    // Sort results
    scoredResults.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b._searchScore - a._searchScore;
        case 'date':
          return new Date(b.created_at || b.updatedAt || 0) - new Date(a.created_at || a.updatedAt || 0);
        case 'alphabetical':
          const aName = a.name || a.title || '';
          const bName = b.name || b.title || '';
          return aName.localeCompare(bName);
        default:
          return b._searchScore - a._searchScore;
      }
    });

    // Limit results
    const results = scoredResults.slice(0, maxResults);

    return {
      results,
      totalCount: scoredResults.length,
      hasMore: scoredResults.length > maxResults,
      query: debouncedQuery
    };
  }, [data, debouncedQuery, searchFields, minQueryLength, maxResults, sortBy, filterFn, transformFn, enableHighlight]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj) || '';
  };

  // Helper function to highlight search terms in an object
  const highlightSearchTerms = (item, query) => {
    const highlighted = { ...item };
    
    searchFields.forEach(field => {
      const value = getNestedValue(item, field);
      if (value) {
        setNestedValue(highlighted, field, searchUtils.highlightMatches(value, query, highlightClassName));
      }
    });

    return highlighted;
  };

  // Helper function to set nested object values
  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((curr, key) => curr[key] = curr[key] || {}, obj);
    target[lastKey] = value;
  };

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  }, []);

  // Set search query
  const search = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    debouncedQuery,
    isSearching,
    results: searchResults.results,
    totalCount: searchResults.totalCount,
    hasMore: searchResults.hasMore,
    search,
    clearSearch,
    isEmpty: searchResults.results.length === 0 && debouncedQuery.length >= minQueryLength
  };
};

// Specialized search hooks

// Search for users
export const useUserSearch = (users = [], options = {}) => {
  return useSearch(users, ['name', 'email', 'full_name'], {
    ...options,
    transformFn: (user) => ({
      ...user,
      displayName: user.full_name || user.name || user.email
    })
  });
};

// Search for files
export const useFileSearch = (files = [], options = {}) => {
  return useSearch(files, ['name', 'original_name', 'description', 'tags'], {
    ...options,
    filterFn: (file) => file.status !== 'deleted',
    transformFn: (file) => ({
      ...file,
      fileExtension: file.name?.split('.').pop()?.toLowerCase(),
      sizeFormatted: formatFileSize(file.size)
    })
  });
};

// Search for tickets
export const useTicketSearch = (tickets = [], options = {}) => {
  return useSearch(tickets, ['title', 'description', 'client_name', 'tags'], {
    ...options,
    filterFn: (ticket) => ticket.status !== 'archived'
  });
};

// Search for proposals
export const useProposalSearch = (proposals = [], options = {}) => {
  return useSearch(proposals, ['title', 'client_name', 'description', 'content'], options);
};

// Global search across multiple data types
export const useGlobalSearch = (dataSources = {}, options = {}) => {
  const [searchType, setSearchType] = useState('all');
  
  const combinedData = useMemo(() => {
    if (searchType === 'all') {
      return Object.entries(dataSources).flatMap(([type, items]) =>
        items.map(item => ({ ...item, _type: type }))
      );
    }
    return dataSources[searchType] || [];
  }, [dataSources, searchType]);

  const searchConfig = {
    users: ['name', 'email', 'full_name'],
    files: ['name', 'original_name', 'description'],
    tickets: ['title', 'description', 'client_name'],
    proposals: ['title', 'client_name', 'description'],
    all: ['name', 'title', 'email', 'description', 'client_name']
  };

  const searchFields = searchConfig[searchType] || searchConfig.all;

  const searchResults = useSearch(combinedData, searchFields, options);

  return {
    ...searchResults,
    searchType,
    setSearchType,
    availableTypes: ['all', ...Object.keys(dataSources)]
  };
};

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default useSearch;