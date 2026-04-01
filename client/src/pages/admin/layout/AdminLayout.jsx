import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, GraduationCap, BarChart2,
  Users, LogOut, Menu, X, Shield, UserCheck, Settings, ShoppingCart,
} from 'lucide-react';
import logo from '../../../assets/images/Left Side Logo.png';

/* ─── Logout Confirm ─────────────────────────────────────────────── */
const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogIcon}><LogOut size={22} color="rgba(220,38,38,0.85)" /></div>
      <div style={D.dialogTitle}>Sign out?</div>
      <div style={D.dialogSub}>Are you sure you want to sign out of the admin panel?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn}  onClick={onCancel}  type="button">No, stay</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, sign out</button>
      </div>
    </div>
  </>
);

/* ─── SideNavItem ────────────────────────────────────────────────── */
const SideNavItem = ({ icon, label, sub, active, danger, onClick }) => (
  <button onClick={onClick} type="button" style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '10px 14px', width: '100%', border: 'none',
    background: active ? 'rgba(46,171,254,0.10)' : 'transparent',
    cursor: 'pointer', textAlign: 'left', borderRadius: 0,
    borderLeft: active ? '3px solid #2EABFE' : '3px solid transparent',
    transition: 'background .15s',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: danger ? 'rgba(239,68,68,0.10)' : active ? 'rgba(46,171,254,0.12)' : 'rgba(127,168,196,0.10)',
      border: active ? '1px solid rgba(46,171,254,0.22)' : '1px solid transparent',
      display: 'grid', placeItems: 'center',
    }}>
      <span style={{ color: danger ? '#EF4444' : active ? '#2EABFE' : '#5B7384' }}>{icon}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 14, fontWeight: active ? 700 : 500,
        color: danger ? '#EF4444' : '#091925',
        fontFamily: "'Poppins', sans-serif", lineHeight: 1.2,
      }}>{label}</div>
      <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>{sub}</div>
    </div>
  </button>
);

/* ─── AdminLayout ────────────────────────────────────────────────── */
const AdminLayout = () => {
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);


  useEffect(() => {
  if (window.innerWidth <= 768) setSidebarOpen(false);
}, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const menuItems = [
  { label: 'Dashboard',   sub: 'Overview & Summary',      path: '/admin/dashboard',   icon: <LayoutDashboard size={20} /> },
  { label: 'Courses',     sub: 'Manage all courses',      path: '/admin/courses',     icon: <BookOpen size={20} /> },
  { label: 'Students',    sub: 'View & manage students',  path: '/admin/students',    icon: <GraduationCap size={20} /> },
  { label: 'Instructors', sub: 'Manage instructors',      path: '/admin/instructors', icon: <UserCheck size={20} /> },
  { label: 'Orders',      sub: 'Revenue & orders',        path: '/admin/orders',      icon: <ShoppingCart size={20} /> },
  { label: 'Reportss',     sub: 'Analytics & reports',     path: '/admin/reports',     icon: <BarChart2 size={20} /> },
  ...(user?.role === 'super_admin' ? [
    { label: 'Manage Admins', sub: 'Add & manage admins', path: '/admin/manage-admins', icon: <Users size={20} /> },
  ] : []),
];

  return (
    <div style={S.root}>
      <style>{css}</style>

      {showLogout && (
        <LogoutConfirm onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
      )}

      {/* Mobile Overlay */}
      {window.innerWidth <= 768 && (
            <div
                className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            )}

      {/* ── TOPBAR ── */}
      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <button style={S.menuToggle} onClick={() => setSidebarOpen(o => !o)} type="button">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={S.logo}>
            <img src={logo} alt="Relstone" style={S.logoImg} onClick={() => navigate('/admin/dashboard')} />
            <div style={S.logoText}>
              <span style={S.logoNmls}>NMLS</span>
              <span style={S.logoSub}>Admin Panel</span>
            </div>
            <div style={S.logoDivider} />
            <span style={S.logoTagline} className="hide-tablet">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        <div style={S.topbarRight}>
          {/* Role Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(46,171,254,0.12)',
            border: '1px solid rgba(46,171,254,0.25)',
            borderRadius: 999, padding: '4px 12px',
          }} className="hide-mobile">
            <Shield size={12} color="#2EABFE" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2EABFE' }}>
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>

          <div style={S.userChip}>
            <div style={S.userAvatar}>{initials}</div>
            <span style={S.userName} className="hide-mobile">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </div>
      </header>

      <div style={S.body}>

        {/* ── SIDEBAR ── */}
        <aside style={S.sidebar} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={S.sideProfile}>
            <div style={S.sideAvatar}>{initials}</div>
            <div style={S.sideUserInfo}>
              <div style={S.sideUserName}>{user?.name || 'Admin'}</div>
              <div style={S.sideUserId}>{user?.email}</div>
            </div>
          </div>

          <div style={S.sideDivider} />

          <div style={S.sideSection}>MAIN MENU</div>
          {menuItems.map((item) => (
            <SideNavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              sub={item.sub}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}

          <div style={S.sideDivider} />

            <SideNavItem
            icon={<Settings size={20} />}
            label="Settings"
            sub="Manage admin settings"
            active={isActive('/admin/settings')}
            onClick={() => navigate('/admin/settings')}
            />

            <SideNavItem
            icon={<LogOut size={20} style={{ color: '#EF4444' }} />}
            label="Sign out"
            sub="End admin session"
            danger
            onClick={() => setShowLogout(true)}
            />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={S.main}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

/* ─── Dialog styles ──────────────────────────────────────────────── */
const D = {
  backdrop:   { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:     { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 360, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
  dialogIcon: { width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' },
  dialogTitle:{ fontSize: 18, fontWeight: 700, color: 'rgba(11,18,32,0.88)', marginBottom: 8 },
  dialogSub:  { fontSize: 13, color: 'rgba(11,18,32,0.52)', marginBottom: 24 },
  dialogBtns: { display: 'flex', gap: 10 },
  cancelBtn:  { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn: { flex: 1, height: 44, background: 'rgba(220,38,38,0.90)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Poppins',sans-serif;background:#F0F4F8;}
.mobile-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(2px);z-index:90;opacity:0;visibility:hidden;transition:0.3s;}
.mobile-overlay.visible{opacity:1;visibility:visible;}
.layout-main::-webkit-scrollbar{width:5px;}
.layout-main::-webkit-scrollbar-thumb{background:rgba(9,25,37,0.15);border-radius:99px;}
@media(max-width:768px){
  .sidebar{position:fixed !important;left:0;top:85px;bottom:0;z-index:100;transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:10px 0 30px rgba(0,0,0,0.1);}
  .sidebar.open{transform:translateX(0);}
  .hide-tablet{display:none !important;}
  .hide-mobile{display:none !important;}
}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  root:        { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F4F8', overflow: 'hidden' },
  topbar:      { position: 'relative', height: 85, background: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 100 },
  topbarLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  menuToggle:  { width: 32, height: 32, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 },
  logo:        { display: 'flex', alignItems: 'center', gap: 14 },
  logoImg:     { height: 28, objectFit: 'contain', cursor: 'pointer' },
  logoText:    { display: 'flex', flexDirection: 'column' },
  logoNmls:    { fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.2 },
  logoSub:     { fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.70)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' },
  logoDivider: { width: '1px', height: 30, background: '#2EABFE', opacity: 0.6 },
  logoTagline: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' },
  userChip:    { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid #60C3FF', borderRadius: 999, padding: '6px 10px 6px 6px' },
  userAvatar:  { width: 32, height: 32, borderRadius: '50%', background: '#2EABFE', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#091925', flexShrink: 0 },
  userName:    { fontSize: 13, fontWeight: 700, color: '#fff' },
  body:        { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar:     { width: 300, flexShrink: 0, background: '#fff', borderRight: '0.5px solid rgba(127,168,196,0.25)', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  sideProfile: { display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px 16px' },
  sideAvatar:  { width: 42, height: 42, borderRadius: '50%', background: '#2EABFE', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: '#091925', flexShrink: 0 },
  sideUserInfo:{ display: 'flex', flexDirection: 'column' },
  sideUserName:{ fontSize: 14, fontWeight: 700, color: '#091925' },
  sideUserId:  { fontSize: 11, color: '#2EABFE', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 },
  sideDivider: { height: '0.5px', background: '#7FA8C4', margin: '6px 16px', opacity: 0.4 },
  sideSection: { fontSize: 11, fontWeight: 700, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 18px 4px' },
  main:        { flex: 1, overflowY: 'auto', padding: '0 28px 40px' },
};

export default AdminLayout;