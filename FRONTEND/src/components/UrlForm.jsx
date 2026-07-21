import React, { useState } from 'react';
import { createShortUrl } from '../api/shortUrl.api';
import { useSelector } from 'react-redux';
import { queryClient } from '../main';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!url.trim()) { setError('Paste a URL to shorten'); return; }
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await createShortUrl(target, slug.trim() || undefined);
      setResult(r);
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
      setUrl('');
      setSlug('');
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setResult(null); setError(null); };

  return (
    <div style={{ width: '100%' }}>
      
      {/* Main input form */}
      {!result ? (
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'border-color 150ms',
          }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste a long URL here…"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                padding: '14px 18px', color: 'var(--text)', fontSize: 15,
                outline: 'none', fontFamily: 'inherit',
              }}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ margin: 5, borderRadius: 8, padding: '0 20px', gap: 7, flexShrink: 0 }}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Shortening…' : 'Shorten'}
            </button>
          </div>

          {/* Custom slug — auth only */}
          {isAuthenticated && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '9px 12px 9px 14px', color: 'var(--text-muted)', fontSize: 13, borderRight: '1px solid var(--border)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {BACKEND_URL.replace(/^https?:\/\//, '')}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="custom-slug  (optional)"
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '9px 14px', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: 'var(--text)' }}
              />
            </div>
          )}

          {error && (
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--error)' }}>
              {error}
            </p>
          )}
        </form>
      ) : (
        /* Result card */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Your short link is ready</span>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a href={result} target="_blank" rel="noopener noreferrer"
              className="mono"
              style={{ flex: 1, color: 'var(--accent)', fontSize: 15, fontWeight: 500, minWidth: 0 }}
            >
              {result}
            </a>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="btn-primary" onClick={copy} style={{ padding: '8px 16px', fontSize: 13 }}>
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
              <button className="btn-secondary" onClick={reset} style={{ padding: '8px 12px', fontSize: 13 }}>
                New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;