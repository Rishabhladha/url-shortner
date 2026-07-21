import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserUrlsPaginated, deleteUrl } from '../api/user.api';
import AnalyticsModal from '../components/AnalyticsModal';
import UrlForm from '../components/UrlForm';

/* ─── Tiny icon helpers ─── */
const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const IconBar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/* ─── Analytics Overview Panel (shown in Analytics tab) ─── */
const AnalyticsOverview = ({ urls }) => {
  const [analyticsUrl, setAnalyticsUrl] = useState(null);

  if (urls.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No links yet. Create a link to see analytics.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {urls.map((item) => {
          const shortFull = `${BACKEND_URL}/${item.short_url}`;
          const clickPct = urls.length > 0 ? ((item.clicks || 0) / Math.max(...urls.map(u => u.clicks || 0), 1)) * 100 : 0;
          return (
            <div
              key={item._id}
              onClick={() => setAnalyticsUrl(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--surface)',
                cursor: 'pointer', transition: 'all 0.15s',
                marginBottom: 8,
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
            >
              {/* Click bar accent */}
              <div style={{
                width: 3, height: 36, borderRadius: 2,
                background: `linear-gradient(to bottom, var(--accent), transparent)`,
                opacity: Math.max(clickPct / 100, 0.15),
                flexShrink: 0,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'monospace', margin: 0, marginBottom: 2 }}>
                  /{item.short_url}
                </p>
                <p className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }} title={item.full_url}>
                  {item.full_url}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
                  {item.clicks || 0}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>clicks</p>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          );
        })}
      </div>

      <AnalyticsModal
        isOpen={!!analyticsUrl}
        onClose={() => setAnalyticsUrl(null)}
        url={analyticsUrl}
      />
    </>
  );
};

/* ─── Links List ─── */
const LinksList = ({ urls, totalUrls, hasNextPage, isFetchingNextPage, fetchNextPage, filter, setFilter }) => {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrlsPaginated'] });
      setDeletingId(null);
    },
    onError: () => { setDeletingId(null); },
  });

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this link?')) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  if (urls.length === 0 && !filter) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>No links yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Shorten a URL above to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Search bar */}
      {totalUrls > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search links…"
            style={{
              width: '100%', padding: '9px 12px 9px 32px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)',
              fontSize: 13, outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      )}

      {/* Link rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {urls.map((item) => {
          const shortFull = `${BACKEND_URL}/${item.short_url}`;
          const isCopied = copiedId === item._id;
          const isDeleting = deletingId === item._id;

          return (
            <div key={item._id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface)',
              opacity: isDeleting ? 0.4 : 1,
              transition: 'all 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* URLs */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={shortFull} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', fontSize: 13, color: 'var(--accent)',
                  fontFamily: 'monospace', marginBottom: 3, textDecoration: 'none',
                }}
                  onMouseOver={e => e.target.style.textDecoration = 'underline'}
                  onMouseOut={e => e.target.style.textDecoration = 'none'}
                >
                  /{item.short_url}
                </a>
                <p className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }} title={item.full_url}>
                  {item.full_url}
                </p>
              </div>

              {/* Click count */}
              <div style={{
                flexShrink: 0, textAlign: 'center',
                padding: '4px 10px', borderRadius: 6,
                background: 'transparent',
                border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', margin: 0, letterSpacing: '-0.01em' }}>
                  {item.clicks || 0}
                </p>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>clicks</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => copy(shortFull, item._id)}
                  title="Copy"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px', borderRadius: 6, border: '1px solid transparent',
                    background: isCopied ? 'rgba(74,153,96,0.1)' : 'transparent',
                    color: isCopied ? 'var(--ok)' : 'var(--text-muted)',
                    borderColor: isCopied ? 'rgba(74,153,96,0.25)' : 'transparent',
                    cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                    transition: 'all 0.12s',
                  }}
                  onMouseOver={e => { if (!isCopied) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}}
                  onMouseOut={e => { if (!isCopied) { e.currentTarget.style.background = isCopied ? 'rgba(74,153,96,0.1)' : 'transparent'; e.currentTarget.style.color = isCopied ? 'var(--ok)' : 'var(--text-muted)'; }}}
                >
                  {isCopied ? <IconCheck /> : <IconCopy />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={isDeleting}
                  title="Delete"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px', borderRadius: 6, border: '1px solid transparent',
                    background: 'transparent', color: 'var(--text-muted)',
                    cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit',
                    transition: 'all 0.12s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(192,82,75,0.1)'; e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'rgba(192,82,75,0.2)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <IconTrash />
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasNextPage && !filter && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              padding: '8px 20px', fontSize: 13, borderRadius: 7,
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

    </>
  );
};

/* ══════════════════════════════════════════
   MAIN DASHBOARD PAGE
══════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const activeTab = search?.tab === 'analytics' ? 'analytics' : 'links';
  const [filter, setFilter] = useState('');

  const {
    data, isLoading, isError,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['userUrlsPaginated'],
    queryFn: ({ pageParam = 1 }) => getUserUrlsPaginated(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const allUrls = data?.pages.flatMap(p => p.urls) || [];
  const totalLinks = data?.pages[0]?.total ?? 0;
  const totalClicks = allUrls.reduce((s, u) => s + (u.clicks || 0), 0);
  const topLink = [...allUrls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  const visibleUrls = filter
    ? allUrls.filter(u => u.full_url.toLowerCase().includes(filter.toLowerCase()) || u.short_url.toLowerCase().includes(filter.toLowerCase()))
    : allUrls;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || null;

  const setTab = (tab) => {
    navigate({ to: '/dashboard', search: tab === 'analytics' ? { tab: 'analytics' } : {} });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 24px 80px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 3 }}>
          {firstName ? `${greeting}, ${firstName}` : 'Dashboard'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Shorten, manage, and track your links.
        </p>
      </div>

      {/* ── Stats row ── */}
      {totalLinks > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Total links', value: totalLinks, color: 'var(--text)' },
            { label: 'Total clicks', value: totalClicks, color: 'var(--accent)' },
            { label: 'Top link', value: topLink ? `/${topLink.short_url}` : '—', color: 'var(--ok)', mono: true },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '14px 16px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              transition: 'border-color 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                {stat.label}
              </p>
              <p style={{
                fontSize: stat.mono ? 13 : 22, fontWeight: 700, color: stat.color,
                margin: 0, letterSpacing: stat.mono ? 0 : '-0.02em',
                fontFamily: stat.mono ? 'monospace' : 'inherit',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── URL Shortener form ── */}
      <div style={{ marginBottom: 28 }}>
        <UrlForm />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { id: 'links', label: 'Your links', count: totalLinks, icon: <IconLink /> },
          { id: 'analytics', label: 'Analytics', icon: <IconBar /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 100,
                background: activeTab === tab.id ? 'rgba(233,168,76,0.15)' : 'var(--surface)',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'rgba(233,168,76,0.25)' : 'var(--border)',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          <span className="spinner" style={{ borderTopColor: 'var(--text-dim)', borderColor: 'var(--border)' }} />
          Loading…
        </div>
      ) : isError ? (
        <div style={{ padding: '14px 16px', background: 'rgba(192,82,75,0.07)', border: '1px solid rgba(192,82,75,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--error)' }}>
          Failed to load links.
        </div>
      ) : activeTab === 'links' ? (
        <LinksList
          urls={visibleUrls}
          totalUrls={totalLinks}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          filter={filter}
          setFilter={setFilter}
        />
      ) : (
        <AnalyticsOverview urls={allUrls} />
      )}
    </div>
  );
};

export default DashboardPage;