import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUserUrls } from '../api/user.api';

const UrlTable = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userUrls'],
    queryFn: getAllUserUrls,
    refetchInterval: 15000,
    staleTime: 0,
  });
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('');

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  if (isLoading) return (
    <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="spinner" />
      <span className="type-mono" style={{ color: 'var(--text-dim)', fontSize: 12 }}>Fetching links…</span>
    </div>
  );

  if (isError) return (
    <div style={{ padding: '10px 12px', background: 'var(--error-dim)', borderBottom: '1px solid var(--border)' }}>
      <span className="type-mono" style={{ color: 'var(--error)', fontSize: 12 }}>
        Error: {error?.message || 'Failed to load URLs'}
      </span>
    </div>
  );

  const urls = data?.urls || [];
  const sorted = [...urls].reverse();
  const visible = filter
    ? sorted.filter(u => u.full_url.includes(filter) || u.short_url.includes(filter))
    : sorted;

  const totalClicks = urls.reduce((a, u) => a + (u.clicks || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Table toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, background: 'var(--surface)' }}>
        <input
          type="text"
          placeholder="Filter links…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="type-mono"
          style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text)', fontSize: 12, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <span className="badge badge-dim">{urls.length} links</span>
        <span className="badge badge-accent">{totalClicks} clicks</span>
      </div>

      {/* Empty state */}
      {urls.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p className="type-mono" style={{ color: 'var(--text-dim)', fontSize: 12 }}>
            No links yet — use the shortener to create your first one.
          </p>
        </div>
      )}

      {/* Table */}
      {urls.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="url-table">
            <thead>
              <tr>
                <th>Target URL</th>
                <th>Short link</th>
                <th style={{ width: 80, textAlign: 'center' }}>Clicks</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
                const shortFull = `${backendUrl}/${item.short_url}`;
                return (
                  <tr key={item._id}>
                    <td>
                      <span className="type-mono" style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.full_url}>
                        {item.full_url}
                      </span>
                    </td>
                    <td>
                      <a href={shortFull} target="_blank" rel="noopener noreferrer"
                        className="type-mono"
                        style={{ color: 'var(--accent)', fontSize: 12, textDecoration: 'none' }}
                        onMouseOver={e => e.target.style.textDecoration = 'underline'}
                        onMouseOut={e => e.target.style.textDecoration = 'none'}
                      >
                        {item.short_url}
                      </a>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-dim" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                        {item.clicks || 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => copy(shortFull, item._id)}
                          style={{ padding: '2px 8px', fontSize: 11 }}
                        >
                          {copiedId === item._id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UrlTable;
