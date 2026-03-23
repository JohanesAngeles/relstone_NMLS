import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import InnerBreadcrumbs from './InnerBreadcrumbs';

/* ─── Layout ─────────────────────────────────────────────────── */
const Layout = ({ children, title, subtitle, actions }) => {
  const location = useLocation();

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Navbar Component */}
      <Navbar actions={actions} />

      {/* Page title bar */}
      {(title || subtitle || location.pathname !== '/home') && (
        <div style={S.titleBar}>
          <div style={S.titleBarInner}>
            <InnerBreadcrumbs />
            {title    && <div style={S.pageTitle}>{title}</div>}
            {subtitle && <div style={S.pageSub}>{subtitle}</div>}
          </div>
        </div>
      )}

      {/* ── Page Content ────────────────────────────────────────── */}
      <main>
        {children}
      </main>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:         { minHeight: '100vh', background: '#f6f7fb', fontFamily: 'Inter, system-ui, sans-serif' },
  topbar:       { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(246,247,251,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(2,8,23,0.08)', boxShadow: '0 1px 0 rgba(2,8,23,0.05)' },
  topbarInner:  { maxWidth: 1180, margin: '0 auto', padding: '0 18px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  navLeft:      { display: 'flex', alignItems: 'center', gap: 20 },
  brand:        { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textDecoration: 'none' },
  logo:         { height: 28, objectFit: 'contain' },
  brandText:    { display: 'flex', alignItems: 'center', gap: 6 },
  brandName:    { fontWeight: 900, fontSize: 14, color: '#091925', letterSpacing: '-0.2px' },
  brandTag:     { fontSize: 11, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: 'rgba(46,171,254,0.12)', border: '1px solid rgba(46,171,254,0.25)', color: '#2EABFE' },
  nav:          { display: 'flex', alignItems: 'center', gap: 4 },
  navLink:      { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'rgba(9,25,37,0.60)', transition: 'all .15s', fontFamily: 'inherit' },
  navLinkActive:{ background: 'rgba(46,171,254,0.10)', color: '#091925', border: '1px solid rgba(46,171,254,0.20)' },
  navRight:     { display: 'flex', alignItems: 'center', gap: 8 },
  userBtn:      { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' },
  userAvatar:   { width: 26, height: 26, borderRadius: 8, background: 'rgba(46,171,254,0.10)', border: '1px solid rgba(46,171,254,0.20)', display: 'grid', placeItems: 'center', flexShrink: 0 },
  userName:     { fontWeight: 800, fontSize: 13, color: 'rgba(9,25,37,0.80)' },
  logoutBtn:    { width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(9,25,37,0.65)', transition: 'all .15s' },
  titleBar:     { borderTop: '1px solid rgba(2,8,23,0.06)', background: 'rgba(255,255,255,0.60)' },
  titleBarInner:{ maxWidth: 1180, margin: '0 auto', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 },
  pageTitle:    { fontWeight: 900, fontSize: 14, color: '#091925' },
  pageSub:      { fontSize: 12, fontWeight: 700, color: 'rgba(9,25,37,0.50)' },
};

const D = {
  backdrop:   { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:     { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: 360, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' },
  dialogIcon: { width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' },
  dialogTitle:{ fontSize: 18, fontWeight: 950, color: 'rgba(11,18,32,0.88)', marginBottom: 8 },
  dialogSub:  { fontSize: 13, color: 'rgba(11,18,32,0.52)', marginBottom: 24 },
  dialogBtns: { display: 'flex', gap: 10 },
  cancelBtn:  { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 900, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn: { flex: 1, height: 44, background: 'rgba(220,38,38,0.90)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'inherit' },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f6f7fb; }
.rs-nav-link:hover { background: rgba(2,8,23,0.05) !important; color: #091925 !important; }
.rs-logout-btn:hover { background: rgba(239,68,68,0.06) !important; color: rgba(200,50,50,0.9) !important; border-color: rgba(239,68,68,0.20) !important; }
`;

export default Layout;