import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // initial hydration state

  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      if (!err.response) return { success: false, error: 'Network Error' };
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, error: msg };
    }
  },

  register: async (name, email, collegeName, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, collegeName, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      if (!err.response) return { success: false, error: 'Network Error' };
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  deleteAccount: async () => {
    try {
      await api.delete('/auth/profile');
      // On success, simply logout
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      return { success: false, error: msg };
    }
  }
}));

export default useAuthStore;
