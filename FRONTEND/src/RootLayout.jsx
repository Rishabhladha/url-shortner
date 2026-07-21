import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slice/authSlice';
import { logoutUser } from './api/user.api';

const RootLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    dispatch(logout());
    navigate({ to: '/' });
  };

  const navLinkStyle = (path) => ({
    fontSize: 13,
    color: currentPath === path ? 'var(--text)' : 'var(--text-muted)',
    padding: '5px 10px',
    borderRadius: 6,
    background: currentPath === path ? 'var(--surface)' : 'transparent',
    fontWeight: currentPath === path ? 500 : 400,
    transition: 'all 0.15s',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(12,12,12,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="SnapURL Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Snap<span style={{ color: 'var(--accent)' }}>URL</span>
          </span>
        </Link>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isAuthenticated ? (
            <>
              {/* Dashboard link */}
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>

              <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
              
              {/* User dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    padding: '5px 10px 5px 6px', 
                    background: dropdownOpen ? 'var(--surface-hover)' : 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 24,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontSize: 11, fontWeight: 'bold' }}>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 8, width: 210,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column', gap: 2,
                    zIndex: 50,
                  }}>
                    {/* User info */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user?.name || 'User'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)',
                      textDecoration: 'none', borderRadius: 6, transition: 'background 0.15s'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Profile Settings
                    </Link>
                    
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13,
                      color: 'var(--error)', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'background 0.15s'
                    }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(192,82,75,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost" style={{ fontSize: 13 }}>
                Sign in
              </Link>
              <Link to="/auth" hash="register" className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Page */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} SnapURL
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Fast, simple link shortening
        </span>
      </footer>
    </div>
  );
};

export default RootLayout;