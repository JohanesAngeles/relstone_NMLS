<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RelstoneLogo.png';
import landingBg from '../../assets/images/landing_page_bg.png';
import AuthModal from '../../pages/auth_page/AuthModal';

// ─── Data ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is the SAFE Act and why does it require 20 hours of education?', a: 'The SAFE Mortgage Licensing Act (SAFE Act) is a federal law that established minimum standards for the licensing and registration of mortgage loan originators (MLOs). It requires all new MLOs to complete at least 20 hours of NMLS-approved pre-licensing education before sitting for the NMLS exam. This includes 3 hours of federal law, 3 hours of ethics, 2 hours of non-traditional lending, and 12 elective hours.' },
  { q: 'How long does it take to complete the 20-hour PE course?', a: 'The 20-hour PE course is self-paced, but NMLS requires that it be completed over a minimum of 3 days (you cannot rush through it faster than real time). Most students complete it within 1–2 weeks working a few hours per day. You have 6 months from enrollment to complete the course.' },
  { q: 'Are you an accredited NMLS-approved education provider?', a: 'Yes. RELSTONE is a fully accredited NMLS-approved education provider. Our Provider ID is listed in the NMLS Course Catalog and all completions are reported automatically to your NMLS record. You can verify our accreditation directly on the NMLS Resource Center website.' },
  { q: 'What happens after I complete the PE course?', a: "Upon successful completion of the course, you will receive a downloadable certificate of completion that you can access immediately from your student portal. Additionally, your completion is automatically reported to NMLS within 1 business day. You'll receive a confirmation email once your NMLS record has been updated." },
  { q: "Do I need to complete CE every year even if I haven't originated any loans?", a: 'Yes. NMLS requires 8 hours of CE annually for all licensed MLOs, regardless of production volume. Failure to complete CE by the deadline will result in your license being placed in an "approved-inactive" status, which prevents you from originating loans until the requirement is fulfilled and your license is renewed.' },
  { q: 'I already completed CE with another provider. Can I retake it with RELSTONE?', a: 'No. NMLS does not allow you to repeat CE coursework that has already been reported and accepted for the current calendar year. Each of the 8 required CE hours can only be counted once per year, regardless of the provider. If you have already fulfilled your CE for the year, no additional courses are needed until the following year.' },
];

const TESTIMONIALS = [
  { name: 'James R.', role: 'Mortgage Loan Originator — California', avatar: 'JR', rating: 5, text: "RELSTONE helped me get my MLO license the first time around. The course was clear, well-organized, and the NMLS reporting was instant. I'd recommend it to anyone starting in mortgage." },
  { name: 'Sarah M.', role: 'Senior MLO — Texas', avatar: 'SM', rating: 5, text: "I've done my CE renewal with RELSTONE for three years running. The courses are always up to date with the latest regulations, and the platform makes it easy to stay on track so I never miss a deadline." },
  { name: 'David K.', role: 'Branch Manager — Florida', avatar: 'DK', rating: 5, text: "The platform is incredibly well-designed and easy to navigate. Everything from enrollment to certificate download was seamless. RELSTONE is the only provider I'll use going forward." },
];

const Stars = () => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Home,
  GraduationCap,
  Award,
} from "lucide-react";
import AuthModal from "../auth_page/AuthModal";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/Left Side Logo.png";
import "./LandingPage.css";
import { HOW_IT_WORKS_STEPS, TESTIMONIALS, FAQS } from "./landingPageData";

const Stars = ({ n = 5 }) => (
  <span style={{ color: "#F59E0B", letterSpacing: 1 }}>
    {"★".repeat(n)}
    {"☆".repeat(5 - n)}
  </span>
);

// ── Logged-In Nav (mirrors Layout header) ─────────────────────────
const LoggedInNav = ({ user, logout, navigate, location }) => {
  const [showLogout, setShowLogout] = useState(false);

  const navLinks = [
    { path: "/home", label: "Home", icon: <Home size={15} /> },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    {
      path: "/my-courses",
      label: "My Courses",
      icon: <GraduationCap size={15} />,
    },
    { path: "/courses", label: "Courses", icon: <BookOpen size={15} /> },
    { path: "/certificates", label: "Certificates", icon: <Award size={15} /> },
    { path: "/checkout", label: "Checkout", icon: <ShoppingCart size={15} /> },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  const isActive = (path) => location === path;

  return (
    <>
      {showLogout && (
        <>
          <div
            onClick={() => setShowLogout(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(9,25,37,0.55)",
              backdropFilter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "100%",
              maxWidth: 360,
              background: "#fff",
              borderRadius: 22,
              padding: "32px 28px 26px",
              boxShadow: "0 28px 70px rgba(9,25,37,0.20)",
              textAlign: "center",
              fontFamily: "Inter,system-ui,sans-serif",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <LogOut size={22} color="rgba(220,38,38,0.85)" />
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 950,
                color: "rgba(11,18,32,0.88)",
                marginBottom: 8,
              }}
            >
              Sign out?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(11,18,32,0.52)",
                marginBottom: 24,
              }}
            >
              Are you sure you want to sign out of your account?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogout(false)}
                style={{
                  flex: 1,
                  height: 44,
                  background: "rgba(2,8,23,0.04)",
                  border: "1px solid rgba(2,8,23,0.10)",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "rgba(11,18,32,0.72)",
                  fontFamily: "inherit",
                }}
              >
                No, stay
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  height: 44,
                  background: "rgba(220,38,38,0.90)",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "inherit",
                }}
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </>
      )}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(246,247,251,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(2,8,23,0.08)",
          boxShadow: "0 1px 0 rgba(2,8,23,0.05)",
          fontFamily: "Inter,system-ui,sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 18px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Left — Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
              onClick={() => navigate("/home")}
            >
              <img
                src={logo}
                alt="Relstone"
                style={{ height: 28, objectFit: "contain" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 14,
                    color: "#091925",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Relstone
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 7px",
                    borderRadius: 6,
                    background: "rgba(46,171,254,0.12)",
                    border: "1px solid rgba(46,171,254,0.25)",
                    color: "#2EABFE",
                  }}
                >
                  NMLS
                </span>
              </div>
            </div>

            <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 11px",
                    borderRadius: 10,
                    border: isActive(link.path)
                      ? "1px solid rgba(46,171,254,0.20)"
                      : "none",
                    background: isActive(link.path)
                      ? "rgba(46,171,254,0.10)"
                      : "transparent",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    color: isActive(link.path)
                      ? "#091925"
                      : "rgba(9,25,37,0.60)",
                    transition: "all .15s",
                    fontFamily: "Inter,system-ui,sans-serif",
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right — User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => navigate("/profile")}
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 10,
                border: "1px solid rgba(2,8,23,0.10)",
                background: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "rgba(46,171,254,0.10)",
                  border: "1px solid rgba(46,171,254,0.20)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <User size={14} color="#2EABFE" />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: "rgba(9,25,37,0.80)",
                }}
              >
                {user?.name || "Student"}
              </span>
            </button>
            <button
              onClick={() => setShowLogout(true)}
              type="button"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(2,8,23,0.10)",
                background: "#fff",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "rgba(9,25,37,0.65)",
                transition: "all .15s",
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

// ── Public Nav ────────────────────────────────────────────────────
const PublicNav = ({ onLogin, onRegister }) => (
  <nav className="lp-nav">
    <div className="lp-container lp-nav-inner">
      <div className="lp-nav-logo">
        <div className="lp-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="#2EABFE"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 17l10 5 10-5"
              stroke="#2EABFE"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 12l10 5 10-5"
              stroke="#60C3FF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="lp-logo-text-wrap">
          <span className="lp-logo-name">Relstone</span>
          <span className="lp-logo-sub">NMLS Education Platform</span>
        </div>
      </div>
      <div className="lp-nav-links">
        <a href="#about" className="lp-nav-link">
          About
        </a>
        <a href="#features" className="lp-nav-link">
          Features
        </a>
        <a href="#courses" className="lp-nav-link">
          Courses
        </a>
        <a href="#compliance" className="lp-nav-link">
          Compliance
        </a>
      </div>
      <div className="lp-nav-actions">
        <button onClick={onLogin} className="lp-btn-ghost">
          Sign In
        </button>
        <button onClick={onRegister} className="lp-btn-primary">
          Get Started
        </button>
      </div>
    </div>
  </nav>
);

// ── Main Component ────────────────────────────────────────────────
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // modal: null | 'login' | 'register'
  const [modal, setModal] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [ctaForm, setCtaForm] = useState({ firstName: '', lastName: '', email: '', phone: '', state: '' });
  const setF = k => e => setCtaForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
<<<<<<< HEAD
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
=======
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length),
      5000,
    );
    return () => clearInterval(t);
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
  }, []);

  const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  const NAV_LINKS = [
    { href: '#courses',      label: 'Courses' },
    { href: '#why',          label: 'Why RELS' },
    { href: '#requirements', label: 'Requirements' },
    { href: '#faq',          label: 'FAQ' },
  ];

  return (
    <div className="lp-root">
<<<<<<< HEAD
      <style>{CSS}</style>

      {/* ── Full AuthModal — Sign In or Register ───────────────────────────── */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          HERO WRAPPER — bg image starts here, covers nav too
      ══════════════════════════════════════════════════════ */}
      <div className="lp-hero-wrapper" style={{ backgroundImage: `url(${landingBg})` }}>
        <div className="lp-hero-base" />
        <div className="lp-hero-gradient" />

        <header className={`lp-topbar${scrolled ? ' lp-topbar--scrolled' : ''}`}>
        <div className="lp-topbar-inner">
          <div className="lp-brand" onClick={() => window.scrollTo(0,0)} role="button" tabIndex={0}>
            <img src={logo} alt="Relstone NMLS" className="lp-brand-logo" />
          </div>
          <nav className="lp-nav">
            {NAV_LINKS.map((link, i) => (
              <a key={link.href} href={link.href} className={`lp-nav-link${i === 0 ? ' lp-nav-link--active' : ''}`}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="lp-nav-right">
            <button className="lp-nav-ghost"  onClick={() => setModal('login')}>Sign In</button>
            <button className="lp-nav-enroll" onClick={() => setModal('register')}>Enroll Now</button>
          </div>
        </div>
          <div className="lp-topbar-border" />
        </header>

        {/* ════════ HERO ════════ */}
        <section className="lp-hero">
=======
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}

      {/* ── NAV — switches based on auth ── */}
      {user ? (
        <LoggedInNav
          user={user}
          logout={logout}
          navigate={navigate}
          location={window.location.pathname}
        />
      ) : (
        <PublicNav
          onLogin={() => setModal("login")}
          onRegister={() => setModal("register")}
        />
      )}
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)

        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-left">
            {/* Eyebrow pill — Rectangle 1376 */}
            <div className="lp-hero-eyebrow-wrap">
              <span className="lp-eyebrow-dot" />
              <span className="lp-hero-eyebrow-text">NMLS-APPROVED EDUCATION PROVIDER</span>
            </div>
<<<<<<< HEAD

            <h1 className="lp-hero-h1">YOUR PATH TO<br /><span className="lp-hero-accent">MORTGAGE</span><br />LICENSURE.</h1>
            <p className="lp-hero-desc">RELSTONE delivers NMLS-approved pre-licensing and continuing education for mortgage professionals. Start your mortgage career compliant and exam-ready from day one.</p>

            <div className="lp-hero-actions">
              <button className="lp-btn-hero-solid" onClick={() => user ? navigate('/courses') : navigate('/courses')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Browse Courses
              </button>
              <button className="lp-btn-hero-outline" onClick={() => setModal('register')}>View Requirements</button>
=======
            <h1 className="lp-hero-h1">
              Your Path to
              <br />
              Mortgage
              <br />
              <span className="lp-hero-accent">Licensure.</span>
            </h1>
            <p className="lp-hero-desc">
              Relstone delivers NMLS-approved pre-licensing and continuing
              education courses built for mortgage professionals. Study at your
              own pace, stay compliant, and earn your certificates.
            </p>
            <div className="lp-hero-actions">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="lp-btn-primary lp-btn-lg"
                  >
                    Go to Dashboard
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate("/courses")}
                    className="lp-btn-ghost lp-btn-lg"
                  >
                    Browse Courses
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModal("register")}
                    className="lp-btn-primary lp-btn-lg"
                  >
                    Begin Enrollment
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setModal("login")}
                    className="lp-btn-ghost lp-btn-lg"
                  >
                    Sign In
                  </button>
                </>
              )}
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
            </div>

            {/* Badges row */}
            <div className="lp-hero-badges">
<<<<<<< HEAD
              <div className="lp-badge-item">
                <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                NMLS-Approved
              </div>
              <div className="lp-badge-sep" />
              <div className="lp-badge-item">
                <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                All 50 States
              </div>
              <div className="lp-badge-sep" />
              <div className="lp-badge-item">
                <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                Established 1978
              </div>
            </div>
          </div>

          {/* Hero right card — Rectangle 1621 */}
          <div className="lp-hero-right">
            <div className="lp-hero-stats-card">
              <div className="lp-stats-label">WHY RELSTONE NMLS</div>
              <div className="lp-stats-grid">
                {[['45+','Years in Education'],['98%','First-Time Pass Rate'],['50K+','Licensed Graduates'],['50','States Covered']].map(([n,l]) => (
                  <div key={l} className="lp-stat-box">
                    <div className="lp-stat-num">{n}</div>
                    <div className="lp-stat-desc">{l}</div>
                  </div>
                ))}
              </div>
              <div className="lp-stats-divider" />
              <div className="lp-req-label">KEY NMLS REQUIREMENTS COVERED</div>
              <div className="lp-req-list">
                {[
                  ['SAFE Act Pre-Licensing Education','20 hrs'],
                  ['Annual Continuing Education','8 hrs / yr'],
                  ['Federal Law & Ethics','Included'],
                  ['State-Specific Law Electives','50 states'],
                  ['Non-Traditional Lending Standards','Included'],
                ].map(([t,b]) => (
                  <div key={t} className="lp-req-item">
                    <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                    <span className="lp-req-text">{t}</span>
                    <span className="lp-req-badge">{b}</span>
                  </div>
                ))}
              </div>
=======
              {[
                "SAFE Act Compliant",
                "50+ States Approved",
                "Instant Certificates",
              ].map((b) => (
                <div key={b} className="lp-badge-item">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2EABFE"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="lp-hero-card-wrap">
            <div className="lp-hero-card">
              <div className="lp-hcard-header">
                <span className="lp-hcard-tag">Platform Overview</span>
              </div>
              <div className="lp-hcard-items">
                {[
                  {
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2EABFE"
                        strokeWidth="1.8"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    ),
                    label: "Course Format",
                    value: "Online Self-Study (OSS)",
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2EABFE"
                        strokeWidth="1.8"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    ),
                    label: "Access",
                    value: "24 / 7 — Any Device",
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2EABFE"
                        strokeWidth="1.8"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                    label: "Pre-Licensing",
                    value: "20-Hour SAFE Act PE Course",
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2EABFE"
                        strokeWidth="1.8"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    ),
                    label: "Continuing Education",
                    value: "8-Hour Annual CE Renewal",
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2EABFE"
                        strokeWidth="1.8"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    ),
                    label: "Certificate",
                    value: "Issued Instantly on Completion",
                  },
                ].map((item, i) => (
                  <div key={i} className="lp-hcard-item">
                    <div className="lp-hcard-icon">{item.icon}</div>
                    <div>
                      <div className="lp-hcard-label">{item.label}</div>
                      <div className="lp-hcard-value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {user ? (
                <button
                  onClick={() => navigate("/courses")}
                  className="lp-hcard-cta"
                >
                  Browse Courses →
                </button>
              ) : (
                <button
                  onClick={() => setModal("register")}
                  className="lp-hcard-cta"
                >
                  Start Enrollment →
                </button>
              )}
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
            </div>
          </div>
        </div>

        {/* Stats bar — dark band below hero */}
        <div className="lp-statsbar">
          <div className="lp-statsbar-line-top" />
          <div className="lp-container lp-statsbar-inner">
            {[['45+','YEARS EDUCATING PROFESSIONALS'],['50K+','LICENSED GRADUATES'],['50','STATES COVERED'],['98%','EXAM PASS RATE']].map(([n,l], i) => (
              <div key={l} className="lp-sbar-item">
                {i > 0 && <div className="lp-sbar-divider" />}
                <div className="lp-sbar-num">{n}</div>
                <div className="lp-sbar-lbl">{l}</div>
              </div>
            ))}
          </div>
          <div className="lp-statsbar-line-bottom" />
        </div>
        </section>
      </div>{/* end lp-hero-wrapper */}

      {/* ════════ ABOUT ════════ */}
      <section className="lp-about" id="why">
        <div className="lp-container lp-about-grid">
          <div>
            <p className="lp-eyebrow-small">— ABOUT RELSTONE NMLS</p>
            <h2 className="lp-h2">NMLS–APPROVED EDUCATION<br />BUILT FOR <span className="lp-blue">COMPLIANCE.</span></h2>
            <p className="lp-body">RELSTONE is a nationally recognized, NMLS-approved education provider with over 45 years of experience training real estate and mortgage professionals. Our curriculum is built to meet every NMLS requirement — out of the box.</p>
            <p className="lp-body">Whether you're starting your mortgage career with <strong>SAFE Act Pre-Licensing</strong>, maintaining your license with <strong>Annual Continuing Education</strong>, or seeking <strong>state-specific elective hours</strong>, RELSTONE delivers the most current, exam-relevant content available.</p>
            <p className="lp-body">All courses are fully online, self-paced, and report directly to NMLS upon completion. No scheduling, no classroom, no waiting.</p>
            <button className="lp-btn-dark" onClick={() => user ? navigate('/courses') : setModal('register')}>
              {user ? 'Browse Courses →' : 'Create Your Account →'}
            </button>
          </div>
          <div className="lp-about-cards">
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: '100% Online, Self-Paced', desc: 'Study from any device, anytime. No classroom required.', border: '#2EABFE' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008000" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Direct NMLS Reporting', desc: 'Instant NMLS reporting for completed courses.', border: '#008000' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: '98% First-Time Pass Rate', desc: 'Exam prep designed specifically for the NMLS exam.', border: '#F59E0B' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title: 'Dedicated Student Support', desc: 'Live support from licensed professionals, not automated bots.', border: '#091925' },
            ].map((c, i) => (
              <div key={i} className="lp-about-card">
                <div className="lp-about-card-icon" style={{ border: `0.5px solid ${c.border}`, background: `${c.border}18` }}>{c.icon}</div>
                <div>
                  <div className="lp-about-card-title">{c.title}</div>
                  <div className="lp-about-card-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ════════ COURSES ════════ */}
      <section className="lp-courses" id="courses">
        <div className="lp-container">
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">COURSE CATALOG</p>
            <h2 className="lp-h2">CHOOSE YOUR <span className="lp-blue">COURSE</span></h2>
            <p className="lp-sub">All courses are NMLS-approved, fully online, and report directly to your NMLS record upon completion.</p>
          </div>
          <div className="lp-course-grid">
            {[
              { tag:'PRE-LICENSING EDUCATION', title:'SAFE Act Pre-Licensing Educ. (PE)', pills:[{l:'NMLS Approved',c:'blue'},{l:'All States',c:'green'},{l:'Required',c:'orange'}], hrs:20, price:'$199', desc:'The federally mandated 20-hour pre-licensing course required for all new mortgage loan originators. Covers federal law, ethics, lending standards, and electives.', bullets:['3 Hours Federal Law','3 Hours Ethics','2 Hours Non-Traditional Lending','12 Hours Elective Topics','Direct NMLS Reporting'], cta:user?'View Course':'Enroll Now', action:()=>user?navigate('/courses'):setModal('register') },
              { tag:'CONTINUING EDUCATION', title:'Annual Continuing Education (CE)', pills:[{l:'NMLS Approved',c:'blue'},{l:'Annual Renewal',c:'green'}], hrs:8, price:'$99', desc:'The 8-hour annual continuing education requirement for all licensed mortgage loan originators. Keeps you up to date with laws, ethics, and lending regulations.', bullets:['3 Hours Federal Law Updates','2 Hours Ethics','2 Hours Non-Traditional Lending','1 Hour Elective','Direct NMLS Reporting'], cta:user?'View Course':'Enroll Now', action:()=>user?navigate('/courses'):setModal('register') },
              { tag:'STATE-SPECIFIC ELECTIVES', title:'State Law & Regulation Courses', pills:[{l:'NMLS Approved',c:'blue'},{l:'State-Specific',c:'red'}], hrs:'3+', price:'$49+', desc:"State-specific law courses required by individual state licensing authorities. Check your state's NMLS requirements for exact credit hours needed.", bullets:['California, Texas, Florida, NY + more','State-specific regulatory updates','Fulfills state elective requirements','Direct NMLS Reporting','Expert-designed mortgage training content'], cta:'View States', action:()=>user?navigate('/courses'):setModal('register') },
            ].map((c, i) => (
              <div key={i} className="lp-course-card">
                {/* Card header band */}
                <div className="lp-course-header">
                  <p className="lp-course-tag">{c.tag}</p>
                  <h3 className="lp-course-title">{c.title}</h3>
                  <div className="lp-course-pills">
                    {c.pills.map(p => <span key={p.l} className={`lp-cpill lp-cpill--${p.c}`}>{p.l}</span>)}
                  </div>
                </div>
                <div className="lp-course-body">
                  <div className="lp-course-hrs">
                    <span className="lp-hrs-num">{c.hrs}</span>
                    <div className="lp-hrs-lbl"><div>NMLS CREDIT</div><div>HOURS</div></div>
                  </div>
                  <p className="lp-course-desc">{c.desc}</p>
                  <ul className="lp-course-bullets">
                    {c.bullets.map(b => (
                      <li key={b}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="lp-course-footer">
                    <span className="lp-course-price">{c.price}<span className="lp-course-unit">/course</span></span>
                    <button className="lp-btn-blue" onClick={c.action}>{c.cta}</button>
                  </div>
                </div>
              </div>
            ))}
=======
      {/* ── ABOUT NMLS BANNER ── */}
      <div className="lp-about-banner" id="about">
        <div className="lp-container lp-banner-inner">
          <p className="lp-banner-text">
            <strong>What is NMLS?</strong> The Nationwide Multistate Licensing
            System is the official platform for U.S. mortgage licensing. The
            SAFE Act requires all Mortgage Loan Originators (MLOs) to complete
            NMLS-approved education before originating loans.
          </p>
          <a href="#courses" className="lp-banner-link">
            View Courses →
          </a>
        </div>
      </div>

      {/* ── ABOUT SECTION ── */}
      <section className="lp-about" id="about-full">
        <div className="lp-container">
          <div className="lp-section-label">ABOUT THE PLATFORM</div>
          <div className="lp-about-grid">
            <div className="lp-about-left">
              <h2 className="lp-section-h2">
                NMLS-Approved Education
                <br />
                <span className="lp-h2-accent">Built for Compliance.</span>
              </h2>
              <p className="lp-about-para">
                Relstone is an NMLS-approved education provider offering fully
                online, self-paced mortgage licensing courses. Our platform is
                designed to meet every technical requirement set by the SAFE Act
                and NMLS — from identity authentication to time tracking and
                module sequencing.
              </p>
              <p className="lp-about-para">
                Whether you're a first-time MLO applicant completing your
                20-hour pre-licensing requirement or a licensed professional
                renewing with your annual 8-hour CE, Relstone has the course you
                need — available anytime, from any device.
              </p>
              {user ? (
                <button
                  onClick={() => navigate("/courses")}
                  className="lp-btn-primary"
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Browse Courses{" "}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setModal("register")}
                  className="lp-btn-primary"
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Create Your Account{" "}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <div className="lp-about-right">
              <div className="lp-about-card">
                <div className="lp-acard-icon">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2EABFE"
                    strokeWidth="1.6"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3 className="lp-acard-title">Pre-Licensing Education (PE)</h3>
                <p className="lp-acard-desc">
                  Complete the required 20-hour SAFE Act PE course for
                  first-time MLO applicants. Covers federal law, ethics, and
                  non-traditional mortgage products.
                </p>
                <div className="lp-acard-meta">20 Hours Required</div>
              </div>
              <div className="lp-about-card">
                <div className="lp-acard-icon">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2EABFE"
                    strokeWidth="1.6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="lp-acard-title">Continuing Education (CE)</h3>
                <p className="lp-acard-desc">
                  Renew your MLO license annually with the required 8-hour CE
                  course. Must be completed by December 31st each year per state
                  law.
                </p>
                <div className="lp-acard-meta">8 Hours Per Year</div>
              </div>
            </div>
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="lp-features" id="features">
        <div className="lp-container">
<<<<<<< HEAD
          <div className="lp-section-center">
            <p className="lp-eyebrow-sky">WHY CHOOSE RELSTONE</p>
            <h2 className="lp-h2 lp-h2--light">EVERY NMLS REQUIREMENT,<br /><span className="lp-blue">OUT OF THE BOX.</span></h2>
            <p className="lp-sub lp-sub--light">Built to comply with all NMLS standards and delivered in a format that works for busy professionals.</p>
          </div>
          <div className="lp-feat-grid">
            {[
              { bg:'rgba(46,171,254,0.1)', border:'#2EABFE', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title:'Easy Course Navigation', desc:'Our platform is designed for ease of use — intuitive navigation, clear progress tracking, and zero technical friction.' },
              { bg:'rgba(0,255,9,0.1)', border:'#00FF09', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:'Regulatory Compliance', desc:'All courses are continuously updated to reflect the latest CFPB, Dodd-Frank, RESPA, and TILA regulatory changes.' },
              { bg:'rgba(245,158,11,0.1)', border:'#F59E0B', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title:'Limited-Time Licensing', desc:'NMLS enforces deadlines. Our courses keep you on track with built-in deadline reminders and renewal alerts.' },
              { bg:'rgba(149,105,247,0.1)', border:'#9569F7', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9569F7" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>, title:'Live Student Support', desc:'Real humans answer your questions. Our support team includes licensed mortgage professionals who understand the industry.' },
              { bg:'rgba(46,171,254,0.1)', border:'#2EABFE', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title:'Instant Certificates', desc:'Download your certificate of completion immediately upon finishing. Print or share digitally — always available in your student portal.' },
              { bg:'rgba(239,68,68,0.1)', border:'#EF4444', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, title:'Mobile-Friendly Platform', desc:"Study on any device — phone, tablet, or desktop. Your progress syncs automatically so you never lose your place." },
=======
          <div className="lp-section-label lp-section-label--light">
            PLATFORM FEATURES
          </div>
          <div className="lp-features-top">
            <h2 className="lp-section-h2 lp-section-h2--light">
              Every NMLS Requirement,
              <br />
              <span className="lp-h2-accent-light">Out of the Box.</span>
            </h2>
            <p className="lp-features-sub">
              Our LMS is engineered to satisfy every technical specification
              required by the NMLS for online course delivery.
            </p>
          </div>
          <div className="lp-feat-grid">
            {[
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: "BioSig-ID Authentication",
                desc: "Every Online Self-Study course uses BioSig-ID identity verification as required by NMLS effective August 2017.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Engagement Time Tracking",
                desc: "The platform tracks active engagement time only. Students are automatically logged out after 6 minutes of inactivity.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                title: "Locked Module Sequencing",
                desc: "Students must advance linearly through course modules. No module can be skipped until all prior activities are completed.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                title: "Rules of Conduct (ROCS V4)",
                desc: "Students must read and digitally agree to NMLS Rules of Conduct before every course. Provider logs are maintained for 5 years.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: "Bookmarking & Resume",
                desc: "Students can log out at any time and resume exactly where they left off. Course progress is preserved automatically.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
                title: "Instant Completion Certificate",
                desc: "NMLS-compliant certificates are issued immediately upon course completion. Credit is reported to NMLS within 7 calendar days.",
              },
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
            ].map((f, i) => (
              <div key={i} className="lp-feat-card">
                <div className="lp-feat-icon" style={{ background: f.bg, border: `0.5px solid ${f.border}` }}>{f.icon}</div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ REQUIREMENTS ════════ */}
      <section className="lp-requirements" id="requirements">
        <div className="lp-container">
<<<<<<< HEAD
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">NMLS REQUIREMENTS</p>
            <h2 className="lp-h2">BUILT TO MEET EVERY<br /><span className="lp-blue">NMLS STANDARD.</span></h2>
            <p className="lp-sub">Every course is designed with the NMLS requirement checklist in mind so you graduate fully compliant — first time, every time.</p>
          </div>
          <div className="lp-req-grid">
            {[
              { t:'Dedicated Student Support', d:'Federal requirement for all new MLOs. Covers federal law, ethics, non-traditional lending, and 12 elective hours.' },
              { t:'8-Hour Annual Continuing Education', d:'Required every year for license renewal. Must include 3 hrs federal law, 2 hrs ethics, 2 hrs non-traditional lending.' },
              { t:'State-Specific Law Requirements', d:'Many states require additional state law hours. We offer state-specific courses for CA, TX, FL, NY, and more.' },
              { t:'Background & Credit Check Compliance', d:'We guide you through the NMLS background check and credit report requirements before licensing.' },
              { t:'8-Year Waiting Period Guidance', d:'Certain felonies require a waiting period before licensure. We help you understand your eligibility upfront.' },
              { t:'High-Cost Mortgage Loan Training', d:'Coverage of HOEPA, TILA Section 32, and high-cost mortgage guidelines required for full compliance.' },
              { t:'Right of Rescission & RESPA', d:'Detailed coverage of the three-day right of rescission and RESPA requirements including affiliated business arrangements.' },
              { t:'Equal Credit Opportunity Act (ECOA)', d:'Prohibition of credit discrimination and notification requirements thoroughly covered in our ethics modules.' },
            ].map((r, i) => (
              <div key={i} className="lp-req-card">
                <div className="lp-req-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div className="lp-req-title">{r.t}</div>
                  <div className="lp-req-desc">{r.d}</div>
                </div>
              </div>
=======
          <div className="lp-section-label">AVAILABLE COURSES</div>
          <div className="lp-courses-top">
            <h2 className="lp-section-h2">
              Choose Your <span className="lp-h2-accent">Course</span>
            </h2>
            <p className="lp-courses-sub">
              NMLS-approved courses available 24/7 online, at your own pace.
            </p>
          </div>
          <div className="lp-course-table">
            <div className="lp-course-row lp-course-row--featured">
              <div className="lp-course-badge-wrap">
                <span className="lp-course-tag">Pre-Licensing</span>
              </div>
              <div className="lp-course-info">
                <h3 className="lp-course-title">
                  SAFE Act Pre-Licensing Education (PE)
                </h3>
                <p className="lp-course-desc">
                  Required for all first-time MLO applicants. Covers federal
                  mortgage law, ethics, fraud, non-traditional mortgage
                  products, and state-specific electives.
                </p>
                <div className="lp-course-topics-row">
                  <span className="lp-topic-chip">Federal Law (3 hrs)</span>
                  <span className="lp-topic-chip">Ethics (3 hrs)</span>
                  <span className="lp-topic-chip">Non-Traditional (2 hrs)</span>
                  <span className="lp-topic-chip">Electives (12 hrs)</span>
                </div>
              </div>
              <div className="lp-course-meta">
                <div className="lp-course-hours-badge">
                  20<span>HRS</span>
                </div>
                {user ? (
                  <button
                    onClick={() => navigate("/courses")}
                    className="lp-btn-primary"
                  >
                    View Course
                  </button>
                ) : (
                  <button
                    onClick={() => setModal("register")}
                    className="lp-btn-primary"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
            <div className="lp-course-row">
              <div className="lp-course-badge-wrap">
                <span className="lp-course-tag lp-course-tag--ce">
                  Continuing Ed
                </span>
              </div>
              <div className="lp-course-info">
                <h3 className="lp-course-title">
                  Annual Continuing Education (CE)
                </h3>
                <p className="lp-course-desc">
                  Required annually for all licensed MLOs to maintain and renew
                  their mortgage license. Must be completed by December 31st
                  each year.
                </p>
                <div className="lp-course-topics-row">
                  <span className="lp-topic-chip">Federal Update (3 hrs)</span>
                  <span className="lp-topic-chip">Ethics (2 hrs)</span>
                  <span className="lp-topic-chip">Non-Traditional (2 hrs)</span>
                  <span className="lp-topic-chip">State Elective (1 hr)</span>
                </div>
              </div>
              <div className="lp-course-meta">
                <div className="lp-course-hours-badge lp-course-hours-badge--ce">
                  8<span>HRS</span>
                </div>
                {user ? (
                  <button
                    onClick={() => navigate("/courses")}
                    className="lp-btn-outline"
                  >
                    View Course
                  </button>
                ) : (
                  <button
                    onClick={() => setModal("register")}
                    className="lp-btn-outline"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-process" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-label lp-section-label--light">
            HOW IT WORKS
          </div>
          <div className="lp-process-top">
            <div>
              <h2 className="lp-section-h2 lp-section-h2--light">
                The Full{" "}
                <span className="lp-h2-accent-light">Licensing Journey</span>
              </h2>
              <p className="lp-process-sub">
                A clear 8-step path from account creation to annual renewal,
                presented in the same guided flow students follow in real life.
              </p>
            </div>

            <div className="lp-process-intro-card">
              <div className="lp-process-intro-label">
                From first enrollment to renewal
              </div>
              <p>
                Relstone handles the education side cleanly, then guides
                students through what comes next so the entire licensing process
                feels ordered instead of fragmented.
              </p>
            </div>
          </div>

          <div className="lp-process-grid">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <article key={step.number} className="lp-process-card">
                <div className="lp-process-step">Step {step.number}</div>
                <div className="lp-process-num">{step.number}</div>
                <h3 className="lp-process-title">{step.title}</h3>
                <p className="lp-process-desc">{step.desc}</p>
              </article>
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section className="lp-testimonials">
        <div className="lp-container">
<<<<<<< HEAD
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">STUDENT SUCCESS STORIES</p>
            <h2 className="lp-h2">REAL RESULTS FROM<br /><span className="lp-blue">REAL MORTGAGE PROFESSIONALS</span></h2>
            <p className="lp-sub">Thousands of MLOs have used RELSTONE to get licensed and stay compliant.</p>
          </div>
          <div className="lp-tcard-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lp-tcard">
                <Stars />
                <p className="lp-tcard-text">"{t.text}"</p>
                <div className="lp-tcard-author">
                  <div className="lp-tcard-avatar">{t.avatar}</div>
                  <div>
                    <div className="lp-tcard-name">{t.name}</div>
                    <div className="lp-tcard-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
=======
          <div className="lp-section-label">REGULATORY COMPLIANCE</div>
          <div className="lp-compliance-grid">
            <div className="lp-compliance-left">
              <h2 className="lp-section-h2">
                Built to Meet Every
                <br />
                <span className="lp-h2-accent">NMLS Standard.</span>
              </h2>
              <p className="lp-comp-para">
                Our platform is engineered from the ground up to satisfy every
                technical and regulatory requirement mandated by the NMLS for
                online course providers — so your education hours are always
                valid and reportable.
              </p>
            </div>
            <div className="lp-compliance-right">
              {[
                {
                  label: "SAFE Act Compliance",
                  desc: "All courses meet federal SAFE Act minimum time and content requirements.",
                },
                {
                  label: "BioSig-ID Integration",
                  desc: "Biometric identity authentication on every self-study course.",
                },
                {
                  label: "ROCS V4 Agreement",
                  desc: "Rules of Conduct click-through enforced before every course session.",
                },
                {
                  label: "7-Day Credit Reporting",
                  desc: "Completions reported to NMLS within 7 calendar days of course finish.",
                },
                {
                  label: "Cross-Browser Compatible",
                  desc: "Works on all modern browsers, PC and Mac, with no plugins required.",
                },
                {
                  label: "24/7 Course Access",
                  desc: "Students can access course materials any time via the internet.",
                },
              ].map((c, i) => (
                <div key={i} className="lp-comp-item">
                  <div className="lp-comp-check">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2EABFE"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="lp-comp-label">{c.label}</div>
                    <div className="lp-comp-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-testimonials-section">
        <div className="lp-container">
          <div className="lp-section-head-center">
            <div className="lp-section-label">Student Reviews</div>
            <h2 className="lp-section-h2">
              Real Results From
              <br />
              <span className="lp-h2-accent">Real Mortgage Professionals</span>
            </h2>
          </div>
          <div className="lp-testimonials">
            <div className="lp-tcard-wrap">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className={`lp-tcard ${i === activeTestimonial ? "lp-tcard--active" : ""}`}
                >
                  <div className="lp-tcard-stars">
                    <Stars n={t.rating} />
                  </div>
                  <p className="lp-tcard-text">"{t.text}"</p>
                  <div className="lp-tcard-author">
                    <div className="lp-tcard-avatar">{t.avatar}</div>
                    <div>
                      <div className="lp-tcard-name">{t.name}</div>
                      <div className="lp-tcard-state">{t.state}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-tdots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`lp-tdot ${i === activeTestimonial ? "lp-tdot--active" : ""}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
            <div className="lp-tarrows">
              <button
                className="lp-tarrow"
                onClick={() =>
                  setActiveTestimonial(
                    (p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
                  )
                }
              >
                ←
              </button>
              <button
                className="lp-tarrow"
                onClick={() =>
                  setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length)
                }
              >
                →
              </button>
            </div>
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="lp-faq" id="faq">
        <div className="lp-container lp-faq-wrap">
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">COMMON QUESTIONS</p>
            <h2 className="lp-h2">COMMON <span className="lp-blue">QUESTIONS</span></h2>
            <p className="lp-sub">Everything you need to know about NMLS licensing education.</p>
          </div>
          <div className="lp-faq-list">
            {FAQS.map((f, i) => (
<<<<<<< HEAD
              <div key={i} className={`lp-faq-item${openFaq === i ? ' lp-faq-item--open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className={`lp-faq-toggle${openFaq === i ? ' lp-faq-toggle--open' : ''}`}>
                    {openFaq === i
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
=======
              <div
                key={i}
                className={`lp-faq-item ${openFaq === i ? "lp-faq-item--open" : ""}`}
              >
                <button
                  className="lp-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="lp-faq-icon">
                    {openFaq === i ? "−" : "+"}
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
                  </span>
                </button>
                {openFaq === i && <div className="lp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ════════ CTA + FORM ════════ */}
      <section className="lp-cta-section">
        <div className="lp-container lp-cta-grid">
          <div>
            <p className="lp-eyebrow-small">— GET STARTED TODAY</p>
            <h2 className="lp-cta-h2">READY TO START YOUR<br /><span className="lp-blue">BUILT FOR COMPLIANCE.</span></h2>
            <p className="lp-body" style={{ marginBottom: 20 }}>Create your free account and get instant access to course previews, state requirements, and enrollment options. No credit card required.</p>
            <div className="lp-cta-checks">
              {['Instant access to 100% online courses','NMLS completions reported automatically','State requirements checked for you','Live student support from day one','Certificate download upon completion'].map(t => (
                <div key={t} className="lp-cta-check">
                  <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-signup-card">
            <p className="lp-signup-label">CREATE YOUR FREE ACCOUNT</p>
            {/* CTA form — on submit opens the full register modal */}
            <form className="lp-signup-form" onSubmit={e => { e.preventDefault(); setModal('register'); }}>
              <div className="lp-signup-row">
                <input className="lp-signup-inp" placeholder="First Name" value={ctaForm.firstName} onChange={setF('firstName')} required />
                <input className="lp-signup-inp" placeholder="Last Name" value={ctaForm.lastName} onChange={setF('lastName')} required />
              </div>
              <input className="lp-signup-inp" placeholder="Email Address" type="email" value={ctaForm.email} onChange={setF('email')} required />
              <input className="lp-signup-inp" placeholder="Phone Number (Optional)" type="tel" value={ctaForm.phone} onChange={setF('phone')} />
              <select className="lp-signup-inp lp-signup-sel" value={ctaForm.state} onChange={setF('state')}>
                <option value="">Select Your State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="lp-signup-btn">Create Free Account ——</button>
              <p className="lp-signup-fine">No credit card required · Instant access · Secure enrollment</p>
            </form>
=======
      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-container lp-cta-inner">
          <div className="lp-cta-eyebrow">
            NMLS-Approved • SAFE Act Compliant • Online Self-Study
          </div>
          <h2 className="lp-cta-h2">
            Ready to Start Your
            <br />
            Mortgage Career?
          </h2>
          <p className="lp-cta-p">
            {user
              ? "Continue your NMLS education journey. Browse courses and earn your certificates."
              : "Create your account today and get immediate access to NMLS-approved pre-licensing and continuing education courses."}
          </p>
          <div className="lp-cta-btns">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="lp-btn-primary lp-btn-lg"
                >
                  Go to Dashboard
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate("/courses")}
                  className="lp-cta-login-link"
                >
                  Browse all courses →
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModal("register")}
                  className="lp-btn-primary lp-btn-lg"
                >
                  Create Account
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setModal("login")}
                  className="lp-cta-login-link"
                >
                  Already have an account? Sign In →
                </button>
              </>
            )}
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
          </div>
        </div>
      </section>

      {/* ════════ FOOTER CTA BAND ════════ */}
      <div className="lp-footer-band">
        <div className="lp-footer-band-overlay" />
        <div className="lp-container lp-footer-band-inner">
          <div>
            <p className="lp-footer-band-eye">— RELSTONE · NMLS — START TODAY</p>
            <h2 className="lp-footer-band-h2">READY TO START YOUR<br /><span className="lp-blue">MORTGAGE CAREER?</span></h2>
            <p className="lp-footer-band-sub">Join thousands of licensed mortgage professionals who started with RELSTONE. Enroll today and get your NMLS license faster.</p>
          </div>
          <button className="lp-btn-enroll" onClick={() => user ? navigate('/courses') : setModal('register')}>
            Start Enrollment ——
          </button>
        </div>
      </div>

      {/* ════════ FOOTER ════════ */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
<<<<<<< HEAD
          <p className="lp-footer-copy">
            © Copyright {new Date().getFullYear()} <a href="#" className="lp-footer-link-blue">Real Estate License Services, Inc.</a> — A California School Established 1978. All Rights Reserved.
          </p>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">Privacy Policy</a>
            <span className="lp-footer-dot">·</span>
            <a href="#" className="lp-footer-link">Terms of Use</a>
            <span className="lp-footer-dot">·</span>
            <a href="#" className="lp-footer-link">NMLS Disclosure</a>
=======
          <div className="lp-footer-brand">
            <div className="lp-logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  stroke="#2EABFE"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17l10 5 10-5"
                  stroke="#2EABFE"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12l10 5 10-5"
                  stroke="#60C3FF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="lp-footer-name">Relstone</div>
              <div className="lp-footer-tagline">NMLS Education Platform</div>
            </div>
          </div>
          <div className="lp-footer-mid">
            <p className="lp-footer-copy">
              © {new Date().getFullYear()} Relstone. NMLS-approved education
              provider. All rights reserved.
            </p>
            <p className="lp-footer-note">
              For course approvals and credit banking inquiries, contact NMLS at
              nmls.ed1@csbs.org
            </p>
          </div>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">
              Terms of Service
            </a>
            <a href="#" className="lp-footer-link">
              Privacy Policy
            </a>
            <a href="mailto:support@relstone.com" className="lp-footer-link">
              Contact Support
            </a>
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
          </div>
        </div>
      </footer>
    </div>
  );
};

<<<<<<< HEAD
// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Poppins', system-ui, sans-serif; background: #F2F6F9; }

.lp-root { font-family: 'Poppins', system-ui, sans-serif; color: #091925; overflow-x: hidden; }
.lp-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.lp-blue { color: #2EABFE; }

/* ════ HERO WRAPPER — spans nav + hero, holds the bg image ════ */
.lp-hero-wrapper {
  position: relative;
  background-color: #091925;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  padding-top: 71px; /* fixed nav height + border */
}
/* Dark base overlay — very light so the bg image is clearly visible */
.lp-hero-base {
  position: absolute; inset: 0;
  background: rgba(9, 25, 37, 0.28);
  z-index: 1;
  pointer-events: none;
}
/* Blue tint gradient overlay — very subtle */
.lp-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(9,25,37,0.0) 0%, rgba(46,171,254,0.12) 100%);
  z-index: 2;
  pointer-events: none;
}

/* ════ NAV — fixed, transparent at top, solid when scrolled ════ */
.lp-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(9, 25, 37, 0.15);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}
.lp-topbar--scrolled {
  background: rgba(9, 25, 37, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.07);
}
.lp-topbar-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 40px;
  height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.lp-topbar-border {
  width: 100%; height: 1px; background: rgba(255,255,255,0.5);
}
.lp-brand { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; border: none; background: none; padding: 0; }
.lp-brand:focus { outline: none; }

/* ── LOGO — reduced from 36px to 24px ── */
.lp-brand-logo { height: 30px; object-fit: contain; display: block; }

.lp-nav { display: flex; align-items: center; gap: 2px; }
.lp-nav-link {
  padding: 7px 16px; font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.72); text-decoration: none;
  border-radius: 6px; transition: color .15s;
  font-family: 'Poppins', sans-serif; white-space: nowrap;
}
.lp-nav-link:hover { color: #fff; }
.lp-nav-link--active { color: #2EABFE; font-weight: 600; }
.lp-nav-right { display: flex; align-items: center; gap: 10px; }
.lp-nav-ghost {
  padding: 7px 18px; font-size: 13px; font-weight: 600;
  color: #fff; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.7);
  background: transparent; cursor: pointer;
  font-family: 'Poppins', sans-serif; transition: border-color .15s; white-space: nowrap;
}
.lp-nav-ghost:hover { border-color: #fff; }
.lp-nav-enroll {
  padding: 8px 20px; font-size: 13px; font-weight: 700;
  color: #091925; background: #2EABFE; border-radius: 7px;
  border: 0.5px solid #2EABFE; cursor: pointer;
  font-family: 'Poppins', sans-serif; transition: background .15s; white-space: nowrap;
}
.lp-nav-enroll:hover { background: #1a9ee0; }

/* ════ HERO — fills viewport minus nav ════ */
.lp-hero {
  position: relative;
  background: transparent;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 71px);
  justify-content: center;
}
.lp-hero-bg { display: none; }

.lp-hero-inner {
  position: relative; z-index: 3;
  flex: 1;
  display: grid; grid-template-columns: 1fr 460px;
  gap: 40px; align-items: center;
  padding: 50px 40px 44px;
  max-width: 1200px; margin: 0 auto; width: 100%;
}

/* Eyebrow pill */
.lp-hero-eyebrow-wrap {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 12px; height: 28px;
  background: rgba(46,171,254,0.1);
  border: 0.5px solid #2EABFE;
  border-radius: 100px;
  margin-bottom: 18px;
}
.lp-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #00FF09;
  box-shadow: 0 0 4px #00FF09;
  flex-shrink: 0;
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.lp-hero-eyebrow-text {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 700;
  color: #2EABFE; letter-spacing: 0.5px;
  text-transform: uppercase;
}

.lp-hero-h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 58px; line-height: 56px;
  font-weight: 700; color: #fff;
  text-transform: uppercase;
  margin-bottom: 18px;
}
.lp-hero-accent { color: #2EABFE; }
.lp-hero-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 15px; line-height: 22px; font-weight: 500;
  color: rgba(255,255,255,0.82); max-width: 480px; margin-bottom: 26px;
}
.lp-hero-actions { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }

/* Buttons */
.lp-btn-hero-solid {
  display: inline-flex; align-items: center; gap: 8px;
  width: 160px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #091925; background: #2EABFE;
  border-radius: 5px; border: 0.5px solid #2EABFE;
  cursor: pointer; justify-content: center;
  transition: background .15s;
}
.lp-btn-hero-solid:hover { background: #60C3FF; }
.lp-btn-hero-outline {
  display: inline-flex; align-items: center; justify-content: center;
  width: 160px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; border: 1px solid #fff;
  border-radius: 5px; background: transparent;
  cursor: pointer; transition: all .15s;
}
.lp-btn-hero-outline:hover { background: rgba(255,255,255,0.08); }

/* Badges */
.lp-hero-badges { display: flex; align-items: center; flex-wrap: wrap; }
.lp-badge-item {
  display: flex; align-items: center; gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500; color: #fff;
}
.lp-badge-sep {
  width: 0; height: 9px;
  border-left: 0.5px solid #2EABFE;
  margin: 0 12px;
}

/* Hero right stats card */
.lp-hero-stats-card {
  background: rgba(46,171,254,0.1);
  border: 0.5px solid #2EABFE;
  border-radius: 8px;
  padding: 20px;
}
.lp-stats-label {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #fff; letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.lp-stats-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; margin-bottom: 0;
}
.lp-stat-box {
  background: rgba(46,171,254,0.1);
  border: 0.5px solid #2EABFE;
  padding: 10px 10px; text-align: center;
}
.lp-stat-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px; font-weight: 800; color: #2EABFE;
  line-height: 1.2;
}
.lp-stat-desc {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; font-weight: 500;
  color: #fff; line-height: 1.4; text-align: center;
}
.lp-stats-divider {
  width: 100%; height: 0.5px;
  background: #2EABFE;
  margin: 14px 0;
}
.lp-req-label {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #fff; letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.lp-req-list { display: flex; flex-direction: column; gap: 9px; }
.lp-req-item { display: flex; align-items: center; gap: 8px; }
.lp-req-text {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500; color: #fff;
}
.lp-req-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500; color: #2EABFE; white-space: nowrap;
}

/* Stats bar */
.lp-statsbar {
  position: relative; z-index: 10;
  background: rgba(9,25,37,0.75);
}
.lp-statsbar-line-top, .lp-statsbar-line-bottom {
  width: 100%; height: 0;
  border-top: 0.5px solid #2EABFE;
}
.lp-statsbar-inner {
  display: grid; grid-template-columns: repeat(4,1fr);
  padding: 16px 40px;
  max-width: 1200px; margin: 0 auto;
  position: relative;
}
.lp-sbar-item {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 12px 10px;
  position: relative;
}
.lp-sbar-divider {
  position: absolute; left: 0; top: 50%;
  transform: translateY(-50%);
  width: 0; height: 100px;
  border-left: 0.5px solid #2EABFE;
}
.lp-sbar-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 40px; font-weight: 800; color: #2EABFE;
  line-height: 1.2;
}
.lp-sbar-lbl {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 700;
  color: #fff; margin-top: 3px;
  text-transform: uppercase; letter-spacing: 0.5px;
}

/* ════ Shared ════ */
.lp-eyebrow-small {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 500;
  color: #2EABFE; margin-bottom: 6px;
  text-transform: uppercase;
  display: flex; align-items: center; gap: 6px;
}
.lp-eyebrow-blue {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 500;
  color: #2EABFE; margin-bottom: 6px;
  text-transform: uppercase; display: inline-block;
}
.lp-eyebrow-sky {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 500;
  color: #2EABFE; margin-bottom: 6px;
  text-transform: uppercase; display: inline-block;
}
.lp-h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 38px; font-weight: 700;
  line-height: 40px; color: #091925;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.lp-h2--light { color: #fff; }
.lp-sub {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 400;
  color: #091925; line-height: 22px;
}
.lp-sub--light { color: rgba(255,255,255,0.7); }
.lp-body {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 400;
  line-height: 22px; color: #091925; margin-bottom: 12px;
}
.lp-body strong { color: #091925; font-weight: 600; }
.lp-section-center { text-align: center; margin-bottom: 40px; }

/* ════ ABOUT — full viewport height ════ */
.lp-about {
  padding: 64px 0;
  background: #fff;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; width: 100%; }
.lp-btn-dark {
  display: inline-flex; align-items: center;
  padding: 0 20px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; background: #091925;
  border-radius: 5px; border: 0.5px solid #091925;
  cursor: pointer; margin-top: 8px; transition: background .15s;
}
.lp-btn-dark:hover { background: #1e3a52; }
.lp-about-cards { display: flex; flex-direction: column; gap: 12px; }
.lp-about-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 18px;
  border: 0.5px solid #5B7384;
  border-radius: 5px; background: #fff;
  transition: box-shadow .2s;
}
.lp-about-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.lp-about-card-icon {
  width: 48px; height: 48px; min-width: 48px;
  border-radius: 5px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lp-about-card-title {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 3px;
  line-height: 18px;
}
.lp-about-card-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 400; color: #091925; line-height: 18px;
}

/* ════ COURSES — full viewport height ════ */
.lp-courses {
  padding: 64px 0;
  background: #F2F6F9;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-courses .lp-container { width: 100%; }
.lp-course-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-course-card {
  background: #fff;
  border: 0.5px solid rgba(46,171,254,0.5);
  border-radius: 5px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.lp-course-header {
  background: #091925;
  position: relative;
  padding: 18px 20px;
  min-height: 120px;
}
.lp-course-header::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%);
  pointer-events: none;
}
.lp-course-body { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }
.lp-course-tag {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 500;
  color: #2EABFE; margin-bottom: 5px;
  text-transform: uppercase; position: relative; z-index: 1;
}
.lp-course-title {
  font-family: 'Poppins', sans-serif;
  font-size: 18px; font-weight: 700;
  color: #fff; line-height: 1.2; margin-bottom: 8px;
  text-transform: capitalize; position: relative; z-index: 1;
}
.lp-course-pills { display: flex; gap: 5px; flex-wrap: wrap; position: relative; z-index: 1; }
.lp-cpill {
  padding: 2px 8px; border-radius: 4px;
  font-family: 'Poppins', sans-serif;
  font-size: 10px; font-weight: 700; height: 22px;
  display: inline-flex; align-items: center; text-transform: capitalize;
}
.lp-cpill--blue   { background: rgba(46,171,254,0.1); color: #2EABFE; border: 0.5px solid #2EABFE; }
.lp-cpill--green  { background: rgba(0,255,9,0.1);   color: #00FF09; border: 0.5px solid #00FF09; }
.lp-cpill--orange { background: rgba(245,158,11,0.1); color: #F59E0B; border: 0.5px solid #F59E0B; }
.lp-cpill--teal   { background: rgba(0,255,9,0.1);   color: #00FF09; border: 0.5px solid #00FF09; }
.lp-cpill--red    { background: rgba(239,68,68,0.1); color: #EF4444; border: 0.5px solid #EF4444; }
.lp-course-hrs { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; margin-top: 2px; }
.lp-hrs-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 40px; font-weight: 800; color: #2EABFE; line-height: 1;
}
.lp-hrs-lbl {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 500;
  color: #7FA8C4; line-height: 1.4; text-transform: uppercase;
}
.lp-course-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 400;
  line-height: 20px; color: #091925; margin-bottom: 12px;
}
.lp-course-bullets {
  list-style: none; display: flex; flex-direction: column;
  gap: 5px; flex: 1; margin-bottom: 16px;
}
.lp-course-bullets li {
  display: flex; align-items: center; gap: 7px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 400; color: #5B7384; line-height: 15px;
}
.lp-course-footer {
  display: flex; align-items: center; justify-content: space-between;
  border-top: 0.5px solid rgba(46,171,254,0.5);
  padding-top: 14px; margin-top: auto;
}
.lp-course-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px; font-weight: 800; color: #091925; line-height: 1;
}
.lp-course-unit {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 500; color: #7FA8C4; margin-left: 2px;
}
.lp-btn-blue {
  padding: 0 14px; height: 36px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #091925; background: #2EABFE;
  border: 0.5px solid #2EABFE;
  border-radius: 5px; cursor: pointer;
  transition: background .15s; white-space: nowrap;
  min-width: 110px;
}
.lp-btn-blue:hover { background: #1a9ee0; color: #fff; }

/* ════ FEATURES — full viewport height ════ */
.lp-features {
  padding: 64px 0;
  background: #091925;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.lp-features::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%);
  pointer-events: none; z-index: 0;
}
.lp-features .lp-container { position: relative; z-index: 1; width: 100%; }
.lp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.lp-feat-card {
  padding: 22px 18px;
  border: 0.5px solid rgba(46,171,254,0.2);
  border-radius: 5px;
  background: rgba(46,171,254,0.05);
  transition: background .2s, border-color .2s;
}
.lp-feat-card:hover { background: rgba(46,171,254,0.1); border-color: rgba(46,171,254,0.3); }
.lp-feat-icon {
  width: 52px; height: 52px; border-radius: 5px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
}
.lp-feat-title {
  font-family: 'Poppins', sans-serif;
  font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 22px;
}
.lp-feat-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 400; line-height: 20px; color: rgba(255,255,255,0.65);
}

/* ════ REQUIREMENTS — full viewport height ════ */
.lp-requirements {
  padding: 64px 0;
  background: #F2F6F9;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-requirements .lp-container { width: 100%; }
.lp-req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp-req-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 18px;
  border: 0.5px solid #5B7384;
  border-radius: 5px; background: #fff;
}
.lp-req-check {
  width: 18px; height: 18px; border-radius: 50%;
  background: #008000; border: 0.25px solid #008000;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.lp-req-title {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 4px; line-height: 18px;
}
.lp-req-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 400; line-height: 16px; color: #091925;
}

/* ════ TESTIMONIALS — full viewport height ════ */
.lp-testimonials {
  padding: 64px 0;
  background: #F2F6F9;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-testimonials .lp-container { width: 100%; }
.lp-tcard-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-tcard {
  background: #fff;
  border: 0.5px solid rgba(46,171,254,0.5);
  border-radius: 5px; padding: 20px 22px;
  display: flex; flex-direction: column; gap: 12px;
}
.lp-tcard-text {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 400;
  line-height: 18px; color: #091925;
  font-style: italic; flex: 1;
}
.lp-tcard-author { display: flex; align-items: center; gap: 10px; }
.lp-tcard-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: #2EABFE;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 11px; font-weight: 700; color: #091925; flex-shrink: 0;
}
.lp-tcard-name {
  font-family: 'Poppins', sans-serif;
  font-size: 13px; font-weight: 700; color: #091925; line-height: 16px;
}
.lp-tcard-role {
  font-family: 'Poppins', sans-serif;
  font-size: 12px; font-weight: 400; color: #5B7384;
}

/* ════ FAQ — full viewport height ════ */
.lp-faq {
  padding: 64px 0;
  background: #F2F6F9;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-faq-wrap { max-width: 700px; margin: 0 auto; padding: 0 18px; width: 100%; }
.lp-faq-list { display: flex; flex-direction: column; gap: 8px; }
.lp-faq-item {
  border: 0.5px solid #5B7384;
  border-radius: 5px; overflow: hidden; background: #fff;
  transition: border-color .2s;
}
.lp-faq-item--open { border-color: #5B7384; }
.lp-faq-q {
  width: 100%; padding: 15px 18px;
  display: flex; justify-content: space-between; align-items: center; gap: 14px;
  background: none; border: none; cursor: pointer;
  font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700;
  color: #091925; text-align: left; line-height: 18px;
}
.lp-faq-item--open .lp-faq-q { background: rgba(46,171,254,0.1); }
.lp-faq-toggle {
  width: 28px; height: 28px; border-radius: 5px;
  border: 0.5px solid #5B7384;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all .2s;
}
.lp-faq-toggle--open { background: #2EABFE; border-color: #2EABFE; }
.lp-faq-a {
  padding: 12px 18px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 400; line-height: 20px; color: #091925;
  background: rgba(46,171,254,0.05);
}

/* ════ CTA — full viewport height ════ */
.lp-cta-section {
  padding: 64px 0;
  background: #F2F6F9;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.lp-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; width: 100%; }
.lp-cta-h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 38px; font-weight: 700; line-height: 40px;
  color: #091925; margin-bottom: 12px; text-transform: uppercase;
}
.lp-cta-checks { display: flex; flex-direction: column; gap: 7px; margin-top: 8px; }
.lp-cta-check {
  display: flex; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500; color: #5B7384;
}
.lp-signup-card {
  background: #fff; border: 0.5px solid #5B7384;
  border-radius: 5px; padding: 24px;
}
.lp-signup-label {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 500;
  color: #2EABFE; margin-bottom: 16px; text-transform: uppercase;
}
.lp-signup-form { display: flex; flex-direction: column; gap: 10px; }
.lp-signup-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lp-signup-inp {
  width: 100%; padding: 10px 12px;
  border: 0.5px solid #7FA8C4; border-radius: 5px;
  font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
  color: #091925; outline: none; transition: border-color .15s;
  background: rgba(127,168,196,0.1); height: 46px;
}
.lp-signup-inp:focus { border-color: #2EABFE; }
.lp-signup-inp::placeholder { color: rgba(127,168,196,0.5); }
.lp-signup-sel {
  color: rgba(91,115,132,0.75); appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
  padding-right: 30px;
}
.lp-signup-btn {
  padding: 0; height: 46px;
  background: #091925; color: #fff;
  border: 0.5px solid #091925; border-radius: 5px;
  font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background .15s;
}
.lp-signup-btn:hover { background: #1e3a52; }
.lp-signup-fine {
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500; color: #7FA8C4;
}

/* ════ FOOTER BAND ════ */
.lp-footer-band { background: #091925; padding: 52px 0; position: relative; overflow: hidden; }
.lp-footer-band-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%);
  z-index: 0;
}
.lp-footer-band-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap;
}
.lp-footer-band-eye {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 500; color: #2EABFE;
  margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
}
.lp-footer-band-h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 40px; font-weight: 700; line-height: 42px;
  color: #fff; margin-bottom: 12px; text-transform: uppercase;
}
.lp-footer-band-sub {
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 400; line-height: 22px;
  color: rgba(255,255,255,0.65); max-width: 480px;
}
.lp-btn-enroll {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 32px; height: 58px;
  background: #2EABFE; color: #091925;
  font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700;
  border-radius: 999px; border: 0.5px solid #2EABFE;
  cursor: pointer; white-space: nowrap; transition: all .2s;
  min-width: 240px;
}
.lp-btn-enroll:hover { background: #60C3FF; transform: translateY(-2px); }

/* ════ FOOTER ════ */
.lp-footer { background: #091925; border-top: 1px solid rgba(255,255,255,0.07); padding: 16px 0; }
.lp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.lp-footer-copy { font-family: 'Poppins', sans-serif; font-size: 11px; color: rgba(255,255,255,0.42); }
.lp-footer-link-blue { color: #2EABFE; text-decoration: none; }
.lp-footer-links { display: flex; align-items: center; gap: 8px; }
.lp-footer-link { font-family: 'Poppins', sans-serif; font-size: 11px; color: rgba(255,255,255,0.42); text-decoration: none; transition: color .15s; }
.lp-footer-link:hover { color: #fff; }
.lp-footer-dot { color: rgba(255,255,255,0.25); font-size: 11px; }

/* ════ RESPONSIVE ════ */
@media (max-width: 1024px) {
  .lp-container { padding: 0 32px; }
  .lp-topbar-inner { padding: 0 32px; }
  .lp-hero-inner { padding: 48px 32px 40px; }
  .lp-statsbar-inner { padding: 12px 32px; }
}
@media (max-width: 900px) {
  .lp-hero-inner { grid-template-columns: 1fr; gap: 28px; padding: 40px 24px; }
  .lp-about-grid { grid-template-columns: 1fr; gap: 32px; }
  .lp-course-grid { grid-template-columns: 1fr 1fr; }
  .lp-feat-grid { grid-template-columns: 1fr 1fr; }
  .lp-req-grid { grid-template-columns: 1fr; }
  .lp-tcard-grid { grid-template-columns: 1fr 1fr; }
  .lp-cta-grid { grid-template-columns: 1fr; gap: 36px; }
  .lp-statsbar-inner { grid-template-columns: repeat(2,1fr); padding: 12px 24px; }
  .lp-hero-h1 { font-size: 46px; line-height: 46px; }
}
@media (max-width: 640px) {
  .lp-nav { display: none; }
  .lp-topbar-inner { padding: 0 16px; }
  .lp-container { padding: 0 16px; }
  .lp-hero-inner { padding: 32px 16px; }
  .lp-hero-h1 { font-size: 34px; line-height: 36px; }
  .lp-course-grid { grid-template-columns: 1fr; }
  .lp-feat-grid { grid-template-columns: 1fr; }
  .lp-tcard-grid { grid-template-columns: 1fr; }
  .lp-signup-row { grid-template-columns: 1fr; }
  .lp-footer-band-inner { flex-direction: column; text-align: center; }
  .lp-footer-inner { flex-direction: column; text-align: center; }
  .lp-footer-links { justify-content: center; }
  .lp-statsbar-inner { grid-template-columns: repeat(2,1fr); padding: 12px 16px; }
  .lp-h2 { font-size: 28px; line-height: 30px; }
}
`;

export default LandingPage;
=======
export default LandingPage;
>>>>>>> 9d9b1b6 (Backup: my current progress before pulling updates)
