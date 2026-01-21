// Export all services from a single entry point
export { authService } from './authService';
export { taskService } from './taskService';
export { userService } from './userService';
export { notificationService } from './notificationService';
export { fileService } from './fileService';
export { schedulerService } from './schedulerService';
export { searchService } from './searchService';

// Export types
export type { User } from './userService';
export type { Task, CreateTaskData, UpdateTaskData } from './taskService';
export type { Notification } from './notificationService';
export type { FileUploadResponse } from './fileService';
export type { ScheduledTask, ScheduleTaskData, ScheduleResponse } from './schedulerService';
export type { SearchResult, SearchResponse } from './searchService';
export type { LoginCredentials, RegisterCredentials, AuthResponse } from './authService';