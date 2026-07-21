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
  const currentSearch = routerState.location.search;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    dispatch(logout());
    navigate({ to: '/' });
  };

  // nav link active state — currentSearch is a parsed object {tab:'analytics'}, NOT a string
  const isActive = (path, search) => {
    if (search) return currentPath === path && currentSearch?.tab === 'analytics';
    return currentPath === path && currentSearch?.tab !== 'analytics';
  };

  const NavLink = ({ to, search, children, icon }) => {
    const active = isActive(to, search);
    return (
      <Link
        to={to}
        search={search ? { tab: 'analytics' } : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 13, fontWeight: active ? 500 : 400,
          color: active ? 'var(--text)' : 'var(--text-muted)',
          padding: '5px 10px', borderRadius: 6,
          background: active ? 'var(--surface)' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.15s',
          border: '1px solid',
          borderColor: active ? 'var(--border)' : 'transparent',
        }}
        onMouseOver={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}}
        onMouseOut={e => { if (!active) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}}
      >
        {icon}
        {children}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,12,12,0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── Left: Logo + Nav links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 16 }}>
            <img src="/logo.png" alt="SnapURL" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
              Snap<span style={{ color: 'var(--accent)' }}>URL</span>
            </span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Dashboard */}
              <NavLink to="/dashboard" icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              }>
                Dashboard
              </NavLink>

              {/* Analytics */}
              <NavLink to="/dashboard" search="tab=analytics" icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }>
                Analytics
              </NavLink>
            </>
          )}
        </div>

        {/* ── Right: Auth / User dropdown ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAuthenticated ? (
            <>
              <div style={{ width: 1, height: 16, background: 'var(--border)', marginRight: 4 }} />

              {/* User dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '4px 10px 4px 5px',
                    background: dropdownOpen ? 'var(--surface-hover)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--bg)', fontSize: 10, fontWeight: 700,
                  }}>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 6, width: 200,
                    boxShadow: '0 16px 48px rgba(0,0,0,.7)',
                    zIndex: 50,
                    animation: 'fadeIn 0.12s ease',
                  }}>
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user?.name || 'User'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    </div>

                    {[
                      {
                        to: '/profile', label: 'Profile Settings',
                        icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      }
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', fontSize: 13, color: 'var(--text)',
                        textDecoration: 'none', borderRadius: 6, transition: 'background 0.12s',
                      }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        {item.icon}{item.label}
                      </Link>
                    ))}

                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 13,
                      color: 'var(--error)', background: 'transparent', border: 'none',
                      borderRadius: 6, cursor: 'pointer', transition: 'background 0.12s',
                      fontFamily: 'inherit',
                    }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(192,82,75,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <Link to="/auth" style={{ fontSize: 13, color: 'var(--text-muted)', padding: '5px 10px', textDecoration: 'none', borderRadius: 6, transition: 'color 0.15s' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                Sign in
              </Link>
              <Link to="/auth" style={{
                fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 7,
                background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} SnapURL</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fast, simple link shortening</span>
      </footer>
    </div>
  );
};

export default RootLayout;