import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slice/authSlice';
import { logoutUser } from './api/user.api';

const RootLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
              <Link to="/dashboard" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dim)', padding: '6px 12px' }}>
                Dashboard
              </Link>
              
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
              
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    padding: '6px 12px 6px 6px', 
                    background: dropdownOpen ? 'var(--surface-hover)' : 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 24,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontSize: 12, fontWeight: 'bold' }}>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 8, width: 220,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    zIndex: 50
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user?.name || 'User'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                    </div>
                    
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{
                      display: 'block', padding: '8px 12px', fontSize: 13, color: 'var(--text)',
                      textDecoration: 'none', borderRadius: 6, transition: 'background 0.2s'
                    }} onMouseOver={(e) => e.target.style.background = 'var(--surface)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                      Profile Settings
                    </Link>
                    
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13,
                      color: 'var(--error)', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s'
                    }} onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
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