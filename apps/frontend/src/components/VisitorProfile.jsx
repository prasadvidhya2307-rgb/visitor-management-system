import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVisitorProfile } from '../services/api';
import { FiArrowLeft, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

export default function VisitorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const res = await getVisitorProfile(id);
      setVisitor(res.data.visitor);
      setVisits(res.data.visits);
      setTotalVisits(res.data.total_visits);
      setTotalDuration(res.data.total_duration);
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!visitor) return <div className="empty-state"><h3>Visitor not found</h3></div>;

  return (
    <div>
      <button className="btn-outline-custom mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card-custom">
            <div className="card-body-custom text-center">
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', overflow: 'hidden' }}>
                {visitor.photo_path ? (
                  <img src={`http://localhost:5000/${visitor.photo_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>
                    {visitor.first_name[0]}{visitor.last_name[0]}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{visitor.first_name} {visitor.last_name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>{visitor.company || 'Independent'}</p>

              <div className="text-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <FiPhone size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: 14 }}>{visitor.phone}</span>
                </div>
                {visitor.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <FiMail size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: 14 }}>{visitor.email}</span>
                  </div>
                )}
                {visitor.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <FaBuilding size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: 14 }}>{visitor.company}</span>
                  </div>
                )}
              </div>

              <div className="row g-3 mt-3">
                <div className="col-6">
                  <div style={{ background: 'var(--primary-bg)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{totalVisits}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Visits</div>
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{totalDuration}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card-custom">
            <div className="card-header-custom">
              <h3>Visit History</h3>
            </div>
            {visits.length === 0 ? (
              <div className="empty-state">
                <FiClock size={48} />
                <h3>No visits yet</h3>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Host</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v) => (
                      <tr key={v.id}>
                        <td style={{ fontSize: 13 }}>{v.check_in_time}</td>
                        <td style={{ fontSize: 13 }}>{v.e_first_name} {v.e_last_name}</td>
                        <td style={{ fontSize: 13 }}>{v.purpose || '-'}</td>
                        <td style={{ fontSize: 13 }}>{v.duration_minutes ? `${v.duration_minutes} min` : '-'}</td>
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
    </div>
  );
}
