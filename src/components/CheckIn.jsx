import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import store from '../store';
import FaceRecognition from './FaceRecognition';

const ID_TYPES = ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
const PURPOSES = ['Technical Discussion', 'Interview', 'Business Meeting', 'Contract Negotiation', 'Design Review', 'Training', 'Audit', 'Delivery', 'Maintenance', 'Other'];
const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor'];

export default function CheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState('');
  const [identityType, setIdentityType] = useState('aadhaar');
  const [isNew, setIsNew] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name: '', email: '', phone: '', company: '', identityNumber: '' });
  const [form, setForm] = useState({ employeeId: '', purpose: '', floor: '3rd Floor', notes: '', badgePrinted: false });
  const [faceResult, setFaceResult] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setVisitors(store.getVisitors());
    setEmployees(store.getEmployees());
  }, []);

  function handleCheckIn() {
    let visitorId = selectedVisitor;
    if (isNew) {
      const vis = store.addVisitor({ ...newVisitor, identityType, photo: faceResult?.image || null });
      visitorId = vis.id;
    }
    const visit = store.checkIn({
      visitorId,
      employeeId: form.employeeId,
      purpose: form.purpose,
      floor: form.floor,
      notes: form.notes,
      badgePrinted: form.badgePrinted,
      faceData: faceResult?.faceData || null,
      photo: faceResult?.image || null,
    });
    setResult(visit);
    setStep(5);
  }

  const visitorName = isNew ? newVisitor.name : visitors.find(v => v.id === selectedVisitor)?.name || '';
  const empName = employees.find(e => e.id === form.employeeId)?.name || '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="steps">
        <div className="step-item"><div className={`step-num ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>1</div><span className={`step-lbl ${step >= 1 ? 'active' : ''}`}>Identity</span></div>
        <div className={`step-line ${step > 1 ? 'done' : ''}`} />
        <div className="step-item"><div className={`step-num ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>2</div><span className={`step-lbl ${step >= 2 ? 'active' : ''}`}>Details</span></div>
        <div className={`step-line ${step > 2 ? 'done' : ''}`} />
        <div className="step-item"><div className={`step-num ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}>3</div><span className={`step-lbl ${step >= 3 ? 'active' : ''}`}>Face</span></div>
        <div className={`step-line ${step > 3 ? 'done' : ''}`} />
        <div className="step-item"><div className={`step-num ${step >= 4 ? 'active' : ''}`}>4</div><span className={`step-lbl ${step >= 4 ? 'active' : ''}`}>Confirm</span></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 5 && result ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-b">
              <div className="success-box">
                <div className="success-icon"><CheckCircle size={40} /></div>
                <h2>Visitor Checked In!</h2>
                <p style={{ color: 'var(--text2)' }}>Token assigned: <strong>{result.token}</strong></p>
                <div className="detail-grid">
                  <div className="detail-item"><div className="lbl">Visitor</div><div className="val">{visitorName}</div></div>
                  <div className="detail-item"><div className="lbl">Host</div><div className="val">{empName}</div></div>
                  <div className="detail-item"><div className="lbl">Purpose</div><div className="val">{result.purpose}</div></div>
                  <div className="detail-item"><div className="lbl">Time</div><div className="val">{new Date(result.checkInTime).toLocaleTimeString()}</div></div>
                  <div className="detail-item"><div className="lbl">Floor</div><div className="val">{result.floor}</div></div>
                  <div className="detail-item"><div className="lbl">Face ID</div><div className="val" style={{ color: 'var(--success)' }}>✓ Captured</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                  <button className="btn-p" onClick={() => { setStep(1); setResult(null); setSelectedVisitor(''); setNewVisitor({ name: '', email: '', phone: '', company: '', identityNumber: '' }); setFaceResult(null); }}>Check In Another</button>
                  <button className="btn-o" onClick={() => navigate('/active')}>View Active</button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : step === 1 ? (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Identity Verification</h3></div>
            <div className="card-b">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button className="btn-o" style={!isNew ? { background: 'var(--primary-bg)', borderColor: 'var(--primary)', color: 'var(--primary)' } : {}} onClick={() => setIsNew(false)}>Returning Visitor</button>
                <button className="btn-o" style={isNew ? { background: 'var(--primary-bg)', borderColor: 'var(--primary)', color: 'var(--primary)' } : {}} onClick={() => setIsNew(true)}>New Visitor</button>
              </div>

              {!isNew ? (
                <div className="form-g">
                  <label className="form-l">Select Visitor</label>
                  <select className="form-s" value={selectedVisitor} onChange={e => setSelectedVisitor(e.target.value)}>
                    <option value="">Choose visitor...</option>
                    {visitors.map(v => <option key={v.id} value={v.id}>{v.name} — {v.company}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Full Name *</label><input className="form-i" value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} placeholder="e.g. John Doe" /></div>
                    <div className="form-g"><label className="form-l">Phone *</label><input className="form-i" value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} placeholder="9876543210" /></div>
                    <div className="form-g"><label className="form-l">Email</label><input className="form-i" type="email" value={newVisitor.email} onChange={e => setNewVisitor({ ...newVisitor, email: e.target.value })} placeholder="john@company.com" /></div>
                    <div className="form-g"><label className="form-l">Company</label><input className="form-i" value={newVisitor.company} onChange={e => setNewVisitor({ ...newVisitor, company: e.target.value })} placeholder="Company name" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Identity Type</label><select className="form-s" value={identityType} onChange={e => setIdentityType(e.target.value)}>{ID_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}</select></div>
                    <div className="form-g"><label className="form-l">ID Number</label><input className="form-i" value={newVisitor.identityNumber} onChange={e => setNewVisitor({ ...newVisitor, identityNumber: e.target.value })} placeholder="ID number" /></div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-p" disabled={!isNew ? !selectedVisitor : !newVisitor.name || !newVisitor.phone} onClick={() => setStep(2)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Visit Details</h3></div>
            <div className="card-b">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select host...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Floor</label><select className="form-s" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Print Badge</label><select className="form-s" value={form.badgePrinted ? 'yes' : 'no'} onChange={e => setForm({ ...form, badgePrinted: e.target.value === 'yes' })}><option value="no">No</option><option value="yes">Yes</option></select></div>
              </div>
              <div className="form-g"><label className="form-l">Notes</label><textarea className="form-i" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." /></div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(1)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!form.employeeId || !form.purpose} onClick={() => setStep(3)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        ) : step === 3 ? (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Face Recognition — Capture</h3></div>
            <div className="card-b">
              {!faceResult ? (
                <FaceRecognition
                  mode="capture"
                  label="Position your face in the frame for check-in verification"
                  onCapture={(data) => {
                    setFaceResult(data);
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, color: 'var(--success)' }}>
                    <CheckCircle size={20} /> <strong>Face Captured Successfully</strong>
                  </div>
                  <img src={faceResult.image} alt="captured" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--success)' }} />
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-o" onClick={() => setFaceResult(null)}>Retake</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!faceResult} onClick={() => setStep(4)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        ) : step === 4 ? (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Confirm Check-In</h3></div>
            <div className="card-b">
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Visit Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: 'var(--text2)' }}>Visitor: </span><strong>{visitorName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{form.purpose}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Floor: </span><strong>{form.floor}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Badge: </span><strong>{form.badgePrinted ? 'Yes' : 'No'}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Face ID: </span><strong style={{ color: 'var(--success)' }}>✓ Captured</strong></div>
                  {form.notes && <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text2)' }}>Notes: </span><strong>{form.notes}</strong></div>}
                </div>
              </div>
              {faceResult && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <img src={faceResult.image} alt="face" style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--primary)' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(3)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-s" onClick={handleCheckIn}><CheckCircle size={16} /> Confirm Check-In</button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
