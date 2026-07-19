import React, { useState } from 'react';
import { createShortUrl } from '../api/shortUrl.api';
import { useSelector } from 'react-redux';
import { queryClient } from '../main';

const PLACEHOLDER = 'https://example.com/very/long/path/that/nobody-wants-to-type';

const ShortenerPanel = () => {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const run = async () => {
    if (!url.trim()) { setError('URL is required'); return; }
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await createShortUrl(target, slug.trim() || undefined);
      setResult(r);
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
    } catch (e) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 640 }}>
      {/* Section label */}
      <div style={{ marginBottom: 16 }}>
        <p className="type-mono" style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          // shorten-url.js
        </p>
        <h2 className="type-h2" style={{ color: 'var(--text)' }}>New short link</h2>
      </div>

      {/* URL input */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
          target_url
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="input-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder={PLACEHOLDER}
            spellCheck={false}
          />
          <button
            className="btn btn-primary"
            onClick={run}
            disabled={loading}
            style={{ flexShrink: 0 }}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Running…' : 'Shorten'}
          </button>
        </div>
      </div>

      {/* Custom slug — authenticated only */}
      {isAuthenticated && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
            custom_slug <span style={{ color: 'var(--text-dim)', fontStyle: 'normal' }}>(optional)</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <span className="type-mono" style={{ padding: '7px 10px', color: 'var(--text-dim)', borderRight: '1px solid var(--border)', flexShrink: 0, fontSize: 12 }}>
              localhost:3000/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-link"
              spellCheck={false}
              style={{ flex: 1, padding: '7px 10px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}
            />
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          <span className="type-mono" style={{ color: 'var(--accent)' }}>→</span>
          {' '}Sign in to unlock custom slugs and click analytics.
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 12, padding: '8px 10px', background: 'var(--error-dim)', border: '1px solid color-mix(in srgb, var(--error) 25%, transparent)', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="type-mono" style={{ color: 'var(--error)', fontSize: 12 }}>✕  {error}</span>
        </div>
      )}

      {/* Result — styled as inline output block */}
      {result && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="badge badge-ok">shortened</span>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {/* Diff-style output — the signature element */}
            <div className="diff-block" style={{ border: 'none', borderRadius: 0 }}>
              <div className="diff-line diff-removed">
                <span className="diff-gutter">−</span>
                <span className="diff-content" style={{ fontSize: 12 }}>{url}</span>
              </div>
              <div className="diff-line diff-added">
                <span className="diff-gutter">+</span>
                <span className="diff-content">{result}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '7px 12px', display: 'flex', gap: 8, background: 'var(--surface)' }}>
              <button className="btn btn-primary" onClick={copy} style={{ padding: '4px 10px', fontSize: 12 }}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a href={result} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>
                Open ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortenerPanel;
