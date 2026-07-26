import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, UserCheck, UserPlus, ClipboardCheck } from 'lucide-react';
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
  const [preRegistered, setPreRegistered] = useState([]);
  const [storedFaces, setStoredFaces] = useState([]);

  const [visitorType, setVisitorType] = useState(null);
  const [identifiedVisitor, setIdentifiedVisitor] = useState(null);
  const [identifiedPhoto, setIdentifiedPhoto] = useState(null);

  const [newVisitor, setNewVisitor] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
  const [identityType, setIdentityType] = useState('aadhaar');
  const [selectedPreReg, setSelectedPreReg] = useState('');

  const [form, setForm] = useState({ employeeId: '', purpose: '', floor: '3rd Floor', notes: '', badgePrinted: false });
  const [faceResult, setFaceResult] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setVisitors(store.getVisitors());
    setEmployees(store.getEmployees());
    setPreRegistered(store.getPreRegistered());
    setStoredFaces(store.getStoredFaces());
  }, []);

  function handleCheckIn() {
    let visitorId;
    let faceData = null;
    let photo = null;

    if (visitorType === 'returning') {
      visitorId = identifiedVisitor.id;
      const lastVisit = store.getVisitorVisits(visitorId).find(v => v.faceData);
      faceData = lastVisit?.faceData || null;
      photo = lastVisit?.photo || identifiedPhoto;
    } else if (visitorType === 'new') {
      const vis = store.addVisitor({
        name: `${newVisitor.firstName} ${newVisitor.lastName}`,
        firstName: newVisitor.firstName,
        lastName: newVisitor.lastName,
        email: newVisitor.email,
        phone: newVisitor.phone,
        company: newVisitor.company,
        identityType,
        identityNumber: newVisitor.identityNumber,
        photo: faceResult?.image || null,
      });
      visitorId = vis.id;
      faceData = faceResult?.faceData || null;
      photo = faceResult?.image || null;
    } else if (visitorType === 'pre_registered') {
      const preReg = preRegistered.find(p => p.id === selectedPreReg);
      const existingVisitor = visitors.find(v => v.email === preReg?.email || v.name === preReg?.name);
      if (existingVisitor) {
        visitorId = existingVisitor.id;
      } else {
        const vis = store.addVisitor({
          name: preReg.name,
          email: preReg.email,
          phone: preReg.phone,
          company: preReg.company,
          identityType: 'aadhaar',
          identityNumber: '',
          photo: faceResult?.image || null,
        });
        visitorId = vis.id;
      }
      faceData = faceResult?.faceData || null;
      photo = faceResult?.image || null;
    }

    const visit = store.checkIn({
      visitorId,
      employeeId: form.employeeId,
      purpose: form.purpose,
      floor: form.floor,
      notes: form.notes,
      badgePrinted: form.badgePrinted,
      faceData,
      photo,
    });
    setResult(visit);
    setStep(7);
  }

  const visitorName = visitorType === 'returning'
    ? identifiedVisitor?.name
    : visitorType === 'pre_registered'
      ? preRegistered.find(p => p.id === selectedPreReg)?.name || ''
      : `${newVisitor.firstName} ${newVisitor.lastName}`;
  const empName = employees.find(e => e.id === form.employeeId)?.name || '';

  function resetAll() {
    setStep(1);
    setResult(null);
    setVisitorType(null);
    setIdentifiedVisitor(null);
    setIdentifiedPhoto(null);
    setNewVisitor({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
    setIdentityType('aadhaar');
    setSelectedPreReg('');
    setForm({ employeeId: '', purpose: '', floor: '3rd Floor', notes: '', badgePrinted: false });
    setFaceResult(null);
  }

  const stepLabels = ['Scan', 'Type', 'Details', 'Face', 'Confirm'];
  const currentStepNum = step === 1 ? 1 : step <= 2 ? 2 : step <= 5 ? 3 : step <= 6 ? 4 : 5;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="steps">
        {stepLabels.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className={`step-line ${currentStepNum > i ? 'done' : ''}`} />}
            <div className="step-item">
              <div className={`step-num ${currentStepNum >= i + 1 ? (currentStepNum > i + 1 ? 'done' : 'active') : ''}`}>{i + 1}</div>
              <span className={`step-lbl ${currentStepNum >= i + 1 ? 'active' : ''}`}>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 7: Success */}
        {step === 7 && result && (
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
                  <div className="detail-item"><div className="lbl">Face ID</div><div className="val" style={{ color: 'var(--success)' }}>Captured</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                  <button className="btn-p" onClick={resetAll}>Check In Another</button>
                  <button className="btn-o" onClick={() => navigate('/active')}>View Active</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: Confirm */}
        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Confirm Check-In</h3></div>
            <div className="card-b">
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Visit Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: 'var(--text2)' }}>Visitor: </span><strong>{visitorName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Type: </span><strong>{visitorType === 'returning' ? 'Returning' : visitorType === 'pre_registered' ? 'Pre-Registered' : 'New'}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{form.purpose}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Floor: </span><strong>{form.floor}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Badge: </span><strong>{form.badgePrinted ? 'Yes' : 'No'}</strong></div>
                  {form.notes && <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text2)' }}>Notes: </span><strong>{form.notes}</strong></div>}
                </div>
              </div>
              {faceResult?.image && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <img src={faceResult.image} alt="face" style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--primary)' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(visitorType === 'returning' ? 2 : 5)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-s" onClick={handleCheckIn}><CheckCircle size={16} /> Confirm Check-In</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Face Capture (new / pre-registered only) */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Face Recognition — Capture</h3></div>
            <div className="card-b">
              {!faceResult ? (
                <FaceRecognition mode="capture" label="Position your face for check-in verification" onCapture={(data) => setFaceResult(data)} />
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
                <button className="btn-o" onClick={() => setStep(3)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!faceResult} onClick={() => setStep(6)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Pre-Registered Select */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Select Pre-Registered Guest</h3></div>
            <div className="card-b">
              {preRegistered.filter(p => p.status === 'active').length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>
                  <ClipboardCheck size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>No active pre-registered guests found.</p>
                  <button className="btn-p" style={{ marginTop: 12 }} onClick={() => { setVisitorType('new'); setStep(3); }}>Register as New Visitor</button>
                </div>
              ) : (
                <>
                  <div className="form-g">
                    <label className="form-l">Guest *</label>
                    <select className="form-s" value={selectedPreReg} onChange={e => setSelectedPreReg(e.target.value)}>
                      <option value="">Choose guest...</option>
                      {preRegistered.filter(p => p.status === 'active').map(p => {
                        const emp = employees.find(e => e.id === p.employeeId);
                        return <option key={p.id} value={p.id}>{p.name} — {p.company} (Host: {emp?.name || 'N/A'})</option>;
                      })}
                    </select>
                  </div>
                  {selectedPreReg && (() => {
                    const g = preRegistered.find(p => p.id === selectedPreReg);
                    if (!g) return null;
                    const emp = employees.find(e => e.id === g.employeeId);
                    return (
                      <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', marginTop: 12, fontSize: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div><span style={{ color: 'var(--text2)' }}>Name: </span><strong>{g.name}</strong></div>
                          <div><span style={{ color: 'var(--text2)' }}>Company: </span><strong>{g.company}</strong></div>
                          <div><span style={{ color: 'var(--text2)' }}>Email: </span><strong>{g.email}</strong></div>
                          <div><span style={{ color: 'var(--text2)' }}>Phone: </span><strong>{g.phone}</strong></div>
                          <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{emp?.name || 'N/A'}</strong></div>
                          <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{g.purpose}</strong></div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!selectedPreReg} onClick={() => {
                  const g = preRegistered.find(p => p.id === selectedPreReg);
                  if (g) setForm({ ...form, employeeId: g.employeeId, purpose: g.purpose });
                  setStep(5);
                }}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: New Visitor Form + Visit Details */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Visitor & Visit Details</h3></div>
            <div className="card-b">
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Visitor Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">First Name *</label><input className="form-i" value={newVisitor.firstName} onChange={e => setNewVisitor({ ...newVisitor, firstName: e.target.value })} placeholder="John" /></div>
                <div className="form-g"><label className="form-l">Last Name *</label><input className="form-i" value={newVisitor.lastName} onChange={e => setNewVisitor({ ...newVisitor, lastName: e.target.value })} placeholder="Doe" /></div>
                <div className="form-g"><label className="form-l">Email *</label><input className="form-i" type="email" value={newVisitor.email} onChange={e => setNewVisitor({ ...newVisitor, email: e.target.value })} placeholder="john@company.com" /></div>
                <div className="form-g"><label className="form-l">Phone *</label><input className="form-i" value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} placeholder="9876543210" /></div>
                <div className="form-g"><label className="form-l">Company</label><input className="form-i" value={newVisitor.company} onChange={e => setNewVisitor({ ...newVisitor, company: e.target.value })} placeholder="Company name" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">Identity Type *</label><select className="form-s" value={identityType} onChange={e => setIdentityType(e.target.value)}>{ID_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}</select></div>
                <div className="form-g"><label className="form-l">ID Number</label><input className="form-i" value={newVisitor.identityNumber} onChange={e => setNewVisitor({ ...newVisitor, identityNumber: e.target.value })} placeholder="ID number" /></div>
              </div>

              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Visit Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select host...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Floor</label><select className="form-s" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Print Badge</label><select className="form-s" value={form.badgePrinted ? 'yes' : 'no'} onChange={e => setForm({ ...form, badgePrinted: e.target.value === 'yes' })}><option value="no">No</option><option value="yes">Yes</option></select></div>
              </div>
              <div className="form-g"><label className="form-l">Notes {form.purpose === 'Other' && <span style={{ color: 'var(--danger)' }}>*</span>}</label><textarea className="form-i" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={form.purpose === 'Other' ? 'Please specify the purpose...' : 'Additional notes...'} /></div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!newVisitor.firstName || !newVisitor.lastName || !newVisitor.email || !newVisitor.phone || !form.employeeId || !form.purpose || (form.purpose === 'Other' && !form.notes.trim())} onClick={() => setStep(5)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2b: New / Pre-Registered Choice */}
        {step === 2 && visitorType === null && (
          <motion.div key="s2-choice" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Visitor Type</h3></div>
            <div className="card-b" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>Face not recognized. Please select visitor type:</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button className="btn-o" style={{ flex: 1, maxWidth: 220, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }} onClick={() => { setVisitorType('new'); setStep(3); }}>
                  <UserPlus size={36} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>New Visitor</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>First-time guest registration</div>
                  </div>
                </button>
                <button className="btn-o" style={{ flex: 1, maxWidth: 220, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }} onClick={() => { setVisitorType('pre_registered'); setStep(4); }}>
                  <ClipboardCheck size={36} style={{ color: 'var(--success)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Pre-Registered Guest</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Already registered by host</div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2a: Returning Visitor */}
        {step === 2 && visitorType === 'returning' && identifiedVisitor && (
          <motion.div key="s2-returning" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h">
              <h3><UserCheck size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Returning Visitor</h3>
            </div>
            <div className="card-b">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', border: '1px solid var(--success)' }}>
                {identifiedPhoto && <img src={identifiedPhoto} alt="" style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{identifiedVisitor.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{identifiedVisitor.company || 'No company'} · {identifiedVisitor.email}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 16 }}>
                <div><span style={{ color: 'var(--text2)' }}>Phone: </span><strong>{identifiedVisitor.phone}</strong></div>
                <div><span style={{ color: 'var(--text2)' }}>ID: </span><strong>{identifiedVisitor.identityType?.toUpperCase() || 'N/A'} — {identifiedVisitor.identityNumber || 'N/A'}</strong></div>
              </div>

              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>New Visit Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select host...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Floor</label><select className="form-s" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>{FLOORS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                <div className="form-g"><label className="form-l">Print Badge</label><select className="form-s" value={form.badgePrinted ? 'yes' : 'no'} onChange={e => setForm({ ...form, badgePrinted: e.target.value === 'yes' })}><option value="no">No</option><option value="yes">Yes</option></select></div>
              </div>
              <div className="form-g"><label className="form-l">Notes {form.purpose === 'Other' && <span style={{ color: 'var(--danger)' }}>*</span>}</label><textarea className="form-i" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={form.purpose === 'Other' ? 'Please specify the purpose...' : 'Additional notes...'} /></div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => { setVisitorType(null); setStep(1); }}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!form.employeeId || !form.purpose || (form.purpose === 'Other' && !form.notes.trim())} onClick={() => setStep(6)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Face Identify */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3>Face Identification</h3></div>
            <div className="card-b">
              <FaceRecognition
                mode="identify"
                storedFaces={storedFaces}
                label="Position your face to identify yourself"
                onIdentified={(visitor, photo) => {
                  setIdentifiedVisitor(visitor);
                  setIdentifiedPhoto(photo);
                  setVisitorType('returning');
                  setTimeout(() => setStep(2), 1200);
                }}
                onNewFace={(faceData, image) => {
                  setFaceResult({ faceData, image });
                  setTimeout(() => setStep(2), 1200);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
