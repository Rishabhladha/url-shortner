import React from 'react';
import UrlForm from '../components/UrlForm';
import { Link } from '@tanstack/react-router';
import { useSelector } from 'react-redux';

const FEATURES = [
  { label: 'Custom slugs', sub: 'Brand your links' },
  { label: 'Click tracking', sub: 'Real-time analytics' },
  { label: 'Instant redirect', sub: 'No delay, no friction' },
];

const HomePage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px - 53px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px 80px',
    }}>
      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 300,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Long URLs,{' '}
            <span style={{ color: 'var(--accent)' }}>made short.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1.6 }}>
            Paste any link. Get a short one. Track clicks.
          </p>
        </div>

        {/* Shortener */}
        <UrlForm />

        {/* Subtle divider */}
        <div style={{ margin: '48px 0 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {isAuthenticated ? 'Signed in — all features unlocked' : 'Sign in for more features'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{f.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA for guests */}
        {!isAuthenticated && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link to="/auth" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Create a free account →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;