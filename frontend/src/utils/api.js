import axios from 'axios';

// Use environment variable if available, otherwise localhost for development
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Expense API
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByCategory: (category) => api.get(`/expenses/category/${category}`),
  getMonthlyBudget: (month) => api.get(`/expenses/budget/${month}`),
  setMonthlyBudget: (month, total) => api.put(`/expenses/budget/${month}`, { total })
};

// Task API
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getByUser: (userId) => api.get(`/tasks/user/${userId}`)
};

// Settlement API
export const settlementAPI = {
  getBalances: () => api.get('/settlements/balances'),
  getSuggestions: () => api.get('/settlements/suggestions'),
  create: (data) => api.post('/settlements', data),
  complete: (id) => api.put(`/settlements/${id}/complete`)
};

export default api;
