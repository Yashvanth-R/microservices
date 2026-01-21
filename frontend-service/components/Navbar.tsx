'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { notificationService } from '@/lib/services/notificationService';
import { Bell } from 'lucide-react';

export default function Navbar() {
  const { user, notifications, setNotifications, unreadCount, setUnreadCount } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      if (user?.id) {
        const data = await notificationService.getUserNotifications(user.id);
        setNotifications(data);
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name || user?.email || 'User'}!</h2>
        {user?.role && (
          <p className="text-sm text-gray-600">
            Role: <span className={`font-medium ${user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}>
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
      </div>
    </nav>
  );
}
