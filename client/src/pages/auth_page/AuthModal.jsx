import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const AuthModal = ({ mode = 'login', onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(mode); // 'login' | 'register'
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', nmls_id: '', state: ''
  });

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', loginForm);
      login(res.data.user, res.data.token);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', registerForm);
      login(res.data.user, res.data.token);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const switchTab = (tab) => { setActiveTab(tab); setError(''); setShowPw(false); };

  return (
    <>
      <style>{css}</style>

      {/* Backdrop */}
      <div className="am-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="am-modal" role="dialog" aria-modal="true">

        {/* Close button */}
        <button className="am-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="am-logo">
          <div className="am-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="am-logo-name">Relstone <span className="am-logo-accent">NMLS</span></span>
        </div>

        {/* Tabs */}
        <div className="am-tabs">
          <button
            className={`am-tab ${activeTab === 'login' ? 'am-tab--active' : ''}`}
            onClick={() => switchTab('login')}
          >Sign In</button>
          <button
            className={`am-tab ${activeTab === 'register' ? 'am-tab--active' : ''}`}
            onClick={() => switchTab('register')}
          >Create Account</button>
        </div>

        {/* Error */}
        {error && (
          <div className="am-error" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {activeTab === 'login' && (
          <div className="am-panel">
            <div className="am-panel-head">
              <h2 className="am-title">Welcome back</h2>
              <p className="am-subtitle">Sign in to your student account</p>
            </div>

            <form onSubmit={handleLogin} className="am-form">
              <div className="am-field">
                <label className="am-label">Email Address</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    className="am-input"
                    type="email" name="email"
                    placeholder="name@email.com"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    autoComplete="email" required
                  />
                </div>
              </div>

              <div className="am-field">
                <label className="am-label">Password</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className="am-input"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    autoComplete="current-password" required
                  />
                  <button type="button" className="am-eye" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6"/><path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2"/><path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button className="am-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>
            </form>

            <p className="am-switch">
              Don't have an account?{' '}
              <button className="am-switch-btn" onClick={() => switchTab('register')}>Create one here</button>
            </p>
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {activeTab === 'register' && (
          <div className="am-panel">
            <div className="am-panel-head">
              <h2 className="am-title">Create Account</h2>
              <p className="am-subtitle">Start your NMLS education journey</p>
            </div>

            <form onSubmit={handleRegister} className="am-form">
              <div className="am-field">
                <label className="am-label">Full Name</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    className="am-input" type="text" name="name"
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={handleRegisterChange} required
                  />
                </div>
              </div>

              <div className="am-field">
                <label className="am-label">Email Address</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    className="am-input" type="email" name="email"
                    placeholder="name@email.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    autoComplete="email" required
                  />
                </div>
              </div>

              <div className="am-field">
                <label className="am-label">Password</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className="am-input"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    autoComplete="new-password" required
                  />
                  <button type="button" className="am-eye" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6"/><path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2"/><path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="am-two-col">
                <div className="am-field">
                  <label className="am-label">NMLS ID <span className="am-optional">(optional)</span></label>
                  <div className="am-input-wrap">
                    <span className="am-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </span>
                    <input
                      className="am-input" type="text" name="nmls_id"
                      placeholder="NMLS ID"
                      value={registerForm.nmls_id}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>

                <div className="am-field">
                  <label className="am-label">State</label>
                  <div className="am-input-wrap">
                    <span className="am-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <select
                      className="am-input am-select"
                      name="state"
                      value={registerForm.state}
                      onChange={handleRegisterChange}
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button className="am-submit" type="submit" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>
            </form>

            <p className="am-switch">
              Already have an account?{' '}
              <button className="am-switch-btn" onClick={() => switchTab('login')}>Sign in here</button>
            </p>

            <p className="am-disclaimer">
              By creating an account you agree to Relstone's Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/homepage-baukasten');

:root {
  --am-midnight: #091925;
  --am-electric: #2EABFE;
  --am-sky:      #60C3FF;
  --am-slate:    #7FA8C4;
  --am-ice:      #F0F6FA;
  --am-border:   rgba(9,25,37,0.1);
  --am-muted:    #64748b;
  --am-font:     'Poppins', sans-serif;
  --am-title:    'Homepage Baukasten', sans-serif;
}

/* Backdrop */
.am-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(9,25,37,0.65);
  backdrop-filter: blur(6px);
  animation: am-fade-in .2s ease;
}
@keyframes am-fade-in { from { opacity:0; } to { opacity:1; } }

/* Modal */
.am-modal {
  position: fixed; z-index: 201;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 100%; max-width: 480px;
  background: #fff;
  border-radius: 22px;
  padding: 36px 36px 28px;
  box-shadow: 0 32px 80px rgba(9,25,37,0.22), 0 0 0 1px rgba(9,25,37,0.06);
  animation: am-slide-up .28s cubic-bezier(.34,1.3,.64,1);
  max-height: 92vh; overflow-y: auto;
  font-family: var(--am-font);
}
@keyframes am-slide-up {
  from { opacity:0; transform: translate(-50%, -46%); }
  to   { opacity:1; transform: translate(-50%, -50%); }
}

/* Close */
.am-close {
  position: absolute; top: 18px; right: 18px;
  width: 34px; height: 34px;
  background: var(--am-ice); border: none;
  border-radius: 9px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--am-muted); transition: all .18s;
}
.am-close:hover { background: #e8ecf0; color: var(--am-midnight); }

/* Logo */
.am-logo {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 24px;
}
.am-logo-mark {
  width: 34px; height: 34px;
  background: rgba(46,171,254,0.08);
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
}
.am-logo-name {
  font-family: var(--am-title);
  font-size: 16px; font-weight: 700; color: var(--am-midnight);
}
.am-logo-accent { color: var(--am-electric); }

/* Tabs */
.am-tabs {
  display: flex;
  background: var(--am-ice);
  border-radius: 12px; padding: 4px;
  margin-bottom: 22px;
}
.am-tab {
  flex: 1; padding: 9px;
  font-family: var(--am-font);
  font-size: 14px; font-weight: 600;
  color: var(--am-muted);
  background: none; border: none;
  border-radius: 9px; cursor: pointer;
  transition: all .18s;
}
.am-tab--active {
  background: #fff; color: var(--am-midnight);
  box-shadow: 0 2px 8px rgba(9,25,37,0.1);
}

/* Error */
.am-error {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 14px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 10px; color: #b91c1c;
  font-size: 13px; margin-bottom: 16px;
}

/* Panel */
.am-panel-head { margin-bottom: 20px; }
.am-title {
  font-family: var(--am-title);
  font-size: 24px; font-weight: 800;
  color: var(--am-midnight); margin-bottom: 4px;
}
.am-subtitle { font-size: 13.5px; color: var(--am-muted); }

/* Form */
.am-form { display: grid; gap: 14px; }
.am-field { display: grid; gap: 6px; }
.am-label {
  font-size: 12px; font-weight: 600;
  color: rgba(9,25,37,0.7);
}
.am-optional { font-weight: 400; color: var(--am-slate); }

.am-input-wrap { position: relative; display: flex; align-items: center; }
.am-input-icon {
  position: absolute; left: 13px;
  display: flex; align-items: center;
  color: rgba(9,25,37,0.4); pointer-events: none;
}
.am-input {
  width: 100%; height: 46px;
  padding: 0 44px 0 40px;
  font-family: var(--am-font);
  font-size: 14px; color: var(--am-midnight);
  background: var(--am-ice);
  border: 1.5px solid transparent;
  border-radius: 12px; outline: none;
  transition: border-color .18s, box-shadow .18s, background .18s;
  appearance: none;
}
.am-input::placeholder { color: rgba(9,25,37,0.32); }
.am-input:focus {
  background: #fff;
  border-color: var(--am-electric);
  box-shadow: 0 0 0 4px rgba(46,171,254,0.12);
}
.am-select { cursor: pointer; }

.am-eye {
  position: absolute; right: 10px;
  width: 30px; height: 30px;
  background: none; border: none;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(9,25,37,0.4); transition: all .15s;
}
.am-eye:hover { background: rgba(9,25,37,0.06); color: var(--am-midnight); }

.am-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Submit */
.am-submit {
  height: 48px; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: var(--am-font);
  font-size: 15px; font-weight: 700;
  color: #fff;
  background: var(--am-midnight);
  border: none; border-radius: 12px; cursor: pointer;
  margin-top: 4px;
  transition: all .2s;
  box-shadow: 0 4px 16px rgba(9,25,37,0.18);
}
.am-submit:hover:not(:disabled) {
  background: var(--am-electric);
  box-shadow: 0 8px 24px rgba(46,171,254,0.3);
  transform: translateY(-1px);
}
.am-submit:disabled { opacity: .65; cursor: not-allowed; transform: none; box-shadow: none; }

/* Switch */
.am-switch { margin-top: 18px; text-align: center; font-size: 13.5px; color: var(--am-muted); }
.am-switch-btn {
  background: none; border: none; cursor: pointer;
  font-family: var(--am-font);
  font-size: 13.5px; font-weight: 700;
  color: var(--am-electric); padding: 0;
}
.am-switch-btn:hover { text-decoration: underline; }

.am-disclaimer {
  margin-top: 14px; text-align: center;
  font-size: 11px; color: rgba(9,25,37,0.4); line-height: 1.6;
}

/* Scrollbar */
.am-modal::-webkit-scrollbar { width: 6px; }
.am-modal::-webkit-scrollbar-track { background: transparent; }
.am-modal::-webkit-scrollbar-thumb { background: rgba(9,25,37,0.12); border-radius: 3px; }

/* Responsive */
@media (max-width: 520px) {
  .am-modal { padding: 28px 22px 22px; border-radius: 18px; max-width: calc(100% - 24px); }
  .am-two-col { grid-template-columns: 1fr; }
}
`;

export default AuthModal;