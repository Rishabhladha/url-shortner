import React from 'react';
import UrlForm from '../components/UrlForm';
import UserUrl from '../components/UserUrl';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { user } = useSelector((s) => s.auth);

  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '48px 24px 80px',
    }}>

      {/* Greeting */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Shorten, manage, and track your links.
        </p>
      </div>

      {/* Shortener */}
      <div style={{ marginBottom: 48 }}>
        <UrlForm />
      </div>

      {/* Divider */}
      <hr className="divider" style={{ marginBottom: 32 }} />

      {/* Links */}
      <UserUrl />

    </div>
  );
};

export default DashboardPage;