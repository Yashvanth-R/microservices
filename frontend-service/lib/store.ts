import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  userId: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

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

interface AppStore {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;

  // Tasks state
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Notifications state
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

export const useStore = create<AppStore>((set) => ({
  // Auth state
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  token: null,
  setToken: (token) => set({ token }),

  // Tasks state
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...task } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
    })),

  // Notifications state
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  // UI state
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
  error: null,
  setError: (error) => set({ error }),
  isSidebarOpen: true,
  setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
}));
