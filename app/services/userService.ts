import { api, apiCall } from './api';
import { User } from './types';

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiCall(api.users.all);
  return response.json();
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await apiCall(api.users.getById(id));
  return response.json();
};

// Update user role
export const updateUserRole = async (id: string, role: 'user' | 'admin'): Promise<User> => {
  const response = await apiCall(api.users.updateRole(id), {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  return response.json();
};

// Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiCall(api.users.delete(id), {
    method: 'DELETE',
  });
  return response.json();
};
