import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight, Download, Loader2, RefreshCw, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getVisitors } from '../api';

function visitorName(visitor) {
  return [visitor.firstName, visitor.lastName].filter(Boolean).join(' ') || 'Unnamed visitor';
}

function readable(value) {
  return value ? String(value).replace(/_/g, ' ') : '—';
}

export default function VisitorHistory() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadVisitors() {
    setLoading(true);
    setError('');
    try {
      const data = await getVisitors();
      setVisitors(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || 'We could not load visitor records. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVisitors(); }, []);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visitors;
    return visitors.filter(visitor => (
      visitorName(visitor).toLowerCase().includes(query) ||
      visitor.visitorCode?.toLowerCase().includes(query) ||
      visitor.identityNumber?.toLowerCase().includes(query)
    ));
  }, [visitors, search]);

  function exportCSV() {
    const rows = [['Visitor Code', 'Visitor', 'Identity Number', 'Registration Status', 'Registered At']];
    filteredVisitors.forEach(visitor => rows.push([
      visitor.visitorCode || '',
      visitorName(visitor),
      visitor.identityNumber || '',
      readable(visitor.registrationStatus),
      visitor.createdAt || '',
    ]));
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="card" style={{ marginBottom: 16 }}><div className="card-b" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}><Search size={16} className="s-icon" /><input placeholder="Search by visitor name, code, or ID..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        <button className="btn-o" onClick={loadVisitors} disabled={loading}><RefreshCw size={16} /> Refresh</button>
        <button className="btn-p" onClick={exportCSV} disabled={!filteredVisitors.length}><Download size={16} /> Export</button>
      </div></div>

      <div className="card"><div className="card-h"><h3><Users size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />All Visitors</h3><span style={{ color: 'var(--text2)', fontSize: 13 }}>{filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''}</span></div>
        {loading ? <div className="card-b" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 10 }}><Loader2 size={28} /></motion.div><div>Loading visitors…</div></div>
          : error ? <div className="card-b" style={{ textAlign: 'center', padding: 36 }}><AlertCircle size={30} style={{ color: 'var(--danger)', marginBottom: 10 }} /><h3 style={{ margin: '0 0 8px' }}>Unable to load visitors</h3><p style={{ color: 'var(--text2)', margin: '0 0 16px' }}>{error}</p><button className="btn-p" onClick={loadVisitors}>Try Again</button></div>
          : <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Visitor</th><th>Visitor Code</th><th>Identity</th><th>Registration</th><th>Registered</th><th></th></tr></thead><tbody>
            {filteredVisitors.map((visitor, index) => <motion.tr key={visitor.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.2) }} onClick={() => navigate(`/visitor/${visitor.id}`)} style={{ cursor: 'pointer' }}>
              <td><div className="vis-row"><div className="vis-av">{visitorName(visitor).charAt(0)}</div><div className="vis-info"><h4>{visitorName(visitor)}</h4><p>{visitor.emails?.[0] || visitor.mobiles?.[0] || ''}</p></div></div></td>
              <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{visitor.visitorCode || '—'}</span></td><td>{readable(visitor.identityType)}</td><td><span className="badge checked_out">{readable(visitor.registrationStatus)}</span></td><td style={{ fontSize: 12 }}>{visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : '—'}</td><td><ChevronRight size={18} style={{ color: 'var(--text2)' }} /></td>
            </motion.tr>)}
            {!filteredVisitors.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: 'var(--text2)' }}>No visitors found.</td></tr>}
          </tbody></table></div>}
      </div>
    </motion.div>
  );
}
