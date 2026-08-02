import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createEmployee, deleteEmployee, updateEmployee } from '../services/api';
import { employeePayload, mapEmployee, splitName } from '../services/mappers';
import { loadEmployees } from '../services/data';
import { useToast } from './Toast';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal', 'Sales', 'IT', 'Admin'];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', designation: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    try { setEmployees(await loadEmployees()); }
    catch (err) { toast.error(err.message || 'Unable to load employees.'); }
  }

  function openAdd() { setEditId(null); setForm({ name: '', email: '', phone: '', department: '', designation: '' }); setShowModal(true); }
  function openEdit(emp) { setEditId(emp.id); setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation }); setShowModal(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, single } = splitName(form.name);
    if (single) { toast.error('Please enter both first and last name.'); return; }
    setSaving(true);
    try {
      const payload = employeePayload({ ...form, firstName, lastName });
      if (editId) await updateEmployee(editId, payload); else await createEmployee(payload);
      toast.success(editId ? 'Employee updated successfully.' : 'Employee added successfully.');
      setShowModal(false); await refresh();
    } catch (err) { toast.error(err.message || 'Unable to save employee.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this employee?')) return;
    try { await deleteEmployee(id); toast.success('Employee deleted successfully.'); await refresh(); }
    catch (err) { toast.error(err.message || 'Unable to delete employee.'); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{employees.length} employee{employees.length !== 1 ? 's' : ''} registered</p>
        <button className="btn-p" onClick={openAdd}><Plus size={16} /> Add Employee</button>
      </div>

      <div className="card">
        <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Designation</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="vis-row">
                      <div className="vis-av" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>{emp.name?.charAt(0)}</div>
                      <div className="vis-info"><h4>{emp.name}</h4></div>
                    </div>
                  </td>
                  <td><span className="badge active">{emp.department}</span></td>
                  <td>{emp.designation}</td>
                  <td style={{ fontSize: 12 }}>{emp.email}</td>
                  <td style={{ fontSize: 12 }}>{emp.phone}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-o btn-sm" onClick={() => openEdit(emp)}><Edit2 size={14} /></button>
                      <button className="btn-o btn-sm" onClick={() => handleDelete(emp.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No employees found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-h"><h3>{editId ? 'Edit Employee' : 'Add Employee'}</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-b">
                  <div className="form-g"><label className="form-l">Full Name *</label><input className="form-i" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Department *</label><select className="form-s" required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div className="form-g"><label className="form-l">Designation</label><input className="form-i" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Email *</label><input className="form-i" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Phone *</label><input className="form-i" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" className="btn-o" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-p" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
