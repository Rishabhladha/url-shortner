import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px - 53px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {isLogin ? 'Sign in to manage your links' : 'Start shortening links with custom slugs'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '24px',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 2, background: 'var(--bg)',
            borderRadius: 8, padding: 3, marginBottom: 20,
          }}>
            {['Sign in', 'Register'].map((label, i) => {
              const active = isLogin ? i === 0 : i === 1;
              return (
                <button key={label} type="button"
                  onClick={() => setIsLogin(i === 0)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 6, border: 'none',
                    background: active ? 'var(--surface-hover)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    cursor: 'pointer', transition: 'all 150ms ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {isLogin
            ? <LoginForm onSwitch={() => setIsLogin(false)} />
            : <RegisterForm onSwitch={() => setIsLogin(true)} />
          }
        </div>

      </div>
    </div>
  );
};

export default AuthPage;