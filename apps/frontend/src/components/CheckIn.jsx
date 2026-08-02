import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Camera, User, Shield, ClipboardCheck, Activity, AlertCircle, UserPlus, UserCheck as UserCheckIcon, Search } from 'lucide-react';
import store from '../store';
import { recognizeFace, checkIn, existingVisitorCheckIn } from '../api';
import FaceRecognition from './FaceRecognition';

const ID_TYPES = ['aadhaar', 'pan', 'driving_license', 'passport', 'other'];
const PURPOSES = ['Technical Discussion', 'Interview', 'Business Meeting', 'Contract Negotiation', 'Design Review', 'Training', 'Audit', 'Delivery', 'Maintenance', 'Other'];

const PURPOSE_MAP = {
  'Technical Discussion': 'TECHNICAL_DISCUSSION',
  'Interview': 'INTERVIEW',
  'Business Meeting': 'BUSINESS_MEETING',
  'Contract Negotiation': 'CONTRACT_NEGOTIATION',
  'Design Review': 'DESIGN_REVIEW',
  'Training': 'TRAINING',
  'Audit': 'AUDIT',
  'Delivery': 'DELIVERY',
  'Maintenance': 'MAINTENANCE',
  'Other': 'OTHER',
};

const ID_TYPE_MAP = {
  aadhaar: 'AADHAAR',
  pan: 'PAN',
  driving_license: 'DRIVING_LICENSE',
  passport: 'PASSPORT',
  other: 'OTHER',
};

export default function CheckIn() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState([]);

  const [faceResult, setFaceResult] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  const [visitorMode, setVisitorMode] = useState(null); // 'recognized' | 'new' | 'preregistered'

  // Recognized visitor data from API
  const [recognizedVisitor, setRecognizedVisitor] = useState(null);

  // New visitor form
  const [visitorData, setVisitorData] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
  const [identityType, setIdentityType] = useState('aadhaar');

  // Pre-registered form
  const [preregAadhar, setPreregAadhar] = useState('');
  const [preregPurpose, setPreregPurpose] = useState('');
  const [foundPreregGuest, setFoundPreregGuest] = useState(null);
  const [preregSearchError, setPreregSearchError] = useState('');

  // Visit details (shared across all modes)
  const [form, setForm] = useState({ employeeId: '', purpose: '', notes: '' });

  // Submission
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');

  useEffect(() => { setEmployees(store.getEmployees()); }, []);

  function getVisitorName() {
    if (visitorMode === 'recognized' && recognizedVisitor) {
      return `${recognizedVisitor.firstName || ''} ${recognizedVisitor.lastName || ''}`.trim() || recognizedVisitor.name || 'Visitor';
    }
    if (visitorMode === 'preregistered' && foundPreregGuest) {
      return foundPreregGuest.name || 'Pre-registered Guest';
    }
    return `${visitorData.firstName} ${visitorData.lastName}`.trim() || 'Visitor';
  }

  const visitorName = getVisitorName();
  const empName = employees.find(e => e.id === form.employeeId)?.name || '';
  const checkInDate = result ? new Date(result.checkInTime || result.createdAt) : new Date();

  // --- Step 1: Capture Face & Auto-Recognize ---
  function handleFaceCaptured(data) {
    setFaceResult(data);
  }

  function proceedToRecognize() {
    setStep(2);
    setRecognizing(true);
    setRecognitionError('');
    recognizeFace(faceResult.image)
      .then(data => {
        setRecognizing(false);
        if (!data.success) {
          setRecognitionError(data.message || 'Recognition failed');
          store.addFailedRegister({ attempt: 'face_recognition', reason: data.message || 'Recognition failed', detail: 'Face recognition API returned an error' });
          setVisitorMode(null);
        } else if (data.data?.code === 'MATCH_FOUND' && data.data?.visitor) {
          setRecognizedVisitor(data.data.visitor);
          setVisitorMode('recognized');
        } else {
          setRecognitionError(data.message || 'No matching visitor found');
          setVisitorMode(null);
        }
        setStep(3);
      })
      .catch(err => {
        setRecognizing(false);
        setRecognitionError(err.message || 'Recognition failed');
        store.addFailedRegister({ attempt: 'face_recognition', reason: err.message || 'Recognition failed', detail: 'Face recognition API request failed' });
        setVisitorMode(null);
        setStep(3);
      });
  }

  // --- Step 3b / 4: New Visitor form ---
  const stepLabels = ['Capture', 'Recognize', 'Register', 'Confirm', 'Visit', 'Submit', 'Done'];
  const stepMap = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 7 };
  const currentStepNum = stepMap[step] || 1;

  function handleCreateVisitor() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(5);
    }, 800);
  }

  // --- Step 4: Pre-registered search ---
  function handleSearchPrereg() {
    setPreregSearchError('');
    if (!preregAadhar.trim()) { setPreregSearchError('Please enter Aadhar number'); return; }
    const preregGuests = store.getPreRegistered();
    let match = preregGuests.find(g =>
      g.identityType === 'aadhaar' && g.identityNumber === preregAadhar.trim()
    );
    if (!match) {
      const allVisitors = store.getAllVisitors();
      match = allVisitors.find(v =>
        v.identityType === 'aadhaar' && v.identityNumber === preregAadhar.trim()
      );
    }
    if (match) {
      setFoundPreregGuest(match);
      setStep(5);
    } else {
      setPreregSearchError('No pre-registered guest found with this Aadhar number');
    }
  }

  // --- Step 5: Register face (new only) ---
  function handleRegisterFace() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(6);
    }, 1000);
  }

  // --- Step 7: Submit to backend ---
  async function handleSubmitVisit() {
    setProcessing(true);
    setApiError('');

    let vData, vPurpose, visitorId;
    if (visitorMode === 'recognized' && recognizedVisitor) {
      visitorId = recognizedVisitor.id;
      vPurpose = form.purpose;
    } else if (visitorMode === 'preregistered' && foundPreregGuest) {
      vData = {
        firstName: foundPreregGuest.name?.split(' ')[0] || '',
        lastName: foundPreregGuest.name?.split(' ').slice(1).join(' ') || '',
        identityType: foundPreregGuest.identityType || 'AADHAAR',
        identityNumber: foundPreregGuest.identityNumber || preregAadhar,
        emails: [{ email: foundPreregGuest.email || '', isPrimary: true }],
        mobiles: [{ mobile: foundPreregGuest.phone || '', isPrimary: true }],
      };
      vPurpose = preregPurpose;
    } else {
      vData = {
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        identityType: ID_TYPE_MAP[identityType] || 'OTHER',
        identityNumber: visitorData.identityNumber || '',
        emails: [{ email: visitorData.email, isPrimary: true }],
        mobiles: [{ mobile: visitorData.phone || '', isPrimary: true }],
      };
      vPurpose = form.purpose;
    }

    const visitPayload = {
      hostEmployeeId: form.employeeId,
      purpose: PURPOSE_MAP[vPurpose] || vPurpose?.toUpperCase().replace(/ /g, '_') || '',
      floor: 0,
    };
    try {
      let data;
      if (visitorId) {
        data = await existingVisitorCheckIn(visitorId, visitPayload);
      } else {
        data = await checkIn(vData, visitPayload, faceResult.image);
      }
      setResult(data);
      setStep(8);
    } catch (err) {
      setApiError(err.message);
      store.addFailedRegister({ name: visitorName || null, attempt: 'check_in', reason: err.message || 'Check-in failed', detail: 'Check-in submission failed' });
      setStep(8);
    } finally {
      setProcessing(false);
    }
  }

  function resetAll() {
    setStep(1);
    setVisitorMode(null);
    setFaceResult(null);
    setRecognizedVisitor(null);
    setRecognizing(false);
    setRecognitionError('');
    setVisitorData({ firstName: '', lastName: '', email: '', phone: '', company: '', identityNumber: '' });
    setIdentityType('aadhaar');
    setPreregAadhar('');
    setPreregPurpose('');
    setFoundPreregGuest(null);
    setPreregSearchError('');
    setForm({ employeeId: '', purpose: '', notes: '' });
    setResult(null);
    setProcessing(false);
    setApiError('');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="steps" style={{ marginBottom: 16 }}>
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
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{stepLabels[currentStepNum - 1]}</span>
      </div>

      <AnimatePresence mode="wait">

        {/* === STEP 9: SUCCESS === */}
        {step === 9 && (
          <motion.div key="s9" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-b">
              <div className="success-box">
                <div className="success-icon"><CheckCircle size={40} /></div>
                <h2>Check-in Complete</h2>
                <p style={{ color: 'var(--text2)' }}>{result ? result.message || 'Visitor checked in successfully' : 'Done'}</p>
                <div className="detail-grid">
                  <div className="detail-item"><div className="lbl">Visitor</div><div className="val">{visitorName}</div></div>
                  <div className="detail-item"><div className="lbl">Host</div><div className="val">{empName}</div></div>
                  <div className="detail-item"><div className="lbl">Purpose</div><div className="val">{form.purpose || preregPurpose}</div></div>
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

        {/* === STEP 8: SUBMIT / API RESULT === */}
        {step === 8 && (
          <motion.div key="s8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-h"><h3><Activity size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Submitting to Backend</h3></div>
            <div className="card-b" style={{ textAlign: 'center' }}>
              {processing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', margin: '20px 0' }}>
                    <Loader2 size={48} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sending to backend...</p>
                </>
              ) : apiError ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16, color: 'var(--danger)' }}>
                    <AlertCircle size={24} /> <strong>API Error</strong>
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>{apiError}</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn-d" onClick={handleSubmitVisit}>Retry</button>
                    <button className="btn-o" onClick={() => setStep(7)}>Back</button>
                  </div>
                </>
              ) : result ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, color: 'var(--success)' }}>
                    <CheckCircle size={24} /> <strong>Check-in Successful</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', textAlign: 'left', fontSize: 12 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div><span style={{ color: 'var(--text2)' }}>ID: </span><strong>{result.id || result.workflow?.id || '—'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Status: </span><strong>{result.status || result.workflow?.status || '—'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Visitor: </span><strong>{visitorName}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{form.purpose || preregPurpose}</strong></div>
                    </div>
                  </div>
                  <button className="btn-s" style={{ marginTop: 16 }} onClick={() => setStep(9)}>Continue <ArrowRight size={16} /></button>
                </>
              ) : (
                <p style={{ color: 'var(--text2)', fontSize: 13 }}>No response from server.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* === STEP 7: VISIT DETAILS (shared) === */}
        {step === 7 && (
          <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><ClipboardCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Visit Details</h3></div>
            <div className="card-b">
              <div className="form-g"><label className="form-l">Host Employee *</label><select className="form-s" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}><option value="">Select host...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></div>
              {visitorMode !== 'preregistered' && (
                <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              )}
              {visitorMode === 'preregistered' && (
                <div className="form-g"><label className="form-l">Purpose</label><input className="form-i" value={preregPurpose} disabled style={{ opacity: 0.7 }} /></div>
              )}
              <div className="form-g"><label className="form-l">Notes</label><textarea className="form-i" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>
                <CheckCircle size={14} style={{ color: 'var(--success)' }} /> Badge will be printed automatically
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={() => {
                  if (visitorMode === 'recognized') setStep(3);
                  else if (visitorMode === 'preregistered') setStep(5);
                  else setStep(6);
                }}><ArrowLeft size={14} /> Back</button>
                <button className="btn-p" disabled={!form.employeeId || (visitorMode !== 'preregistered' && !form.purpose)} onClick={handleSubmitVisit}>{processing ? <><Loader2 size={14} /> Processing...</> : <>Submit <ArrowRight size={14} /></>}</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === STEP 6: CONFIRM (new visitor only) === */}
        {step === 6 && visitorMode === 'new' && (
          <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Confirm Registration</h3></div>
            <div className="card-b">
              <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', padding: 12, border: '1px solid var(--success)', marginBottom: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                  <CheckCircle size={16} /> Face captured for <strong>{visitorName}</strong>
                </div>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', fontSize: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Visitor Summary</h4>
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
                <button className="btn-o" onClick={() => setStep(5)}><ArrowLeft size={14} /> Back</button>
                <button className="btn-s" onClick={() => setStep(7)}>Proceed to Visit <ArrowRight size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {/* === STEP 5: Register Face (new) / Confirm Pre-registered === */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            {visitorMode === 'new' && (
              <>
                <div className="card-h"><h3><Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Register Face</h3></div>
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
                      <p style={{ color: 'var(--text2)', fontSize: 14 }}>Registering face data...</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>The captured face will be processed and linked to the visitor profile.</p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn-o" onClick={() => setStep(4)}><ArrowLeft size={14} /> Back</button>
                        <button className="btn-p" onClick={handleRegisterFace}><Shield size={16} /> Register Face</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {visitorMode === 'preregistered' && foundPreregGuest && (
              <>
                <div className="card-h"><h3><UserCheckIcon size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Pre-registered Guest Found</h3></div>
                <div className="card-b">
                  <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', padding: 12, border: '1px solid var(--success)', marginBottom: 16, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                      <UserCheckIcon size={16} /> Guest details matched
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', fontSize: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><span style={{ color: 'var(--text2)' }}>Name: </span><strong>{foundPreregGuest.name}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Email: </span><strong>{foundPreregGuest.email || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Phone: </span><strong>{foundPreregGuest.phone || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Company: </span><strong>{foundPreregGuest.company || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Aadhar: </span><strong>{foundPreregGuest.identityNumber || preregAadhar}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{preregPurpose}</strong></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                    <button className="btn-o" onClick={() => { setFoundPreregGuest(null); setStep(4); }}><ArrowLeft size={14} /> Back</button>
                    <button className="btn-p" onClick={() => setStep(7)}>Continue to Visit <ArrowRight size={14} /></button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* === STEP 4: FORM - New Visitor or Pre-registered === */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            {visitorMode === 'new' && (
              <>
                <div className="card-h"><h3><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />New Visitor — Details</h3></div>
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
                        <button className="btn-o" onClick={() => { setVisitorMode(null); setStep(3); }}><ArrowLeft size={14} /> Back</button>
                        <button className="btn-p" disabled={!visitorData.firstName || !visitorData.lastName || !visitorData.email || !visitorData.phone} onClick={handleCreateVisitor}>Next <ArrowRight size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {visitorMode === 'preregistered' && (
              <>
                <div className="card-h"><h3><Search size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Pre-registered Guest</h3></div>
                <div className="card-b">
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Enter your Aadhar number and purpose to look up your pre-registered details.</p>
                  <div className="form-g"><label className="form-l">Aadhar Number *</label><input className="form-i" value={preregAadhar} onChange={e => setPreregAadhar(e.target.value)} placeholder="1234-5678-9012" /></div>
                  <div className="form-g"><label className="form-l">Purpose *</label><select className="form-s" value={preregPurpose} onChange={e => setPreregPurpose(e.target.value)}><option value="">Select purpose...</option>{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  {preregSearchError && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{preregSearchError}</p>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                    <button className="btn-o" onClick={() => { setVisitorMode(null); setStep(3); }}><ArrowLeft size={14} /> Back</button>
                    <button className="btn-p" disabled={!preregAadhar.trim() || !preregPurpose} onClick={handleSearchPrereg}><Search size={14} /> Find Guest</button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* === STEP 3: DECISION === */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            {visitorMode === 'recognized' && recognizedVisitor ? (
              <>
                <div className="card-h"><h3><UserCheckIcon size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Welcome Back!</h3></div>
                <div className="card-b">
                  <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', padding: 12, border: '1px solid var(--success)', marginBottom: 16, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                      <UserCheckIcon size={16} /> Face recognized — existing visitor
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)', fontSize: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Visitor Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><span style={{ color: 'var(--text2)' }}>Name: </span><strong>{recognizedVisitor.firstName || ''} {recognizedVisitor.lastName || ''}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Visitor Code: </span><strong>{recognizedVisitor.visitorCode || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Email: </span><strong>{typeof recognizedVisitor.emails?.[0] === 'string' ? recognizedVisitor.emails[0] : (recognizedVisitor.emails?.[0]?.email || 'N/A')}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Mobile: </span><strong>{typeof recognizedVisitor.mobiles?.[0] === 'string' ? recognizedVisitor.mobiles[0] : (recognizedVisitor.mobiles?.[0]?.mobile || 'N/A')}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Identity: </span><strong>{recognizedVisitor.identityType || ''} — {recognizedVisitor.identityNumber || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text2)' }}>Status: </span><strong>{recognizedVisitor.registrationStatus || 'N/A'}</strong></div>
                    </div>
                  </div>
                  {faceResult?.image && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <img src={faceResult.image} alt="face" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--success)' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="btn-o" onClick={() => { setRecognizedVisitor(null); setVisitorMode(null); setStep(1); }}>Cancel</button>
                    <button className="btn-p" onClick={() => setStep(7)}>Continue to Check-in <ArrowRight size={14} /></button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="card-h"><h3><AlertCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Face Not Recognized</h3></div>
                <div className="card-b" style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 16 }}>
                    <img src={faceResult.image} alt="captured" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--warning)' }} />
                  </div>
                  {recognitionError && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{recognitionError}</p>}
                  <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>This face was not found in our records. How would you like to proceed?</p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-p" onClick={() => { setVisitorMode('new'); setStep(4); }}>
                      <UserPlus size={16} style={{ marginRight: 6 }} /> New Visitor
                    </button>
                    <button className="btn-s" onClick={() => { setVisitorMode('preregistered'); setStep(4); }}>
                      <Search size={16} style={{ marginRight: 6 }} /> Pre-registered Guest
                    </button>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="btn-o" onClick={() => { setVisitorMode(null); setRecognitionError(''); setStep(1); }}>
                      <ArrowLeft size={14} /> Retake Photo
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* === STEP 2: RECOGNIZING (loading) === */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-h"><h3><Camera size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Recognizing Face</h3></div>
            <div className="card-b" style={{ textAlign: 'center', padding: 40 }}>
              {faceResult?.image && (
                <div style={{ marginBottom: 20 }}>
                  <img src={faceResult.image} alt="captured" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 12 }} />
                </div>
              )}
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ display: 'inline-block', margin: '20px 0' }}>
                <Loader2 size={48} style={{ color: 'var(--primary)' }} />
              </motion.div>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Checking face against records...</p>
            </div>
          </motion.div>
        )}

        {/* === STEP 1: CAPTURE FACE === */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-h"><h3><Camera size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Capture Face</h3></div>
            <div className="card-b">
              {!faceResult ? (
                <FaceRecognition mode="capture" label="Position your face and capture to check in" onCapture={handleFaceCaptured} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, color: 'var(--success)' }}>
                    <CheckCircle size={20} /> <strong>Face Captured</strong>
                  </div>
                  <img src={faceResult.image} alt="captured" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--success)' }} />
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-o" onClick={() => setFaceResult(null)}>Retake</button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-p" disabled={!faceResult} onClick={proceedToRecognize}>
                  Recognize Face <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
