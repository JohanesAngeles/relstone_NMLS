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

const IconEmail   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconLock    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconEyeOn   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18"/><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6"/><path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2"/><path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"/></svg>;
const IconCheck   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;

const Logo = () => (
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
);

const ErrorBanner = ({ msg }) => !msg ? null : (
  <div className="am-error" role="alert">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </div>
);

// ─── FORGOT PASSWORD FLOW ─────────────────────────────────────────
const ForgotPassword = ({ onBack, onClose }) => {
  const [step,     setStep]     = useState('email');
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCp,   setShowCp]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setStep('otp');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/verify-reset-otp', { email, otp });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword: password });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/forgot-password', { email });
      startCooldown();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  if (step === 'email') return (
    <>
      <Logo />
      <div className="am-fp-icon" style={{ background:'rgba(46,171,254,0.08)', border:'1px solid rgba(46,171,254,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
      </div>
      <div className="am-panel-head" style={{ textAlign:'center' }}>
        <h2 className="am-title">Forgot Password?</h2>
        <p className="am-subtitle">Enter your email and we'll send you a reset code</p>
      </div>
      <ErrorBanner msg={error} />
      <form onSubmit={handleSendOTP} className="am-form">
        <div className="am-field">
          <label className="am-label">Email Address</label>
          <div className="am-input-wrap">
            <span className="am-input-icon"><IconEmail /></span>
            <input className="am-input" type="email" placeholder="name@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>
        <button className="am-submit" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Code'} {!loading && <IconArrow />}
        </button>
      </form>
      <p className="am-switch" style={{ marginTop:16 }}>
        <button className="am-switch-btn" type="button" onClick={onBack}>← Back to Sign In</button>
      </p>
    </>
  );

  if (step === 'otp') return (
    <>
      <Logo />
      <div className="am-fp-icon" style={{ background:'rgba(46,171,254,0.08)', border:'1px solid rgba(46,171,254,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div className="am-panel-head" style={{ textAlign:'center' }}>
        <h2 className="am-title">Enter Reset Code</h2>
        <p className="am-subtitle">We sent a 6-digit code to<br /><strong style={{ color:'#091925' }}>{email}</strong></p>
      </div>
      <ErrorBanner msg={error} />
      <form onSubmit={handleVerifyOTP} className="am-form">
        <div className="am-field">
          <label className="am-label">6-Digit Code</label>
          <input className="am-input am-otp-input" type="text" inputMode="numeric"
            maxLength={6} placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
        </div>
        <button className="am-submit" type="submit" disabled={loading || otp.length < 6}>
          {loading ? 'Verifying…' : 'Verify Code'} {!loading && <IconArrow />}
        </button>
      </form>
      <p className="am-switch" style={{ marginTop:16 }}>
        Didn't receive it?{' '}
        {cooldown > 0
          ? <span style={{ color:'#94a3b8', fontWeight:600 }}>Resend in {cooldown}s</span>
          : <button className="am-switch-btn" type="button" onClick={handleResend}>Resend code</button>
        }
      </p>
      <p className="am-switch" style={{ marginTop:8 }}>
        <button className="am-switch-btn" type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}>← Back</button>
      </p>
    </>
  );

  if (step === 'reset') return (
    <>
      <Logo />
      <div className="am-fp-icon" style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div className="am-panel-head" style={{ textAlign:'center' }}>
        <h2 className="am-title">Set New Password</h2>
        <p className="am-subtitle">Choose a strong password for your account</p>
      </div>
      <ErrorBanner msg={error} />
      <form onSubmit={handleReset} className="am-form">
        <div className="am-field">
          <label className="am-label">New Password</label>
          <div className="am-input-wrap">
            <span className="am-input-icon"><IconLock /></span>
            <input className="am-input" type={showPw ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="am-eye" onClick={() => setShowPw(v => !v)}>
              {showPw ? <IconEyeOn /> : <IconEyeOff />}
            </button>
          </div>
          {password.length > 0 && (
            <div style={{ marginTop:6 }}>
              <div style={{ height:4, borderRadius:999, background:'#e2e8f0', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:999, transition:'width .3s, background .3s',
                  width: password.length < 6 ? '25%' : password.length < 10 ? '60%' : '100%',
                  background: password.length < 6 ? '#ef4444' : password.length < 10 ? '#f59e0b' : '#22c55e',
                }} />
              </div>
              <div style={{ fontSize:11, marginTop:4, color: password.length < 6 ? '#ef4444' : password.length < 10 ? '#d97706' : '#16a34a', fontWeight:600 }}>
                {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
              </div>
            </div>
          )}
        </div>
        <div className="am-field">
          <label className="am-label">Confirm Password</label>
          <div className="am-input-wrap">
            <span className="am-input-icon"><IconLock /></span>
            <input className="am-input" type={showCp ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required />
            <button type="button" className="am-eye" onClick={() => setShowCp(v => !v)}>
              {showCp ? <IconEyeOn /> : <IconEyeOff />}
            </button>
          </div>
          {confirm.length > 0 && password !== confirm && (
            <div style={{ fontSize:11, color:'#ef4444', fontWeight:600, marginTop:4 }}>Passwords don't match</div>
          )}
        </div>
        <button className="am-submit" type="submit" disabled={loading || password !== confirm || password.length < 8}>
          {loading ? 'Saving…' : 'Reset Password'} {!loading && <IconArrow />}
        </button>
      </form>
    </>
  );

  return (
    <>
      <Logo />
      <div className="am-fp-icon" style={{ background:'rgba(34,197,94,0.10)', border:'1px solid rgba(34,197,94,0.25)' }}>
        <IconCheck />
      </div>
      <div className="am-panel-head" style={{ textAlign:'center' }}>
        <h2 className="am-title">Password Reset!</h2>
        <p className="am-subtitle">Your password has been updated successfully.<br />You can now sign in with your new password.</p>
      </div>
      <button className="am-submit" type="button" onClick={onBack} style={{ marginTop:8 }}>
        Go to Sign In <IconArrow />
      </button>
    </>
  );
};

// ─── Main AuthModal ───────────────────────────────────────────────
const AuthModal = ({ mode = 'login', onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState(mode);
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [forgotMode,  setForgotMode]  = useState(false);

  const [otpStep,        setOtpStep]        = useState(false);
  const [pendingEmail,   setPendingEmail]   = useState('');
  const [otpValue,       setOtpValue]       = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── KEY CHANGE: auto-check if token exists in localStorage ──
  const [rememberMe,   setRememberMe]   = useState(() => !!localStorage.getItem('token'));
  const [loginForm,    setLoginForm]    = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', nmls_id: '', state: '', role: 'student' });

  const handleLoginChange    = (e) => setLoginForm({    ...loginForm,    [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', loginForm);
      login(res.data.user, res.data.token, rememberMe);
      onClose();
      navigate('/home');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setPendingEmail(err.response.data.email);
        setOtpStep(true); setError('');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', registerForm);
      setPendingEmail(res.data.email);
      setOtpStep(true);
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/verify-otp', { email: pendingEmail, otp: otpValue });
      login(res.data.user, res.data.token);
      onClose();
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/resend-otp', { email: pendingEmail });
      startResendCooldown(); setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const switchTab = (tab) => { setActiveTab(tab); setError(''); setShowPw(false); setOtpStep(false); };

  // ── Forgot Password mode ──
  if (forgotMode) return (
    <>
      <style>{css}</style>
      <div className="am-backdrop" onClick={onClose} />
      <div className="am-modal" role="dialog" aria-modal="true">
        <button className="am-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <ForgotPassword onBack={() => { setForgotMode(false); setActiveTab('login'); }} onClose={onClose} />
      </div>
    </>
  );

  // ── OTP verification screen ──
  if (otpStep) return (
    <>
      <style>{css}</style>
      <div className="am-backdrop" onClick={onClose} />
      <div className="am-modal" role="dialog" aria-modal="true">
        <button className="am-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
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
        <div className="am-fp-icon" style={{ background:'rgba(46,171,254,0.08)', border:'1px solid rgba(46,171,254,0.2)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div className="am-panel-head" style={{ textAlign:'center' }}>
          <h2 className="am-title">Check your email</h2>
          <p className="am-subtitle">We sent a 6-digit code to<br /><strong style={{ color:'#091925' }}>{pendingEmail}</strong></p>
        </div>
        <ErrorBanner msg={error} />
        <form onSubmit={handleVerifyOTP} className="am-form">
          <div className="am-field">
            <label className="am-label">Verification Code</label>
            <input className="am-input am-otp-input" type="text" inputMode="numeric"
              maxLength={6} placeholder="000000"
              value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))} required />
          </div>
          <button className="am-submit" type="submit" disabled={loading || otpValue.length < 6}>
            {loading ? 'Verifying…' : 'Verify & Continue'} {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </form>
        <p className="am-switch" style={{ marginTop:16 }}>
          Didn't receive it?{' '}
          {resendCooldown > 0
            ? <span style={{ color:'#94a3b8', fontWeight:600 }}>Resend in {resendCooldown}s</span>
            : <button className="am-switch-btn" type="button" onClick={handleResend}>Resend code</button>
          }
        </p>
        <p className="am-switch" style={{ marginTop:8 }}>
          <button className="am-switch-btn" type="button" onClick={() => { setOtpStep(false); setOtpValue(''); setError(''); }}>← Back</button>
        </p>
      </div>
    </>
  );

  // ── Main modal ──
  return (
    <>
      <style>{css}</style>
      <div className="am-backdrop" onClick={onClose} />
      <div className="am-modal" role="dialog" aria-modal="true">
        <button className="am-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

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

        <div className="am-tabs">
          <button className={`am-tab ${activeTab==='login'    ? 'am-tab--active':''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`am-tab ${activeTab==='register' ? 'am-tab--active':''}`} onClick={() => switchTab('register')}>Create Account</button>
        </div>

        <ErrorBanner msg={error} />

        {/* ── LOGIN ── */}
        {activeTab === 'login' && (
          <div className="am-panel">
            <div className="am-panel-head">
              <h2 className="am-title">Welcome back</h2>
              <p className="am-subtitle">Sign in to your account</p>
            </div>
            <form onSubmit={handleLogin} className="am-form">
              <div className="am-field">
                <label className="am-label">Email Address</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                  <input className="am-input" type="email" name="email" placeholder="name@email.com"
                    value={loginForm.email} onChange={handleLoginChange} autoComplete="email" required />
                </div>
              </div>
              <div className="am-field">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <label className="am-label">Password</label>
                  <button type="button" className="am-switch-btn" style={{ fontSize:12 }} onClick={() => setForgotMode(true)}>
                    Forgot password?
                  </button>
                </div>
                <div className="am-input-wrap">
                  <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                  <input className="am-input" type={showPw ? 'text' : 'password'} name="password"
                    placeholder="Enter your password" value={loginForm.password}
                    onChange={handleLoginChange} autoComplete="current-password" required />
                  <button type="button" className="am-eye" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <IconEyeOn /> : <IconEyeOff />}
                  </button>
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', userSelect:'none', margin:'2px 0 4px' }}>
                <div
                  onClick={() => setRememberMe(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: rememberMe ? 'none' : '1.5px solid #cbd5e1',
                    background: rememberMe ? '#2EABFE' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                >
                  {rememberMe && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize:13, color:'rgba(9,25,37,0.65)', fontWeight:500 }}>Remember me</span>
              </label>
              <button className="am-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'} {!loading && <IconArrow />}
              </button>
            </form>
            <p className="am-switch">
              Don't have an account?{' '}
              <button className="am-switch-btn" onClick={() => switchTab('register')}>Create one here</button>
            </p>
          </div>
        )}

        {/* ── REGISTER ── */}
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
                  <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input className="am-input" type="text" name="name" placeholder="Your full name"
                    value={registerForm.name} onChange={handleRegisterChange} required />
                </div>
              </div>
              <div className="am-field">
                <label className="am-label">Email Address</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                  <input className="am-input" type="email" name="email" placeholder="name@email.com"
                    value={registerForm.email} onChange={handleRegisterChange} autoComplete="email" required />
                </div>
              </div>
              <div className="am-field">
                <label className="am-label">Password</label>
                <div className="am-input-wrap">
                  <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                  <input className="am-input" type={showPw ? 'text' : 'password'} name="password"
                    placeholder="Create a password" value={registerForm.password}
                    onChange={handleRegisterChange} autoComplete="new-password" required />
                  <button type="button" className="am-eye" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <IconEyeOn /> : <IconEyeOff />}
                  </button>
                </div>
              </div>
              <div className="am-field">
                <label className="am-label">I am a</label>
                <div className="am-role-toggle">
                  <button type="button" className={`am-role-btn ${registerForm.role==='student' ? 'am-role-btn--active':''}`}
                    onClick={() => setRegisterForm({ ...registerForm, role:'student' })}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    Student
                  </button>
                  <button type="button" className={`am-role-btn ${registerForm.role==='instructor' ? 'am-role-btn--active':''}`}
                    onClick={() => setRegisterForm({ ...registerForm, role:'instructor' })}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Instructor
                  </button>
                </div>
              </div>
              <div className="am-two-col">
                <div className="am-field">
                  <label className="am-label">NMLS ID <span className="am-optional">(optional)</span></label>
                  <div className="am-input-wrap">
                    <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                    <input className="am-input" type="text" name="nmls_id" placeholder="NMLS ID"
                      value={registerForm.nmls_id} onChange={handleRegisterChange} />
                  </div>
                </div>
                <div className="am-field">
                  <label className="am-label">State</label>
                  <div className="am-input-wrap">
                    <span className="am-input-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
                    <select className="am-input am-select" name="state" value={registerForm.state} onChange={handleRegisterChange}>
                      <option value="">Select state</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button className="am-submit" type="submit" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Continue'} {!loading && <IconArrow />}
              </button>
            </form>
            <p className="am-switch">
              Already have an account?{' '}
              <button className="am-switch-btn" onClick={() => switchTab('login')}>Sign in here</button>
            </p>
            <p className="am-disclaimer">By creating an account you agree to Relstone's Terms of Service and Privacy Policy.</p>
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
  --am-midnight:#091925; --am-electric:#2EABFE; --am-sky:#60C3FF;
  --am-slate:#7FA8C4; --am-ice:#F0F6FA; --am-border:rgba(9,25,37,0.1);
  --am-muted:#64748b; --am-font:'Poppins',sans-serif; --am-title:'Homepage Baukasten',sans-serif;
}
.am-backdrop { position:fixed; inset:0; z-index:200; background:rgba(9,25,37,0.65); backdrop-filter:blur(6px); animation:am-fade-in .2s ease; }
@keyframes am-fade-in { from{opacity:0} to{opacity:1} }
.am-modal { position:fixed; z-index:201; top:50%; left:50%; transform:translate(-50%,-50%); width:100%; max-width:480px; background:#fff; border-radius:22px; padding:36px 36px 28px; box-shadow:0 32px 80px rgba(9,25,37,0.22),0 0 0 1px rgba(9,25,37,0.06); animation:am-slide-up .28s cubic-bezier(.34,1.3,.64,1); max-height:92vh; overflow-y:auto; font-family:var(--am-font); }
@keyframes am-slide-up { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
.am-close { position:absolute; top:18px; right:18px; width:34px; height:34px; background:var(--am-ice); border:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--am-muted); transition:all .18s; }
.am-close:hover { background:#e8ecf0; color:var(--am-midnight); }
.am-logo { display:flex; align-items:center; gap:10px; margin-bottom:24px; }
.am-logo-mark { width:34px; height:34px; background:rgba(46,171,254,0.08); border:1px solid rgba(46,171,254,0.2); border-radius:9px; display:flex; align-items:center; justify-content:center; }
.am-logo-name { font-family:var(--am-title); font-size:16px; font-weight:700; color:var(--am-midnight); }
.am-logo-accent { color:var(--am-electric); }
.am-fp-icon { width:64px; height:64px; margin:0 auto 18px; border-radius:18px; display:flex; align-items:center; justify-content:center; }
.am-otp-input { text-align:center; font-size:28px !important; font-weight:800 !important; letter-spacing:12px; padding:0 12px !important; }
.am-tabs { display:flex; background:var(--am-ice); border-radius:12px; padding:4px; margin-bottom:22px; }
.am-tab { flex:1; padding:9px; font-family:var(--am-font); font-size:14px; font-weight:600; color:var(--am-muted); background:none; border:none; border-radius:9px; cursor:pointer; transition:all .18s; }
.am-tab--active { background:#fff; color:var(--am-midnight); box-shadow:0 2px 8px rgba(9,25,37,0.1); }
.am-error { display:flex; align-items:center; gap:8px; padding:11px 14px; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; color:#b91c1c; font-size:13px; margin-bottom:16px; }
.am-panel-head { margin-bottom:20px; }
.am-title { font-family:var(--am-title); font-size:24px; font-weight:800; color:var(--am-midnight); margin-bottom:4px; }
.am-subtitle { font-size:13.5px; color:var(--am-muted); }
.am-form { display:grid; gap:14px; }
.am-field { display:grid; gap:6px; }
.am-label { font-size:12px; font-weight:600; color:rgba(9,25,37,0.7); }
.am-optional { font-weight:400; color:var(--am-slate); }
.am-input-wrap { position:relative; display:flex; align-items:center; }
.am-input-icon { position:absolute; left:13px; display:flex; align-items:center; color:rgba(9,25,37,0.4); pointer-events:none; }
.am-input { width:100%; height:46px; padding:0 44px 0 40px; font-family:var(--am-font); font-size:14px; color:var(--am-midnight); background:var(--am-ice); border:1.5px solid transparent; border-radius:12px; outline:none; transition:border-color .18s,box-shadow .18s,background .18s; appearance:none; }
.am-input::placeholder { color:rgba(9,25,37,0.32); }
.am-input:focus { background:#fff; border-color:var(--am-electric); box-shadow:0 0 0 4px rgba(46,171,254,0.12); }
.am-select { cursor:pointer; }
.am-eye { position:absolute; right:10px; width:30px; height:30px; background:none; border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:rgba(9,25,37,0.4); transition:all .15s; }
.am-eye:hover { background:rgba(9,25,37,0.06); color:var(--am-midnight); }
.am-two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.am-role-toggle { display:flex; gap:8px; }
.am-role-btn { flex:1; height:44px; display:flex; align-items:center; justify-content:center; gap:7px; font-family:var(--am-font); font-size:13.5px; font-weight:600; color:var(--am-muted); background:var(--am-ice); border:1.5px solid transparent; border-radius:12px; cursor:pointer; transition:all .18s; }
.am-role-btn:hover { border-color:rgba(46,171,254,0.3); color:var(--am-midnight); }
.am-role-btn--active { background:rgba(46,171,254,0.08); border-color:var(--am-electric); color:var(--am-electric); }
.am-submit { height:48px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; font-family:var(--am-font); font-size:15px; font-weight:700; color:#fff; background:var(--am-midnight); border:none; border-radius:12px; cursor:pointer; margin-top:4px; transition:all .2s; box-shadow:0 4px 16px rgba(9,25,37,0.18); }
.am-submit:hover:not(:disabled) { background:var(--am-electric); box-shadow:0 8px 24px rgba(46,171,254,0.3); transform:translateY(-1px); }
.am-submit:disabled { opacity:.65; cursor:not-allowed; transform:none; box-shadow:none; }
.am-switch { margin-top:18px; text-align:center; font-size:13.5px; color:var(--am-muted); }
.am-switch-btn { background:none; border:none; cursor:pointer; font-family:var(--am-font); font-size:13.5px; font-weight:700; color:var(--am-electric); padding:0; }
.am-switch-btn:hover { text-decoration:underline; }
.am-disclaimer { margin-top:14px; text-align:center; font-size:11px; color:rgba(9,25,37,0.4); line-height:1.6; }
.am-modal::-webkit-scrollbar { width:6px; }
.am-modal::-webkit-scrollbar-track { background:transparent; }
.am-modal::-webkit-scrollbar-thumb { background:rgba(9,25,37,0.12); border-radius:3px; }
@media (max-width:520px) { .am-modal { padding:28px 22px 22px; border-radius:18px; max-width:calc(100% - 24px); } .am-two-col { grid-template-columns:1fr; } }
`;

export default AuthModal;