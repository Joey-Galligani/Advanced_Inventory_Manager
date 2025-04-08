import { useEffect, useState } from 'react';
import { Button, Dialog, Text, TextArea, Select } from "@radix-ui/themes";
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/adminService';
import { FaUserPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import './ManageUsers.css';
import Navbar from '../components/Navbar';  // Add this import


interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface UserFormData {
  username: string;
  email: string;
  role: string;
  password: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await getAllUsers();
      console.log('API Response:', response); // Debug log
  
      // Check if response data exists and is an array
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]); // Reset users on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingUser) {
        await updateUser(editingUser, formData);
      } else {
        await createUser(formData);
      }

      await fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(editingUser ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);

      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', role: 'user', password: '' });
    setEditingUser(null);
  };

  return (
    <>
      <Navbar />
      <div className="manage-users-container">
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <header className="header flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaUsers className="text-4xl" />
            <Text size="8" weight="bold">Manage Users</Text>
          </div>
          <Dialog.Trigger>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <FaUserPlus /> Add New User
            </Button>
          </Dialog.Trigger>
        </header>
          
        <Dialog.Content className="bg-zinc-900 rounded-lg p-6 shadow-xl border border-zinc-700 max-w-md w-full mx-auto">
        <Dialog.Title className="text-xl font-bold mb-6 text-orange-500">
          {editingUser ? 'Edit User' : 'Create New User'}
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Username</label>
            <TextArea 
              placeholder="Enter username" 
              value={formData.username} 
              onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
              required 
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <TextArea 
              placeholder="Enter email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <TextArea 
              placeholder="Enter password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Role</label>
            <Select.Root 
              value={formData.role} 
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <Select.Trigger className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-orange-500 transition-colors" />
              <Select.Content className="bg-zinc-800 border border-zinc-700 rounded-md text-white">
                <Select.Group>
                  <Select.Label className="px-3 py-2 text-sm text-zinc-400">Select Role</Select.Label>
                  <Select.Item value="user" className="px-3 py-2 hover:bg-zinc-700 cursor-pointer">User</Select.Item>
                  <Select.Item value="admin" className="px-3 py-2 hover:bg-zinc-700 cursor-pointer">Admin</Select.Item>
                  <Select.Item value="moderator" className="px-3 py-2 hover:bg-zinc-700 cursor-pointer">Moderator</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
            <Button
              type="button"
              variant="soft"
              onClick={() => { resetForm(); setIsModalOpen(false); }}
              className="hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant="solid"
              color="orange"
            >
              {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog.Content>

      </Dialog.Root>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-grid">
          {users.length === 0 ? (
            <div className="no-users">
              <Text>No users found</Text>
            </div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-header">
                  <Text size="6" weight="medium">{user.username}</Text>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="user-info">
                  <p className="email">{user.email}</p>
                  <p className="date">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="date">
                    Updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="user-actions">
                  <Button 
                    variant="soft"
                    onClick={() => {
                      setEditingUser(user._id);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        password: '' // Don't show password when editing
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button 
                    variant="soft" 
                    color="red"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <FaTrash /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default ManageUsers;