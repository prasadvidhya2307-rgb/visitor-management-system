import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const healthCheck = () => api.get('/health');

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentActivity = () => api.get('/dashboard/recent-activity');
export const getTodayVisitors = () => api.get('/dashboard/today-visitors');

export const captureFace = (image) => api.post('/visitors/capture-face', { image });
export const checkInVisitor = (data) => api.post('/visitors/check-in', data);
export const checkOutVisitor = (image) => api.post('/visitors/check-out', { image });

export const getVisitorHistory = (search, page, perPage) =>
  api.get('/visitors/history', { params: { search, page, per_page: perPage } });
export const getVisitorProfile = (id) => api.get(`/visitors/profile/${id}`);
export const exportHistory = (format) =>
  api.get('/visitors/export', { params: { format }, responseType: 'blob' });

export const getEmployees = (search) => api.get('/employees', { params: { search } });
export const getEmployeeList = () => api.get('/employees/list');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export default api;
