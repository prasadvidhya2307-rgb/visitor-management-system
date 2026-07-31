import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRightLeft, CheckCircle, Loader2, RotateCcw, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkOut, getEmployees, getVisitors, getVisits, recognizeFace, visitIsCheckedOut } from '../api';
import FaceRecognition from './FaceRecognition';

const nameOf = person => [person?.firstName, person?.lastName].filter(Boolean).join(' ') || 'Visitor';
const text = value => value ? String(value).replace(/_/g, ' ') : 'â€”';

export default function CheckOut() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stage, setStage] = useState('list');
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const loadActiveVisits = async () => {
    setError('');
    try {
      const [allVisits, visitors, employees] = await Promise.all([getVisits(), getVisitors(), getEmployees()]);
      const visitorById = new Map(visitors.map(visitor => [visitor.id, visitor]));
      const employeeById = new Map(employees.map(employee => [employee.id, employee]));
      setVisits(allVisits.filter(visit => !visitIsCheckedOut(visit)).map(visit => ({ ...visit, visitor: visitorById.get(visit.visitorId), employee: employeeById.get(visit.hostEmployeeId) })));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load checked-in visitors.');
    }
  };

  useEffect(() => { loadActiveVisits(); }, []);

  const startVerification = visit => {
    setSelected(visit); setCapturedImage(null); setError(''); setStage('verify');
  };

  const verifyFace = async capture => {
    setCapturedImage(capture.image); setStage('verifying'); setError('');
    try {
      const response = await recognizeFace(capture.image);
      const matchedVisitor = response?.data?.visitor;
      if (!matchedVisitor?.id) throw new Error(response?.message || response?.messaage || 'Face was not recognized.');
      if (matchedVisitor.id !== selected.visitorId) throw new Error('The recognized face does not match the selected visitor.');
      setStage('verified');
    } catch (requestError) {
      setError(requestError.message || 'Face verification failed.'); setStage('verify');
    }
  };

  const completeCheckout = async () => {
    setStage('checking-out'); setError('');
    try {
      const data = await checkOut(capturedImage);
      if (!data?.visitor || !data?.visit) throw new Error(data?.message || 'The visitor could not be checked out.');
      setResult(data); setStage('complete');
    } catch (requestError) {
      setError(requestError.message || 'Checkout failed. Please try again.'); setStage('verified');
    }
  };

  const reset = () => { setSelected(null); setCapturedImage(null); setResult(null); setError(''); setStage('list'); loadActiveVisits(); };
  const completedVisit = result?.visit;

  if (stage === 'complete') return <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: 560, margin: '0 auto' }}><div className="card-b"><div className="success-box"><motion.div className="success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><UserMinus size={40} /></motion.div><h2>Visitor Checked Out</h2><p style={{ color: 'var(--text2)', marginBottom: 16 }}>Face verification was successful and the visit is now complete.</p><div className="detail-grid"><div className="detail-item"><div className="lbl">Visitor</div><div className="val">{nameOf(result?.visitor)}</div></div><div className="detail-item"><div className="lbl">Check-In</div><div className="val">{completedVisit?.checkInAt ? new Date(completedVisit.checkInAt).toLocaleTimeString() : 'â€”'}</div></div><div className="detail-item"><div className="lbl">Check-Out</div><div className="val">{completedVisit?.checkOutAt ? new Date(completedVisit.checkOutAt).toLocaleTimeString() : 'â€”'}</div></div><div className="detail-item"><div className="lbl">Purpose</div><div className="val">{text(completedVisit?.purpose)}</div></div></div><div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}><button className="btn-p" onClick={reset}>Back to Active Visitors</button><button className="btn-o" onClick={() => navigate('/history')}>View History</button></div></div></div></motion.div>;

  if (selected) return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: 760, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div><h2 style={{ margin: 0, fontSize: 22 }}>Verify visitor checkout</h2><p style={{ margin: '5px 0 0', color: 'var(--text2)', fontSize: 13 }}>Confirm the identity of {nameOf(selected.visitor)} before checkout.</p></div><button className="btn-o" onClick={reset}>Back to list</button></div>
    <div className="card"><div className="card-h"><h3>{nameOf(selected.visitor)}</h3><span className="badge active">Checked in</span></div><div className="card-b"><div className="detail-grid" style={{ marginBottom: 22 }}><div className="detail-item"><div className="lbl">Host</div><div className="val">{nameOf(selected.employee)}</div></div><div className="detail-item"><div className="lbl">Purpose</div><div className="val">{text(selected.purpose)}</div></div><div className="detail-item"><div className="lbl">Check-in time</div><div className="val">{selected.checkInAt ? new Date(selected.checkInAt).toLocaleString() : '—'}</div></div></div>{stage === 'verify' && <FaceRecognition mode="capture" label="Start camera to verify this visitor" onCapture={verifyFace} />}{stage === 'verifying' && <div style={{ textAlign: 'center', padding: 54 }}><Loader2 size={40} className="spin" /><p>Verifying face recognition…</p></div>}{stage === 'verified' && <div className="success-box"><CheckCircle size={40} style={{ color: 'var(--success)' }} /><h3>Face verified</h3><p style={{ color: 'var(--text2)' }}>The face matches {nameOf(selected.visitor)}. Confirm to check out this visitor.</p><button className="btn-p" onClick={completeCheckout}>Check Out Visitor</button></div>}{stage === 'checking-out' && <div style={{ textAlign: 'center', padding: 54 }}><Loader2 size={40} className="spin" /><p>Completing checkout…</p></div>}{error && <div style={{ display: 'flex', gap: 10, marginTop: 18, padding: 14, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)' }}><AlertCircle size={20} /><div><strong>Verification not complete</strong><p style={{ color: 'var(--text2)', fontSize: 12, margin: '4px 0 0' }}>{error}</p>{stage === 'verify' && <button className="btn-o btn-sm" style={{ marginTop: 10 }} onClick={() => { setError(''); setCapturedImage(null); }}><RotateCcw size={13} /> Try again</button>}</div></div>}</div></div>
  </motion.div>;
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <div className="card" style={{ marginBottom: 16 }}><div className="card-h"><h3><ArrowRightLeft size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Checked-In Visitors</h3><span style={{ color: 'var(--text2)', fontSize: 13 }}>{visits.length} active</span></div><div className="card-b" style={{ padding: 0, overflowX: 'auto' }}><table className="tbl"><thead><tr><th>Visitor</th><th>Host</th><th>Purpose</th><th>Checked In</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead><tbody>{visits.map(visit => <tr key={visit.id}><td><div className="vis-row"><div className="vis-av">{nameOf(visit.visitor).charAt(0)}</div><div className="vis-info"><h4>{nameOf(visit.visitor)}</h4><p>{visit.visitor?.visitorCode || ''}</p></div></div></td><td>{nameOf(visit.employee)}</td><td>{text(visit.purpose)}</td><td>{visit.checkInAt ? new Date(visit.checkInAt).toLocaleString() : 'â€”'}</td><td style={{ textAlign: 'right' }}><button className="btn-p btn-sm" onClick={() => startVerification(visit)}>Verify & Checkout</button></td></tr>)}{!visits.length && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No visitors are currently checked in.</td></tr>}</tbody></table></div></div>
    {selected && <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}><div className="card-h"><h3>Verify {nameOf(selected.visitor)}</h3><button className="btn-o btn-sm" onClick={reset}>Cancel</button></div><div className="card-b"><p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 18px' }}>Verify the selected visitor's face before completing checkout.</p>{stage === 'verify' && <FaceRecognition mode="capture" label="Start camera to verify this visitor" onCapture={verifyFace} />}{stage === 'verifying' && <div style={{ textAlign: 'center', padding: 32 }}><Loader2 size={40} className="spin" /><p>Verifying face recognitionâ€¦</p></div>}{stage === 'verified' && <div className="success-box"><CheckCircle size={40} style={{ color: 'var(--success)' }} /><h3>Face verified</h3><p style={{ color: 'var(--text2)' }}>The face matches {nameOf(selected.visitor)}. Confirm to check out this visitor.</p><button className="btn-p" onClick={completeCheckout}>Check Out Visitor</button></div>}{stage === 'checking-out' && <div style={{ textAlign: 'center', padding: 32 }}><Loader2 size={40} className="spin" /><p>Completing checkoutâ€¦</p></div>}{error && <div style={{ display: 'flex', gap: 10, marginTop: 18, padding: 14, borderRadius: 8, background: 'var(--danger-bg)', color: 'var(--danger)' }}><AlertCircle size={20} /><div><strong>Verification not complete</strong><p style={{ color: 'var(--text2)', fontSize: 12, margin: '4px 0 0' }}>{error}</p>{stage === 'verify' && <button className="btn-o btn-sm" style={{ marginTop: 10 }} onClick={() => { setError(''); setCapturedImage(null); }}><RotateCcw size={13} /> Try again</button>}</div></div>}</div></div>}
  </motion.div>;
}