import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from './Toast';

export default function Settings() {
  const [form, setForm] = useState({ company: '', maxVisitHours: 8, requirePhoto: false, autoCheckoutHours: 12 });
  const toast = useToast();

  function handleSave() {
    toast.error('Settings cannot be saved yet because the backend does not provide a settings endpoint.');
  }

  function handleReset() {
    toast.error('Reset is unavailable because the backend does not provide a safe reset endpoint.');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-h"><h3>General Settings</h3></div>
          <div className="card-b">
            <div className="form-g"><label className="form-l">Company Name</label><input className="form-i" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-g"><label className="form-l">Max Visit Hours (auto-alert)</label><input className="form-i" type="number" value={form.maxVisitHours} onChange={e => setForm({ ...form, maxVisitHours: parseInt(e.target.value) || 0 })} /></div>
              <div className="form-g"><label className="form-l">Auto Check-Out Hours</label><input className="form-i" type="number" value={form.autoCheckoutHours} onChange={e => setForm({ ...form, autoCheckoutHours: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="form-g"><label className="form-l">Require Photo on Check-In</label><select className="form-s" value={form.requirePhoto ? 'yes' : 'no'} onChange={e => setForm({ ...form, requirePhoto: e.target.value === 'yes' })}><option value="no">No</option><option value="yes">Yes</option></select></div>
            <button className="btn-p" onClick={handleSave}><Save size={16} /> Save Settings</button>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <div className="card-h"><h3 style={{ color: 'var(--danger)' }}>Danger Zone</h3></div>
          <div className="card-b">
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Resetting application data requires a dedicated backend operation.</p>
            <button className="btn-d" onClick={handleReset}><RotateCcw size={16} /> Reset All Data</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
