import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMediaObjectUrl, getVisit, notify } from '../api';

function VisitImage({ mediaId, label }) {
  const [src, setSrc] = useState(null);
  useEffect(() => { let url; if (mediaId) getMediaObjectUrl(mediaId).then(value => { url = value; setSrc(value); }).catch(err => notify(err.message, 'error')); return () => { if (url) URL.revokeObjectURL(url); }; }, [mediaId]);
  return <div className="card"><div className="card-h"><h3>{label}</h3></div><div className="card-b">{src ? <img src={src} alt={label} style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 8 }} /> : <p style={{ color: 'var(--text2)' }}>No image recorded.</p>}</div></div>;
}

export default function VisitDetails() {
  const { visitId } = useParams(); const navigate = useNavigate(); const [visit, setVisit] = useState(null);
  useEffect(() => { getVisit(visitId).then(setVisit).catch(err => notify(err.message, 'error')); }, [visitId]);
  if (!visit) return <div className="spinner" />;
  return <div>
    <button className="btn-o" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>
    <div className="card" style={{ marginBottom: 16 }}><div className="card-h"><h3>Visit Details</h3></div><div className="card-b" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div><b>Visit ID:</b> {visit.id}</div><div><b>Visitor Code:</b> {visit.token}</div><div><b>Status:</b> {visit.status.replace('_', ' ')}</div><div><b>Purpose:</b> {visit.purpose}</div><div><b>Host:</b> {visit.host?.name || 'N/A'}</div><div><b>Floor:</b> {visit.floor}</div><div><b>Check-in:</b> {new Date(visit.checkInTime).toLocaleString()}</div><div><b>Check-out:</b> {visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleString() : 'Active'}</div><div style={{ gridColumn: '1 / -1' }}><b>Notes:</b> {visit.notes || 'None'}</div>
    </div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><VisitImage mediaId={visit.checkInImageId} label="Check-in Image" /><VisitImage mediaId={visit.checkOutImageId} label="Check-out Image" /></div>
  </div>;
}
