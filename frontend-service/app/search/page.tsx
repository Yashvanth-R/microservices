'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { searchService } from '@/lib/services/searchService';
import { Search, FileText, User, Bell, AlertCircle } from 'lucide-react';
import type { SearchResult } from '@/lib/services';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('all');
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = searchType === 'all' 
        ? await searchService.search(query)
        : await searchService.search(query, searchType);
      
      setResults(response.results);
      setTotalResults(response.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed. Please try again.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <FileText size={20} className="text-blue-600" />;
      case 'user':
        return <User size={20} className="text-green-600" />;
      case 'notification':
        return <Bell size={20} className="text-yellow-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'notification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Search</h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, users, notifications..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="user">Users</option>
                <option value="notification">Notifications</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Search Results */}
        {(results.length > 0 || (query && !loading)) && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
              {totalResults > 0 && (
                <span className="text-gray-600">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <Search size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {query ? `No results found for "${query}"` : 'Enter a search query to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result._id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Score: {result.score.toFixed(2)}</span>
                        <span>Created: {new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!query && (
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Search Tips</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Use specific keywords to find relevant content</li>
              <li>• Filter by type to narrow down results</li>
              <li>• Search results are ranked by relevance</li>
              <li>• Try different search terms if you don't find what you're looking for</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}