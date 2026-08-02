import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserPlus, UserMinus, History,
  ClipboardCheck, BarChart3, Settings, UserCog, User,
  Sun, Moon, Menu, X, LogOut, Image as ImageIcon, ChevronRight, Database
} from 'lucide-react';
import './App.css';
import store from './store';

function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const handler = ({ detail }) => { const id = Date.now(); setItems(current => [...current, { ...detail, id }]); setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 4000); };
    window.addEventListener('vms-toast', handler); return () => window.removeEventListener('vms-toast', handler);
  }, []);
  return <div className="toast-stack">{items.map(item => <div key={item.id} className={`toast ${item.type}`}>{item.message}</div>)}</div>;
}

import Dashboard from './components/Dashboard';
import CheckIn from './components/CheckIn';
import CheckOut from './components/CheckOut';
import VisitorHistory from './components/VisitorHistory';
import PreRegisteredGuests from './components/PreRegisteredGuests';
import Reports from './components/Reports';
import SettingsPage from './components/Settings';
import VisitorProfile from './components/VisitorProfile';
import EmployeeManagement from './components/EmployeeManagement';
import Login from './components/Login';
import Profile from './components/Profile';
import VisitDetails from './components/VisitDetails';
import MediaLibrary from './components/MediaLibrary';

const navItems = [
  { section: 'Overview' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Visitor Flow' },
  { path: '/check-in', icon: UserPlus, label: 'Check In' },
  { path: '/check-out', icon: UserMinus, label: 'Check Out' },
  { path: '/history', icon: History, label: 'Visitor History' },
  { section: 'Management' },
  { path: '/pre-registered', icon: ClipboardCheck, label: 'Pre-Registered' },
  { section: 'Insights' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/employees', icon: UserCog, label: 'Employees' },
  { path: '/media', icon: ImageIcon, label: 'Media Library' },
  { section: 'System' },
  { path: '/profile', icon: User, label: 'My Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const pageTitles = {
  '/': 'Dashboard',
  '/check-in': 'Visitor Check-In',
  '/check-out': 'Visitor Check-Out',
  '/history': 'Visitor History',
  '/pre-registered': 'Pre-Registered Guests',
  '/reports': 'Reports & Analytics',
  '/employees': 'Employee Management',
  '/media': 'Media Library',
  '/profile': 'My Profile',
  '/settings': 'Settings',
};

function Sidebar({ open, onClose }) {
  const profile = store.getProfile();
  const initials = (profile?.name || 'Admin').split(' ').map(word => word[0]).slice(0, 2).join('');
  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon"><Database size={20} /></div>
            <div>
              <p className="logo-text">VMS <span>Control</span></p>
              <p className="logo-sub">Visitor Management System</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}><X size={18} /></button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span className="nav-label">{item.label}</span>
                <ChevronRight className="nav-chevron" size={15} />
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-profile" onClick={onClose}>
            {profile?.avatar ? <span className="sidebar-profile-avatar"><img src={profile.avatar} alt="" /></span> : <span className="sidebar-profile-avatar">{initials}</span>}
            <span className="sidebar-profile-copy"><strong>{profile?.name || 'Administrator'}</strong><small>{profile?.role || 'Administrator'}</small></span>
            <span className="sidebar-online" title="System online" />
            <ChevronRight size={15} />
          </NavLink>
        </div>
      </aside>
    </>
  );
}

function Topbar({ theme, toggleTheme, onMenu, user, onLogout, onOpenProfile }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'VMS';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const profile = store.getProfile();
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu}><Menu size={22} /></button>
      <div className="topbar-title">
        <h1>{title}</h1>
        <p className="topbar-date">{dateStr}</p>
      </div>
      <div className="topbar-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button className="user-chip" title="My Profile" onClick={onOpenProfile}>
          {profile.avatar ? (
            <span className="user-avatar" style={{ overflow: 'hidden', padding: 0 }}><img src={profile.avatar} alt="" style={{ width: 30, height: 30, objectFit: 'cover' }} /></span>
          ) : (
            <span className="user-avatar">{initials}</span>
          )}
          <span className="user-name">{user?.name}</span>
        </button>
        <button className="icon-btn" aria-label="Log out" title="Log out" onClick={onLogout}><LogOut size={16} /></button>
      </div>
    </header>
  );
}

function AppLayout({ onLogout }) {
  const [theme, setTheme] = useState(() => store.getSettings().theme || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const user = store.getAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    store.saveSetting('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          onMenu={() => setSidebarOpen(true)}
          user={user}
          onLogout={() => setShowLogout(true)}
          onOpenProfile={() => navigate('/profile')}
        />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/check-out" element={<CheckOut />} />
              <Route path="/history" element={<VisitorHistory />} />
              <Route path="/pre-registered" element={<PreRegisteredGuests />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/visitor/:id" element={<VisitorProfile />} />
              <Route path="/visit/:visitId" element={<VisitDetails />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><LogOut size={22} /></div>
            <h3>Log out of VMS?</h3>
            <p>Do you want to log out and continue to the sign-in page? Any unsaved changes will be lost.</p>
            <div className="modal-actions">
              <button className="btn-o" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn-p btn-danger" onClick={() => { setShowLogout(false); onLogout(); }}>
                <LogOut size={15} /> Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => store.getAuthUser());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.getSettings().theme || 'light');
  }, []);

  const handleLogout = () => {
    store.logout();
    setAuthUser(null);
  };

  return (
    <Router>
      <Toasts />
      {authUser ? (
        <AppLayout onLogout={handleLogout} />
      ) : (
        <Login onLogin={() => setAuthUser(store.getAuthUser())} />
      )}
    </Router>
  );
}
