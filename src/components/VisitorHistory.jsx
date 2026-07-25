import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ArrowUpDown, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import store from '../store';

const STATUS_LIST = ['all', 'checked_out'];
const PURPOSES = ['', 'Technical Discussion', 'Interview', 'Business Meeting', 'Contract Negotiation', 'Design Review', 'Training', 'Audit', 'Delivery', 'Maintenance', 'Other'];

export default function VisitorHistory() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('checkOutTime');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => { setVisits(store.getVisitHistory()); }, []);

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  let filtered = visits;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v => {
      const vis = store.getVisitorById(v.visitorId);
      return vis?.name?.toLowerCase().includes(q) || v.token.toLowerCase().includes(q) || vis?.company?.toLowerCase().includes(q);
    });
  }
  if (purposeFilter) filtered = filtered.filter(v => v.purpose === purposeFilter);
  if (dateFrom) filtered = filtered.filter(v => v.checkInTime?.slice(0, 10) >= dateFrom);
  if (dateTo) filtered = filtered.filter(v => v.checkOutTime?.slice(0, 10) <= dateTo);

  filtered.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'visitorName') {
      va = store.getVisitorById(a.visitorId)?.name || '';
      vb = store.getVisitorById(b.visitorId)?.name || '';
    }
    if (sortField === 'employeeName') {
      va = store.getEmployees().find(e => e.id === a.employeeId)?.name || '';
      vb = store.getEmployees().find(e => e.id === b.employeeId)?.name || '';
    }
    if (sortField === 'duration') {
      va = a.checkOutTime ? (new Date(a.checkOutTime) - new Date(a.checkInTime)) : 0;
      vb = b.checkOutTime ? (new Date(b.checkOutTime) - new Date(b.checkInTime)) : 0;
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function exportCSV() {
    const rows = [['Token', 'Visitor', 'Company', 'Host', 'Purpose', 'Floor', 'Check-In', 'Check-Out', 'Duration', 'Badge']];
    filtered.forEach(v => {
      const vis = store.getVisitorById(v.visitorId);
      const emp = store.getEmployees().find(e => e.id === v.employeeId);
      const dur = v.checkOutTime ? Math.round((new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000 * 10) / 10 + 'h' : 'N/A';
      rows.push([v.token, vis?.name || '', vis?.company || '', emp?.name || '', v.purpose, v.floor, new Date(v.checkInTime).toLocaleString(), v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '', dur, v.badgePrinted ? 'Yes' : 'No']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `visitor-history-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  const hasFilters = search || purposeFilter || dateFrom || dateTo;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-b">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <Search size={16} className="s-icon" />
              <input placeholder="Search by name, token, or company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <button className="btn-o" onClick={() => { setSearch(''); setPurposeFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }} style={hasFilters ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}><Filter size={16} /> Filters{hasFilters ? ' ✕' : ''}</button>
            <button className="btn-p" onClick={exportCSV}><Download size={16} /> Export</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-s" style={{ width: 'auto', flex: 1 }} value={purposeFilter} onChange={e => { setPurposeFilter(e.target.value); setPage(1); }}>
              <option value="">All Purposes</option>
              {PURPOSES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" className="form-i" style={{ width: 'auto' }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            <input type="date" className="form-i" style={{ width: 'auto' }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                {[
                  { key: 'token', label: 'Token' },
                  { key: 'visitorName', label: 'Visitor' },
                  { key: 'purpose', label: 'Purpose' },
                  { key: 'employeeName', label: 'Host' },
                  { key: 'floor', label: 'Floor' },
                  { key: 'checkInTime', label: 'Check-In' },
                  { key: 'checkOutTime', label: 'Check-Out' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'badgePrinted', label: 'Badge' },
                ].map(col => (
                  <th key={col.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(col.key)}>
                    {col.label} <ArrowUpDown size={12} style={{ opacity: sortField === col.key ? 1 : 0.3 }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(v => {
                const vis = store.getVisitorById(v.visitorId);
                const emp = store.getEmployees().find(e => e.id === v.employeeId);
                const dur = v.checkOutTime ? Math.round((new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000 * 10) / 10 : 'N/A';
                return (
                  <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/visitor/${v.visitorId}`)}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{v.token}</span></td>
                    <td>
                      <div className="vis-row">
                        <div className="vis-av">{vis?.name?.charAt(0) || '?'}</div>
                        <div className="vis-info"><h4>{vis?.name || 'Unknown'}</h4><p>{vis?.company || ''}</p></div>
                      </div>
                    </td>
                    <td>{v.purpose}</td>
                    <td>{emp?.name || 'N/A'}</td>
                    <td>{v.floor}</td>
                    <td style={{ fontSize: 12 }}>{new Date(v.checkInTime).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '—'}</td>
                    <td><span className="badge checked_out">{dur}h</span></td>
                    <td>{v.badgePrinted ? '✓' : '—'}</td>
                  </tr>
                );
              })}
              {paged.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </motion.div>
  );
}
