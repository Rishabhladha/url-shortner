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
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="SnapURL Logo" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            SnapURL
          </span>
        </Link>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Dashboard
              </Link>
              <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button className="btn-ghost" onClick={handleLogout} style={{ fontSize: 13 }}>
                Sign out
              </button>
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