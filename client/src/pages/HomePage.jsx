import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { HowItWorksModal } from '../components/HowItWorksModal';

const TESTIMONIALS = [
  { name: 'James R.', role: 'Mortgage Loan Originator — California', avatar: 'JR', rating: 5, text: "RELSTONE helped me get my MLO license the first time around. The course was clear, well-organized, and the NMLS reporting was instant. I'd recommend it to anyone starting in mortgage." },
  { name: 'Sarah M.', role: 'Senior MLO — Texas',                    avatar: 'SM', rating: 5, text: "I've done my CE renewal with RELSTONE for three years running. The courses are always up to date with the latest regulations, and the platform makes it easy to stay on track so I never miss a deadline." },
  { name: 'David K.', role: 'Branch Manager — Florida',              avatar: 'DK', rating: 5, text: "The platform is incredibly well-designed and easy to navigate. Everything from enrollment to certificate download was seamless. RELSTONE is the only provider I'll use going forward." },
];

const FAQS = [
  { q: 'What is the SAFE Act and why does it require 20 hours of education?',          a: 'The SAFE Mortgage Licensing Act (SAFE Act) is a federal law that established minimum standards for the licensing and registration of mortgage loan originators (MLOs). It requires all new MLOs to complete at least 20 hours of NMLS-approved pre-licensing education before sitting for the NMLS exam. This includes 3 hours of federal law, 3 hours of ethics, 2 hours of non-traditional lending, and 12 elective hours.' },
  { q: 'How long does it take to complete the 20-hour PE course?',                     a: 'The 20-hour PE course is self-paced, but NMLS requires that it be completed over a minimum of 3 days. Most students complete it within 1–2 weeks working a few hours per day. You have 6 months from enrollment to complete the course.' },
  { q: 'Are you an accredited NMLS-approved education provider?',                      a: 'Yes. RELSTONE is a fully accredited NMLS-approved education provider. Our Provider ID is listed in the NMLS Course Catalog and all completions are reported automatically to your NMLS record.' },
  { q: 'What happens after I complete the PE course?',                                 a: "Upon successful completion, you will receive a downloadable certificate immediately from your student portal. Your completion is also automatically reported to NMLS within 1 business day." },
  { q: "Do I need to complete CE every year even if I haven't originated any loans?",  a: 'Yes. NMLS requires 8 hours of CE annually for all licensed MLOs, regardless of production volume. Failure to complete CE by the deadline will result in your license being placed in an "approved-inactive" status.' },
  { q: 'I already completed CE with another provider. Can I retake it with RELSTONE?', a: 'No. NMLS does not allow you to repeat CE coursework that has already been reported and accepted for the current calendar year. Each of the 8 required CE hours can only be counted once per year.' },
];

const Stars = () => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

const HomePage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [openFaq, setOpenFaq]               = useState(0);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    const isNewUser   = sessionStorage.getItem('relstone_is_new_user');
    const alreadySeen = localStorage.getItem('relstone_how_it_works_seen');
    if (isNewUser && !alreadySeen) {
      const t = setTimeout(() => setShowHowItWorks(true), 500);
      sessionStorage.removeItem('relstone_is_new_user');
      return () => clearTimeout(t);
    }
  }, []);

  const handleCloseHowItWorks = () => {
    localStorage.setItem('relstone_how_it_works_seen', '1');
    setShowHowItWorks(false);
  };

  const handleDashboard = () =>
    navigate(user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');

  return (
    <Layout>
      <div className="hp-root">
        <style>{CSS}</style>

        {showHowItWorks && (
          <HowItWorksModal user={user} onClose={handleCloseHowItWorks} />
        )}

        {/* ════════ HERO ════════ */}
        <section className="hp-hero">
          <div className="hp-hero-bg-grid" />
          <div className="hp-hero-glow" />

          <div className="hp-container hp-hero-inner">
            {/* Left */}
            <div className="hp-hero-left">
              <div className="hp-hero-eyebrow-wrap">
                <span className="hp-eyebrow-dot" />
                <span className="hp-hero-eyebrow-text">NMLS-APPROVED EDUCATION PROVIDER</span>
              </div>
              <h1 className="hp-hero-h1">
                YOUR PATH TO<br />
                <span className="hp-hero-accent">MORTGAGE</span><br />
                LICENSURE.
              </h1>
              <p className="hp-hero-desc">
                RELSTONE delivers NMLS-approved pre-licensing and continuing education for mortgage
                professionals. Stay compliant, study at your own pace, and earn your certificates.
              </p>
              <div className="hp-hero-actions">
                <button className="hp-btn-hero-solid" onClick={handleDashboard}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Go to Dashboard
                </button>
                <button className="hp-btn-hero-outline" onClick={() => navigate('/courses')}>
                  Browse Courses
                </button>
              </div>
              <div className="hp-hero-badges">
                {['NMLS-Approved','All 50 States','Established 1978'].map((b, i) => (
                  <div key={b} style={{ display:'flex', alignItems:'center' }}>
                    {i > 0 && <div className="hp-badge-sep" />}
                    <div className="hp-badge-item">
                      <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                      {b}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — stats card */}
            <div className="hp-hero-right">
              <div className="hp-hero-stats-card">
                <div className="hp-stats-label">WHY RELSTONE NMLS</div>
                <div className="hp-stats-grid">
                  {[['45+','Years in Education'],['98%','First-Time Pass Rate'],['50K+','Licensed Graduates'],['50','States Covered']].map(([n,l]) => (
                    <div key={l} className="hp-stat-box">
                      <div className="hp-stat-num">{n}</div>
                      <div className="hp-stat-desc">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="hp-stats-divider" />
                <div className="hp-req-label">KEY NMLS REQUIREMENTS COVERED</div>
                <div className="hp-req-list">
                  {[
                    ['SAFE Act Pre-Licensing Education','20 hrs'],
                    ['Annual Continuing Education','8 hrs / yr'],
                    ['Federal Law & Ethics','Included'],
                    ['State-Specific Law Electives','50 states'],
                    ['Non-Traditional Lending Standards','Included'],
                  ].map(([t,b]) => (
                    <div key={t} className="hp-req-item">
                      <svg width="10" height="8" viewBox="0 0 24 20" fill="none" stroke="#00FF09" strokeWidth="3" strokeLinecap="round"><polyline points="2 10 9 17 22 3"/></svg>
                      <span className="hp-req-text">{t}</span>
                      <span className="hp-req-badge">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="hp-statsbar">
            <div className="hp-statsbar-line" />
            <div className="hp-container hp-statsbar-inner">
              {[['45+','YEARS EDUCATING PROFESSIONALS'],['50K+','LICENSED GRADUATES'],['50','STATES COVERED'],['98%','EXAM PASS RATE']].map(([n,l], i) => (
                <div key={l} className="hp-sbar-item">
                  {i > 0 && <div className="hp-sbar-divider" />}
                  <div className="hp-sbar-num">{n}</div>
                  <div className="hp-sbar-lbl">{l}</div>
                </div>
              ))}
            </div>
            <div className="hp-statsbar-line" />
          </div>
        </section>

        {/* ════════ ABOUT ════════ */}
        <section className="hp-about" id="why">
          <div className="hp-container hp-about-grid">
            <div>
              <p className="hp-eyebrow-small">— ABOUT RELSTONE NMLS</p>
              <h2 className="hp-h2">NMLS–APPROVED EDUCATION<br />BUILT FOR <span className="hp-blue">COMPLIANCE.</span></h2>
              <p className="hp-body">RELSTONE is a nationally recognized, NMLS-approved education provider with over 45 years of experience training real estate and mortgage professionals. Our curriculum is built to meet every NMLS requirement — out of the box.</p>
              <p className="hp-body">Whether you're starting your mortgage career with <strong>SAFE Act Pre-Licensing</strong>, maintaining your license with <strong>Annual Continuing Education</strong>, or seeking <strong>state-specific elective hours</strong>, RELSTONE delivers the most current, exam-relevant content available.</p>
              <p className="hp-body">All courses are fully online, self-paced, and report directly to NMLS upon completion. No scheduling, no classroom, no waiting.</p>
              <button className="hp-btn-dark" onClick={() => navigate('/courses')}>Browse Courses →</button>
            </div>
            <div className="hp-about-cards">
              {[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title:'100% Online, Self-Paced',     desc:'Study from any device, anytime. No classroom required.',                         border:'#2EABFE' },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#008000" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:'Direct NMLS Reporting',         desc:'Instant NMLS reporting for completed courses.',                                   border:'#008000' },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title:'98% First-Time Pass Rate',      desc:'Exam prep designed specifically for the NMLS exam.',                              border:'#F59E0B' },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title:'Dedicated Student Support',     desc:'Live support from licensed professionals, not automated bots.',                   border:'#091925' },
              ].map((c,i) => (
                <div key={i} className="hp-about-card">
                  <div className="hp-about-card-icon" style={{ border:`0.5px solid ${c.border}`, background:`${c.border}18` }}>{c.icon}</div>
                  <div>
                    <div className="hp-about-card-title">{c.title}</div>
                    <div className="hp-about-card-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ FEATURES ════════ */}
        <section className="hp-features" id="features">
          <div className="hp-container">
            <div className="hp-section-center">
              <p className="hp-eyebrow-sky">WHY CHOOSE RELSTONE</p>
              <h2 className="hp-h2 hp-h2--light">EVERY NMLS REQUIREMENT,<br /><span className="hp-blue">OUT OF THE BOX.</span></h2>
              <p className="hp-sub hp-sub--light">Built to comply with all NMLS standards and delivered in a format that works for busy professionals.</p>
            </div>
            <div className="hp-feat-grid">
              {[
                { bg:'rgba(46,171,254,0.1)',  border:'#2EABFE', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title:'Easy Course Navigation',   desc:'Intuitive navigation, clear progress tracking, and zero technical friction.' },
                { bg:'rgba(0,255,9,0.1)',     border:'#00FF09', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title:'Regulatory Compliance',   desc:'Continuously updated to reflect the latest CFPB, Dodd-Frank, RESPA, and TILA changes.' },
                { bg:'rgba(245,158,11,0.1)',  border:'#F59E0B', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title:'Limited-Time Licensing',   desc:'Built-in deadline reminders and renewal alerts keep you on track.' },
                { bg:'rgba(149,105,247,0.1)', border:'#9569F7', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9569F7" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>, title:'Live Student Support',     desc:'Real humans — licensed mortgage professionals who know the industry.' },
                { bg:'rgba(46,171,254,0.1)',  border:'#2EABFE', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title:'Instant Certificates',      desc:'Download your certificate immediately upon finishing — always in your student portal.' },
                { bg:'rgba(239,68,68,0.1)',   border:'#EF4444', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, title:'Mobile-Friendly Platform',  desc:'Study on any device — phone, tablet, or desktop. Progress syncs automatically.' },
              ].map((f,i) => (
                <div key={i} className="hp-feat-card">
                  <div className="hp-feat-icon" style={{ background:f.bg, border:`0.5px solid ${f.border}` }}>{f.icon}</div>
                  <div className="hp-feat-title">{f.title}</div>
                  <div className="hp-feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ REQUIREMENTS ════════ */}
        <section className="hp-requirements" id="requirements">
          <div className="hp-container">
            <div className="hp-section-center">
              <p className="hp-eyebrow-blue">NMLS REQUIREMENTS</p>
              <h2 className="hp-h2">BUILT TO MEET EVERY<br /><span className="hp-blue">NMLS STANDARD.</span></h2>
              <p className="hp-sub">Every course is designed with the NMLS requirement checklist in mind so you graduate fully compliant — first time, every time.</p>
            </div>
            <div className="hp-req-grid">
              {[
                { t:'20-Hour Pre-Licensing Education',       d:'Federal requirement for all new MLOs. Covers federal law, ethics, non-traditional lending, and 12 elective hours.' },
                { t:'8-Hour Annual Continuing Education',    d:'Required every year for license renewal. Must include 3 hrs federal law, 2 hrs ethics, 2 hrs non-traditional lending.' },
                { t:'State-Specific Law Requirements',       d:'Many states require additional state law hours. We offer state-specific courses for CA, TX, FL, NY, PA, RI, and more.' },
                { t:'Background & Credit Check Compliance',  d:'We guide you through the NMLS background check and credit report requirements before licensing.' },
                { t:'8-Year Waiting Period Guidance',        d:'Certain felonies require a waiting period before licensure. We help you understand your eligibility upfront.' },
                { t:'High-Cost Mortgage Loan Training',      d:'Coverage of HOEPA, TILA Section 32, and high-cost mortgage guidelines required for full compliance.' },
                { t:'Right of Rescission & RESPA',           d:'Detailed coverage of the three-day right of rescission and RESPA requirements including affiliated business arrangements.' },
                { t:'Equal Credit Opportunity Act (ECOA)',   d:'Prohibition of credit discrimination and notification requirements thoroughly covered in our ethics modules.' },
              ].map((r,i) => (
                <div key={i} className="hp-req-card">
                  <div className="hp-req-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div className="hp-req-title">{r.t}</div>
                    <div className="hp-req-desc">{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ TESTIMONIALS ════════ */}
        <section className="hp-testimonials">
          <div className="hp-container">
            <div className="hp-section-center">
              <p className="hp-eyebrow-blue">STUDENT SUCCESS STORIES</p>
              <h2 className="hp-h2">REAL RESULTS FROM<br /><span className="hp-blue">REAL MORTGAGE PROFESSIONALS</span></h2>
              <p className="hp-sub">Thousands of MLOs have used RELSTONE to get licensed and stay compliant.</p>
            </div>
            <div className="hp-tcard-grid">
              {TESTIMONIALS.map((t,i) => (
                <div key={i} className="hp-tcard">
                  <Stars />
                  <p className="hp-tcard-text">"{t.text}"</p>
                  <div className="hp-tcard-author">
                    <div className="hp-tcard-avatar">{t.avatar}</div>
                    <div>
                      <div className="hp-tcard-name">{t.name}</div>
                      <div className="hp-tcard-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ FAQ ════════ */}
        <section className="hp-faq" id="faq">
          <div className="hp-container hp-faq-wrap">
            <div className="hp-section-center">
              <p className="hp-eyebrow-blue">COMMON QUESTIONS</p>
              <h2 className="hp-h2">COMMON <span className="hp-blue">QUESTIONS</span></h2>
              <p className="hp-sub">Everything you need to know about NMLS licensing education.</p>
            </div>
            <div className="hp-faq-list">
              {FAQS.map((f,i) => (
                <div key={i} className={`hp-faq-item${openFaq===i?' hp-faq-item--open':''}`}>
                  <button className="hp-faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <span>{f.q}</span>
                    <span className={`hp-faq-toggle${openFaq===i?' hp-faq-toggle--open':''}`}>
                      {openFaq===i
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      }
                    </span>
                  </button>
                  {openFaq===i && <div className="hp-faq-a">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ FOOTER BAND (replaces CTA — no sign-up) ════════ */}
        <div className="hp-footer-band">
          <div className="hp-footer-band-overlay" />
          <div className="hp-container hp-footer-band-inner">
            <div>
              <p className="hp-footer-band-eye">— RELSTONE · NMLS — YOUR LEARNING HUB</p>
              <h2 className="hp-footer-band-h2">CONTINUE YOUR<br /><span className="hp-blue">MORTGAGE JOURNEY.</span></h2>
              <p className="hp-footer-band-sub">Browse your courses, track your progress, and earn your NMLS certificates — all in one place.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button className="hp-btn-enroll" onClick={handleDashboard}>Go to Dashboard ——</button>
              <button className="hp-btn-enroll-ghost" onClick={() => navigate('/courses')}>Browse Courses →</button>
            </div>
          </div>
        </div>

        {/* ════════ FOOTER ════════ */}
        <footer className="hp-footer">
          <div className="hp-container hp-footer-inner">
            <p className="hp-footer-copy">
              © Copyright {new Date().getFullYear()} <a href="#" className="hp-footer-link-blue">Real Estate License Services, Inc.</a> — A California School Established 1978. All Rights Reserved.
            </p>
            <div className="hp-footer-links">
              <a href="#" className="hp-footer-link">Privacy Policy</a>
              <span className="hp-footer-dot">·</span>
              <a href="#" className="hp-footer-link">Terms of Use</a>
              <span className="hp-footer-dot">·</span>
              <a href="#" className="hp-footer-link">NMLS Disclosure</a>
            </div>
          </div>
        </footer>

      </div>
    </Layout>
  );
};

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

.hp-root { font-family: 'Poppins', system-ui, sans-serif; color: #091925; overflow-x: hidden; background: #F2F6F9; }
.hp-container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.hp-blue { color: #2EABFE; }

/* ══ HERO ══ */
.hp-hero { background: #091925; position: relative; overflow: hidden; display: flex; flex-direction: column; }
.hp-hero-bg-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(46,171,254,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(46,171,254,0.05) 1px, transparent 1px); background-size: 52px 52px; }
.hp-hero-glow { position: absolute; pointer-events: none; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(46,171,254,0.14) 0%, transparent 65%); top: -100px; right: -80px; }
.hp-hero-inner { position: relative; z-index: 3; flex: 1; display: grid; grid-template-columns: 1fr 460px; gap: 40px; align-items: center; padding: 50px 40px 44px; max-width: 1200px; margin: 0 auto; width: 100%; }
.hp-hero-eyebrow-wrap { display: inline-flex; align-items: center; gap: 8px; padding: 0 12px; height: 28px; background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE; border-radius: 100px; margin-bottom: 18px; }
.hp-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #00FF09; box-shadow: 0 0 4px #00FF09; flex-shrink: 0; animation: hp-blink 2s infinite; }
@keyframes hp-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
.hp-hero-eyebrow-text { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700; color: #2EABFE; letter-spacing: 0.5px; text-transform: uppercase; }
.hp-hero-h1 { font-family: 'Poppins', sans-serif; font-size: clamp(36px,4.5vw,58px); line-height: 1.02; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 18px; }
.hp-hero-accent { color: #2EABFE; }
.hp-hero-desc { font-family: 'Poppins', sans-serif; font-size: 15px; line-height: 1.7; font-weight: 400; color: rgba(255,255,255,0.78); max-width: 480px; margin-bottom: 26px; }
.hp-hero-actions { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.hp-btn-hero-solid { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 22px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #091925; background: #2EABFE; border-radius: 5px; border: 0.5px solid #2EABFE; cursor: pointer; transition: background .15s; }
.hp-btn-hero-solid:hover { background: #60C3FF; }
.hp-btn-hero-outline { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 22px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #fff; border: 1px solid #fff; border-radius: 5px; background: transparent; cursor: pointer; transition: all .15s; }
.hp-btn-hero-outline:hover { background: rgba(255,255,255,0.08); }
.hp-hero-badges { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.hp-badge-item { display: flex; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #fff; }
.hp-badge-sep { width: 0; height: 9px; border-left: 0.5px solid #2EABFE; margin: 0 10px; }

/* Stats card */
.hp-hero-stats-card { background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE; border-radius: 8px; padding: 20px; }
.hp-stats-label { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500; color: #fff; text-transform: uppercase; margin-bottom: 12px; }
.hp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; }
.hp-stat-box { background: rgba(46,171,254,0.1); border: 0.5px solid #2EABFE; padding: 10px; text-align: center; }
.hp-stat-num { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 800; color: #2EABFE; line-height: 1.2; }
.hp-stat-desc { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500; color: #fff; line-height: 1.4; text-align: center; }
.hp-stats-divider { width: 100%; height: 0.5px; background: #2EABFE; margin: 14px 0; }
.hp-req-label { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500; color: #fff; text-transform: uppercase; margin-bottom: 10px; }
.hp-req-list { display: flex; flex-direction: column; gap: 9px; }
.hp-req-item { display: flex; align-items: center; gap: 8px; }
.hp-req-text { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #fff; }
.hp-req-badge { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #2EABFE; white-space: nowrap; }

/* Statsbar */
.hp-statsbar { background: rgba(9,25,37,0.85); position: relative; z-index: 10; }
.hp-statsbar-line { width: 100%; height: 0; border-top: 0.5px solid #2EABFE; }
.hp-statsbar-inner { display: grid; grid-template-columns: repeat(4,1fr); padding: 16px 40px; max-width: 1200px; margin: 0 auto; position: relative; }
.hp-sbar-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 12px 10px; position: relative; }
.hp-sbar-divider { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 0; height: 100px; border-left: 0.5px solid #2EABFE; }
.hp-sbar-num { font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; color: #2EABFE; line-height: 1.2; }
.hp-sbar-lbl { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700; color: #fff; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }

/* ══ Shared ══ */
.hp-eyebrow-small { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; }
.hp-eyebrow-blue  { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; display: inline-block; }
.hp-eyebrow-sky   { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 6px; text-transform: uppercase; display: inline-block; }
.hp-h2 { font-family: 'Poppins', sans-serif; font-size: clamp(26px,3vw,38px); font-weight: 700; line-height: 1.1; color: #091925; margin-bottom: 12px; text-transform: uppercase; }
.hp-h2--light { color: #fff; }
.hp-sub { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; color: #091925; line-height: 22px; }
.hp-sub--light { color: rgba(255,255,255,0.7); }
.hp-body { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; line-height: 22px; color: #091925; margin-bottom: 12px; }
.hp-body strong { font-weight: 600; }
.hp-section-center { text-align: center; margin-bottom: 40px; }

/* ══ ABOUT ══ */
.hp-about { padding: 80px 0; background: #fff; }
.hp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.hp-btn-dark { display: inline-flex; align-items: center; height: 44px; padding: 0 20px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #fff; background: #091925; border-radius: 5px; border: 0.5px solid #091925; cursor: pointer; margin-top: 8px; transition: background .15s; }
.hp-btn-dark:hover { background: #1e3a52; }
.hp-about-cards { display: flex; flex-direction: column; gap: 12px; }
.hp-about-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; border: 0.5px solid #5B7384; border-radius: 5px; background: #fff; transition: box-shadow .2s; }
.hp-about-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.hp-about-card-icon { width: 48px; height: 48px; min-width: 48px; border-radius: 5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hp-about-card-title { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 3px; line-height: 18px; }
.hp-about-card-desc  { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; color: #091925; line-height: 18px; }

/* ══ FEATURES ══ */
.hp-features { padding: 80px 0; background: #091925; position: relative; overflow: hidden; }
.hp-features::before { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(9,25,37,0.05) 0%,rgba(46,171,254,0.3) 100%); pointer-events:none; z-index:0; }
.hp-features .hp-container { position: relative; z-index: 1; }
.hp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
.hp-feat-card { padding: 22px 18px; border: 0.5px solid rgba(46,171,254,0.2); border-radius: 5px; background: rgba(46,171,254,0.05); transition: background .2s, border-color .2s; }
.hp-feat-card:hover { background: rgba(46,171,254,0.1); border-color: rgba(46,171,254,0.3); }
.hp-feat-icon { width: 52px; height: 52px; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.hp-feat-title { font-family: 'Poppins', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 22px; }
.hp-feat-desc  { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 400; line-height: 20px; color: rgba(255,255,255,0.65); }

/* ══ REQUIREMENTS ══ */
.hp-requirements { padding: 80px 0; background: #F2F6F9; }
.hp-req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.hp-req-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; border: 0.5px solid #5B7384; border-radius: 5px; background: #fff; }
.hp-req-check { width: 18px; height: 18px; border-radius: 50%; background: #008000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.hp-req-title { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; margin-bottom: 4px; }
.hp-req-desc  { font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 400; line-height: 16px; color: #091925; }

/* ══ TESTIMONIALS ══ */
.hp-testimonials { padding: 80px 0; background: #F2F6F9; }
.hp-tcard-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.hp-tcard { background: #fff; border: 0.5px solid rgba(46,171,254,0.5); border-radius: 5px; padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
.hp-tcard-text   { font-family: 'Poppins', sans-serif; font-size: 13px; line-height: 18px; color: #091925; font-style: italic; flex: 1; }
.hp-tcard-author { display: flex; align-items: center; gap: 10px; }
.hp-tcard-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2EABFE; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 700; color: #091925; flex-shrink: 0; }
.hp-tcard-name   { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: #091925; }
.hp-tcard-role   { font-family: 'Poppins', sans-serif; font-size: 12px; color: #5B7384; }

/* ══ FAQ ══ */
.hp-faq { padding: 80px 0; background: #F2F6F9; }
.hp-faq-wrap { max-width: 700px; margin: 0 auto; padding: 0 18px; }
.hp-faq-list { display: flex; flex-direction: column; gap: 8px; }
.hp-faq-item { border: 0.5px solid #5B7384; border-radius: 5px; overflow: hidden; background: #fff; }
.hp-faq-item--open { border-color: #5B7384; }
.hp-faq-q { width: 100%; padding: 15px 18px; display: flex; justify-content: space-between; align-items: center; gap: 14px; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: #091925; text-align: left; line-height: 18px; }
.hp-faq-item--open .hp-faq-q { background: rgba(46,171,254,0.1); }
.hp-faq-toggle { width: 28px; height: 28px; border-radius: 5px; border: 0.5px solid #5B7384; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
.hp-faq-toggle--open { background: #2EABFE; border-color: #2EABFE; }
.hp-faq-a { padding: 12px 18px 16px; font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 20px; color: #091925; background: rgba(46,171,254,0.05); }

/* ══ FOOTER BAND ══ */
.hp-footer-band { background: #091925; padding: 52px 0; position: relative; overflow: hidden; }
.hp-footer-band-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%); z-index: 0; }
.hp-footer-band-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
.hp-footer-band-eye  { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 500; color: #2EABFE; margin-bottom: 8px; }
.hp-footer-band-h2   { font-family: 'Poppins', sans-serif; font-size: clamp(28px,3.5vw,40px); font-weight: 700; line-height: 1.1; color: #fff; margin-bottom: 12px; text-transform: uppercase; }
.hp-footer-band-sub  { font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 22px; color: rgba(255,255,255,0.65); max-width: 480px; }
.hp-btn-enroll { display: inline-flex; align-items: center; justify-content: center; padding: 0 32px; height: 54px; min-width: 220px; background: #2EABFE; color: #091925; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; border-radius: 999px; border: 0.5px solid #2EABFE; cursor: pointer; white-space: nowrap; transition: all .2s; }
.hp-btn-enroll:hover { background: #60C3FF; transform: translateY(-2px); }
.hp-btn-enroll-ghost { display: inline-flex; align-items: center; justify-content: center; padding: 0 32px; height: 54px; min-width: 220px; background: transparent; color: #fff; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; border-radius: 999px; border: 1px solid rgba(255,255,255,0.35); cursor: pointer; transition: all .2s; }
.hp-btn-enroll-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.06); }

/* ══ FOOTER ══ */
.hp-footer { background: #091925; border-top: 1px solid rgba(255,255,255,0.07); padding: 16px 0; }
.hp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.hp-footer-copy      { font-family: 'Poppins', sans-serif; font-size: 11px; color: rgba(255,255,255,0.42); }
.hp-footer-link-blue { color: #2EABFE; text-decoration: none; }
.hp-footer-links     { display: flex; align-items: center; gap: 8px; }
.hp-footer-link      { font-family: 'Poppins', sans-serif; font-size: 11px; color: rgba(255,255,255,0.42); text-decoration: none; transition: color .15s; }
.hp-footer-link:hover { color: #fff; }
.hp-footer-dot        { color: rgba(255,255,255,0.25); font-size: 11px; }

/* ══ RESPONSIVE ══ */
@media (max-width: 1024px) {
  .hp-container { padding: 0 32px; }
  .hp-hero-inner { padding: 48px 32px 40px; }
  .hp-statsbar-inner { padding: 12px 32px; }
}
@media (max-width: 900px) {
  .hp-hero-inner { grid-template-columns: 1fr; gap: 28px; padding: 40px 24px; }
  .hp-about-grid { grid-template-columns: 1fr; gap: 32px; }
  .hp-feat-grid { grid-template-columns: 1fr 1fr; }
  .hp-req-grid { grid-template-columns: 1fr; }
  .hp-tcard-grid { grid-template-columns: 1fr 1fr; }
  .hp-statsbar-inner { grid-template-columns: repeat(2,1fr); padding: 12px 24px; }
  .hp-footer-band-inner { flex-direction: column; }
}
@media (max-width: 640px) {
  .hp-container { padding: 0 16px; }
  .hp-hero-inner { padding: 32px 16px; }
  .hp-feat-grid { grid-template-columns: 1fr; }
  .hp-tcard-grid { grid-template-columns: 1fr; }
  .hp-statsbar-inner { grid-template-columns: repeat(2,1fr); padding: 12px 16px; }
  .hp-footer-inner { flex-direction: column; text-align: center; }
  .hp-footer-links { justify-content: center; }
}
`;

export default HomePage;