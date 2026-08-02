import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, Search, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import store from '../store';

export default function DeletedVisitors() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setVisitors(store.getDeletedVisitors()); }, []);

  const filtered = visitors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search) ||
    v.company?.toLowerCase().includes(search.toLowerCase())
  );

  function handleRestore(id) {
    store.restoreVisitor(id);
    setVisitors(store.getDeletedVisitors());
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input className="form-i" style={{ paddingLeft: 36 }} placeholder="Search by name, email, phone, company..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{filtered.length} deleted visitor{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {visitors.length === 0 ? (
        <div className="card"><div className="card-b empty">
          <UserX size={48} style={{ opacity: 0.3 }} />
          <h3>No Deleted Visitors</h3>
          <p>Visitors that are removed will appear here.</p>
        </div></div>
      ) : (
        <div className="card">
          <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Visitor</th><th>Company</th><th>Email</th><th>Phone</th><th>ID Type</th><th>ID Number</th><th>Deleted At</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No visitors match "{search}"</td></tr>
                )}
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="vis-row">
                        <div className="vis-av" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{v.name?.charAt(0)}</div>
                        <div className="vis-info"><h4>{v.name}</h4></div>
                      </div>
                    </td>
                    <td>{v.company || '—'}</td>
                    <td style={{ fontSize: 12 }}>{v.email || '—'}</td>
                    <td style={{ fontSize: 12 }}>{v.phone || '—'}</td>
                    <td>{v.identityType?.replace('_', ' ').toUpperCase() || '—'}</td>
                    <td style={{ fontSize: 12 }}>{v.identityNumber || '—'}</td>
                    <td style={{ fontSize: 12 }}>{v.deletedAt ? new Date(v.deletedAt).toLocaleString() : '—'}</td>
                    <td>
                      <button className="btn-o btn-sm" onClick={() => handleRestore(v.id)} style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                        <RotateCcw size={14} /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
