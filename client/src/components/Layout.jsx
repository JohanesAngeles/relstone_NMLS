import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, ShoppingCart, HelpCircle,
  LogOut, User, Award, Menu, X, GraduationCap,
  Search, Settings,
} from 'lucide-react';
import logo from '../assets/images/Left Side Logo.png';
import HowItWorksModal from './HowItWorksModal';

/* ─── Logout Confirm ─────────────────────────────────────────────── */
const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogIcon}><LogOut size={22} color="rgba(220,38,38,0.85)" /></div>
      <div style={D.dialogTitle}>Sign out?</div>
      <div style={D.dialogSub}>Are you sure you want to sign out of your account?</div>
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
    display: "flex", alignItems: "center", gap: 14,
    padding: "10px 14px", width: "100%", border: "none",
    background: active ? "rgba(46,171,254,0.10)" : "transparent",
    cursor: "pointer", textAlign: "left", borderRadius: 0,
    borderLeft: active ? "3px solid #2EABFE" : "3px solid transparent",
    transition: "background .15s",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: danger ? "rgba(239,68,68,0.10)" : active ? "rgba(46,171,254,0.12)" : "rgba(127,168,196,0.10)",
      border: active ? "1px solid rgba(46,171,254,0.22)" : "1px solid transparent",
      display: "grid", placeItems: "center",
    }}>
      <span style={{ color: danger ? "#EF4444" : active ? "#2EABFE" : "#5B7384" }}>{icon}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 14, fontWeight: active ? 700 : 500,
        color: danger ? "#EF4444" : "#091925",
        fontFamily: "'Poppins', sans-serif", lineHeight: 1.2,
      }}>{label}</div>
      <div style={{ fontSize: 11, color: "#7FA8C4", marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>{sub}</div>
    </div>
  </button>
);

/* ─── Layout ─────────────────────────────────────────────────────── */
const Layout = ({ children, pageTitle, pageSubtitle }) => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [showLogout,     setShowLogout]     = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);

  const handleLogout = () => { logout(); window.location.href = '/'; };
  const isActive = (path) => location.pathname === path;

  const initials  = user?.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "AC";
  const studentId = user?.nmls_id ? `#NM-${user.nmls_id}` : "Student";

  return (
    <div style={S.root}>
      <style>{css}</style>

      {showLogout && <LogoutConfirm onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

      {showHowItWorks && (
        <HowItWorksModal
          user={user}
          onClose={() => setShowHowItWorks(false)}
        />
      )}

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <button style={S.menuToggle} onClick={() => setSidebarOpen(o => !o)} type="button">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={S.logo}>
            <img src={logo} alt="Relstone" style={S.logoImg} onClick={() => navigate('/home')} />
            <div style={S.logoText}>
              <span style={S.logoNmls}>NMLS</span>
              <span style={S.logoSub}>Mortgage Licensing Education</span>
            </div>
            <div style={S.logoDivider} />
            <span style={S.logoTagline}>Student Portal</span>
          </div>
        </div>

        {/* ── Centered search ── */}
        <div style={S.topSearch}>
          <Search size={15} style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
          <input style={S.topSearchInput} placeholder="Search States or Courses..." />
        </div>

        <div style={S.topbarRight}>
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            title="How it works"
            style={S.howBtn}
            className="layout-how-btn"
          >
            ?
          </button>
          <div style={S.userChip}>
            <div style={S.userAvatar}>{initials}</div>
            <span style={S.userName}>{user?.name || "Student"}</span>
          </div>
        </div>
      </header>

      <div style={S.body}>

        {/* ── SIDEBAR ──────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside style={S.sidebar}>
            <div style={S.sideProfile}>
              <div style={S.sideAvatar}>{initials}</div>
              <div style={S.sideUserInfo}>
                <div style={S.sideUserName}>{user?.name || "Student"}</div>
                <div style={S.sideStudentId}>{studentId}</div>
              </div>
            </div>

            <div style={S.sideDivider} />

            <div style={S.sideSection}>MY ACCOUNT</div>
            <SideNavItem icon={<LayoutDashboard size={20} />} label="Dashboard"      sub="Home / Overview & Summary"              active={isActive('/dashboard')}    onClick={() => navigate('/dashboard')} />
            <SideNavItem icon={<BookOpen size={20} />}        label="My Courses"     sub="Progress & Certificates"                active={isActive('/my-courses')}   onClick={() => navigate('/my-courses')} />
            <SideNavItem icon={<Award size={20} />}           label="Certificates"   sub="Download & Verify"                      active={isActive('/certificates')} onClick={() => navigate('/certificates')} />
            <SideNavItem icon={<GraduationCap size={20} />}   label="Browse Courses" sub="Find PE and CE courses"                 active={isActive('/courses')}      onClick={() => navigate('/courses')} />

            <div style={S.sideDivider} />

            <div style={S.sideSection}>SETTINGS & SUPPORT</div>
            <SideNavItem icon={<User size={20} />}         label="My Profile"      sub="Personal info & preferences"            active={isActive('/profile')}        onClick={() => navigate('/profile')} />
            <SideNavItem icon={<Settings size={20} />}     label="Account Setup"   sub="NMLS ID, license goals & notifications" active={isActive('/account-setup')} onClick={() => navigate('/account-setup')} />
            <SideNavItem icon={<ShoppingCart size={20} />} label="My Orders"       sub="Purchase History & Receipts"            active={isActive('/orders')}         onClick={() => navigate('/orders')} />
            <SideNavItem icon={<HelpCircle size={20} />}   label="Contact Support" sub="Get Help from RELS NMLS"                active={isActive('/support')}        onClick={() => navigate('/support')} />

            <div style={S.sideDivider} />

            <SideNavItem
              icon={<LogOut size={20} style={{ color: "#EF4444" }} />}
              label="Sign out" sub="End Your Session"
              danger
              onClick={() => setShowLogout(true)}
            />
          </aside>
        )}

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <main style={S.main} className="layout-main">
          {(pageTitle || pageSubtitle) && (
            <div style={S.pageHead}>
              {pageTitle    && <h1 style={S.pageTitle}>{pageTitle}</h1>}
              {pageSubtitle && <p  style={S.pageSub}>{pageSubtitle}</p>}
              <div style={S.headDivider} />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

/* ─── Dialog styles ──────────────────────────────────────────────── */
const D = {
  backdrop:   { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:     { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: 360, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
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
.layout-main::-webkit-scrollbar{width:5px;}
.layout-main::-webkit-scrollbar-track{background:transparent;}
.layout-main::-webkit-scrollbar-thumb{background:rgba(9,25,37,0.15);border-radius:99px;}
.layout-how-btn:hover{background:#2EABFE !important;color:#fff !important;border-color:#2EABFE !important;}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  root: { height: "100vh", display: "flex", flexDirection: "column", background: "#F0F4F8", overflow: "hidden" },

  // ── Topbar ──
  topbar:      { position: "relative", height: 85, background: "#091925", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.08)", zIndex: 100 },
  topbarLeft:  { display: "flex", alignItems: "center", gap: 14 },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  menuToggle:  { width: 32, height: 32, background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff", flexShrink: 0 },

  logo:        { display: "flex", alignItems: "center", gap: 14 },
  logoImg:     { height: 32, objectFit: "contain", cursor: "pointer" },
  logoText:    { display: "flex", flexDirection: "column" },
  logoNmls:    { fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 },
  logoSub:     { fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.70)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" },
  logoDivider: { width: "0.5px", height: 35, background: "#2EABFE", opacity: 0.6 },
  logoTagline: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)" },

  // Centered search — absolute so it's always in the middle regardless of left/right widths
  topSearch: {
    position: "absolute", left: "50%", transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.10)", border: "0.5px solid rgba(255,255,255,0.20)",
    borderRadius: 8, padding: "0 14px", height: 48, width: 360,
  },
  topSearchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, fontFamily: "'Poppins',sans-serif" },

  howBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(46,171,254,0.15)", border: "1px solid rgba(46,171,254,0.35)",
    color: "#2EABFE", fontSize: 16, fontWeight: 900,
    cursor: "pointer", display: "grid", placeItems: "center",
    fontFamily: "'Poppins',sans-serif", flexShrink: 0, transition: "all .15s",
  },

  userChip:   { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", border: "0.5px solid #60C3FF", borderRadius: 999, padding: "6px 14px 6px 8px" },
  userAvatar: { width: 38, height: 38, borderRadius: "50%", background: "#2EABFE", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "#091925", flexShrink: 0 },
  userName:   { fontSize: 14, fontWeight: 700, color: "#fff" },

  // ── Body ──
  body: { display: "flex", flex: 1, overflow: "hidden" },

  // ── Sidebar ──
  sidebar:      { width: 300, flexShrink: 0, background: "#fff", borderRight: "0.5px solid rgba(127,168,196,0.25)", overflowY: "auto", display: "flex", flexDirection: "column" },
  sideProfile:  { display: "flex", alignItems: "center", gap: 12, padding: "20px 16px 16px" },
  sideAvatar:   { width: 42, height: 42, borderRadius: "50%", background: "#2EABFE", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "#091925", flexShrink: 0 },
  sideUserInfo: { display: "flex", flexDirection: "column" },
  sideUserName: { fontSize: 14, fontWeight: 700, color: "#091925" },
  sideStudentId:{ fontSize: 12, color: "#2EABFE", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 },
  sideDivider:  { height: "0.5px", background: "#7FA8C4", margin: "6px 16px", opacity: 0.4 },
  sideSection:  { fontSize: 11, fontWeight: 700, color: "#7FA8C4", textTransform: "uppercase", letterSpacing: "0.07em", padding: "10px 18px 4px" },

  // ── Main ──
  main:        { flex: 1, overflowY: "auto", padding: "0 24px 40px" },
  pageHead:    { padding: "22px 0 0" },
  pageTitle:   { fontSize: 32, fontWeight: 800, color: "#091925", lineHeight: 1.1, marginBottom: 6 },
  pageSub:     { fontSize: 14, fontWeight: 500, color: "#5B7384", marginBottom: 12 },
  headDivider: { height: "1.5px", background: "linear-gradient(90deg,#2EABFE,transparent)", borderRadius: 99, marginBottom: 18 },
};

export default Layout;