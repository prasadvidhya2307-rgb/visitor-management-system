import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import store from '../store';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function Reports() {
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    setDailyStats(store.getDailyStats());
    setMonthlyStats(store.getMonthlyStats());
    setDeptStats(store.getDepartmentStats());
    setVisits(store.getVisits());
  }, []);

  const totalVisits = visits.length;
  const avgDuration = visits.filter(v => v.checkOutTime).reduce((acc, v) => acc + (new Date(v.checkOutTime) - new Date(v.checkInTime)) / 3600000, 0) / (visits.filter(v => v.checkOutTime).length || 1);
  const todayCheckIns = visits.filter(v => v.checkInTime?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const successRate = totalVisits > 0 ? Math.round(visits.filter(v => v.status === 'checked_out').length / totalVisits * 100) : 0;

  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const hourVisits = visits.filter(v => new Date(v.checkInTime).getHours() === h);
    return { hour: `${h}:00`, visits: hourVisits.length };
  }).filter(h => h.visits > 0 || h.hour === '9:00' || h.hour === '14:00');

  function exportReport() {
    const rows = [['Metric', 'Value'], ['Total Visits', totalVisits], ['Active Visitors', store.getActiveVisits().length], ['Avg Duration', avgDuration.toFixed(1) + 'h'], ['Success Rate', successRate + '%']];
    deptStats.forEach(d => rows.push([d.name + ' Visits', d.value]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-p" onClick={exportReport}><Download size={16} /> Export Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Visits', value: totalVisits, color: 'blue' },
          { label: 'Avg Duration', value: avgDuration.toFixed(1) + 'h', color: 'green' },
          { label: "Today's Check-Ins", value: todayCheckIns, color: 'amber' },
          { label: 'Completion Rate', value: successRate + '%', color: 'purple' },
        ].map((s, i) => (
          <motion.div key={s.label} className={`stat-card ${s.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className={`stat-icon ${s.color}`}>{i === 0 ? <BarChart3 size={22} /> : <TrendingUp size={22} />}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-lbl">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-h"><h3>Weekly Trend</h3></div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="checkIns" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} name="Check-Ins" />
                <Area type="monotone" dataKey="checkOuts" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} name="Check-Outs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Monthly Overview</h3></div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visitors" fill="#6366F1" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>By Department</h3></div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptStats} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Peak Hours</h3></div>
          <div className="card-b" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
