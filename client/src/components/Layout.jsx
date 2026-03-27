import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, LogOut, LayoutDashboard, BookOpen, ShoppingCart, Home, GraduationCap, Award, Bell, Trophy, FileText, Clock3, Sparkles, Settings } from 'lucide-react';
import logo from '../assets/images/Left Side Logo.png';

/* ─── Logout Confirm Dialog ─────────────────────────────────────── */
const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogIcon}>
        <LogOut size={22} color="rgba(220,38,38,0.85)" />
      </div>
      <div style={D.dialogTitle}>Sign out?</div>
      <div style={D.dialogSub}>Are you sure you want to sign out of your account?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn} onClick={onCancel} type="button">No, stay</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, sign out</button>
      </div>
    </div>
  </>
);

/* ─── Layout ─────────────────────────────────────────────────────── */
const Layout = ({ children, title, subtitle, actions }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead, markAsUnread } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);

  const bellBtnRef = useRef(null);
  const popupRef = useRef(null);

  const handleClosePopup = () => setShowNotifPopup(false);

  const handleTogglePopup = () => {
    setShowNotifPopup(!showNotifPopup);
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!showNotifPopup) return;
      if (popupRef.current && popupRef.current.contains(e.target)) return;
      if (bellBtnRef.current && bellBtnRef.current.contains(e.target)) return;
      setShowNotifPopup(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotifPopup]);

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const navLinks = [
    { path: '/home',       label: 'Home',       icon: <Home size={15} /> },
    { path: '/dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
    { path: '/my-courses', label: 'My Courses', icon: <GraduationCap size={15} /> },
    { path: '/courses',    label: 'Courses',    icon: <BookOpen size={15} /> },
    { path: '/certificates', label: 'Certificates', icon: <Award size={15} /> },
    { path: '/checkout',   label: 'Checkout',   icon: <ShoppingCart size={15} /> },
    ...(user?.role === 'admin' ? [{ path: '/admin/refunds', label: 'Admin', icon: <Settings size={15} /> }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={S.page}>
      <style>{css}</style>

      {showLogout && (
        <LogoutConfirm
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {/* ── Sticky Navbar ───────────────────────────────────────── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>

          {/* Left — Logo + Nav */}
          <div style={S.navLeft}>
            <div style={S.brand} onClick={() => navigate('/home')} role="button" tabIndex={0}>
              <img src={logo} alt="Relstone" style={S.logo} />
              <div style={S.brandText}>
                <span style={S.brandName}>Relstone</span>
                <span style={S.brandTag}>NMLS</span>
              </div>
            </div>

            <nav style={S.nav}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  type="button"
                  style={{ ...S.navLink, ...(isActive(link.path) ? S.navLinkActive : {}) }}
                  onClick={() => navigate(link.path)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right — Actions + User */}
          <div style={S.navRight}>
            {actions}

            <div style={{ position: 'relative' }}>
              <button
                style={S.notificationBtn}
                onClick={handleTogglePopup}
                type="button"
                title="Notifications"
                ref={bellBtnRef}
              >
                <Bell size={14} />
                {unreadCount > 0 && <span style={S.notifDot} />}
              </button>
              {showNotifPopup && (
                <div style={S.popupOverlay} onClick={handleClosePopup} />
              )}
              {showNotifPopup && (
                <div ref={popupRef} style={S.notifPopup}>
                  <div style={S.popupHeader}>
                    <div style={S.popupTitle}>Notifications</div>
                      <button
                        style={S.popupMarkAll}
                        onClick={() => {
                          console.log('📋 [Layout] "Mark all as read" clicked in popup');
                          markAllAsRead();
                        }}
                        type="button"
                      >
                        Mark all as read
                      </button>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                    You have <strong>{unreadCount}</strong> unread messages
                  </div>
                  <div style={S.popupList}>
                    {notifications.map((n) => (
                      <div key={n._id || n.id} style={S.popupItem}>
                        <span style={S.popupBadge}>
                          {n.type === 'milestones' && <Trophy size={14} />}
                          {n.type === 'quiz' && <FileText size={14} />}
                          {n.type === 'ce' && <Clock3 size={14} />}
                          {n.type === 'new' && <BookOpen size={14} />}
                          {n.type === 'purchase' && <ShoppingCart size={14} />}
                          {n.type === 'promotions' && <Sparkles size={14} />}
                          {n.type === 'system' && <Bell size={14} />}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={S.popupItemTitle}>{n.title}</div>
                          <div style={S.popupItemBody}>{n.body}</div>
                          <div style={S.popupItemTime}>{n.time}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const action = n.read ? 'unread' : 'read';
                            console.log(`⭐ [Layout] Mark as ${action} clicked in popup for:`, n.title);
                            if (n.read) markAsUnread(n._id || n.id);
                            else markAsRead(n._id || n.id);
                          }}
                          style={{
                            border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: 12, marginLeft: 8,
                          }}
                        >
                          {n.read ? 'Mark unread' : 'Mark read'}
                        </button>
                      </div>
                    ))}
                    {notifications.length === 0 && <div style={{ padding: 10, color: '#64748b', fontSize: 13 }}>No notifications yet.</div>}
                  </div>
                  <button
                    style={S.popupViewAll}
                    onClick={() => { handleClosePopup(); navigate('/notifications'); }}
                    type="button"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>

            <button
              style={S.userBtn}
              onClick={() => navigate('/profile')}
              type="button"
              title="My Profile"
            >
              <div style={S.userAvatar}>
                <User size={14} color="#2EABFE" />
              </div>
              <span style={S.userName}>{user?.name || 'Student'}</span>
            </button>

            <button style={S.logoutBtn} onClick={() => setShowLogout(true)} type="button" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Page title bar */}
        {(title || subtitle) && (
          <div style={S.titleBar}>
            <div style={S.titleBarInner}>
              {title    && <div style={S.pageTitle}>{title}</div>}
              {subtitle && <div style={S.pageSub}>{subtitle}</div>}
            </div>
          </div>
        )}
      </header>

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
  navRight:     { display: 'flex', alignItems: 'center', gap: 8, position: 'relative' },
  notificationBtn: { width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(9,25,37,0.8)', position: 'relative', transition: 'all .15s' },
  notifDot:   { width: 8, height: 8, borderRadius: 999, background: '#2EABFE', position: 'absolute', right: 8, top: 8, border: '2px solid #fff' },
  popupOverlay: { position: 'fixed', inset: 0, zIndex: 220, background: 'transparent' },
  notifPopup: { position: 'absolute', top: 46, right: 0, zIndex: 230, width: 360, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 24px 40px rgba(15,23,42,0.18)', padding: 12, display: 'grid', gap: 9 },
  popupHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  popupTitle: { fontWeight: 800, fontSize: 16, color: '#0f172a' },
  popupMarkAll: { border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 12 },
  popupList: { display: 'grid', gap: 6, maxHeight: 260, overflowY: 'auto', paddingRight: 2 },
  popupItem: { display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 10, border: '1px solid #e2e8f0', padding: 8, background: '#fff', position: 'relative' },
  popupBadge: { width: 34, height: 34, borderRadius: 12, display: 'grid', placeItems: 'center', border: '1px solid #dbeafe', background: '#eaf2ff', color: '#0f172a', fontSize: 13, marginTop: 2 },
  popupItemTitle: { fontWeight: 800, fontSize: 13, color: '#0f172a', lineHeight: 1.2 },
  popupItemBody: { color: '#475569', fontSize: 12, lineHeight: 1.3, marginTop: 2, maxWidth: 250 },
  popupItemTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  popupUnreadDot: { width: 8, height: 8, borderRadius: '50%', background: '#2563eb', position: 'absolute', right: 10, top: 12 },
  popupViewAll: { borderTop: '1px solid #e2e8f0', marginTop: 4, padding: '10px 12px', background: '#fff', borderRadius: '0 0 10px 10px', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer', border: 'none' },
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