import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import logo from '../../assets/images/Copy of Left Side Logo.png';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    nmls_id: '',
    state: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rg-page">
      <style>{css}</style>

      {/* Left Panel */}
      <aside className="rg-left">
        <div className="rg-left-glow" />

        <div className="rg-left-inner">
          <div className="rg-brand">
            <img src={logo} alt="Relstone" className="rg-logo" />
          </div>

          <div className="rg-copy">
            <div className="rg-badge">Start Your Journey Today</div>

            <h1 className="rg-title">
              Get NMLS
              <br />
              Licensed &amp;
              <br />
              <span className="rg-title-accent">Stay Compliant.</span>
            </h1>

            <p className="rg-subtext">
              Join thousands of mortgage professionals who trust Relstone
              for their NMLS pre-licensing and continuing education needs.
            </p>

            <div className="rg-features">
              <div className="rg-feature">
                <span className="rg-dot" />
                <span>20-hour SAFE Act PE courses available</span>
              </div>

              <div className="rg-feature">
                <span className="rg-dot" />
                <span>Annual CE requirements by state</span>
              </div>

              <div className="rg-feature">
                <span className="rg-dot" />
                <span>Track your transcript &amp; CE status anytime</span>
              </div>

              <div className="rg-feature">
                <span className="rg-dot" />
                <span>NMLS-compliant certificates on completion</span>
              </div>
            </div>
          </div>

          <div className="rg-stats">
            <div className="rg-stat">
              <span className="rg-stat-num">50+</span>
              <span className="rg-stat-label">States Approved</span>
            </div>

            <div className="rg-stat-divider" />

            <div className="rg-stat">
              <span className="rg-stat-num">10k+</span>
              <span className="rg-stat-label">Students Certified</span>
            </div>

            <div className="rg-stat-divider" />

            <div className="rg-stat">
              <span className="rg-stat-num">100%</span>
              <span className="rg-stat-label">NMLS Approved</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="rg-right">
        <div className="rg-card">
          <div className="rg-mobile-logo-wrap">
            <img src={logo} alt="Relstone" className="rg-mobile-logo" />
          </div>

          <div className="rg-card-head">
            <h2 className="rg-card-title">Create Account</h2>
            <p className="rg-card-subtitle">Start your NMLS education journey</p>
          </div>

          {error && (
            <div className="rg-error-box">
              <span className="rg-error-dot" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="rg-form">
            <label className="rg-field">
              <span className="rg-label">Full Name</span>
              <div className="rg-input-wrap">
                <span className="rg-input-icon">
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  className="rg-input"
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="rg-field">
              <span className="rg-label">Email</span>
              <div className="rg-input-wrap">
                <span className="rg-input-icon">
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  className="rg-input"
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label className="rg-field">
              <span className="rg-label">Password</span>
              <div className="rg-input-wrap">
                <span className="rg-input-icon">
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  className="rg-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="rg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6A2.99 2.99 0 0 0 12 15a3 3 0 0 0 2.4-4.6" />
                      <path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2" />
                      <path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <div className="rg-two-col">
              <label className="rg-field">
                <span className="rg-label">NMLS ID</span>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  <input
                    className="rg-input"
                    type="text"
                    name="nmls_id"
                    placeholder="NMLS ID (optional)"
                    value={form.nmls_id}
                    onChange={handleChange}
                  />
                </div>
              </label>

              <label className="rg-field">
                <span className="rg-label">State</span>
                <div className="rg-input-wrap">
                  <span className="rg-input-icon">
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <select
                    className="rg-input rg-select"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <button className="rg-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div className="rg-divider">
            <span className="rg-divider-line" />
            <span className="rg-divider-text">or</span>
            <span className="rg-divider-line" />
          </div>

          <p className="rg-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="rg-switch-link">Sign in here</Link>
          </p>

          <p className="rg-disclaimer">
            By creating an account you agree to Relstone&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

:root{
  --rg-dark: #091925;
  --rg-dark-2: #1a1a2e;
  --rg-blue: #2EABFE;
  --rg-gold: #f9ca74;
  --rg-text: #1a1a1a;
  --rg-muted: #777;
  --rg-border: rgba(9,25,37,0.12);
  --rg-bg: #f5f5f0;
}

*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

body{
  margin:0;
}

.rg-page{
  min-height:100vh;
  display:flex;
  font-family:'DM Sans', sans-serif;
  background:var(--rg-bg);
}

.rg-left{
  width:55%;
  background:linear-gradient(145deg, #1a1a2e 0%, #091925 60%, #091925 100%);
  position:relative;
  overflow:hidden;
  display:flex;
}

.rg-left-glow{
  position:absolute;
  inset:0;
  background:
    radial-gradient(circle at 82% 18%, rgba(255,255,255,0.06) 0%, transparent 34%),
    radial-gradient(circle at 12% 82%, rgba(0,0,0,0.22) 0%, transparent 40%);
  pointer-events:none;
}

.rg-left-inner{
  position:relative;
  z-index:1;
  width:100%;
  padding:40px 52px;
  display:flex;
  flex-direction:column;
}

.rg-brand{
  display:flex;
  align-items:center;
  gap:12px;
  height:120px;      /* adjust based on your design */
  overflow:hidden;   /* prevents scrollbar */
}

.rg-logo{
  height:150px;
  width:auto;
  object-fit:contain;
  filter: brightness(0) invert(1);
}

.rg-copy{
  margin-top:56px;
  margin-bottom:auto;
  max-width:480px;
}

.rg-badge{
  display:inline-flex;
  align-items:center;
  padding:8px 14px;
  border-radius:999px;
  background:rgba(255,255,255,0.12);
  border:1px solid rgba(255,255,255,0.16);
  backdrop-filter:blur(10px);
  color:#fff;
  font-size:12px;
  font-weight:600;
  letter-spacing:.4px;
}

.rg-title{
  margin-top:18px;
  font-family:'Playfair Display', serif;
  font-size:44px;
  line-height:1.08;
  color:#fff;
  font-weight:900;
}

.rg-title-accent{
  color:var(--rg-gold);
}

.rg-subtext{
  margin-top:16px;
  font-size:15px;
  line-height:1.75;
  color:rgba(255,255,255,0.76);
  max-width:410px;
}

.rg-features{
  margin-top:34px;
  display:grid;
  gap:14px;
}

.rg-feature{
  display:flex;
  align-items:flex-start;
  gap:12px;
  color:rgba(255,255,255,0.87);
  font-size:14px;
  line-height:1.55;
}

.rg-dot{
  width:20px;
  height:20px;
  border-radius:50%;
  background:rgba(255,255,255,0.14);
  border:2px solid rgba(255,255,255,0.58);
  flex-shrink:0;
  margin-top:1px;
  position:relative;
}

.rg-dot::after{
  content:'';
  width:8px;
  height:8px;
  border-radius:50%;
  background:#fff;
  position:absolute;
  inset:0;
  margin:auto;
}

.rg-stats{
  margin-top:42px;
  display:flex;
  align-items:center;
  gap:0;
  background:rgba(0,0,0,0.25);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:16px;
  padding:18px 20px;
  backdrop-filter:blur(8px);
}

.rg-stat{
  flex:1;
  text-align:center;
}

.rg-stat-num{
  display:block;
  font-family:'Playfair Display', serif;
  font-size:24px;
  font-weight:900;
  color:#fff;
}

.rg-stat-label{
  display:block;
  margin-top:4px;
  font-size:11px;
  letter-spacing:.3px;
  color:rgba(255,255,255,0.62);
}

.rg-stat-divider{
  width:1px;
  height:38px;
  background:rgba(255,255,255,0.14);
}

.rg-right{
  width:45%;
  background:#f5f5f0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:40px 32px;
}

.rg-card{
  width:100%;
  max-width:440px;
  background:rgba(255,255,255,0.88);
  border:1px solid rgba(9,25,37,0.08);
  border-radius:24px;
  padding:34px 32px 26px;
  box-shadow:
    0 20px 50px rgba(0,0,0,0.08),
    0 4px 18px rgba(9,25,37,0.04);
  backdrop-filter:blur(12px);
  animation:rgFadeUp .45s ease;
}

@keyframes rgFadeUp{
  from{
    opacity:0;
    transform:translateY(18px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

.rg-mobile-logo-wrap{
  display:none;
  text-align:center;
  margin-bottom:18px;
}

.rg-mobile-logo{
  height:34px;
  width:auto;
  object-fit:contain;
}

.rg-card-head{
  margin-bottom:22px;
}

.rg-card-title{
  font-family:'Playfair Display', serif;
  font-size:30px;
  font-weight:800;
  color:var(--rg-text);
  line-height:1.1;
}

.rg-card-subtitle{
  margin-top:8px;
  font-size:14px;
  color:#888;
}

.rg-error-box{
  display:flex;
  align-items:flex-start;
  gap:10px;
  background:#fdf0ef;
  border:1px solid #f5c6c2;
  color:var(--rg-dark);
  padding:12px 14px;
  border-radius:14px;
  font-size:13px;
  margin-bottom:18px;
  line-height:1.5;
}

.rg-error-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--rg-dark);
  flex-shrink:0;
  margin-top:6px;
}

.rg-form{
  display:grid;
  gap:14px;
}

.rg-field{
  display:grid;
  gap:7px;
}

.rg-label{
  font-size:12px;
  font-weight:700;
  color:#5f6770;
  padding-left:2px;
}

.rg-input-wrap{
  position:relative;
}

.rg-input-icon{
  position:absolute;
  left:14px;
  top:50%;
  transform:translateY(-50%);
  color:#98a0aa;
  display:flex;
  align-items:center;
  pointer-events:none;
}

.rg-input{
  width:100%;
  height:48px;
  padding:0 46px 0 44px;
  border:1.5px solid #e3e5e8;
  border-radius:14px;
  font-size:14px;
  font-family:'DM Sans', sans-serif;
  background:#fafafa;
  color:#1a1a1a;
  outline:none;
  transition:
    border-color .2s ease,
    box-shadow .2s ease,
    background .2s ease,
    transform .2s ease;
  appearance:none;
}

.rg-input::placeholder{
  color:#a8adb4;
}

.rg-input:focus{
  border-color:#091925;
  background:#fff;
  box-shadow:0 0 0 4px rgba(9,25,37,0.08);
}

.rg-select{
  cursor:pointer;
}

.rg-eye{
  position:absolute;
  right:10px;
  top:50%;
  transform:translateY(-50%);
  width:32px;
  height:32px;
  display:flex;
  align-items:center;
  justify-content:center;
  border:none;
  background:transparent;
  color:#8d949d;
  cursor:pointer;
  border-radius:10px;
  transition:background .2s ease, color .2s ease;
}

.rg-eye:hover{
  background:rgba(9,25,37,0.06);
  color:#091925;
}

.rg-two-col{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

.rg-submit-btn{
  width:100%;
  height:50px;
  background:#091925;
  color:#fff;
  border:none;
  border-radius:14px;
  font-size:15px;
  font-weight:700;
  font-family:'DM Sans', sans-serif;
  cursor:pointer;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background .2s ease;
  letter-spacing:.2px;
  margin-top:4px;
  box-shadow:0 14px 28px rgba(9,25,37,0.16);
}

.rg-submit-btn:hover{
  background:#2EABFE;
  transform:translateY(-1px);
  box-shadow:0 14px 28px rgba(46,171,254,0.22);
}

.rg-submit-btn:disabled{
  opacity:.7;
  cursor:not-allowed;
  transform:none;
  box-shadow:none;
}

.rg-divider{
  display:flex;
  align-items:center;
  gap:12px;
  margin:22px 0 18px;
}

.rg-divider-line{
  flex:1;
  height:1px;
  background:#ececec;
}

.rg-divider-text{
  font-size:12px;
  color:#b6b6b6;
  font-weight:600;
}

.rg-switch-text{
  text-align:center;
  font-size:14px;
  color:#666;
}

.rg-switch-link{
  color:#091925;
  font-weight:700;
  text-decoration:none;
}

.rg-switch-link:hover{
  text-decoration:underline;
}

.rg-disclaimer{
  margin-top:16px;
  text-align:center;
  font-size:11px;
  line-height:1.7;
  color:#b5b5b5;
}

@media (max-width: 900px){
  .rg-left{
    display:none;
  }

  .rg-right{
    width:100%;
    padding:28px 18px;
  }

  .rg-card{
    max-width:520px;
  }

  .rg-mobile-logo-wrap{
    display:block;
  }
}

@media (max-width: 560px){
  .rg-card{
    padding:26px 18px 22px;
    border-radius:18px;
  }

  .rg-two-col{
    grid-template-columns:1fr;
  }

  .rg-card-title{
    font-size:26px;
  }
}
`;

export default Register;