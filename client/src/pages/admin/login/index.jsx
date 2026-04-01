import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import logo from '../../../assets/images/RelstoneBlack.png';

/* ─── Icons ──────────────────────────────────────────────────────── */
const IconEyeOn = () => (
  <svg width="23" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="23" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3l18 18"/>
    <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6"/>
    <path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2"/>
    <path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

/* ─── AdminLogin ─────────────────────────────────────────────────── */
const AdminLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/admin/auth/login', { email, password });
      const { token, user } = res.data;
      login(user, token, true);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={S.page}>
        <div style={S.formCard}>

          {/* Logo */}
          <div style={S.logo}>
            <img src={logo} alt="Relstone" style={S.logoImg} />
            <div style={S.logoDivider} />
            <div>
              <div style={S.logoNmls}>NMLS</div>
              <div style={S.logoSubText}>Admin Panel</div>
            </div>
          </div>

          {/* Title */}
          <h2 style={S.title}>
            <span style={{ color: '#091925' }}>WELCOME </span>
            <span style={{ color: '#2EABFE' }}>BACK</span>
          </h2>
          <p style={S.subtitle}>Sign in to access the NMLS Admin Panel.</p>

          {/* Error */}
          {error && (
            <div style={S.error}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={S.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@relstone.com"
                required
                style={S.input}
              />
            </div>

            <div>
              <label style={S.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ ...S.input, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={S.eyeBtn}
                >
                  {showPw ? <IconEyeOn /> : <IconEyeOff />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={S.submitBtn}
            >
              {loading ? 'SIGNING IN…' : 'SIGN IN TO ADMIN PANEL'} <IconArrow />
            </button>
          </form>

        </div>
      </div>
    </>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:        { minHeight: '100vh', background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" },
  formCard:    { width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: '40px 40px 36px', boxShadow: '0 8px 32px rgba(9,25,37,0.10)' },
  logo:        { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoImg:     { height: 28, objectFit: 'contain' },
  logoDivider: { width: 1, height: 32, background: '#2EABFE', opacity: 0.6 },
  logoNmls:    { fontSize: 16, fontWeight: 900, color: '#091925', lineHeight: 1.2 },
  logoSubText: { fontSize: 10, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' },
  title:       { fontSize: 36, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1, marginBottom: 8 },
  subtitle:    { fontSize: 14, color: '#7FA8C4', marginBottom: 24, lineHeight: 1.5 },
  label:       { fontSize: 12, fontWeight: 600, color: '#5B7384', display: 'block', marginBottom: 6 },
  input:       { width: '100%', height: 50, padding: '0 16px', fontSize: 15, fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#091925', background: 'rgba(127,168,196,0.08)', border: '0.5px solid #7FA8C4', borderRadius: 8, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s' },
  eyeBtn:      { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5B7384', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  submitBtn:   { height: 52, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 700, letterSpacing: 0.3, color: '#091925', background: '#2EABFE', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 4, transition: 'all .2s', fontFamily: "'Poppins', sans-serif" },
  error:       { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13 },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
input:focus { border-color: #2EABFE !important; box-shadow: 0 0 0 3px rgba(46,171,254,0.12) !important; }
input::placeholder { color: #7FA8C4 !important; opacity: 0.6; }
button[type="submit"]:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px) !important; }
button[type="submit"]:disabled { opacity: 0.55 !important; cursor: not-allowed !important; }
`;

export default AdminLogin;