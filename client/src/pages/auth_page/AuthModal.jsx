import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import RelstoneBlackLogo from '../../assets/images/RelstoneBlack.png';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconEyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3l18 18"/><path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6"/>
    <path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2"/>
    <path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Logo — updated: smaller size per Figma ────────────────────────────────────
const ModalLogo = ({ logoSrc }) => (
  <div style={S.logo}>
    <img src={logoSrc} alt="Relstone" style={S.logoImg} />
    <div style={S.logoDivider} />
    <div style={S.logoRight}>
      <div style={S.logoNmls}>NMLS</div>
      <div style={S.logoPortal}>Student Portal</div>
    </div>
  </div>
);

// ── Error Banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ msg }) => !msg ? null : (
  <div style={S.error}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </div>
);

// ── Input Field ───────────────────────────────────────────────────────────────
const Field = ({ placeholder, type = 'text', value, onChange, name, autoComplete, required, style: extraStyle }) => (
  <input
    style={{ ...S.input, ...extraStyle }}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
    autoComplete={autoComplete}
    required={required}
  />
);

// ── Password Field ────────────────────────────────────────────────────────────
const PasswordField = ({ placeholder, value, onChange, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={S.pwWrap}>
      <input
        style={{ ...S.input, paddingRight: 44 }}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required
      />
      <button type="button" onClick={() => setShow(v => !v)} style={S.eyeBtn}>
        {show ? <IconEyeOn /> : <IconEyeOff />}
      </button>
    </div>
  );
};

// ── OTP Screen ────────────────────────────────────────────────────────────────
const OTPScreen = ({ email, onVerify, onResend, onBack, loading, error, cooldown, logoSrc }) => {
  const [otp, setOtp] = useState('');
  return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      <div style={{ ...S.fpIcon, background: 'rgba(46,171,254,0.08)', border: '1px solid rgba(46,171,254,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h2 style={{ ...S.title, textAlign: 'center' }}>Check your email</h2>
      <p style={{ ...S.subtitle, textAlign: 'center', marginBottom: 20 }}>
        We sent a 6-digit code to<br /><strong style={{ color: '#091925' }}>{email}</strong>
      </p>
      <ErrorBanner msg={error} />
      <form onSubmit={e => { e.preventDefault(); onVerify(otp); }} style={S.form}>
        <input
          style={{ ...S.input, textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 12 }}
          type="text" inputMode="numeric" maxLength={6} placeholder="000000"
          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required
        />
        <button style={S.submitBtn} type="submit" disabled={loading || otp.length < 6}>
          {loading ? 'Verifying…' : 'Verify & Continue'} {!loading && <IconArrow />}
        </button>
      </form>
      <p style={S.switchText}>
        Didn't receive it?{' '}
        {cooldown > 0
          ? <span style={{ color: '#94a3b8', fontWeight: 600 }}>Resend in {cooldown}s</span>
          : <button style={S.linkBtn} type="button" onClick={onResend}>Resend code</button>
        }
      </p>
      <p style={{ ...S.switchText, marginTop: 8 }}>
        <button style={S.linkBtn} type="button" onClick={onBack}>← Back</button>
      </p>
    </div>
  );
};

// ── Forgot Password ───────────────────────────────────────────────────────────
const ForgotPassword = ({ onBack, logoSrc }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const sendOTP = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await API.post('/auth/forgot-password', { email }); setStep('otp'); startCooldown(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to send reset code.'); }
    finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await API.post('/auth/verify-reset-otp', { email, otp }); setStep('reset'); }
    catch (err) { setError(err.response?.data?.message || 'Invalid or expired code.'); }
    finally { setLoading(false); }
  };

  const resetPw = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try { await API.post('/auth/reset-password', { email, otp, newPassword: password }); setStep('done'); }
    catch (err) { setError(err.response?.data?.message || 'Failed to reset password.'); }
    finally { setLoading(false); }
  };

  if (step === 'done') return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      <div style={{ ...S.fpIcon, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', margin: '0 auto 20px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ ...S.title, textAlign: 'center' }}>Password Reset!</h2>
      <p style={{ ...S.subtitle, textAlign: 'center', marginBottom: 24 }}>Your password has been updated. You can now sign in with your new password.</p>
      <button style={S.submitBtn} type="button" onClick={onBack}>Go to Sign In <IconArrow /></button>
    </div>
  );

  return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      {step === 'email' && <>
        <h2 style={S.title}>Forgot Password?</h2>
        <p style={{ ...S.subtitle, marginBottom: 20 }}>Enter your email and we'll send you a reset code</p>
        <ErrorBanner msg={error} />
        <form onSubmit={sendOTP} style={S.form}>
          <Field placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button style={S.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Code'} {!loading && <IconArrow />}
          </button>
        </form>
      </>}
      {step === 'otp' && <>
        <h2 style={S.title}>Enter Reset Code</h2>
        <p style={{ ...S.subtitle, marginBottom: 20 }}>We sent a 6-digit code to <strong style={{ color: '#091925' }}>{email}</strong></p>
        <ErrorBanner msg={error} />
        <form onSubmit={verifyOTP} style={S.form}>
          <input style={{ ...S.input, textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 12 }}
            type="text" inputMode="numeric" maxLength={6} placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
          <button style={S.submitBtn} type="submit" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying…' : 'Verify Code'} {!loading && <IconArrow />}
          </button>
        </form>
        <p style={{ ...S.switchText, marginTop: 16 }}>
          {cooldown > 0 ? <span style={{ color: '#94a3b8', fontWeight: 600 }}>Resend in {cooldown}s</span>
            : <button style={S.linkBtn} type="button" onClick={async () => { try { await API.post('/auth/forgot-password', { email }); startCooldown(); } catch(e){} }}>Resend code</button>}
        </p>
      </>}
      {step === 'reset' && <>
        <h2 style={S.title}>Set New Password</h2>
        <p style={{ ...S.subtitle, marginBottom: 20 }}>Choose a strong password for your account</p>
        <ErrorBanner msg={error} />
        <form onSubmit={resetPw} style={S.form}>
          <PasswordField placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
          {password.length > 0 && (
            <div style={{ marginTop: -6 }}>
              <div style={{ height: 4, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, transition: 'width .3s,background .3s', width: password.length < 6 ? '25%' : password.length < 10 ? '60%' : '100%', background: password.length < 6 ? '#ef4444' : password.length < 10 ? '#f59e0b' : '#22c55e' }} />
              </div>
              <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: password.length < 6 ? '#ef4444' : password.length < 10 ? '#d97706' : '#16a34a' }}>
                {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
              </div>
            </div>
          )}
          <PasswordField placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {confirm.length > 0 && password !== confirm && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: -8 }}>Passwords don't match</div>}
          <button style={S.submitBtn} type="submit" disabled={loading || password !== confirm || password.length < 8}>
            {loading ? 'Saving…' : 'Reset Password'} {!loading && <IconArrow />}
          </button>
        </form>
      </>}
      <p style={{ ...S.switchText, marginTop: 16 }}>
        <button style={S.linkBtn} type="button" onClick={step === 'email' ? onBack : () => { setStep('email'); setOtp(''); setError(''); }}>← Back to Sign In</button>
      </p>
    </div>
  );
};

// ── Main AuthModal ────────────────────────────────────────────────────────────
const AuthModal = ({ mode = 'login', onClose, logoSrc = RelstoneBlackLogo }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(mode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', phone: '', state: '', password: '', confirm: '' });

  const setL = e => setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setR = e => setRegForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', { email: loginForm.email, password: loginForm.password });
      login(res.data.user, res.data.token, rememberMe);
      onClose(); navigate('/home');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setPendingEmail(err.response.data.email); setOtpStep(true); setError('');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) { setError('Passwords do not match.'); return; }
    if (!agreeTerms) { setError('Please agree to the Terms of Service.'); return; }
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', {
        name: `${regForm.firstName} ${regForm.lastName}`.trim(),
        email: regForm.email, phone: regForm.phone,
        state: regForm.state, password: regForm.password, role: 'student',
      });
      setPendingEmail(res.data.email); setOtpStep(true); startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/verify-otp', { email: pendingEmail, otp });
      login(res.data.user, res.data.token); onClose(); navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { await API.post('/auth/resend-otp', { email: pendingEmail }); startCooldown(); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'Failed to resend OTP.'); }
  };

  const switchTab = (t) => { setTab(t); setError(''); setOtpStep(false); };

  // ── Forgot password ──
  if (forgotMode) return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose}><CloseIcon /></button>
        <ForgotPassword onBack={() => { setForgotMode(false); setTab('login'); }} logoSrc={logoSrc} />
      </div>
    </>
  );

  // ── OTP screen ──
  if (otpStep) return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose}><CloseIcon /></button>
        <OTPScreen
          email={pendingEmail} onVerify={handleVerifyOTP} onResend={handleResend}
          onBack={() => { setOtpStep(false); setError(''); }}
          loading={loading} error={error} cooldown={cooldown} logoSrc={logoSrc}
        />
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose}><CloseIcon /></button>

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <div style={S.panel}>
            <ModalLogo logoSrc={logoSrc} />
            {/* WELCOME BACK — all blue per Figma */}
            <h2 style={S.loginTitle}>
              <span style={{ color: '#2EABFE' }}>WELCOME </span>
              <span style={{ color: '#091925' }}>BACK</span>
            </h2>
            <p style={S.loginSub}>Sign In To Access Your Courses, Certificates, And More.</p>
            <ErrorBanner msg={error} />
            <form onSubmit={handleLogin} style={{ ...S.form, marginTop: 20 }}>
              <Field placeholder="Email Address" type="email" name="email" value={loginForm.email} onChange={setL} autoComplete="email" required />
              <PasswordField placeholder="Password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} name="password" />
              {/* Remember Me + Forgot Password row */}
              <div style={S.rememberRow}>
                <label style={S.rememberLabel}>
                  <div onClick={() => setRememberMe(v => !v)} style={{ ...S.checkbox, ...(rememberMe ? S.checkboxOn : {}) }}>
                    {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={S.rememberText}>Remember Me</span>
                </label>
                <button type="button" style={S.forgotBtn} onClick={() => setForgotMode(true)}>Forgot Password?</button>
              </div>
              <button style={S.submitBtn} type="submit" disabled={loading}>
                {loading ? 'SIGNING IN…' : 'SIGN IN TO STUDENT PORTAL'} <IconArrow />
              </button>
            </form>
            <p style={S.switchText}>
              Don't have an account?{' '}
              <button style={S.linkBtn} type="button" onClick={() => switchTab('register')}>Create one free →</button>
            </p>
          </div>
        )}

        {/* ── REGISTER ── */}
        {tab === 'register' && (
          <div style={S.panel}>
            <ModalLogo logoSrc={logoSrc} />
            <h2 style={S.registerTitle}><span style={{ fontStyle: 'normal' }}>CREATE </span><span style={{ color: '#2EABFE' }}>YOUR ACCOUNT</span></h2>
            <p style={{ ...S.loginSub, marginBottom: 20 }}>Free Instant Access — No Credit Card Required.</p>
            <ErrorBanner msg={error} />
            <form onSubmit={handleRegister} style={S.form}>
              {/* First + Last name row */}
              <div style={S.twoCol}>
                <Field placeholder="First Name" name="firstName" value={regForm.firstName} onChange={setR} required />
                <Field placeholder="Last Name"  name="lastName"  value={regForm.lastName}  onChange={setR} required />
              </div>
              <Field placeholder="Email Address" type="email" name="email" value={regForm.email} onChange={setR} autoComplete="email" required />
              <Field placeholder="Phone Number (Optional)" type="tel" name="phone" value={regForm.phone} onChange={setR} />
              {/* State dropdown */}
              <div style={S.selectWrap}>
                <select style={S.select} name="state" value={regForm.state} onChange={setR}>
                  <option value="">Select Your State</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={S.selectChevron}><IconChevron /></span>
              </div>
              <PasswordField placeholder="Create a Password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} name="password" />
              <PasswordField placeholder="Confirm Password" value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} name="confirm" />
              {/* Agree checkbox */}
              <label style={{ ...S.rememberLabel, alignItems: 'flex-start', gap: 10 }}>
                <div onClick={() => setAgreeTerms(v => !v)} style={{ ...S.checkbox, marginTop: 2, ...(agreeTerms ? S.checkboxOn : {}) }}>
                  {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(9,25,37,0.65)', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <a href="#" style={S.termsLink}>Terms of Service</a>{' '}and{' '}
                  <a href="#" style={S.termsLink}>Privacy Policy</a>
                </span>
              </label>
              <button style={S.submitBtn} type="submit" disabled={loading}>
                {loading ? 'CREATING ACCOUNT…' : 'Create A Free Account'} <IconArrow />
              </button>
            </form>
            <p style={S.disclaimer}>
              By creating an account, you agree to RELSTONE's Terms of Service and Privacy Policy.
            </p>
            <p style={{ ...S.switchText, marginTop: 10 }}>
              Already have an account?{' '}
              <button style={S.linkBtn} type="button" onClick={() => switchTab('login')}>Sign in →</button>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// ── Close icon ────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  backdrop: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(9,25,37,0.60)', backdropFilter: 'blur(6px)' },
  modal: {
    position: 'fixed', zIndex: 201, top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '100%', maxWidth: 540,
    background: '#fff', borderRadius: 10,
    padding: '32px 36px 28px',
    boxShadow: '0 32px 80px rgba(9,25,37,0.22), 0 0 0 1px rgba(9,25,37,0.06)',
    maxHeight: '94vh', overflowY: 'auto',
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    width: 35, height: 35,
    background: 'rgba(91,115,132,0.10)',
    border: '0.5px solid #5B7384',
    borderRadius: 5, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#5B7384', transition: 'all .15s',
  },
  panel: { display: 'flex', flexDirection: 'column' },

  // Logo — smaller per user request
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoImg: { height: 30, objectFit: 'contain', display: 'block' },
  logoDivider: { width: 0.5, height: 35, background: '#2EABFE', flexShrink: 0 },
  logoRight: { display: 'flex', flexDirection: 'column', gap: 1 },
  // NMLS — Poppins black/900 per Figma
  logoNmls: {
    fontSize: 14,
    fontWeight: 900,
    color: '#091925',
    letterSpacing: 0.5,
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.2,
  },
  // Student Portal — JetBrains Mono per Figma
  logoPortal: {
    fontSize: 11,
    color: '#091925',
    fontWeight: 400,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 0.2,
    lineHeight: 1.2,
  },

  // Login heading — all blue per Figma ("WELCOME BACK" is fully #2EABFE)
  loginTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 38, fontWeight: 700, color: '#2EABFE',
    lineHeight: 1, marginBottom: 10, letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  loginSub: {
    fontSize: 14,
    color: '#7FA8C4',
    marginBottom: 4,
    lineHeight: 1.5,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    textTransform: 'capitalize',
  },

  // Register heading
  registerTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 34, fontWeight: 700, color: '#091925',
    lineHeight: 1.05, marginBottom: 8, letterSpacing: -0.5,
    textTransform: 'uppercase',
  },

  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },

  // Input — Figma style: rgba(127,168,196,0.1) bg, 0.5px #7FA8C4 border, 5px radius
  input: {
    width: '100%', height: 50, padding: '0 16px',
    fontSize: 16,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    color: '#0f172a',
    background: 'rgba(127,168,196,0.1)',
    border: '0.5px solid #7FA8C4',
    borderRadius: 5, outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    boxSizing: 'border-box',
  },

  // Password wrap
  pwWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn: {
    position: 'absolute', right: 12,
    width: 32, height: 32,
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#5B7384', borderRadius: 6, transition: 'color .15s',
  },

  // State select — same Figma style
  selectWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    width: '100%', height: 50, padding: '0 40px 0 16px',
    fontSize: 16,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    color: '#7FA8C4',
    background: 'rgba(127,168,196,0.1)',
    border: '0.5px solid #7FA8C4',
    borderRadius: 5,
    outline: 'none', appearance: 'none', cursor: 'pointer',
    boxSizing: 'border-box',
  },
  selectChevron: {
    position: 'absolute', right: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#7FA8C4', pointerEvents: 'none',
  },

  // Remember Me row
  rememberRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' },
  rememberText: {
    fontSize: 14,
    color: '#5B7384',
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
  },
  // Checkbox — Figma: rgba(127,168,196,0.1) bg, 0.5px #7FA8C4 border, 5px radius, 20x20
  checkbox: {
    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
    border: '0.5px solid #7FA8C4',
    background: 'rgba(127,168,196,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s', cursor: 'pointer',
  },
  checkboxOn: { background: '#2EABFE', border: 'none' },

  // Forgot Password — Poppins bold blue per Figma
  forgotBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 700, color: '#2EABFE',
    fontFamily: "'Poppins', sans-serif", padding: 0,
  },

  // Submit button — Figma: #2EABFE bg, dark text (#091925), Poppins 700, 5px radius
  submitBtn: {
    height: 50, width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontSize: 16, fontWeight: 700,
    letterSpacing: 0.3,
    color: '#091925',
    background: '#2EABFE',
    border: '0.5px solid #2EABFE',
    borderRadius: 5, cursor: 'pointer',
    marginTop: 4, transition: 'all .2s',
    fontFamily: "'Poppins', sans-serif",
    textTransform: 'capitalize',
  },

  termsLink: { color: '#2EABFE', textDecoration: 'none', fontWeight: 600 },

  // switchText — JetBrains Mono per Figma, color #7FA8C4
  switchText: {
    marginTop: 18, textAlign: 'center',
    fontSize: 13, color: '#7FA8C4',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 500,
  },
  linkBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, color: '#2EABFE',
    fontFamily: "'JetBrains Mono', monospace", padding: 0,
  },
  disclaimer: { marginTop: 14, textAlign: 'center', fontSize: 11, color: 'rgba(9,25,37,0.4)', lineHeight: 1.6 },

  error: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 14px', marginBottom: 14,
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 5, color: '#b91c1c', fontSize: 13,
  },

  fpIcon: {
    width: 64, height: 64, borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: { fontSize: 22, fontWeight: 800, color: '#091925', marginBottom: 6, fontFamily: "'Poppins', sans-serif" },
  subtitle: { fontSize: 13.5, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" },
};

// ── Global CSS (input focus ring, scrollbar, font load) ───────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
input:focus, select:focus { border-color: #2EABFE !important; box-shadow: 0 0 0 3px rgba(46,171,254,0.12) !important; outline: none !important; }
input::placeholder { color: #7FA8C4 !important; opacity: 0.7; }
select option { color: #091925; background: #fff; }
button[style*="background: #2EABFE"]:hover:not(:disabled),
button[style*='background: #2EABFE']:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px) !important; }
button[style*="background: #2EABFE"]:disabled,
button[style*='background: #2EABFE']:disabled { opacity: 0.65 !important; cursor: not-allowed !important; }
`;

export default AuthModal;