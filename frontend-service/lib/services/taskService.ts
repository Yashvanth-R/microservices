import apiClient from '../apiClient';

export interface Task {
  _id: string;
  title: string;
  description: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  userId: string;
  status: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    const response = await apiClient.get('/api/tasks');
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskData): Promise<Task> {
    const response = await apiClient.post('/api/tasks', data);
    return response.data;
  },

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await apiClient.put(`/api/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  async getUserTasks(userId: string): Promise<Task[]> {
    const response = await apiClient.get(`/api/tasks?userId=${userId}`);
    return response.data;
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await apiClient.put(`/api/tasks/${taskId}/assign`, { userId });
    return response.data;
  },
};
