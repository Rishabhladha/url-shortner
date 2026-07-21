import React from 'react';
import UrlForm from '../components/UrlForm';
import UserUrl from '../components/UserUrl';
import { useSelector } from 'react-redux';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserUrlsPaginated } from '../api/user.api';

const DashboardPage = () => {
  const { user } = useSelector((s) => s.auth);

  // Fetch first page to get total count and total clicks for stats bar
  const { data } = useInfiniteQuery({
    queryKey: ['userUrlsPaginated'],
    queryFn: ({ pageParam = 1 }) => getUserUrlsPaginated(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const allUrls = data?.pages.flatMap(p => p.urls) || [];
  const totalLinks = data?.pages[0]?.total ?? 0;
  const totalClicks = allUrls.reduce((sum, u) => sum + (u.clicks || 0), 0);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          {firstName ? `${greeting}, ${firstName}` : 'Dashboard'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Shorten, manage, and track your links.
        </p>
      </div>

      {/* Stats strip */}
      {totalLinks > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginBottom: 28,
        }}>
          <div style={{
            padding: '14px 18px', borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total links
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {totalLinks}
            </span>
          </div>
          <div style={{
            padding: '14px 18px', borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total clicks
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              {totalClicks}
            </span>
          </div>
        </div>
      )}

      {/* Shortener */}
      <div style={{ marginBottom: 36 }}>
        <UrlForm />
      </div>

      {/* Divider */}
      <hr className="divider" style={{ marginBottom: 28 }} />

      {/* Links */}
      <UserUrl />

    </div>
  );
};

export default DashboardPage;