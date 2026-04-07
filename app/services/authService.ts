import { api, apiCall } from './api';
import { User, AuthResponse, LoginData, RegisterData } from './types';

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiCall(api.auth.register, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const userData = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookie('token', userData.token);
  }
  return userData;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiCall(api.auth.login, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const userData = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookie('token', userData.token);
  }
  return userData;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};
