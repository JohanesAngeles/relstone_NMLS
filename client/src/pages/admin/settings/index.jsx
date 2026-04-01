import { useEffect, useState } from 'react';
import { User, Lock, Settings, Users, Eye, EyeOff, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';

/* ─── Add Admin Modal ────────────────────────────────────────────── */
const AddAdminModal = ({ onClose, onSuccess }) => {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.'); return;
    }
    setLoading(true); setError('');
    try {
      await API.post('/admin/settings/admins', form);
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
      <div onClick={onClose} style={overlay} />
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#091925' }}>Add Admin</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}><X size={18} /></button>
        </div>
        {error && <div style={errBox}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'name',  label: 'Full Name *', type: 'text' },
            { name: 'email', label: 'Email *',      type: 'email' },
          ].map(f => (
            <div key={f.name}>
              <label style={fieldLabel}>{f.label}</label>
              <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                style={fieldInput} />
            </div>
          ))}
          <div>
            <label style={fieldLabel}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ ...fieldInput, paddingRight: 40 }} />
              <button onClick={() => setShowPw(p => !p)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4',
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={submitBtn}>
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Tab Button ─────────────────────────────────────────────────── */
const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 10, border: 'none',
    background: active ? '#2EABFE' : 'transparent',
    color: active ? '#fff' : '#7FA8C4',
    fontWeight: active ? 700 : 500, fontSize: 13,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    transition: 'all .15s',
  }}>
    {icon} {label}
  </button>
);

/* ─── AdminSettings ──────────────────────────────────────────────── */
const AdminSettings = () => {
  const { user: authUser, login, token } = useAuth();
  const [tab, setTab]                   = useState('profile');
  const [profile, setProfile]           = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [admins, setAdmins]             = useState([]);
  const [showAdd, setShowAdd]           = useState(false);
  const [showPw, setShowPw]             = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    fetchProfile();
    if (authUser?.role === 'super_admin') fetchAdmins();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/admin/settings/profile');
      setProfile({
        name:  res.data.user.name  || '',
        email: res.data.user.email || '',
        phone: res.data.user.phone || '',
      });
    } catch (err) { console.error(err); }
  };

  const fetchAdmins = async () => {
    try {
      const res = await API.get('/admin/settings/admins');
      setAdmins(res.data.admins);
    } catch (err) { console.error(err); }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await API.put('/admin/settings/profile', profile);
      // Update auth context
      login(res.data.user, token, true);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match.', 'error'); return;
    }
    if (passwords.newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error'); return;
    }
    setLoading(true);
    try {
      await API.put('/admin/settings/password', {
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (id) => {
    try {
      const res = await API.patch(`/admin/settings/admins/${id}/toggle-status`);
      setAdmins(prev => prev.map(a =>
        a._id === id ? { ...a, is_active: res.data.is_active } : a
      ));
      showToast(`Admin ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initials = authUser?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

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

      {/* Add Admin Modal */}
      {showAdd && (
        <AddAdminModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { fetchAdmins(); showToast('Admin created!', 'success'); }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Manage your admin account and system settings.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── Left Tabs ── */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Profile Avatar */}
          <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#2EABFE',
              display: 'grid', placeItems: 'center', fontSize: 18,
              fontWeight: 700, color: '#091925', margin: '0 auto 8px',
            }}>
              {initials}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#091925' }}>{authUser?.name}</div>
            <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>
              {authUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </div>
          </div>

          <div style={{ height: '0.5px', background: '#e2e8f0', margin: '4px 0 8px' }} />

          <TabBtn active={tab === 'profile'}  onClick={() => setTab('profile')}  icon={<User size={15} />}     label="My Profile" />
          <TabBtn active={tab === 'password'} onClick={() => setTab('password')} icon={<Lock size={15} />}     label="Password" />
          <TabBtn active={tab === 'site'}     onClick={() => setTab('site')}     icon={<Settings size={15} />} label="Site Settings" />
          {authUser?.role === 'super_admin' && (
            <TabBtn active={tab === 'admins'} onClick={() => setTab('admins')}   icon={<Users size={15} />}    label="Manage Admins" />
          )}
        </div>

        {/* ── Right Content ── */}
        <div>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div style={card}>
              <div style={cardHeader}>My Profile</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'name',  label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email',     type: 'email' },
                  { key: 'phone', label: 'Phone',     type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={fieldLabel}>{f.label}</label>
                    <input
                      type={f.type}
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      style={fieldInput}
                    />
                  </div>
                ))}
                <button onClick={handleProfileSave} disabled={loading} style={{ ...submitBtn, marginTop: 8 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <div style={card}>
              <div style={cardHeader}>Change Password</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'currentPassword', label: 'Current Password', pwKey: 'current' },
                  { key: 'newPassword',     label: 'New Password',     pwKey: 'new' },
                  { key: 'confirmPassword', label: 'Confirm Password', pwKey: 'confirm' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={fieldLabel}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw[f.pwKey] ? 'text' : 'password'}
                        value={passwords[f.key]}
                        onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ ...fieldInput, paddingRight: 40 }}
                      />
                      <button
                        onClick={() => setShowPw(p => ({ ...p, [f.pwKey]: !p[f.pwKey] }))}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4' }}
                      >
                        {showPw[f.pwKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={handlePasswordChange} disabled={loading} style={{ ...submitBtn, marginTop: 8 }}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}

          {/* Site Settings Tab */}
          {tab === 'site' && (
            <div style={card}>
              <div style={cardHeader}>Site Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Site Name',        placeholder: 'Relstone NMLS' },
                  { label: 'Support Email',     placeholder: 'support@relstone.com' },
                  { label: 'Contact Phone',     placeholder: '+1 (555) 000-0000' },
                  { label: 'Site URL',          placeholder: 'https://relstone.com' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={fieldLabel}>{f.label}</label>
                    <input type="text" placeholder={f.placeholder} style={fieldInput} />
                  </div>
                ))}
                <div style={{ background: 'rgba(46,171,254,0.06)', border: '1px solid rgba(46,171,254,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2EABFE', marginBottom: 4 }}>Coming Soon</div>
                  <div style={{ fontSize: 12, color: '#7FA8C4' }}>Site settings will be connected to the database in a future update.</div>
                </div>
              </div>
            </div>
          )}

          {/* Manage Admins Tab */}
          {tab === 'admins' && authUser?.role === 'super_admin' && (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={cardHeader}>Manage Admins</div>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
                    background: '#2EABFE', color: '#fff', fontWeight: 600,
                    fontSize: 12, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Plus size={13} /> Add Admin
                </button>
              </div>

              {admins.length === 0 ? (
                <p style={{ fontSize: 13, color: '#7FA8C4' }}>No admins yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {admins.map(a => (
                    <div key={a._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: '#2EABFE',
                          display: 'grid', placeItems: 'center', fontSize: 12,
                          fontWeight: 700, color: '#091925', flexShrink: 0,
                        }}>
                          {a.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: '#7FA8C4' }}>{a.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                          background: a.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: a.is_active ? '#10b981' : '#ef4444',
                        }}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggleAdmin(a._id)}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: 'none',
                            background: a.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            color: a.is_active ? '#ef4444' : '#10b981',
                            cursor: 'pointer', display: 'grid', placeItems: 'center',
                          }}
                        >
                          {a.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const card       = { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const cardHeader = { fontSize: 16, fontWeight: 700, color: '#091925', marginBottom: 20 };
const fieldLabel = { fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 6 };
const fieldInput = { width: '100%', height: 42, borderRadius: 10, padding: '0 14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: '#091925', boxSizing: 'border-box' };
const submitBtn  = { width: '100%', height: 44, borderRadius: 10, border: 'none', background: '#2EABFE', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" };
const cancelBtn  = { flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#7FA8C4', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" };
const overlay    = { position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)', zIndex: 300 };
const modalBox   = { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 28px 70px rgba(9,25,37,0.20)', fontFamily: "'Poppins', sans-serif" };
const errBox     = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef4444', marginBottom: 12 };

export default AdminSettings;