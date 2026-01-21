import apiClient from '../apiClient';

export interface ScheduledTask {
  id: string;
  taskId: string;
  cronExpression: string;
  action: string;
  createdAt: string;
}

export interface ScheduleTaskData {
  taskId: string;
  cronExpression: string;
  action: string;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  taskId: string;
}

export const schedulerService = {
  async scheduleTask(data: ScheduleTaskData): Promise<ScheduleResponse> {
    const response = await apiClient.post('/api/scheduler/schedule', data);
    return response.data;
  },

  async getScheduledTasks(): Promise<ScheduledTask[]> {
    const response = await apiClient.get('/api/scheduler/tasks');
    return response.data;
  },

  async deleteScheduledTask(taskId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/scheduler/tasks/${taskId}`);
    return response.data;
  },

  async getSchedulerHealth(): Promise<{ status: string; service: string }> {
    const response = await apiClient.get('/api/scheduler/health');
    return response.data;
  },
};