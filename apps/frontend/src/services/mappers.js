const PURPOSE_TO_CODE = {
  'Technical Discussion': 'TECHNICAL_DISCUSSION',
  'Interview': 'INTERVIEW',
  'Business Meeting': 'BUSINESS_MEETING',
  'Contract Negotiation': 'CONTRACT_NEGOTIATION',
  'Design Review': 'DESIGN_REVIEW',
  'Training': 'TRAINING',
  'Audit': 'AUDIT',
  'Delivery': 'DELIVERY',
  'Maintenance': 'MAINTENANCE',
  'Other': 'OTHER',
};

const CODE_TO_PURPOSE = {};
Object.entries(PURPOSE_TO_CODE).forEach(([label, code]) => {
  CODE_TO_PURPOSE[code] = label;
});

const PURPOSE_CODES = Object.values(PURPOSE_TO_CODE);
const DEPT_CODES = ['ENGINEERING', 'HR', 'FINANCE', 'MARKETING', 'OPERATIONS', 'LEGAL', 'SALES', 'IT', 'ADMIN'];

export function purposeToCode(label) {
  if (PURPOSE_TO_CODE[label]) return PURPOSE_TO_CODE[label];
  const upper = String(label || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (PURPOSE_CODES.includes(upper)) return upper;
  return 'OTHER';
}

export function purposeLabel(code) {
  if (CODE_TO_PURPOSE[code]) return CODE_TO_PURPOSE[code];
  return String(code || '').replace(/_/g, ' ').replace(/\w\S*/g, (t) => t.charAt(0) + t.slice(1).toLowerCase());
}

export function deptToCode(label) {
  const l = String(label || '').trim().toUpperCase().replace(/\s+/g, '_');
  return DEPT_CODES.includes(l) ? l : 'ENGINEERING';
}

export function deptLabel(code) {
  const c = String(code || '').toUpperCase();
  if (c === 'HR' || c === 'IT') return c;
  if (c === 'ADMIN') return 'Admin';
  return c.replace(/_/g, ' ').replace(/\w\S*/g, (t) => t.charAt(0) + t.slice(1).toLowerCase());
}

export function identityToCode(label) {
  return String(label || 'other').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

export function identityLabel(code) {
  return String(code || 'other').toLowerCase();
}

export function fullName(first, last) {
  return [first, last].filter(Boolean).join(' ') || 'Unknown';
}

export function mapEmployee(e) {
  return {
    id: e.id,
    name: fullName(e.firstName, e.lastName),
    firstName: e.firstName || '',
    lastName: e.lastName || '',
    department: deptLabel(e.department),
    departmentCode: e.department,
    designation: e.designation || '',
    email: e.email,
    phone: e.mobile,
    mobile: e.mobile,
    createdAt: e.createdAt,
  };
}

export function mapVisitor(v) {
  return {
    id: v.id,
    visitorCode: v.visitorCode || '',
    name: fullName(v.firstName, v.lastName),
    firstName: v.firstName || '',
    lastName: v.lastName || '',
    email: (v.emails && v.emails.length && v.emails[0].email) || v.email || '',
    phone: (v.mobiles && v.mobiles.length && v.mobiles[0].mobile) || v.mobile || '',
    company: v.company || '',
    identityType: identityLabel(v.identityType),
    identityTypeCode: v.identityType,
    identityNumber: v.identityNumber || '',
    faceRegistered: !!v.faceRegistered,
    isActive: !!v.isActive,
    deleted: !!v.isDeleted,
    deletedAt: v.deletedAt || null,
    createdAt: v.createdAt,
  };
}

export function mapVisit(v, visitorsById = {}) {
  const vis = visitorsById[v.visitorId];
  const host = v.hostEmployee;
  return {
    id: v.id,
    visitorId: v.visitorId,
    employeeId: v.hostEmployeeId,
    hostEmployeeId: v.hostEmployeeId,
    purpose: purposeLabel(v.purpose),
    purposeCode: v.purpose,
    floor: v.floor,
    notes: v.notes || '',
    status: String(v.status || '').toLowerCase(),
    token: vis ? vis.visitorCode : '',
    checkInTime: v.checkInAt,
    checkOutTime: v.checkOutAt || null,
    badgePrinted: false,
    faceData: vis ? !!vis.faceRegistered : false,
    visitorName: vis ? vis.name : '',
    hostName: host ? fullName(host.firstName, host.lastName) : '',
  };
}

export function mapPreRegistration(p) {
  const host = p.hostEmployee;
  return {
    id: p.id,
    name: fullName(p.firstName, p.lastName),
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    company: p.company || '',
    email: p.email || '',
    phone: p.phone || '',
    employeeId: p.hostEmployeeId,
    hostEmployeeId: p.hostEmployeeId,
    purpose: purposeLabel(p.purpose),
    purposeCode: p.purpose,
    floor: p.floor,
    notes: p.notes || '',
    validFrom: String(p.validFrom || '').slice(0, 10),
    validTo: String(p.validTo || '').slice(0, 10),
    recurring: !!p.isRecurring,
    frequency: String(p.recurrenceType || 'none').toLowerCase(),
    status: preRegistrationStatusLabel(p.status),
    hostName: host ? fullName(host.firstName, host.lastName) : '',
  };
}

function preRegistrationStatusLabel(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'CHECKED_IN') return 'arrived';
  if (s === 'CANCELLED') return 'cancelled';
  if (s === 'EXPIRED') return 'expired';
  return 'active';
}

export function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    single: parts.length < 2,
  };
}

export function employeePayload(form) {
  return {
    firstName: (form.firstName || '').trim(),
    lastName: (form.lastName || '').trim(),
    department: deptToCode(form.department),
    designation: (form.designation || '').trim() || undefined,
    email: (form.email || '').trim(),
    mobile: (form.phone || '').trim(),
  };
}

export function preRegistrationPayload(form) {
  const { firstName, lastName, single } = splitName(form.name);
  if (single) throw new Error('Please enter both first and last name.');
  const purposeCode = purposeToCode(form.purpose);
  return {
    firstName,
    lastName,
    company: (form.company || '').trim() || undefined,
    email: (form.email || '').trim() || undefined,
    phone: (form.phone || '').trim() || undefined,
    hostEmployeeId: form.employeeId,
    purpose: purposeCode,
    floor: 1,
    notes: purposeCode === 'OTHER' ? (form.purpose || '').trim() : undefined,
    validFrom: form.validFrom,
    validTo: form.validTo,
    isRecurring: !!form.recurring,
    recurrenceType: form.recurring ? String(form.frequency || 'weekly').toUpperCase() : 'NONE',
  };
}

export function visitPayload(form) {
  return {
    hostEmployeeId: form.employeeId,
    purpose: purposeToCode(form.purpose),
    floor: Number(form.floor) || 0,
    notes: (form.notes || '').trim() || undefined,
  };
}

export function visitorPayload(visitorData, identityType) {
  return {
    firstName: (visitorData.firstName || '').trim(),
    lastName: (visitorData.lastName || '').trim(),
    identityType: identityToCode(identityType),
    identityNumber: (visitorData.identityNumber || '').trim(),
    emails: (visitorData.email || '').trim()
      ? [{ email: (visitorData.email || '').trim(), isPrimary: true }]
      : [],
    mobiles: [{ mobile: (visitorData.phone || '').trim(), isPrimary: true }],
  };
}
