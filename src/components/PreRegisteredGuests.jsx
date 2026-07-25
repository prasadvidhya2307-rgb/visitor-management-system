import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, Trash2, Edit2, X } from 'lucide-react';
import store from '../store';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function PreRegisteredGuests() {
  const [guests, setGuests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', employeeId: '', purpose: '', validFrom: new Date().toISOString().slice(0, 10), validTo: '', recurring: false, frequency: 'weekly' });

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setGuests(store.getPreRegistered());
    setEmployees(store.getEmployees());
  }

  function openAdd() {
    setEditId(null);
    setForm({ name: '', company: '', email: '', phone: '', employeeId: '', purpose: '', validFrom: new Date().toISOString().slice(0, 10), validTo: '', recurring: false, frequency: 'weekly' });
    setShowModal(true);
  }

  function openEdit(g) {
    setEditId(g.id);
    setForm({ name: g.name, company: g.company, email: g.email, phone: g.phone, employeeId: g.employeeId, purpose: g.purpose, validFrom: g.validFrom, validTo: g.validTo, recurring: g.recurring, frequency: g.frequency });
    setShowModal(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editId) store.updatePreRegistered(editId, form);
    else store.addPreRegistered(form);
    setShowModal(false);
    refresh();
  }

  function handleDelete(id) { store.deletePreRegistered(id); refresh(); }

  function handleRevoke(id) { store.updatePreRegistered(id, { status: 'revoked' }); refresh(); }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{guests.length} pre-registered guest{guests.length !== 1 ? 's' : ''}</p>
        <button className="btn-p" onClick={openAdd}><Plus size={16} /> Add Guest</button>
      </div>

      {guests.length === 0 ? (
        <div className="card"><div className="card-b empty">
          <ClipboardCheck size={48} style={{ opacity: 0.3 }} />
          <h3>No Pre-Registered Guests</h3>
          <p>Pre-register recurring visitors for faster check-in.</p>
          <button className="btn-p" style={{ marginTop: 12 }} onClick={openAdd}>Add Guest</button>
        </div></div>
      ) : (
        <div className="card">
          <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Guest</th><th>Company</th><th>Host</th><th>Purpose</th><th>Valid</th><th>Frequency</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(g => {
                  const emp = employees.find(e => e.id === g.employeeId);
                  return (
                    <tr key={g.id}>
                      <td>
                        <div className="vis-row">
                          <div className="vis-av">{g.name?.charAt(0)}</div>
                          <div className="vis-info"><h4>{g.name}</h4><p>{g.email}</p></div>
                        </div>
                      </td>
                      <td>{g.company}</td>
                      <td>{emp?.name || 'N/A'}</td>
                      <td>{g.purpose}</td>
                      <td style={{ fontSize: 12 }}>{g.validFrom} to {g.validTo}</td>
                      <td>{g.recurring ? g.frequency : 'One-time'}</td>
                      <td><span className={`badge ${g.status === 'active' ? 'active' : 'cancelled'}`}>{g.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-o btn-sm" onClick={() => openEdit(g)}><Edit2 size={14} /></button>
                          {g.status === 'active' && <button className="btn-o btn-sm" onClick={() => handleRevoke(g.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Revoke</button>}
                          <button className="btn-o btn-sm" onClick={() => handleDelete(g.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-h"><h3>{editId ? 'Edit Guest' : 'Add Pre-Registered Guest'}</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-b">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Name *</label><input className="form-i" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Company</label><input className="form-i" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Email</label><input className="form-i" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Phone</label><input className="form-i" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                    <div className="form-g"><label className="form-l">Purpose</label><input className="form-i" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Valid From *</label><input className="form-i" type="date" required value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} /></div>
                    <div className="form-g"><label className="form-l">Valid To *</label><input className="form-i" type="date" required value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Recurring</label><select className="form-s" value={form.recurring ? 'yes' : 'no'} onChange={e => setForm({ ...form, recurring: e.target.value === 'yes' })}><option value="no">No</option><option value="yes">Yes</option></select></div>
                    {form.recurring && <div className="form-g"><label className="form-l">Frequency</label><select className="form-s" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>{FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}</select></div>}
                  </div>
                </div>
                <div className="modal-f">
                  <button type="button" className="btn-o" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-p">{editId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
