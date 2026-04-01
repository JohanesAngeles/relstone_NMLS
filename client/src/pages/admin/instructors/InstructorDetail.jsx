import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Pencil, X, Check, BookOpen, Activity, KeyRound } from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Confirmation Dialog ────────────────────────────────────────── */
const ConfirmDialog = ({ title, sub, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogTitle}>{title}</div>
      <div style={D.dialogSub}>{sub}</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn}  onClick={onCancel}  type="button">Cancel</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Confirm</button>
      </div>
    </div>
  </>
);

/* ─── Reset Password Modal ───────────────────────────────────────── */
const ResetPasswordModal = ({ onClose, onSubmit }) => {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={D.backdrop} />
      <div style={D.dialog}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={D.dialogTitle}>Reset Password</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 4 }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: 40, borderRadius: 8, padding: '0 12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 4 }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', height: 40, borderRadius: 8, padding: '0 12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#7FA8C4', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#2EABFE', color: '#fff', fontWeight: 600, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Inline Editable Field ──────────────────────────────────────── */
const EditableField = ({ label, value, fieldKey, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value || '');
  const [confirm, setConfirm] = useState(false);
  const [dirty, setDirty]     = useState(false);

  const handleChange = (e) => {
    setCurrent(e.target.value);
    setDirty(e.target.value !== (value || ''));
  };

  const handleConfirm = () => {
    setConfirm(false);
    setEditing(false);
    setDirty(false);
    onSave(fieldKey, current);
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrent(value || '');
    setDirty(false);
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title="Save Changes?"
          sub="Are you sure you want to update this field?"
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(false)}
        />
      )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: editing ? 'rgba(46,171,254,0.04)' : '#f8fafc',
        borderRadius: 10,
        border: editing ? '1px solid rgba(46,171,254,0.3)' : '1px solid transparent',
        transition: 'all .2s',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>{label}</div>
          {editing ? (
            <input
              value={current}
              onChange={handleChange}
              autoFocus
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#091925', background: 'transparent', fontFamily: "'Poppins', sans-serif" }}
            />
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, color: current ? '#091925' : '#7FA8C4' }}>
              {current || '—'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
          {editing ? (
            <>
              {dirty && (
                <button onClick={() => setConfirm(true)} title="Save" style={iconBtn('#10b981')}>
                  <Check size={13} />
                </button>
              )}
              <button onClick={handleCancel} title="Cancel" style={iconBtn('#ef4444')}>
                <X size={13} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} title="Edit" style={iconBtn('#2EABFE')}>
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── InstructorDetail ───────────────────────────────────────────── */
const InstructorDetail = () => {
  const { id }                              = useParams();
  const [instructor, setInstructor]         = useState(null);
  const [courses, setCourses]               = useState([]);
  const [recentLogs, setRecentLogs]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [toast, setToast]                   = useState(null);
  const [showReset, setShowReset]           = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/admin/instructors/${id}`);
        setInstructor(res.data.instructor);
        setCourses(res.data.courses || []);
        setRecentLogs(res.data.recentLogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async (field, value) => {
    try {
      const res = await API.put(`/admin/instructors/${id}`, { [field]: value });
      setInstructor(res.data.instructor);
      showToast('Saved successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await API.patch(`/admin/instructors/${id}/toggle-status`);
      setInstructor(prev => ({ ...prev, is_active: res.data.is_active }));
      showToast(`Instructor ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
      setShowConfirm(false);
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleResetPassword = async (newPassword) => {
    await API.patch(`/admin/instructors/${id}/reset-password`, { newPassword });
    showToast('Password reset successfully!', 'success');
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div style={{ padding: 32, color: '#7FA8C4', fontFamily: "'Poppins',sans-serif" }}>Loading...</div>;
  if (!instructor) return <div style={{ padding: 32, color: '#ef4444', fontFamily: "'Poppins',sans-serif" }}>Instructor not found.</div>;

  const initials = instructor.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

      {/* Reset Password Modal */}
      {showReset && (
        <ResetPasswordModal
          onClose={() => setShowReset(false)}
          onSubmit={handleResetPassword}
        />
      )}

      {/* Toggle Status Confirm */}
      {showConfirm && (
        <ConfirmDialog
          title={instructor.is_active ? 'Deactivate Instructor?' : 'Activate Instructor?'}
          sub={`Are you sure you want to ${instructor.is_active ? 'deactivate' : 'activate'} this instructor?`}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Dashboard',   path: '/admin/dashboard' },
        { label: 'Instructors', path: '/admin/instructors' },
        { label: instructor.name },
      ]} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Instructor Details</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Viewing and editing profile for {instructor.name}.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile Card */}
          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#2EABFE',
                display: 'grid', placeItems: 'center', fontSize: 24,
                fontWeight: 700, color: '#091925', margin: '0 auto 12px',
              }}>
                {initials}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#091925' }}>{instructor.name}</div>
              <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 2 }}>{instructor.email}</div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 99,
                  background: instructor.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: instructor.is_active ? '#10b981' : '#ef4444',
                }}>
                  {instructor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div style={divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>
                Joined: <strong style={{ color: '#091925' }}>{new Date(instructor.createdAt).toLocaleDateString()}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>
                Last Login: <strong style={{ color: '#091925' }}>
                  {instructor.last_login_at ? new Date(instructor.last_login_at).toLocaleString() : '—'}
                </strong>
              </div>
            </div>

            <div style={divider} />

            {/* Reset Password Button */}
            <button
              onClick={() => setShowReset(true)}
              style={{
                width: '100%', height: 42, borderRadius: 10, border: 'none',
                background: 'rgba(46,171,254,0.08)', color: '#2EABFE',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <KeyRound size={15} /> Reset Password
            </button>

            {/* Toggle Status Button */}
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                width: '100%', height: 42, borderRadius: 10, border: 'none',
                background: instructor.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                color: instructor.is_active ? '#ef4444' : '#10b981',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {instructor.is_active
                ? <><ToggleRight size={16} /> Deactivate Instructor</>
                : <><ToggleLeft  size={16} /> Activate Instructor</>
              }
            </button>
          </div>

        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Personal Info */}
          <div style={card}>
            <div style={sectionTitle}><span>Personal Information</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <EditableField label="Full Name" fieldKey="name"    value={instructor.name}    onSave={handleSave} />
              <EditableField label="Email"     fieldKey="email"   value={instructor.email}   onSave={handleSave} />
              <EditableField label="Phone"     fieldKey="phone"   value={instructor.phone}   onSave={handleSave} />
              <EditableField label="Address"   fieldKey="address" value={instructor.address} onSave={handleSave} />
            </div>
          </div>

          {/* Courses Assigned */}
          <div style={card}>
            <div style={sectionTitle}>
              <BookOpen size={15} color="#2EABFE" />
              <span>Courses ({courses.length})</span>
            </div>
            {courses.length === 0 ? (
              <p style={empty}>No courses assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {courses.map((c) => (
                  <div key={c._id} style={{
                    background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>
                        {c.nmls_course_id} • {c.type} • {c.studentCount} student{c.studentCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                      background: c.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: c.is_active ? '#10b981' : '#ef4444',
                    }}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Logs */}
          <div style={card}>
            <div style={sectionTitle}>
              <Activity size={15} color="#8b5cf6" />
              <span>Recent Activity Logs</span>
            </div>
            {recentLogs.length === 0 ? (
              <p style={empty}>No recent activity.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Role</th>
                    <th style={th}>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={tdS}>{log.name}</td>
                      <td style={{ ...tdS, color: '#7FA8C4' }}>{log.email}</td>
                      <td style={tdS}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                          background: log.role === 'super_admin' ? 'rgba(139,92,246,0.1)' :
                                      log.role === 'admin'       ? 'rgba(46,171,254,0.1)'  :
                                      log.role === 'instructor'  ? 'rgba(245,158,11,0.1)'  :
                                                                   'rgba(16,185,129,0.1)',
                          color: log.role === 'super_admin' ? '#8b5cf6' :
                                 log.role === 'admin'       ? '#2EABFE' :
                                 log.role === 'instructor'  ? '#f59e0b' :
                                                              '#10b981',
                        }}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ ...tdS, color: '#7FA8C4' }}>
                        {new Date(log.last_login_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Dialog Styles ──────────────────────────────────────────────── */
const D = {
  backdrop:    { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:      { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 400, background: '#fff', borderRadius: 22, padding: '28px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', fontFamily: "'Poppins', sans-serif" },
  dialogTitle: { fontSize: 18, fontWeight: 700, color: '#091925', marginBottom: 8, textAlign: 'center' },
  dialogSub:   { fontSize: 13, color: '#5B7384', marginBottom: 24, textAlign: 'center' },
  dialogBtns:  { display: 'flex', gap: 10 },
  cancelBtn:   { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn:  { flex: 1, height: 44, background: '#2EABFE', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const card         = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: '#091925', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 };
const divider      = { height: '0.5px', background: '#e2e8f0', margin: '14px 0' };
const empty        = { fontSize: 13, color: '#7FA8C4' };
const th           = { textAlign: 'left', padding: '0 0 10px', color: '#7FA8C4', fontWeight: 600, fontSize: 12 };
const tdS          = { padding: '10px 0', color: '#091925', fontWeight: 500, fontSize: 13 };
const iconBtn      = (color) => ({
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});

export default InstructorDetail;