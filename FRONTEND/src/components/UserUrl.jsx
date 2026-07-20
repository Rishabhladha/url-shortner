import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserUrlsPaginated, deleteUrl } from '../api/user.api';
import AnalyticsModal from './AnalyticsModal';

const LinkTable = () => {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['userUrlsPaginated'],
    queryFn: ({ pageParam = 1 }) => getUserUrlsPaginated(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrlsPaginated'] });
      setDeletingId(null);
    },
    onError: (err) => {
      console.error(err);
      setDeletingId(null);
      alert('Failed to delete URL');
    }
  });

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this URL?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
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

  const urls = data?.pages.flatMap(page => page.urls) || [];
  const visible = filter
    ? urls.filter(u => u.full_url.toLowerCase().includes(filter.toLowerCase()) || u.short_url.toLowerCase().includes(filter.toLowerCase()))
    : urls;

  const totalUrls = data?.pages[0]?.total || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Your links</h2>
          <span className="pill">{totalUrls}</span>
        </div>
        {totalUrls > 0 && (
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search URLs…"
            style={{ width: 180, padding: '7px 12px', fontSize: 13, borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
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
        const isDeleting = deletingId === item._id;
        
        return (
          <div key={item._id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: idx < visible.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: isDeleting ? 0.5 : 1
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="btn-ghost"
                onClick={() => setAnalyticsUrl(item)}
                style={{ fontSize: 13, padding: '5px 10px', color: 'var(--accent)' }}
              >
                📊 Analytics
              </button>
              <button
                className="btn-ghost"
                onClick={() => copy(shortFull, item._id)}
                style={{ fontSize: 13, padding: '5px 10px', color: isCopied ? 'var(--ok)' : 'var(--text-muted)' }}
              >
                {isCopied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                className="btn-ghost"
                onClick={() => handleDelete(item._id)}
                disabled={isDeleting}
                style={{ fontSize: 13, padding: '5px 10px', color: 'var(--error)' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        );
      })}

      {/* Infinite Scroll / Load More */}
      {hasNextPage && !filter && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Analytics Modal */}
      <AnalyticsModal 
        isOpen={!!analyticsUrl} 
        onClose={() => setAnalyticsUrl(null)} 
        url={analyticsUrl} 
      />
    </div>
  );
};

export default LinkTable;