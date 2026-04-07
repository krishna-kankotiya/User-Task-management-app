const API_BASE_URL = '/api';

export const api = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },
  users: {
    all: `${API_BASE_URL}/users/all`,
    getById: (id: string) => `${API_BASE_URL}/users/${id}`,
    updateRole: (id: string) => `${API_BASE_URL}/users/${id}/role`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  tasks: {
    all: `${API_BASE_URL}/tasks`,
    my: `${API_BASE_URL}/tasks/my`,
    getById: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    create: `${API_BASE_URL}/tasks`,
    update: (id: string) => `${API_BASE_URL}/tasks/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/tasks/${id}/status`,
    delete: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  },
};

export const getAuthHeader = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  return response;
};
