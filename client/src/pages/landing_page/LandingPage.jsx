import { useState } from 'react';
import AuthModal from '../auth_page/AuthModal';
import API from '../../api/axios';

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Create account',
    desc: 'Register your Relstone profile to access approved education, saved progress, and certificate delivery in one place.',
  },
  {
    number: '02',
    title: 'Enroll in pre-licensing course',
    desc: 'Choose the required SAFE Act pre-licensing path and start the course package that matches your licensing goals.',
  },
  {
    number: '03',
    title: 'Complete required hours',
    desc: 'Work through the required instructional time with tracked engagement and module-by-module progression.',
  },
  {
    number: '04',
    title: 'Take chapter quizzes and final exam',
    desc: 'Reinforce each module with quizzes, then complete the final assessment to confirm course readiness.',
  },
  {
    number: '05',
    title: 'Receive completion certificate',
    desc: 'Finish the course and receive your completion certificate, with credit reporting handled according to NMLS requirements.',
  },
  {
    number: '06',
    title: 'Schedule and pass the licensing exam',
    desc: 'Book your state licensing exam through Pearson VUE or PSI, then pass the exam to move forward with licensure.',
  },
  {
    number: '07',
    title: 'Apply with your state commission',
    desc: 'Submit your application and required materials to the appropriate state licensing authority or commission.',
  },
  {
    number: '08',
    title: 'Complete annual CE for renewal',
    desc: 'Maintain your license each year by completing the annual continuing education requirement before renewal deadlines.',
  },
];

const WHY_RELSTONE = [
  {
    value: '50 States',
    label: 'Coverage',
    desc: 'NMLS-approved education tracks with broad state readiness and elective support where required.',
  },
  {
    value: '94%',
    label: 'First-Try Pass Rate',
    desc: 'Practice quizzes, exam prep checkpoints, and progress coaching designed around outcomes.',
  },
  {
    value: '24/7',
    label: 'Learner Support',
    desc: 'Student help, course guidance, and technical assistance available when learners actually need it.',
  },
];

const LEADERSHIP_TEAM = [
  {
    name: 'Mr. Adrian Zubia',
    role: 'President / CEO / Director',
    bio: 'Holds ultimate responsibility for the leadership and strategic direction of RELS, overseeing program development, financial management, and compliance with state and federal regulations.',
    photo: 'https://placehold.co/600x600/0d2436/60c3ff?text=Photo',
  },
  {
    name: 'Ms. Amina Ahmed',
    role: 'School Administrator',
    bio: 'Oversees student services, ensures smooth delivery of educational programs, and maintains compliance with educational standards. Manages course scheduling, student progress, and instructor coordination.',
    photo: 'https://placehold.co/600x600/0d2436/60c3ff?text=Photo',
  },
  {
    name: 'Ms. Rosa Peralta',
    role: 'Office Administrator',
    bio: 'Manages student enrollment, maintains accurate student records, and ensures all courses meet accreditation and certification standards. Facilitates communication between instructors and students.',
    photo: 'https://placehold.co/600x600/0d2436/60c3ff?text=Photo',
  },
  {
    name: 'Mr. Dean Clayton',
    role: 'Marketing Director',
    bio: 'Develops and implements strategic marketing initiatives to increase brand awareness, student enrollment, and market presence through digital campaigns and promotional strategies.',
    photo: 'https://placehold.co/600x600/0d2436/60c3ff?text=Photo',
  },
];

const STATE_APPROVALS = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const ACCREDITATIONS = [
  'NMLS-approved course provider',
  'SAFE Act aligned curriculum standards',
  'BioSig-ID identity verification enabled',
  'ROCS V4 rules of conduct workflow',
  '7-day credit banking operations',
];

const PRESS_AND_AWARDS = [
  {
    source: 'Mortgage Industry Today',
    title: 'Top Digital Licensing Platform to Watch',
    year: '2025',
  },
  {
    source: 'National Lending Review',
    title: 'Excellence in Compliance-First Education',
    year: '2024',
  },
  {
    source: 'FinEd Awards',
    title: 'Best Learner Experience in Licensing Education',
    year: '2025',
  },
  {
    source: 'Broker Partner Summit',
    title: 'Student Support Team of the Year',
    year: '2024',
  },
];

const CONTACT_SUBJECTS = [
  'General Inquiry',
  'Course Enrollment',
  'Technical Support',
  'Billing and Payments',
  'Certificate and Credits',
];

const LandingPage = () => {
  const [modal, setModal] = useState(null); // null | 'login' | 'register'
  const [showContactCard, setShowContactCard] = useState(false);
  const [contactStatus, setContactStatus] = useState('');
  const [contactStatusTone, setContactStatusTone] = useState('success');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: CONTACT_SUBJECTS[0],
    message: '',
  });

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();

    const submit = async () => {
      if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
        setContactStatusTone('error');
        setContactStatus('Please complete all required fields.');
        return;
      }

      if (!contactForm.email.includes('@')) {
        setContactStatusTone('error');
        setContactStatus('Please enter a valid email address.');
        return;
      }

      try {
        setContactSubmitting(true);
        setContactStatus('');

        const response = await API.post('/support/contact', {
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          subject: contactForm.subject,
          message: contactForm.message.trim(),
        });

        setContactStatusTone('success');
        setContactStatus(response?.data?.message || 'Thanks. Support received your message and will reply soon.');
        setContactForm({
          name: '',
          email: '',
          subject: CONTACT_SUBJECTS[0],
          message: '',
        });
      } catch (error) {
        setContactStatusTone('error');
        setContactStatus(error?.response?.data?.message || 'Unable to send support request right now. Please try again.');
      } finally {
        setContactSubmitting(false);
      }
    };

    submit();
  };

  return (
    <div className="lp-root">
      <style>{css}</style>

      {/* Auth Modal */}
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}

      {/* Contact Support Card */}
      {showContactCard && (
        <>
          <div className="lp-contact-overlay" onClick={() => setShowContactCard(false)} />
          <aside className="lp-contact-card" role="dialog" aria-label="Contact support">
            <div className="lp-contact-head">
              <div>
                <p className="lp-contact-eyebrow">Support</p>
                <h3>Contact Relstone</h3>
                <p className="lp-contact-subhead">Fast support for enrollment, billing, and technical issues.</p>
              </div>
              <button
                type="button"
                className="lp-contact-close"
                onClick={() => setShowContactCard(false)}
                aria-label="Close contact form"
              >
                x
              </button>
            </div>

            <form className="lp-contact-form" onSubmit={handleContactSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={contactForm.name}
                onChange={handleContactChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
              <select
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
              >
                {CONTACT_SUBJECTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <textarea
                name="message"
                placeholder="How can we help you?"
                rows={4}
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
              <button type="submit" className="lp-contact-submit" disabled={contactSubmitting}>
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {contactStatus && (
              <p className={`lp-contact-status ${contactStatusTone === 'error' ? 'lp-contact-status--error' : ''}`}>
                {contactStatus}
              </p>
            )}

            <div className="lp-contact-meta">
              <div className="lp-contact-meta-item">
                <span className="lp-contact-meta-label">Email</span>
                <a href="mailto:support@relstone.com">support@relstone.com</a>
              </div>
              <div className="lp-contact-meta-item">
                <span className="lp-contact-meta-label">Phone</span>
                <a href="tel:+18005550147">+1 (800) 555-0147</a>
              </div>
              <div className="lp-contact-meta-item">
                <span className="lp-contact-meta-label">Support Hours</span>
                <p>Monday to Friday, 8:00 AM to 6:00 PM (EST)</p>
              </div>
              <div className="lp-contact-meta-item lp-live-chat-widget" role="region" aria-label="Live chat widget">
                <span className="lp-contact-meta-label">Live Chat</span>
                <a
                  href="mailto:support@relstone.com?subject=Live%20Chat%20Support"
                  className="lp-live-chat-link"
                  aria-label="Start live chat"
                  title="Live Chat"
                >
                  <span className="lp-live-chat-badge-dot" aria-hidden="true" />
                  <span>Start Live Chat</span>
                </a>
              </div>
              <div className="lp-contact-meta-item lp-contact-meta-item--help">
                <a href="/resources">Go to Help Center</a>
              </div>
            </div>
          </aside>
        </>
      )}



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
            <a href="#about-relstone" className="lp-nav-link">About</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#courses" className="lp-nav-link">Courses</a>
            <a href="#compliance" className="lp-nav-link">Compliance</a>
            <a href="/resources" className="lp-nav-link">Resources</a>
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

      {/* ── ABOUT RELSTONE ── */}
      <section className="lp-about-relstone" id="about-relstone">
        <div className="lp-container">
          <div className="lp-section-label">ABOUT RELSTONE</div>

          <div className="lp-about-relstone-top">
            <div className="lp-story-card">
              <h2 className="lp-section-h2">
                Mission, Story, and the Team Behind
                <span className="lp-h2-accent"> Relstone.</span>
              </h2>
              <p className="lp-about-para">
                Relstone was built to make mortgage licensing education more reliable, less fragmented, and more supportive for professionals balancing work and certification requirements.
              </p>
              <p className="lp-about-para">
                Our mission is simple: give learners a compliant, high-clarity path from first enrollment to long-term license renewal, with real instructional support along the way.
              </p>
            </div>

            <div className="lp-why-grid">
              {WHY_RELSTONE.map((item) => (
                <article key={item.label} className="lp-why-card">
                  <div className="lp-why-value">{item.value}</div>
                  <div className="lp-why-label">{item.label}</div>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lp-about-block">
            <h3 className="lp-about-title">Instructor and Leadership Team</h3>
            <div className="lp-team-grid">
              {LEADERSHIP_TEAM.map((member) => (
                <article key={member.name} className="lp-team-card">
                  <img src={member.photo} alt={`${member.name} portrait`} loading="lazy" className="lp-team-photo" />
                  <div className="lp-team-content">
                    <div className="lp-team-name">{member.name}</div>
                    <div className="lp-team-role">{member.role}</div>
                    <p>{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lp-about-block lp-about-block--split">
            <div className="lp-approval-panel">
              <h3 className="lp-about-title">State Approvals</h3>
              <p className="lp-about-note">Approved coverage across all 50 states for applicable federal tracks and supported licensing pathways.</p>
              <div className="lp-approval-grid">
                {STATE_APPROVALS.map((state) => (
                  <span key={state} className="lp-approval-chip">{state}</span>
                ))}
              </div>
            </div>

            <div className="lp-accreditation-panel">
              <h3 className="lp-about-title">Accreditations and Standards</h3>
              <div className="lp-accred-list">
                {ACCREDITATIONS.map((item) => (
                  <div key={item} className="lp-accred-item">
                    <span className="lp-accred-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-about-block">
            <h3 className="lp-about-title">Press Mentions and Awards</h3>
            <div className="lp-press-grid">
              {PRESS_AND_AWARDS.map((item) => (
                <article key={`${item.source}-${item.year}`} className="lp-press-card">
                  <div className="lp-press-source">{item.source}</div>
                  <div className="lp-press-title">{item.title}</div>
                  <div className="lp-press-year">{item.year}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            <a href="/resources" className="lp-footer-link">Help Center</a>
            <button
              type="button"
              className="lp-footer-link lp-footer-link-btn"
              onClick={() => {
                setContactStatus('');
                setContactStatusTone('success');
                setShowContactCard(true);
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      <button
        type="button"
        className="lp-live-widget-fab"
        onClick={() => {
          setContactStatus('');
          setContactStatusTone('success');
          setShowContactCard(true);
        }}
        aria-label="Open live support widget"
        title="Contact"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-5.5A8.5 8.5 0 1 1 21 11.5z"/>
        </svg>
        <span className="lp-live-widget-text">Contact</span>
        <span className="lp-live-widget-dot" />
      </button>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

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
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
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

.lp-nav-links { display: flex; gap: 2px; justify-content: center; }
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

/* ══ ABOUT RELSTONE ══ */
.lp-about-relstone {
  padding: 96px 0;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}
.lp-about-relstone-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr);
  gap: 28px;
  margin-bottom: 28px;
}
.lp-story-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 14px 34px rgba(9,25,37,0.06);
}
.lp-why-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.lp-why-card {
  background: linear-gradient(145deg, rgba(46,171,254,0.09), rgba(96,195,255,0.06));
  border: 1px solid rgba(46,171,254,0.18);
  border-radius: 16px;
  padding: 18px;
}
.lp-why-value {
  font-family: var(--font-title);
  font-size: 28px;
  font-weight: 800;
  color: var(--midnight);
  line-height: 1;
}
.lp-why-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.3px;
  color: var(--electric);
  text-transform: uppercase;
}
.lp-why-card p {
  margin-top: 8px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #4f6474;
}
.lp-about-block {
  margin-top: 30px;
}
.lp-about-title {
  font-family: var(--font-title);
  font-size: clamp(24px, 2.4vw, 34px);
  font-weight: 800;
  color: var(--midnight);
  margin-bottom: 18px;
}
.lp-team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.lp-team-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(9,25,37,0.06);
}
.lp-team-photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.lp-team-content {
  padding: 16px;
}
.lp-team-name {
  font-family: var(--font-title);
  font-size: 18px;
  font-weight: 700;
  color: var(--midnight);
}
.lp-team-role {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--electric);
}
.lp-team-content p {
  margin-top: 10px;
  font-size: 13.5px;
  line-height: 1.62;
  color: var(--text-muted);
}
.lp-about-block--split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
}
.lp-approval-panel,
.lp-accreditation-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
}
.lp-about-note {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.lp-approval-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lp-approval-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  background: var(--ice);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: #425a6b;
}
.lp-accred-list {
  display: grid;
  gap: 12px;
}
.lp-accred-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #405768;
}
.lp-accred-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--electric);
  box-shadow: 0 0 0 4px rgba(46,171,254,0.12);
  flex-shrink: 0;
}
.lp-press-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.lp-press-card {
  background: linear-gradient(140deg, #0f2b3f 0%, #13374f 100%);
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 14px;
  padding: 16px;
}
.lp-press-source {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--sky);
  margin-bottom: 8px;
}
.lp-press-title {
  font-family: var(--font-title);
  font-size: 16px;
  line-height: 1.3;
  color: #fff;
  margin-bottom: 12px;
}
.lp-press-year {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(96,195,255,0.16);
  font-size: 12px;
  font-weight: 700;
  color: #d7f0ff;
}

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

/* ══ HOW IT WORKS ══ */
.lp-process {
  padding: 96px 0;
  background:
    radial-gradient(circle at top right, rgba(46,171,254,0.12) 0%, transparent 34%),
    linear-gradient(180deg, var(--midnight) 0%, var(--deep-navy) 100%);
  position: relative;
  overflow: hidden;
}
.lp-process::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(46,171,254,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46,171,254,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.55;
}
.lp-process-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: end;
  margin-bottom: 48px;
}
.lp-process-sub {
  font-size: 15px;
  line-height: 1.75;
  color: var(--slate);
  max-width: 620px;
}
.lp-process-intro-card {
  background: rgba(13,36,54,0.76);
  border: 1px solid rgba(46,171,254,0.16);
  border-radius: 18px;
  padding: 22px;
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 44px rgba(9,25,37,0.2);
}
.lp-process-intro-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--sky);
  margin-bottom: 10px;
}
.lp-process-intro-card p {
  font-size: 13.5px;
  line-height: 1.7;
  color: rgba(240,246,250,0.72);
}
.lp-process-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.lp-process-card {
  position: relative;
  min-height: 250px;
  padding: 24px;
  background: rgba(13,36,54,0.72);
  border: 1px solid rgba(46,171,254,0.14);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  transition: transform .2s, border-color .2s, background .2s;
}
.lp-process-card:hover {
  transform: translateY(-4px);
  border-color: rgba(46,171,254,0.32);
  background: rgba(22,51,71,0.88);
}
.lp-process-step {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(46,171,254,0.12);
  border: 1px solid rgba(46,171,254,0.18);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--sky);
  margin-bottom: 16px;
}
.lp-process-num {
  font-family: var(--font-title);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: rgba(46,171,254,0.2);
  margin-bottom: 16px;
}
.lp-process-title {
  font-family: var(--font-title);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  color: #fff;
  margin-bottom: 10px;
}
.lp-process-desc {
  font-size: 13.5px;
  line-height: 1.72;
  color: var(--slate);
}

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
.lp-footer-link-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.lp-contact-overlay {
  position: fixed;
  inset: 0;
  z-index: 190;
  background: rgba(9,25,37,0.65);
  backdrop-filter: blur(4px);
}
.lp-contact-card {
  position: fixed;
  z-index: 191;
  right: 18px;
  bottom: 18px;
  width: min(460px, calc(100vw - 26px));
  background: linear-gradient(160deg, #ffffff 0%, #f7fbff 100%);
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 18px;
  box-shadow: 0 26px 60px rgba(9,25,37,0.28);
  padding: 20px;
  max-height: calc(100vh - 36px);
  overflow: auto;
}
.lp-contact-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.lp-contact-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--electric);
}
.lp-contact-head h3 {
  margin: 4px 0 5px;
  font-family: var(--font-title);
  font-size: 24px;
  color: var(--midnight);
}
.lp-contact-subhead {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}
.lp-contact-close {
  border: 1px solid rgba(46,171,254,0.22);
  border-radius: 10px;
  width: 32px;
  height: 32px;
  background: #f8fbff;
  cursor: pointer;
  color: var(--midnight);
  font-weight: 700;
}
.lp-contact-form {
  display: grid;
  gap: 10px;
}
.lp-contact-form input,
.lp-contact-form select,
.lp-contact-form textarea {
  border: 1px solid rgba(46,171,254,0.2);
  border-radius: 10px;
  font-size: 13px;
  font-family: var(--font-body);
  padding: 10px 11px;
  background: #fbfdff;
  transition: border-color .16s, box-shadow .16s, background .16s;
}
.lp-contact-form input:focus,
.lp-contact-form select:focus,
.lp-contact-form textarea:focus {
  outline: none;
  border-color: rgba(46,171,254,0.7);
  box-shadow: 0 0 0 3px rgba(46,171,254,0.14);
  background: #fff;
}
.lp-contact-submit {
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(120deg, #2EABFE, #1A7AB8);
  cursor: pointer;
  transition: transform .16s, box-shadow .16s;
}
.lp-contact-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(26,122,184,0.24);
}
.lp-contact-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.lp-contact-status {
  margin: 11px 0 0;
  font-size: 12px;
  color: #1A7AB8;
  font-weight: 700;
  padding: 8px 10px;
  border-radius: 9px;
  background: rgba(46,171,254,0.1);
  border: 1px solid rgba(46,171,254,0.2);
}
.lp-contact-status--error {
  color: #c2410c;
  background: rgba(194,65,12,0.08);
  border-color: rgba(194,65,12,0.2);
}
.lp-contact-meta {
  margin-top: 12px;
  border-top: 1px solid rgba(46,171,254,0.16);
  padding-top: 12px;
  display: grid;
  gap: 8px;
}
.lp-contact-meta p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}
.lp-contact-meta a {
  color: var(--electric);
  text-decoration: none;
  font-weight: 700;
}

.lp-contact-meta-item {
  border: 1px solid rgba(46,171,254,0.16);
  background: rgba(255,255,255,0.74);
  border-radius: 10px;
  padding: 9px 10px;
  display: grid;
  gap: 2px;
}

.lp-contact-meta-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 800;
  color: #5f7687;
}

.lp-contact-meta-item--help {
  display: flex;
  justify-content: center;
}

.lp-live-chat-widget {
  align-items: start;
}

.lp-live-chat-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.16);
  flex-shrink: 0;
}

.lp-live-chat-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--electric);
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 700;
}

.lp-live-chat-link:hover {
  color: var(--ocean);
}

.lp-live-widget-fab {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 189;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  height: 52px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(120deg, #0D2436, #1A7AB8);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 14px 36px rgba(9,25,37,0.34);
}

.lp-live-widget-text {
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.lp-live-widget-dot {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #34d399;
  box-shadow: 0 0 0 6px rgba(52,211,153,0.16);
}



@media (max-width: 560px) {
  .lp-contact-card {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
    padding: 16px;
  }
}

/* ══ RESPONSIVE ══ */
@media (max-width: 1024px) {
  .lp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .lp-hero-card-wrap { max-width: 520px; }
  .lp-about-relstone-top,
  .lp-about-block--split,
  .lp-team-grid,
  .lp-press-grid {
    grid-template-columns: 1fr 1fr;
  }
  .lp-features-top { grid-template-columns: 1fr; }
  .lp-process-top { grid-template-columns: 1fr; }
  .lp-process-grid { grid-template-columns: 1fr 1fr; }
  .lp-about-grid, .lp-compliance-grid { grid-template-columns: 1fr; gap: 48px; }
  .lp-course-row { grid-template-columns: 1fr; }
  .lp-course-meta { flex-direction: row; align-items: center; }
}
@media (max-width: 768px) {
  .lp-nav-links { display: none; }
  .lp-about-relstone-top,
  .lp-about-block--split,
  .lp-team-grid,
  .lp-press-grid {
    grid-template-columns: 1fr;
  }
  .lp-feat-grid { grid-template-columns: 1fr 1fr; }
  .lp-process { padding: 84px 0; }
  .lp-footer-inner { grid-template-columns: 1fr; text-align: center; }
  .lp-footer-links { justify-content: center; }
  .lp-hero-inner { padding-top: 40px; padding-bottom: 40px; }
}
@media (max-width: 560px) {
  .lp-feat-grid { grid-template-columns: 1fr; }
  .lp-process-grid { grid-template-columns: 1fr; }
  .lp-process-card { min-height: auto; }
  .lp-banner-inner { flex-direction: column; align-items: flex-start; }
}
`;

export default LandingPage;