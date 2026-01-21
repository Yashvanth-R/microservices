import apiClient from '../apiClient';

export interface FileUploadResponse {
  success: boolean;
  fileName: string;
  originalName: string;
  url: string;
  fileId: string;
}

export interface FileRecord {
  _id: string;
  originalName: string;
  fileName: string;
  userId: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export const fileService = {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getUserFiles(): Promise<FileRecord[]> {
    const response = await apiClient.get('/api/files/files');
    return response.data;
  },

  async downloadFile(fileName: string): Promise<Blob> {
    const response = await apiClient.get(`/api/files/download/${fileName}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/files/files/${fileId}`);
    return response.data;
  },

  getFileUrl(fileName: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
    return `${baseUrl}/api/files/download/${fileName}`;
  },
};