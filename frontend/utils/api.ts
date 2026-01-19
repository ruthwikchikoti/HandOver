import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ===========================================
// IMPORTANT: For physical device testing,
// replace this with your computer's IP address
// Find it by running: hostname -I (Linux) or ipconfig (Windows)
// ===========================================
const LOCAL_IP = '10.51.4.185'; // Your computer's IP address

// API URL based on platform
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Check if running on Expo Go (physical device)
  const isExpoGo = Constants.appOwnership === 'expo';

  if (Platform.OS === 'android') {
    // Physical device uses local IP, emulator uses 10.0.2.2
    return isExpoGo
      ? `http://${LOCAL_IP}:5000/api`
      : 'http://10.0.2.2:5000/api';
  }

  // iOS: simulator uses localhost, physical device uses local IP
  return isExpoGo
    ? `http://${LOCAL_IP}:5000/api`
    : 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // Debug log

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateActivity: () => api.post('/auth/activity'),
};

// Vault API
export const vaultAPI = {
  getAll: () => api.get('/vault'),
  getByCategory: (category: string) => api.get(`/vault/category/${category}`),
  getById: (id: string) => api.get(`/vault/${id}`),
  create: (data: { category: string; title: string; content: string }) =>
    api.post('/vault', data),
  update: (id: string, data: { title?: string; content?: string; category?: string }) =>
    api.put(`/vault/${id}`, data),
  delete: (id: string) => api.delete(`/vault/${id}`),
  getStats: () => api.get('/vault/stats/summary'),
};

// Dependents API
export const dependentsAPI = {
  getAll: () => api.get('/dependents'),
  getOwners: () => api.get('/dependents/owners'),
  add: (data: { email: string; permissions?: Record<string, boolean> }) =>
    api.post('/dependents', data),
  update: (id: string, data: { permissions: Record<string, boolean> }) =>
    api.put(`/dependents/${id}`, data),
  remove: (id: string) => api.delete(`/dependents/${id}`),
};

// Access API
export const accessAPI = {
  requestAccess: (data: { ownerId: string; reason: string }) =>
    api.post('/access/request', data),
  getMyRequests: () => api.get('/access/my-requests'),
  getPending: () => api.get('/access/pending'),
  getAll: () => api.get('/access/all'),
  approve: (id: string, adminNote?: string) =>
    api.post(`/access/${id}/approve`, { adminNote }),
  reject: (id: string, adminNote?: string) =>
    api.post(`/access/${id}/reject`, { adminNote }),
  viewVault: (ownerId: string) => api.get(`/access/vault/${ownerId}`),
  getLogs: () => api.get('/access/logs'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getStats: () => api.get('/users/stats'),
  updateSettings: (data: { inactivityDays?: number; name?: string }) =>
    api.put('/users/settings', data),
};

export default api;
