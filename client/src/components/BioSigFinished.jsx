import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const BioSigFinished = () => {
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      window.close();
      // If still open 800ms later, browser blocked it — show manual button
      setTimeout(() => setShowManual(true), 800);
    }, 1500);

    return () => clearTimeout(closeTimer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f6fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 36px',
        maxWidth: 420, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(34,197,94,0.10)',
          border: '1px solid rgba(34,197,94,0.30)',
          display: 'grid', placeItems: 'center',
          margin: '0 auto 24px',
        }}>
          <CheckCircle2 size={36} style={{ color: 'rgba(34,197,94,1)' }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0a1628', margin: '0 0 10px' }}>
          Identity Verified!
        </h1>

        <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(10,22,40,0.60)', lineHeight: 1.7, margin: '0 0 28px' }}>
          {showManual
            ? 'Your BioSig-ID verification was successful. Please close this tab and return to your course.'
            : 'Your BioSig-ID verification was successful. This tab will close automatically…'}
        </p>

        {showManual && (
          <button
            onClick={() => window.close()}
            type="button"
            style={{
              width: '100%', padding: '13px', borderRadius: 12,
              border: 'none', background: '#2EABFE', color: '#fff',
              fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(46,171,254,0.28)',
            }}
          >
            Close This Tab
          </button>
        )}

        <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(10,22,40,0.35)', fontWeight: 600 }}>
          BioSig-ID · NMLS Identity Verification
        </p>
      </div>
    </div>
  );
};

export default BioSigFinished;