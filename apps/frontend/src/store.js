const KEYS = {
  employees: 'vms_employees',
  visitors: 'vms_visitors',
  visits: 'vms_visits',
  expected: 'vms_expected',
  preRegistered: 'vms_pre_registered',
  activity: 'vms_activity',
  settings: 'vms_settings',
  deletedVisitors: 'vms_deleted_visitors',
};

function get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function set(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function genToken() { return 'TK-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

function addActivity(type, message, visitorName) {
  const acts = get(KEYS.activity);
  acts.unshift({ id: genId(), type, message, visitorName, timestamp: new Date().toISOString() });
  if (acts.length > 200) acts.length = 200;
  set(KEYS.activity, acts);
}

function getToday() { return new Date().toISOString().slice(0, 10); }

const defaultEmployees = [
  { id: 'c9d6d4d0-8c93-4f2c-9d16-6d2d8e5d7b11', name: 'Rahul Sharma', department: 'Engineering', email: 'rahul@corp.com', phone: '9876543210', designation: 'Tech Lead', createdAt: '2025-01-10T09:00:00Z' },
  { id: 'e2', name: 'Priya Patel', department: 'HR', email: 'priya@corp.com', phone: '9876543211', designation: 'HR Manager', createdAt: '2025-01-10T09:00:00Z' },
  { id: 'e3', name: 'Amit Kumar', department: 'Finance', email: 'amit@corp.com', phone: '9876543212', designation: 'Accountant', createdAt: '2025-01-10T09:00:00Z' },
  { id: 'e4', name: 'Sneha Reddy', department: 'Marketing', email: 'sneha@corp.com', phone: '9876543213', designation: 'Marketing Head', createdAt: '2025-01-10T09:00:00Z' },
  { id: 'e5', name: 'Vikram Singh', department: 'Operations', email: 'vikram@corp.com', phone: '9876543214', designation: 'Ops Manager', createdAt: '2025-01-10T09:00:00Z' },
];

const now = new Date();
function daysAgo(d, h = 10) { const t = new Date(now); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); return t.toISOString(); }
function hoursAgo(h) { const t = new Date(now); t.setHours(t.getHours() - h); return t.toISOString(); }

const defaultVisitors = [
  { id: 'v1', name: 'Arun Mehta', email: 'arun@techco.com', phone: '9123456789', company: 'TechCo', identityType: 'aadhaar', identityNumber: '1234-5678-9012', photo: null, createdAt: daysAgo(5) },
  { id: 'v2', name: 'Neha Gupta', email: 'neha@designhub.com', phone: '9123456790', company: 'DesignHub', identityType: 'pan', identityNumber: 'ABCPG1234D', photo: null, createdAt: daysAgo(3) },
  { id: 'v3', name: 'Ravi Verma', email: 'ravi@logistics.com', phone: '9123456791', company: 'SwiftLogistics', identityType: 'driving_license', identityNumber: 'DL-2023-12345', photo: null, createdAt: daysAgo(2) },
  { id: 'v4', name: 'Kavitha Nair', email: 'kavitha@finserv.com', phone: '9123456792', company: 'FinServ', identityType: 'passport', identityNumber: 'A1234567', photo: null, createdAt: daysAgo(1) },
  { id: 'v5', name: 'Deepak Joshi', email: 'deepak@mediapro.com', phone: '9123456793', company: 'MediaPro', identityType: 'aadhaar', identityNumber: '9876-5432-1098', photo: null, createdAt: hoursAgo(3) },
];

const defaultVisits = [
  { id: 'vs1', visitorId: 'v1', employeeId: 'c9d6d4d0-8c93-4f2c-9d16-6d2d8e5d7b11', purpose: 'Technical Discussion', status: 'checked_out', token: 'TK-A1B2', checkInTime: daysAgo(2, 9), checkOutTime: daysAgo(2, 11), badgePrinted: true, notes: 'API integration review' },
  { id: 'vs2', visitorId: 'v2', employeeId: 'e4', purpose: 'Design Review Meeting', status: 'checked_in', token: 'TK-C3D4', checkInTime: hoursAgo(2), checkOutTime: null, badgePrinted: true, notes: 'Brand refresh discussion' },
  { id: 'vs3', visitorId: 'v3', employeeId: 'e5', purpose: 'Contract Negotiation', status: 'checked_in', token: 'TK-E5F6', checkInTime: hoursAgo(1), checkOutTime: null, badgePrinted: true, notes: '' },
  { id: 'vs4', visitorId: 'v4', employeeId: 'e2', purpose: 'Audit Follow-up', status: 'checked_out', token: 'TK-G7H8', checkInTime: daysAgo(1, 14), checkOutTime: daysAgo(1, 16), badgePrinted: true, notes: 'Q4 audit' },
  { id: 'vs5', visitorId: 'v1', employeeId: 'e3', purpose: 'Invoice Review', status: 'checked_out', token: 'TK-I9J0', checkInTime: daysAgo(5, 10), checkOutTime: daysAgo(5, 12), badgePrinted: true, notes: '' },
  { id: 'vs6', visitorId: 'v5', employeeId: 'c9d6d4d0-8c93-4f2c-9d16-6d2d8e5d7b11', purpose: 'Demo Presentation', status: 'checked_in', token: 'TK-K1L2', checkInTime: hoursAgo(0.5), checkOutTime: null, badgePrinted: true, notes: 'New tool demo' },
];

const defaultExpected = [
  { id: 'x1', visitorName: 'Sanjay Mishra', company: 'CloudBase', employeeId: 'c9d6d4d0-8c93-4f2c-9d16-6d2d8e5d7b11', purpose: 'Architecture Review', expectedDate: getToday(), expectedTime: '14:00', phone: '9123456794', email: 'sanjay@cloudbase.com', status: 'expected' },
  { id: 'x2', visitorName: 'Meera Iyer', company: 'GreenEnergy', employeeId: 'e4', purpose: 'Partnership Discussion', expectedDate: getToday(), expectedTime: '16:00', phone: '9123456795', email: 'meera@green.com', status: 'expected' },
];

const defaultPreRegistered = [
  { id: 'p1', name: 'Arjun Reddy', company: 'FinEdge', email: 'arjun@finedge.com', phone: '9123456796', employeeId: 'e2', purpose: 'Compliance Training', validFrom: getToday(), validTo: '2026-08-25', recurring: true, frequency: 'weekly', status: 'active' },
];

const defaultSettings = {
  company: 'Acme Corp',
  maxVisitHours: 8,
  requirePhoto: false,
  autoCheckoutHours: 12,
  theme: 'light',
};

function initStore() {
  if (!localStorage.getItem(KEYS.employees)) set(KEYS.employees, defaultEmployees);
  if (!localStorage.getItem(KEYS.visitors)) set(KEYS.visitors, defaultVisitors);
  if (!localStorage.getItem(KEYS.visits)) set(KEYS.visits, defaultVisits);
  if (!localStorage.getItem(KEYS.expected)) set(KEYS.expected, defaultExpected);
  if (!localStorage.getItem(KEYS.preRegistered)) set(KEYS.preRegistered, defaultPreRegistered);
  if (!localStorage.getItem(KEYS.activity)) {
    const acts = [
      { id: genId(), type: 'check_in', message: 'Arun Mehta checked in for Technical Discussion', visitorName: 'Arun Mehta', timestamp: daysAgo(2, 9) },
      { id: genId(), type: 'check_out', message: 'Arun Mehta checked out after 2 hours', visitorName: 'Arun Mehta', timestamp: daysAgo(2, 11) },
      { id: genId(), type: 'check_in', message: 'Neha Gupta checked in for Design Review', visitorName: 'Neha Gupta', timestamp: hoursAgo(2) },
      { id: genId(), type: 'check_in', message: 'Ravi Verma checked in for Contract Negotiation', visitorName: 'Ravi Verma', timestamp: hoursAgo(1) },
      { id: genId(), type: 'pre_register', message: 'Arjun Reddy pre-registered by Priya Patel', visitorName: 'Arjun Reddy', timestamp: daysAgo(1, 8) },
      { id: genId(), type: 'expected', message: 'Sanjay Mishra expected at 14:00 today', visitorName: 'Sanjay Mishra', timestamp: daysAgo(0, 8) },
    ];
    set(KEYS.activity, acts);
  }
  if (!localStorage.getItem(KEYS.settings)) set(KEYS.settings, defaultSettings);
}

initStore();

const store = {
  reset() { Object.values(KEYS).forEach(k => localStorage.removeItem(k)); initStore(); },

  // Employees
  getEmployees: () => get(KEYS.employees),
  addEmployee: (emp) => {
    const all = get(KEYS.employees);
    const ne = { ...emp, id: genId(), createdAt: new Date().toISOString() };
    all.push(ne); set(KEYS.employees, all); return ne;
  },
  updateEmployee: (id, data) => {
    const all = get(KEYS.employees);
    const idx = all.findIndex(e => e.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...data }; set(KEYS.employees, all[idx]); return all[idx]; }
    return null;
  },
  deleteEmployee: (id) => {
    set(KEYS.employees, get(KEYS.employees).filter(e => e.id !== id));
  },

  // Visitors
  getVisitors: () => get(KEYS.visitors).filter(v => !v.deleted),
  getAllVisitors: () => get(KEYS.visitors),
  getVisitorById: (id) => get(KEYS.visitors).find(v => v.id === id),
  addVisitor: (vis) => {
    const all = get(KEYS.visitors);
    const nv = { ...vis, id: genId(), createdAt: new Date().toISOString() };
    all.push(nv); set(KEYS.visitors, all); return nv;
  },
  softDeleteVisitor: (id) => {
    const all = get(KEYS.visitors);
    const idx = all.findIndex(v => v.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], deleted: true, deletedAt: new Date().toISOString() };
      set(KEYS.visitors, all);
      addActivity('delete', `${all[idx].name} was removed from visitors`, all[idx].name);
      return all[idx];
    }
    return null;
  },
  restoreVisitor: (id) => {
    const all = get(KEYS.visitors);
    const idx = all.findIndex(v => v.id === id);
    if (idx >= 0) {
      const { deleted, deletedAt, ...rest } = all[idx];
      all[idx] = rest;
      set(KEYS.visitors, all);
      addActivity('restore', `${all[idx].name} was restored to visitors`, all[idx].name);
      return all[idx];
    }
    return null;
  },
  getDeletedVisitors: () => get(KEYS.visitors).filter(v => v.deleted),

  // Visits (Check-in/Check-out)
  getVisits: () => get(KEYS.visits),
  getVisitById: (id) => get(KEYS.visits).find(v => v.id === id),

  checkIn: ({ visitorId, employeeId, purpose, notes, badgePrinted, faceData, photo }) => {
    const visits = get(KEYS.visits);
    const nv = {
      id: genId(), visitorId, employeeId, purpose, notes,
      badgePrinted: badgePrinted || false,
      token: genToken(),
      status: 'checked_in',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      faceData: faceData || null,
      photo: photo || null,
    };
    visits.push(nv); set(KEYS.visits, visits);
    const vis = get(KEYS.visitors).find(v => v.id === visitorId);
    addActivity('check_in', `${vis?.name || 'Visitor'} checked in for ${purpose}`, vis?.name);
    return nv;
  },

  checkOut: (visitId) => {
    const visits = get(KEYS.visits);
    const idx = visits.findIndex(v => v.id === visitId);
    if (idx < 0) return null;
    visits[idx] = { ...visits[idx], status: 'checked_out', checkOutTime: new Date().toISOString() };
    set(KEYS.visits, visits);
    const vis = get(KEYS.visitors).find(v => v.id === visits[idx].visitorId);
    const dur = Math.round((new Date(visits[idx].checkOutTime) - new Date(visits[idx].checkInTime)) / 3600000 * 10) / 10;
    addActivity('check_out', `${vis?.name || 'Visitor'} checked out after ${dur} hours`, vis?.name);
    return visits[idx];
  },

  getVisitFaceData: (visitId) => {
    const visit = get(KEYS.visits).find(v => v.id === visitId);
    return visit ? { faceData: visit.faceData, photo: visit.photo } : null;
  },

  getActiveVisits: () => get(KEYS.visits).filter(v => v.status === 'checked_in'),
  getVisitHistory: () => get(KEYS.visits).filter(v => v.status === 'checked_out').sort((a, b) => new Date(b.checkOutTime) - new Date(a.checkOutTime)),
  getVisitorVisits: (visitorId) => get(KEYS.visits).filter(v => v.visitorId === visitorId),

  getStoredFaces: () => {
    const visits = get(KEYS.visits);
    const visitors = get(KEYS.visitors);
    const faces = [];
    const seen = new Set();
    visits.forEach(v => {
      if (v.faceData && !seen.has(v.visitorId)) {
        seen.add(v.visitorId);
        const visitor = visitors.find(vis => vis.id === v.visitorId && !vis.deleted);
        if (visitor) {
          faces.push({ visitorId: v.visitorId, visitor, faceData: v.faceData, photo: v.photo });
        }
      }
    });
    return faces;
  },

  // Expected Visitors
  getExpected: () => get(KEYS.expected),
  addExpected: (exp) => {
    const all = get(KEYS.expected);
    const ne = { ...exp, id: genId(), status: 'expected' };
    all.push(ne); set(KEYS.expected, all);
    addActivity('expected', `${exp.visitorName} expected on ${exp.expectedDate} at ${exp.expectedTime}`, exp.visitorName);
    return ne;
  },
  updateExpected: (id, data) => {
    const all = get(KEYS.expected);
    const idx = all.findIndex(e => e.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...data }; set(KEYS.expected, all); return all[idx]; }
    return null;
  },
  deleteExpected: (id) => { set(KEYS.expected, get(KEYS.expected).filter(e => e.id !== id)); },

  // Pre-registered Guests
  getPreRegistered: () => get(KEYS.preRegistered),
  addPreRegistered: (pr) => {
    const all = get(KEYS.preRegistered);
    const np = { ...pr, id: genId(), status: 'active' };
    all.push(np); set(KEYS.preRegistered, all);
    addActivity('pre_register', `${pr.name} pre-registered by ${get(KEYS.employees).find(e => e.id === pr.employeeId)?.name || 'Admin'}`, pr.name);
    return np;
  },
  updatePreRegistered: (id, data) => {
    const all = get(KEYS.preRegistered);
    const idx = all.findIndex(p => p.id === id);
    if (idx >= 0) { all[idx] = { ...all[idx], ...data }; set(KEYS.preRegistered, all); return all[idx]; }
    return null;
  },
  deletePreRegistered: (id) => { set(KEYS.preRegistered, get(KEYS.preRegistered).filter(p => p.id !== id)); },

  // Activity
  getActivity: () => get(KEYS.activity),
  addCustomActivity: (type, message) => { addActivity(type, message, ''); },

  // Dashboard Stats
  getDashboardStats: () => {
    const visits = get(KEYS.visits);
    const today = getToday();
    const todayVisits = visits.filter(v => v.checkInTime?.startsWith(today));
    const active = visits.filter(v => v.status === 'checked_in');
    const totalVisitors = get(KEYS.visitors).length;
    const checkedOutToday = todayVisits.filter(v => v.status === 'checked_out').length;
    return {
      totalVisitors,
      activeVisitors: active.length,
      todayCheckIns: todayVisits.length,
      checkedOutToday,
      expectedToday: get(KEYS.expected).filter(e => e.expectedDate === today).length,
    };
  },

  getDailyStats: () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayVisits = get(KEYS.visits).filter(v => v.checkInTime?.startsWith(ds));
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: ds,
        checkIns: dayVisits.length,
        checkOuts: dayVisits.filter(v => v.status === 'checked_out').length,
      });
    }
    return days;
  },

  getMonthlyStats: () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ym = d.toISOString().slice(0, 7);
      const mVisits = get(KEYS.visits).filter(v => v.checkInTime?.startsWith(ym));
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        visitors: mVisits.length,
      });
    }
    return months;
  },

  getDepartmentStats: () => {
    const emps = get(KEYS.employees);
    const visits = get(KEYS.visits);
    const depts = {};
    emps.forEach(e => { depts[e.department] = 0; });
    visits.forEach(v => {
      const emp = emps.find(e => e.id === v.employeeId);
      if (emp && depts[emp.department] !== undefined) depts[emp.department]++;
    });
    return Object.entries(depts).map(([name, value]) => ({ name, value }));
  },

  // Settings
  getSettings: () => get(KEYS.settings) || defaultSettings,
  saveSetting: (key, val) => {
    const s = get(KEYS.settings); s[key] = val; set(KEYS.settings, s);
  },
  saveSettings: (data) => { set(KEYS.settings, data); },
};

export default store;
