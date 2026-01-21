'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { schedulerService, taskService } from '@/lib/services';
import { userService } from '@/lib/services/userService';
import { Clock, Plus, Trash2, AlertCircle, User } from 'lucide-react';
import type { ScheduledTask, Task } from '@/lib/services';

interface User {
  _id: string;
  email: string;
  role: string;
}

export default function SchedulerPage() {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [cronExpression, setCronExpression] = useState('');
  const [action, setAction] = useState('execute');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduledData, tasksData, usersData] = await Promise.all([
        schedulerService.getScheduledTasks(),
        taskService.getAll(),
        userService.getAll()
      ]);
      setScheduledTasks(scheduledData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err: any) {
      setError('Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTaskId || !cronExpression || !action) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await schedulerService.scheduleTask({
        taskId: selectedTaskId,
        cronExpression,
        action
      });

      if (response.success) {
        setSuccess('Task scheduled successfully!');
        setShowForm(false);
        setSelectedTaskId('');
        setCronExpression('');
        setAction('execute');
        fetchData(); // Refresh the list
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule task');
    }
  };

  const handleDeleteScheduledTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled task?')) {
      return;
    }

    try {
      await schedulerService.deleteScheduledTask(taskId);
      setSuccess('Scheduled task deleted successfully!');
      fetchData(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete scheduled task');
    }
  };

  const cronExamples = [
    { expression: '0 9 * * 1', description: 'Every Monday at 9:00 AM' },
    { expression: '0 0 * * *', description: 'Daily at midnight' },
    { expression: '0 */6 * * *', description: 'Every 6 hours' },
    { expression: '0 0 1 * *', description: 'First day of every month' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading scheduler data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Task Scheduler</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={20} />
            Schedule Task
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Schedule Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule New Task</h2>
            
            <form onSubmit={handleScheduleTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a task...</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cron Expression
                </label>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 9 * * 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Examples:</p>
                  {cronExamples.map((example, index) => (
                    <div key={index} className="flex justify-between">
                      <code className="bg-gray-100 px-1 rounded">{example.expression}</code>
                      <span>{example.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="execute">Execute</option>
                  <option value="notify">Notify</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Schedule Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scheduled Tasks List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduled Tasks</h2>
          
          {scheduledTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scheduled tasks yet</p>
          ) : (
            <div className="space-y-4">
              {scheduledTasks.map((scheduledTask) => {
                const task = tasks.find(t => t._id === scheduledTask.taskId);
                const assignedUser = users.find(u => u._id === task?.userId);
                return (
                  <div key={scheduledTask.id} className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Clock size={20} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {task?.title || 'Unknown Task'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Assigned to: {assignedUser?.email || 'Unknown User'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Cron: <code className="bg-gray-100 px-1 rounded">{scheduledTask.cronExpression}</code>
                        </p>
                        <p className="text-sm text-gray-600">
                          Action: {scheduledTask.action} | Created: {new Date(scheduledTask.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteScheduledTask(scheduledTask.id)}
                      className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}