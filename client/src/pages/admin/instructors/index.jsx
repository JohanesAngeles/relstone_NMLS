import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import API from '../../../api/axios';

/* ─── Add Instructor Modal ───────────────────────────────────────── */
const AddInstructorModal = ({ onClose, onSuccess }) => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/admin/instructors', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create instructor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={backdrop} />
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#091925' }}>Add Instructor</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'name',     label: 'Full Name *',   type: 'text' },
            { name: 'email',    label: 'Email *',        type: 'email' },
            { name: 'password', label: 'Password *',     type: 'password' },
            { name: 'phone',    label: 'Phone',          type: 'text' },
            { name: 'address',  label: 'Address',        type: 'text' },
          ].map(field => (
            <div key={field.name}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 4 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                style={{
                  width: '100%', height: 40, borderRadius: 8, padding: '0 12px',
                  border: '1px solid #e2e8f0', outline: 'none', fontSize: 13,
                  fontFamily: "'Poppins', sans-serif", color: '#091925',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0',
            background: 'transparent', color: '#7FA8C4', fontWeight: 600,
            fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, height: 42, borderRadius: 10, border: 'none',
            background: '#2EABFE', color: '#fff', fontWeight: 600,
            fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {loading ? 'Creating...' : 'Create Instructor'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── AdminInstructors ───────────────────────────────────────────── */
const AdminInstructors = () => {
  const navigate                      = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [toast, setToast]             = useState(null);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/instructors', {
        params: { search, status, page, limit: 10 },
      });
      setInstructors(res.data.instructors);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstructors(); }, [search, status, page]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/admin/instructors/${id}/toggle-status`);
      setInstructors(prev => prev.map(i =>
        i._id === id ? { ...i, is_active: res.data.is_active } : i
      ));
      showToast(`Instructor ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontFamily: "'Poppins', sans-serif",
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Instructors</h1>
            <p style={{ fontSize: 13, color: '#5B7384' }}>Manage and view all instructors.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 42, padding: '0 18px', borderRadius: 10, border: 'none',
              background: '#2EABFE', color: '#fff', fontWeight: 600,
              fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
            }}
          >
            <Plus size={15} /> Add Instructor
          </button>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42, flex: 1, maxWidth: 360,
        }}>
          <Search size={15} color="#7FA8C4" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins', sans-serif", color: '#091925' }}
          />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42,
        }}>
          <Filter size={15} color="#7FA8C4" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: '#091925', background: 'transparent', cursor: 'pointer' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 13, color: '#7FA8C4', fontWeight: 500 }}>
          {total} instructor{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Status</th>
              <th style={th}>Last Login</th>
              <th style={th}>Joined</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>Loading...</td></tr>
            ) : instructors.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>No instructors found.</td></tr>
            ) : instructors.map((i) => (
              <tr
                key={i._id}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#2EABFE',
                      display: 'grid', placeItems: 'center', fontSize: 11,
                      fontWeight: 700, color: '#091925', flexShrink: 0,
                    }}>
                      {i.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 600, color: '#091925' }}>{i.name}</span>
                  </div>
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>{i.email}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: i.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: i.is_active ? '#10b981' : '#ef4444',
                  }}>
                    {i.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>
                  {i.last_login_at ? new Date(i.last_login_at).toLocaleDateString() : '—'}
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>
                  {new Date(i.createdAt).toLocaleDateString()}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/admin/instructors/${i._id}`)}
                      title="View Details"
                      style={actionBtn('#2EABFE')}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(i._id)}
                      title={i.is_active ? 'Deactivate' : 'Activate'}
                      style={actionBtn(i.is_active ? '#ef4444' : '#10b981')}
                    >
                      {i.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: 'none',
                  background: p === page ? '#2EABFE' : '#f1f5f9',
                  color: p === page ? '#fff' : '#091925',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Instructor Modal */}
      {showAdd && (
        <AddInstructorModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { fetchInstructors(); showToast('Instructor created successfully!', 'success'); }}
        />
      )}

    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const th        = { textAlign: 'left', padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#7FA8C4' };
const td        = { padding: '14px 16px', color: '#091925', fontWeight: 500 };
const actionBtn = (color) => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});
const backdrop  = { position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)', zIndex: 300 };
const modal     = {
  position: 'fixed', zIndex: 301, top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 480,
  background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 28px 70px rgba(9,25,37,0.20)',
  fontFamily: "'Poppins', sans-serif",
};

export default AdminInstructors;