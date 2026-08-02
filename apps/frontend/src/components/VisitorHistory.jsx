import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ArrowUpDown, Filter, History, Users, CalendarClock, UserX, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getVisits, getVisitors, notify } from '../api';
import ActiveVisitors from './ActiveVisitors';
import ExpectedVisitors from './ExpectedVisitors';
import DeletedVisitors from './DeletedVisitors';
import VisitorAvatar from './VisitorAvatar';

const PURPOSES = ['', 'Technical Discussion', 'Interview', 'Business Meeting', 'Contract Negotiation', 'Design Review', 'Training', 'Audit', 'Delivery', 'Maintenance', 'Other'];

const TABS = [
  { key: 'history', label: 'History', icon: History },
  { key: 'active', label: 'Active Visitors', icon: Users },
  { key: 'expected', label: 'Expected Visitors', icon: CalendarClock },
  { key: 'deleted', label: 'Deleted Visitors', icon: UserX },
  { key: 'failed', label: 'Failed Registers', icon: AlertTriangle },
];

const ATTEMPT_LABELS = { face_recognition: 'Face Recognition', check_in: 'Check-In', pre_register: 'Pre-Register' };

export default function VisitorHistory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('history');
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('checkOutTime');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [failed, setFailed] = useState([]);
  const [visitors, setVisitors] = useState([]); const [employees, setEmployees] = useState([]);
  const perPage = 10;

  useEffect(() => { Promise.all([getVisits(), getVisitors(), getEmployees()]).then(([rows, people, staff]) => { setVisits(rows); setVisitors(people); setEmployees(staff); setFailed([]); }).catch(err => notify(err.message, 'error')); }, [tab]);

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  let filtered = Array.from(new Map(visits.map(visit => [visit.visitorId, visit])).values());
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v => {
      const vis = visitors.find(visitor => visitor.id === v.visitorId);
      return vis?.name?.toLowerCase().includes(q) || v.token.toLowerCase().includes(q) || vis?.company?.toLowerCase().includes(q);
    });
  }
  if (purposeFilter) filtered = filtered.filter(v => v.purpose === purposeFilter);
  if (dateFrom) filtered = filtered.filter(v => v.checkInTime?.slice(0, 10) >= dateFrom);
  if (dateTo) filtered = filtered.filter(v => v.checkOutTime?.slice(0, 10) <= dateTo);

  filtered.sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'visitorName') {
      va = visitors.find(visitor => visitor.id === a.visitorId)?.name || '';
      vb = visitors.find(visitor => visitor.id === b.visitorId)?.name || '';
    }
    if (sortField === 'employeeName') {
      va = a.host?.name || employees.find(e => e.id === a.employeeId)?.name || '';
      vb = b.host?.name || employees.find(e => e.id === b.employeeId)?.name || '';
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
    const rows = [['Visitor Code', 'Visitor', 'Company', 'Total Visits', 'Last Host', 'Last Purpose', 'Last Visit']];
    filtered.forEach(v => {
      const vis = visitors.find(visitor => visitor.id === v.visitorId);
      const emp = v.host || employees.find(e => e.id === v.employeeId);
      const dur = v.checkOutTime ? Math.round((new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000 * 10) / 10 + 'h' : 'N/A';
      rows.push([vis?.visitorCode || v.token, vis?.name || '', vis?.company || '', visits.filter(row => row.visitorId === v.visitorId).length, emp?.name || '', v.purpose, new Date(v.checkInTime).toLocaleString()]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `visitor-history-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  const hasFilters = search || purposeFilter || dateFrom || dateTo;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="tabs">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'history' && (
        <>
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
                      { key: 'token', label: 'Visitor Code' },
                      { key: 'visitorName', label: 'Visitor' },
                      { key: 'totalVisits', label: 'Total Visits' },
                      { key: 'purpose', label: 'Last Purpose' },
                      { key: 'employeeName', label: 'Last Host' },
                      { key: 'checkInTime', label: 'Last Visit' },
                    ].map(col => (
                      <th key={col.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(col.key)}>
                        {col.label} <ArrowUpDown size={12} style={{ opacity: sortField === col.key ? 1 : 0.3 }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(v => {
                    const vis = visitors.find(visitor => visitor.id === v.visitorId);
                    const emp = v.host || employees.find(e => e.id === v.employeeId);
                    const dur = v.checkOutTime ? Math.round((new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000 * 10) / 10 : 'N/A';
                    return (
                      <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/visitor/${v.visitorId}`)}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{vis?.visitorCode || v.token}</span></td>
                        <td>
                          <div className="vis-row">
                            <VisitorAvatar visitor={vis} />
                            <div className="vis-info"><h4>{vis?.name || 'Unknown'}</h4><p>{vis?.company || ''}</p></div>
                          </div>
                        </td>
                        <td>{visits.filter(row => row.visitorId === v.visitorId).length}</td>
                        <td>{v.purpose}</td>
                        <td>{emp?.name || 'N/A'}</td>
                        <td style={{ fontSize: 12 }}>{new Date(v.checkInTime).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No records found</td></tr>}
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
        </>
      )}

      {tab === 'active' && <ActiveVisitors />}
      {tab === 'expected' && <ExpectedVisitors />}
      {tab === 'deleted' && <DeletedVisitors />}

      {tab === 'failed' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{failed.length} failed register{failed.length !== 1 ? 's' : ''}</p>
          </div>
          {failed.length === 0 ? (
            <div className="card"><div className="card-b empty">
              <AlertTriangle size={48} style={{ opacity: 0.3 }} />
              <h3>No Failed Registers</h3>
              <p>Failed check-in attempts will appear here.</p>
            </div></div>
          ) : (
            <div className="card">
              <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Attempt</th><th>Visitor</th><th>Reason</th><th>Detail</th><th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failed.map(f => (
                      <tr key={f.id}>
                        <td>
                          <span className={`badge ${f.attempt === 'check_in' ? 'active' : 'cancelled'}`} style={{ textTransform: 'capitalize' }}>
                            {ATTEMPT_LABELS[f.attempt] || f.attempt}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{f.name || 'Unknown'}</td>
                        <td style={{ fontSize: 12 }}>{f.reason}</td>
                        <td style={{ fontSize: 12, color: 'var(--text2)' }}>{f.detail || '—'}</td>
                        <td style={{ fontSize: 12 }}>{new Date(f.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
