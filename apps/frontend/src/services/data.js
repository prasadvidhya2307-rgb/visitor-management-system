import {
  fetchEmployees,
  fetchVisitors,
  fetchVisits,
  fetchDeletedVisitors,
  fetchPreRegistrations,
} from './api';
import {
  mapEmployee,
  mapVisitor,
  mapVisit,
  mapPreRegistration,
} from './mappers';

export async function loadEmployees() {
  const data = await fetchEmployees();
  return (data || []).map(mapEmployee);
}

export async function loadVisitors() {
  const data = await fetchVisitors();
  return (data || []).map(mapVisitor);
}

export async function loadVisits(visitors) {
  const [visitsData, vis] = visitors
    ? [await fetchVisits(), visitors]
    : await Promise.all([fetchVisits(), loadVisitors()]);
  const byId = {};
  vis.forEach((v) => { byId[v.id] = v; });
  return (visitsData || []).map((v) => mapVisit(v, byId));
}

export async function loadDeletedVisitors() {
  const data = await fetchDeletedVisitors();
  return (data || []).map(mapVisitor);
}

export async function loadPreRegistrations() {
  const data = await fetchPreRegistrations();
  return (data || []).map(mapPreRegistration);
}

export async function loadAll() {
  const [employees, visitors, visits] = await Promise.all([
    loadEmployees(),
    loadVisitors(),
    loadVisits(),
  ]);
  return { employees, visitors, visits };
}

export async function loadVisitData() {
  const [employees, visitors, visits] = await Promise.all([
    loadEmployees(),
    loadVisitors(),
    loadVisits(),
  ]);
  return { employees, visitors, visits };
}
