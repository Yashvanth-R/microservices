import apiClient from '../apiClient';

export interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  async getUserTasks(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/users/${userId}/tasks`);
    return response.data;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; user: User; message: string }> {
    const response = await apiClient.put(`/api/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/users/${userId}`);
    return response.data;
  },
};