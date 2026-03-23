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
const LandingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [modal, setModal] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // adjust hero padding — logged-in nav is 58px (sticky, not fixed), public nav is 68px (fixed)
  const heroPaddingTop = user ? 0 : 68;

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="lp-root">
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

      {/* ── HERO ── */}
      <section className="lp-hero" style={{ paddingTop: heroPaddingTop }}>
        <div className="lp-hero-bg-grid" />
        <div className="lp-hero-glow" />
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-eyebrow">
              <span className="lp-eyebrow-dot" />
              NMLS-Approved Education Provider
            </div>
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
            </div>
            <div className="lp-hero-badges">
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
            </div>
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-container">
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
            ].map((f, i) => (
              <div key={i} className="lp-feat-card">
                <div className="lp-feat-num">0{i + 1}</div>
                <div className="lp-feat-icon">{f.icon}</div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="lp-courses" id="courses">
        <div className="lp-container">
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
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ── */}
      <section className="lp-compliance" id="compliance">
        <div className="lp-container">
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
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-faq-section">
        <div className="lp-container lp-faq-inner">
          <div className="lp-section-head-center">
            <div className="lp-section-label">FAQ</div>
            <h2 className="lp-section-h2">Common Questions</h2>
          </div>
          <div className="lp-faq">
            {FAQS.map((f, i) => (
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
                  </span>
                </button>
                {openFaq === i && <div className="lp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
