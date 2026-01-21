'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { taskService } from '@/lib/services/taskService';
import { useStore } from '@/lib/store';

export default function DashboardPage() {
  const { user, tasks, setTasks } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tasks]);

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

  const calculateStats = () => {
    setStats({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    });
  };

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back {user?.name || user?.email}!
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? "Admin Dashboard - You can see and manage all tasks across the system" 
                : "Your personal task overview - You can only see tasks assigned to you"
              }
            </p>
          </div>
          {user?.role === 'admin' && (
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
              🛡️ Administrator
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Tasks" value={stats.total} color="bg-blue-600" />
              <StatCard label="Pending" value={stats.pending} color="bg-yellow-600" />
              <StatCard label="In Progress" value={stats.inProgress} color="bg-purple-600" />
              <StatCard label="Completed" value={stats.completed} color="bg-green-600" />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks yet. Create one to get started!</p>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
