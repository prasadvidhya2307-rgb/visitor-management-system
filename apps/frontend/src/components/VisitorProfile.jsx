import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Mail, Phone, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteVisitor, getEmployees, getVisitor, getVisitorVisits } from '../api';

function getName(person) {
  return [person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'Unnamed visitor';
}

function readable(value) {
  return value ? String(value).replace(/_/g, ' ') : '—';
}

export default function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    async function loadProfile() {
      try {
        const [visitorData, visitData, employeeData] = await Promise.all([getVisitor(id), getVisitorVisits(id), getEmployees()]);
        if (!isCurrent) return;
        const employeesById = new Map((employeeData || []).map(employee => [employee.id, employee]));
        setVisitor(visitorData);
        setVisits((visitData || []).map(visit => ({ ...visit, hostEmployee: employeesById.get(visit.hostEmployeeId) })));
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Unable to load the visitor profile.');
      }
    }
    loadProfile();
    return () => { isCurrent = false; };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete visitor "${getName(visitor)}"?`)) return;
    try {
      await deleteVisitor(visitor.id);
      navigate(-1);
    } catch (requestError) {
      window.alert(requestError.message || 'Unable to delete visitor.');
    }
  }

  if (error) return <div className="card"><div className="card-b empty"><h3>Unable to load visitor</h3><p>{error}</p></div></div>;
  if (!visitor) return <div className="card"><div className="card-b empty"><h3>Loading visitor…</h3></div></div>;

  const totalHours = visits.filter(visit => visit.checkOutAt).reduce((total, visit) => total + (new Date(visit.checkOutAt) - new Date(visit.checkInAt)) / 3600000, 0);
  const activeVisits = visits.filter(visit => visit.status === 'CHECKED_IN').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn-o" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
        <button className="btn-o" onClick={handleDelete} style={{ marginLeft: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }}><Trash2 size={16} /> Delete Visitor</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}><div className="card-b"><div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div className="vis-avatar" style={{ width: 80, height: 80, fontSize: 28, flexShrink: 0 }}>{getName(visitor).charAt(0)}</div>
        <div style={{ flex: 1 }}><h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{getName(visitor)}</h2><p style={{ fontSize: 13, color: 'var(--text2)' }}>Visitor code: {visitor.visitorCode || '—'}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            {visitor.emails?.[0] && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><Mail size={14} /> {visitor.emails[0]}</span>}
            {visitor.mobiles?.[0] && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><Phone size={14} /> {visitor.mobiles[0]}</span>}
            {visitor.identityType && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}><CreditCard size={14} /> {readable(visitor.identityType)}: {visitor.identityNumber}</span>}
          </div>
        </div>
      </div></div></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="stat-card blue"><div className="stat-val">{visits.length}</div><div className="stat-lbl">Total Visits</div></div>
        <div className="stat-card green"><div className="stat-val">{totalHours.toFixed(1)}h</div><div className="stat-lbl">Total Time</div></div>
        <div className="stat-card amber"><div className="stat-val">{activeVisits}</div><div className="stat-lbl">Currently Active</div></div>
      </div>

      <div className="card"><div className="card-h"><h3>Visit History</h3></div><div className="card-b" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="tbl"><thead><tr><th>Visit ID</th><th>Purpose</th><th>Host</th><th>Check-In</th><th>Check-Out</th><th>Status</th></tr></thead><tbody>
          {visits.map(visit => <tr key={visit.id}><td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{visit.id}</span></td><td>{readable(visit.purpose)}</td><td>{getName(visit.hostEmployee)}</td><td style={{ fontSize: 12 }}>{new Date(visit.checkInAt).toLocaleString()}</td><td style={{ fontSize: 12 }}>{visit.checkOutAt ? new Date(visit.checkOutAt).toLocaleString() : '—'}</td><td><span className={`badge ${visit.status === 'CHECKED_IN' ? 'active' : 'checked_out'}`}>{readable(visit.status)}</span></td></tr>)}
          {!visits.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No visit history</td></tr>}
        </tbody></table>
      </div></div>
    </motion.div>
  );
}
