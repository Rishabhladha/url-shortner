import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slice/authSlice';
import { logoutUser } from '../api/user.api';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate({ to: '/' });
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(logout());
      navigate({ to: '/' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="SnapURL Logo" className="w-9 h-9 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                Snap<span className="text-yellow-400">URL</span>
              </span>
            </Link>
          </div>

          {/* Navigation Items & Auth Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
            >
              Shortener
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <div className="h-4 w-px bg-slate-800" />

                {/* User Info Pill */}
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-200">{user?.name || user?.email || 'User'}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/15"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;