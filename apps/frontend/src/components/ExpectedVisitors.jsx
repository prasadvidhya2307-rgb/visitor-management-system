import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { loadEmployees, loadPreRegistrations } from '../services/data';
import { cancelPreRegistration, createPreRegistration } from '../services/api';
import { purposeToCode, splitName } from '../services/mappers';
import { useToast } from './Toast';

export default function ExpectedVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitorName: '', company: '', email: '', phone: '', employeeId: '', purpose: '', expectedDate: new Date().toISOString().slice(0, 10), expectedTime: '' });
  const toast = useToast();

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    try { const [preRegistrations, employees] = await Promise.all([loadPreRegistrations(), loadEmployees()]);
      setVisitors(preRegistrations.filter((p) => p.status === 'active').map((p) => ({ ...p, visitorName: p.name, expectedDate: p.validFrom, expectedTime: '?', status: 'expected' }))); setEmployees(employees);
    } catch (err) { toast.error(err.message || 'Unable to load expected visitors.'); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, single } = splitName(form.visitorName);
    if (single) { toast.error('Please enter both a first and last name.'); return; }
    if (!form.employeeId || !form.purpose.trim()) { toast.error('Please select a host and enter the visit purpose.'); return; }
    try {
      const purpose = purposeToCode(form.purpose);
      await createPreRegistration({ firstName, lastName, company: form.company.trim() || undefined, email: form.email.trim() || undefined, phone: form.phone.trim() || undefined, hostEmployeeId: form.employeeId, purpose, floor: 1, notes: purpose === 'OTHER' ? form.purpose.trim() : undefined, validFrom: form.expectedDate, validTo: form.expectedDate, isRecurring: false, recurrenceType: 'NONE' });
      setShowModal(false); toast.success('Expected visitor added successfully.'); refresh();
    } catch (err) { toast.error(err.message || 'Unable to add the expected visitor.'); }
  }

  async function handleDelete(id) {
    try { await cancelPreRegistration(id); toast.success('Expected visitor cancelled successfully.'); refresh(); }
    catch (err) { toast.error(err.message || 'Unable to cancel the expected visitor.'); }
  }

  function handleArrived() { toast.error('Arrival status is recorded through check-in; the backend has no manual arrival endpoint.'); }

  const today = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter(v => v.expectedDate === today);
  const upcoming = visitors.filter(v => v.expectedDate > today);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{visitors.length} expected visitor{visitors.length !== 1 ? 's' : ''} total</p>
        <button className="btn-p" onClick={() => setShowModal(true)}><Plus size={16} /> Add Expected</button>
      </div>

      {todayVisitors.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-h"><h3>Today</h3></div>
          <div className="card-b">
            {todayVisitors.map(v => {
              const emp = employees.find(e => e.id === v.employeeId);
              return (
                <div key={v.id} className="act-item" style={{ alignItems: 'center' }}>
                  <div className="act-dot" style={{ background: v.status === 'arrived' ? 'var(--success)' : 'var(--warning)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.visitorName} <span style={{ fontWeight: 400, color: 'var(--text2)' }}>from {v.company}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Host: {emp?.name || 'N/A'} · {v.purpose} · {v.expectedTime}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {v.status !== 'arrived' && <button className="btn-s btn-sm" onClick={() => handleArrived(v.id)}><CheckCircle size={14} /> Arrived</button>}
                    <button className="btn-o btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-h"><h3>Upcoming</h3></div>
          <div className="card-b">
            {upcoming.map(v => {
              const emp = employees.find(e => e.id === v.employeeId);
              return (
                <div key={v.id} className="act-item" style={{ alignItems: 'center' }}>
                  <div className="act-dot" style={{ background: 'var(--info)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.visitorName} <span style={{ fontWeight: 400, color: 'var(--text2)' }}>from {v.company}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Host: {emp?.name || 'N/A'} · {v.purpose} · {v.expectedDate} at {v.expectedTime}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {v.status !== 'arrived' && <button className="btn-s btn-sm" onClick={() => handleArrived(v.id)}><CheckCircle size={14} /> Arrived</button>}
                    <button className="btn-o btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visitors.length === 0 && (
        <div className="card"><div className="card-b empty">
          <CalendarClock size={48} style={{ opacity: 0.3 }} />
          <h3>No Expected Visitors</h3>
          <p>Add expected visitors to track upcoming arrivals.</p>
          <button className="btn-p" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>Add Expected Visitor</button>
        </div></div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-h"><h3>Add Expected Visitor</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-b">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Name *</label><input className="form-i" required value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Company</label><input className="form-i" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Email</label><input className="form-i" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Phone</label><input className="form-i" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    <div className="form-g"><label className="form-l">Purpose</label><input className="form-i" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Date *</label><input className="form-i" type="date" required value={form.expectedDate} onChange={e => setForm({ ...form, expectedDate: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Time *</label><input className="form-i" type="time" required value={form.expectedTime} onChange={e => setForm({ ...form, expectedTime: e.target.value })} /></div>
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" className="btn-o" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-p">Add</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
