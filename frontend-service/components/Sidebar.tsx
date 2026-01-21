'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authService } from '@/lib/services/authService';
import { Menu, X, LayoutDashboard, CheckSquare, LogOut, Upload, Clock, Search, Users, Shield } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, isAuthenticated, setUser, setIsAuthenticated, setToken, user } = useStore();

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if backend call fails
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      router.push('/login');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside
        className={`w-64 bg-gray-900 text-white transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static h-screen flex flex-col z-40`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          {isAdmin && (
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-300">
              <Shield size={12} />
              <span>Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/tasks" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition">
            <CheckSquare size={20} />
            <span>Tasks</span>
          </Link>
          
          {isAdmin && (
            <Link href="/users" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition bg-purple-900/30 border border-purple-700/50">
              <Users size={20} />
              <span>User Management</span>
              <Shield size={14} className="ml-auto text-purple-300" />
            </Link>
          )}
          
          <Link href="/files" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition">
            <Upload size={20} />
            <span>Files</span>
          </Link>
          <Link href="/scheduler" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition">
            <Clock size={20} />
            <span>Scheduler</span>
          </Link>
          <Link href="/search" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition">
            <Search size={20} />
            <span>Search</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition w-full text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
