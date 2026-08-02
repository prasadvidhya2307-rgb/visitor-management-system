import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, UserMinus, Clock, CalendarClock, ClipboardCheck,
  ArrowRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboard, getEmployees, getPreRegistrations, getVisits, getVisitors, notify } from '../api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const [visits, visitors, employees, preRegistered, dashboard] = await Promise.all([getVisits(), getVisitors(), getEmployees(), getPreRegistrations(), getDashboard()]);
      const today = new Date().toISOString().slice(0, 10);
      const daily = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - 6 + index); const key = date.toISOString().slice(0, 10); const rows = visits.filter(v => String(v.checkInTime).slice(0, 10) === key); return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), date: key, checkIns: rows.length, checkOuts: rows.filter(v => v.status === 'checked_out').length }; });
      const monthly = Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - 5 + index); const key = date.toISOString().slice(0, 7); return { month: date.toLocaleDateString('en-US', { month: 'short' }), visitors: visits.filter(v => String(v.checkInTime).startsWith(key)).length }; });
      const dept = employees.map(employee => ({ name: employee.department, value: visits.filter(v => v.employeeId === employee.id).length })).reduce((all, item) => { const existing = all.find(x => x.name === item.name); if (existing) existing.value += item.value; else all.push(item); return all; }, []);
      const purposes = Object.entries(visits.reduce((all, v) => ({ ...all, [v.purpose || 'Other']: (all[v.purpose || 'Other'] || 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
      const peakHours = Object.entries(visits.reduce((all, v) => { const hour = new Date(v.checkInTime).getHours(); all[hour] = (all[hour] || 0) + 1; return all; }, {})).map(([hour, value]) => ({ hour: `${hour}:00`, visits: value }));
      setData({ stats: dashboard.stats, daily: dashboard.daily, monthly, dept, purposes, peakHours, activity: dashboard.activity, preRegistered: preRegistered.length });
    } catch (err) { notify(err.message, 'error'); setData({ stats: { totalVisitors: 0, activeVisitors: 0, todayCheckIns: 0, checkedOutToday: 0, expectedToday: 0 }, daily: [], monthly: [], dept: [], purposes: [], peakHours: [], activity: [], preRegistered: 0 }); }
  }

  if (!data) return <div className="spinner" />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const t = data.daily[data.daily.length - 1] || { checkIns: 0, checkOuts: 0 };
  const y = data.daily[data.daily.length - 2];
  const trendPct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

  const totalDept = data.dept.reduce((s, d) => s + d.value, 0);
  const topDepartment = data.dept.length ? data.dept.reduce((a, b) => (a.value > b.value ? a : b)) : { name: '—', value: 0 };
  const busiestHour = data.peakHours.length ? data.peakHours.reduce((a, b) => (a.visits > b.visits ? a : b)) : null;

  const statCards = [
    { label: 'Total Visitors', value: data.stats.totalVisitors, icon: Users, color: 'blue' },
    { label: 'Active Now', value: data.stats.activeVisitors, icon: Clock, color: 'green' },
    { label: "Today's Check-Ins", value: data.stats.todayCheckIns, icon: UserPlus, color: 'amber', trend: trendPct(t.checkIns, y?.checkIns) },
    { label: 'Checked Out Today', value: data.stats.checkedOutToday, icon: UserMinus, color: 'purple', trend: trendPct(t.checkOuts, y?.checkOuts) },
    { label: 'Expected Today', value: data.stats.expectedToday, icon: CalendarClock, color: 'red' },
    { label: 'Pre-Registered', value: data.preRegistered, icon: ClipboardCheck, color: 'indigo' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>
        <div style={{ fontSize: 36 }}>👋</div>
        <div style={{ flex: 1 }}>
          <h3>{greeting}!</h3>
          <p className="wb-date">{dateStr}</p>
          <p className="wb-sub">
            {data.stats.activeVisitors} visitor{data.stats.activeVisitors !== 1 ? 's' : ''} currently in the building · {data.stats.expectedToday} expected today
            {busiestHour ? ` · Peak hour is ${busiestHour.hour}` : ''}
          </p>
        </div>
        <button className="btn-p" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff' }} onClick={() => navigate('/check-in')}>
          <UserPlus size={16} /> Check In Visitor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} className={`stat-card ${s.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
              {s.trend != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, fontWeight: 600, color: s.trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {s.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(s.trend)}% vs yesterday
                </div>
              )}
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
          <div className="card-b" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="checkIns" name="Check-Ins" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="checkOuts" name="Check-Outs" stroke="#10B981" fill="#10B981" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Visitors by Department</h3></div>
          <div className="card-b" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.dept} cx="50%" cy="46%" outerRadius={85} innerRadius={50} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${Math.round(value / (totalDept || 1) * 100)}%`} labelLine={false} fontSize={10}>
                  {data.dept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: -12 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                Top department: <strong style={{ color: 'var(--text1)' }}>{topDepartment.name}</strong> ({topDepartment.value} visits)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-h"><h3>Monthly Visitors</h3></div>
          <div className="card-b" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Visit Purposes</h3></div>
          <div className="card-b" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.purposes} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="value" name="Visits" radius={[0, 4, 4, 0]} barSize={16}>
                  {data.purposes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Peak Hours</h3></div>
          <div className="card-b" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="visits" name="Visits" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-h">
          <h3>Recent Activity</h3>
          <button className="btn-o btn-sm" onClick={() => navigate('/history')}>View All</button>
        </div>
        <div className="card-b">
          {data.activity.length === 0 && <p style={{ color: 'var(--text2)', fontSize: 13 }}>No activity yet.</p>}
          {data.activity.map(a => (
            <div key={a.id} className="act-item">
              <div className={`act-dot ${a.type}`} />
              <div style={{ flex: 1 }}>
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
