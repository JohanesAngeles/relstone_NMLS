import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Copy of Left Side Logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-page">
      <style>{css}</style>

      {/* Left: Brand panel */}
      <aside className="rs-left">
        <div className="rs-left-bg" />
        <div className="rs-left-inner">
          <div className="rs-brand">
            <img className="rs-logo" src={logo} alt="Relstone" />
          </div>

          <div className="rs-copy">
            <span className="rs-pill">NMLS Approved Education</span>
            <h1 className="rs-h1">
              Advance your
              <br />
              Mortgage Career
              <br />
              <span className="rs-h1-accent">with Confidence.</span>
            </h1>
            <p className="rs-sub">
              NMLS-approved pre-licensing and continuing education courses built
              to keep you compliant and growing.
            </p>

            <div className="rs-features">
              <div className="rs-feature">
                <span className="rs-check" />
                <span>SAFE Act compliant PE &amp; CE courses</span>
              </div>
              <div className="rs-feature">
                <span className="rs-check" />
                <span>State-approved in multiple jurisdictions</span>
              </div>
              <div className="rs-feature">
                <span className="rs-check" />
                <span>Instant certificates upon completion</span>
              </div>
            </div>
          </div>

          <div className="rs-stats">
            <div className="rs-stat">
              <div className="rs-stat-num">50+</div>
              <div className="rs-stat-label">States Approved</div>
            </div>
            <div className="rs-stat-divider" />
            <div className="rs-stat">
              <div className="rs-stat-num">10k+</div>
              <div className="rs-stat-label">Students Certified</div>
            </div>
            <div className="rs-stat-divider" />
            <div className="rs-stat">
              <div className="rs-stat-num">100%</div>
              <div className="rs-stat-label">NMLS Approved</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: Form */}
      <main className="rs-right">
        <div className="rs-card">
          <div className="rs-mobile-brand">
            <img className="rs-mobile-logo" src={logo} alt="Relstone" />
          </div>

          <div className="rs-card-head">
            <h2 className="rs-h2">Welcome back</h2>
            <p className="rs-muted">Sign in to your student account</p>
          </div>

          {error && (
            <div className="rs-alert" role="alert" aria-live="polite">
              <span className="rs-alert-dot" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="rs-form">
            {/* Email */}
            <label className="rs-field">
              <span className="rs-label">Email</span>
              <div className="rs-input-wrap">
                <span className="rs-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  className="rs-input"
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {/* Password */}
            <label className="rs-field">
              <span className="rs-label">Password</span>
              <div className="rs-input-wrap">
                <span className="rs-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>

                <input
                  className="rs-input"
                  type={showPw ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="rs-eye"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6A2.99 2.99 0 0 0 12 15a3 3 0 0 0 2.4-4.6" />
                      <path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.2 18.2 0 0 1-3.2 4.2" />
                      <path d="M6.1 6.1C3.2 8.2 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button className="rs-btn" type="submit" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <span className="rs-arrow">→</span>}
            </button>
          </form>

          <div className="rs-divider">
            <span />
            <em>or</em>
            <span />
          </div>

          <p className="rs-center">
            Don&apos;t have an account?{" "}
            <Link className="rs-link" to="/register">
              Create one here
            </Link>
          </p>

          <p className="rs-foot">
            By signing in, you agree to Relstone&apos;s Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');

:root{
  --rs-dark:#091925;
  --rs-blue:#2EABFE;
  --rs-grad: linear-gradient(110deg, #091925 0%, #0b2a3a 35%, #2EABFE 100%);
  --rs-bg:#f6f7fb;
  --rs-card:#ffffff;
  --rs-text:#0b1220;
  --rs-muted:#6b7280;
  --rs-border: rgba(15, 23, 42, 0.10);
  --rs-ring: rgba(46, 171, 254, 0.28);
  --rs-shadow: 0 24px 60px rgba(2, 8, 23, 0.10);
}

*{box-sizing:border-box}
body{margin:0}

.rs-page{
  min-height:100vh;
  display:flex;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: var(--rs-bg);
}

.rs-left{
  width:56%;
  position:relative;
  overflow:hidden;
  background: var(--rs-grad);
  display:flex;
  align-items:stretch;
}
.rs-left-bg{
  position:absolute;
  inset:0;
  background:
    radial-gradient(900px 500px at 18% 25%, rgba(46,171,254,0.18), transparent 60%),
    radial-gradient(700px 480px at 80% 75%, rgba(255,255,255,0.10), transparent 55%),
    radial-gradient(500px 500px at 95% 10%, rgba(255,255,255,0.08), transparent 50%);
  pointer-events:none;
}
.rs-left-inner{
  position:relative;
  padding:44px 56px;
  display:flex;
  flex-direction:column;
  width:100%;
}
.rs-brand{
  display:flex;
  align-items:center;
  gap:12px;
  height:120px;      /* adjust based on your design */
  overflow:hidden;   /* prevents scrollbar */
}

.rs-logo{
  height:150px;
  width:auto;
  object-fit:contain;
  filter: brightness(0) invert(1);
}
.rs-copy{margin-top:64px; max-width:520px;}
.rs-pill{
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-size:12px;
  font-weight:600;
  color: rgba(255,255,255,0.9);
  padding:8px 12px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,0.18);
  background: rgba(9,25,37,0.28);
  backdrop-filter: blur(10px);
}
.rs-h1{
  margin:18px 0 12px;
  font-family: "Playfair Display", serif;
  font-size:46px;
  line-height:1.08;
  letter-spacing:-0.5px;
  color:#fff;
}
.rs-h1-accent{
  background: linear-gradient(90deg, #ffffff 0%, #cfeeff 35%, #2EABFE 100%);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}
.rs-sub{
  margin:0;
  color: rgba(255,255,255,0.75);
  line-height:1.7;
  font-size:15px;
  max-width:460px;
}

.rs-features{
  margin-top:26px;
  display:grid;
  gap:12px;
}
.rs-feature{
  display:flex;
  gap:10px;
  align-items:flex-start;
  color: rgba(255,255,255,0.86);
  font-size:14px;
  line-height:1.5;
}
.rs-check{
  width:18px; height:18px;
  border-radius:999px;
  background: rgba(46,171,254,0.18);
  border: 1px solid rgba(46,171,254,0.45);
  position:relative;
  flex-shrink:0;
  margin-top:2px;
}
.rs-check:after{
  content:"";
  position:absolute;
  inset:0;
  margin:auto;
  width:8px; height:8px;
  border-radius:999px;
  background:#fff;
}

.rs-stats{
  margin-top:auto;
  display:flex;
  align-items:center;
  gap:18px;
  padding:16px 18px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(9,25,37,0.28);
  backdrop-filter: blur(12px);
}
.rs-stat{flex:1; text-align:center;}
.rs-stat-num{
  font-family:"Playfair Display", serif;
  color:#fff;
  font-weight:900;
  font-size:22px;
  letter-spacing:-0.2px;
}
.rs-stat-label{
  margin-top:2px;
  font-size:11px;
  color: rgba(255,255,255,0.65);
}

.rs-stat-divider{
  width:1px; height:34px;
  background: rgba(255,255,255,0.18);
}

.rs-right{
  width:44%;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:44px 30px;
}

.rs-card{
  width:100%;
  max-width:440px;
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(2, 8, 23, 0.08);
  border-radius:22px;
  padding:34px 34px 26px;
  box-shadow: var(--rs-shadow);
  backdrop-filter: blur(12px);
}

.rs-mobile-brand{display:none; text-align:center; margin-bottom:14px;}
.rs-mobile-logo{height:36px; width:auto; object-fit:contain;}

.rs-card-head{margin-bottom:18px;}
.rs-h2{
  margin:0;
  font-size:28px;
  letter-spacing:-0.4px;
  color: var(--rs-text);
}
.rs-muted{
  margin:6px 0 0;
  color: var(--rs-muted);
  font-size:14px;
  line-height:1.55;
}

.rs-alert{
  display:flex;
  gap:10px;
  align-items:flex-start;
  padding:12px 12px;
  border-radius:14px;
  border:1px solid rgba(46,171,254,0.25);
  background: rgba(46,171,254,0.10);
  color: var(--rs-dark);
  margin:12px 0 16px;
  font-size:13px;
}
.rs-alert-dot{
  width:10px; height:10px;
  border-radius:999px;
  background: var(--rs-blue);
  margin-top:4px;
  flex-shrink:0;
}

.rs-form{display:grid; gap:14px; margin-top:6px;}

.rs-field{display:grid; gap:8px;}
.rs-label{
  font-size:12px;
  color: rgba(11, 18, 32, 0.75);
  font-weight:600;
}

.rs-input-wrap{
  position:relative;
  display:flex;
  align-items:center;
}

.rs-icon{
  position:absolute;
  left:12px;
  display:flex;
  align-items:center;
  color: rgba(9, 25, 37, 0.55);
}

.rs-input{
  width:100%;
  height:46px;
  border-radius:14px;
  border:1px solid var(--rs-border);
  background: rgba(255,255,255,0.92);
  padding: 0 44px 0 40px;
  font-size:14px;
  color: var(--rs-text);
  outline:none;
  transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease;
}
.rs-input::placeholder{color: rgba(11, 18, 32, 0.38);}
.rs-input:focus{
  border-color: rgba(46,171,254,0.75);
  box-shadow: 0 0 0 5px var(--rs-ring);
}

.rs-eye{
  position:absolute;
  right:10px;
  height:34px;
  width:34px;
  border-radius:10px;
  border:1px solid rgba(2,8,23,0.08);
  background: rgba(255,255,255,0.75);
  color: rgba(9, 25, 37, 0.65);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.rs-eye:hover{
  background:#fff;
  transform: translateY(-1px);
  border-color: rgba(46,171,254,0.35);
}

.rs-btn{
  margin-top:4px;
  height:48px;
  border:0;
  border-radius:14px;
  cursor:pointer;
  font-weight:700;
  font-size:14px;
  letter-spacing:0.2px;
  color:#fff;
  background: linear-gradient(90deg, #2EABFE 0%, #1f8fe0 35%, #091925 100%);
  box-shadow: 0 14px 30px rgba(46,171,254,0.20);
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
}
.rs-btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 38px rgba(9,25,37,0.22); }
.rs-btn:disabled{
  cursor:not-allowed;
  opacity:0.75;
  transform:none;
  box-shadow:none;
}
.rs-arrow{font-size:18px; line-height:1;}

.rs-divider{
  margin:18px 0 14px;
  display:flex;
  align-items:center;
  gap:12px;
  color: rgba(11, 18, 32, 0.45);
}
.rs-divider span{
  flex:1;
  height:1px;
  background: rgba(2, 8, 23, 0.10);
}
.rs-divider em{
  font-style:normal;
  font-size:12px;
  font-weight:600;
}

.rs-center{
  margin:0;
  text-align:center;
  color: rgba(11, 18, 32, 0.65);
  font-size:14px;
}
.rs-link{
  color: var(--rs-blue);
  font-weight:800;
  text-decoration:none;
}
.rs-link:hover{ text-decoration:underline; }

.rs-foot{
  margin:14px 0 0;
  text-align:center;
  font-size:11px;
  color: rgba(11, 18, 32, 0.45);
  line-height:1.6;
}

@media (max-width: 900px){
  .rs-left{display:none}
  .rs-right{width:100%}
  .rs-mobile-brand{display:block}
  .rs-card{max-width:520px}
}
`;

export default Login;