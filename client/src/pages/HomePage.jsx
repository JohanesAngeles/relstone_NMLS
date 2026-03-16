import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

// ── Data ──────────────────────────────────────────────────────────
const STATS = [
  { value: '12,400+', label: 'Students Licensed' },
  { value: '50',      label: 'States Covered' },
  { value: '94%',     label: 'First-Try Pass Rate' },
  { value: '4.9★',   label: 'Average Review Score' },
];

const COURSES = [
  {
    id: 1, badge: 'BESTSELLER', badgeColor: '#F59E0B',
    title: 'NMLS SAFE Act 20-Hour Pre-License',
    desc: 'The complete foundational course required for all new mortgage loan originators.',
    hours: 20, states: 50, students: 4821,
    price: 199, rating: 4.9, reviews: 612,
    tag: 'Pre-License',
  },
  {
    id: 2, badge: 'MOST POPULAR', badgeColor: '#2EABFE',
    title: '8-Hour NMLS Annual Continuing Education',
    desc: 'Fulfill your yearly CE requirement and stay current with federal mortgage regulations.',
    hours: 8, states: 50, students: 3204,
    price: 89, rating: 4.8, reviews: 489,
    tag: 'CE',
  },
  {
    id: 3, badge: 'NEW', badgeColor: '#00B4B4',
    title: 'Texas 3-Hour State Elective Package',
    desc: 'Texas-specific content covering OCCC regulations and state lending laws.',
    hours: 3, states: 1, students: 1102,
    price: 49, rating: 4.9, reviews: 203,
    tag: 'State Elective',
  },
];

const STEPS = [
  {
    n: '01', icon: '🎯',
    title: 'Find Your Requirements',
    desc: 'Tell us your state and license type. We instantly surface exactly what you need — no guessing.',
  },
  {
    n: '02', icon: '📚',
    title: 'Complete Your Courses',
    desc: 'Study on your schedule. Our interactive platform tracks every lesson and keeps you on pace.',
  },
  {
    n: '03', icon: '✅',
    title: 'Pass the Exam',
    desc: "Built-in practice tests and checkpoints ensure you're exam-ready before you sit for the SAFE test.",
  },
  {
    n: '04', icon: '🏆',
    title: 'Get Licensed',
    desc: 'Download your certificate, submit to NMLS, and launch your mortgage career with confidence.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.', state: 'Texas', avatar: 'SM', rating: 5,
    text: 'I passed the SAFE exam on my first try after using Relstone. The course content is organized perfectly and the practice tests are spot-on.',
  },
  {
    name: 'James T.', state: 'California', avatar: 'JT', rating: 5,
    text: 'Switched from another provider and the difference is night and day. The platform actually explains WHY regulations exist, not just what they are.',
  },
  {
    name: 'Maria L.', state: 'Florida', avatar: 'ML', rating: 5,
    text: 'Completed my 20-hour pre-license in two weekends. The mobile experience is seamless and I loved being able to study between client meetings.',
  },
  {
    name: 'Derek K.', state: 'New York', avatar: 'DK', rating: 5,
    text: 'The annual CE is so much better than what my broker used to provide. Quick, current, and actually informative. Renewed in under a day.',
  },
];

const FAQS = [
  {
    q: 'What is the NMLS SAFE Act and who needs to comply?',
    a: 'The Secure and Fair Enforcement for Mortgage Licensing (SAFE) Act requires all residential mortgage loan originators (MLOs) to be licensed. Most MLOs working for non-bank lenders must complete 20 hours of pre-license education and pass the SAFE MLO Test before obtaining their license.',
  },
  {
    q: 'How long do I have to complete my pre-license education?',
    a: 'There is no strict deadline for completing your pre-license education, but your education certificate is valid for 3 years. Most students complete the 20-hour course within 2–4 weeks studying part-time.',
  },
  {
    q: 'Are your courses accepted in all 50 states?',
    a: 'Our 20-hour federal SAFE Act course is accepted in all 50 states. State-specific elective courses are available for states that require additional state-specific content beyond the federal requirements.',
  },
  {
    q: "What happens if I don't pass the SAFE exam on my first try?",
    a: 'You can retake the SAFE exam after a 30-day waiting period. If you fail three times, you must wait 180 days before retaking. Our course includes comprehensive practice exams to maximize your chances of passing on the first attempt.',
  },
];

// ── Sub-components ────────────────────────────────────────────────
const Stars = ({ n = 5 }) => (
  <span style={{ color: '#F59E0B', letterSpacing: 1 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

// ── Main Component ────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleDashboard = () =>
    navigate(user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');

  const handleBrowse = () => {
    const el = document.getElementById('hp-courses');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnroll = () => navigate('/courses');

  return (
    <Layout>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-grid" aria-hidden="true" />
        <div className="hp-blob hp-blob--1" aria-hidden="true" />
        <div className="hp-blob hp-blob--2" aria-hidden="true" />

        <div className="hp-hero-inner">
          <div className="hp-hero-content">
            <div className="hp-hero-badge">
              <span className="hp-hero-badge-dot" />
              NMLS-Approved Education Provider
            </div>

            <h1 className="hp-hero-title">
              Get Your Mortgage<br />
              License <span className="hp-hero-title-accent">Faster.</span>
            </h1>

            <p className="hp-hero-sub">
              The most comprehensive NMLS pre-license and continuing education platform.
              Study at your own pace, pass your exam the first time.
            </p>

            <div className="hp-hero-ctas">
              <button className="hp-cta-primary" onClick={handleDashboard}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Go to My Dashboard
              </button>
              <button className="hp-cta-secondary" onClick={handleBrowse}>
                Browse Courses
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div className="hp-hero-proof">
              <div className="hp-hero-avatars">
                {['#2EABFE','#00B4B4','#F59E0B','#22C55E'].map((c, i) => (
                  <div key={i} className="hp-hero-avatar" style={{ background: c, marginLeft: i ? -10 : 0 }}>
                    {['S','J','M','D'][i]}
                  </div>
                ))}
              </div>
              <span className="hp-hero-proof-text">
                Join <strong>12,400+</strong> licensed professionals
              </span>
            </div>
          </div>

          {/* Hero card visual */}
          <div className="hp-hero-visual">
            <div className="hp-hero-card">
              <div className="hp-hc-top">
                <div className="hp-hc-badge">SAFE Act 20-Hour</div>
                <div className="hp-hc-rating"><Stars /> 4.9</div>
              </div>
              <div className="hp-hc-title">Pre-License Education</div>
              <div className="hp-hc-progress-label">
                <span>Your Progress</span><span>68%</span>
              </div>
              <div className="hp-hc-bar">
                <div className="hp-hc-bar-fill" style={{ width: '68%' }} />
              </div>
              <div className="hp-hc-lessons">
                {[
                  { done: true,  label: 'Federal Mortgage Laws' },
                  { done: true,  label: 'Ethics & Fraud Prevention' },
                  { done: true,  label: 'Non-Traditional Products' },
                  { done: false, label: 'Lending Standards (Current)' },
                  { done: false, label: 'Final Exam Prep' },
                ].map((l, i) => (
                  <div key={i} className={`hp-hc-lesson ${l.done ? 'hp-hc-lesson--done' : ''}`}>
                    <div className={`hp-hc-check ${l.done ? 'hp-hc-check--done' : ''}`}>
                      {l.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    {l.label}
                  </div>
                ))}
              </div>
              <button className="hp-hc-btn" onClick={handleDashboard}>Continue Learning →</button>
            </div>

            <div className="hp-float hp-float--1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              Exam passed · First try!
            </div>
            <div className="hp-float hp-float--2">🏆 Certificate Earned</div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="hp-trust">
        <div className="hp-trust-inner">
          {STATS.map((s, i) => (
            <div key={i} className="hp-trust-item">
              <div className="hp-trust-value">{s.value}</div>
              <div className="hp-trust-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="hp-section" id="hp-courses">
        <div className="hp-section-inner">
          <div className="hp-section-head">
            <div className="hp-section-tag">Our Courses</div>
            <h2 className="hp-section-title">Everything You Need to<br />Get — and Stay — Licensed</h2>
            <p className="hp-section-sub">NMLS-approved courses built around how mortgage professionals actually learn.</p>
          </div>

          <div className="hp-courses-grid">
            {COURSES.map((c) => (
              <div key={c.id} className="hp-course-card">
                <div className="hp-course-top">
                  <span className="hp-course-tag">{c.tag}</span>
                  <span className="hp-course-badge" style={{ background: c.badgeColor + '22', color: c.badgeColor, border: `1px solid ${c.badgeColor}44` }}>
                    {c.badge}
                  </span>
                </div>
                <h3 className="hp-course-title">{c.title}</h3>
                <p className="hp-course-desc">{c.desc}</p>
                <div className="hp-course-meta">
                  <span>⏱ {c.hours} hrs</span>
                  <span>🗺 {c.states === 50 ? 'All 50 States' : `${c.states} State`}</span>
                  <span>👥 {c.students.toLocaleString()} students</span>
                </div>
                <div className="hp-course-footer">
                  <div>
                    <div className="hp-course-rating"><Stars /> <span>{c.rating} ({c.reviews})</span></div>
                    <div className="hp-course-price">${c.price}</div>
                  </div>
                  <button className="hp-course-btn" onClick={handleEnroll}>Enroll Now</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="hp-btn-outline" onClick={handleEnroll}>View All Courses →</button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="hp-section hp-section--alt" id="how-it-works">
        <div className="hp-section-inner">
          <div className="hp-section-head">
            <div className="hp-section-tag">The Process</div>
            <h2 className="hp-section-title">From Zero to Licensed<br />in Four Steps</h2>
          </div>

          <div className="hp-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="hp-step">
                <div className="hp-step-num">{s.n}</div>
                <div className="hp-step-icon">{s.icon}</div>
                <h3 className="hp-step-title">{s.title}</h3>
                <p className="hp-step-desc">{s.desc}</p>
                {i < STEPS.length - 1 && <div className="hp-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="hp-section" id="testimonials">
        <div className="hp-section-inner">
          <div className="hp-section-head">
            <div className="hp-section-tag">Student Reviews</div>
            <h2 className="hp-section-title">Real Results From<br />Real Mortgage Professionals</h2>
          </div>

          <div className="hp-testimonials">
            <div className="hp-tcard-wrap">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`hp-tcard ${i === activeTestimonial ? 'hp-tcard--active' : ''}`}>
                  <div className="hp-tcard-stars"><Stars /></div>
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
      <section className="hp-section hp-section--alt" id="faq">
        <div className="hp-section-inner hp-section-inner--narrow">
          <div className="hp-section-head">
            <div className="hp-section-tag">FAQ</div>
            <h2 className="hp-section-title">Common Questions</h2>
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

      {/* ── CTA BANNER ── */}
      <section className="hp-cta-banner">
        <div className="hp-blob hp-blob--3" aria-hidden="true" />
        <div className="hp-cta-banner-inner">
          <h2 className="hp-cta-banner-title">Ready to Start Your<br />Mortgage Career?</h2>
          <p className="hp-cta-banner-sub">Join thousands of licensed professionals who chose Relstone NMLS.</p>
          <div className="hp-cta-banner-btns">
            <button className="hp-cta-primary hp-cta-primary--light" onClick={handleDashboard}>
              Go to My Dashboard
            </button>
            <button className="hp-cta-secondary hp-cta-secondary--light" onClick={handleEnroll}>
              View All Courses →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <p className="hp-footer-tagline">NMLS-approved education for mortgage professionals across all 50 states.</p>
            <div className="hp-footer-socials">
              <a href="#" className="hp-social" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="hp-social" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="hp-social" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="hp-social" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          <div className="hp-footer-col">
            <div className="hp-footer-col-title">Company</div>
            <a href="#" className="hp-footer-link">About Us</a>
            <a href="#" className="hp-footer-link">Blog</a>
            <a href="#" className="hp-footer-link">Careers</a>
            <a href="mailto:support@relstone.com" className="hp-footer-link">Contact</a>
          </div>

          <div className="hp-footer-col">
            <div className="hp-footer-col-title">Courses</div>
            <a href="#" className="hp-footer-link">Pre-License (20hr)</a>
            <a href="#" className="hp-footer-link">Continuing Education</a>
            <a href="#" className="hp-footer-link">State Electives</a>
            <a href="#" className="hp-footer-link">Browse All</a>
          </div>

          <div className="hp-footer-col">
            <div className="hp-footer-col-title">Support</div>
            <a href="/resources" className="hp-footer-link">Help Center</a>
            <a href="#" className="hp-footer-link">State Requirements</a>
            <a href="#" className="hp-footer-link">Privacy Policy</a>
            <a href="#" className="hp-footer-link">Terms of Service</a>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <span>© 2026 Relstone NMLS. All rights reserved.</span>
          <span>NMLS Provider ID: #XXXXXXX · Approved in all 50 states</span>
        </div>
      </footer>
    </Layout>
  );
};

// ── CSS ── (renamed all classes from lp- to hp- to avoid conflicts with LandingPage)
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  --hp-dark:   #091925;
  --hp-blue:   #2EABFE;
  --hp-teal:   #00B4B4;
  --hp-amber:  #F59E0B;
  --hp-green:  #22C55E;
  --hp-muted:  #64748b;
  --hp-ice:    #F0F6FA;
  --hp-border: rgba(9,25,37,0.09);
  --hp-font:   'Poppins', sans-serif;
  --hp-title:  'Homepage Baukasten', sans-serif;
}

/* ── HERO ── */
.hp-hero {
  position: relative; overflow: hidden;
  background: linear-gradient(160deg, #f8fbff 0%, #eef6ff 50%, #f0fbfb 100%);
  padding: 60px 5vw 80px;
}
.hp-hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(46,171,254,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46,171,254,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%);
}
.hp-blob { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
.hp-blob--1 { width: 500px; height: 500px; background: rgba(46,171,254,0.15); top: -100px; right: -100px; }
.hp-blob--2 { width: 400px; height: 400px; background: rgba(0,180,180,0.12); bottom: -80px; left: -60px; }
.hp-blob--3 { width: 600px; height: 400px; background: rgba(46,171,254,0.2); top: 50%; left: 50%; transform: translate(-50%,-50%); }

.hp-hero-inner {
  position: relative; z-index: 2;
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}
.hp-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 14px;
  background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.25);
  border-radius: 999px; font-size: 12px; font-weight: 600; color: #0e7dc2;
  margin-bottom: 20px;
}
.hp-hero-badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--hp-blue);
  box-shadow: 0 0 0 3px rgba(46,171,254,0.25);
  animation: hp-pulse 2s ease infinite;
}
@keyframes hp-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(46,171,254,0.25)} 50%{box-shadow:0 0 0 6px rgba(46,171,254,0.1)} }

.hp-hero-title {
  font-family: var(--hp-title);
  font-size: clamp(36px, 4.5vw, 56px);
  font-weight: 900; line-height: 1.08; color: var(--hp-dark); margin-bottom: 20px;
}
.hp-hero-title-accent { color: var(--hp-blue); position: relative; }
.hp-hero-title-accent::after {
  content: ''; position: absolute; bottom: 2px; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--hp-blue), var(--hp-teal));
  border-radius: 2px; opacity: .4;
}
.hp-hero-sub { font-size: 16px; line-height: 1.7; color: var(--hp-muted); max-width: 480px; margin-bottom: 32px; font-family: var(--hp-font); }
.hp-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 32px; }

.hp-cta-primary {
  display: inline-flex; align-items: center; gap: 9px; padding: 14px 24px;
  font-family: var(--hp-font); font-size: 15px; font-weight: 700;
  color: #fff; background: var(--hp-dark); border: none; border-radius: 14px; cursor: pointer;
  box-shadow: 0 6px 24px rgba(9,25,37,0.2); transition: all .22s;
}
.hp-cta-primary:hover { background: var(--hp-blue); box-shadow: 0 10px 32px rgba(46,171,254,0.35); transform: translateY(-2px); }
.hp-cta-primary--light { background: #fff; color: var(--hp-dark); }
.hp-cta-primary--light:hover { background: var(--hp-ice); transform: translateY(-2px); }

.hp-cta-secondary {
  display: inline-flex; align-items: center; gap: 8px; padding: 14px 22px;
  font-family: var(--hp-font); font-size: 15px; font-weight: 600;
  color: var(--hp-dark); background: #fff; border: 1.5px solid var(--hp-border);
  border-radius: 14px; cursor: pointer; transition: all .22s;
}
.hp-cta-secondary:hover { border-color: var(--hp-blue); color: var(--hp-blue); transform: translateY(-1px); }
.hp-cta-secondary--light { background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3); }
.hp-cta-secondary--light:hover { background: rgba(255,255,255,0.25); color: #fff; border-color: rgba(255,255,255,0.5); }

.hp-hero-proof { display: flex; align-items: center; gap: 12px; }
.hp-hero-avatars { display: flex; }
.hp-hero-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; border: 2px solid #fff;
}
.hp-hero-proof-text { font-size: 13px; color: var(--hp-muted); font-family: var(--hp-font); }
.hp-hero-proof-text strong { color: var(--hp-dark); }

/* ── HERO CARD ── */
.hp-hero-visual { position: relative; }
.hp-hero-card {
  background: #fff; border-radius: 20px; padding: 28px;
  box-shadow: 0 24px 64px rgba(9,25,37,0.12), 0 0 0 1px rgba(9,25,37,0.06);
  position: relative; z-index: 2;
}
.hp-hc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.hp-hc-badge { padding: 4px 10px; font-size: 11px; font-weight: 700; background: rgba(46,171,254,0.1); color: var(--hp-blue); border: 1px solid rgba(46,171,254,0.2); border-radius: 6px; font-family: var(--hp-font); }
.hp-hc-rating { font-size: 13px; color: var(--hp-muted); display: flex; align-items: center; gap: 4px; font-family: var(--hp-font); }
.hp-hc-title { font-family: var(--hp-title); font-size: 20px; font-weight: 800; color: var(--hp-dark); margin-bottom: 18px; }
.hp-hc-progress-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--hp-muted); margin-bottom: 8px; font-family: var(--hp-font); }
.hp-hc-bar { height: 6px; background: var(--hp-ice); border-radius: 999px; margin-bottom: 18px; overflow: hidden; }
.hp-hc-bar-fill { height: 100%; background: linear-gradient(90deg, var(--hp-blue), var(--hp-teal)); border-radius: 999px; }
.hp-hc-lessons { display: grid; gap: 10px; margin-bottom: 20px; }
.hp-hc-lesson { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--hp-muted); font-family: var(--hp-font); }
.hp-hc-lesson--done { color: var(--hp-dark); }
.hp-hc-check { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; }
.hp-hc-check--done { background: var(--hp-green); border-color: var(--hp-green); }
.hp-hc-btn {
  width: 100%; height: 42px; background: var(--hp-dark); color: #fff; border: none;
  border-radius: 10px; font-family: var(--hp-font); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.hp-hc-btn:hover { background: var(--hp-blue); }

.hp-float {
  position: absolute; background: #fff; border-radius: 12px; padding: 10px 16px;
  font-size: 13px; font-weight: 600; color: var(--hp-dark);
  box-shadow: 0 8px 24px rgba(9,25,37,0.12);
  display: flex; align-items: center; gap: 7px; white-space: nowrap;
  animation: hp-float 3s ease-in-out infinite; font-family: var(--hp-font);
}
.hp-float--1 { bottom: -16px; left: -24px; color: var(--hp-green); animation-delay: 0s; }
.hp-float--2 { top: -16px; right: -16px; animation-delay: 1.5s; }
@keyframes hp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

/* ── TRUST BAR ── */
.hp-trust { background: var(--hp-dark); padding: 0 5vw; }
.hp-trust-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-left: 1px solid rgba(255,255,255,0.08);
}
.hp-trust-item { padding: 32px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.08); }
.hp-trust-value { font-family: var(--hp-title); font-size: 34px; font-weight: 900; color: var(--hp-blue); margin-bottom: 4px; }
.hp-trust-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.5); font-family: var(--hp-font); }

/* ── SECTIONS ── */
.hp-section { padding: 80px 5vw; }
.hp-section--alt { background: #f8fbff; }
.hp-section-inner { max-width: 1200px; margin: 0 auto; }
.hp-section-inner--narrow { max-width: 760px; }
.hp-section-head { text-align: center; margin-bottom: 60px; }
.hp-section-tag {
  display: inline-block; padding: 5px 14px; margin-bottom: 14px;
  font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--hp-blue); background: rgba(46,171,254,0.1); border: 1px solid rgba(46,171,254,0.2);
  border-radius: 999px; font-family: var(--hp-font);
}
.hp-section-title { font-family: var(--hp-title); font-size: clamp(26px, 3vw, 40px); font-weight: 900; color: var(--hp-dark); line-height: 1.12; margin-bottom: 14px; }
.hp-section-sub { font-size: 15px; color: var(--hp-muted); max-width: 520px; margin: 0 auto; line-height: 1.7; font-family: var(--hp-font); }

/* ── COURSES ── */
.hp-courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.hp-course-card {
  background: #fff; border-radius: 18px; border: 1px solid var(--hp-border); padding: 28px;
  transition: box-shadow .2s, transform .2s; display: flex; flex-direction: column; gap: 12px;
}
.hp-course-card:hover { box-shadow: 0 16px 48px rgba(9,25,37,0.1); transform: translateY(-4px); }
.hp-course-top { display: flex; justify-content: space-between; align-items: center; }
.hp-course-tag { font-size: 11px; font-weight: 700; color: var(--hp-muted); text-transform: uppercase; letter-spacing: .06em; font-family: var(--hp-font); }
.hp-course-badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; letter-spacing: .04em; font-family: var(--hp-font); }
.hp-course-title { font-family: var(--hp-title); font-size: 18px; font-weight: 800; color: var(--hp-dark); line-height: 1.3; }
.hp-course-desc { font-size: 13.5px; color: var(--hp-muted); line-height: 1.65; flex: 1; font-family: var(--hp-font); }
.hp-course-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--hp-muted); font-weight: 500; font-family: var(--hp-font); }
.hp-course-footer { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 4px; }
.hp-course-rating { font-size: 12px; color: var(--hp-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 4px; font-family: var(--hp-font); }
.hp-course-price { font-family: var(--hp-title); font-size: 26px; font-weight: 900; color: var(--hp-dark); }
.hp-course-btn {
  padding: 10px 20px; font-family: var(--hp-font); font-size: 13px; font-weight: 700;
  color: #fff; background: var(--hp-dark); border: none; border-radius: 10px;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.hp-course-btn:hover { background: var(--hp-blue); }
.hp-btn-outline {
  padding: 12px 28px; font-family: var(--hp-font); font-size: 14px; font-weight: 700;
  color: var(--hp-dark); background: none; border: 2px solid var(--hp-border);
  border-radius: 12px; cursor: pointer; transition: all .2s;
}
.hp-btn-outline:hover { border-color: var(--hp-blue); color: var(--hp-blue); }

/* ── HOW IT WORKS ── */
.hp-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
.hp-step { text-align: center; padding: 32px 20px; position: relative; }
.hp-step-num { font-family: var(--hp-title); font-size: 48px; font-weight: 900; color: rgba(46,171,254,0.12); line-height: 1; margin-bottom: -8px; }
.hp-step-icon { font-size: 36px; margin-bottom: 14px; }
.hp-step-title { font-family: var(--hp-title); font-size: 18px; font-weight: 800; color: var(--hp-dark); margin-bottom: 10px; }
.hp-step-desc { font-size: 14px; color: var(--hp-muted); line-height: 1.65; font-family: var(--hp-font); }
.hp-step-arrow { position: absolute; right: -16px; top: 50%; transform: translateY(-50%); font-size: 28px; color: rgba(46,171,254,0.3); z-index: 1; }

/* ── TESTIMONIALS ── */
.hp-testimonials { position: relative; }
.hp-tcard-wrap { position: relative; min-height: 220px; }
.hp-tcard {
  position: absolute; inset: 0; background: #fff; border-radius: 20px; padding: 36px;
  border: 1px solid var(--hp-border); box-shadow: 0 8px 32px rgba(9,25,37,0.07);
  opacity: 0; transform: translateX(20px); transition: opacity .5s, transform .5s; pointer-events: none;
}
.hp-tcard--active { opacity: 1; transform: translateX(0); pointer-events: auto; }
.hp-tcard-stars { margin-bottom: 14px; font-size: 18px; }
.hp-tcard-text { font-size: 17px; line-height: 1.7; color: var(--hp-dark); font-style: italic; margin-bottom: 24px; max-width: 700px; font-family: var(--hp-font); }
.hp-tcard-author { display: flex; align-items: center; gap: 14px; }
.hp-tcard-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--hp-blue), var(--hp-teal));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; font-size: 14px;
}
.hp-tcard-name { font-weight: 700; font-size: 15px; color: var(--hp-dark); font-family: var(--hp-font); }
.hp-tcard-state { font-size: 13px; color: var(--hp-muted); font-family: var(--hp-font); }
.hp-tdots { display: flex; justify-content: center; gap: 8px; margin-top: 240px; }
.hp-tdot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; border: none; cursor: pointer; transition: all .2s; }
.hp-tdot--active { background: var(--hp-blue); width: 24px; border-radius: 4px; }
.hp-tarrows { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.hp-tarrow {
  width: 42px; height: 42px; border-radius: 50%; background: #fff; border: 1.5px solid var(--hp-border);
  font-size: 18px; cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center;
}
.hp-tarrow:hover { border-color: var(--hp-blue); color: var(--hp-blue); }

/* ── FAQ ── */
.hp-faq { display: grid; gap: 12px; }
.hp-faq-item { background: #fff; border: 1.5px solid var(--hp-border); border-radius: 14px; overflow: hidden; transition: border-color .2s; }
.hp-faq-item--open { border-color: rgba(46,171,254,0.35); }
.hp-faq-q {
  width: 100%; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px;
  background: none; border: none; cursor: pointer;
  font-family: var(--hp-font); font-size: 15px; font-weight: 600; color: var(--hp-dark); text-align: left;
}
.hp-faq-icon { font-size: 20px; color: var(--hp-blue); flex-shrink: 0; font-weight: 400; }
.hp-faq-a { padding: 0 24px 20px; font-size: 14px; line-height: 1.75; color: var(--hp-muted); font-family: var(--hp-font); }

/* ── CTA BANNER ── */
.hp-cta-banner { background: var(--hp-dark); position: relative; overflow: hidden; padding: 80px 5vw; text-align: center; }
.hp-cta-banner-inner { position: relative; z-index: 2; max-width: 640px; margin: 0 auto; }
.hp-cta-banner-title { font-family: var(--hp-title); font-size: clamp(28px, 3.5vw, 46px); font-weight: 900; color: #fff; margin-bottom: 16px; line-height: 1.1; }
.hp-cta-banner-sub { font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 36px; font-family: var(--hp-font); }
.hp-cta-banner-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

/* ── FOOTER ── */
.hp-footer { background: #060f17; padding: 60px 5vw 0; }
.hp-footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
  padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.07);
}
.hp-footer-tagline { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.7; margin-bottom: 20px; max-width: 260px; font-family: var(--hp-font); }
.hp-footer-socials { display: flex; gap: 10px; }
.hp-social {
  width: 36px; height: 36px; border-radius: 9px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.5); text-decoration: none; transition: all .18s;
}
.hp-social:hover { background: rgba(46,171,254,0.2); color: var(--hp-blue); border-color: rgba(46,171,254,0.3); }
.hp-footer-col { display: flex; flex-direction: column; gap: 12px; }
.hp-footer-col-title { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 4px; font-family: var(--hp-font); }
.hp-footer-link { font-size: 14px; color: rgba(255,255,255,0.55); text-decoration: none; transition: color .15s; font-family: var(--hp-font); }
.hp-footer-link:hover { color: #fff; }
.hp-footer-bottom {
  max-width: 1200px; margin: 0 auto; padding: 24px 0;
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  font-size: 12px; color: rgba(255,255,255,0.25); font-family: var(--hp-font);
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hp-hero-inner { grid-template-columns: 1fr; }
  .hp-hero-visual { display: none; }
  .hp-courses-grid { grid-template-columns: 1fr 1fr; }
  .hp-steps { grid-template-columns: 1fr 1fr; }
  .hp-step-arrow { display: none; }
}
@media (max-width: 768px) {
  .hp-trust-inner { grid-template-columns: 1fr 1fr; }
  .hp-courses-grid { grid-template-columns: 1fr; }
  .hp-steps { grid-template-columns: 1fr; }
  .hp-footer-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .hp-hero { padding: 40px 5vw 60px; }
  .hp-trust-inner { grid-template-columns: 1fr 1fr; }
  .hp-footer-inner { grid-template-columns: 1fr; }
  .hp-footer-bottom { flex-direction: column; text-align: center; }
}
`;

export default HomePage;