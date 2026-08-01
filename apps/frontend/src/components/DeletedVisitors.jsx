import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX } from 'lucide-react';
import { getDeletedVisitors } from '../api';

const fullName = visitor => [visitor?.firstName, visitor?.lastName].filter(Boolean).join(' ') || 'Unnamed visitor';
const dash = value => value || '—';

export default function DeletedVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeletedVisitors()
      .then(setVisitors)
      .catch(requestError => setError(requestError.message || 'Unable to load deleted visitors.'))
      .finally(() => setLoading(false));
  }, []);

  const query = search.toLowerCase();
  const filtered = visitors.filter(visitor =>
    [fullName(visitor), ...(visitor.emails || []), ...(visitor.mobiles || []), visitor.identityNumber]
      .some(value => String(value || '').toLowerCase().includes(query))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
          <input className="form-i" style={{ paddingLeft: 36 }} placeholder="Search by name, email, phone, or ID..." value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{filtered.length} deleted visitor{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {error && <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)' }}>{error}</div>}

      {loading ? (
        <div className="card"><div className="card-b empty"><p>Loading deleted visitors...</p></div></div>
      ) : visitors.length === 0 ? (
        <div className="card"><div className="card-b empty">
          <UserX size={48} style={{ opacity: 0.3 }} />
          <h3>No Deleted Visitors</h3>
          <p>Visitors that are removed will appear here.</p>
        </div></div>
      ) : (
        <div className="card">
          <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Visitor</th><th>Email</th><th>Phone</th><th>ID Type</th><th>ID Number</th><th>Deleted At</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No visitors match "{search}"</td></tr>}
                {filtered.map(visitor => (
                  <tr key={visitor.id}>
                    <td><div className="vis-row"><div className="vis-av" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{visitor.firstName?.charAt(0)}</div><div className="vis-info"><h4>{fullName(visitor)}</h4></div></div></td>
                    <td style={{ fontSize: 12 }}>{dash(visitor.emails?.join(', '))}</td>
                    <td style={{ fontSize: 12 }}>{dash(visitor.mobiles?.join(', '))}</td>
                    <td>{dash(visitor.identityType?.replace(/_/g, ' '))}</td>
                    <td style={{ fontSize: 12 }}>{dash(visitor.identityNumber)}</td>
                    <td style={{ fontSize: 12 }}>{visitor.deletedAt ? new Date(visitor.deletedAt).toLocaleString() : '—'}</td>
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