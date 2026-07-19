import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUserUrls } from '../api/user.api';

const LinkTable = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userUrls'],
    queryFn: getAllUserUrls,
    refetchInterval: 20000,
    staleTime: 0,
  });

  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('');

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
      <span className="spinner" style={{ borderTopColor: 'var(--text-dim)', borderColor: 'var(--border)' }} />
      Loading links…
    </div>
  );

  if (isError) return (
    <div style={{ padding: '14px 16px', background: 'rgba(192,82,75,0.07)', border: '1px solid rgba(192,82,75,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--error)' }}>
      Failed to load links: {error?.message}
    </div>
  );

  const urls = data?.urls || [];
  const sorted = [...urls].reverse();
  const visible = filter
    ? sorted.filter(u => u.full_url.toLowerCase().includes(filter.toLowerCase()) || u.short_url.toLowerCase().includes(filter.toLowerCase()))
    : sorted;

  const totalClicks = urls.reduce((a, u) => a + (u.clicks || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Your links</h2>
          <span className="pill">{urls.length}</span>
          {totalClicks > 0 && <span className="pill pill-accent">{totalClicks} clicks</span>}
        </div>
        {urls.length > 3 && (
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter…"
            style={{ width: 180, padding: '7px 12px', fontSize: 13 }}
          />
        )}
      </div>

      {/* Empty state */}
      {urls.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No links yet. Shorten a URL above to get started.
          </p>
        </div>
      )}

      {/* Link rows */}
      {visible.map((item, idx) => {
        const shortFull = `http://localhost:3000/${item.short_url}`;
        const isCopied = copiedId === item._id;
        return (
          <div key={item._id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: idx < visible.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            {/* Destination */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="truncate" style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 2 }} title={item.full_url}>
                {item.full_url}
              </p>
              <a href={shortFull} target="_blank" rel="noopener noreferrer"
                className="mono"
                style={{ color: 'var(--accent)', fontSize: 13 }}
              >
                {shortFull}
              </a>
            </div>

            {/* Clicks */}
            <span className="pill" style={{ flexShrink: 0 }}>
              {item.clicks || 0} {item.clicks === 1 ? 'click' : 'clicks'}
            </span>

            {/* Copy */}
            <button
              className="btn-ghost"
              onClick={() => copy(shortFull, item._id)}
              style={{ flexShrink: 0, fontSize: 13, padding: '5px 10px', color: isCopied ? 'var(--ok)' : 'var(--text-muted)' }}
            >
              {isCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default LinkTable;