import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', department: '', designation: '', floor: '' };

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployees(search);
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadEmployees();
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      floor: emp.floor || '',
      is_active: emp.is_active
    });
    setEditId(emp.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateEmployee(editId, form);
        toast.success('Employee updated');
      } else {
        await createEmployee(form);
        toast.success('Employee created');
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    try {
      await deleteEmployee(id);
      toast.success('Employee deactivated');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <form onSubmit={handleSearch} className="flex-grow-1" style={{ maxWidth: 400 }}>
          <div className="search-bar">
            <FiSearch className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        <button className="btn-primary-custom" onClick={openCreate}>
          <FiPlus size={16} /> Add Employee
        </button>
      </div>

      <div className="card-custom">
        {loading ? (
          <div className="spinner" />
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <FiPlus size={48} />
            <h3>No employees found</h3>
            <p>Add your first employee to get started</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="visitor-row">
                        <div className="visitor-avatar">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div className="visitor-info">
                          <h4>{emp.first_name} {emp.last_name}</h4>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{emp.email}</td>
                    <td style={{ fontSize: 13 }}>{emp.phone || '-'}</td>
                    <td style={{ fontSize: 13 }}>{emp.department || '-'}</td>
                    <td style={{ fontSize: 13 }}>{emp.designation || '-'}</td>
                    <td style={{ fontSize: 13 }}>{emp.floor || '-'}</td>
                    <td>
                      <span className={`badge-status ${emp.is_active ? 'checked-in' : 'checked-out'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-outline-custom btn-sm" onClick={() => openEdit(emp)} title="Edit">
                          <FiEdit2 size={14} />
                        </button>
                        <button className="btn-outline-custom btn-sm" onClick={() => handleDelete(emp.id)} title="Deactivate" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>{editId ? 'Edit Employee' : 'Add Employee'}</h3>
              <button className="btn-outline-custom btn-sm" onClick={() => setShowModal(false)}>
                <FiX size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">First Name *</label>
                      <input className="form-input" required value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">Last Name *</label>
                      <input className="form-input" required value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">Email *</label>
                      <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">Phone</label>
                      <input className="form-input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">Department</label>
                      <input className="form-input" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label-custom">Designation</label>
                      <input className="form-input" value={form.designation} onChange={(e) => setForm({...form, designation: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label-custom">Floor</label>
                      <select className="form-select" value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})}>
                        <option value="">Select floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                        <option value="4th Floor">4th Floor</option>
                        <option value="5th Floor">5th Floor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer-custom">
                <button type="button" className="btn-outline-custom" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-custom">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
