import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, CheckCircle2, X, Fingerprint, ExternalLink, RefreshCw } from 'lucide-react';
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
 * @param {string}   action      - 'Begin' | 'Resuming' | 'FinalExam' | 'Middle#1' | 'Middle#2'
 * @param {function} onVerified  - called after successful verification
 * @param {function} onCancel    - called when student cancels
 */
const BioSigModal = ({ courseId, courseName, action = 'Begin', onVerified, onCancel }) => {
  const [step,       setStep]       = useState('checking');
  const [error,      setError]      = useState(null);
  const [bsiAction,  setBsiAction]  = useState(action);
  const [failReason, setFailReason] = useState(null);
  const pollRef = useRef(null);
  const tabRef  = useRef(null);

  // ── Heading + subtitle per action type ────────────────────────────────────
  const ACTION_LABELS = {
    'Begin':     { title: 'Identity Verification Required',   sub: 'Required before accessing course content.' },
    'Resuming':  { title: 'Re-Verification Required',         sub: 'Please verify your identity to resume the course.' },
    'FinalExam': { title: 'Verify to Unlock Final Exam',      sub: 'NMLS requires identity verification before the final exam.' },
    'Middle#1':  { title: 'Mid-Course Verification Required', sub: 'NMLS requires periodic identity checks during the course.' },
    'Middle#2':  { title: 'Mid-Course Verification Required', sub: 'NMLS requires periodic identity checks during the course.' },
    'Enrolling': { title: 'Enroll with BioSig-ID',           sub: 'First-time enrollment required for NMLS compliance.' },
  };

  const label = ACTION_LABELS[bsiAction] || ACTION_LABELS['Begin'];

  // ── On mount — check if already verified for this course ─────────────────
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
  }, [courseId, action]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    };
  }, []);

  // ── Poll every 2s until verified or tab closes ────────────────────────────
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
          clearInterval(pollRef.current);
          setFailReason('failed');
          setStep('failed');
        }
      } catch {
        // Keep polling on network hiccup
      }
    }, 2000);
  };

  // ── Start verification ────────────────────────────────────────────────────
  const handleVerify = async () => {
    setStep('redirecting');
    setError(null);
    setFailReason(null);
    try {
      const res = await API.get('/biosig/sso-url', { params: { courseId, action } });
      const { url, action: resolvedAction } = res.data;

      if (!url) throw new Error('No SSO URL returned from server.');

      setBsiAction(resolvedAction || action);
      tabRef.current = window.open(url, '_blank');

      if (!tabRef.current) {
        setFailReason('popup_blocked');
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
        setStep('failed');
        return;
      }

      setStep('waiting');
      startPolling();
    } catch (err) {
      setFailReason('server');
      setError(err.response?.data?.message || err.message || 'Failed to start verification. Please try again.');
      setStep('failed');
    }
  };

  const handleCancelWaiting = () => {
    clearInterval(pollRef.current);
    if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    setStep('intro');
  };

  const handleRetry = () => {
    setFailReason(null);
    setError(null);
    setStep('intro');
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* ── Header ── */}
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
          {(step === 'intro' || step === 'failed') && (
            <button style={S.closeBtn} onClick={onCancel} type="button">
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Course + action label ── */}
        <div style={S.courseBanner}>
          <span style={S.courseBannerLabel}>Course:</span>
          <span style={S.courseBannerName}>{courseName}</span>
          {bsiAction && bsiAction !== 'Begin' && (
            <span style={S.actionBadge}>{bsiAction}</span>
          )}
        </div>

        {/* ── Body ── */}
        <div style={S.body}>

          {/* Checking */}
          {step === 'checking' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Checking verification status…</div>
              <div style={S.stateSub}>Just a moment.</div>
            </div>
          )}

          {/* Already verified */}
          {step === 'already_verified' && (
            <div style={S.centerState}>
              <CheckCircle2 size={56} style={{ color: 'rgba(34,197,94,1)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Already Verified</div>
              <div style={S.stateSub}>Your identity was recently verified. Proceeding…</div>
            </div>
          )}

          {/* Intro */}
          {step === 'intro' && (
            <>
              <div style={S.fingerprintWrap}>
                <Fingerprint size={64} style={{ color: 'rgba(46,171,254,0.60)' }} />
              </div>
              <div style={S.introTitle}>{label.title}</div>
              <div style={S.introText}>{label.sub}</div>

              {/* First-time enrollment instructions (Begin only) */}
              {(bsiAction === 'Begin' || bsiAction === 'Enrolling') && (
                <div style={S.enrollBox}>
                  <div style={S.enrollTitle}>First time? Here's what to expect:</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>1</span>Click the button below to open BioSig-ID in a new tab.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>2</span>Draw your unique signature pattern when prompted.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>3</span>BioSig-ID will enroll your biometric profile.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>4</span>Return here — this page will update automatically.</div>
                </div>
              )}

              {/* Resuming instructions */}
              {bsiAction === 'Resuming' && (
                <div style={S.enrollBox}>
                  <div style={S.enrollTitle}>Why am I seeing this?</div>
                  <div style={{ fontSize: 13, color: 'rgba(10,22,40,0.65)', lineHeight: 1.7, fontWeight: 500 }}>
                    Per NMLS requirements, identity re-verification is required when returning to a course after logout or inactivity. This ensures the same student continues the course.
                  </div>
                </div>
              )}

              <div style={S.infoBox}>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Required by</span>
                  <span style={S.infoValue}>NMLS (effective Aug 21, 2017)</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Provider</span>
                  <span style={S.infoValue}>BioSig-ID</span>
                </div>
                <div style={S.infoRow}>
                  <span style={S.infoLabel}>Opens in</span>
                  <span style={S.infoValue}>New tab — stay on this page</span>
                </div>
              </div>

              <button style={S.verifyBtn} onClick={handleVerify} type="button">
                <ExternalLink size={16} />
                {bsiAction === 'Resuming' ? 'Re-Verify with BioSig-ID' : 'Open BioSig-ID in New Tab'}
              </button>
            </>
          )}

          {/* Opening tab */}
          {step === 'redirecting' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Opening verification tab…</div>
              <div style={S.stateSub}>A new tab is opening with BioSig-ID.</div>
            </div>
          )}

          {/* Waiting */}
          {step === 'waiting' && (
            <div style={S.centerState}>
              <div style={S.pulseWrap}>
                <Fingerprint size={48} style={{ color: '#2EABFE' }} />
              </div>
              <div style={S.stateTitle}>
                {bsiAction === 'Resuming' ? 'Waiting for re-verification…' : 'Waiting for verification…'}
              </div>
              <div style={S.stateSub}>
                Complete BioSig-ID in the other tab. This page will update automatically.
              </div>
              <div style={S.waitingBadge}>Do not close this window</div>
              <button style={S.cancelWaitBtn} onClick={handleCancelWaiting} type="button">
                Cancel — Go Back
              </button>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div style={S.centerState}>
              <CheckCircle2 size={56} style={{ color: 'rgba(34,197,94,1)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Identity Verified!</div>
              <div style={S.stateSub}>Proceeding to your course…</div>
            </div>
          )}

          {/* ── Failed — guidance per Ron's requirements ── */}
          {step === 'failed' && (
            <div style={S.centerState}>
              <AlertCircle size={56} style={{ color: 'rgba(185,28,28,0.80)', marginBottom: 16 }} />

              {/* Popup blocked */}
              {failReason === 'popup_blocked' && (
                <>
                  <div style={S.stateTitle}>Popup Blocked</div>
                  <div style={S.failText}>Your browser blocked the BioSig-ID tab from opening.</div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideTitle}>How to fix:</div>
                    <div style={S.failGuideStep}>1. Look for a popup blocked icon in your browser address bar.</div>
                    <div style={S.failGuideStep}>2. Click it and select "Always allow popups from this site".</div>
                    <div style={S.failGuideStep}>3. Click "Try Again" below.</div>
                  </div>
                </>
              )}

              {/* Biometric failed — student-side issue → NMLS help site */}
              {failReason === 'failed' && (
                <>
                  <div style={S.stateTitle}>Verification Not Completed</div>
                  <div style={S.failText}>BioSig-ID verification was not completed. This can happen if:</div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideStep}>• Your biometric pattern was not recognized.</div>
                    <div style={S.failGuideStep}>• You closed the BioSig-ID tab before finishing.</div>
                    <div style={S.failGuideStep}>• Your session timed out.</div>
                  </div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideTitle}>What you can do:</div>
                    <div style={S.failGuideStep}>• Click "Try Again" to restart the verification.</div>
                    <div style={S.failGuideStep}>• Make sure to draw your signature slowly and clearly.</div>
                    <div style={S.failGuideStep}>
                      • For BioSig-ID account issues, visit the{' '}
                      <a
                        href="https://mortgage.nationwidelicensingsystem.org/help"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2EABFE', fontWeight: 700 }}
                      >
                        NMLS Help Center
                      </a>.
                    </div>
                  </div>
                </>
              )}

              {/* Server/config issue → contact Relstone support */}
              {failReason === 'server' && (
                <>
                  <div style={S.stateTitle}>Verification Error</div>
                  <div style={S.failText}>{error}</div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideTitle}>What you can do:</div>
                    <div style={S.failGuideStep}>• Check your internet connection and try again.</div>
                    <div style={S.failGuideStep}>• If the issue persists, please contact <strong>Relstone NMLS support</strong> so we can investigate.</div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button style={S.retryBtn} onClick={handleRetry} type="button">
                  <RefreshCw size={14} style={{ marginRight: 6 }} /> Try Again
                </button>
                <button style={S.cancelWaitBtn} onClick={onCancel} type="button">
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {step === 'intro' && (
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
  courseBannerName:  { fontSize: 13, fontWeight: 700, color: '#0a1628', flex: 1 },
  actionBadge:       { fontSize: 11, fontWeight: 800, color: '#2EABFE', background: 'rgba(46,171,254,0.10)', border: '1px solid rgba(46,171,254,0.25)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 },

  body: { flex: 1, overflowY: 'auto', padding: '24px 20px' },

  fingerprintWrap: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  introTitle: { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 12, textAlign: 'center' },
  introText:  { fontSize: 14, fontWeight: 500, color: 'rgba(10,22,40,0.72)', lineHeight: 1.75, marginBottom: 12 },

  enrollBox:   { borderRadius: 12, background: 'rgba(46,171,254,0.05)', border: '1px solid rgba(46,171,254,0.15)', padding: '14px 16px', marginBottom: 16 },
  enrollTitle: { fontSize: 12, fontWeight: 800, color: '#2EABFE', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' },
  enrollStep:  { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.75)', marginBottom: 8, lineHeight: 1.5 },
  enrollNum:   { width: 22, height: 22, borderRadius: '50%', background: '#2EABFE', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 },

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

  failText:       { fontSize: 14, fontWeight: 600, color: 'rgba(10,22,40,0.65)', lineHeight: 1.6, marginBottom: 12, textAlign: 'left', width: '100%' },
  failGuideBox:   { width: '100%', borderRadius: 12, background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.12)', padding: '12px 14px', marginBottom: 10 },
  failGuideTitle: { fontSize: 12, fontWeight: 800, color: 'rgba(185,28,28,0.80)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' },
  failGuideStep:  { fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.70)', marginBottom: 6, lineHeight: 1.5 },

  retryBtn: {
    display: 'flex', alignItems: 'center', padding: '11px 24px', borderRadius: 10,
    border: 'none', background: '#2EABFE', color: '#fff',
    cursor: 'pointer', fontWeight: 800, fontSize: 14,
  },

  footer:    { display: 'flex', padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0 },
  cancelBtn: { padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)' },
};

export default BioSigModal;