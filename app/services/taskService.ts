import { api, apiCall } from './api';
import { Task, CreateTaskData, UpdateTaskData } from './types';

// Get all tasks (admin)
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await apiCall(api.tasks.all);
  return response.json();
};

// Get tasks assigned to current user
export const getMyTasks = async (): Promise<Task[]> => {
  const response = await apiCall(api.tasks.my);
  return response.json();
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await apiCall(api.tasks.getById(id));
  return response.json();
};

// Create new task (admin)
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await apiCall(api.tasks.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Update task (admin)
export const updateTask = async (id: string, data: UpdateTaskData): Promise<Task> => {
  const response = await apiCall(api.tasks.update(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Update task status
export const updateTaskStatus = async (
  id: string,
  status: 'pending' | 'in-progress' | 'completed'
): Promise<Task> => {
  const response = await apiCall(api.tasks.updateStatus(id), {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// Delete task (admin)
export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await apiCall(api.tasks.delete(id), {
    method: 'DELETE',
  });
  return response.json();
};
