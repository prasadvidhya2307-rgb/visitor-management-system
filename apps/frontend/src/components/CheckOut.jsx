import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, ArrowRightLeft, UserMinus, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkOut } from '../services/api';
import { loadVisitData } from '../services/data';
import { useToast } from './Toast';
import FaceRecognition from './FaceRecognition';

export default function CheckOut() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeVisits, setActiveVisits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [step, setStep] = useState('list');
  const [faceMatched, setFaceMatched] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const [result, setResult] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [processing, setProcessing] = useState(false);
  const toast = useToast();

  useEffect(() => { refresh(); }, []);

  function refresh() {
    loadVisitData().then(({ visits, visitors, employees }) => { const active = visits.filter((visit) => visit.status === 'checked_in'); setActiveVisits(active); setFiltered(active); setVisitors(visitors); setEmployees(employees); }).catch((err) => toast.error(err.message || 'Unable to load active visitors.'));
  }

  useEffect(() => {
    if (!search.trim()) { setFiltered(activeVisits); return; }
    const q = search.toLowerCase();
    setFiltered(activeVisits.filter(v => {
      const vis = visitors.find((visitor) => visitor.id === v.visitorId);
      return v.token.toLowerCase().includes(q) || vis?.name?.toLowerCase().includes(q);
    }));
  }, [search, activeVisits]);

  function selectVisit(visit) {
    setSelectedVisit(visit);
    setStep('verify');
    setFaceMatched(false);
    setFaceResult(null);
  }

  async function handleFaceMatch(data) {
    setFaceResult(data); setProcessing(true);
    try {
      const response = await checkOut(data.image);
      if (!response.matched || !response.visit) { throw new Error('Face was not recognized or this visitor has no active visit.'); }
      setResult(response); setFaceMatched(true); setStep('done'); toast.success('Visitor checked out successfully.'); refresh();
    } catch (err) { setFaceMatched(false); toast.error(err.message || 'Unable to check out visitor.'); }
    finally { setProcessing(false); }
  }

  function handleFaceFail(data) {
    setFaceMatched(false);
    setFaceResult(data);
  }

  function handleCheckOut() {}

  function goBack() {
    setStep('list');
    setSelectedVisit(null);
    setFaceMatched(false);
    setFaceResult(null);
  }

  const visitorName = selectedVisit ? (visitors.find((visitor) => visitor.id === selectedVisit.visitorId)?.name || 'Unknown') : '';
  const empName = selectedVisit ? (employees.find(e => e.id === selectedVisit.employeeId)?.name || 'N/A') : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <AnimatePresence mode="wait">
        {step === 'done' && result ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-b">
              <div className="success-box">
                <div className="success-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}><UserMinus size={40} /></div>
                <h2>Visitor Checked Out!</h2>
                <p style={{ color: 'var(--text2)', marginBottom: 8 }}>Face verified & check-out complete</p>
                <div className="detail-grid">
                  <div className="detail-item"><div className="lbl">Visitor</div><div className="val">{result.visitor ? `${result.visitor.firstName || ''} ${result.visitor.lastName || ''}`.trim() : visitorName}</div></div>
                  <div className="detail-item"><div className="lbl">Token</div><div className="val">{result.visitor?.visitorCode || '?'}</div></div>
                  <div className="detail-item"><div className="lbl">Check-In</div><div className="val">{new Date(result.visit?.checkInAt).toLocaleTimeString()}</div></div>
                  <div className="detail-item"><div className="lbl">Check-Out</div><div className="val">{new Date(result.visit?.checkOutAt).toLocaleTimeString()}</div></div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}><div className="lbl">Duration</div><div className="val">{Math.round((new Date(result.visit?.checkOutAt) - new Date(result.visit?.checkInAt)) / 3600000 * 10) / 10} hours</div></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                  <button className="btn-p" onClick={() => { setStep('list'); setResult(null); setSelectedVisit(null); }}>Check Out Another</button>
                  <button className="btn-o" onClick={() => navigate('/history')}>View History</button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : step === 'verify' && selectedVisit ? (
          <motion.div key="verify" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <button className="btn-o btn-sm" onClick={goBack}><ArrowLeft size={14} /> Back</button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
                  Face Verification Required
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text2)' }}>Verify your identity to check out</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card">
                <div className="card-h"><h3 style={{ fontSize: 13 }}>Visit Info</h3></div>
                <div className="card-b" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                    <div className="vis-avatar" style={{ width: 40, height: 40 }}>{visitorName.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{visitorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{selectedVisit.token}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, display: 'grid', gap: 6 }}>
                    <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                    <div><span style={{ color: 'var(--text2)' }}>Purpose: </span><strong>{selectedVisit.purpose}</strong></div>

                    <div><span style={{ color: 'var(--text2)' }}>Duration: </span><strong>{Math.round((new Date() - new Date(selectedVisit.checkInTime)) / 3600000 * 10) / 10}h</strong></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h"><h3 style={{ fontSize: 13 }}>Face Recognition</h3></div>
                <div className="card-b" style={{ padding: 16 }}>
                  <FaceRecognition
                    mode="capture"
                    label={processing ? 'Verifying and checking out...' : 'Scan your face to verify identity'}
                    onCapture={(data) => handleFaceMatch(data)}
                  />
                </div>
              </div>
            </div>

            {faceResult && !faceMatched && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ borderColor: 'var(--danger)', marginBottom: 16 }}>
                <div className="card-b" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: 13 }}>Face Not Matched</strong>
                    <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>Confidence: {faceResult.score}%. The captured face does not match the check-in record. Please try again or contact admin.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : step === 'confirm' && selectedVisit ? (
          <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-h"><h3>Confirm Check-Out</h3></div>
            <div className="card-b">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'var(--success-bg)', borderRadius: 'var(--r-sm)', fontSize: 12, color: '#065F46' }}>
                <CheckCircle size={16} /> Face verified successfully ({faceResult?.score}% confidence)
              </div>

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {faceResult?.image && <img src={faceResult.image} alt="face" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--success)' }} />}
              </div>

              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 16, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Check-Out Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: 'var(--text2)' }}>Visitor: </span><strong>{visitorName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Token: </span><strong>{selectedVisit.token}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Host: </span><strong>{empName}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Check-In: </span><strong>{new Date(selectedVisit.checkInTime).toLocaleTimeString()}</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Duration: </span><strong>{Math.round((new Date() - new Date(selectedVisit.checkInTime)) / 3600000 * 10) / 10}h</strong></div>
                  <div><span style={{ color: 'var(--text2)' }}>Face: </span><strong style={{ color: 'var(--success)' }}>✓ Verified</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn-o" onClick={goBack}><ArrowLeft size={14} /> Back</button>
                <button className="btn-d" onClick={handleCheckOut}><ArrowRightLeft size={16} /> Confirm Check-Out</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-b" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                  <Search size={16} className="s-icon" />
                  <input placeholder="Search by token or visitor name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{filtered.length} active visitor{filtered.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="card"><div className="card-b empty"><h3>No Active Visitors</h3><p>No visitors to check out right now.</p></div></div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {filtered.map(v => {
                  const vis = visitors.find((visitor) => visitor.id === v.visitorId);
                  const emp = employees.find(e => e.id === v.employeeId);
                  const dur = Math.round((new Date() - new Date(v.checkInTime)) / 3600000 * 10) / 10;
                  const isOvertime = dur > 8;
                  return (
                    <motion.div key={v.id} className={`vis-card ${isOvertime ? 'overtime' : ''}`} layout>
                      <div className="vis-header">
                        <div className="vis-avatar">{vis?.name?.charAt(0) || '?'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 600 }}>{vis?.name || 'Unknown'}</h4>
                            {isOvertime && <span className="overtime-badge">OVERTIME</span>}
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text2)' }}>{v.token} · {vis?.company || ''}</p>
                        </div>
                        <button className="btn-p" onClick={() => selectVisit(v)}>
                          <ShieldCheck size={14} /> Verify & Check Out
                        </button>
                      </div>
                      <div className="vis-meta">
                        <div><span className="label">Host: </span><span className="value">{emp?.name || 'N/A'}</span></div>
                        <div><span className="label">Purpose: </span><span className="value">{v.purpose}</span></div>
                        <div><span className="label">Check-In: </span><span className="value">{new Date(v.checkInTime).toLocaleTimeString()}</span></div>
                        <div><span className="label">Duration: </span><span className="value">{dur}h</span></div>

                        <div><span className="label">Face ID: </span><span className="value">{v.faceData ? '✓ Stored' : '— None'}</span></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
