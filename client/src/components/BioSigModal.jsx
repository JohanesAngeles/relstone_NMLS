import { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, CheckCircle2, X, Fingerprint, RefreshCw } from 'lucide-react';
import API from '../api/axios';

const BioSigModal = ({ courseId, courseName, action = 'Begin', onVerified, onCancel }) => {
  const [step,       setStep]       = useState('intro');
  const [error,      setError]      = useState(null);
  const [bsiAction,  setBsiAction]  = useState(action);
  const [failReason, setFailReason] = useState(null);
  const [bsiUrl,     setBsiUrl]     = useState(null);
  const pollRef = useRef(null);
  const tabRef  = useRef(null);
  const verifyStartRef = useRef(null);

  useEffect(() => {
    setBsiAction(action);
  }, [action]);

  const ACTION_LABELS = {
    'Begin':     { title: 'Identity Verification Required',   sub: 'Required before accessing course content.' },
    'Resuming':  { title: 'Re-Verification Required',         sub: 'Please verify your identity to resume the course.' },
    'FinalExam': { title: 'Verify to Unlock Final Exam',      sub: 'NMLS requires identity verification before the final exam.' },
    'Middle#1':  { title: 'Mid-Course Verification Required', sub: 'NMLS requires periodic identity checks during the course.' },
    'Middle#2':  { title: 'Mid-Course Verification Required', sub: 'NMLS requires periodic identity checks during the course.' },
    'Enrolling': { title: 'Enroll with BioSig-ID',           sub: 'First-time enrollment required for NMLS compliance.' },
  };

  const label = ACTION_LABELS[bsiAction] || ACTION_LABELS['Begin'];

  // ── On mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // On mount, we default to the 'intro' screen. The parent component (`CoursePortal`)
    // is responsible for managing the verification state for the current app session.
    // It will not render this modal if the user is already verified. This strict
    // approach ensures that any new session (e.g., after a page reload or login)
    // requires a fresh verification, which aligns with NMLS compliance.
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    };
  }, []);

  // ── Listen for iframe / new tab postMessage ───────────────────────────────
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'BIOSIG_RESULT') {
        if (!event.data.success) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
          setFailReason('failed');
          setStep('failed');
        } else {
          // If success, we optionally help close the tab faster
          if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ── Poll every 2s until verified ──────────────────────────────────────────
  const startPolling = (currentAction) => {
    pollRef.current = setInterval(async () => {
      try {
        const tabClosed = tabRef.current?.closed;
        const res = await API.get(`/biosig/status/${courseId}`, {
          params: {
            action: currentAction,
            since: verifyStartRef.current
          }
        });
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

  // ── Start BioSig-ID verification ──────────────────────────────────────────
  const handleVerify = async () => {
    setStep('redirecting');
    setError(null);
    setFailReason(null);
    try {
      const res = await API.get('/biosig/sso-url', { params: { courseId, action } });
      const { url, action: resolvedAction, serverTime } = res.data;

      if (!url) throw new Error('No SSO URL returned from server.');

      const finalAction = resolvedAction || action;
      setBsiAction(finalAction);
      setBsiUrl(url);
      
      // Store server time to prevent matching previous verifications from earlier sessions
      verifyStartRef.current = serverTime ? serverTime - 2000 : Date.now() - 5000;
      
      setStep('waiting');
      startPolling(finalAction);
    } catch (err) {
      setFailReason('server');
      setError(err.response?.data?.message || err.message || 'Failed to start verification. Please try again.');
      setStep('failed');
    }
  };

  const handleCancelWaiting = () => {
    clearInterval(pollRef.current);
    if (tabRef.current && !tabRef.current.closed) tabRef.current.close();
    setBsiUrl(null);
    setStep('intro');
  };

  const handleRetry = () => {
    setFailReason(null);
    setError(null);
    setBsiUrl(null);
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

        {/* ── Course banner ── */}
        <div style={S.courseBanner}>
          <span style={S.courseBannerLabel}>Course:</span>
          <span style={S.courseBannerName}>{courseName}</span>
          {bsiAction && bsiAction !== 'Begin' && (
            <span style={S.actionBadge}>{bsiAction}</span>
          )}
        </div>

        {/* ── Body ── */}
        <div style={step === 'waiting' ? S.bodyFull : S.body}>

          {/* Intro */}
          {step === 'intro' && (
            <>
              <div style={S.fingerprintWrap}>
                <Fingerprint size={64} style={{ color: 'rgba(46,171,254,0.60)' }} />
              </div>
              <div style={S.introTitle}>{label.title}</div>
              <div style={S.introText}>{label.sub}</div>

              {bsiAction === 'Begin' && (

                <div style={S.enrollBox}>
                  <div style={S.enrollTitle}>First time? Here's what to expect:</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>1</span>Click the button below to open BioSig-ID.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>2</span>Draw your unique signature pattern when prompted.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>3</span>BioSig-ID will enroll your biometric profile.</div>
                  <div style={S.enrollStep}><span style={S.enrollNum}>4</span>This page will update automatically when done.</div>
                </div>
              )}

              {bsiAction === 'Resuming' && (
                <div style={S.enrollBox}>
                  <div style={S.enrollTitle}>Why am I seeing this?</div>
                  <div style={{ fontSize: 13, color: 'rgba(10,22,40,0.65)', lineHeight: 1.7, fontWeight: 500 }}>
                    Per NMLS requirements, identity re-verification is required when returning to a course after logout or inactivity.
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
              </div>

              <button style={S.verifyBtn} onClick={handleVerify} type="button">
                <Fingerprint size={16} />
                {bsiAction === 'Resuming' ? 'Re-Verify with BioSig-ID' : 'Begin Identity Verification'}
              </button>
            </>
          )}

          {/* Redirecting */}
          {step === 'redirecting' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Loading BioSig-ID…</div>
              <div style={S.stateSub}>Please wait a moment.</div>
            </div>
          )}

          {/* Waiting — BioSig-ID iframe */}
          {step === 'waiting' && (
            <div style={S.iframeWrap}>
              {bsiUrl && (
                <iframe
                  src={bsiUrl}
                  style={S.iframe}
                  title="BioSig-ID Verification"
                />
              )}
              <div style={S.iframeFooter}>
                <div style={S.waitingBadge}>✓ Complete verification above — this page updates automatically</div>
                <button style={S.cancelWaitBtn} onClick={handleCancelWaiting} type="button">
                  Cancel — Go Back
                </button>
              </div>
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

          {/* Failed */}
          {step === 'failed' && (
            <div style={S.centerState}>
              <AlertCircle size={56} style={{ color: 'rgba(185,28,28,0.80)', marginBottom: 16 }} />

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

              {failReason === 'failed' && (
                <>
                  <div style={S.stateTitle}>Verification Not Completed</div>
                  <div style={S.failText}>BioSig-ID verification was not completed. This can happen if:</div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideStep}>• Your biometric pattern was not recognized.</div>
                    <div style={S.failGuideStep}>• You closed the verification before finishing.</div>
                    <div style={S.failGuideStep}>• Your session timed out.</div>
                  </div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideTitle}>What you can do:</div>
                    <div style={S.failGuideStep}>• Click "Try Again" to restart the verification.</div>
                    <div style={S.failGuideStep}>• Make sure to draw your signature slowly and clearly.</div>
                    <div style={S.failGuideStep}>
                      • For BioSig-ID account issues, visit the{' '}
                      <a href="https://mortgage.nationwidelicensingsystem.org/help" target="_blank" rel="noopener noreferrer" style={{ color: '#2EABFE', fontWeight: 700 }}>
                        NMLS Help Center
                      </a>.
                    </div>
                  </div>
                </>
              )}

              {failReason === 'server' && (
                <>
                  <div style={S.stateTitle}>Verification Error</div>
                  <div style={S.failText}>{error}</div>
                  <div style={S.failGuideBox}>
                    <div style={S.failGuideTitle}>What you can do:</div>
                    {(error?.includes('Misconfiguration') || error?.includes('D5')) ? (
                      <div style={S.failGuideStep}>• Please contact <strong>Relstone NMLS support</strong> and let them know this course's length needs to be updated.</div>
                    ) : (
                      <>
                        <div style={S.failGuideStep}>• Check your internet connection and try again.</div>
                        <div style={S.failGuideStep}>• If the issue persists, please contact <strong>Relstone NMLS support</strong> so we can investigate.</div>
                      </>
                    )}
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

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(9,25,37,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20,
    width: '100%', maxWidth: 820,
    display: 'flex', flexDirection: 'column',
    height: '92vh',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid rgba(2,8,23,0.08)', flexShrink: 0,
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap:    { width: 38, height: 38, borderRadius: 10, background: 'rgba(46,171,254,0.10)', border: '1px solid rgba(46,171,254,0.22)', display: 'grid', placeItems: 'center', flexShrink: 0 },
  headerTitle: { fontSize: 15, fontWeight: 800, color: '#0a1628' },
  headerSub:   { fontSize: 12, fontWeight: 600, color: 'rgba(10,22,40,0.45)', marginTop: 2 },
  closeBtn:    { width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(10,22,40,0.50)', flexShrink: 0 },

  courseBanner:      { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(46,171,254,0.06)', borderBottom: '1px solid rgba(46,171,254,0.12)', flexShrink: 0 },
  courseBannerLabel: { fontSize: 11, fontWeight: 800, color: 'rgba(10,22,40,0.40)', letterSpacing: '0.4px', textTransform: 'uppercase', flexShrink: 0 },
  courseBannerName:  { fontSize: 13, fontWeight: 700, color: '#0a1628', flex: 1 },
  actionBadge:       { fontSize: 11, fontWeight: 800, color: '#2EABFE', background: 'rgba(46,171,254,0.10)', border: '1px solid rgba(46,171,254,0.25)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 },

  body:     { flex: 1, overflowY: 'auto', padding: '24px 20px' },
  bodyFull: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 },

  // ── Iframe layout ──────────────────────────────────────────────────────────
  iframeWrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  iframe: {
    flex: 1, width: '100%', border: 'none',
    minHeight: 0,
  },
  iframeFooter: {
    flexShrink: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 10, padding: '12px 20px',
    borderTop: '1px solid rgba(2,8,23,0.08)',
    background: '#fff',
  },

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
  stateTitle:    { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 8 },
  stateSub:      { fontSize: 14, fontWeight: 600, color: 'rgba(10,22,40,0.55)', lineHeight: 1.6, marginBottom: 16 },
  waitingBadge:  { fontSize: 12, fontWeight: 700, color: 'rgba(46,171,254,0.90)', padding: '6px 14px', borderRadius: 999, background: 'rgba(46,171,254,0.08)', border: '1px solid rgba(46,171,254,0.20)', textAlign: 'center' },
  cancelWaitBtn: { padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'rgba(10,22,40,0.60)' },

  failText:       { fontSize: 14, fontWeight: 600, color: 'rgba(10,22,40,0.65)', lineHeight: 1.6, marginBottom: 12, textAlign: 'left', width: '100%' },
  failGuideBox:   { width: '100%', borderRadius: 12, background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.12)', padding: '12px 14px', marginBottom: 10 },
  failGuideTitle: { fontSize: 12, fontWeight: 800, color: 'rgba(185,28,28,0.80)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.4px' },
  failGuideStep:  { fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.70)', marginBottom: 6, lineHeight: 1.5 },

  retryBtn: { display: 'flex', alignItems: 'center', padding: '11px 24px', borderRadius: 10, border: 'none', background: '#2EABFE', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 },

  footer:    { display: 'flex', padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0 },
  cancelBtn: { padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)' },
};

export default BioSigModal;