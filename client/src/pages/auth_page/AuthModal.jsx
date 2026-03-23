import { useState, useEffect } from 'react';
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

/* ─── Role-based redirect ──────────────────────────────────────────
   student    → /home
   instructor → /instructor/dashboard
   admin      → /instructor/dashboard
─────────────────────────────────────────────────────────────────── */
const getRoleRoute = (user) => {
  const role = user?.role;
  if (role === 'instructor' || role === 'admin') return '/instructor/dashboard';
  return '/home';
};

// ── Icons ──────────────────────────────────────────────────────────────────
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
const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconLock = () => (
  <svg width="11" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ── Step Progress Dots ─────────────────────────────────────────────────────
const StepDots = ({ active = 0 }) => (
  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 35, height: 5, borderRadius: 999,
        background: i <= active ? '#2EABFE' : 'rgba(127,168,196,0.5)',
        transition: 'background .3s',
      }} />
    ))}
  </div>
);

// ── Logo ───────────────────────────────────────────────────────────────────
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

// ── Error Banner ───────────────────────────────────────────────────────────
const ErrorBanner = ({ msg }) => !msg ? null : (
  <div style={S.error}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </div>
);

// ── Input Field ────────────────────────────────────────────────────────────
const Field = ({ placeholder, type = 'text', value, onChange, name, autoComplete, required, style: extra }) => (
  <input
    style={{ ...S.input, ...extra }}
    type={type} placeholder={placeholder} value={value}
    onChange={onChange} name={name} autoComplete={autoComplete} required={required}
  />
);

// ── Password Field ─────────────────────────────────────────────────────────
const PasswordField = ({ placeholder, value, onChange, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={S.pwWrap}>
      <input
        style={{ ...S.input, paddingRight: 48 }}
        type={show ? 'text' : 'password'}
        placeholder={placeholder} value={value}
        onChange={onChange} name={name} required
      />
      <button type="button" onClick={() => setShow(v => !v)} style={S.eyeBtn}>
        {show ? <IconEyeOn /> : <IconEyeOff />}
      </button>
    </div>
  );
};

// ── 6-Box OTP Input ────────────────────────────────────────────────────────
const OTPBoxes = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const digits = (value + '      ').slice(0, 6).split('');

  useEffect(() => {
    const t = setTimeout(() => {
      document.getElementById('otp-hidden-input')?.focus();
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(val);
  };

  const focusInput = () => document.getElementById('otp-hidden-input')?.focus();

  return (
    <div style={{ position: 'relative', userSelect: 'none', cursor: 'text' }} onClick={focusInput}>
      <input
        id="otp-hidden-input"
        type="text" inputMode="numeric" maxLength={6}
        value={value} onChange={handleChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete="one-time-code"
        style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 'none', outline: 'none', fontSize: 16 }}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        {digits.map((d, i) => {
          const filled   = d.trim() !== '';
          const isCursor = focused && i === value.length && value.length < 6;
          const isActive = filled || isCursor;
          return (
            <div key={i} style={{
              width: 67, height: 70,
              background: 'rgba(127,168,196,0.1)',
              border: `0.5px solid ${isActive ? '#2EABFE' : '#7FA8C4'}`,
              borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: '#091925',
              fontFamily: "'Poppins', sans-serif",
              transition: 'border-color .15s, box-shadow .15s',
              boxShadow: isActive ? '0 0 0 3px rgba(46,171,254,0.14)' : 'none',
            }}>
              {filled ? d : isCursor ? (
                <div style={{ width: 2, height: 32, background: '#2EABFE', animation: 'blink 1s step-end infinite' }} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const fmtCooldown = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ── Forgot Password ────────────────────────────────────────────────────────
const ForgotPassword = ({ onBack, logoSrc }) => {
  const [step, setStep]         = useState('email');
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cooldown, setCooldown] = useState(0);

  const stepIdx = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const sendOTP = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setStep('otp'); startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await API.post('/auth/verify-reset-otp', { email, otp });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const resetPw = async (e) => {
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

  if (step === 'done') return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      <StepDots active={3} />
      <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ ...S.fpTitle, color: '#22C55E' }}>PASSWORD RESET!</h2>
        <p style={S.fpSub}>Your password has been updated successfully. You can now sign in with your new password.</p>
      </div>
      <button style={S.submitBtn} type="button" onClick={onBack}>Go to Sign In <IconArrow /></button>
    </div>
  );

  return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      <StepDots active={stepIdx} />

      {step === 'email' && (
        <>
          <h2 style={{ ...S.fpTitle, color: '#2EABFE' }}>FORGOT PASSWORD?</h2>
          <p style={S.fpSub}>No worries — enter your email and we'll send a 6-digit reset code right away.</p>
          <ErrorBanner msg={error} />
          <form onSubmit={sendOTP} style={S.form}>
            <Field placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <button style={{ ...S.submitBtn, fontSize: 18 }} type="submit" disabled={loading}>
              <IconSend />{loading ? 'Sending…' : 'Send Reset Code'}
            </button>
          </form>
          <button style={S.backLink} type="button" onClick={onBack}>{'< Back to Sign In'}</button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h2 style={{ ...S.fpTitle, color: '#091925' }}>CHECK YOUR EMAIL</h2>
          <p style={S.fpSub}>We sent a 6-digit code to <strong style={{ color: '#091925' }}>{email}</strong>. Expires in 10 minutes.</p>
          <ErrorBanner msg={error} />
          <form onSubmit={verifyOTP} style={S.form}>
            <OTPBoxes value={otp} onChange={setOtp} />
            <div style={S.resendRow}>
              <span>Didn't get the code?</span>
              {cooldown > 0
                ? <span style={{ fontWeight: 700 }}>&nbsp;Resend ({fmtCooldown(cooldown)})</span>
                : <button type="button" style={S.resendBtn} onClick={async () => {
                    try { await API.post('/auth/forgot-password', { email }); startCooldown(); } catch(e){}
                  }}>&nbsp;Resend</button>
              }
            </div>
            <button style={{ ...S.submitBtn, fontSize: 18 }} type="submit" disabled={loading || otp.length < 6}>
              <IconCheck />{loading ? 'Verifying…' : 'Verify Code'}
            </button>
          </form>
          <button style={S.backLink} type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}>{'< Use a different email'}</button>
        </>
      )}

      {step === 'reset' && (
        <>
          <h2 style={{ ...S.fpTitle, color: '#091925' }}>SET NEW PASSWORD</h2>
          <p style={S.fpSub}>Choose a strong password. Must be at least 8 characters.</p>
          <ErrorBanner msg={error} />
          <form onSubmit={resetPw} style={S.form}>
            <PasswordField placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
            {password.length > 0 && (
              <div style={{ marginTop: -4 }}>
                <div style={{ height: 4, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, transition: 'width .3s, background .3s', width: password.length < 6 ? '25%' : password.length < 10 ? '60%' : '100%', background: password.length < 6 ? '#ef4444' : password.length < 10 ? '#f59e0b' : '#22c55e' }} />
                </div>
                <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: password.length < 6 ? '#ef4444' : password.length < 10 ? '#d97706' : '#16a34a' }}>
                  {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                </div>
              </div>
            )}
            <PasswordField placeholder="Repeat New Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            {confirm.length > 0 && password !== confirm && (
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: -6 }}>Passwords don't match</div>
            )}
            <button style={{ ...S.submitBtn, fontSize: 18 }} type="submit" disabled={loading || password !== confirm || password.length < 8}>
              <IconLock />{loading ? 'Saving…' : 'Reset My Password'}
            </button>
          </form>
          <button style={S.backLink} type="button" onClick={() => { setStep('otp'); setError(''); }}>{'< Back'}</button>
        </>
      )}
    </div>
  );
};

// ── OTP Screen (post-register) ─────────────────────────────────────────────
const OTPScreen = ({ email, onVerify, onResend, onBack, loading, error, cooldown, logoSrc }) => {
  const [otp, setOtp] = useState('');
  return (
    <div style={S.panel}>
      <ModalLogo logoSrc={logoSrc} />
      <StepDots active={1} />
      <h2 style={{ ...S.fpTitle, color: '#091925' }}>CHECK YOUR EMAIL</h2>
      <p style={S.fpSub}>We sent a 6-digit code to <strong style={{ color: '#091925' }}>{email}</strong>. Expires in 10 minutes.</p>
      <ErrorBanner msg={error} />
      <form onSubmit={e => { e.preventDefault(); onVerify(otp); }} style={S.form}>
        <OTPBoxes value={otp} onChange={setOtp} />
        <div style={S.resendRow}>
          <span>Didn't get the code?</span>
          {cooldown > 0
            ? <span style={{ fontWeight: 700 }}>&nbsp;Resend ({fmtCooldown(cooldown)})</span>
            : <button type="button" style={S.resendBtn} onClick={onResend}>&nbsp;Resend</button>
          }
        </div>
        <button style={{ ...S.submitBtn, fontSize: 18 }} type="submit" disabled={loading || otp.length < 6}>
          <IconCheck />{loading ? 'Verifying…' : 'Verify Code'}
        </button>
      </form>
      <button style={S.backLink} type="button" onClick={onBack}>{'< Use a different email'}</button>
    </div>
  );
};

// ── Main AuthModal ─────────────────────────────────────────────────────────
const AuthModal = ({ mode = 'login', onClose, logoSrc = RelstoneBlackLogo }) => {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [tab, setTab]               = useState(mode);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep]       = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [cooldown, setCooldown]     = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loginForm, setLoginForm]   = useState({ email: '', password: '' });
  const [regForm, setRegForm]       = useState({
    firstName: '', lastName: '', email: '',
    phone: '', state: '', password: '', confirm: '',
  });

  const setL = e => setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setR = e => setRegForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => setCooldown(c => {
      if (c <= 1) { clearInterval(t); return 0; } return c - 1;
    }), 1000);
  };

  /* ── LOGIN — redirects by role ──────────────────────────────────────
     student    → /home
     instructor → /instructor/dashboard
     admin      → /instructor/dashboard
  ─────────────────────────────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', {
        email:    loginForm.email,
        password: loginForm.password,
      });
      login(res.data.user, res.data.token, rememberMe);
      onClose();
      navigate(getRoleRoute(res.data.user));
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setPendingEmail(err.response.data.email);
        setOtpStep(true);
        setError('');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  /* ── REGISTER ─────────────────────────────────────────────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) { setError('Passwords do not match.'); return; }
    if (!agreeTerms) { setError('Please agree to the Terms of Service.'); return; }
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', {
        name:     `${regForm.firstName} ${regForm.lastName}`.trim(),
        email:    regForm.email,
        phone:    regForm.phone,
        state:    regForm.state,
        password: regForm.password,
        role:     'student',
      });
      setPendingEmail(res.data.email);
      setOtpStep(true);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── VERIFY OTP — redirects by role ────────────────────────────────
     New user: clears how-it-works flag so modal shows once on /home.
     Then redirects by role same as login.
  ─────────────────────────────────────────────────────────────────── */
  const handleVerifyOTP = async (otp) => {
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/verify-otp', { email: pendingEmail, otp });
      login(res.data.user, res.data.token);

      // Mark as new user so How It Works modal auto-shows on next page
      localStorage.removeItem('relstone_how_it_works_seen');
      sessionStorage.setItem('relstone_is_new_user', '1');

      onClose();
      navigate(getRoleRoute(res.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/resend-otp', { email: pendingEmail });
      startCooldown(); setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const switchTab = (t) => { setTab(t); setError(''); setOtpStep(false); };

  /* ── Forgot password screen ─────────────────────────────────────── */
  if (forgotMode) return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose} type="button"><CloseIcon /></button>
        <ForgotPassword onBack={() => { setForgotMode(false); setTab('login'); }} logoSrc={logoSrc} />
      </div>
    </>
  );

  /* ── OTP screen ─────────────────────────────────────────────────── */
  if (otpStep) return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose} type="button"><CloseIcon /></button>
        <OTPScreen
          email={pendingEmail}
          onVerify={handleVerifyOTP}
          onResend={handleResend}
          onBack={() => { setOtpStep(false); setError(''); }}
          loading={loading} error={error} cooldown={cooldown} logoSrc={logoSrc}
        />
      </div>
    </>
  );

  /* ── Login / Register ───────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose} type="button"><CloseIcon /></button>

        {/* ══════════ LOGIN ══════════ */}
        {tab === 'login' && (
          <div style={S.panel}>
            <ModalLogo logoSrc={logoSrc} />
            <h2 style={S.loginTitle}>
              <span style={{ color: '#2EABFE' }}>WELCOME </span>
              <span style={{ color: '#091925' }}>BACK</span>
            </h2>
            <p style={S.loginSub}>Sign In To Access Your Courses, Certificates, And More.</p>
            <ErrorBanner msg={error} />
            <form onSubmit={handleLogin} style={{ ...S.form, marginTop: 20 }}>
              <Field
                placeholder="Email Address" type="email" name="email"
                value={loginForm.email} onChange={setL}
                autoComplete="email" required
              />
              <PasswordField
                placeholder="Password"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                name="password"
              />
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

        {/* ══════════ REGISTER ══════════ */}
        {tab === 'register' && (
          <div style={S.panel}>
            <ModalLogo logoSrc={logoSrc} />
            <h2 style={S.registerTitle}>CREATE <span style={{ color: '#2EABFE' }}>YOUR ACCOUNT</span></h2>
            <p style={S.loginSub}>Free Instant Access — No Credit Card Required.</p>
            <ErrorBanner msg={error} />
            <form onSubmit={handleRegister} style={S.form}>
              <div style={S.twoCol}>
                <Field placeholder="First Name" name="firstName" value={regForm.firstName} onChange={setR} required />
                <Field placeholder="Last Name"  name="lastName"  value={regForm.lastName}  onChange={setR} required />
              </div>
              <Field placeholder="Email Address" type="email" name="email" value={regForm.email} onChange={setR} autoComplete="email" required />
              <Field placeholder="Phone Number (Optional)" type="tel" name="phone" value={regForm.phone} onChange={setR} />
              <div style={S.selectWrap}>
                <select style={S.select} name="state" value={regForm.state} onChange={setR}>
                  <option value="">Select Your State</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={S.selectChevron}><IconChevron /></span>
              </div>
              <PasswordField
                placeholder="Create a Password"
                value={regForm.password}
                onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                name="password"
              />
              <PasswordField
                placeholder="Confirm Password"
                value={regForm.confirm}
                onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))}
                name="confirm"
              />
              {regForm.confirm.length > 0 && regForm.password !== regForm.confirm && (
                <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: -6 }}>Passwords don't match</div>
              )}
              <label style={{ ...S.rememberLabel, alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <div onClick={() => setAgreeTerms(v => !v)} style={{ ...S.checkbox, marginTop: 2, ...(agreeTerms ? S.checkboxOn : {}) }}>
                  {agreeTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: 14, color: '#5B7384', lineHeight: 1.5, fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                  I agree to the{' '}
                  <a href="#" style={S.termsLink}>Terms of Service</a>{' '}and{' '}
                  <a href="#" style={S.termsLink}>Privacy Policy</a>
                </span>
              </label>
              <button style={{ ...S.submitBtn, fontSize: 18 }} type="submit" disabled={loading}>
                {loading ? 'CREATING ACCOUNT…' : 'Create a Free Account'} <IconArrow />
              </button>
            </form>
            <p style={S.disclaimer}>By creating an account, you agree to RELSTONE's Terms of Service and Privacy Policy.</p>
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

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  backdrop:      { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(9,25,37,0.60)', backdropFilter: 'blur(6px)' },
  modal:         { position: 'fixed', zIndex: 201, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: 565, background: '#FFFFFF', borderRadius: 10, padding: '36px 40px 32px', boxShadow: '0 32px 80px rgba(9,25,37,0.22), 0 0 0 1px rgba(9,25,37,0.06)', maxHeight: '94vh', overflowY: 'auto', fontFamily: "'Poppins', system-ui, sans-serif", boxSizing: 'border-box' },
  closeBtn:      { position: 'absolute', top: 16, right: 16, width: 35, height: 35, background: 'rgba(91,115,132,0.10)', border: '0.5px solid #5B7384', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B7384', padding: 0 },
  panel:         { display: 'flex', flexDirection: 'column' },
  logo:          { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  logoImg:       { height: 32, objectFit: 'contain', display: 'block' },
  logoDivider:   { width: 0.5, height: 35, background: '#2EABFE', flexShrink: 0 },
  logoRight:     { display: 'flex', flexDirection: 'column', gap: 1 },
  logoNmls:      { fontSize: 20, fontWeight: 900, color: '#091925', fontFamily: "'Poppins', sans-serif", lineHeight: 1.2, textTransform: 'capitalize' },
  logoPortal:    { fontSize: 14, color: '#091925', fontWeight: 400, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 },
  fpTitle:       { fontFamily: "'Poppins', sans-serif", fontSize: 38, fontWeight: 700, lineHeight: 1.1, marginBottom: 10, letterSpacing: -0.5, textTransform: 'uppercase' },
  fpSub:         { fontSize: 16, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif", fontWeight: 400, lineHeight: '18px', marginBottom: 18 },
  loginTitle:    { fontFamily: "'Poppins', sans-serif", fontSize: 38, fontWeight: 700, lineHeight: 1, marginBottom: 10, letterSpacing: -0.5, textTransform: 'uppercase' },
  loginSub:      { fontSize: 16, color: '#7FA8C4', marginBottom: 6, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif", fontWeight: 400, textTransform: 'capitalize' },
  registerTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 36, fontWeight: 700, color: '#091925', lineHeight: 1.1, marginBottom: 8, letterSpacing: -0.5, textTransform: 'uppercase' },
  form:          { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 },
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input:         { width: '100%', height: 50, padding: '0 16px', fontSize: 16, fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#091925', background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4', borderRadius: 5, outline: 'none', transition: 'border-color .15s, box-shadow .15s', boxSizing: 'border-box' },
  pwWrap:        { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn:        { position: 'absolute', right: 12, width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B7384', opacity: 0.5, borderRadius: 6, padding: 0, transition: 'opacity .15s' },
  selectWrap:    { position: 'relative', display: 'flex', alignItems: 'center' },
  select:        { width: '100%', height: 50, padding: '0 40px 0 16px', fontSize: 16, fontFamily: "'Poppins', sans-serif", fontWeight: 500, color: '#5B7384', background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4', borderRadius: 5, outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box', opacity: 0.75 },
  selectChevron: { position: 'absolute', right: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7FA8C4', opacity: 0.5, pointerEvents: 'none' },
  rememberRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' },
  rememberText:  { fontSize: 14, color: '#5B7384', fontWeight: 500, fontFamily: "'Poppins', sans-serif" },
  checkbox:      { width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: '0.5px solid #7FA8C4', background: 'rgba(127,168,196,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', cursor: 'pointer' },
  checkboxOn:    { background: '#2EABFE', border: 'none' },
  forgotBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#2EABFE', fontFamily: "'Poppins', sans-serif", padding: 0 },
  submitBtn:     { height: 50, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 700, letterSpacing: 0.3, color: '#091925', background: '#2EABFE', border: '0.5px solid #2EABFE', borderRadius: 5, cursor: 'pointer', marginTop: 4, transition: 'all .2s', fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize', padding: 0 },
  termsLink:     { color: '#2EABFE', textDecoration: 'none', fontWeight: 600 },
  resendRow:     { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, lineHeight: '17px' },
  resendBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2EABFE', fontFamily: "'JetBrains Mono', monospace", padding: 0 },
  backLink:      { marginTop: 18, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace", padding: 0, textAlign: 'left', display: 'inline-flex', alignItems: 'center', transition: 'color .15s' },
  switchText:    { marginTop: 18, textAlign: 'center', fontSize: 13, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 },
  linkBtn:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2EABFE', fontFamily: "'JetBrains Mono', monospace", padding: 0 },
  disclaimer:    { marginTop: 14, textAlign: 'center', fontSize: 13, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, lineHeight: '15px' },
  error:         { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', marginBottom: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 5, color: '#b91c1c', fontSize: 13 },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
input:focus, select:focus { border-color: #2EABFE !important; box-shadow: 0 0 0 3px rgba(46,171,254,0.12) !important; outline: none !important; }
input::placeholder { color: #7FA8C4 !important; opacity: 0.5; }
select option { color: #091925; background: #fff; opacity: 1; }
button[style*="background: #2EABFE"]:hover:not(:disabled), button[style*='background: #2EABFE']:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px) !important; }
button[style*="background: #2EABFE"]:disabled, button[style*='background: #2EABFE']:disabled { opacity: 0.55 !important; cursor: not-allowed !important; }
`;

export default AuthModal;