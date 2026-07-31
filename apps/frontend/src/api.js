// Set REACT_APP_API_URL when the frontend and API are hosted separately.
// In local development the Express API is available at this address.
// Local Docker deployment
const BASE_URL = 'http://localhost:5000/api/v1';

// Dev Tunnel
// const BASE_URL = 'https://vctcr7t3-3000.inc1.devtunnels.ms/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok || body?.success === false) {
    const message = typeof body === 'string'
      ? body
      : body?.message || body?.messaage || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function normalizeVisitor(visitor) {
  if (!visitor || typeof visitor !== 'object') return visitor;
  const values = (items, key) => Array.isArray(items) ? items.map(item => typeof item === 'string' ? item : item?.[key]).filter(Boolean) : [];
  return { ...visitor, emails: values(visitor.emails, 'email'), mobiles: values(visitor.mobiles, 'mobile') };
}
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bytes = atob(parts[1]);
  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ab], { type: 'image/jpeg' });
}

export async function recognizeFace(dataURL) {
  const blob = dataURLtoBlob(dataURL);
  const formData = new FormData();
  formData.append('image', blob, 'photo.jpg');
  return request('/face/recognize', { method: 'POST', body: formData });
}

export async function existingVisitorCheckIn(visitorId, visitPayload) {
  return request(`/check-in/${visitorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitPayload),
  });
}

export async function newVisitorCheckIn(visitorPayload, visitPayload, dataURL) {
  const blob = dataURLtoBlob(dataURL);
  const formData = new FormData();
  formData.append('visitor', JSON.stringify(visitorPayload));
  formData.append('visit', JSON.stringify(visitPayload));
  formData.append('image', blob, 'photo.jpg');
  return request('/check-in', { method: 'POST', body: formData });
}

export async function getVisitor(visitorId) {
  const response = await request(`/visitor/${visitorId}`);
  return normalizeVisitor(response.data);
}

export async function getVisitors() {
  const response = await request('/visitor');
  return Array.isArray(response.data) ? response.data.map(normalizeVisitor) : [];
}

export async function updateVisitor(visitorId, visitor) {
  const response = await request(`/visitor/${visitorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitor),
  });
  return response.data;
}

export async function deleteVisitor(visitorId) {
  return request(`/visitor/${visitorId}`, { method: 'DELETE' });
}
export async function getEmployees() {
  const response = await request('/employee');
  return response.data?.employees || [];
}

export async function createEmployee(employee) {
  const response = await request('/employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  return response.data;
}

export async function updateEmployee(employeeId, employee) {
  const response = await request(`/employee/${employeeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  return response.data;
}

export async function deleteEmployee(employeeId) {
  return request(`/employee/${employeeId}`, { method: 'DELETE' });
}


export async function createVisit(visitorId, visit) {
  const response = await request(`/visit/visitors/${visitorId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  });
  return response.data;
}

export async function getVisits() {
  const response = await request('/visit');
  return response.data || [];
}

export async function getVisit(visitId) {
  const response = await request(`/visit/${visitId}`);
  return response.data;
}

export async function getVisitorVisits(visitorId) {
  const response = await request(`/visit/visitors/${visitorId}`);
  // The visitor-history endpoint wraps the array as { visits: [...] }.
  return Array.isArray(response.data) ? response.data : response.data?.visits || [];
}

export async function updateVisit(visitId, visit) {
  const response = await request(`/visit/${visitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  });
  return response.data;
}

export async function deleteVisit(visitId) {
  return request(`/visit/${visitId}`, { method: 'DELETE' });
}

export async function checkOut(dataURL) {
  const blob = dataURLtoBlob(dataURL);
  const formData = new FormData();
  formData.append('image', blob, 'checkout-photo.jpg');
  const response = await request('/check-out', { method: 'POST', body: formData });
  return response.data;
}

export const visitIsCheckedOut = (visit) => Boolean(visit?.checkOutAt) || visit?.status === 'CHECKED_OUT';

export async function getPreRegistrations() {
  const response = await request('/pre-registrations');
  return Array.isArray(response.data) ? response.data : response.data?.preRegistrations || [];
}

export async function createPreRegistration(preRegistration) {
  const response = await request('/pre-registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preRegistration) });
  return response.data;
}

export async function updatePreRegistration(id, preRegistration) {
  const response = await request(`/pre-registrations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preRegistration) });
  return response.data;
}

export async function cancelPreRegistration(id) {
  const response = await request(`/pre-registrations/${id}`, { method: 'DELETE' });
  return response.data;
}