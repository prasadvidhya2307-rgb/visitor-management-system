import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserPlus, UserMinus, History, Users,
  CalendarClock, ClipboardCheck, BarChart3, Settings, UserCog,
  Sun, Moon, Menu, X, ShieldCheck
} from 'lucide-react';
import './App.css';
import store from './store';

import Dashboard from './components/Dashboard';
import CheckIn from './components/CheckIn';
import CheckOut from './components/CheckOut';
import VisitorHistory from './components/VisitorHistory';
import ActiveVisitors from './components/ActiveVisitors';
import ExpectedVisitors from './components/ExpectedVisitors';
import PreRegisteredGuests from './components/PreRegisteredGuests';
import Reports from './components/Reports';
import SettingsPage from './components/Settings';
import VisitorProfile from './components/VisitorProfile';
import EmployeeManagement from './components/EmployeeManagement';

const navItems = [
  { section: 'Overview' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Visitor Flow' },
  { path: '/check-in', icon: UserPlus, label: 'Check In' },
  { path: '/check-out', icon: UserMinus, label: 'Check Out' },
  { path: '/history', icon: History, label: 'Visitor History' },
  { section: 'Management' },
  { path: '/active', icon: Users, label: 'Active Visitors' },
  { path: '/expected', icon: CalendarClock, label: 'Expected Visitors' },
  { path: '/pre-registered', icon: ClipboardCheck, label: 'Pre-Registered' },
  { section: 'Insights' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/employees', icon: UserCog, label: 'Employees' },
  { section: 'System' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const pageTitles = {
  '/': 'Dashboard',
  '/check-in': 'Visitor Check-In',
  '/check-out': 'Visitor Check-Out',
  '/history': 'Visitor History',
  '/active': 'Active Visitors',
  '/expected': 'Expected Visitors',
  '/pre-registered': 'Pre-Registered Guests',
  '/reports': 'Reports & Analytics',
  '/employees': 'Employee Management',
  '/settings': 'Settings',
};

function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon"><ShieldCheck size={20} /></div>
            <div>
              <p className="logo-text">VMS</p>
              <p className="logo-sub">Visitor Management</p>
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
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="footer-badge">
            <span className="status-dot" />
            System Online v2.0
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ theme, toggleTheme, onMenu }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'VMS';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
        <div className="avatar-circle">AD</div>
      </div>
    </header>
  );
}

function AppLayout() {
  const [theme, setTheme] = useState(() => store.getSettings().theme || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    store.saveSetting('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Topbar theme={theme} toggleTheme={toggleTheme} onMenu={() => setSidebarOpen(true)} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/check-out" element={<CheckOut />} />
              <Route path="/history" element={<VisitorHistory />} />
              <Route path="/active" element={<ActiveVisitors />} />
              <Route path="/expected" element={<ExpectedVisitors />} />
              <Route path="/pre-registered" element={<PreRegisteredGuests />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/visitor/:id" element={<VisitorProfile />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
