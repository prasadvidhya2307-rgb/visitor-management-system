import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRightLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import store from '../store';

export default function ActiveVisitors() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);

  useEffect(() => { setVisits(store.getActiveVisits()); }, []);

  function handleCheckOut(id) {
    store.checkOut(id);
    setVisits(store.getActiveVisits());
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>{visits.length} visitor{visits.length !== 1 ? 's' : ''} currently in the building</p>
      </div>

      {visits.length === 0 ? (
        <div className="card"><div className="card-b empty">
          <Users size={48} style={{ opacity: 0.3 }} />
          <h3>No Active Visitors</h3>
          <p>No visitors are currently in the building.</p>
          <button className="btn-p" style={{ marginTop: 12 }} onClick={() => navigate('/check-in')}>Check In a Visitor</button>
        </div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {visits.map((v, i) => {
            const vis = store.getVisitorById(v.visitorId);
            const emp = store.getEmployees().find(e => e.id === v.employeeId);
            const dur = Math.round((new Date() - new Date(v.checkInTime)) / 3600000 * 10) / 10;
            const isOvertime = dur > 8;
            return (
              <motion.div key={v.id} className={`vis-card ${isOvertime ? 'overtime' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="vis-header">
                  <div className="vis-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{vis?.name?.charAt(0) || '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600 }}>{vis?.name || 'Unknown'}</h4>
                      {isOvertime && <span className="overtime-badge">OVERTIME</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>{v.token} · {vis?.company || ''}</p>
                  </div>
                </div>
                <div className="vis-meta">
                  <div><span className="label">Host: </span><span className="value">{emp?.name || 'N/A'}</span></div>
                  <div><span className="label">Department: </span><span className="value">{emp?.department || 'N/A'}</span></div>
                  <div><span className="label">Purpose: </span><span className="value">{v.purpose}</span></div>
                  <div><span className="label">Floor: </span><span className="value">{v.floor}</span></div>
                  <div><span className="label">Check-In: </span><span className="value">{new Date(v.checkInTime).toLocaleTimeString()}</span></div>
                  <div><span className="label">Duration: </span><span className="value" style={isOvertime ? { color: 'var(--danger)' } : {}}>{dur}h</span></div>
                </div>
                {v.notes && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8, fontStyle: 'italic' }}>"{v.notes}"</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-d btn-sm" onClick={() => handleCheckOut(v.id)}><ArrowRightLeft size={14} /> Check Out</button>
                  <button className="btn-o btn-sm" onClick={() => navigate(`/visitor/${v.visitorId}`)}>Profile</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
