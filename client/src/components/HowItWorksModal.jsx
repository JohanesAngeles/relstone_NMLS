import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Storage key ───────────────────────────────────────────────────────────────
const SEEN_KEY = 'relstone_how_it_works_seen';

// ── 8-step journey data ───────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01', title: 'Create Account',
    desc: 'Register your RELSTONE profile to access approved education, saved progress, and certificate delivery in one place.',
  },
  {
    num: '02', title: 'Enroll in Pre-Licensing',
    desc: 'Choose the required SAFE Act pre-licensing path and start the course package that matches your licensing goals.',
  },
  {
    num: '03', title: 'Complete Required Hours',
    desc: 'Work through the required instructional time with tracked engagement and module-by-module progression.',
  },
  {
    num: '04', title: 'Chapter Quizzes & Exams',
    desc: 'Reinforce each module with quizzes, then complete the final assessment to confirm course readiness.',
  },
  {
    num: '05', title: 'Receive Certification',
    desc: 'Finish the course and receive your completion certificate, with credit reporting handled according to NMLS requirements.',
  },
  {
    num: '06', title: 'Pass the Licensing Exam',
    desc: 'Book your state licensing exam through Pearson VUE or PSI, then pass the exam to move forward with licensure.',
  },
  {
    num: '07', title: 'Apply With Your State',
    desc: 'Submit your application and required materials to the appropriate state licensing authority or commission.',
  },
  {
    num: '08', title: 'Complete CE for Renewal',
    desc: 'Maintain your license each year by completing the annual continuing education requirement before renewal deadlines.',
  },
];

// ── Close Icon ────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Arrow Icon ────────────────────────────────────────────────────────────────
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── HowItWorksModal ───────────────────────────────────────────────────────────
export const HowItWorksModal = ({ user, onClose }) => {
  const navigate = useNavigate();

  const handleGoToSetup = () => {
    localStorage.setItem(SEEN_KEY, '1');
    onClose();
    // ── Pass all available user data as prefill state ──────────────
    navigate('/account-setup', {
      state: {
        prefill: {
          name:    user?.name    || '',
          email:   user?.email   || '',
          nmls_id: user?.nmls_id || '',
          state:   user?.state   || '',
          phone:   user?.phone   || '',
          address: user?.address || '',
        },
      },
    });
  };

  const handleSkip = () => {
    localStorage.setItem(SEEN_KEY, '1');
    onClose();
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <style>{CSS}</style>
      {/* Backdrop */}
      <div style={S.backdrop} />

      {/* Modal */}
      <div style={S.modal}>

        {/* ── Top bar ── */}
        <div style={S.topBar} />

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.avatar}>{initials}</div>
            <span style={S.headerWelcome}>
              Welcome aboard, {user?.name || 'Student'}! Here's how your licensing journey works.
            </span>
          </div>
          {/* X button */}
          <button style={S.closeBtn} onClick={handleSkip} type="button" title="Close">
            <CloseIcon />
          </button>
        </div>

        {/* ── Divider ── */}
        <div style={S.dividerFull} />

        {/* ── Section label ── */}
        <div style={S.sectionLabelRow}>
          <div style={S.sectionLine} />
          <span style={S.sectionLabel}>HOW IT WORKS</span>
        </div>

        {/* ── Title + subtitle ── */}
        <div style={S.titleRow}>
          <div style={S.titleLeft}>
            <h2 style={S.title}>THE FULL LICENSING JOURNEY</h2>
            <p style={S.subtitle}>
              A clear 8-step path from account creation to annual renewal, presented in the same guided flow students follow in real life.
            </p>
          </div>
          {/* Info card — top right */}
          <div style={S.infoCard}>
            <div style={S.infoCardLabel}>FROM FIRST ENROLLMENT TO RENEWAL</div>
            <p style={S.infoCardDesc}>
              RELSTONE handles the education side cleanly, then guides students through what comes next so the entire licensing process feels ordered instead of fragmented.
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={S.dividerFull} />

        {/* ── Steps grid — 4 columns, 2 rows ── */}
        <div style={S.stepsGrid}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ ...S.stepCell, borderRight: (i + 1) % 4 !== 0 ? '0.5px solid #2EABFE' : 'none' }}>
              <div style={S.stepLabel}>Step</div>
              <div style={S.stepNum}>{step.num}</div>
              <div style={S.stepTitle}>{step.title}</div>
              <p style={S.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={S.dividerFull} />

        {/* ── Footer ── */}
        <div style={S.footer}>
          <div style={S.footerLeft}>
            <svg width="13" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            <span style={S.footerText}>
              Your account is ready — you can set up your account information and start enrolling right away.
            </span>
          </div>
          <div style={S.footerActions}>
            {/* Skip for now */}
            <button style={S.skipBtn} onClick={handleSkip} type="button">
              Skip for now
            </button>
            {/* Go to Account Setup */}
            <button style={S.setupBtn} onClick={handleGoToSetup} type="button">
              GO TO ACCOUNT SETUP <ArrowIcon />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

// ── HowItWorksButton — the ? button shown in the navbar ──────────────────────
export const HowItWorksButton = ({ onClick }) => (
  <button style={B.btn} onClick={onClick} type="button" title="How it works">
    ?
  </button>
);

// ── Hook: controls visibility ─────────────────────────────────────────────────
export const useHowItWorks = (user, isNewUser = false) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen && isNewUser) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [user, isNewUser]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return [visible, show, hide];
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(9,25,37,0.75)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'fixed', zIndex: 301,
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(1180px, 96vw)',
    maxHeight: '92vh',
    overflowY: 'auto',
    background: '#091925',
    borderRadius: 10,
    fontFamily: "'Poppins', system-ui, sans-serif",
    boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
  },
  topBar: {
    height: 4,
    background: 'linear-gradient(90deg, #2EABFE, #00B4B4)',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 30px',
    gap: 16,
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0,
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: '#2EABFE',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12, fontWeight: 700, color: '#091925',
    flexShrink: 0,
  },
  headerWelcome: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14, fontWeight: 500, color: '#fff',
    lineHeight: 1.5,
  },
  closeBtn: {
    width: 32, height: 32,
    background: 'rgba(91,115,132,0.15)',
    border: '0.5px solid rgba(127,168,196,0.35)',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'rgba(255,255,255,0.65)',
    flexShrink: 0, padding: 0,
    transition: 'all .15s',
  },
  dividerFull: {
    height: 0,
    borderBottom: '0.5px solid #2EABFE',
    margin: '0 30px',
  },
  sectionLabelRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '18px 30px 4px',
  },
  sectionLine: {
    width: 20, height: 0,
    borderBottom: '1px solid #2EABFE',
  },
  sectionLabel: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14, fontWeight: 500, color: '#2EABFE',
    textTransform: 'uppercase', letterSpacing: '.06em',
  },
  titleRow: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 24, padding: '12px 30px 20px',
    flexWrap: 'wrap',
  },
  titleLeft: { flex: 1, minWidth: 280 },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 28, fontWeight: 700, color: '#fff',
    textTransform: 'uppercase', letterSpacing: '-0.3px',
    marginBottom: 10, lineHeight: 1.15,
  },
  subtitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 15, fontWeight: 400, color: '#7FA8C4',
    lineHeight: 1.6, maxWidth: 520,
  },
  infoCard: {
    background: 'rgba(46,171,254,0.1)',
    border: '0.5px solid #2EABFE',
    borderRadius: 10,
    padding: '16px 20px',
    maxWidth: 400, flexShrink: 0,
  },
  infoCardLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, fontWeight: 500, color: '#2EABFE',
    marginBottom: 8,
  },
  infoCardDesc: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 13, fontWeight: 400, color: '#7FA8C4',
    lineHeight: 1.6,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    borderTop: '0.5px solid #2EABFE',
    borderBottom: '0.5px solid #2EABFE',
    margin: '16px 0',
  },
  stepCell: {
    padding: '24px 30px',
    borderBottom: '0.5px solid #2EABFE',
  },
  stepLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, fontWeight: 400, color: '#2EABFE',
    marginBottom: 4, lineHeight: 1,
  },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 44, fontWeight: 800, color: '#2EABFE',
    lineHeight: 1.1, marginBottom: 10,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 16, fontWeight: 700, color: '#fff',
    marginBottom: 8,
  },
  stepDesc: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 13, fontWeight: 400, color: '#7FA8C4',
    lineHeight: 1.6,
  },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 30px',
    gap: 16, flexWrap: 'wrap',
  },
  footerLeft: {
    display: 'flex', alignItems: 'center', gap: 10, flex: 1,
  },
  footerText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 13, fontWeight: 400, color: '#7FA8C4',
    lineHeight: 1.5,
  },
  footerActions: {
    display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
  },
  skipBtn: {
    height: 50, padding: '0 24px',
    background: '#091925',
    border: '0.5px solid #60C3FF',
    borderRadius: 5,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14, fontWeight: 700, color: '#CCE8FF',
    cursor: 'pointer', transition: 'all .15s',
    display: 'inline-flex', alignItems: 'center',
  },
  setupBtn: {
    height: 50, padding: '0 24px',
    background: '#2EABFE',
    border: '0.5px solid #2EABFE',
    borderRadius: 5,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 15, fontWeight: 700, color: '#091925',
    cursor: 'pointer', transition: 'all .15s',
    display: 'inline-flex', alignItems: 'center', gap: 10,
  },
};

const B = {
  btn: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'rgba(46,171,254,0.12)',
    border: '1px solid rgba(46,171,254,0.35)',
    color: '#2EABFE',
    fontFamily: "'Poppins', sans-serif",
    fontSize: 15, fontWeight: 800,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s',
    lineHeight: 1,
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
`;

export default HowItWorksModal;