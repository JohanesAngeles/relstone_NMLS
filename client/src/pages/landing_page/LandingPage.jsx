import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/RelstoneLogo.png';
import landingBg from '../../assets/images/landing_page_bg.png';
import AuthModal from '../../pages/auth_page/AuthModal';
import API from '../../api/axios';
// ─── Data ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is the SAFE Act and why does it require 20 hours of education?', a: 'The SAFE Mortgage Licensing Act (SAFE Act) is a federal law that established minimum standards for the licensing and registration of mortgage loan originators (MLOs). It requires all new MLOs to complete at least 20 hours of NMLS-approved pre-licensing education before sitting for the NMLS exam. This includes 3 hours of federal law, 3 hours of ethics, 2 hours of non-traditional lending, and 12 elective hours.' },
  { q: 'How long does it take to complete the 20-hour PE course?', a: 'The 20-hour PE course is self-paced, but NMLS requires that it be completed over a minimum of 3 days (you cannot rush through it faster than real time). Most students complete it within 1–2 weeks working a few hours per day. You have 6 months from enrollment to complete the course.' },
  { q: 'Are you an accredited NMLS-approved education provider?', a: 'Yes. RELSTONE is a fully accredited NMLS-approved education provider. Our Provider ID is listed in the NMLS Course Catalog and all completions are reported automatically to your NMLS record. You can verify our accreditation directly on the NMLS Resource Center website.' },
  { q: 'What happens after I complete the PE course?', a: "Upon successful completion of the course, you will receive a downloadable certificate of completion that you can access immediately from your student portal. Additionally, your completion is automatically reported to NMLS within 1 business day. You'll receive a confirmation email once your NMLS record has been updated." },
  { q: "Do I need to complete CE every year even if I haven't originated any loans?", a: 'Yes. NMLS requires 8 hours of CE annually for all licensed MLOs, regardless of production volume. Failure to complete CE by the deadline will result in your license being placed in an "approved-inactive" status, which prevents you from originating loans until the requirement is fulfilled and your license is renewed.' },
  { q: 'I already completed CE with another provider. Can I retake it with RELSTONE?', a: 'No. NMLS does not allow you to repeat CE coursework that has already been reported and accepted for the current calendar year. Each of the 8 required CE hours can only be counted once per year, regardless of the provider. If you have already fulfilled your CE for the year, no additional courses are needed until the following year.' },
];

const Stars = ({ rating = 5 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24"
        fill={i <= rating ? '#F59E0B' : 'none'}
        stroke="#F59E0B" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // modal: null | 'login' | 'register'
  const [modal, setModal] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [ctaForm, setCtaForm] = useState({ firstName: '', lastName: '', email: '', phone: '', state: '' });

  // ── Live testimonials from API ──────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

useEffect(() => {
  API.get('/testimonials?limit=6')
    .then(res => setTestimonials(res.data.testimonials || []))
    .catch(err => console.error('Failed to load testimonials:', err))
    .finally(() => setTestimonialsLoading(false));
}, []);
  // ───────────────────────────────────────────────────────────────────────────

  const setF = k => e => setCtaForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    <div className="lp-topbar-left">
      <div className="lp-brand" onClick={() => window.scrollTo(0, 0)} role="button" tabIndex={0}>
        <img src={logo} alt="Relstone NMLS" className="lp-brand-logo" />
        <div className="lp-brand-text hide-mobile">
          <div className="lp-brand-nmls">RELSTONE</div>
          <div className="lp-brand-sub">NMLS Mortgage Licensing</div>
        </div>
      </div>
    </div>

    <nav className="lp-nav hide-tablet">
      {NAV_LINKS.map((link) => (
        <a key={link.href} href={link.href} className="lp-nav-link">
          {link.label}
        </a>
      ))}
    </nav>

    <div className="lp-nav-right">
    
      <button className="lp-nav-ghost" onClick={() => setModal('login')}>Sign In</button>
      <button className="lp-nav-enroll" onClick={() => setModal('register')}>Enroll</button>
    </div>
  </div>
</header>

        {/* ════════ HERO ════════ */}
        <section className="lp-hero">
          <div className="lp-container lp-hero-inner">
            <div className="lp-hero-left">
              {/* Eyebrow pill */}
              <div className="lp-hero-eyebrow-wrap">
                <span className="lp-eyebrow-dot" />
                <span className="lp-hero-eyebrow-text">NMLS-APPROVED EDUCATION PROVIDER</span>
              </div>

              <h1 className="lp-hero-h1">YOUR PATH TO<br /><span className="lp-hero-accent">MORTGAGE</span><br />LICENSURE.</h1>
              <p className="lp-hero-desc">RELSTONE delivers NMLS-approved pre-licensing and continuing education for mortgage professionals. Start your mortgage career compliant and exam-ready from day one.</p>

              <div className="lp-hero-actions">
                <button className="lp-btn-hero-solid" onClick={() => navigate('/courses')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Browse Courses
                </button>
                <button className="lp-btn-hero-outline" onClick={() => setModal('register')}>View Requirements</button>
              </div>

              {/* Badges row */}
              <div className="lp-hero-badges">
                <div className="lp-badge-item">
                  <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3" /></svg>
                  NMLS-Approved
                </div>
                <div className="lp-badge-sep" />
                <div className="lp-badge-item">
                  <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3" /></svg>
                  All 50 States
                </div>
                <div className="lp-badge-sep" />
                <div className="lp-badge-item">
                  <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3" /></svg>
                  Established 1978
                </div>
              </div>
            </div>

            {/* Hero right stats card */}
            <div className="lp-hero-right">
              <div className="lp-hero-stats-card">
                <div className="lp-stats-label">WHY RELSTONE NMLS</div>
                <div className="lp-stats-grid">
                  {[['45+', 'Years in Education'], ['98%', 'First-Time Pass Rate'], ['50K+', 'Licensed Graduates'], ['50', 'States Covered']].map(([n, l]) => (
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
                    ['SAFE Act Pre-Licensing Education', '20 hrs'],
                    ['Annual Continuing Education', '8 hrs / yr'],
                    ['Federal Law & Ethics', 'Included'],
                    ['State-Specific Law Electives', '50 states'],
                    ['Non-Traditional Lending Standards', 'Included'],
                  ].map(([t, b]) => (
                    <div key={t} className="lp-req-item">
                      <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3" /></svg>
                      <span className="lp-req-text">{t}</span>
                      <span className="lp-req-badge">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="lp-statsbar">
            <div className="lp-statsbar-line-top" />
            <div className="lp-container lp-statsbar-inner">
              {[['45+', 'YEARS EDUCATING PROFESSIONALS'], ['50K+', 'LICENSED GRADUATES'], ['50', 'STATES COVERED'], ['98%', 'EXAM PASS RATE']].map(([n, l], i) => (
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
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>, title: '100% Online, Self-Paced', desc: 'Study from any device, anytime. No classroom required.', border: '#2EABFE' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008000" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, title: 'Direct NMLS Reporting', desc: 'Instant NMLS reporting for completed courses.', border: '#008000' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, title: '98% First-Time Pass Rate', desc: 'Exam prep designed specifically for the NMLS exam.', border: '#F59E0B' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, title: 'Dedicated Student Support', desc: 'Live support from licensed professionals, not automated bots.', border: '#091925' },
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
              {
                tag: 'CALIFORNIA DFPI',
                title: '8-Hour CA-DFPI SAFE Comprehensive: Annual MLO Fundamentals',
                pills: [{ l: 'NMLS Approved', c: 'blue' }, { l: 'California', c: 'green' }, { l: 'Required', c: 'orange' }],
                hrs: 8,
                price: '$99',
                desc: 'Covers federal mortgage law (3 hrs), ethics (2 hrs), non-traditional mortgage lending (2 hrs), and California state law & DFPI regulations (1 hr).',
                bullets: ['3 Hours Federal Law', '2 Hours Ethics', '2 Hours Non-Traditional Lending', '1 Hour CA-DFPI Law', 'Direct NMLS Reporting'],
                cta: user ? 'View Course' : 'Enroll Now',
                action: () => user ? navigate('/courses') : setModal('register'),
              },
              {
                tag: 'FLORIDA DBPR',
                title: '8-Hour FL SAFE Comprehensive: Annual MLO Fundamentals',
                pills: [{ l: 'NMLS Approved', c: 'blue' }, { l: 'Florida', c: 'green' }],
                hrs: 8,
                price: '$99',
                desc: 'Covers federal mortgage law (3 hrs), ethics (2 hrs), non-traditional mortgage lending (2 hrs), and Florida state law & regulations (1 hr).',
                bullets: ['3 Hours Federal Law Updates', '2 Hours Ethics', '2 Hours Non-Traditional Lending', '1 Hour Florida Law', 'Direct NMLS Reporting'],
                cta: user ? 'View Course' : 'Enroll Now',
                action: () => user ? navigate('/courses') : setModal('register'),
              },
              {
                tag: 'HAWAII DFI',
                title: '8-Hour HI SAFE Comprehensive: Annual MLO Fundamentals',
                pills: [{ l: 'NMLS Approved', c: 'blue' }, { l: 'Hawaii', c: 'teal' }],
                hrs: 8,
                price: '$99',
                desc: 'Covers federal mortgage law (3 hrs), ethics (2 hrs), non-traditional mortgage lending (2 hrs), and Hawaii state law & regulations (1 hr).',
                bullets: ['3 Hours Federal Law', '2 Hours Ethics', '2 Hours Non-Traditional Lending', '1 Hour Hawaii Law', 'Direct NMLS Reporting'],
                cta: user ? 'View Course' : 'Enroll Now',
                action: () => user ? navigate('/courses') : setModal('register'),
              },
            ].map((c, i) => (
              <div key={i} className="lp-course-card">
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
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
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-center">
            <p className="lp-eyebrow-sky">WHY CHOOSE RELSTONE</p>
            <h2 className="lp-h2 lp-h2--light">EVERY NMLS REQUIREMENT,<br /><span className="lp-blue">OUT OF THE BOX.</span></h2>
            <p className="lp-sub lp-sub--light">Built to comply with all NMLS standards and delivered in a format that works for busy professionals.</p>
          </div>
          <div className="lp-feat-grid">
            {[
              { bg: 'rgba(46,171,254,0.1)', border: '#2EABFE', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>, title: 'Easy Course Navigation', desc: 'Our platform is designed for ease of use — intuitive navigation, clear progress tracking, and zero technical friction.' },
              { bg: 'rgba(0,255,9,0.1)', border: '#00FF09', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, title: 'Regulatory Compliance', desc: 'All courses are continuously updated to reflect the latest CFPB, Dodd-Frank, RESPA, and TILA regulatory changes.' },
              { bg: 'rgba(245,158,11,0.1)', border: '#F59E0B', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, title: 'Limited-Time Licensing', desc: 'NMLS enforces deadlines. Our courses keep you on track with built-in deadline reminders and renewal alerts.' },
              { bg: 'rgba(149,105,247,0.1)', border: '#9569F7', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9569F7" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>, title: 'Live Student Support', desc: 'Real humans answer your questions. Our support team includes licensed mortgage professionals who understand the industry.' },
              { bg: 'rgba(46,171,254,0.1)', border: '#2EABFE', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, title: 'Instant Certificates', desc: 'Download your certificate of completion immediately upon finishing. Print or share digitally — always available in your student portal.' },
              { bg: 'rgba(239,68,68,0.1)', border: '#EF4444', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>, title: 'Mobile-Friendly Platform', desc: "Study on any device — phone, tablet, or desktop. Your progress syncs automatically so you never lose your place." },
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
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">NMLS REQUIREMENTS</p>
            <h2 className="lp-h2">BUILT TO MEET EVERY<br /><span className="lp-blue">NMLS STANDARD.</span></h2>
            <p className="lp-sub">Every course is designed with the NMLS requirement checklist in mind so you graduate fully compliant — first time, every time.</p>
          </div>
          <div className="lp-req-grid">
            {[
              { t: 'Dedicated Student Support', d: 'Federal requirement for all new MLOs. Covers federal law, ethics, non-traditional lending, and 12 elective hours.' },
              { t: '8-Hour Annual Continuing Education', d: 'Required every year for license renewal. Must include 3 hrs federal law, 2 hrs ethics, 2 hrs non-traditional lending.' },
              { t: 'State-Specific Law Requirements', d: 'Many states require additional state law hours. We offer state-specific courses for CA, TX, FL, NY, and more.' },
              { t: 'Background & Credit Check Compliance', d: 'We guide you through the NMLS background check and credit report requirements before licensing.' },
              { t: '8-Year Waiting Period Guidance', d: 'Certain felonies require a waiting period before licensure. We help you understand your eligibility upfront.' },
              { t: 'High-Cost Mortgage Loan Training', d: 'Coverage of HOEPA, TILA Section 32, and high-cost mortgage guidelines required for full compliance.' },
              { t: 'Right of Rescission & RESPA', d: 'Detailed coverage of the three-day right of rescission and RESPA requirements including affiliated business arrangements.' },
              { t: 'Equal Credit Opportunity Act (ECOA)', d: 'Prohibition of credit discrimination and notification requirements thoroughly covered in our ethics modules.' },
            ].map((r, i) => (
              <div key={i} className="lp-req-card">
                <div className="lp-req-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <div className="lp-req-title">{r.t}</div>
                  <div className="lp-req-desc">{r.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS — live from API ════════ */}
      <section className="lp-testimonials">
        <div className="lp-container">
          <div className="lp-section-center">
            <p className="lp-eyebrow-blue">STUDENT SUCCESS STORIES</p>
            <h2 className="lp-h2">REAL RESULTS FROM<br /><span className="lp-blue">REAL MORTGAGE PROFESSIONALS</span></h2>
            <p className="lp-sub">Thousands of MLOs have used RELSTONE to get licensed and stay compliant.</p>
          </div>

          {/* Loading state */}
          {testimonialsLoading && (
            <div className="lp-tcard-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="lp-tcard-skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!testimonialsLoading && testimonials.length === 0 && (
            <p className="lp-tcard-empty">No testimonials available yet.</p>
          )}

          {/* Live testimonials grid */}
          {!testimonialsLoading && testimonials.length > 0 && (
            <div className="lp-tcard-grid">
              {testimonials.map((t) => (
                <div key={t._id} className="lp-tcard">
                  <Stars rating={t.rating} />
                  <p className="lp-tcard-text">"{t.comment}"</p>
                  <div className="lp-tcard-author">
                    <div className="lp-tcard-avatar">
                      {t.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="lp-tcard-name">{t.name}</div>
                      <div className="lp-tcard-role">{t.course_title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <div key={i} className={`lp-faq-item${openFaq === i ? ' lp-faq-item--open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className={`lp-faq-toggle${openFaq === i ? ' lp-faq-toggle--open' : ''}`}>
                    {openFaq === i
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    }
                  </span>
                </button>
                {openFaq === i && <div className="lp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA + FORM ════════ */}
      <section className="lp-cta-section">
        <div className="lp-container lp-cta-grid">
          <div>
            <p className="lp-eyebrow-small">— GET STARTED TODAY</p>
            <h2 className="lp-cta-h2">READY TO START YOUR<br /><span className="lp-blue">BUILT FOR COMPLIANCE.</span></h2>
            <p className="lp-body" style={{ marginBottom: 20 }}>Create your free account and get instant access to course previews, state requirements, and enrollment options. No credit card required.</p>
            <div className="lp-cta-checks">
              {['Instant access to 100% online courses', 'NMLS completions reported automatically', 'State requirements checked for you', 'Live student support from day one', 'Certificate download upon completion'].map(t => (
                <div key={t} className="lp-cta-check">
                  <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3" /></svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-signup-card">
            <p className="lp-signup-label">CREATE YOUR FREE ACCOUNT</p>
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
          <p className="lp-footer-copy">
            © Copyright {new Date().getFullYear()} <a href="#" className="lp-footer-link-blue">Real Estate License Services, Inc.</a> — A California School Established 1978. All Rights Reserved.
          </p>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">Privacy Policy</a>
            <span className="lp-footer-dot">·</span>
            <a href="#" className="lp-footer-link">Terms of Use</a>
            <span className="lp-footer-dot">·</span>
            <a href="#" className="lp-footer-link">NMLS Disclosure</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Poppins', system-ui, sans-serif; background: #F2F6F9; }

.lp-root { font-family: 'Poppins', system-ui, sans-serif; color: #091925; overflow-x: hidden; }
.lp-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.lp-blue { color: #2EABFE; }

/* ════ HERO WRAPPER ════ */
.lp-hero-wrapper {
  position: relative;
  background-color: #091925;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  padding-top: 71px;
}
.lp-hero-base {
  position: absolute; inset: 0;
  background: rgba(9, 25, 37, 0.28);
  z-index: 1; pointer-events: none;
}
.lp-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(9,25,37,0.0) 0%, rgba(46,171,254,0.12) 100%);
  z-index: 2; pointer-events: none;
}

/* ════ NAV ════ */
/* ════ NAV ════ */
.lp-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(9, 25, 37, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  height: 80px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lp-topbar--scrolled {
  background: rgba(9, 25, 37, 0.95);
  height: 65px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-bottom-color: rgba(46, 171, 254, 0.2);
}

.lp-topbar-inner {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.lp-topbar-left { display: flex; align-items: center; }

.lp-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.lp-brand-logo { height: 34px; width: auto; object-fit: contain; }

.lp-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.lp-brand-nmls { font-weight: 800; font-size: 18px; color: #fff; letter-spacing: -0.5px; }
.lp-brand-sub { font-size: 10px; color: #2EABFE; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }

.lp-nav { display: flex; align-items: center; gap: 8px; }
.lp-nav-link {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}
.lp-nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }

.lp-nav-right { display: flex; align-items: center; gap: 12px; }

/* Fixed Search in Header */
.lp-topbar-search {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 12px;
  height: 38px;
  border-radius: 20px;
  width: 200px;
  transition: all 0.3s;
}
.lp-topbar-search:focus-within {
  width: 260px;
  background: rgba(255, 255, 255, 0.1);
  border-color: #2EABFE;
}
.lp-search-input {
  background: transparent; border: none; outline: none;
  color: #fff; font-size: 13px; width: 100%; margin-left: 8px;
}
.lp-search-icon { color: rgba(255, 255, 255, 0.4); }

.lp-nav-ghost {
  color: #fff; font-weight: 600; font-size: 13px;
  background: transparent; border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 18px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.lp-nav-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.05); }

.lp-nav-enroll {
  background: #2EABFE; color: #091925; font-weight: 700; font-size: 13px;
  border: none; padding: 9px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.lp-nav-enroll:hover { background: #60C3FF; transform: translateY(-1px); }

/* Helper Classes */
@media (max-width: 1024px) {
  .hide-tablet { display: none !important; }
}
@media (max-width: 640px) {
  .hide-mobile { display: none !important; }
  .lp-topbar { height: 70px; }
  .lp-brand-logo { height: 28px; }
  .lp-nav-right { gap: 8px; }
  .lp-nav-enroll { padding: 8px 14px; }
}
/* ════ HERO ════ */
.lp-hero {
  position: relative; background: transparent;
  display: flex; flex-direction: column;
  min-height: calc(100vh - 71px); justify-content: center;
}
.lp-hero-inner {
  position: relative; z-index: 3; flex: 1;
  display: grid; grid-template-columns: 1fr 460px;
  gap: 40px; align-items: center;
  padding: 50px 40px 44px;
  max-width: 1200px; margin: 0 auto; width: 100%;
}
.lp-hero-eyebrow-wrap {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 12px; height: 28px;
  background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE;
  border-radius: 100px; margin-bottom: 18px;
}
.lp-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #00FF09; box-shadow: 0 0 4px #00FF09; flex-shrink: 0;
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.lp-hero-eyebrow-text {
  font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
  color: #2EABFE; letter-spacing: 0.5px; text-transform: uppercase;
}
.lp-hero-h1 {
  font-family: 'Poppins', sans-serif; font-size: 58px; line-height: 56px;
  font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 18px;
}
.lp-hero-accent { color: #2EABFE; }
.lp-hero-desc {
  font-family: 'Poppins', sans-serif; font-size: 15px; line-height: 22px; font-weight: 500;
  color: rgba(255,255,255,0.82); max-width: 480px; margin-bottom: 26px;
}
.lp-hero-actions { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.lp-btn-hero-solid {
  display: inline-flex; align-items: center; gap: 8px;
  width: 160px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #091925; background: #2EABFE; border-radius: 5px; border: 0.5px solid #2EABFE;
  cursor: pointer; justify-content: center; transition: background .15s;
}
.lp-btn-hero-solid:hover { background: #60C3FF; }
.lp-btn-hero-outline {
  display: inline-flex; align-items: center; justify-content: center;
  width: 160px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; border: 1px solid #fff; border-radius: 5px; background: transparent;
  cursor: pointer; transition: all .15s;
}
.lp-btn-hero-outline:hover { background: rgba(255,255,255,0.08); }
.lp-hero-badges { display: flex; align-items: center; flex-wrap: wrap; }
.lp-badge-item {
  display: flex; align-items: center; gap: 5px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #fff;
}
.lp-badge-sep { width: 0; height: 9px; border-left: 0.5px solid #2EABFE; margin: 0 12px; }
.lp-hero-stats-card {
  background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE;
  border-radius: 8px; padding: 20px;
}
.lp-stats-label {
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
  color: #fff; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px;
}
.lp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 0; }
.lp-stat-box {
  background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE;
  padding: 10px 10px; text-align: center;
}
.lp-stat-num {
  font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 800;
  color: #2EABFE; line-height: 1.2;
}
.lp-stat-desc {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  color: #fff; line-height: 1.4; text-align: center;
}
.lp-stats-divider { width: 100%; height: 0.5px; background: #2EABFE; margin: 14px 0; }
.lp-req-label {
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
  color: #fff; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px;
}
.lp-req-list { display: flex; flex-direction: column; gap: 9px; }
.lp-req-item { display: flex; align-items: center; gap: 8px; }
.lp-req-text { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #fff; }
.lp-req-badge { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #2EABFE; white-space: nowrap; }

/* Stats bar */
.lp-statsbar { position: relative; z-index: 10; background: rgba(9,25,37,0.75); }
.lp-statsbar-line-top, .lp-statsbar-line-bottom { width: 100%; height: 0; border-top: 0.5px solid #2EABFE; }
.lp-statsbar-inner {
  display: grid; grid-template-columns: repeat(4,1fr);
  padding: 16px 40px; max-width: 1200px; margin: 0 auto; position: relative;
}
.lp-sbar-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 12px 10px; position: relative; }
.lp-sbar-divider { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 0; height: 100px; border-left: 0.5px solid #2EABFE; }
.lp-sbar-num { font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; color: #2EABFE; line-height: 1.2; }
.lp-sbar-lbl { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700; color: #fff; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }

/* ════ Shared ════ */
.lp-eyebrow-small { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.lp-eyebrow-blue { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; display: inline-block; }
.lp-eyebrow-sky { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; display: inline-block; }
.lp-h2 { font-family: 'Poppins', sans-serif; font-size: 38px; font-weight: 700; line-height: 40px; color: #091925; margin-bottom: 12px; text-transform: uppercase; }
.lp-h2--light { color: #fff; }
.lp-sub { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; color: #091925; line-height: 22px; }
.lp-sub--light { color: rgba(255,255,255,0.7); }
.lp-body { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; line-height: 22px; color: #091925; margin-bottom: 12px; }
.lp-body strong { color: #091925; font-weight: 600; }
.lp-section-center { text-align: center; margin-bottom: 40px; }

/* ════ ABOUT ════ */
.lp-about { padding: 64px 0; background: #fff; min-height: 100vh; display: flex; align-items: center; }
.lp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; width: 100%; }
.lp-btn-dark {
  display: inline-flex; align-items: center; padding: 0 20px; height: 44px;
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700;
  color: #fff; background: #091925; border-radius: 5px; border: 0.5px solid #091925;
  cursor: pointer; margin-top: 8px; transition: background .15s;
}
.lp-btn-dark:hover { background: #1e3a52; }
.lp-about-cards { display: flex; flex-direction: column; gap: 12px; }
.lp-about-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; border: 0.5px solid #5B7384; border-radius: 5px; background: #fff; transition: box-shadow .2s; }
.lp-about-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.lp-about-card-icon { width: 48px; height: 48px; min-width: 48px; border-radius: 5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lp-about-card-title { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 3px; line-height: 18px; }
.lp-about-card-desc { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; color: #091925; line-height: 18px; }

/* ════ COURSES ════ */
.lp-courses { padding: 64px 0; background: #F2F6F9; min-height: 100vh; display: flex; align-items: center; }
.lp-courses .lp-container { width: 100%; }
.lp-course-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-course-card { background: #fff; border: 0.5px solid rgba(46,171,254,0.5); border-radius: 5px; display: flex; flex-direction: column; overflow: hidden; }
.lp-course-header { background: #091925; position: relative; padding: 18px 20px; min-height: 120px; }
.lp-course-header::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%); pointer-events: none; }
.lp-course-body { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }
.lp-course-tag { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 500; color: #2EABFE; margin-bottom: 5px; text-transform: uppercase; position: relative; z-index: 1; }
.lp-course-title { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 8px; text-transform: capitalize; position: relative; z-index: 1; }
.lp-course-pills { display: flex; gap: 5px; flex-wrap: wrap; position: relative; z-index: 1; }
.lp-cpill { padding: 2px 8px; border-radius: 4px; font-family: 'Poppins', sans-serif; font-size: 10px; font-weight: 700; height: 22px; display: inline-flex; align-items: center; text-transform: capitalize; }
.lp-cpill--blue   { background: rgba(46,171,254,0.1); color: #2EABFE; border: 0.5px solid #2EABFE; }
.lp-cpill--green  { background: rgba(0,255,9,0.1);   color: #00FF09; border: 0.5px solid #00FF09; }
.lp-cpill--orange { background: rgba(245,158,11,0.1); color: #F59E0B; border: 0.5px solid #F59E0B; }
.lp-cpill--teal   { background: rgba(0,255,9,0.1);   color: #00FF09; border: 0.5px solid #00FF09; }
.lp-course-hrs { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; margin-top: 2px; }
.lp-hrs-num { font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; color: #2EABFE; line-height: 1; }
.lp-hrs-lbl { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 500; color: #7FA8C4; line-height: 1.4; text-transform: uppercase; }
.lp-course-desc { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; color: #091925; margin-bottom: 12px; }
.lp-course-bullets { list-style: none; display: flex; flex-direction: column; gap: 5px; flex: 1; margin-bottom: 16px; }
.lp-course-bullets li { display: flex; align-items: center; gap: 7px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 400; color: #5B7384; line-height: 15px; }
.lp-course-footer { display: flex; align-items: center; justify-content: space-between; border-top: 0.5px solid rgba(46,171,254,0.5); padding-top: 14px; margin-top: auto; }
.lp-course-price { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #091925; line-height: 1; }
.lp-course-unit { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 500; color: #7FA8C4; margin-left: 2px; }
.lp-btn-blue { padding: 0 14px; height: 36px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #091925; background: #2EABFE; border: 0.5px solid #2EABFE; border-radius: 5px; cursor: pointer; transition: background .15s; white-space: nowrap; min-width: 110px; }
.lp-btn-blue:hover { background: #1a9ee0; color: #fff; }

/* ════ FEATURES ════ */
.lp-features { padding: 64px 0; background: #091925; min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; }
.lp-features::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%); pointer-events: none; z-index: 0; }
.lp-features .lp-container { position: relative; z-index: 1; width: 100%; }
.lp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.lp-feat-card { padding: 22px 18px; border: 0.5px solid rgba(46,171,254,0.2); border-radius: 5px; background: rgba(46,171,254,0.05); transition: background .2s, border-color .2s; }
.lp-feat-card:hover { background: rgba(46,171,254,0.1); border-color: rgba(46,171,254,0.3); }
.lp-feat-icon { width: 52px; height: 52px; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.lp-feat-title { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 22px; }
.lp-feat-desc { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; color: rgba(255,255,255,0.65); }

/* ════ REQUIREMENTS ════ */
.lp-requirements { padding: 64px 0; background: #F2F6F9; min-height: 100vh; display: flex; align-items: center; }
.lp-requirements .lp-container { width: 100%; }
.lp-req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.lp-req-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; border: 0.5px solid #5B7384; border-radius: 5px; background: #fff; }
.lp-req-check { width: 18px; height: 18px; border-radius: 50%; background: #008000; border: 0.25px solid #008000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.lp-req-title { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 4px; line-height: 18px; }
.lp-req-desc { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 400; line-height: 16px; color: #091925; }

/* ════ TESTIMONIALS ════ */
.lp-testimonials { padding: 64px 0; background: #F2F6F9; min-height: 100vh; display: flex; align-items: center; }
.lp-testimonials .lp-container { width: 100%; }
.lp-tcard-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-tcard { background: #fff; border: 0.5px solid rgba(46,171,254,0.5); border-radius: 5px; padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
.lp-tcard-text { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; line-height: 18px; color: #091925; font-style: italic; flex: 1; }
.lp-tcard-author { display: flex; align-items: center; gap: 10px; }
.lp-tcard-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2EABFE; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 700; color: #091925; flex-shrink: 0; }
.lp-tcard-name { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #091925; line-height: 16px; }
.lp-tcard-role { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 400; color: #5B7384; }

/* Testimonial loading skeleton */
.lp-tcard-loading { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-tcard-skeleton {
  height: 200px; border-radius: 5px;
  background: linear-gradient(90deg, #e8edf0 25%, #d0dae0 50%, #e8edf0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.lp-tcard-empty { text-align: center; font-family: 'Poppins', sans-serif; font-size: 14px; color: #5B7384; padding: 40px 0; }

/* ════ FAQ ════ */
.lp-faq { padding: 64px 0; background: #F2F6F9; min-height: 100vh; display: flex; align-items: center; }
.lp-faq-wrap { max-width: 700px; margin: 0 auto; padding: 0 18px; width: 100%; }
.lp-faq-list { display: flex; flex-direction: column; gap: 8px; }
.lp-faq-item { border: 0.5px solid #5B7384; border-radius: 5px; overflow: hidden; background: #fff; transition: border-color .2s; }
.lp-faq-item--open { border-color: #5B7384; }
.lp-faq-q { width: 100%; padding: 15px 18px; display: flex; justify-content: space-between; align-items: center; gap: 14px; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; text-align: left; line-height: 18px; }
.lp-faq-item--open .lp-faq-q { background: rgba(46,171,254,0.1); }
.lp-faq-toggle { width: 28px; height: 28px; border-radius: 5px; border: 0.5px solid #5B7384; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
.lp-faq-toggle--open { background: #2EABFE; border-color: #2EABFE; }
.lp-faq-a { padding: 12px 18px 16px; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; line-height: 20px; color: #091925; background: rgba(46,171,254,0.05); }

/* ════ CTA ════ */
.lp-cta-section { padding: 64px 0; background: #F2F6F9; min-height: 100vh; display: flex; align-items: center; }
.lp-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; width: 100%; }
.lp-cta-h2 { font-family: 'Poppins', sans-serif; font-size: 38px; font-weight: 700; line-height: 40px; color: #091925; margin-bottom: 12px; text-transform: uppercase; }
.lp-cta-checks { display: flex; flex-direction: column; gap: 7px; margin-top: 8px; }
.lp-cta-check { display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #5B7384; }
.lp-signup-card { background: #fff; border: 0.5px solid #5B7384; border-radius: 5px; padding: 24px; }
.lp-signup-label { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 16px; text-transform: uppercase; }
.lp-signup-form { display: flex; flex-direction: column; gap: 10px; }
.lp-signup-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lp-signup-inp { width: 100%; padding: 10px 12px; border: 0.5px solid #7FA8C4; border-radius: 5px; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #091925; outline: none; transition: border-color .15s; background: rgba(127,168,196,0.1); height: 46px; }
.lp-signup-inp:focus { border-color: #2EABFE; }
.lp-signup-inp::placeholder { color: rgba(127,168,196,0.5); }
.lp-signup-sel { color: rgba(91,115,132,0.75); appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 10px center; background-size: 14px; padding-right: 30px; }
.lp-signup-btn { padding: 0; height: 46px; background: #091925; color: #fff; border: 0.5px solid #091925; border-radius: 5px; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: background .15s; }
.lp-signup-btn:hover { background: #1e3a52; }
.lp-signup-fine { text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: #7FA8C4; }

/* ════ FOOTER BAND ════ */
.lp-footer-band { background: #091925; padding: 52px 0; position: relative; overflow: hidden; }
.lp-footer-band-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%); z-index: 0; }
.lp-footer-band-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
.lp-footer-band-eye { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.lp-footer-band-h2 { font-family: 'Poppins', sans-serif; font-size: 40px; font-weight: 700; line-height: 42px; color: #fff; margin-bottom: 12px; text-transform: uppercase; }
.lp-footer-band-sub { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; line-height: 22px; color: rgba(255,255,255,0.65); max-width: 480px; }
.lp-btn-enroll { display: inline-flex; align-items: center; justify-content: center; padding: 0 32px; height: 58px; background: #2EABFE; color: #091925; font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; border-radius: 999px; border: 0.5px solid #2EABFE; cursor: pointer; white-space: nowrap; transition: all .2s; min-width: 240px; }
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
  .lp-tcard-loading { grid-template-columns: 1fr 1fr; }
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
  .lp-tcard-loading { grid-template-columns: 1fr; }
  .lp-signup-row { grid-template-columns: 1fr; }
  .lp-footer-band-inner { flex-direction: column; text-align: center; }
  .lp-footer-inner { flex-direction: column; text-align: center; }
  .lp-footer-links { justify-content: center; }
  .lp-statsbar-inner { grid-template-columns: repeat(2,1fr); padding: 12px 16px; }
  .lp-h2 { font-size: 28px; line-height: 30px; }
}
`;

export default LandingPage;