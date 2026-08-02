import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Building, CreditCard, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteVisitor, fetchVisitor, fetchVisitorVisits } from '../services/api';
import { mapVisitor, mapVisit } from '../services/mappers';
import { loadEmployees } from '../services/data';
import { useToast } from './Toast';

export default function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [visits, setVisits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const toast = useToast();

  useEffect(() => { Promise.all([fetchVisitor(id), fetchVisitorVisits(id), loadEmployees()]).then(([rawVisitor, rawVisits, employees]) => { const visitor = mapVisitor(rawVisitor); setVisitor(visitor); setVisits(rawVisits.map((visit) => mapVisit(visit, { [visitor.id]: visitor }))); setEmployees(employees); }).catch((err) => toast.error(err.message || 'Unable to load visitor profile.')); }, [id, toast]);

  function handleDelete() {
    if (window.confirm(`Delete visitor "${visitor.name}"? They will be moved to Deleted Visitors and can be restored later.`)) {
      deleteVisitor(visitor.id).then(() => { toast.success('Visitor deleted successfully.'); navigate(-1); }).catch((err) => toast.error(err.message || 'Unable to delete visitor.'));
    }
  }

  if (!visitor) return <div className="card"><div className="card-b empty"><h3>Visitor Not Found</h3></div></div>;

  const totalVisits = visits.length;
  const totalHours = visits.filter(v => v.checkOutTime).reduce((acc, v) => acc + (new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn-o" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
        <button className="btn-o" onClick={handleDelete} style={{ marginLeft: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }}><Trash2 size={16} /> Delete Visitor</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-b">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div className="vis-avatar" style={{ width: 80, height: 80, fontSize: 28, flexShrink: 0 }}>{visitor.name?.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{visitor.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{visitor.company || 'Unknown Company'}</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                {visitor.email && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><Mail size={14} /> {visitor.email}</span>}
                {visitor.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><Phone size={14} /> {visitor.phone}</span>}
                {visitor.identityType && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><CreditCard size={14} /> {visitor.identityType.replace('_', ' ').toUpperCase()}: {visitor.identityNumber}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="stat-card blue"><div className="stat-val">{totalVisits}</div><div className="stat-lbl">Total Visits</div></div>
        <div className="stat-card green"><div className="stat-val">{totalHours.toFixed(1)}h</div><div className="stat-lbl">Total Time</div></div>
        <div className="stat-card amber"><div className="stat-val">{visits.filter(v => v.status === 'checked_in').length}</div><div className="stat-lbl">Currently Active</div></div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Visit History</h3></div>
        <div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Token</th><th>Purpose</th><th>Host</th><th>Check-In</th><th>Check-Out</th><th>Status</th></tr>
            </thead>
            <tbody>
              {visits.map(v => {
                const emp = employees.find(e => e.id === v.employeeId);
                return (
                  <tr key={v.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.token}</span></td>
                    <td>{v.purpose}</td>
                    <td>{emp?.name || 'N/A'}</td>
                    <td style={{ fontSize: 12 }}>{new Date(v.checkInTime).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '—'}</td>
                    <td><span className={`badge ${v.status === 'checked_in' ? 'active' : 'checked_out'}`}>{v.status.replace('_', ' ')}</span></td>
                  </tr>
                );
              })}
              {visits.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No visit history</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
