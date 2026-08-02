import { request, dataURLtoBlob, getToken, setToken, onUnauthorized } from './client';

export { getToken, onUnauthorized };

// ==================== Auth ====================

export async function login(email, password) {
  const res = await request('/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.data.accessToken);
  return res.data;
}

export async function fetchMe() {
  const res = await request('/auth/me');
  return res.data;
}

export async function changePassword(oldPassword, newPassword) {
  const res = await request('/auth/change-password', { method: 'PUT', body: { oldPassword, newPassword } });
  return res.data;
}

// ==================== Employees ====================

export async function fetchEmployees() {
  const res = await request('/employee');
  return res.data.employees || [];
}

export async function fetchEmployee(id) {
  const res = await request(`/employee/${id}`);
  return res.data;
}

export async function createEmployee(payload) {
  const res = await request('/employee', { method: 'POST', body: payload });
  return res.data;
}

export async function updateEmployee(id, payload) {
  const res = await request(`/employee/${id}`, { method: 'PATCH', body: payload });
  return res.data;
}

export async function deleteEmployee(id) {
  const res = await request(`/employee/${id}`, { method: 'DELETE' });
  return res.data;
}

// ==================== Visitors ====================

export async function fetchVisitors() {
  const res = await request('/visitor');
  return res.data || [];
}

export async function fetchVisitor(id) {
  const res = await request(`/visitor/${id}`);
  return res.data.visitor || res.data;
}

export async function fetchDeletedVisitors() {
  const res = await request('/visitor/deleted');
  return res.data.deletedVisitor || [];
}

export async function updateVisitor(id, payload) {
  const res = await request(`/visitor/${id}`, { method: 'PUT', body: payload });
  return res.data;
}

export async function deleteVisitor(id) {
  const res = await request(`/visitor/${id}`, { method: 'DELETE' });
  return res.data;
}

// ==================== Visits ====================

export async function fetchVisits() {
  const res = await request('/visit');
  return res.data || [];
}

export async function updateVisit(id, payload) {
  const res = await request(`/visit/${id}`, { method: 'PATCH', body: payload });
  return res.data;
}

export async function fetchVisit(id) {
  const res = await request(`/visit/${id}`);
  return res.data;
}

export async function fetchVisitorVisits(visitorId) {
  const res = await request(`/visit/visitors/${visitorId}`);
  return res.data.visits || [];
}

export async function createVisit(visitorId, payload) {
  const res = await request(`/visit/visitors/${visitorId}`, { method: 'POST', body: payload });
  return res.data;
}

// ==================== Check-in ====================

export async function checkIn(visitorPayload, visitPayload, dataURL) {
  const formData = new FormData();
  formData.append('visitor', JSON.stringify(visitorPayload));
  formData.append('visit', JSON.stringify(visitPayload));
  formData.append('image', dataURLtoBlob(dataURL), 'photo.jpg');
  const res = await request('/check-in', { method: 'POST', formData });
  return res.data;
}

export async function checkInExisting(visitorId, visitPayload) {
  const res = await request(`/check-in/${visitorId}`, { method: 'POST', body: visitPayload });
  return res.data;
}

// ==================== Check-out ====================

export async function checkOut(dataURL) {
  const formData = new FormData();
  formData.append('image', dataURLtoBlob(dataURL), 'photo.jpg');
  const res = await request('/check-out', { method: 'POST', formData });
  return res.data;
}

// ==================== Face recognition ====================

export async function recognizeFace(dataURL) {
  const formData = new FormData();
  formData.append('image', dataURLtoBlob(dataURL), 'photo.jpg');
  const res = await request('/face/recognize', { method: 'POST', formData });
  return res.data;
}

// ==================== Pre-registrations ====================

export async function fetchPreRegistrations() {
  const res = await request('/pre-registrations');
  return res.data || [];
}

export async function fetchPreRegistration(id) {
  const res = await request(`/pre-registrations/${id}`);
  return res.data;
}

export async function createPreRegistration(payload) {
  const res = await request('/pre-registrations', { method: 'POST', body: payload });
  return res.data;
}

export async function updatePreRegistration(id, payload) {
  const res = await request(`/pre-registrations/${id}`, { method: 'PUT', body: payload });
  return res.data;
}

export async function cancelPreRegistration(id) {
  const res = await request(`/pre-registrations/${id}`, { method: 'DELETE' });
  return res.data;
}

// ==================== Dashboard ====================

export async function fetchDashboard() {
  const res = await request('/dashboard');
  return res.data.dashboard;
}
