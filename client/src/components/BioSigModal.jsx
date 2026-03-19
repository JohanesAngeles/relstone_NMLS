import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2, X, Fingerprint } from 'lucide-react';
import API from '../api/axios';

/**
 * BioSigModal
 *
 * Placeholder for BioSig-ID (BSI) identity verification.
 * Shown before ROCS modal on every course entry.
 *
 * Once NMLS provides BSI Interface Specifications, replace the
 * "Start Verification" button logic with the real BSI widget/SDK.
 *
 * @param {string}   courseId
 * @param {string}   courseName
 * @param {function} onVerified  - called after successful verification
 * @param {function} onCancel    - called when student cancels
 */
const BioSigModal = ({ courseId, courseName, onVerified, onCancel }) => {
  const [step,    setStep]    = useState('intro');   // intro | verifying | done | error
  const [error,   setError]   = useState(null);

  const handleVerify = async () => {
    setStep('verifying');
    setError(null);
    try {
      const res = await API.post('/biosig/verify', { courseId });
      if (res.data?.verified) {
        setStep('done');
        // Short delay so student sees success state before modal closes
        setTimeout(() => onVerified(), 1200);
      } else {
        setError('Identity verification failed. Please try again.');
        setStep('error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setStep('error');
    }
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
          <button style={S.closeBtn} onClick={onCancel} type="button">
            <X size={18} />
          </button>
        </div>

        {/* Course label */}
        <div style={S.courseBanner}>
          <span style={S.courseBannerLabel}>Course:</span>
          <span style={S.courseBannerName}>{courseName}</span>
        </div>

        {/* Body — changes per step */}
        <div style={S.body}>

          {/* ── Intro ── */}
          {step === 'intro' && (
            <>
              <div style={S.placeholderBadge}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                BioSig-ID integration pending — placeholder mode active
              </div>

              <div style={S.fingerprintWrap}>
                <Fingerprint size={64} style={{ color: 'rgba(46,171,254,0.60)' }} />
              </div>

              <div style={S.introTitle}>Verify Your Identity</div>
              <div style={S.introText}>
                Per NMLS requirements effective August 21, 2017, all Online Self-Study (OSS)
                courses require BioSig-ID biometric authentication before accessing course content.
              </div>
              <div style={S.introText}>
                This verifies that you — the registered student — are the person completing the course.
                Your completion will be reported to NMLS under your name and NMLS ID.
              </div>

              <div style={S.infoBox}>
                <div style={S.infoRow}><span style={S.infoLabel}>Status</span><span style={S.infoBadgePending}>Pending BSI API Integration</span></div>
                <div style={S.infoRow}><span style={S.infoLabel}>Required by</span><span style={S.infoValue}>NMLS (effective Aug 21, 2017)</span></div>
                <div style={S.infoRow}><span style={S.infoLabel}>Spec source</span><span style={S.infoValue}>nmls.ed1@csbs.org</span></div>
              </div>

              <button style={S.verifyBtn} onClick={handleVerify} type="button">
                <Fingerprint size={16} /> Start Verification (Placeholder)
              </button>
            </>
          )}

          {/* ── Verifying ── */}
          {step === 'verifying' && (
            <div style={S.centerState}>
              <div style={S.spinner} />
              <div style={S.stateTitle}>Verifying identity…</div>
              <div style={S.stateSub}>Please wait while we process your verification.</div>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div style={S.centerState}>
              <CheckCircle2 size={56} style={{ color: 'rgba(34,197,94,1)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Identity Verified</div>
              <div style={S.stateSub}>Proceeding to Rules of Conduct…</div>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div style={S.centerState}>
              <AlertCircle size={56} style={{ color: 'rgba(185,28,28,0.80)', marginBottom: 16 }} />
              <div style={S.stateTitle}>Verification Failed</div>
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

  placeholderBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 10, marginBottom: 20,
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
    color: 'rgba(146,84,0,1)', fontSize: 12, fontWeight: 700,
  },

  fingerprintWrap: { display: 'flex', justifyContent: 'center', marginBottom: 20 },

  introTitle: { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 12, textAlign: 'center' },
  introText:  { fontSize: 14, fontWeight: 500, color: 'rgba(10,22,40,0.72)', lineHeight: 1.75, marginBottom: 12 },

  infoBox:       { borderRadius: 14, border: '1px solid rgba(2,8,23,0.08)', background: 'rgba(2,8,23,0.02)', padding: '14px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  infoLabel:     { fontSize: 12, fontWeight: 700, color: 'rgba(10,22,40,0.50)' },
  infoValue:     { fontSize: 12, fontWeight: 700, color: '#0a1628' },
  infoBadgePending: { fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: 'rgba(146,84,0,1)', border: '1px solid rgba(245,158,11,0.25)' },

  verifyBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', borderRadius: 12, border: 'none',
    background: '#2EABFE', color: '#fff', cursor: 'pointer',
    fontWeight: 800, fontSize: 14, boxShadow: '0 6px 20px rgba(46,171,254,0.28)',
  },

  centerState: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 0' },
  spinner:     { width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(2,8,23,0.10)', borderTopColor: '#2EABFE', animation: 'biosig-spin 0.9s linear infinite', marginBottom: 20 },
  stateTitle:  { fontSize: 18, fontWeight: 900, color: '#0a1628', marginBottom: 8 },
  stateSub:    { fontSize: 14, fontWeight: 600, color: 'rgba(10,22,40,0.55)', lineHeight: 1.6 },
  retryBtn:    { padding: '11px 24px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.90)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 },

  footer:     { display: 'flex', padding: '14px 20px', borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0 },
  cancelBtn:  { padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)' },
};

export default BioSigModal;