import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaSpinner, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { ResponsiveButton } from './ResponsiveLayout';

// Basic Search Input Component
export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  loading = false,
  className = '',
  size = 'medium',
  disabled = false,
  autoFocus = false,
  ...props
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-3 text-lg'
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <FaSearch className="h-4 w-4 text-gray-400" />
        )}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full pl-10 pr-10 border border-gray-300 rounded-lg
          focus:ring-[#14B8A6] focus:border-[#14B8A6] transition-colors
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${sizeClasses[size]}
        `}
        {...props}
      />
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          disabled={disabled}
        >
          <FaTimes className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

// Advanced Search Bar with filters
export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  loading = false,
  filters = [],
  activeFilters = {},
  onFilterChange,
  sortOptions = [],
  sortBy = '',
  onSortChange,
  showFilters = false,
  onToggleFilters,
  className = ''
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFilters);

  const toggleFilters = () => {
    const newState = !isFiltersOpen;
    setIsFiltersOpen(newState);
    if (onToggleFilters) {
      onToggleFilters(newState);
    }
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={className}>
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <SearchInput
            value={value}
            onChange={onChange}
            onClear={onClear}
            placeholder={placeholder}
            loading={loading}
          />
        </div>
        
        {filters.length > 0 && (
          <ResponsiveButton
            variant="outline"
            size="medium"
            onClick={toggleFilters}
            className={`relative ${activeFilterCount > 0 ? 'ring-2 ring-[#14B8A6]' : ''}`}
          >
            <FaFilter className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#14B8A6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </ResponsiveButton>
        )}
        
        {sortOptions.length > 0 && (
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-[#14B8A6] focus:border-[#14B8A6]"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FaSortAmountDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
      
      {isFiltersOpen && filters.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <FilterItem
                key={filter.key}
                filter={filter}
                value={activeFilters[filter.key]}
                onChange={(value) => onFilterChange && onFilterChange(filter.key, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Filter Item Component
const FilterItem = ({ filter, value, onChange }) => {
  const { type, key, label, options = [], placeholder } = filter;

  switch (type) {
    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#14B8A6] focus:border-[#14B8A6]"
          >
            <option value="">{placeholder || 'All'}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            id={key}
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-[#14B8A6] border-gray-300 rounded focus:ring-[#14B8A6]"
          />
          <label htmlFor={key} className="ml-2 text-sm text-gray-700">
            {label}
          </label>
        </div>
      );

    case 'date':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#14B8A6] focus:border-[#14B8A6]"
          />
        </div>
      );

    case 'text':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#14B8A6] focus:border-[#14B8A6]"
          />
        </div>
      );

    default:
      return null;
  }
};

// Search Results Component
export const SearchResults = ({
  results = [],
  loading = false,
  error = null,
  query = '',
  totalCount = 0,
  hasMore = false,
  onLoadMore,
  renderItem,
  emptyState,
  className = ''
}) => {
  if (loading && results.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-[#14B8A6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center text-red-600">
          <p className="font-medium">Search Error</p>
          <p className="text-sm mt-1">{error.message || 'An error occurred while searching'}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    if (emptyState) {
      return <div className={className}>{emptyState}</div>;
    }

    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center text-gray-600">
          {query ? (
            <>
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
            </>
          ) : (
            <>
              <p className="font-medium">Start searching</p>
              <p className="text-sm mt-1">Enter a search term to find results</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {query && totalCount > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {totalCount === 1 ? '1 result' : `${totalCount.toLocaleString()} results`}
          {query && ` for "${query}"`}
        </div>
      )}

      <div className="space-y-4">
        {results.map((item, index) => (
          <div key={item.id || index}>
            {renderItem ? renderItem(item, index) : (
              <DefaultResultItem item={item} query={query} />
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <ResponsiveButton
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </ResponsiveButton>
        </div>
      )}
    </div>
  );
};

// Default Search Result Item
const DefaultResultItem = ({ item, query }) => {
  const title = item.title || item.name || item.email || 'Untitled';
  const description = item.description || item.content || '';
  const type = item._type || 'item';

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {query ? (
              <span dangerouslySetInnerHTML={{
                __html: highlightText(title, query)
              }} />
            ) : title}
          </h3>
          
          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {query ? (
                <span dangerouslySetInnerHTML={{
                  __html: highlightText(description, query)
                }} />
              ) : description}
            </p>
          )}
          
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span className="capitalize">{type}</span>
            {item.updated_at && (
              <>
                <span className="mx-1">•</span>
                <span>{new Date(item.updated_at).toLocaleDateString()}</span>
              </>
            )}
            {item._searchScore && (
              <>
                <span className="mx-1">•</span>
                <span>Relevance: {Math.round(item._searchScore)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Search Component (for global search)
export const QuickSearch = ({
  onResultSelect,
  placeholder = 'Quick search...',
  dataSources = {},
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Mock search results (replace with actual search hook)
  const searchResults = query.length > 2 ? [
    { id: 1, title: 'Sample Result', type: 'ticket', description: 'This is a sample search result' }
  ] : [];

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onClear={() => setQuery('')}
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {query.length < 3 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Type at least 3 characters to search
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              >
                <div className="font-medium text-sm text-gray-900">{result.title}</div>
                <div className="text-xs text-gray-500 capitalize">{result.type}</div>
                {result.description && (
                  <div className="text-xs text-gray-600 mt-1 truncate">{result.description}</div>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Utility function to highlight text
const highlightText = (text, query) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export default {
  SearchInput,
  SearchBar,
  SearchResults,
  QuickSearch
};