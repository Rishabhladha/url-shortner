import React from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slice/authSlice';
import { logoutUser } from './api/user.api';

const RootLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    dispatch(logout());
    navigate({ to: '/' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(12,12,12,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="SnapURL Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            SnapURL
          </span>
        </Link>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/dashboard" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dim)', padding: '6px 12px' }}>
                  Dashboard
                </Link>
                <Link to="/profile" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dim)', padding: '6px 12px' }}>
                  Profile
                </Link>
              </div>
              
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
              
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                padding: '4px 6px 4px 14px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 24 
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <button className="btn-ghost" onClick={handleLogout} style={{ 
                  fontSize: 12, padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 20 
                }}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost" style={{ fontSize: 13 }}>
                Sign in
              </Link>
              <Link to="/auth" className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
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