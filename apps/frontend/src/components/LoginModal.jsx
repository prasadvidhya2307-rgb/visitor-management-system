import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/api';
import { useToast } from './Toast';

export default function LoginModal({ onSuccess }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      toast.success('Logged in successfully.');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.message || 'Login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <motion.div
        className="login-box"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="login-header">
          <div className="logo-icon"><ShieldCheck size={24} /></div>
          <h2>Visitor Management</h2>
          <p>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-g">
            <label className="form-l">Email</label>
            <input className="form-i" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-g">
            <label className="form-l">Password</label>
            <div className="pass-wrap">
              <input className="form-i pass-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="pass-toggle" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="login-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button className="btn-p login-btn" type="submit" disabled={loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
