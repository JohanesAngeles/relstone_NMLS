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
  const [form, setForm] = useState({ name: '', email: '', password: '', nmls_id: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }

        .input-field {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid #e2e2e2;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #fafafa;
          color: #1a1a1a;
          transition: all 0.2s;
          outline: none;
          appearance: none;
        }
        .input-field:focus {
          border-color: #091925;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.08);
        }
        .input-field::placeholder { color: #aaa; }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: #091925;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          margin-top: 4px;
        }
        .submit-btn:hover { background: #091925; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.3); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .left-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
        }
        .feature-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.6);
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-dot::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-card { animation: fadeUp 0.5s ease forwards; }

        @media (max-width: 768px) {
          .split-left { display: none !important; }
          .split-right { width: 100% !important; }
        }
      `}</style>

      {/* Left Panel */}
      <div className="split-left" style={S.left}>
        <div style={S.leftPattern} />

        <div style={S.logoWrap}>
          <img src={logo} alt="Relstone" style={S.logo} />
        </div>

        <div style={S.leftContent}>
          <div style={S.badge}>Start Your Journey Today</div>
          <h1 style={S.headline}>
            Get NMLS<br />
            Licensed &amp;<br />
            <span style={S.headlineAccent}>Stay Compliant.</span>
          </h1>
          <p style={S.subtext}>
            Join thousands of mortgage professionals who trust Relstone
            for their NMLS pre-licensing and continuing education needs.
          </p>

          <div style={{ marginTop: 36 }}>
            <div className="left-feature">
              <div className="feature-dot" />
              <span style={S.featureText}>20-hour SAFE Act PE courses available</span>
            </div>
            <div className="left-feature">
              <div className="feature-dot" />
              <span style={S.featureText}>Annual CE requirements by state</span>
            </div>
            <div className="left-feature">
              <div className="feature-dot" />
              <span style={S.featureText}>Track your transcript &amp; CE status anytime</span>
            </div>
            <div className="left-feature">
              <div className="feature-dot" />
              <span style={S.featureText}>NMLS-compliant certificates on completion</span>
            </div>
          </div>
        </div>

        <div style={S.statsBar}>
          <div style={S.statItem}>
            <span style={S.statNum}>50+</span>
            <span style={S.statLabel}>States Approved</span>
          </div>
          <div style={S.statDivider} />
          <div style={S.statItem}>
            <span style={S.statNum}>10k+</span>
            <span style={S.statLabel}>Students Certified</span>
          </div>
          <div style={S.statDivider} />
          <div style={S.statItem}>
            <span style={S.statNum}>100%</span>
            <span style={S.statLabel}>NMLS Approved</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="split-right" style={S.right}>
        <div className="form-card" style={S.card}>
          <div style={S.mobileLogoWrap}>
            <img src={logo} alt="Relstone" style={S.mobileLogo} />
          </div>

          <h2 style={S.cardTitle}>Create Account</h2>
          <p style={S.cardSubtitle}>Start your NMLS education journey</p>

          {error && <div style={S.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={S.fieldWrap}>
              <div style={S.inputIcon}>
                <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input className="input-field" type="text" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
            </div>

            {/* Email */}
            <div style={S.fieldWrap}>
              <div style={S.inputIcon}>
                <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input className="input-field" type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            </div>

            {/* Password */}
            <div style={S.fieldWrap}>
              <div style={S.inputIcon}>
                <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input className="input-field" type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
            </div>

            {/* Two column row */}
            <div style={S.twoCol}>
              {/* NMLS ID */}
              <div style={S.fieldWrap}>
                <div style={S.inputIcon}>
                  <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <input className="input-field" type="text" name="nmls_id" placeholder="NMLS ID (optional)" value={form.nmls_id} onChange={handleChange} />
              </div>

              {/* State */}
              <div style={S.fieldWrap}>
                <div style={S.inputIcon}>
                  <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <select className="input-field" name="state" value={form.state} onChange={handleChange}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div style={S.dividerWrap}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>or</span>
            <div style={S.dividerLine} />
          </div>

          <p style={S.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={S.switchLink}>Sign in here</Link>
          </p>

          <p style={S.disclaimer}>
            By creating an account you agree to Relstone's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    width: '55%',
    background: 'linear-gradient(145deg, #1a1a2e 0%, #091925 60%, #091925 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 52px',
    overflow: 'hidden',
  },
  leftPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(0,0,0,0.2) 0%, transparent 40%)',
    pointerEvents: 'none',
  },
  logoWrap: { marginBottom: 'auto', zIndex: 1 },
  logo: { height: 150, objectFit: 'contain', filter: 'brightness(0) invert(1)' },
  leftContent: { zIndex: 1, marginTop: 60, marginBottom: 'auto' },
  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: 20,
    marginBottom: 20,
    letterSpacing: '0.5px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  headline: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 42,
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1.15,
    marginBottom: 18,
  },
  headlineAccent: { color: '#f9ca74' },
  subtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7,
    maxWidth: 380,
  },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 },
  statsBar: {
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    background: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: '16px 24px',
    marginTop: 40,
  },
  statItem: { flex: 1, textAlign: 'center' },
  statNum: { display: 'block', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', serif" },
  statLabel: { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, letterSpacing: '0.3px' },
  statDivider: { width: 1, height: 36, background: 'rgba(255,255,255,0.15)' },
  right: {
    width: '45%',
    background: '#f5f5f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  mobileLogoWrap: { display: 'none', marginBottom: 24, textAlign: 'center' },
  mobileLogo: { height: 36, objectFit: 'contain' },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardSubtitle: { fontSize: 14, color: '#888', marginBottom: 28 },
  errorBox: {
    background: '#fdf0ef',
    border: '1px solid #f5c6c2',
    color: '#091925',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
  },
  fieldWrap: { position: 'relative', marginBottom: 14 },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  dividerWrap: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#eee' },
  dividerText: { fontSize: 12, color: '#bbb', fontWeight: 500 },
  switchText: { textAlign: 'center', fontSize: 14, color: '#666' },
  switchLink: { color: '#091925', fontWeight: 600, textDecoration: 'none' },
  disclaimer: { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 16, lineHeight: 1.6 },
};

export default Register;