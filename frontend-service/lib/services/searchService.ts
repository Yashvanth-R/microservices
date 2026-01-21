import apiClient from '../apiClient';

export interface SearchResult {
  _id: string;
  title: string;
  description: string;
  type: 'task' | 'user' | 'notification';
  score: number;
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export const searchService = {
  async search(query: string, type?: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.append('type', type);
    }
    
    const response = await apiClient.get(`/api/search?${params.toString()}`);
    return response.data;
  },

  async searchTasks(query: string): Promise<SearchResponse> {
    return this.search(query, 'task');
  },

  async searchUsers(query: string): Promise<SearchResponse> {
    return this.search(query, 'user');
  },

  async getSearchHealth(): Promise<{ status: string; service: string }> {
    const response = await apiClient.get('/api/search/health');
    return response.data;
  },
};