import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

// ── Shared Data ───────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah M.',  state: 'Texas',      avatar: 'SM', rating: 5, text: 'I passed the SAFE exam on my first try after using Relstone. The course content is organized perfectly and the practice tests are spot-on.' },
  { name: 'James T.',  state: 'California', avatar: 'JT', rating: 5, text: 'Switched from another provider and the difference is night and day. The platform actually explains WHY regulations exist, not just what they are.' },
  { name: 'Maria L.',  state: 'Florida',    avatar: 'ML', rating: 5, text: 'Completed my 20-hour pre-license in two weekends. The mobile experience is seamless and I loved being able to study between client meetings.' },
  { name: 'Derek K.',  state: 'New York',   avatar: 'DK', rating: 5, text: 'The annual CE is so much better than what my broker used to provide. Quick, current, and actually informative. Renewed in under a day.' },
];

const FAQS = [
  { q: 'What is the NMLS SAFE Act and who needs to comply?',          a: 'The Secure and Fair Enforcement for Mortgage Licensing (SAFE) Act requires all residential mortgage loan originators (MLOs) to be licensed. Most MLOs working for non-bank lenders must complete 20 hours of pre-license education and pass the SAFE MLO Test before obtaining their license.' },
  { q: 'How long do I have to complete my pre-license education?',    a: 'There is no strict deadline for completing your pre-license education, but your education certificate is valid for 3 years. Most students complete the 20-hour course within 2–4 weeks studying part-time.' },
  { q: 'Are your courses accepted in all 50 states?',                 a: 'Our 20-hour federal SAFE Act course is accepted in all 50 states. State-specific elective courses are available for states that require additional state-specific content beyond the federal requirements.' },
  { q: "What happens if I don't pass the SAFE exam on my first try?", a: 'You can retake the SAFE exam after a 30-day waiting period. If you fail three times, you must wait 180 days before retaking. Our course includes comprehensive practice exams to maximize your chances of passing on the first attempt.' },
];

const Stars = ({ n = 5 }) => (
  <span style={{ color: '#F59E0B', letterSpacing: 1 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const handleDashboard = () => navigate(user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout>
      <div className="hp-root">
        <style>{css}</style>

        {/* ── HERO ── */}
        <section className="hp-hero">
          <div className="hp-hero-bg-grid" />
          <div className="hp-hero-glow" />
          <div className="hp-container hp-hero-inner">
            <div className="hp-hero-text">
              <div className="hp-hero-eyebrow">
                <span className="hp-eyebrow-dot" />
                NMLS-Approved Education Provider
              </div>
              <h1 className="hp-hero-h1">
                Your Path to<br />
                Mortgage<br />
                <span className="hp-hero-accent">Licensure.</span>
              </h1>
              <p className="hp-hero-desc">
                Relstone delivers NMLS-approved pre-licensing and continuing
                education courses built for mortgage professionals. Study at your
                own pace, stay compliant, and earn your certificates.
              </p>
              <div className="hp-hero-actions">
                <button onClick={handleDashboard} className="hp-btn-primary hp-btn-lg">
                  Go to Dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button onClick={() => navigate('/courses')} className="hp-btn-ghost hp-btn-lg">Browse Courses</button>
              </div>
              <div className="hp-hero-badges">
                {['SAFE Act Compliant', '50+ States Approved', 'Instant Certificates'].map(b => (
                  <div key={b} className="hp-badge-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-hero-card-wrap">
              <div className="hp-hero-card">
                <div className="hp-hcard-header">
                  <span className="hp-hcard-tag">Platform Overview</span>
                </div>
                <div className="hp-hcard-items">
                  {[
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, label: 'Course Format', value: 'Online Self-Study (OSS)' },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: 'Access', value: '24 / 7 — Any Device' },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Pre-Licensing', value: '20-Hour SAFE Act PE Course' },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Continuing Education', value: '8-Hour Annual CE Renewal' },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Certificate', value: 'Issued Instantly on Completion' },
                  ].map((item, i) => (
                    <div key={i} className="hp-hcard-item">
                      <div className="hp-hcard-icon">{item.icon}</div>
                      <div>
                        <div className="hp-hcard-label">{item.label}</div>
                        <div className="hp-hcard-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/courses')} className="hp-hcard-cta">Browse Courses →</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT NMLS BANNER ── */}
        <div className="hp-about-banner">
          <div className="hp-container hp-banner-inner">
            <p className="hp-banner-text">
              <strong>What is NMLS?</strong> The Nationwide Multistate Licensing System is the official platform
              for U.S. mortgage licensing. The SAFE Act requires all Mortgage Loan Originators (MLOs)
              to complete NMLS-approved education before originating loans.
            </p>
            <button onClick={() => navigate('/courses')} className="hp-banner-link">View Courses →</button>
          </div>
        </div>

        {/* ── ABOUT SECTION ── */}
        <section className="hp-about">
          <div className="hp-container">
            <div className="hp-section-label">ABOUT THE PLATFORM</div>
            <div className="hp-about-grid">
              <div className="hp-about-left">
                <h2 className="hp-section-h2">NMLS-Approved Education<br /><span className="hp-h2-accent">Built for Compliance.</span></h2>
                <p className="hp-about-para">Relstone is an NMLS-approved education provider offering fully online, self-paced mortgage licensing courses. Our platform is designed to meet every technical requirement set by the SAFE Act and NMLS — from identity authentication to time tracking and module sequencing.</p>
                <p className="hp-about-para">Whether you're a first-time MLO applicant completing your 20-hour pre-licensing requirement or a licensed professional renewing with your annual 8-hour CE, Relstone has the course you need — available anytime, from any device.</p>
                <button onClick={() => navigate('/courses')} className="hp-btn-primary" style={{ marginTop:'8px',display:'inline-flex',alignItems:'center',gap:'8px' }}>
                  Browse Courses
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div className="hp-about-right">
                <div className="hp-about-card">
                  <div className="hp-acard-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
                  <h3 className="hp-acard-title">Pre-Licensing Education (PE)</h3>
                  <p className="hp-acard-desc">Complete the required 20-hour SAFE Act PE course for first-time MLO applicants. Covers federal law, ethics, and non-traditional mortgage products.</p>
                  <div className="hp-acard-meta">20 Hours Required</div>
                </div>
                <div className="hp-about-card">
                  <div className="hp-acard-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <h3 className="hp-acard-title">Continuing Education (CE)</h3>
                  <p className="hp-acard-desc">Renew your MLO license annually with the required 8-hour CE course. Must be completed by December 31st each year per state law.</p>
                  <div className="hp-acard-meta">8 Hours Per Year</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="hp-features">
          <div className="hp-container">
            <div className="hp-section-label hp-section-label--light">PLATFORM FEATURES</div>
            <div className="hp-features-top">
              <h2 className="hp-section-h2 hp-section-h2--light">Every NMLS Requirement,<br /><span className="hp-h2-accent-light">Out of the Box.</span></h2>
              <p className="hp-features-sub">Our LMS is engineered to satisfy every technical specification required by the NMLS for online course delivery.</p>
            </div>
            <div className="hp-feat-grid">
              {[
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'BioSig-ID Authentication', desc: 'Every Online Self-Study course uses BioSig-ID identity verification as required by NMLS effective August 2017.' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Engagement Time Tracking', desc: 'The platform tracks active engagement time only. Students are automatically logged out after 6 minutes of inactivity.' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, title: 'Locked Module Sequencing', desc: 'Students must advance linearly through course modules. No module can be skipped until all prior activities are completed.' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, title: 'Rules of Conduct (ROCS V4)', desc: 'Students must read and digitally agree to NMLS Rules of Conduct before every course. Provider logs are maintained for 5 years.' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Bookmarking & Resume', desc: 'Students can log out at any time and resume exactly where they left off. Course progress is preserved automatically.' },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Instant Completion Certificate', desc: 'NMLS-compliant certificates are issued immediately upon course completion. Credit is reported to NMLS within 7 calendar days.' },
              ].map((f, i) => (
                <div key={i} className="hp-feat-card">
                  <div className="hp-feat-num">0{i + 1}</div>
                  <div className="hp-feat-icon">{f.icon}</div>
                  <h3 className="hp-feat-title">{f.title}</h3>
                  <p className="hp-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COURSES ── */}
        <section className="hp-courses">
          <div className="hp-container">
            <div className="hp-section-label">AVAILABLE COURSES</div>
            <div className="hp-courses-top">
              <h2 className="hp-section-h2">Choose Your <span className="hp-h2-accent">Course</span></h2>
              <p className="hp-courses-sub">NMLS-approved courses available 24/7 online, at your own pace.</p>
            </div>
            <div className="hp-course-table">
              <div className="hp-course-row hp-course-row--featured">
                <div className="hp-course-badge-wrap"><span className="hp-course-tag">Pre-Licensing</span></div>
                <div className="hp-course-info">
                  <h3 className="hp-course-title">SAFE Act Pre-Licensing Education (PE)</h3>
                  <p className="hp-course-desc">Required for all first-time MLO applicants. Covers federal mortgage law, ethics, fraud, non-traditional mortgage products, and state-specific electives.</p>
                  <div className="hp-course-topics-row">
                    <span className="hp-topic-chip">Federal Law (3 hrs)</span>
                    <span className="hp-topic-chip">Ethics (3 hrs)</span>
                    <span className="hp-topic-chip">Non-Traditional (2 hrs)</span>
                    <span className="hp-topic-chip">Electives (12 hrs)</span>
                  </div>
                </div>
                <div className="hp-course-meta">
                  <div className="hp-course-hours-badge">20<span>HRS</span></div>
                  <button onClick={() => navigate('/courses')} className="hp-btn-primary">View Course</button>
                </div>
              </div>
              <div className="hp-course-row">
                <div className="hp-course-badge-wrap"><span className="hp-course-tag hp-course-tag--ce">Continuing Ed</span></div>
                <div className="hp-course-info">
                  <h3 className="hp-course-title">Annual Continuing Education (CE)</h3>
                  <p className="hp-course-desc">Required annually for all licensed MLOs to maintain and renew their mortgage license. Must be completed by December 31st each year.</p>
                  <div className="hp-course-topics-row">
                    <span className="hp-topic-chip">Federal Update (3 hrs)</span>
                    <span className="hp-topic-chip">Ethics (2 hrs)</span>
                    <span className="hp-topic-chip">Non-Traditional (2 hrs)</span>
                    <span className="hp-topic-chip">State Elective (1 hr)</span>
                  </div>
                </div>
                <div className="hp-course-meta">
                  <div className="hp-course-hours-badge hp-course-hours-badge--ce">8<span>HRS</span></div>
                  <button onClick={() => navigate('/courses')} className="hp-btn-outline">View Course</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPLIANCE ── */}
        <section className="hp-compliance">
          <div className="hp-container">
            <div className="hp-section-label">REGULATORY COMPLIANCE</div>
            <div className="hp-compliance-grid">
              <div className="hp-compliance-left">
                <h2 className="hp-section-h2">Built to Meet Every<br /><span className="hp-h2-accent">NMLS Standard.</span></h2>
                <p className="hp-comp-para">Our platform is engineered from the ground up to satisfy every technical and regulatory requirement mandated by the NMLS for online course providers — so your education hours are always valid and reportable.</p>
              </div>
              <div className="hp-compliance-right">
                {[
                  { label: 'SAFE Act Compliance',      desc: 'All courses meet federal SAFE Act minimum time and content requirements.' },
                  { label: 'BioSig-ID Integration',    desc: 'Biometric identity authentication on every self-study course.' },
                  { label: 'ROCS V4 Agreement',        desc: 'Rules of Conduct click-through enforced before every course session.' },
                  { label: '7-Day Credit Reporting',   desc: 'Completions reported to NMLS within 7 calendar days of course finish.' },
                  { label: 'Cross-Browser Compatible', desc: 'Works on all modern browsers, PC and Mac, with no plugins required.' },
                  { label: '24/7 Course Access',       desc: 'Students can access course materials any time via the internet.' },
                ].map((c, i) => (
                  <div key={i} className="hp-comp-item">
                    <div className="hp-comp-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div><div className="hp-comp-label">{c.label}</div><div className="hp-comp-desc">{c.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="hp-testimonials-section">
          <div className="hp-container">
            <div className="hp-section-head-center">
              <div className="hp-section-label">Student Reviews</div>
              <h2 className="hp-section-h2">Real Results From<br /><span className="hp-h2-accent">Real Mortgage Professionals</span></h2>
            </div>
            <div className="hp-testimonials">
              <div className="hp-tcard-wrap">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className={`hp-tcard ${i === activeTestimonial ? 'hp-tcard--active' : ''}`}>
                    <div className="hp-tcard-stars"><Stars n={t.rating} /></div>
                    <p className="hp-tcard-text">"{t.text}"</p>
                    <div className="hp-tcard-author">
                      <div className="hp-tcard-avatar">{t.avatar}</div>
                      <div>
                        <div className="hp-tcard-name">{t.name}</div>
                        <div className="hp-tcard-state">{t.state}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hp-tdots">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} className={`hp-tdot ${i === activeTestimonial ? 'hp-tdot--active' : ''}`} onClick={() => setActiveTestimonial(i)} />
                ))}
              </div>
              <div className="hp-tarrows">
                <button className="hp-tarrow" onClick={() => setActiveTestimonial(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>←</button>
                <button className="hp-tarrow" onClick={() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length)}>→</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="hp-faq-section">
          <div className="hp-container hp-faq-inner">
            <div className="hp-section-head-center">
              <div className="hp-section-label">FAQ</div>
              <h2 className="hp-section-h2">Common Questions</h2>
            </div>
            <div className="hp-faq">
              {FAQS.map((f, i) => (
                <div key={i} className={`hp-faq-item ${openFaq === i ? 'hp-faq-item--open' : ''}`}>
                  <button className="hp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <span className="hp-faq-icon">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <div className="hp-faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="hp-cta">
          <div className="hp-cta-glow" />
          <div className="hp-container hp-cta-inner">
            <div className="hp-cta-eyebrow">NMLS-Approved • SAFE Act Compliant • Online Self-Study</div>
            <h2 className="hp-cta-h2">Continue Your<br />Mortgage Journey</h2>
            <p className="hp-cta-p">Browse your courses, track your progress, and earn your NMLS certificates — all in one place.</p>
            <div className="hp-cta-btns">
              <button onClick={handleDashboard} className="hp-btn-primary hp-btn-lg">
                Go to Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => navigate('/courses')} className="hp-cta-sub-link">Browse all courses →</button>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/homepage-baukasten');

:root {
  --hp-midnight:    #091925;
  --hp-deep-navy:   #0D2436;
  --hp-steel-night: #163347;
  --hp-electric:    #2EABFE;
  --hp-sky:         #60C3FF;
  --hp-ocean:       #1A7AB8;
  --hp-ice:         #F0F6FA;
  --hp-slate:       #7FA8C4;
  --hp-white:       #ffffff;
  --hp-text-muted:  #64748b;
  --hp-border:      rgba(9,25,37,0.09);
  --hp-font-title:  'Homepage Baukasten', sans-serif;
  --hp-font-body:   'Poppins', sans-serif;
}

.hp-root { font-family: var(--hp-font-body); background: var(--hp-white); color: var(--hp-midnight); overflow-x: hidden; }
.hp-container { max-width: 1200px; margin: 0 auto; padding: 0 5%; }

/* ══ BUTTONS ══ */
.hp-btn-primary { padding: 9px 20px; font-size: 13.5px; font-weight: 700; color: #fff; background: var(--hp-midnight); border-radius: 9px; border: none; cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; gap: 8px; font-family: var(--hp-font-body); }
.hp-btn-primary:hover { background: var(--hp-electric); box-shadow: 0 8px 24px rgba(46,171,254,0.3); transform: translateY(-1px); }
.hp-btn-ghost { padding: 8px 18px; font-size: 13.5px; font-weight: 600; color: var(--hp-midnight); border-radius: 9px; border: 1.5px solid var(--hp-border); transition: all .18s; display: inline-flex; align-items: center; gap: 6px; background: transparent; font-family: var(--hp-font-body); cursor: pointer; }
.hp-btn-ghost:hover { border-color: var(--hp-electric); color: var(--hp-electric); }
.hp-btn-outline { padding: 9px 20px; font-size: 13.5px; font-weight: 700; color: var(--hp-midnight); background: transparent; border: 2px solid var(--hp-midnight); border-radius: 9px; transition: all .2s; display: inline-flex; align-items: center; gap: 8px; font-family: var(--hp-font-body); cursor: pointer; }
.hp-btn-outline:hover { background: var(--hp-midnight); color: #fff; }
.hp-btn-lg { padding: 13px 28px; font-size: 15px; border-radius: 10px; }

/* ══ HERO ══ */
.hp-hero { min-height: calc(100vh - 58px); background: var(--hp-midnight); position: relative; overflow: hidden; display: flex; align-items: center; }
.hp-hero-bg-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(46,171,254,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(46,171,254,0.05) 1px, transparent 1px); background-size: 52px 52px; }
.hp-hero-glow { position: absolute; pointer-events: none; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(46,171,254,0.14) 0%, transparent 65%); top: -100px; right: -80px; }
.hp-hero-inner { width: 100%; display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: center; padding-top: 60px; padding-bottom: 60px; position: relative; z-index: 1; }
.hp-hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.22); border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--hp-sky); margin-bottom: 28px; }
.hp-eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hp-electric); animation: hp-pulse 2s infinite; }
@keyframes hp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.8)} }
.hp-hero-h1 { font-family: var(--hp-font-title); font-size: clamp(44px, 5.5vw, 72px); line-height: 1.04; font-weight: 800; color: #fff; letter-spacing: -1px; margin-bottom: 22px; }
.hp-hero-accent { background: linear-gradient(90deg, #fff 0%, #cfeeff 30%, #2EABFE 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hp-hero-desc { font-size: 16px; line-height: 1.75; color: rgba(240,246,250,0.68); max-width: 500px; margin-bottom: 36px; }
.hp-hero-actions { display: flex; gap: 14px; margin-bottom: 36px; flex-wrap: wrap; }
.hp-hero-badges { display: flex; flex-direction: column; gap: 10px; }
.hp-badge-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: rgba(240,246,250,0.65); }
.hp-hero-card-wrap { position: relative; }
.hp-hero-card { background: rgba(13,36,54,0.75); border: 1px solid rgba(46,171,254,0.18); border-radius: 20px; padding: 28px; backdrop-filter: blur(16px); }
.hp-hcard-header { margin-bottom: 20px; }
.hp-hcard-tag { font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--hp-sky); }
.hp-hcard-items { display: grid; gap: 16px; margin-bottom: 24px; }
.hp-hcard-item { display: flex; align-items: flex-start; gap: 14px; }
.hp-hcard-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hp-hcard-label { font-size: 11px; font-weight: 600; color: var(--hp-slate); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px; }
.hp-hcard-value { font-size: 14px; font-weight: 600; color: #fff; }
.hp-hcard-cta { display: flex; align-items: center; justify-content: center; width: 100%; padding: 13px; background: var(--hp-electric); color: #fff; font-family: var(--hp-font-body); font-size: 14px; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; transition: all .2s; }
.hp-hcard-cta:hover { background: var(--hp-sky); transform: translateY(-1px); }

/* ══ ABOUT BANNER ══ */
.hp-about-banner { background: var(--hp-electric); padding: 18px 0; }
.hp-banner-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.hp-banner-text { font-size: 14px; line-height: 1.6; color: #fff; max-width: 780px; }
.hp-banner-text strong { font-weight: 700; }
.hp-banner-link { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; padding: 8px 18px; border: 1.5px solid rgba(255,255,255,0.45); border-radius: 8px; transition: all .18s; flex-shrink: 0; background: none; cursor: pointer; font-family: var(--hp-font-body); }
.hp-banner-link:hover { background: rgba(255,255,255,0.15); }

/* ══ SECTIONS ══ */
.hp-about { padding: 96px 0; background: var(--hp-white); }
.hp-section-label { font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--hp-electric); margin-bottom: 16px; }
.hp-section-label--light { color: var(--hp-sky); }
.hp-section-h2 { font-family: var(--hp-font-title); font-size: clamp(28px, 3.2vw, 40px); line-height: 1.12; font-weight: 800; color: var(--hp-midnight); margin-bottom: 18px; }
.hp-section-h2--light { color: #fff; }
.hp-h2-accent { color: var(--hp-electric); }
.hp-h2-accent-light { color: var(--hp-sky); }
.hp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
.hp-about-para { font-size: 15px; line-height: 1.8; color: var(--hp-text-muted); margin-bottom: 16px; }
.hp-about-card { background: var(--hp-ice); border: 1px solid var(--hp-border); border-radius: 16px; padding: 26px; margin-bottom: 16px; transition: transform .2s, box-shadow .2s; }
.hp-about-card:last-child { margin-bottom: 0; }
.hp-about-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(9,25,37,0.07); }
.hp-acard-icon { width: 48px; height: 48px; background: rgba(46,171,254,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.hp-acard-title { font-family: var(--hp-font-title); font-size: 17px; font-weight: 700; color: var(--hp-midnight); margin-bottom: 8px; }
.hp-acard-desc { font-size: 13.5px; line-height: 1.65; color: var(--hp-text-muted); margin-bottom: 12px; }
.hp-acard-meta { display: inline-flex; align-items: center; padding: 4px 12px; background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2); border-radius: 999px; font-size: 12px; font-weight: 700; color: var(--hp-electric); }

/* ══ FEATURES ══ */
.hp-features { padding: 96px 0; background: var(--hp-midnight); }
.hp-features-top { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: end; margin-bottom: 56px; }
.hp-features-sub { font-size: 15px; line-height: 1.75; color: var(--hp-slate); padding-top: 8px; }
.hp-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.hp-feat-card { background: rgba(13,36,54,0.7); border: 1px solid rgba(46,171,254,0.1); border-radius: 18px; padding: 28px 24px; position: relative; transition: all .22s; }
.hp-feat-card:hover { border-color: rgba(46,171,254,0.3); transform: translateY(-4px); background: var(--hp-steel-night); }
.hp-feat-num { position: absolute; top: 24px; right: 24px; font-family: var(--hp-font-title); font-size: 28px; font-weight: 800; color: rgba(46,171,254,0.12); }
.hp-feat-icon { width: 46px; height: 46px; background: rgba(46,171,254,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--hp-electric); margin-bottom: 18px; }
.hp-feat-title { font-family: var(--hp-font-title); font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.hp-feat-desc { font-size: 13.5px; line-height: 1.65; color: var(--hp-slate); }

/* ══ COURSES ══ */
.hp-courses { padding: 96px 0; background: var(--hp-ice); }
.hp-courses-top { margin-bottom: 44px; }
.hp-courses-sub { font-size: 15px; color: var(--hp-text-muted); line-height: 1.65; margin-top: 4px; }
.hp-course-table { display: grid; gap: 20px; }
.hp-course-row { background: var(--hp-white); border: 1px solid var(--hp-border); border-radius: 18px; padding: 32px; display: grid; grid-template-columns: 120px 1fr auto; gap: 28px; align-items: center; transition: transform .2s, box-shadow .2s; }
.hp-course-row:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(9,25,37,0.09); }
.hp-course-row--featured { border-color: var(--hp-electric); border-width: 2px; }
.hp-course-tag { display: inline-block; padding: 6px 14px; font-size: 12px; font-weight: 700; background: rgba(46,171,254,0.1); color: var(--hp-electric); border-radius: 8px; text-align: center; }
.hp-course-tag--ce { background: rgba(26,122,184,0.1); color: var(--hp-ocean); }
.hp-course-title { font-family: var(--hp-font-title); font-size: 20px; font-weight: 800; color: var(--hp-midnight); margin-bottom: 8px; }
.hp-course-desc { font-size: 14px; line-height: 1.65; color: var(--hp-text-muted); margin-bottom: 14px; }
.hp-course-topics-row { display: flex; gap: 8px; flex-wrap: wrap; }
.hp-topic-chip { padding: 4px 12px; background: var(--hp-ice); border: 1px solid var(--hp-border); border-radius: 6px; font-size: 12px; font-weight: 500; color: #4a5568; }
.hp-course-meta { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.hp-course-hours-badge { font-family: var(--hp-font-title); font-size: 42px; font-weight: 800; line-height: 1; color: var(--hp-midnight); text-align: center; }
.hp-course-hours-badge span { font-size: 14px; font-weight: 700; color: var(--hp-electric); display: block; margin-top: -2px; }

/* ══ COMPLIANCE ══ */
.hp-compliance { padding: 96px 0; background: var(--hp-white); }
.hp-compliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
.hp-comp-para { font-size: 15px; line-height: 1.8; color: var(--hp-text-muted); }
.hp-compliance-right { display: grid; gap: 16px; }
.hp-comp-item { display: flex; align-items: flex-start; gap: 14px; }
.hp-comp-check { width: 28px; height: 28px; border-radius: 8px; background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.hp-comp-label { font-size: 14px; font-weight: 700; color: var(--hp-midnight); margin-bottom: 2px; }
.hp-comp-desc { font-size: 13px; line-height: 1.55; color: var(--hp-text-muted); }

/* ══ TESTIMONIALS ══ */
.hp-testimonials-section { padding: 96px 0; background: var(--hp-white); }
.hp-section-head-center { text-align: center; margin-bottom: 60px; }
.hp-section-head-center .hp-section-label { display: inline-block; }
.hp-testimonials { position: relative; }
.hp-tcard-wrap { position: relative; min-height: 220px; }
.hp-tcard { position: absolute; inset: 0; background: #fff; border-radius: 20px; padding: 36px; border: 1px solid var(--hp-border); box-shadow: 0 8px 32px rgba(9,25,37,0.07); opacity: 0; transform: translateX(20px); transition: opacity .5s, transform .5s; pointer-events: none; }
.hp-tcard--active { opacity: 1; transform: translateX(0); pointer-events: auto; }
.hp-tcard-stars { margin-bottom: 14px; font-size: 18px; }
.hp-tcard-text { font-size: 17px; line-height: 1.7; color: var(--hp-midnight); font-style: italic; margin-bottom: 24px; max-width: 700px; }
.hp-tcard-author { display: flex; align-items: center; gap: 14px; }
.hp-tcard-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--hp-electric), #00B4B4); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 14px; }
.hp-tcard-name { font-weight: 700; font-size: 15px; color: var(--hp-midnight); }
.hp-tcard-state { font-size: 13px; color: var(--hp-text-muted); }
.hp-tdots { display: flex; justify-content: center; gap: 8px; margin-top: 240px; }
.hp-tdot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; border: none; cursor: pointer; transition: all .2s; }
.hp-tdot--active { background: var(--hp-electric); width: 24px; border-radius: 4px; }
.hp-tarrows { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.hp-tarrow { width: 42px; height: 42px; border-radius: 50%; background: #fff; border: 1.5px solid var(--hp-border); font-size: 18px; cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; }
.hp-tarrow:hover { border-color: var(--hp-electric); color: var(--hp-electric); }

/* ══ FAQ ══ */
.hp-faq-section { padding: 96px 0; background: #f8fbff; }
.hp-faq-inner { max-width: 760px; }
.hp-faq { display: grid; gap: 12px; }
.hp-faq-item { background: #fff; border: 1.5px solid var(--hp-border); border-radius: 14px; overflow: hidden; transition: border-color .2s; }
.hp-faq-item--open { border-color: rgba(46,171,254,0.35); }
.hp-faq-q { width: 100%; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: none; border: none; cursor: pointer; font-family: var(--hp-font-body); font-size: 15px; font-weight: 600; color: var(--hp-midnight); text-align: left; }
.hp-faq-icon { font-size: 20px; color: var(--hp-electric); flex-shrink: 0; font-weight: 400; }
.hp-faq-a { padding: 0 24px 20px; font-size: 14px; line-height: 1.75; color: var(--hp-text-muted); }

/* ══ CTA ══ */
.hp-cta { background: var(--hp-midnight); padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
.hp-cta-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(46,171,254,0.13) 0%, transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
.hp-cta-inner { position: relative; z-index: 1; }
.hp-cta-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--hp-slate); text-transform: uppercase; margin-bottom: 20px; }
.hp-cta-h2 { font-family: var(--hp-font-title); font-size: clamp(32px, 4vw, 52px); color: #fff; line-height: 1.1; margin-bottom: 20px; }
.hp-cta-p { font-size: 16px; color: var(--hp-slate); max-width: 460px; margin: 0 auto 40px; line-height: 1.75; }
.hp-cta-btns { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.hp-cta-sub-link { font-size: 14px; font-weight: 500; color: var(--hp-slate); transition: color .18s; background: none; border: none; cursor: pointer; font-family: var(--hp-font-body); }
.hp-cta-sub-link:hover { color: var(--hp-electric); }

/* ══ RESPONSIVE ══ */
@media (max-width: 1024px) {
  .hp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hp-hero-card-wrap { max-width: 520px; }
  .hp-features-top { grid-template-columns: 1fr; }
  .hp-about-grid, .hp-compliance-grid { grid-template-columns: 1fr; gap: 48px; }
  .hp-course-row { grid-template-columns: 1fr; }
  .hp-course-meta { flex-direction: row; align-items: center; }
}
@media (max-width: 768px) {
  .hp-feat-grid { grid-template-columns: 1fr 1fr; }
  .hp-hero-inner { padding-top: 40px; padding-bottom: 40px; }
}
@media (max-width: 560px) {
  .hp-feat-grid { grid-template-columns: 1fr; }
  .hp-banner-inner { flex-direction: column; align-items: flex-start; }
}
`;

export default HomePage;