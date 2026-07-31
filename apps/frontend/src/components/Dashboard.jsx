import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus, Clock, CalendarClock, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getEmployees, getVisitors, getVisits, visitIsCheckedOut } from '../api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [activity, setActivity] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const localStats = store.getDashboardStats();
    setStats(localStats);
    getVisitors()
      .then(visitors => setStats(current => current ? { ...current, totalVisitors: visitors.length } : current))
      .catch(() => {});
    setDaily(store.getDailyStats());
    setActivity(store.getActivity().slice(0, 15));
    setEmployees(store.getEmployees());
  }, []);

  if (!stats) return <div className="spinner" />;

  const statCards = [
    { label: 'Total Visitors', value: stats.totalVisitors, icon: Users, color: 'blue', colorVar: 'var(--primary)' },
    { label: 'Active Now', value: stats.activeVisitors, icon: Clock, color: 'green', colorVar: 'var(--success)' },
    { label: "Today's Check-Ins", value: stats.todayCheckIns, icon: UserPlus, color: 'amber', colorVar: 'var(--warning)' },
    { label: 'Checked Out Today', value: stats.checkedOutToday, icon: UserMinus, color: 'purple', colorVar: 'var(--info)' },
    { label: 'Expected Today', value: stats.expectedToday, icon: CalendarClock, color: 'red', colorVar: 'var(--danger)' },
    { label: 'Departments', value: new Set(employees.map(employee => employee.department)).size, icon: TrendingUp, color: 'indigo', colorVar: '#8B5CF6' },
  ];

  const deptData = Object.entries(employees.reduce((counts, employee) => { counts[employee.department || 'Unassigned'] = (counts[employee.department || 'Unassigned'] || 0) + 1; return counts; }, {})).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {stats.todayCheckIns > 0 && (
        <div className="welcome-banner">
          <div style={{ fontSize: 36 }}>ðŸ‘‹</div>
          <div>
            <h3>Welcome back, Admin!</h3>
            <p>{stats.activeVisitors} visitor{stats.activeVisitors !== 1 ? 's' : ''} currently in the building. {stats.expectedToday} expected today.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} className={`stat-card ${s.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-h">
            <h3>Weekly Check-Ins / Check-Outs</h3>
            <button className="btn-o btn-sm" onClick={() => navigate('/reports')}>View Reports <ArrowRight size={14} /></button>
          </div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="checkIns" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Check-Ins" />
                <Bar dataKey="checkOuts" fill="#10B981" radius={[4, 4, 0, 0]} name="Check-Outs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>By Department</h3></div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Recent Activity</h3>
          <button className="btn-o btn-sm" onClick={() => navigate('/history')}>View All</button>
        </div>
        <div className="card-b">
          {activity.length === 0 && <p style={{ color: 'var(--text2)', fontSize: 13 }}>No activity yet.</p>}
          {activity.map(a => (
            <div key={a.id} className="act-item">
              <div className={`act-dot ${a.type}`} />
              <div>
                <div className="act-text">{a.message}</div>
                <div className="act-time">{new Date(a.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
