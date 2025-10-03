import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status || 0;
    const data = error?.response?.data || {};
    const message = data?.message || error?.message || 'Unknown error';

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.data = data;
    return Promise.reject(normalizedError);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  changePassword: (passwordData) => API.put('/auth/change-password', passwordData),
  verifyToken: () => API.post('/auth/verify-token'),
};

// Task API calls
export const taskAPI = {
  getTasks: (params = {}) => API.get('/tasks', { params }),
  getTask: (id) => API.get(`/tasks/${id}`),
  createTask: (taskData) => API.post('/tasks', taskData),
  updateTask: (id, taskData) => API.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
  getStats: () => API.get('/tasks/stats/overview'),
};

// Health check
export const healthCheck = () => API.get('/health');

export default API;


