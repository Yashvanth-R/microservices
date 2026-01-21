import apiClient from '../apiClient';

export interface Notification {
  _id: string;
  userId: string;
  taskId: string;
  event: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const response = await apiClient.get(`/api/notifications/${userId}`);
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await apiClient.post(`/api/notifications/${userId}/mark-all-read`);
  },
};
