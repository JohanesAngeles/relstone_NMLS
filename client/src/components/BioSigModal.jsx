import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, CheckCircle2, X, Fingerprint, ExternalLink } from 'lucide-react';
import API from '../api/axios';

/**
 * BioSigModal
 *
 * Opens BioSig-ID verification in a NEW TAB.
 * Modal stays open showing a "Waiting…" state while the student verifies.
 * Polls /api/biosig/status every 2s — when verified, closes tab and proceeds.
 *
 * @param {string}   courseId
 * @param {string}   courseName
 * @param {function} onVerified  - called after successful verification
 * @param {function} onCancel    - called when student cancels
 */
const BioSigModal = ({ courseId, courseName, onVerified, onCancel }) => {
  const [step,   setStep]   = useState('checking'); // checking | intro | redirecting | waiting | already_verified | done | error
  const [error,  setError]  = useState(null);
  const [action, setAction] = useState('Enrolling');
  const pollRef = useRef(null);
  const tabRef  = useRef(null);

  // On mount — check if already verified for this course
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await API.get(`/biosig/status/${courseId}`);
        if (res.data?.verified) {
          setStep('already_verified');
          setTimeout(() => onVerified(), 1200);
        } else {
          setStep('intro');
        }
      } catch {
        setStep('intro');
      }
    };
    checkStatus();
  }, [courseId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    };
  }, []);

  // Poll backend every 2s until verified or tab closes
  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const tabClosed = tabRef.current?.closed;
        const res = await API.get(`/biosig/status/${courseId}`);

        if (res.data?.verified) {
          clearInterval(pollRef.current);
          if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
          setStep('done');
          setTimeout(() => onVerified(), 1200);
        } else if (tabClosed) {
          // Tab closed but not verified — student cancelled in the other tab
          clearInterval(pollRef.current);
          setStep('intro');
        }
      } catch {
        // Keep polling on network hiccup
      }
    }, 2000);
  };

  const handleVerify = async () => {
    setStep('redirecting');
    setError(null);
    try {
      const res = await API.get('/biosig/sso-url', { params: { courseId } });
      const { url, action: bsiAction } = res.data;

      if (!url) throw new Error('No SSO URL returned from server.');

      setAction(bsiAction || 'Enrolling');

      // Open BioSig-ID in a new tab
      tabRef.current = window.open(url, '_blank');

      if (!tabRef.current) {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
        setStep('error');
        return;
      }

      setStep('waiting');
      startPolling();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start verification. Please try again.');
      setStep('error');
    }
  };

  const handleCancelWaiting = () => {
    clearInterval(pollRef.current);
    if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    setStep('intro');
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.iconWrap}>
              <Shield size={20} style={{ color: '#2EABFE' }} />
            </div>
            <div>
              <div style={S.headerTitle}>Identity Verification</div>
              <div style={S.headerSub}>BioSig-ID · Required for NMLS compliance</div>
            </div>
          </div>
          {(step === 'intro' || step === 'error') && (
            <button style={S.closeBtn} onClick={onCancel} type="button">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Course label */}
        <div style={S.courseBanner}>
          <span style={S.courseBannerLabel}>Course:</span>
          <span style={S.courseBannerName}>{courseName}</span>
        </div>

        {/* Body */}
        <div style={S.body}>

          {/* ── Checking status ── */}
          {step === 'checking' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Checking verification status…</div>
              <div style={S.stateSub}>Just a moment.</div>
            </div>
          )}

          {/* ── Already verified ── */}
          {step === 'already_verified' && (
            <div style={S.centerState}>
              <CheckCircle2 size={56} style={{ color: 'rgba(34,197,94,1)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Already Verified</div>
              <div style={S.stateSub}>Your identity was recently verified. Proceeding to course…</div>
            </div>
          )}

          {/* ── Intro ── */}
          {step === 'intro' && (
            <>
              <div style={S.fingerprintWrap}>
                <Fingerprint size={64} style={{ color: 'rgba(46,171,254,0.60)' }} />
              </div>
              <div style={S.introTitle}>Verify Your Identity</div>
              <div style={S.introText}>
                Per NMLS requirements effective August 21, 2017, all Online Self-Study (OSS)
                courses require BioSig-ID biometric authentication before accessing course content.
              </div>
              <div style={S.introText}>
                A new tab will open for BioSig-ID verification. Complete it there —
                this page will update automatically when done.
              </div>
              <div style={S.infoBox}>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Required by</span>
                  <span style={S.infoValue}>NMLS (effective Aug 21, 2017)</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Provider</span>
                  <span style={S.infoValue}>BioSig-ID (sandbox)</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Opens in</span>
                  <span style={S.infoValue}>New tab — stay on this page</span>
                </div>
              </div>
              <button style={S.verifyBtn} onClick={handleVerify} type="button">
                <ExternalLink size={16} /> Open BioSig-ID in New Tab
              </button>
            </>
          )}

          {/* ── Opening tab ── */}
          {step === 'redirecting' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Opening verification tab…</div>
              <div style={S.stateSub}>A new tab is opening with BioSig-ID.</div>
            </div>
          )}

          {/* ── Waiting for new tab to complete ── */}
          {step === 'waiting' && (
            <div style={S.centerState}>
              <div style={S.pulseWrap}>
                <Fingerprint size={48} style={{ color: '#2EABFE' }} />
              </div>
              <div style={S.stateTitle}>
                {action === 'Resuming' ? 'Resuming verification…' : 'Waiting for verification…'}
              </div>
              <div style={S.stateSub}>
                Complete BioSig-ID in the other tab. This page will update automatically.
              </div>
              <div style={S.waitingBadge}>
                Do not close this window
              </div>
              <button style={S.cancelWaitBtn} onClick={handleCancelWaiting} type="button">
                Cancel — Go Back
              </button>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div style={S.centerState}>
              <CheckCircle2 size={56} style={{ color: 'rgba(34,197,94,1)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Identity Verified!</div>
              <div style={S.stateSub}>Proceeding to your course…</div>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div style={S.centerState}>
              <AlertCircle size={56} style={{ color: 'rgba(185,28,28,0.80)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Verification Error</div>
              <div style={{ ...S.stateSub, color: 'rgba(185,28,28,0.80)', marginBottom: 20 }}>{error}</div>
              <button style={S.retryBtn} onClick={() => setStep('intro')} type="button">
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        {(step === 'intro' || step === 'error') && (
          <div style={S.footer}>
            <button style={S.cancelBtn} onClick={onCancel} type="button">Cancel</button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes biosig-spin  { to { transform: rotate(360deg); } }
        @keyframes biosig-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.92); } }
      `}</style>
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
    width: '100%', maxWidth: 520,
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

  courseBanner:      { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(46,171,254,0.06)', borderBottom: '1px solid rgba(46,171,254,0.12)', flexShrink: 0 },
  courseBannerLabel: { fontSize: 11, fontWeight: 800, color: 'rgba(10,22,40,0.40)', letterSpacing: '0.4px', textTransform: 'uppercase', flexShrink: 0 },
  courseBannerName:  { fontSize: 13, fontWeight: 700, color: '#0a1628' },

  body: { flex: 1, overflowY: 'auto', padding: '24px 20px' },

  fingerprintWrap: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  introTitle: { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 12, textAlign: 'center' },
  introText:  { fontSize: 14, fontWeight: 500, color: 'rgba(10,22,40,0.72)', lineHeight: 1.75, marginBottom: 12 },

  infoBox:   { borderRadius: 14, border: '1px solid rgba(2,8,23,0.08)', background: 'rgba(2,8,23,0.02)', padding: '14px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  infoLabel: { fontSize: 12, fontWeight: 700, color: 'rgba(10,22,40,0.50)' },
  infoValue: { fontSize: 12, fontWeight: 700, color: '#0a1628' },

  verifyBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', borderRadius: 12, border: 'none',
    background: '#2EABFE', color: '#fff', cursor: 'pointer',
    fontWeight: 800, fontSize: 14, boxShadow: '0 6px 20px rgba(46,171,254,0.28)',
  },

  centerState:   { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 0' },
  spinner:       { width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(2,8,23,0.10)', borderTopColor: '#2EABFE', animation: 'biosig-spin 0.9s linear infinite', marginBottom: 20 },
  pulseWrap:     { marginBottom: 20, animation: 'biosig-pulse 1.8s ease-in-out infinite' },
  stateTitle:    { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 8 },
  stateSub:      { fontSize: 14, fontWeight: 600, color: 'rgba(10,22,40,0.55)', lineHeight: 1.6, marginBottom: 16 },
  waitingBadge:  { fontSize: 12, fontWeight: 700, color: 'rgba(46,171,254,0.90)', marginBottom: 20, padding: '6px 14px', borderRadius: 999, background: 'rgba(46,171,254,0.08)', border: '1px solid rgba(46,171,254,0.20)' },
  cancelWaitBtn: { padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'rgba(10,22,40,0.60)' },
  retryBtn:      { padding: '11px 24px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.90)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 },

  footer:    { display: 'flex', padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0 },
  cancelBtn: { padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)' },
};

export default BioSigModal;