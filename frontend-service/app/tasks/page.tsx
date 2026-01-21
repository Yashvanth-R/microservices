'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { taskService, Task } from '@/lib/services/taskService';
import { userService } from '@/lib/services/userService';
import { useStore } from '@/lib/store';
import { Plus, Trash2, Edit2, User, Shield, AlertCircle } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  role: string;
}

export default function TasksPage() {
  const { tasks, setTasks, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending', assignedUserId: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string>('all');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask = await taskService.create({
        ...formData,
        userId: isAdmin ? (formData.assignedUserId || user?.id || '') : user?.id || '',
      });
      setTasks([newTask, ...tasks]);
      setFormData({ title: '', description: '', status: 'pending', assignedUserId: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = filterUserId === 'all' 
    ? tasks 
    : tasks.filter(task => task.userId === filterUserId);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
            {isAdmin && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <Shield size={16} />
                Admin View
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
                <select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value={user?.id || ''}>My Tasks</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              <p className="text-blue-800">
                <strong>User View:</strong> You can only see and manage tasks assigned to you. 
                Contact an admin to assign tasks to other users.
              </p>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select
                    value={formData.assignedUserId}
                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Assign to myself</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.email} ({u.role})
                      </option>
                    ))}
                  </select>
                  {loadingUsers && <p className="text-sm text-gray-500 mt-1">Loading users...</p>}
                </div>
              )}

              {!isAdmin && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> This task will be assigned to you. Only admins can assign tasks to other users.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filterUserId === 'all' ? 'No tasks yet. Create one to get started!' : 'No tasks found for the selected user.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const assignedUser = users.find(u => u._id === task.userId);
              const isOwnTask = task.userId === user?.id;
              const canEdit = isAdmin || isOwnTask;
              
              return (
                <div key={task._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <User size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Assigned to: {assignedUser?.email || 'Unknown User'}
                          {assignedUser?.role === 'admin' && (
                            <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                          {isOwnTask && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {canEdit && (
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                          <Edit2 size={18} />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {!canEdit && (
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          View Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
