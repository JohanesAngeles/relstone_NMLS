import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';

/* ─── Confetti particle ──────────────────────────────────────────── */
const Particle = ({ style }) => (
  <div style={{
    position: 'absolute',
    width: 7, height: 7,
    borderRadius: 2,
    animation: 'fall 2.4s ease-in forwards',
    ...style,
  }} />
);

const COLORS = ['#2EABFE', '#00E5CC', '#FFD93D', '#FF6B6B', '#C77DFF', '#fff'];

const confettiPieces = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 3.7) % 100}%`,
  top: `${-10 - (i * 0.8) % 20}%`,
  background: COLORS[i % COLORS.length],
  animationDelay: `${(i * 0.03) % 0.8}s`,
  animationDuration: `${1.8 + (i * 0.04) % 1.2}s`,
  transform: `rotate(${(i * 13) % 360}deg)`,
  width: `${5 + (i * 0.25) % 7}px`,
  height: `${5 + (i * 0.25) % 7}px`,
}));

/* ─── Main Modal ─────────────────────────────────────────────────── */
const AnnouncementModal = () => {
  // ── ALL hooks declared at the top — never after a return ──────
  const [announcements, setAnnouncements] = useState([]);
  const [index, setIndex]                 = useState(0);
  const [visible, setVisible]             = useState(false);
  const [closing, setClosing]             = useState(false);
  const [animDir, setAnimDir]             = useState('next');
  const [sliding, setSliding]             = useState(false);
  const [copied, setCopied]               = useState(false);

 useEffect(() => {
  // Get the token issue time to detect new logins
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const shownKey = `ann_shown_${token?.slice(-10)}`; // unique key per token/login

  if (localStorage.getItem(shownKey)) return; // already shown this login session

  API.get('/announcements')
    .then(res => {
      const items = res.data.announcements || [];
      if (items.length === 0) return;
      setAnnouncements(items);
      setTimeout(() => setVisible(true), 400);
      localStorage.setItem(shownKey, '1');
    })
    .catch(() => {});
}, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 380);
  }, []);

  const go = useCallback((dir) => {
    setAnimDir(dir);
    setSliding(true);
    setTimeout(() => {
      setIndex(i => dir === 'next'
        ? Math.min(i + 1, announcements.length - 1)
        : Math.max(i - 1, 0)
      );
      setSliding(false);
    }, 260);
  }, [announcements.length]);

  const copyCode = useCallback((code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // ── Early return AFTER every hook ─────────────────────────────
  if (!visible || announcements.length === 0) return null;

  // ── Derived values (not hooks) ─────────────────────────────────
  const a           = announcements[index];
  const isFirst     = index === 0;
  const isLast      = index === announcements.length - 1;
  const isVoucher   = a.type === 'voucher';
  const codeMatch   = a.message.match(/\b([A-Z0-9]{6,12})\b/);
  const voucherCode = isVoucher && codeMatch ? codeMatch[0] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg);      opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
        @keyframes backdropIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes backdropOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modalIn {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.82) translateY(30px); }
          60%  { transform: translate(-50%,-50%) scale(1.03) translateY(-4px); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1) translateY(0); }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%,-50%) scale(0.88) translateY(24px); }
        }
        @keyframes slideIn  { from { opacity: 0; transform: translateX(40px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOut { to   { opacity: 0; transform: translateX(-40px); } }
        @keyframes badgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46,171,254,0.55); }
          50%       { box-shadow: 0 0 0 10px rgba(46,171,254,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .ann-slide     { animation: slideIn  0.26s ease forwards; }
        .ann-slide-out { animation: slideOut 0.26s ease forwards; }
        .ann-close-btn:hover { background: rgba(255,255,255,0.15) !important; }
        .ann-nav-btn:hover   { background: rgba(255,255,255,0.20) !important; }
        .ann-skip-btn:hover  { background: rgba(255,255,255,0.08) !important; }
        .ann-copy-btn:hover  { filter: brightness(1.1); }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(5,14,22,0.80)',
          backdropFilter: 'blur(8px)',
          animation: `${closing ? 'backdropOut' : 'backdropIn'} 0.38s ease forwards`,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 1001,
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '92%', maxWidth: 480,
        background: 'linear-gradient(160deg, #0d1f2d 0%, #091520 60%, #071018 100%)',
        borderRadius: 28,
        boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(46,171,254,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
        animation: `${closing ? 'modalOut' : 'modalIn'} 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards`,
      }}>

        {/* Confetti (voucher only) */}
        {isVoucher && (
          <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
            {confettiPieces.map(p => (
              <Particle key={p.id} style={{
                left: p.left, top: p.top,
                background: p.background,
                animationDelay: p.animationDelay,
                animationDuration: p.animationDuration,
                width: p.width, height: p.height,
                transform: p.transform,
              }} />
            ))}
          </div>
        )}

        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: isVoucher
            ? 'radial-gradient(circle, rgba(46,171,254,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,229,204,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top bar */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 0',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: isVoucher ? 'rgba(46,171,254,0.15)' : 'rgba(0,229,204,0.12)',
            border: `1px solid ${isVoucher ? 'rgba(46,171,254,0.30)' : 'rgba(0,229,204,0.25)'}`,
            animation: 'badgePop 0.45s 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <span style={{ fontSize: 14 }}>{isVoucher ? '🎟️' : '📢'}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: isVoucher ? '#2EABFE' : '#00E5CC' }}>
              {isVoucher ? 'Voucher Drop' : a.type === 'system' ? 'System' : 'Announcement'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {announcements.length > 1 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
                {index + 1} / {announcements.length}
              </span>
            )}
            <button
              className="ann-close-btn"
              onClick={close}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer', display: 'grid', placeItems: 'center',
                fontSize: 18, lineHeight: 1, transition: 'background .15s',
              }}
            >×</button>
          </div>
        </div>

        {/* Sliding content */}
        <div
          className={sliding ? 'ann-slide-out' : 'ann-slide'}
          style={{ position: 'relative', zIndex: 1, padding: '20px 24px 26px' }}
        >
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 22, fontWeight: 800, color: '#fff',
            margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.01em',
          }}>
            {a.title}
          </h2>

          <p style={{
            fontSize: 14, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.62)',
            margin: '0 0 20px',
          }}>
            {a.message.replace(/\*\*/g, '')}
          </p>

          {/* Voucher code card */}
          {voucherCode && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(46,171,254,0.12) 0%, rgba(46,171,254,0.05) 100%)',
              border: '1.5px dashed rgba(46,171,254,0.40)',
              borderRadius: 16, padding: '16px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(46,171,254,0.70)', marginBottom: 4 }}>
                  Voucher Code
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 26, fontWeight: 900,
                  letterSpacing: '0.12em',
                  background: 'linear-gradient(90deg, #fff 0%, #2EABFE 50%, #fff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 2.5s linear infinite',
                }}>
                  {voucherCode}
                </div>
              </div>
              <button
                className="ann-copy-btn"
                onClick={() => copyCode(voucherCode)}
                style={{
                  padding: '9px 16px', borderRadius: 10, border: 'none',
                  background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(46,171,254,0.20)',
                  color: copied ? '#10b981' : '#2EABFE',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  transition: 'all .2s', fontFamily: "'DM Sans', sans-serif",
                  animation: copied ? 'none' : 'pulse 2s ease-in-out infinite',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          )}

          {/* Expiry */}
          {a.expires_at && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 20,
            }}>
              <span>⏳</span>
              Expires {new Date(a.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          {/* Dot indicators */}
          {announcements.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
              {announcements.map((_, i) => (
                <div key={i} style={{
                  width: i === index ? 20 : 6, height: 6, borderRadius: 99,
                  background: i === index ? '#2EABFE' : 'rgba(255,255,255,0.15)',
                  transition: 'all .25s ease',
                }} />
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {announcements.length > 1 && (
              <button
                className="ann-nav-btn"
                onClick={() => go('prev')}
                disabled={isFirst}
                style={{
                  width: 42, height: 42, borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.06)',
                  color: isFirst ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.70)',
                  cursor: isFirst ? 'default' : 'pointer',
                  display: 'grid', placeItems: 'center',
                  fontSize: 18, transition: 'background .15s', flexShrink: 0,
                }}
              >‹</button>
            )}

            <button
              onClick={isLast ? close : () => go('next')}
              style={{
                flex: 1, height: 42, borderRadius: 11, border: 'none',
                background: isLast
                  ? 'linear-gradient(135deg, #2EABFE 0%, #0080d4 100%)'
                  : 'rgba(255,255,255,0.08)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: isLast ? '0 6px 24px rgba(46,171,254,0.35)' : 'none',
                transition: 'all .2s',
              }}
            >
              {isLast ? (isVoucher ? '🛍️  Shop Now' : 'Got it!') : 'Next →'}
            </button>

            {announcements.length > 1 && !isLast && (
              <button
                className="ann-nav-btn"
                onClick={() => go('next')}
                style={{
                  width: 42, height: 42, borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.70)',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  fontSize: 18, transition: 'background .15s', flexShrink: 0,
                }}
              >›</button>
            )}
          </div>

          {/* Skip all */}
          {announcements.length > 1 && !isLast && (
            <button
              className="ann-skip-btn"
              onClick={close}
              style={{
                display: 'block', width: '100%', marginTop: 10,
                padding: '8px', borderRadius: 9, border: 'none',
                background: 'transparent', color: 'rgba(255,255,255,0.28)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'background .15s',
              }}
            >
              Skip all
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AnnouncementModal;