import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import CheckIn from './components/CheckIn';
import CheckOut from './components/CheckOut';
import VisitorHistory from './components/VisitorHistory';
import VisitorProfile from './components/VisitorProfile';
import EmployeeManagement from './components/EmployeeManagement';
import BadgePreview from './components/BadgePreview';
import { FiHome, FiUserPlus, FiUserMinus, FiClock, FiUsers, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
  { path: '/check-in', label: 'Check In', icon: <FiUserPlus size={20} /> },
  { path: '/check-out', label: 'Check Out', icon: <FiUserMinus size={20} /> },
  { path: '/history', label: 'Visitor History', icon: <FiClock size={20} /> },
  { path: '/employees', label: 'Employees', icon: <FiUsers size={20} /> },
];

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366F1"/>
                <path d="M16 8C12.7 8 10 10.7 10 14V18H8V24H24V18H22V14C22 10.7 19.3 8 16 8ZM16 10.5C17.9 10.5 19.5 12.1 19.5 14V18H12.5V14C12.5 12.1 14.1 10.5 16 10.5ZM14 21C14 20.2 14.7 19.5 15.5 19.5H16.5C17.3 19.5 18 20.2 18 21H14Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h2 className="logo-text">VMS</h2>
              <p className="logo-subtitle">Visitor Management</p>
            </div>
          </div>
          <button className="sidebar-close d-lg-none" onClick={() => setIsOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-badge">
            <div className="status-dot" />
            <span>System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }) {
  const location = useLocation();
  const titles = {
    '/': 'Dashboard',
    '/check-in': 'Visitor Check-In',
    '/check-out': 'Visitor Check-Out',
    '/history': 'Visitor History',
    '/employees': 'Employee Management',
  };
  const title = titles[location.pathname] || 'VMS';

  return (
    <header className="topbar">
      <button className="menu-btn d-lg-none" onClick={onMenuClick}>
        <FiMenu size={24} />
      </button>
      <div className="topbar-title">
        <h1>{title}</h1>
        <p className="topbar-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="topbar-right">
        <div className="avatar-circle">
          <span>AD</span>
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="main-wrapper">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/check-out" element={<CheckOut />} />
            <Route path="/history" element={<VisitorHistory />} />
            <Route path="/visitor/:id" element={<VisitorProfile />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/badge/:visitId" element={<BadgePreview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', background: '#1e1e2e', color: '#e2e8f0', fontFamily: 'Inter' }
        }}
      />
      <AppLayout />
    </Router>
  );
}
