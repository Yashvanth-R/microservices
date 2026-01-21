'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { userService, User } from '@/lib/services/userService';
import { useStore } from '@/lib/store';
import { Users, Shield, UserCheck, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setUpdatingRole(userId);
      const result = await userService.updateUserRole(userId, newRole);
      
      if (result.success) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        toast.success(result.message);
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.response?.data?.error || 'Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUser(userId);
      const result = await userService.deleteUser(userId);
      
      if (result.success) {
        setUsers(users.filter(user => user._id !== userId));
        toast.success(result.message);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-700">
              Only administrators can access the user management page.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
            <Shield size={20} />
            Admin Only
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Users ({users.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    const isCurrentUser = user._id === currentUser?.id;
                    
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.email}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user._id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <RoleIcon size={16} />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                              {user.role === 'admin' ? 'Administrator' : 'User'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {!isCurrentUser && (
                              <>
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'admin')}
                                  disabled={updatingRole === user._id}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                                
                                <button
                                  onClick={() => handleDeleteUser(user._id, user.email)}
                                  disabled={deletingUser === user._id}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50"
                                  title="Delete user"
                                >
                                  {deletingUser === user._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              </>
                            )}
                            
                            {isCurrentUser && (
                              <span className="text-gray-500 text-sm">Cannot modify own account</span>
                            )}
                            
                            {updatingRole === user._id && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Updating...</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}