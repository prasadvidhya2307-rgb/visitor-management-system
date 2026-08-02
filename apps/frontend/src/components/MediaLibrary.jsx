import React, { useEffect, useState } from 'react';
import { Image, Search, User, UserCog, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllMedia, getMediaObjectUrl, notify } from '../api';

function MediaCard({ item, onOpen }) {
  const visitor = item.visitors?.[0];
  const visit = item.checkInVisit || item.checkOutVisit;
  const title = visitor ? `${visitor.firstName} ${visitor.lastName || ''}` : item.adminProfile ? (item.adminProfile.fullName || item.adminProfile.email) : item.employeeProfile ? `${item.employeeProfile.firstName} ${item.employeeProfile.lastName}` : visit ? `Visit media` : 'System media';
  const relation = item.checkInVisit ? 'Check-in image' : item.checkOutVisit ? 'Check-out image' : item.adminProfile ? 'Admin profile image' : item.employeeProfile ? 'Employee profile image' : visitor ? 'Visitor registration image' : 'Workflow image';
  return <button type="button" onClick={() => onOpen(item)} className="card media-card" style={{ textAlign: 'left', color: 'inherit', cursor: visit || visitor ? 'pointer' : 'default', padding: 0, overflow: 'hidden' }}>
    {item.url ? <img src={item.url} alt={title} style={{ width: '100%', height: 210, objectFit: 'cover' }} /> : <div className="empty" style={{ height: 210 }}><Image size={40} /></div>}
    <div className="card-b"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><h3>{title}</h3><p style={{ color: 'var(--primary)', fontSize: 12, marginTop: 4 }}>{visitor?.visitorCode || relation}</p></div><span className="badge active">{item.status}</span></div><p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 10 }}>{relation}</p><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--text2)' }}><span>{item.mimeType}</span><span>{(Number(item.fileSize) / 1024).toFixed(1)} KB</span></div><p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>{new Date(item.createdAt).toLocaleString()}</p></div>
  </button>;
}

export default function MediaLibrary() {
  const navigate = useNavigate(); const [items, setItems] = useState([]); const [search, setSearch] = useState('');
  useEffect(() => { let urls = []; getAllMedia().then(async rows => { const hydrated = await Promise.all(rows.map(async row => { try { const url = await getMediaObjectUrl(row.id); urls.push(url); return { ...row, url }; } catch { return row; } })); setItems(hydrated); }).catch(err => notify(err.message, 'error')); return () => urls.forEach(URL.revokeObjectURL); }, []);
  const matches = item => { const visitor = item.visitors?.[0]; return [visitor?.firstName, visitor?.lastName, visitor?.visitorCode, item.adminProfile?.fullName, item.adminProfile?.email, item.employeeProfile?.firstName, item.employeeProfile?.lastName].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase()); };
  const filtered = items.filter(matches);
  const sections = [
    { title: 'Visitor Media', icon: User, rows: filtered.filter(item => item.visitors?.length) },
    { title: 'Visit Media', icon: CalendarDays, rows: filtered.filter(item => item.checkInVisit || item.checkOutVisit) },
    { title: 'Admin Media', icon: UserCog, rows: filtered.filter(item => item.adminProfile) },
    { title: 'Employee Media', icon: UserCog, rows: filtered.filter(item => item.employeeProfile) },
  ];
  const open = item => { const visit = item.checkInVisit || item.checkOutVisit; if (visit) navigate(`/visit/${visit.id}`); else if (item.visitors?.[0]) navigate(`/visitor/${item.visitors[0].id}`); };
  return <div className="media-library"><div className="media-search" style={{ position: 'relative', maxWidth: 520, marginBottom: 22 }}><Search size={17} style={{ position: 'absolute', left: 13, top: 12 }} /><input className="form-i" style={{ paddingLeft: 40 }} placeholder="Search by name or visitor code..." value={search} onChange={e => setSearch(e.target.value)} /></div>{sections.map(section => { const Icon = section.icon; return <section key={section.title} style={{ marginBottom: 26 }}><h3 className="media-section-title"><span className="media-section-icon"><Icon size={15} /></span>{section.title}<span className="media-count">{section.rows.length}</span></h3>{section.rows.length ? <div className="media-grid">{section.rows.map(item => <MediaCard key={`${section.title}-${item.id}`} item={item} onOpen={open} />)}</div> : <div className="media-empty">No matching media.</div>}</section>; })}</div>;
}
