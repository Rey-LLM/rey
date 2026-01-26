import api from './api';

// Аутентификация
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Проекты
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, userId, role) =>
    api.post(`/projects/${projectId}/members`, { userId, role }),
  getStats: (id) => api.get(`/projects/${id}/stats`)
};

// Задачи
export const taskService = {
  getAll: (filters) => api.get('/tasks', { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// Пользователи
export const userService = {
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  getAll: (filters) => api.get('/users', { params: filters }),
  updateProfile: (data) => api.put('/users/me', data),
  updatePreferences: (preferences) => api.put('/users/me/preferences', preferences),
  getActivity: (userId) => api.get(`/users/${userId}/activity`)
};
