const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const AUTH_KEY = 'vms_auth';

export const PURPOSES = ['TECHNICAL_DISCUSSION', 'INTERVIEW', 'BUSINESS_MEETING', 'CONTRACT_NEGOTIATION', 'DESIGN_REVIEW', 'TRAINING', 'AUDIT', 'DELIVERY', 'MAINTENANCE', 'OTHER'];
export const DEPARTMENTS = ['ENGINEERING', 'HR', 'FINANCE', 'MARKETING', 'OPERATIONS', 'LEGAL', 'SALES', 'IT', 'ADMIN'];

function dataURLtoBlob(dataURL) {
  const [header, content] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(content);
  return new Blob([Uint8Array.from(bytes, char => char.charCodeAt(0))], { type: mime });
}

export function getSession() { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } }
export function setSession(session) { localStorage.setItem(AUTH_KEY, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(AUTH_KEY); }
export function notify(message, type = 'success') { window.dispatchEvent(new CustomEvent('vms-toast', { detail: { message, type } })); }

async function request(path, { method = 'GET', body, formData = false } = {}) {
  const token = getSession()?.token;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body && !formData) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? (formData ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  }
  let payload;
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok || payload.success === false) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data;
}

const nameOf = item => [item?.firstName, item?.lastName].filter(Boolean).join(' ');
export const presentEmployee = employee => ({ ...employee, name: nameOf(employee), phone: employee.mobile, department: employee.department?.replace(/_/g, ' ') });
export const presentVisitor = visitor => ({ ...visitor, name: nameOf(visitor), email: Array.isArray(visitor?.emails) ? (typeof visitor.emails[0] === 'string' ? visitor.emails[0] : visitor.emails[0]?.email) : '', phone: Array.isArray(visitor?.mobiles) ? (typeof visitor.mobiles[0] === 'string' ? visitor.mobiles[0] : visitor.mobiles[0]?.mobile) : '', photo: visitor?.registrationImage?.filePath || null });
export const presentVisit = visit => ({ ...visit, visitorId: visit.visitorId, employeeId: visit.hostEmployeeId, checkInTime: visit.checkInAt, checkOutTime: visit.checkOutAt, token: visit.id.slice(0, 8).toUpperCase(), status: visit.checkOutAt ? 'checked_out' : 'checked_in', purpose: visit.purpose?.replace(/_/g, ' '), host: visit.hostEmployee ? presentEmployee(visit.hostEmployee) : null });
export const presentPreRegistration = item => ({ ...item, name: nameOf(item), employeeId: item.hostEmployeeId, employee: item.hostEmployee ? presentEmployee(item.hostEmployee) : null, phone: item.phone || '', recurring: item.isRecurring, frequency: item.recurrenceType?.toLowerCase(), validFrom: String(item.validFrom).slice(0, 10), validTo: String(item.validTo).slice(0, 10), purpose: item.purpose?.replace(/_/g, ' '), status: item.status?.toLowerCase() });

export async function login(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } });
  const session = { token: data.accessToken, id: data.admin.id, email: data.admin.email, name: data.admin.email.split('@')[0], role: 'Administrator' };
  setSession(session); return session;
}
export const getMe = () => request('/auth/me');
export const changePassword = (oldPassword, newPassword) => request('/auth/change-password', { method: 'PUT', body: { oldPassword, newPassword } });
export const getEmployees = async () => (await request('/employee')).employees.map(presentEmployee);
export const createEmployee = async form => presentEmployee(await request('/employee', { method: 'POST', body: employeePayload(form) }));
export const updateEmployee = async (id, form) => presentEmployee(await request(`/employee/${id}`, { method: 'PATCH', body: employeePayload(form) }));
export const deleteEmployee = id => request(`/employee/${id}`, { method: 'DELETE' });
function employeePayload(form) { const [firstName, ...rest] = form.name.trim().split(/\s+/); return { firstName, lastName: rest.join(' ') || '-', department: form.department.toUpperCase().replace(/\s+/g, '_'), designation: form.designation || undefined, email: form.email, mobile: form.phone }; }
export const getVisitors = async () => (await request('/visitor')).map(presentVisitor);
export const getVisitor = async id => presentVisitor((await request(`/visitor/${id}`)).visitor);
export const getDeletedVisitors = async () => ((await request('/visitor/deleted')).deletedVisitor || []).map(presentVisitor);
export const deleteVisitor = id => request(`/visitor/${id}`, { method: 'DELETE' });
export const getVisits = async () => (await request('/visit')).map(presentVisit);
export const getVisitorVisits = async id => ((await request(`/visit/visitors/${id}`)).visits || []).map(presentVisit);
export const getPreRegistrations = async () => (await request('/pre-registrations')).map(presentPreRegistration);
export const createPreRegistration = async form => presentPreRegistration(await request('/pre-registrations', { method: 'POST', body: preRegistrationPayload(form) }));
export const updatePreRegistration = async (id, form) => presentPreRegistration(await request(`/pre-registrations/${id}`, { method: 'PUT', body: preRegistrationPayload(form) }));
export const cancelPreRegistration = id => request(`/pre-registrations/${id}`, { method: 'DELETE' });
function preRegistrationPayload(form) { const [firstName, ...rest] = form.name.trim().split(/\s+/); return { firstName, lastName: rest.join(' ') || '-', company: form.company || undefined, email: form.email || undefined, phone: form.phone || undefined, hostEmployeeId: form.employeeId, purpose: form.purpose.toUpperCase().replace(/\s+/g, '_'), floor: 0, validFrom: form.validFrom, validTo: form.validTo, isRecurring: Boolean(form.recurring), recurrenceType: form.recurring ? form.frequency.toUpperCase() : 'NONE' }; }
export const getDashboard = () => request('/dashboard');
export async function recognizeFace(dataURL) { const form = new FormData(); form.append('image', dataURLtoBlob(dataURL), 'photo.jpg'); return request('/face/recognize', { method: 'POST', body: form, formData: true }); }
export async function existingVisitorCheckIn(visitorId, visitPayload) { return request(`/check-in/${visitorId}`, { method: 'POST', body: visitPayload }); }
export async function checkIn(visitorPayload, visitPayload, dataURL) { const form = new FormData(); form.append('visitor', JSON.stringify(visitorPayload)); form.append('visit', JSON.stringify(visitPayload)); form.append('image', dataURLtoBlob(dataURL), 'photo.jpg'); return request('/check-in', { method: 'POST', body: form, formData: true }); }
export async function checkOut(dataURL) { const form = new FormData(); form.append('image', dataURLtoBlob(dataURL), 'photo.jpg'); return request('/check-out', { method: 'POST', body: form, formData: true }); }
