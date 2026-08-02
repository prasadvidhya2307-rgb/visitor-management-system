import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, Loader2,
  Fingerprint, Clock, ClipboardCheck, AlertCircle
} from 'lucide-react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (onLogin) onLogin(user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: Fingerprint, label: 'AI Face Recognition check-in' },
    { icon: Clock, label: 'Real-time visitor tracking' },
    { icon: ClipboardCheck, label: 'Pre-registration & badging' },
  ];

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <div className="login-brand-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="login-logo">
              <div className="logo-icon"><ShieldCheck size={22} /></div>
              <div>
                <p className="logo-text">VMS</p>
                <p className="logo-sub" style={{ color: 'rgba(255,255,255,.8)' }}>Visitor Management</p>
              </div>
            </div>
            <h1 className="login-headline">Smart Visitor Management</h1>
            <p className="login-tagline">
              Streamline check-ins, track visitors in real time, and keep your premises safe — all in one dashboard.
            </p>
          </motion.div>

          <div className="login-features">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} className="login-feature" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
                  <div className="login-feature-icon"><Icon size={17} /></div>
                  <span>{f.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <motion.div className="login-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to continue to your dashboard</p>

          <form onSubmit={submit} noValidate>
            <div className="form-g">
              <label className="form-l">Email Address</label>
              <div className="input-group">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  className="form-i input-pad"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-g">
              <label className="form-l">Password</label>
              <div className="input-group">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  className="form-i input-pad"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-row">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button className="btn-p login-btn" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
