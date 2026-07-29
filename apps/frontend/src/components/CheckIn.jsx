import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Camera, User, Shield, ClipboardCheck, Activity, AlertCircle } from 'lucide-react';
import store from '../store';
import { checkIn } from '../api';
import FaceRecognition from './FaceRecognition';

const ID_TYPES = ['aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
const PURPOSES = ['Technical Discussion', 'Interview', 'Business Meeting', 'Contract Negotiation', 'Design Review', 'Training', 'Audit', 'Delivery', 'Maintenance', 'Other'];

export default function CheckIn() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);

  const [faceResult, setFaceResult] = useState(null);
  const [visitorData, setVisitorData] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
  const [identityType, setIdentityType] = useState('aadhaar');
  const [form, setForm] = useState({ employeeId: '', purpose: '', notes: '' });
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => { setEmployees(store.getEmployees()); }, []);

  const stepLabels = ['Capture', 'Details', 'Face', 'Confirm', 'Visit', 'Activate', 'Done'];
  const currentStepNum = step;

  function getStepLabel() {
    switch (step) {
      case 1: return 'CREATE_MEDIA';
      case 2: return 'CREATE_VISITOR';
      case 3: return 'REGISTER_FACE';
      case 4: return 'COMPLETE_REGISTRATION';
      case 5: return 'CREATE_VISIT';
      case 6: return 'ACTIVATE_MEDIA';
      case 7: return 'COMPLETED';
      default: return '';
    }
  }

  function handleCreateVisitor() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(3);
    }, 800);
  }

  function handleRegisterFace() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(4);
    }, 1000);
  }

  async function handleCreateVisit() {
    setProcessing(true);
    setApiError('');
    try {
      const visitor = {
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        email: visitorData.email,
        phone: visitorData.phone,
        company: visitorData.company || '',
        identityType,
        identityNumber: visitorData.identityNumber || '',
      };
      const visit = {
        hostEmployeeId: form.employeeId,
        purpose: form.purpose,
        notes: form.notes || '',
      };
      const data = await checkIn(visitor, visit, faceResult.image);
      setResult(data);
      setStep(6);
    } catch (err) {
      setApiError(err.message);
      setStep(6);
    } finally {
      setProcessing(false);
    }
  }

  function handleActivateMedia() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(7);
    }, 600);
  }

  function resetAll() {
    setStep(1);
    setResult(null);
    setVisitorData({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
    setIdentityType('aadhaar');
    setForm({ employeeId: '', purpose: '', notes: '' });
    setFaceResult(null);
    setApiError('');
  }

  const visitorName = `${visitorData.firstName} ${visitorData.lastName}`;
  const empName = employees.find(e => e.id === form.employeeId)?.name || '';
  const checkInDate = result ? new Date(result.checkInTime || result.createdAt) : new Date();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="steps">
        {stepLabels.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className={`step-line ${currentStepNum > i + 1 ? 'done' : ''}`} />}
            <div className="step-item">
              <div className={`step-num ${currentStepNum >= i + 1 ? (currentStepNum > i + 1 ? 'done' : 'active') : ''}`}>{i + 1}</div>
              <span className={`step-lbl ${currentStepNum >= i + 1 ? 'active' : ''}`}>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{getStepLabel()}</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 7 && (
          <motion.div key="s7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-b">
              <div className="success-box">
                <div className="success-icon"><CheckCircle size={40} /></div>
                <h2>Workflow Completed</h2>
                <p style={{ color: 'var(--text2)' }}>{result ? `Token: ${result.token || result.visit?.token || '—'}` : 'Visitor checked in successfully'}</p>
                <div className="detail-grid">
                  <div className="detail-item"><div className="lbl">Visitor</div><div className="val">{visitorName}</div></div>
                  <div className="detail-item"><div className="lbl">Host</div><div className="val">{empName}</div></div>
                  <div className="detail-item"><div className="lbl">Purpose</div><div className="val">{form.purpose}</div></div>
                  <div className="detail-item"><div className="lbl">Date</div><div className="val">{checkInDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                  <div className="detail-item"><div className="lbl">Time</div><div className="val">{checkInDate.toLocaleTimeString()}</div></div>
                  <div className="detail-item"><div className="lbl">Face ID</div><div className="val" style={{ color: 'var(--success)' }}>Registered</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                  <button className="btn-p" onClick={resetAll}>Check In Another</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-h"><h3><Activity size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />ACTIVATE_MEDIA</h3></div>
            <div className="card-b" style={{ textAlign: 'center' }}>
              {processing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', margin: '20px 0' }}>
                    <Loader2 size={48} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sending to backend & executing workflow...</p>
                </>
              ) : apiError ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16, color: 'var(--danger)' }}>
                    <AlertCircle size={24} /> <strong>API Error</strong>
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>{apiError}</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn-d" onClick={handleCreateVisit}>Retry</button>
                    <button className="btn-o" onClick={() => setStep(5)}>Back</button>
                  </div>
                </>
              ) : result ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, color: 'var(--success)' }}>
                    <CheckCircle size={24} /> <strong>Workflow Executed Successfully</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', textAlign: 'left', fontSize: 12 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div><span style={{ color: 'var(--text2)' }}>Workflow ID: </span><strong>{result.id || '—'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Status: </span><strong>{result.status || '—'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Visitor: </span><strong>{visitorName}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{form.purpose}</strong></div>
                    </div>
                  </div>
                  <button className="btn-s" style={{ marginTop: 16 }} onClick={handleActivateMedia}><Activity size={16} /> Complete</button>
                </>
              ) : (
                <p style={{ color: 'var(--text2)', fontSize: 13 }}>No response from server.</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><ClipboardCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />CREATE_VISIT — Visit Details</h3></div>
            <div className="card-b">
              <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select host...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></div>
              <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="form-g"><label className="form-l">Notes {form.purpose === 'Other' && <span style={{ color: 'var(--danger)' }}>*</span>}</label><textarea className="form-i" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={form.purpose === 'Other' ? 'Please specify the purpose...' : 'Additional notes...'} /></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(4)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!form.employeeId || !form.purpose || (form.purpose === 'Other' && !form.notes.trim())} onClick={handleCreateVisit}>{processing ? <><Loader2 size={14} /> Processing...</> : <>Submit to Backend <ArrowRight size={14} /></>}</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />COMPLETE_REGISTRATION — Confirm</h3></div>
            <div className="card-b">
              <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', padding: 12, border: '1px solid var(--success)', marginBottom: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                  <CheckCircle size={16} /> Face data ready for <strong>{visitorName}</strong>
                </div>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', fontSize: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Visitor Registration Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><span style={{ color: 'var(--text2)' }}>Name: </span><strong>{visitorName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Email: </span><strong>{visitorData.email}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Phone: </span><strong>{visitorData.phone}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Company: </span><strong>{visitorData.company || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Identity: </span><strong>{identityType.replace('_', ' ').toUpperCase()} — {visitorData.identityNumber || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Photo: </span><strong style={{ color: faceResult?.image ? 'var(--success)' : 'var(--text3)' }}>{faceResult?.image ? 'Captured' : 'None'}</strong></div>
                </div>
              </div>
              {faceResult?.image && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <img src={faceResult.image} alt="face" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--primary)' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-s" onClick={() => setStep(5)}>Complete Registration <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />REGISTER_FACE</h3></div>
            <div className="card-b" style={{ textAlign: 'center' }}>
              {faceResult?.image && (
                <div style={{ marginBottom: 16 }}>
                  <img src={faceResult.image} alt="captured" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--primary)' }} />
                </div>
              )}
              {processing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', margin: '20px 0' }}>
                    <Loader2 size={48} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>Extracting face data & registering face...</p>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>The captured face will be processed and registered with the visitor profile via the backend.</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn-o" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
                    <button className="btn-p" onClick={handleRegisterFace}><Shield size={16} /> Register Face</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />CREATE_VISITOR — Visitor Details</h3></div>
            <div className="card-b">
              {processing ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', margin: '20px 0' }}>
                    <Loader2 size={48} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>Saving visitor information...</p>
                </div>
              ) : (
                <>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Info</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">First Name *</label><input className="form-i" value={visitorData.firstName} onChange={e => setVisitorData({ ...visitorData, firstName: e.target.value })} placeholder="John" /></div>
                    <div className="form-g"><label className="form-l">Last Name *</label><input className="form-i" value={visitorData.lastName} onChange={e => setVisitorData({ ...visitorData, lastName: e.target.value })} placeholder="Doe" /></div>
                    <div className="form-g"><label className="form-l">Email *</label><input className="form-i" type="email" value={visitorData.email} onChange={e => setVisitorData({ ...visitorData, email: e.target.value })} placeholder="john@company.com" /></div>
                    <div className="form-g"><label className="form-l">Phone *</label><input className="form-i" value={visitorData.phone} onChange={e => setVisitorData({ ...visitorData, phone: e.target.value })} placeholder="9876543210" /></div>
                    <div className="form-g"><label className="form-l">Company</label><input className="form-i" value={visitorData.company} onChange={e => setVisitorData({ ...visitorData, company: e.target.value })} placeholder="Company name" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-g"><label className="form-l">Identity Type *</label><select className="form-s" value={identityType} onChange={e => setIdentityType(e.target.value)}>{ID_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}</select></div>
                    <div className="form-g"><label className="form-l">ID Number</label><input className="form-i" value={visitorData.identityNumber} onChange={e => setVisitorData({ ...visitorData, identityNumber: e.target.value })} placeholder="ID number" /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                    <button className="btn-o" onClick={() => setStep(1)}><ArrowLeft size={14} /> Back</button>
                    <button className="btn-p" disabled={!visitorData.firstName || !visitorData.lastName || !visitorData.email || !visitorData.phone} onClick={handleCreateVisitor}>Create Visitor <ArrowRight size={14} /></button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><Camera size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />CREATE_MEDIA — Capture Face</h3></div>
            <div className="card-b">
              {!faceResult ? (
                <FaceRecognition mode="capture" label="Position your face and capture for visitor registration" onCapture={(data) => setFaceResult(data)} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, color: 'var(--success)' }}>
                    <CheckCircle size={20} /> <strong>Media Captured Successfully</strong>
                  </div>
                  <img src={faceResult.image} alt="captured" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--success)' }} />
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-o" onClick={() => setFaceResult(null)}>Retake</button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-p" disabled={!faceResult} onClick={() => setStep(2)}>Next <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
