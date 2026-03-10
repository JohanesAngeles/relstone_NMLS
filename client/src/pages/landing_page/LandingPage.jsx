import { useState } from 'react';
import AuthModal from '../auth_page/AuthModal';

const LandingPage = () => {
  const [modal, setModal] = useState(null); // null | 'login' | 'register'

  return (
    <div className="lp-root">
      <style>{css}</style>

      {/* Auth Modal */}
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <div className="lp-nav-logo">
            <div className="lp-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="lp-logo-text-wrap">
              <span className="lp-logo-name">Relstone</span>
              <span className="lp-logo-sub">NMLS Education Platform</span>
            </div>
          </div>

          <div className="lp-nav-links">
            <a href="#about" className="lp-nav-link">About</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#courses" className="lp-nav-link">Courses</a>
            <a href="#compliance" className="lp-nav-link">Compliance</a>
          </div>

          <div className="lp-nav-actions">
            <button onClick={() => setModal('login')} className="lp-btn-ghost">Sign In</button>
            <button onClick={() => setModal('register')} className="lp-btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-grid" />
        <div className="lp-hero-glow" />

        <div className="lp-container lp-hero-inner">
          {/* Left: text */}
          <div className="lp-hero-text">
            <div className="lp-hero-eyebrow">
              <span className="lp-eyebrow-dot" />
              NMLS-Approved Education Provider
            </div>

            <h1 className="lp-hero-h1">
              Your Path to<br />
              Mortgage<br />
              <span className="lp-hero-accent">Licensure.</span>
            </h1>

            <p className="lp-hero-desc">
              Relstone delivers NMLS-approved pre-licensing and continuing
              education courses built for mortgage professionals. Study at your
              own pace, stay compliant, and earn your certificates.
            </p>

            <div className="lp-hero-actions">
              <button onClick={() => setModal('register')} className="lp-btn-primary lp-btn-lg">
                Begin Enrollment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => setModal('login')} className="lp-btn-ghost lp-btn-lg">Sign In</button>
            </div>

            <div className="lp-hero-badges">
              <div className="lp-badge-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                SAFE Act Compliant
              </div>
              <div className="lp-badge-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                50+ States Approved
              </div>
              <div className="lp-badge-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Instant Certificates
              </div>
            </div>
          </div>

          {/* Right: institutional info card */}
          <div className="lp-hero-card-wrap">
            <div className="lp-hero-card">
              <div className="lp-hcard-header">
                <span className="lp-hcard-tag">Platform Overview</span>
              </div>

              <div className="lp-hcard-items">
                <div className="lp-hcard-item">
                  <div className="lp-hcard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-hcard-label">Course Format</div>
                    <div className="lp-hcard-value">Online Self-Study (OSS)</div>
                  </div>
                </div>

                <div className="lp-hcard-item">
                  <div className="lp-hcard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-hcard-label">Access</div>
                    <div className="lp-hcard-value">24 / 7 — Any Device</div>
                  </div>
                </div>

                <div className="lp-hcard-item">
                  <div className="lp-hcard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-hcard-label">Pre-Licensing</div>
                    <div className="lp-hcard-value">20-Hour SAFE Act PE Course</div>
                  </div>
                </div>

                <div className="lp-hcard-item">
                  <div className="lp-hcard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-hcard-label">Continuing Education</div>
                    <div className="lp-hcard-value">8-Hour Annual CE Renewal</div>
                  </div>
                </div>

                <div className="lp-hcard-item">
                  <div className="lp-hcard-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-hcard-label">Certificate</div>
                    <div className="lp-hcard-value">Issued Instantly on Completion</div>
                  </div>
                </div>
              </div>

              <button onClick={() => setModal('register')} className="lp-hcard-cta">
                Start Enrollment →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT NMLS BANNER ── */}
      <div className="lp-about-banner" id="about">
        <div className="lp-container lp-banner-inner">
          <p className="lp-banner-text">
            <strong>What is NMLS?</strong> The Nationwide Multistate Licensing System is the official platform
            for U.S. mortgage licensing. The SAFE Act requires all Mortgage Loan Originators (MLOs)
            to complete NMLS-approved education before originating loans.
          </p>
          <a href="#courses" className="lp-banner-link">View Courses →</a>
        </div>
      </div>

      {/* ── ABOUT SECTION ── */}
      <section className="lp-about" id="about-full">
        <div className="lp-container">
          <div className="lp-section-label">ABOUT THE PLATFORM</div>
          <div className="lp-about-grid">
            <div className="lp-about-left">
              <h2 className="lp-section-h2">
                NMLS-Approved Education<br />
                <span className="lp-h2-accent">Built for Compliance.</span>
              </h2>
              <p className="lp-about-para">
                Relstone is an NMLS-approved education provider offering
                fully online, self-paced mortgage licensing courses. Our
                platform is designed to meet every technical requirement
                set by the SAFE Act and NMLS — from identity authentication
                to time tracking and module sequencing.
              </p>
              <p className="lp-about-para">
                Whether you're a first-time MLO applicant completing your
                20-hour pre-licensing requirement or a licensed professional
                renewing with your annual 8-hour CE, Relstone has the course
                you need — available anytime, from any device.
              </p>
              <button onClick={() => setModal('register')} className="lp-btn-primary" style={{marginTop:'8px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
                Create Your Account
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="lp-about-right">
              <div className="lp-about-card">
                <div className="lp-acard-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.6">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h3 className="lp-acard-title">Pre-Licensing Education (PE)</h3>
                <p className="lp-acard-desc">Complete the required 20-hour SAFE Act PE course for first-time MLO applicants. Covers federal law, ethics, and non-traditional mortgage products.</p>
                <div className="lp-acard-meta">20 Hours Required</div>
              </div>

              <div className="lp-about-card">
                <div className="lp-acard-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.6">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 className="lp-acard-title">Continuing Education (CE)</h3>
                <p className="lp-acard-desc">Renew your MLO license annually with the required 8-hour CE course. Must be completed by December 31st each year per state law.</p>
                <div className="lp-acard-meta">8 Hours Per Year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-label lp-section-label--light">PLATFORM FEATURES</div>
          <div className="lp-features-top">
            <h2 className="lp-section-h2 lp-section-h2--light">
              Every NMLS Requirement,<br />
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
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: 'BioSig-ID Authentication',
                desc: 'Every Online Self-Study course uses BioSig-ID identity verification as required by NMLS effective August 2017.'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Engagement Time Tracking',
                desc: 'The platform tracks active engagement time only. Students are automatically logged out after 6 minutes of inactivity.'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
                title: 'Locked Module Sequencing',
                desc: 'Students must advance linearly through course modules. No module can be skipped until all prior activities are completed.'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                title: 'Rules of Conduct (ROCS V4)',
                desc: 'Students must read and digitally agree to NMLS Rules of Conduct before every course. Provider logs are maintained for 5 years.'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                title: 'Bookmarking & Resume',
                desc: 'Students can log out at any time and resume exactly where they left off. Course progress is preserved automatically.'
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                title: 'Instant Completion Certificate',
                desc: 'NMLS-compliant certificates are issued immediately upon course completion. Credit is reported to NMLS within 7 calendar days.'
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
                <h3 className="lp-course-title">SAFE Act Pre-Licensing Education (PE)</h3>
                <p className="lp-course-desc">Required for all first-time MLO applicants. Covers federal mortgage law, ethics, fraud, non-traditional mortgage products, and state-specific electives.</p>
                <div className="lp-course-topics-row">
                  <span className="lp-topic-chip">Federal Law (3 hrs)</span>
                  <span className="lp-topic-chip">Ethics (3 hrs)</span>
                  <span className="lp-topic-chip">Non-Traditional (2 hrs)</span>
                  <span className="lp-topic-chip">Electives (12 hrs)</span>
                </div>
              </div>
              <div className="lp-course-meta">
                <div className="lp-course-hours-badge">20<span>HRS</span></div>
                <button onClick={() => setModal('register')} className="lp-btn-primary">Enroll Now</button>
              </div>
            </div>

            <div className="lp-course-row">
              <div className="lp-course-badge-wrap">
                <span className="lp-course-tag lp-course-tag--ce">Continuing Ed</span>
              </div>
              <div className="lp-course-info">
                <h3 className="lp-course-title">Annual Continuing Education (CE)</h3>
                <p className="lp-course-desc">Required annually for all licensed MLOs to maintain and renew their mortgage license. Must be completed by December 31st each year.</p>
                <div className="lp-course-topics-row">
                  <span className="lp-topic-chip">Federal Update (3 hrs)</span>
                  <span className="lp-topic-chip">Ethics (2 hrs)</span>
                  <span className="lp-topic-chip">Non-Traditional (2 hrs)</span>
                  <span className="lp-topic-chip">State Elective (1 hr)</span>
                </div>
              </div>
              <div className="lp-course-meta">
                <div className="lp-course-hours-badge lp-course-hours-badge--ce">8<span>HRS</span></div>
                <button onClick={() => setModal('register')} className="lp-btn-outline">Enroll Now</button>
              </div>
            </div>
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
                Built to Meet Every<br />
                <span className="lp-h2-accent">NMLS Standard.</span>
              </h2>
              <p className="lp-comp-para">
                Our platform is engineered from the ground up to satisfy
                every technical and regulatory requirement mandated by the
                NMLS for online course providers — so your education hours
                are always valid and reportable.
              </p>
            </div>
            <div className="lp-compliance-right">
              {[
                { label: 'SAFE Act Compliance', desc: 'All courses meet federal SAFE Act minimum time and content requirements.' },
                { label: 'BioSig-ID Integration', desc: 'Biometric identity authentication on every self-study course.' },
                { label: 'ROCS V4 Agreement', desc: 'Rules of Conduct click-through enforced before every course session.' },
                { label: '7-Day Credit Reporting', desc: 'Completions reported to NMLS within 7 calendar days of course finish.' },
                { label: 'Cross-Browser Compatible', desc: 'Works on all modern browsers, PC and Mac, with no plugins required.' },
                { label: '24/7 Course Access', desc: 'Students can access course materials any time via the internet.' },
              ].map((c, i) => (
                <div key={i} className="lp-comp-item">
                  <div className="lp-comp-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
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

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <div className="lp-container lp-cta-inner">
          <div className="lp-cta-eyebrow">NMLS-Approved • SAFE Act Compliant • Online Self-Study</div>
          <h2 className="lp-cta-h2">Ready to Start Your<br />Mortgage Career?</h2>
          <p className="lp-cta-p">
            Create your account today and get immediate access to
            NMLS-approved pre-licensing and continuing education courses.
          </p>
          <div className="lp-cta-btns">
            <button onClick={() => setModal('register')} className="lp-btn-primary lp-btn-lg">
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => setModal('login')} className="lp-cta-login-link">Already have an account? Sign In →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="lp-footer-name">Relstone</div>
              <div className="lp-footer-tagline">NMLS Education Platform</div>
            </div>
          </div>
          <div className="lp-footer-mid">
            <p className="lp-footer-copy">
              © {new Date().getFullYear()} Relstone. NMLS-approved education provider. All rights reserved.
            </p>
            <p className="lp-footer-note">
              For course approvals and credit banking inquiries, contact NMLS at nmls.ed1@csbs.org
            </p>
          </div>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">Terms of Service</a>
            <a href="#" className="lp-footer-link">Privacy Policy</a>
            <a href="mailto:support@relstone.com" className="lp-footer-link">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/homepage-baukasten');

:root {
  --midnight:    #091925;
  --deep-navy:   #0D2436;
  --steel-night: #163347;
  --electric:    #2EABFE;
  --sky:         #60C3FF;
  --ocean:       #1A7AB8;
  --ice:         #F0F6FA;
  --slate:       #7FA8C4;
  --white:       #ffffff;
  --text-muted:  #64748b;
  --border:      rgba(9,25,37,0.09);
  --font-title:  'Homepage Baukasten', sans-serif;
  --font-body:   'Poppins', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

.lp-root {
  font-family: var(--font-body);
  background: var(--white);
  color: var(--midnight);
  overflow-x: hidden;
}

/* ══ CONTAINER ══ */
.lp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

/* ══ NAV ══ */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.lp-nav-inner {
  height: 68px;
  display: flex; align-items: center; gap: 24px;
}
.lp-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.lp-logo-mark {
  width: 36px; height: 36px;
  background: rgba(46,171,254,0.08);
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.lp-logo-text-wrap { display: flex; flex-direction: column; }
.lp-logo-name {
  font-family: var(--font-title);
  font-size: 16px; font-weight: 800;
  color: var(--midnight); line-height: 1.1;
}
.lp-logo-sub {
  font-size: 10px; font-weight: 500;
  color: var(--slate); letter-spacing: .3px;
}

.lp-nav-links { display: flex; gap: 2px; margin-left: auto; }
.lp-nav-link {
  padding: 7px 14px;
  font-size: 13.5px; font-weight: 500;
  color: #4a5568; text-decoration: none;
  border-radius: 8px; transition: color .18s, background .18s;
}
.lp-nav-link:hover { color: var(--midnight); background: rgba(9,25,37,0.05); }

.lp-nav-actions { display: flex; gap: 10px; align-items: center; }
.lp-btn-ghost,
button.lp-btn-ghost,
button.lp-btn-primary,
button.lp-btn-outline,
button.lp-cta-login-link {
  font-family: var(--font-body);
  cursor: pointer;
}
.lp-btn-ghost {
  padding: 8px 18px;
  font-family: var(--font-body);
  font-size: 13.5px; font-weight: 600;
  color: var(--midnight);
  text-decoration: none; border-radius: 9px;
  border: 1.5px solid var(--border);
  transition: all .18s; display: inline-flex; align-items: center; gap: 6px;
}
.lp-btn-ghost:hover { border-color: var(--electric); color: var(--electric); }
.lp-btn-primary {
  padding: 9px 20px;
  font-family: var(--font-body);
  font-size: 13.5px; font-weight: 700;
  color: #fff; background: var(--midnight);
  border-radius: 9px; text-decoration: none;
  border: none; cursor: pointer;
  transition: all .2s; display: inline-flex; align-items: center; gap: 8px;
}
.lp-btn-primary:hover { background: var(--electric); box-shadow: 0 8px 24px rgba(46,171,254,0.3); transform: translateY(-1px); }
.lp-btn-outline {
  padding: 9px 20px;
  font-family: var(--font-body);
  font-size: 13.5px; font-weight: 700;
  color: var(--midnight);
  background: transparent;
  border: 2px solid var(--midnight);
  border-radius: 9px; text-decoration: none;
  transition: all .2s; display: inline-flex; align-items: center; gap: 8px;
}
.lp-btn-outline:hover { background: var(--midnight); color: #fff; }
.lp-btn-lg { padding: 13px 28px; font-size: 15px; border-radius: 10px; }

/* ══ HERO ══ */
.lp-hero {
  padding-top: 68px;
  min-height: 100vh;
  background: var(--midnight);
  position: relative; overflow: hidden;
  display: flex; align-items: center;
}
.lp-hero-bg-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(46,171,254,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46,171,254,0.05) 1px, transparent 1px);
  background-size: 52px 52px;
}
.lp-hero-glow {
  position: absolute; pointer-events: none;
  width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46,171,254,0.14) 0%, transparent 65%);
  top: -100px; right: -80px;
}
.lp-hero-inner {
  width: 100%;
  display: grid; grid-template-columns: 1fr 420px;
  gap: 60px; align-items: center;
  padding-top: 60px; padding-bottom: 60px;
  position: relative; z-index: 1;
}

/* Hero text */
.lp-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 14px;
  background: rgba(46,171,254,0.1);
  border: 1px solid rgba(46,171,254,0.22);
  border-radius: 999px;
  font-size: 12px; font-weight: 600; color: var(--sky);
  margin-bottom: 28px;
}
.lp-eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--electric);
  animation: lp-pulse 2s infinite;
}
@keyframes lp-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.45; transform:scale(0.8); }
}

.lp-hero-h1 {
  font-family: var(--font-title);
  font-size: clamp(44px, 5.5vw, 72px);
  line-height: 1.04; font-weight: 800;
  color: #fff; letter-spacing: -1px;
  margin-bottom: 22px;
}
.lp-hero-accent {
  background: linear-gradient(90deg, #fff 0%, #cfeeff 30%, #2EABFE 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.lp-hero-desc {
  font-size: 16px; line-height: 1.75;
  color: rgba(240,246,250,0.68);
  max-width: 500px; margin-bottom: 36px;
}
.lp-hero-actions { display: flex; gap: 14px; margin-bottom: 36px; flex-wrap: wrap; }

.lp-hero-badges { display: flex; flex-direction: column; gap: 10px; }
.lp-badge-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; color: rgba(240,246,250,0.65);
}

/* Hero card */
.lp-hero-card-wrap { position: relative; }
.lp-hero-card {
  background: rgba(13,36,54,0.75);
  border: 1px solid rgba(46,171,254,0.18);
  border-radius: 20px; padding: 28px;
  backdrop-filter: blur(16px);
}
.lp-hcard-header { margin-bottom: 20px; }
.lp-hcard-tag {
  font-size: 11px; font-weight: 700; letter-spacing: 1.8px;
  text-transform: uppercase; color: var(--sky);
}
.lp-hcard-items { display: grid; gap: 16px; margin-bottom: 24px; }
.lp-hcard-item { display: flex; align-items: flex-start; gap: 14px; }
.lp-hcard-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lp-hcard-label {
  font-size: 11px; font-weight: 600; color: var(--slate);
  text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px;
}
.lp-hcard-value { font-size: 14px; font-weight: 600; color: #fff; }
.lp-hcard-cta {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px;
  background: var(--electric); color: #fff;
  font-family: var(--font-body); font-size: 14px; font-weight: 700;
  border-radius: 12px; text-decoration: none;
  transition: all .2s;
}
.lp-hcard-cta:hover { background: var(--sky); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(46,171,254,0.35); }

/* ══ ABOUT BANNER ══ */
.lp-about-banner {
  background: var(--electric);
  padding: 18px 0;
}
.lp-banner-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
}
.lp-banner-text {
  font-size: 14px; line-height: 1.6; color: #fff;
  max-width: 780px;
}
.lp-banner-text strong { font-weight: 700; }
.lp-banner-link {
  font-size: 13px; font-weight: 700; color: #fff;
  text-decoration: none; white-space: nowrap;
  padding: 8px 18px;
  border: 1.5px solid rgba(255,255,255,0.45);
  border-radius: 8px; transition: all .18s; flex-shrink: 0;
}
.lp-banner-link:hover { background: rgba(255,255,255,0.15); }

/* ══ ABOUT ══ */
.lp-about { padding: 96px 0; background: var(--white); }
.lp-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--electric);
  margin-bottom: 16px;
}
.lp-section-label--light { color: var(--sky); }
.lp-section-h2 {
  font-family: var(--font-title);
  font-size: clamp(28px, 3.2vw, 40px);
  line-height: 1.12; font-weight: 800;
  color: var(--midnight); margin-bottom: 18px;
}
.lp-section-h2--light { color: #fff; }
.lp-h2-accent { color: var(--electric); }
.lp-h2-accent-light { color: var(--sky); }

.lp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
.lp-about-para { font-size: 15px; line-height: 1.8; color: var(--text-muted); margin-bottom: 16px; }

.lp-about-card {
  background: var(--ice);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 26px;
  margin-bottom: 16px; transition: transform .2s, box-shadow .2s;
}
.lp-about-card:last-child { margin-bottom: 0; }
.lp-about-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(9,25,37,0.07); }
.lp-acard-icon {
  width: 48px; height: 48px;
  background: rgba(46,171,254,0.1); border-radius: 12px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
}
.lp-acard-title { font-family: var(--font-title); font-size: 17px; font-weight: 700; color: var(--midnight); margin-bottom: 8px; }
.lp-acard-desc { font-size: 13.5px; line-height: 1.65; color: var(--text-muted); margin-bottom: 12px; }
.lp-acard-meta {
  display: inline-flex; align-items: center;
  padding: 4px 12px;
  background: rgba(46,171,254,0.1);
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 999px;
  font-size: 12px; font-weight: 700; color: var(--electric);
}

/* ══ FEATURES ══ */
.lp-features { padding: 96px 0; background: var(--midnight); }
.lp-features-top {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 32px; align-items: end; margin-bottom: 56px;
}
.lp-features-sub { font-size: 15px; line-height: 1.75; color: var(--slate); padding-top: 8px; }
.lp-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.lp-feat-card {
  background: rgba(13,36,54,0.7);
  border: 1px solid rgba(46,171,254,0.1);
  border-radius: 18px; padding: 28px 24px;
  position: relative; transition: all .22s;
}
.lp-feat-card:hover { border-color: rgba(46,171,254,0.3); transform: translateY(-4px); background: var(--steel-night); }
.lp-feat-num {
  position: absolute; top: 24px; right: 24px;
  font-family: var(--font-title); font-size: 28px; font-weight: 800;
  color: rgba(46,171,254,0.12);
}
.lp-feat-icon {
  width: 46px; height: 46px;
  background: rgba(46,171,254,0.1); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--electric); margin-bottom: 18px;
}
.lp-feat-title { font-family: var(--font-title); font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.lp-feat-desc { font-size: 13.5px; line-height: 1.65; color: var(--slate); }

/* ══ COURSES ══ */
.lp-courses { padding: 96px 0; background: var(--ice); }
.lp-courses-top { margin-bottom: 44px; }
.lp-courses-sub { font-size: 15px; color: var(--text-muted); line-height: 1.65; margin-top: 4px; }

.lp-course-table { display: grid; gap: 20px; }
.lp-course-row {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 18px; padding: 32px;
  display: grid; grid-template-columns: 120px 1fr auto;
  gap: 28px; align-items: center;
  transition: transform .2s, box-shadow .2s;
}
.lp-course-row:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(9,25,37,0.09); }
.lp-course-row--featured { border-color: var(--electric); border-width: 2px; }

.lp-course-tag {
  display: inline-block; padding: 6px 14px;
  font-size: 12px; font-weight: 700;
  background: rgba(46,171,254,0.1);
  color: var(--electric); border-radius: 8px;
  text-align: center;
}
.lp-course-tag--ce { background: rgba(26,122,184,0.1); color: var(--ocean); }

.lp-course-title { font-family: var(--font-title); font-size: 20px; font-weight: 800; color: var(--midnight); margin-bottom: 8px; }
.lp-course-desc { font-size: 14px; line-height: 1.65; color: var(--text-muted); margin-bottom: 14px; }
.lp-course-topics-row { display: flex; gap: 8px; flex-wrap: wrap; }
.lp-topic-chip {
  padding: 4px 12px;
  background: var(--ice); border: 1px solid var(--border);
  border-radius: 6px; font-size: 12px; font-weight: 500; color: #4a5568;
}

.lp-course-meta { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.lp-course-hours-badge {
  font-family: var(--font-title);
  font-size: 42px; font-weight: 800; line-height: 1;
  color: var(--midnight); text-align: center;
}
.lp-course-hours-badge span { font-size: 14px; font-weight: 700; color: var(--electric); display: block; margin-top: -2px; }
.lp-course-hours-badge--ce .lp-course-hours-badge span { color: var(--ocean); }

/* ══ COMPLIANCE ══ */
.lp-compliance { padding: 96px 0; background: var(--white); }
.lp-compliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
.lp-comp-para { font-size: 15px; line-height: 1.8; color: var(--text-muted); }
.lp-compliance-right { display: grid; gap: 16px; }
.lp-comp-item { display: flex; align-items: flex-start; gap: 14px; }
.lp-comp-check {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
}
.lp-comp-label { font-size: 14px; font-weight: 700; color: var(--midnight); margin-bottom: 2px; }
.lp-comp-desc { font-size: 13px; line-height: 1.55; color: var(--text-muted); }

/* ══ CTA ══ */
.lp-cta { background: var(--midnight); padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
.lp-cta-glow {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(46,171,254,0.13) 0%, transparent 65%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none;
}
.lp-cta-inner { position: relative; z-index: 1; }
.lp-cta-eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 2px;
  color: var(--slate); text-transform: uppercase; margin-bottom: 20px;
}
.lp-cta-h2 {
  font-family: var(--font-title);
  font-size: clamp(32px, 4vw, 52px);
  color: #fff; line-height: 1.1; margin-bottom: 20px;
}
.lp-cta-p { font-size: 16px; color: var(--slate); max-width: 460px; margin: 0 auto 40px; line-height: 1.75; }
.lp-cta-btns { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.lp-cta-login-link {
  font-size: 14px; font-weight: 500; color: var(--slate);
  text-decoration: none; transition: color .18s;
}
.lp-cta-login-link:hover { color: var(--electric); }

/* ══ FOOTER ══ */
.lp-footer { background: var(--deep-navy); border-top: 1px solid rgba(46,171,254,0.1); padding: 40px 0; }
.lp-footer-inner { display: grid; grid-template-columns: auto 1fr auto; gap: 40px; align-items: center; }
.lp-footer-brand { display: flex; align-items: center; gap: 12px; }
.lp-footer-name { font-family: var(--font-title); font-size: 15px; font-weight: 700; color: #fff; }
.lp-footer-tagline { font-size: 11px; color: var(--slate); }
.lp-footer-mid { text-align: center; }
.lp-footer-copy { font-size: 13px; color: var(--slate); margin-bottom: 4px; }
.lp-footer-note { font-size: 12px; color: rgba(127,168,196,0.65); }
.lp-footer-links { display: flex; gap: 20px; justify-content: flex-end; }
.lp-footer-link { font-size: 13px; color: var(--slate); text-decoration: none; transition: color .18s; white-space: nowrap; }
.lp-footer-link:hover { color: var(--electric); }

/* ══ RESPONSIVE ══ */
@media (max-width: 1024px) {
  .lp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .lp-hero-card-wrap { max-width: 520px; }
  .lp-features-top { grid-template-columns: 1fr; }
  .lp-about-grid, .lp-compliance-grid { grid-template-columns: 1fr; gap: 48px; }
  .lp-course-row { grid-template-columns: 1fr; }
  .lp-course-meta { flex-direction: row; align-items: center; }
}
@media (max-width: 768px) {
  .lp-nav-links { display: none; }
  .lp-feat-grid { grid-template-columns: 1fr 1fr; }
  .lp-footer-inner { grid-template-columns: 1fr; text-align: center; }
  .lp-footer-links { justify-content: center; }
  .lp-hero-inner { padding-top: 40px; padding-bottom: 40px; }
}
@media (max-width: 560px) {
  .lp-feat-grid { grid-template-columns: 1fr; }
  .lp-banner-inner { flex-direction: column; align-items: flex-start; }
}
`;

export default LandingPage;