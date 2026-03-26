import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutDashboard, BookOpen, ShoppingCart, Home, GraduationCap, Award, Users, Menu, X } from 'lucide-react';
import logo from '../assets/images/Left Side Logo.png';
import GlobalSearchBar from './GlobalSearchBar';

/* ─── Logout Confirm Dialog ─────────────────────────────────────── */
const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={styles.backdrop} />
    <div style={styles.dialog}>
      <div style={styles.dialogIcon}>
        <LogOut size={22} color="rgba(220,38,38,0.85)" />
      </div>
      <div style={styles.dialogTitle}>Sign out?</div>
      <div style={styles.dialogSub}>Are you sure you want to sign out of your account?</div>
      <div style={styles.dialogBtns}>
        <button style={styles.cancelBtn} onClick={onCancel} type="button">No, stay</button>
        <button style={styles.confirmBtn} onClick={onConfirm} type="button">Yes, sign out</button>
      </div>
    </div>
  </>
);

/* ─── Mobile Menu ─────────────────────────────────────────────────── */
const MobileMenu = ({ isOpen, onClose, navLinks, isActive, onNavigate, user, onLogout }) => {
  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={styles.mobileMenuBackdrop} className="rs-mobile-backdrop" />
      <div style={styles.mobileMenuContainer} className="rs-mobile-menu-container">
        <div style={styles.mobileMenuHeader}>
          <h3 style={styles.mobileMenuTitle}>Menu</h3>
          <button onClick={onClose} style={styles.mobileMenuCloseBtn} type="button">
            <X size={20} />
          </button>
        </div>

        <nav style={styles.mobileNav}>
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => {
                onNavigate(link.path);
                onClose();
              }}
              style={{
                ...styles.mobileNavLink,
                ...(isActive(link.path) ? styles.mobileNavLinkActive : {})
              }}
              type="button"
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.mobileMenuDivider} />

        <div style={styles.mobileMenuFooter}>
          <button
            onClick={() => {
              onNavigate('/profile');
              onClose();
            }}
            style={styles.mobileProfileBtn}
            type="button"
          >
            <User size={16} />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={styles.mobileLogoutBtn}
            type="button"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Main Navbar Component ────────────────────────────────────── */
const Navbar = ({ actions }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const role = String(user?.role || 'student').toLowerCase();
  const isAdminView = role === 'admin' || role === 'instructor';

  const navLinks = isAdminView
    ? [
        { path: '/instructor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { path: '/instructor/students', label: 'Students', icon: <Users size={14} /> },
        { path: '/courses', label: 'Courses', icon: <BookOpen size={14} /> },
      ]
    : [
        { path: '/home', label: 'Home', icon: <Home size={14} /> },
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { path: '/my-courses', label: 'My Courses', icon: <GraduationCap size={14} /> },
        { path: '/courses', label: 'Courses', icon: <BookOpen size={14} /> },
        { path: '/certificates', label: 'Certificates', icon: <Award size={14} /> },
        { path: '/checkout', label: 'Checkout', icon: <ShoppingCart size={14} /> },
      ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <style>{css}</style>

      {showLogout && (
        <LogoutConfirm
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        onNavigate={navigate}
        user={user}
        onLogout={() => setShowLogout(true)}
      />

      {/* ── Desktop + Mobile Navbar ────────────────────────────── */}
      <header style={styles.navbar} className="rs-navbar">
        <div style={styles.navbarInner} className="rs-navbar-inner">
          <div
            style={styles.brand}
            className="rs-brand"
            onClick={() => navigate('/home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/home')}
          >
            <img src={logo} alt="Relstone" style={styles.logo} />
            <div style={styles.brandText} className="rs-brandText">
              <span style={styles.brandName}>Relstone</span>
              <span style={styles.brandTag}>NMLS</span>
            </div>
          </div>

          {/* Center — Desktop Navigation */}
          <nav style={styles.desktopNav} className="rs-desktop-nav">
            {navLinks.map(link => (
              <button
                key={link.path}
                type="button"
                className="rs-nav-link"
                style={{ ...styles.navLink, ...(isActive(link.path) ? styles.navLinkActive : {}) }}
                onClick={() => navigate(link.path)}
                title={link.label}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Right — Actions + Search + User */}
          <div style={styles.navRight} className="rs-nav-right">
            {actions}

            <div style={styles.searchWrapper} className="rs-search-wrap">
              <GlobalSearchBar minWidth={0} />
            </div>

            {/* Desktop User Actions */}
            <div style={styles.userActionsDesktop} className="rs-user-actions">
              <button
                style={styles.userBtn}
                className="rs-user-btn"
                onClick={() => navigate('/profile')}
                type="button"
                title="My Profile"
              >
                <div style={styles.userAvatar}>
                  <User size={14} color="#2EABFE" />
                </div>
                <span style={styles.userName} className="rs-user-name">{user?.name || 'Student'}</span>
              </button>

              <button
                style={styles.logoutBtn}
                className="rs-logout-btn"
                onClick={() => setShowLogout(true)}
                type="button"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              style={styles.mobileMenuToggle}
              className="rs-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              title="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(2,8,23,0.06)',
    boxShadow: '0 6px 24px rgba(2,8,23,0.05)',
  },
  navbarInner: {
    maxWidth: 1320,
    margin: '0 auto',
    padding: '0 14px',
    height: 68,
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifySelf: 'start',
    gap: 8,
    cursor: 'pointer',
    textDecoration: 'none',
    flexShrink: 0,
    outline: 'none',
  },
  logo: {
    height: 26,
    objectFit: 'contain',
    display: 'block',
  },
  brandText: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontWeight: 900,
    fontSize: 13,
    color: '#091925',
    letterSpacing: '-0.25px',
  },
  brandTag: {
    fontSize: 10,
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: 8,
    background: 'rgba(46,171,254,0.12)',
    border: '1px solid rgba(46,171,254,0.25)',
    color: '#2EABFE',
  },

  // Desktop Navigation
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    justifySelf: 'center',
    gap: 2,
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    padding: '0 2px',
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 8px',
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 11,
    color: 'rgba(9,25,37,0.66)',
    transition: 'all .15s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  navLinkActive: {
    background: 'linear-gradient(180deg, rgba(46,171,254,0.16) 0%, rgba(46,171,254,0.10) 100%)',
    color: '#091925',
    border: '1px solid rgba(46,171,254,0.26)',
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    justifySelf: 'end',
    justifyContent: 'flex-end',
    gap: 6,
    minWidth: 0,
    maxWidth: '100%',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 160px',
    minWidth: 90,
    maxWidth: 320,
  },

  // Desktop User Actions
  userActionsDesktop: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  userBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 9px',
    borderRadius: 11,
    border: '1px solid rgba(2,8,23,0.10)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all .15s',
    whiteSpace: 'nowrap',
    maxWidth: 115,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: 'rgba(46,171,254,0.10)',
    border: '1px solid rgba(46,171,254,0.20)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  userName: {
    fontWeight: 800,
    fontSize: 11,
    color: 'rgba(9,25,37,0.80)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid rgba(2,8,23,0.10)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    color: 'rgba(9,25,37,0.65)',
    transition: 'all .15s',
    padding: 0,
  },

  // Mobile Menu Toggle
  mobileMenuToggle: {
    display: 'none',
    width: 42,
    height: 42,
    borderRadius: 12,
    border: '1px solid rgba(2,8,23,0.10)',
    background: '#fff',
    cursor: 'pointer',
    placeItems: 'center',
    color: '#091925',
    transition: 'all .15s',
    padding: 0,
  },

  // Mobile Menu
  mobileMenuBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(9,25,37,0.40)',
    backdropFilter: 'blur(4px)',
  },
  mobileMenuContainer: {
    position: 'fixed',
    top: 72,
    right: 0,
    zIndex: 201,
    width: '100%',
    maxWidth: 320,
    height: 'calc(100vh - 72px)',
    background: '#fff',
    borderLeft: '1px solid rgba(2,8,23,0.08)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s ease-out',
  },
  mobileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid rgba(2,8,23,0.08)',
  },
  mobileMenuTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: '#091925',
    margin: 0,
  },
  mobileMenuCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    background: 'rgba(2,8,23,0.05)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#091925',
    transition: 'all .15s',
    padding: 0,
  },
  mobileNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px',
    overflow: 'auto',
    flex: 1,
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    color: 'rgba(9,25,37,0.70)',
    transition: 'all .15s',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  mobileNavLinkActive: {
    background: 'rgba(46,171,254,0.10)',
    color: '#091925',
    border: '1px solid rgba(46,171,254,0.20)',
  },
  mobileMenuDivider: {
    height: '1px',
    background: 'rgba(2,8,23,0.08)',
    margin: '8px 0',
  },
  mobileMenuFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px',
    borderTop: '1px solid rgba(2,8,23,0.08)',
  },
  mobileProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(2,8,23,0.10)',
    background: '#f9fafb',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    color: '#091925',
    transition: 'all .15s',
    fontFamily: 'inherit',
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'rgba(239,68,68,0.08)',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    color: 'rgba(185,28,28,1)',
    transition: 'all .15s',
    fontFamily: 'inherit',
  },

  // Dialog Styles
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    background: 'rgba(9,25,37,0.55)',
    backdropFilter: 'blur(5px)',
  },
  dialog: {
    position: 'fixed',
    zIndex: 301,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '100%',
    maxWidth: 360,
    background: '#fff',
    borderRadius: 22,
    padding: '32px 28px 26px',
    boxShadow: '0 28px 70px rgba(9,25,37,0.20)',
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.18)',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 950,
    color: 'rgba(11,18,32,0.88)',
    marginBottom: 8,
  },
  dialogSub: {
    fontSize: 13,
    color: 'rgba(11,18,32,0.52)',
    marginBottom: 24,
  },
  dialogBtns: {
    display: 'flex',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    background: 'rgba(2,8,23,0.04)',
    border: '1px solid rgba(2,8,23,0.10)',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 900,
    color: 'rgba(11,18,32,0.72)',
    fontFamily: 'inherit',
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    background: 'rgba(220,38,38,0.90)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 900,
    color: '#fff',
    fontFamily: 'inherit',
  },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }

.rs-navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(46,171,254,0.06) 0%, rgba(255,255,255,0) 45%, rgba(46,171,254,0.05) 100%);
}

.rs-desktop-nav::-webkit-scrollbar {
  display: none;
}

.rs-desktop-nav {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
}

.rs-nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
}

.rs-search-wrap {
  flex: 1 1 160px;
  min-width: 90px;
  max-width: 320px;
  width: auto;
}

.rs-search-wrap > * {
  width: 100%;
}

.rs-user-actions {
  flex-shrink: 0;
}

.rs-nav-link:hover {
  background: rgba(2,8,23,0.05) !important;
  color: #091925 !important;
}

.rs-user-btn:hover,
.rs-logout-btn:hover,
.rs-mobile-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(2,8,23,0.10);
  background: #fff !important;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1460px) {
  .rs-navbar-inner {
    gap: 6px !important;
  }
}

@media (max-width: 1360px) {
  .rs-brandText {
    display: none;
  }
}

@media (max-width: 1200px) {
  .rs-navbar-inner {
    padding: 0 14px !important;
    gap: 6px !important;
  }

  .rs-nav-link {
    padding: 5px 7px !important;
    font-size: 10px !important;
  }

  .rs-nav-right {
    gap: 4px;
  }

  .rs-search-wrap {
    min-width: 72px !important;
  }
}

@media (max-width: 1024px) {
  .rs-desktop-nav,
  .rs-user-actions,
  .rs-search-wrap {
    display: none !important;
  }

  .rs-mobile-toggle {
    display: grid !important;
  }

  .rs-navbar-inner {
    height: 64px !important;
  }

  .rs-mobile-menu-container {
    top: 64px !important;
    height: calc(100vh - 64px) !important;
  }
}

@media (max-width: 768px) {
  .rs-navbar-inner {
    padding: 0 12px !important;
    gap: 10px !important;
    height: 60px !important;
  }

  .rs-brand img {
    height: 26px !important;
  }

  .rs-brand span {
    font-size: 13px !important;
  }

  .rs-mobile-menu-container {
    top: 60px !important;
    height: calc(100vh - 60px) !important;
  }
}

/* Focus states for accessibility */
button:focus-visible {
  outline: 2px solid #2EABFE !important;
  outline-offset: 2px !important;
}

/* Smooth transitions */
button {
  transition: all 0.15s ease !important;
}
`;

export default Navbar;
