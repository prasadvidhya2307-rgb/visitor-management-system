import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVisitorHistory, exportHistory } from '../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiEye, FiFileText, FiFile } from 'react-icons/fi';

export default function VisitorHistory() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getVisitorHistory(search, page, 15);
      setVisits(res.data.visits);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleExport = async (format) => {
    try {
      const res = await exportHistory(format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitor_history.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="flex-grow-1" style={{ maxWidth: 400 }}>
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <FiSearch className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search by name, phone, company, host..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-outline-custom btn-sm" onClick={() => handleExport('excel')}>
            <FiFile size={14} /> Export Excel
          </button>
          <button className="btn-outline-custom btn-sm" onClick={() => handleExport('pdf')}>
            <FiFileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="card-custom">
        <div className="card-header-custom">
          <h3>Visit History ({total} records)</h3>
        </div>
        {loading ? (
          <div className="spinner" />
        ) : visits.length === 0 ? (
          <div className="empty-state">
            <FiSearch size={48} />
            <h3>No records found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Host</th>
                  <th>Purpose</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="visitor-row">
                        <div className="visitor-avatar">
                          {v.photo_path ? (
                            <img src={`http://localhost:5000/${v.photo_path}`} alt="" />
                          ) : (
                            `${v.v_first_name?.[0] || ''}${v.v_last_name?.[0] || ''}`
                          )}
                        </div>
                        <div className="visitor-info">
                          <h4>{v.v_first_name} {v.v_last_name}</h4>
                          <p>{v.v_company || 'N/A'} &bull; {v.v_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{v.e_first_name} {v.e_last_name}</td>
                    <td style={{ fontSize: 13 }}>{v.purpose || '-'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.check_in_time}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.check_out_time || '-'}</td>
                    <td style={{ fontSize: 13 }}>{v.duration_minutes ? `${v.duration_minutes} min` : '-'}</td>
                    <td>
                      <span className={`badge-status ${v.status}`}>
                        {v.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-outline-custom btn-sm"
                        onClick={() => navigate(`/visitor/${v.visitor_id}`)}
                        title="View Profile"
                      >
                        <FiEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={page === p ? 'active' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
