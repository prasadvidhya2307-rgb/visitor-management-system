import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Camera, X, Mail, Phone, Briefcase, ShieldCheck, CheckCircle2, Lock, AlertCircle, AlertTriangle } from 'lucide-react';
import store from '../store';
import { changePassword, getMe, notify } from '../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { getMe().then(admin => setProfile({ ...store.getProfile(), email: admin.email, id: admin.id, name: store.getProfile().name || admin.email.split('@')[0], role: 'Administrator', designation: '' })).catch(err => { setPwError(err.message); setProfile(store.getProfile()); }); }, []);

  if (!profile) return <div className="spinner" />;

  const initials = (profile.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('');

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result });
    reader.readAsDataURL(f);
  };

  const requestSave = () => {
    setPwError('');
    const wantsPw = pw.current || pw.next || pw.confirm;
    if (wantsPw) {
      if (!pw.current || !pw.next || !pw.confirm) { setPwError('Fill all three password fields to change your password.'); return; }
      if (pw.next !== pw.confirm) { setPwError('New password and confirm password do not match.'); return; }
    }
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    setSaving(true);
    (async () => { try { if (pw.next) await changePassword(pw.current, pw.next); store.saveProfile(profile); setPw({ current: '', next: '', confirm: '' }); setPwError(''); setSaved(true); notify(pw.next ? 'Password changed successfully.' : 'Profile saved locally.'); setTimeout(() => setSaved(false), 2500); } catch (err) { setPwError(err.message); } finally { setSaving(false); setConfirmOpen(false); } })();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="settings-center">
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div className="card">
          <div className="card-h"><h3>My Profile</h3></div>
          <div className="card-b">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
              <div className="profile-avatar" style={{ position: 'relative' }}>
                {profile.avatar ? <img src={profile.avatar} alt="Profile" /> : <span>{initials}</span>}
                <button type="button" className="profile-camera" title="Change photo" onClick={() => fileRef.current?.click()}>
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 2 }}>{profile.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
                  <ShieldCheck size={14} style={{ color: 'var(--primary)' }} /> {profile.role} · {profile.designation}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn-o btn-sm" onClick={() => fileRef.current?.click()}><Camera size={14} /> {profile.avatar ? 'Change Photo' : 'Add Photo'}</button>
                  {profile.avatar && <button className="btn-o btn-sm" onClick={() => setProfile({ ...profile, avatar: null })}><X size={14} /> Remove Photo</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-g"><label className="form-l"><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email *</label><input className="form-i" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
              <div className="form-g"><label className="form-l"><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone</label><input className="form-i" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="9876543210" /></div>
              <div className="form-g"><label className="form-l">Full Name *</label><input className="form-i" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
              <div className="form-g"><label className="form-l"><Briefcase size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Designation</label><input className="form-i" value={profile.designation} onChange={e => setProfile({ ...profile, designation: e.target.value })} /></div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0', paddingTop: 20 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
                <Lock size={15} style={{ color: 'var(--primary)' }} /> Change Password
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-g"><label className="form-l">Current Password</label><input className="form-i" type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} placeholder="Enter current password" /></div>
                <div className="form-g"><label className="form-l">New Password</label><input className="form-i" type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} placeholder="At least 6 characters" /></div>
                <div className="form-g" style={{ gridColumn: '1 / -1' }}><label className="form-l">Confirm New Password</label><input className="form-i" type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} placeholder="Re-enter new password" /></div>
              </div>
            </div>

            {pwError && (
              <div className="login-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={15} /> {pwError}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <button className="btn-p" onClick={requestSave} disabled={!profile.name || !profile.email}>
                <Save size={16} /> Save Changes
              </button>
              {saved && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>
                  <CheckCircle2 size={15} /> Profile updated
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="modal-overlay" onClick={() => !saving && setConfirmOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><AlertTriangle size={24} /></div>
            <h3>Save changes?</h3>
            <p>Are you sure you want to save the changes to your profile{pw.next ? ' and update your password' : ''}?</p>
            <div className="modal-actions">
              <button className="btn-o" disabled={saving} onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="btn-p" disabled={saving} onClick={confirmSave}>
                {saving ? 'Saving...' : 'Yes, Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
