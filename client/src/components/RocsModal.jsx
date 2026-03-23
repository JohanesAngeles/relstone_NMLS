import { useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';
import API from '../api/axios';

/**
 * RocsModal
 *
 * NMLS-required Rules of Conduct for Students (ROCS V4) click-through modal.
 * Shown before every course start. Student must scroll to bottom and check
 * the agreement box before the "I Agree" button becomes active.
 *
 * @param {string}   courseId   - MongoDB course _id
 * @param {string}   courseName
 * @param {function} onAgreed   - called after backend confirms agreement saved
 * @param {function} onCancel   - called when student closes without agreeing
 */
const RocsModal = ({ courseId, courseName, onAgreed, onCancel }) => {
  const [agreed,   setAgreed]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleScroll = (e) => {
    const el = e.target;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (atBottom) setScrolled(true);
  };

  const handleAgree = async () => {
    if (!agreed || !scrolled || loading) return;
    setLoading(true);
    setError(null);
    try {
      await API.post('/rocs/agree', { courseId });
      onAgreed();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save agreement. Please try again.');
      setLoading(false);
    }
  };

  const canAgree = agreed && scrolled && !loading;

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.iconWrap}><FileText size={20} style={{ color: '#2EABFE' }} /></div>
            <div>
              <div style={S.headerTitle}>Rules of Conduct for Students</div>
              <div style={S.headerSub}>ROCS V4 · Required before course access</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onCancel} type="button">
            <X size={18} />
          </button>
        </div>

        {/* Course label */}
        <div style={S.courseBanner}>
          <span style={S.courseBannerLabel}>Course:</span>
          <span style={S.courseBannerName}>{courseName}</span>
        </div>

        {/* Scroll hint */}
        {!scrolled && (
          <div style={S.scrollHint}>
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            Read and scroll to the bottom to enable the agreement checkbox.
          </div>
        )}

        {/* ROCS V4 body — must scroll */}
        <div style={S.rocsBody} onScroll={handleScroll}>

          <h3 style={S.rocsH3}>Rules of Conduct for Students (ROCS) — Version 4</h3>
          <p style={S.rocsP}>
            The following Rules of Conduct govern your participation in all NMLS-approved
            education courses offered through this platform. By proceeding, you agree to
            abide by all rules listed below.
          </p>

          <h4 style={S.rocsH4}>1. Identity and Integrity</h4>
          <p style={S.rocsP}>
            You certify that you are the person registered for this course. You may not allow
            any other individual to complete this course on your behalf. Completion credit will
            be reported to NMLS under your name and NMLS ID number.
          </p>

          <h4 style={S.rocsH4}>2. Independent Completion</h4>
          <p style={S.rocsP}>
            You must complete all course activities independently. You may not use unauthorized
            aids, share quiz or exam questions with others, or receive assistance from any
            person during quizzes or exams.
          </p>

          <h4 style={S.rocsH4}>3. Prohibited Conduct</h4>
          <p style={S.rocsP}>You agree NOT to:</p>
          <ul style={S.rocsUl}>
            <li style={S.rocsLi}>Attempt to circumvent or "blow through" course content or time requirements.</li>
            <li style={S.rocsLi}>Use any automated tool, script, or program to complete course activities.</li>
            <li style={S.rocsLi}>Share, reproduce, or distribute course content, quiz questions, or exam materials.</li>
            <li style={S.rocsLi}>Misrepresent your identity or credentials in connection with this course.</li>
            <li style={S.rocsLi}>Allow another person to access this course using your credentials.</li>
          </ul>

          <h4 style={S.rocsH4}>4. Time Requirements</h4>
          <p style={S.rocsP}>
            You understand that this course has minimum time requirements mandated by the SAFE Act
            and applicable state law. The system will track your active engagement time. You will
            be automatically logged out after 6 minutes of inactivity and returned to the beginning
            of the current unit. Time spent inactive does not count toward your seat time.
          </p>

          <h4 style={S.rocsH4}>5. Reporting to NMLS</h4>
          <p style={S.rocsP}>
            Upon successful completion of this course, the education provider is required to report
            your completion to NMLS within seven (7) calendar days. By agreeing to these rules, you
            authorize the provider to submit your completion data, including your name and NMLS ID,
            to the Nationwide Multistate Licensing System.
          </p>

          <h4 style={S.rocsH4}>6. Consequences of Violations</h4>
          <p style={S.rocsP}>
            Violations of these rules may result in the invalidation of your course completion,
            reporting to NMLS and applicable state regulators, and possible disciplinary action
            under state mortgage licensing law.
          </p>

          <h4 style={S.rocsH4}>7. Acknowledgment</h4>
          <p style={{ ...S.rocsP, marginBottom: 0 }}>
            By clicking "I Agree" below, you confirm that you have read, understood, and agree to
            comply with these Rules of Conduct. You further confirm that you are the individual
            registered for this course and that you will complete it in accordance with all
            applicable NMLS requirements.
          </p>

        </div>

        {/* Agreement checkbox */}
        <div style={{ ...S.checkRow, opacity: scrolled ? 1 : 0.4, pointerEvents: scrolled ? 'auto' : 'none' }}>
          <input
            type="checkbox"
            id="rocs-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={S.checkbox}
          />
          <label htmlFor="rocs-agree" style={S.checkLabel}>
            I have read and agree to the Rules of Conduct for Students (ROCS V4).
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={S.errorBox}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* Actions */}
        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onCancel} type="button" disabled={loading}>
            Cancel
          </button>
          <button
            style={{ ...S.agreeBtn, ...(!canAgree ? S.agreeBtnDim : {}) }}
            onClick={handleAgree}
            type="button"
            disabled={!canAgree}
          >
            {loading ? 'Saving…' : <><CheckCircle2 size={16} /> I Agree — Start Course</>}
          </button>
        </div>

      </div>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────────── */
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(9,25,37,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20,
    width: '100%', maxWidth: 620,
    display: 'flex', flexDirection: 'column',
    maxHeight: '90vh', overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px', borderBottom: '1px solid rgba(2,8,23,0.08)', flexShrink: 0,
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap:    { width: 40, height: 40, borderRadius: 10, background: 'rgba(46,171,254,0.10)', border: '1px solid rgba(46,171,254,0.22)', display: 'grid', placeItems: 'center', flexShrink: 0 },
  headerTitle: { fontSize: 15, fontWeight: 800, color: '#0a1628' },
  headerSub:   { fontSize: 12, fontWeight: 600, color: 'rgba(10,22,40,0.45)', marginTop: 2 },
  closeBtn:    { width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(10,22,40,0.50)', flexShrink: 0 },

  courseBanner:     { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(46,171,254,0.06)', borderBottom: '1px solid rgba(46,171,254,0.12)', flexShrink: 0 },
  courseBannerLabel:{ fontSize: 11, fontWeight: 800, color: 'rgba(10,22,40,0.40)', letterSpacing: '0.4px', textTransform: 'uppercase', flexShrink: 0 },
  courseBannerName: { fontSize: 13, fontWeight: 700, color: '#0a1628' },

  scrollHint: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 20px', background: 'rgba(245,158,11,0.08)',
    borderBottom: '1px solid rgba(245,158,11,0.20)',
    fontSize: 12, fontWeight: 700, color: 'rgba(146,84,0,1)', flexShrink: 0,
  },

  rocsBody: {
    flex: 1, overflowY: 'auto', padding: '20px 24px',
    fontSize: 14, lineHeight: 1.75, color: 'rgba(10,22,40,0.82)',
  },
  rocsH3: { fontSize: 15, fontWeight: 900, color: '#0a1628', marginBottom: 12 },
  rocsH4: { fontSize: 13, fontWeight: 800, color: '#0a1628', marginTop: 20, marginBottom: 6 },
  rocsP:  { marginBottom: 12, fontWeight: 450 },
  rocsUl: { paddingLeft: 20, marginBottom: 12 },
  rocsLi: { marginBottom: 6, fontWeight: 450 },

  checkRow: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)',
    flexShrink: 0, transition: 'opacity 0.2s',
  },
  checkbox:   { width: 17, height: 17, marginTop: 2, cursor: 'pointer', accentColor: '#2EABFE', flexShrink: 0 },
  checkLabel: { fontSize: 13, fontWeight: 700, color: '#0a1628', cursor: 'pointer', lineHeight: 1.5 },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    margin: '0 20px', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
    color: 'rgba(185,28,28,1)', fontSize: 13, fontWeight: 700, flexShrink: 0,
  },

  footer:     { display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0 },
  cancelBtn:  { padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)' },
  agreeBtn:   { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, border: 'none', background: '#2EABFE', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14, boxShadow: '0 6px 20px rgba(46,171,254,0.28)', transition: 'opacity 0.15s' },
  agreeBtnDim:{ opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
};

export default RocsModal;