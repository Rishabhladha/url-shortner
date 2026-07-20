import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api/user.api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

/* ── Palette (matches the app's dark aesthetic) ── */
const CHART_COLORS = ['#E9A84C', '#4A9960', '#6B8AFF', '#C0524B', '#A78BFA', '#F472B6', '#34D399', '#FBBF24'];
const ACCENT = '#E9A84C';

/* ── Tiny helper: country code → flag emoji ── */
const flag = (cc) => {
  if (!cc || cc === 'Unknown') return '🌐';
  try {
    return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
  } catch { return '🌐'; }
};

/* ── Custom Recharts Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1A1A1A', border: '1px solid #333', borderRadius: 8,
      padding: '8px 12px', fontSize: 12, color: '#F0EEE9',
      boxShadow: '0 8px 32px rgba(0,0,0,.5)',
    }}>
      <p style={{ color: '#999', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 600 }}>{payload[0].value} clicks</p>
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, icon }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'border-color 200ms',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
  >
    <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
      {icon} {label}
    </span>
    <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  </div>
);

/* ── Horizontal Bar (for lists) ── */
const HorizontalBar = ({ items, total }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {items.map((item, i) => {
      const pct = total > 0 ? (item.count / total) * 100 : 0;
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 120, fontSize: 12, color: 'var(--text)', fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {item._id || 'Unknown'}
          </span>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.max(pct, 2)}%`, height: '100%', borderRadius: 3,
              background: CHART_COLORS[i % CHART_COLORS.length],
              transition: 'width 600ms cubic-bezier(.22,1,.36,1)',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 36, textAlign: 'right', fontFamily: "'SF Mono','Fira Code',monospace" }}>
            {item.count}
          </span>
        </div>
      );
    })}
    {items.length === 0 && (
      <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
        No data yet
      </p>
    )}
  </div>
);

/* ── Tab Button ── */
const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 14px', fontSize: 12, fontWeight: active ? 500 : 400, borderRadius: 6,
      background: active ? 'var(--surface-hover)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-muted)',
      border: active ? '1px solid var(--border)' : '1px solid transparent',
      cursor: 'pointer', transition: 'all 150ms',
    }}
  >
    {label}
  </button>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
const AnalyticsModal = ({ isOpen, onClose, url }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      setClosing(false);
      setActiveTab('overview');
      fetchAnalytics();
    }
  }, [isOpen, url]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics(url._id);
      setData(res);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const topCountries = data?.clicksByCountry || [];
  const total = data?.totalClicks || 0;

  return (
    /* Overlay */
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        opacity: closing ? 0 : 1,
        transition: 'opacity 200ms ease',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 820, maxHeight: '90vh',
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transform: closing ? 'scale(.97) translateY(8px)' : 'scale(1) translateY(0)',
          opacity: closing ? 0 : 1,
          transition: 'transform 200ms ease, opacity 200ms ease',
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Link Analytics
              </h2>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'SF Mono','Fira Code',monospace", margin: 0 }}>
                /{url.short_url}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, width: 28, height: 28, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>
        </div>

        {/* ── TAB BAR ── */}
        <div style={{
          padding: '8px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 4, flexShrink: 0, background: 'var(--surface)',
        }}>
          <TabButton active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'geo'} label="Geography" onClick={() => setActiveTab('geo')} />
          <TabButton active={activeTab === 'devices'} label="Devices" onClick={() => setActiveTab('devices')} />
          <TabButton active={activeTab === 'activity'} label="Activity" onClick={() => setActiveTab('activity')} />
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
              <span className="spinner" style={{ width: 20, height: 20, borderTopColor: 'var(--accent)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading analytics…</span>
            </div>
          ) : data ? (
            <>
              {/* ───── OVERVIEW TAB ───── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Stat Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                    <StatCard label="Total Clicks" value={data.totalClicks} icon="🖱️" />
                    <StatCard label="Unique Visitors" value={data.uniqueVisitors || 0} icon="👤" />
                    <StatCard label="Countries" value={topCountries.length} icon="🌍" />
                    <StatCard label="Top Source" value={topCountries[0]?._id || '—'} icon="📍" />
                  </div>

                  {/* Clicks Over Time (Area chart) */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '16px 16px 8px', 
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // clicks_over_time (30d)
                    </p>
                    {data.clicksByDate.length > 0 ? (
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.clicksByDate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }}
                              tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: ACCENT, stroke: '#0C0C0C', strokeWidth: 2 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                        No click data in the last 30 days
                      </p>
                    )}
                  </div>

                  {/* Quick country summary */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // top_countries
                    </p>
                    <HorizontalBar items={topCountries.map(c => ({ ...c, _id: `${flag(c._id)} ${c._id}` }))} total={total} />
                  </div>
                </div>
              )}

              {/* ───── GEOGRAPHY TAB ───── */}
              {activeTab === 'geo' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Countries */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // countries
                    </p>
                    {topCountries.length > 0 ? (
                      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={topCountries}
                              dataKey="count"
                              nameKey="_id"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              strokeWidth={2}
                              stroke="#0C0C0C"
                              label={({ _id, percent }) => `${flag(_id)} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: '#444', strokeWidth: 1 }}
                            >
                              {topCountries.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 12 }}>No country data</p>
                    )}
                  </div>

                  {/* Cities */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // cities
                    </p>
                    <HorizontalBar items={data.clicksByCity} total={total} />
                  </div>
                </div>
              )}

              {/* ───── DEVICES TAB ───── */}
              {activeTab === 'devices' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Browsers */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // browsers
                    </p>
                    {data.clicksByBrowser.length > 0 ? (
                      <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.clicksByBrowser} layout="vertical" margin={{ left: 0, right: 10 }}>
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                            <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} width={80} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                            <Bar dataKey="count" fill="#6B8AFF" radius={[0, 4, 4, 0]} barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 12 }}>No browser data</p>
                    )}
                  </div>

                  {/* OS */}
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                      // operating_systems
                    </p>
                    <HorizontalBar items={data.clicksByOS || []} total={total} />
                  </div>
                </div>
              )}

              {/* ───── ACTIVITY TAB ───── */}
              {activeTab === 'activity' && (
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 16,
                }}>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                    // recent_clicks
                  </p>
                  {(data.recentClicks || []).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Table header */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr',
                        padding: '6px 0', borderBottom: '1px solid var(--border)', marginBottom: 4,
                      }}>
                        {['Country', 'City', 'Browser', 'OS', 'Time'].map(h => (
                          <span key={h} style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                            {h}
                          </span>
                        ))}
                      </div>
                      {/* Rows */}
                      {data.recentClicks.map((click, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr',
                            padding: '8px 0', borderBottom: '1px solid var(--border)',
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: 12, color: 'var(--text)' }}>{flag(click.country)} {click.country}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{click.city}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{click.browser}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{click.os}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                            {new Date(click.timestamp).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
                      No clicks recorded yet
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--error)', padding: '40px 0' }}>
              Failed to load analytics
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
