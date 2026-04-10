import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Eye, ToggleLeft, ToggleRight,
  Plus, X, ShieldCheck, KeyRound, UserCog,
} from 'lucide-react';
import API from '../../../api/axios';

/* ─── Add Admin Modal ────────────────────────────────────────────── */
const AddAdminModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', permissions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const PERMISSION_OPTIONS = [
    { key: 'manage_students',  label: 'Manage Students' },
    { key: 'manage_courses',   label: 'Manage Courses'  },
    { key: 'view_reports',     label: 'View Reports'    },
    { key: 'manage_payments',  label: 'Manage Payments' },
  ];

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const togglePermission = (key) =>
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
await API.post('/admin/admins', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin.');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(46,171,254,0.12)',
              display: 'grid', placeItems: 'center',
            }}>
              <UserCog size={16} color="#2EABFE" />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#091925' }}>Add Admin</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12,
            color: '#ef4444', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'name',     label: 'Full Name *', type: 'text'     },
            { name: 'email',    label: 'Email *',      type: 'email'    },
            { name: 'password', label: 'Password *',   type: 'password' },
            { name: 'phone',    label: 'Phone',        type: 'text'     },
            { name: 'address',  label: 'Address',      type: 'text'     },
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
                style={inputStyle}
              />
            </div>
          ))}

          {/* Permissions */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 8 }}>
              Permissions
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PERMISSION_OPTIONS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => togglePermission(p.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                    border: form.permissions.includes(p.key)
                      ? '1.5px solid #2EABFE'
                      : '1.5px solid #e2e8f0',
                    background: form.permissions.includes(p.key)
                      ? 'rgba(46,171,254,0.10)'
                      : 'transparent',
                    color: form.permissions.includes(p.key) ? '#2EABFE' : '#7FA8C4',
                    transition: 'all .15s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={submitBtn(loading)}>
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Reset Password Modal ───────────────────────────────────────── */
const ResetPasswordModal = ({ admin, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.patch(`/admin/admins/${admin._id}/reset-password`, { newPassword });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={backdrop} />
      <div style={{ ...modal, maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(251,191,36,0.12)', display: 'grid', placeItems: 'center' }}>
              <KeyRound size={16} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#091925', marginBottom: 1 }}>Reset Password</h2>
              <p style={{ fontSize: 11, color: '#7FA8C4' }}>{admin.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 6 }}>
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Min. 8 characters"
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            ...submitBtn(loading), background: '#f59e0b',
          }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── InstructorManageAdmins ─────────────────────────────────────── */
const InstructorManageAdmins = () => {
  const navigate                  = useNavigate();
  const [admins, setAdmins]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [toast, setToast]         = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
     const res = await API.get('/admin/admins', {
        params: { search, status, page, limit: 10 },
      });
      setAdmins(res.data.admins);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, [search, status, page]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/admin/admins/${id}/toggle-status`);
      setAdmins(prev =>
        prev.map(a => a._id === id ? { ...a, is_active: res.data.is_active } : a)
      );
      showToast(`Admin ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ROLE_COLORS = {
    super_admin: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', label: 'Super Admin' },
    admin:       { bg: 'rgba(46,171,254,0.1)', color: '#2EABFE', label: 'Admin'       },
    moderator:   { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Moderator'   },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <ShieldCheck size={22} color="#2EABFE" />
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925' }}>Manage Admins</h1>
            </div>
            <p style={{ fontSize: 13, color: '#5B7384' }}>Create, manage and control admin accounts.</p>
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
            <Plus size={15} /> Add Admin
          </button>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Admins',    value: total,                                         color: '#2EABFE' },
          { label: 'Active',          value: admins.filter(a => a.is_active).length,        color: '#10b981' },
          { label: 'Inactive',        value: admins.filter(a => !a.is_active).length,       color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 12, padding: '14px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
            alignItems: 'center', gap: 12, minWidth: 140,
          }}>
            <div style={{
              width: 8, height: 32, borderRadius: 99,
              background: stat.color, flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#091925', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
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
          {total} admin{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Status</th>
              <th style={th}>Last Login</th>
              <th style={th}>Joined</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#7FA8C4' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '3px solid #e2e8f0', borderTopColor: '#2EABFE',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Loading admins...
                  </div>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#7FA8C4' }}>
                  <ShieldCheck size={36} color="#e2e8f0" style={{ marginBottom: 10 }} />
                  <div style={{ fontWeight: 600 }}>No admins found.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters or add a new admin.</div>
                </td>
              </tr>
            ) : admins.map((a) => {
              const roleInfo = ROLE_COLORS[a.admin_role] || ROLE_COLORS['admin'];
              return (
                <tr
                  key={a._id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name */}
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #2EABFE22, #2EABFE44)',
                        display: 'grid', placeItems: 'center',
                        fontSize: 11, fontWeight: 700, color: '#2EABFE', flexShrink: 0,
                      }}>
                        {a.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#091925' }}>{a.name}</div>
                        {a.phone && (
                          <div style={{ fontSize: 11, color: '#7FA8C4' }}>{a.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ ...td, color: '#7FA8C4' }}>{a.email}</td>

                  {/* Role */}
                  <td style={td}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                      background: roleInfo.bg, color: roleInfo.color,
                    }}>
                      {roleInfo.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={td}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                      background: a.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: a.is_active ? '#10b981' : '#ef4444',
                    }}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td style={{ ...td, color: '#7FA8C4' }}>
                    {a.last_login_at ? new Date(a.last_login_at).toLocaleDateString() : '—'}
                  </td>

                  {/* Joined */}
                  <td style={{ ...td, color: '#7FA8C4' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => navigate(`/admin/admins/${a._id}`)
}
                        title="View Details"
                        style={actionBtn('#2EABFE')}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => setResetTarget(a)}
                        title="Reset Password"
                        style={actionBtn('#f59e0b')}
                      >
                        <KeyRound size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(a._id)}
                        title={a.is_active ? 'Deactivate' : 'Activate'}
                        style={actionBtn(a.is_active ? '#ef4444' : '#10b981')}
                      >
                        {a.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                height: 34, padding: '0 14px', borderRadius: 8, border: 'none',
                background: page === 1 ? '#f1f5f9' : '#e2e8f0',
                color: page === 1 ? '#b0c4d4' : '#091925',
                fontWeight: 600, fontSize: 12, cursor: page === 1 ? 'default' : 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ← Prev
            </button>
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
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                height: 34, padding: '0 14px', borderRadius: 8, border: 'none',
                background: page === totalPages ? '#f1f5f9' : '#e2e8f0',
                color: page === totalPages ? '#b0c4d4' : '#091925',
                fontWeight: 600, fontSize: 12, cursor: page === totalPages ? 'default' : 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAdd && (
        <AddAdminModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { fetchAdmins(); showToast('Admin created successfully!', 'success'); }}
        />
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <ResetPasswordModal
          admin={resetTarget}
          onClose={() => setResetTarget(null)}
          onSuccess={() => showToast('Password reset successfully!', 'success')}
        />
      )}
    </div>
  );
};

/* ─── Shared Styles ──────────────────────────────────────────────── */
const th = {
  textAlign: 'left', padding: '14px 16px',
  fontSize: 12, fontWeight: 600, color: '#7FA8C4',
};
const td = { padding: '14px 16px', color: '#091925', fontWeight: 500 };

const actionBtn = (color) => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
  transition: 'background .15s',
});

const backdrop = {
  position: 'fixed', inset: 0,
  background: 'rgba(9,25,37,0.55)',
  backdropFilter: 'blur(5px)', zIndex: 300,
};

const modal = {
  position: 'fixed', zIndex: 301,
  top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  width: '90%', maxWidth: 480,
  background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 28px 70px rgba(9,25,37,0.20)',
  fontFamily: "'Poppins', sans-serif",
  maxHeight: '90vh', overflowY: 'auto',
};

const inputStyle = {
  width: '100%', height: 40, borderRadius: 8, padding: '0 12px',
  border: '1px solid #e2e8f0', outline: 'none', fontSize: 13,
  fontFamily: "'Poppins', sans-serif", color: '#091925',
  boxSizing: 'border-box',
};

const cancelBtn = {
  flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0',
  background: 'transparent', color: '#7FA8C4', fontWeight: 600,
  fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
};

const submitBtn = (loading) => ({
  flex: 1, height: 42, borderRadius: 10, border: 'none',
  background: '#2EABFE', color: '#fff', fontWeight: 600,
  fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
  fontFamily: "'Poppins', sans-serif",
});

export default InstructorManageAdmins;