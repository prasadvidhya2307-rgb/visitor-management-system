import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentActivity, getTodayVisitors } from '../services/api';
import { FiUsers, FiUserCheck, FiUserX, FiClock, FiUserPlus } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, activityRes, visitorsRes] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getTodayVisitors()
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
      setTodayVisitors(visitorsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card purple">
            <div className="stat-icon purple"><FiUsers size={24} /></div>
            <div className="stat-value">{stats?.today_total || 0}</div>
            <div className="stat-label">Today's Visitors</div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card green">
            <div className="stat-icon green"><FiUserCheck size={24} /></div>
            <div className="stat-value">{stats?.checked_in || 0}</div>
            <div className="stat-label">Currently Checked In</div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card blue">
            <div className="stat-icon blue"><FiUserX size={24} /></div>
            <div className="stat-value">{stats?.checked_out || 0}</div>
            <div className="stat-label">Checked Out Today</div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card amber">
            <div className="stat-icon amber"><FiClock size={24} /></div>
            <div className="stat-value">{stats?.total_employees || 0}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card-custom">
            <div className="card-header-custom">
              <h3>Today's Visitors</h3>
              <button className="btn-outline-custom btn-sm" onClick={() => navigate('/history')}>
                View All
              </button>
            </div>
            <div className="card-body-custom" style={{ padding: 0 }}>
              {todayVisitors.length === 0 ? (
                <div className="empty-state">
                  <FiUserPlus size={48} />
                  <h3>No visitors yet today</h3>
                  <p>Check-in a new visitor to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Visitor</th>
                        <th>Purpose</th>
                        <th>Host</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayVisitors.slice(0, 8).map((v) => (
                        <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/visitor/${v.visitor_id}`)}>
                          <td>
                            <div className="visitor-row">
                              <div className="visitor-avatar">
                                {v.photo_path ? (
                                  <img src={`http://localhost:5000/${v.photo_path}`} alt="" />
                                ) : (
                                  `${v.v_first?.[0] || ''}${v.v_last?.[0] || ''}`
                                )}
                              </div>
                              <div className="visitor-info">
                                <h4>{v.v_first} {v.v_last}</h4>
                                <p>{v.v_company || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{v.purpose || '-'}</td>
                          <td style={{ fontSize: 13 }}>{v.e_first} {v.e_last}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{v.check_in_time}</td>
                          <td>
                            <span className={`badge-status ${v.status}`}>
                              {v.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card-custom">
            <div className="card-header-custom">
              <h3>Recent Activity</h3>
            </div>
            <div className="card-body-custom" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div className="empty-state">
                  <p>No recent activity</p>
                </div>
              ) : (
                activities.map((a) => (
                  <div className="activity-item" key={a.id}>
                    <div className={`activity-dot ${a.action === 'check_in' ? 'check-in' : 'check-out'}`} />
                    <div>
                      <div className="activity-text">{a.description}</div>
                      <div className="activity-time">{a.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
