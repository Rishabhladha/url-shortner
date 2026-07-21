import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { updateProfile, changePassword, deleteAccount } from '../api/user.api';
import { login, logout } from '../store/slice/authSlice';

// ── Small reusable input ────────────────────────────────────────────────────
const Field = ({ label, hint, ...props }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: '0.01em' }}>
      {label}
    </label>
    <input {...props} style={{
      width: '100%', padding: '10px 14px',
      borderRadius: 8, border: '1px solid var(--border)',
      background: 'var(--surface)', color: 'var(--text)',
      fontSize: 14, outline: 'none',
      transition: 'border-color 0.15s',
      fontFamily: 'inherit',
      ...props.style
    }}
    onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
    {hint && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</p>}
  </div>
);

// ── Status message ──────────────────────────────────────────────────────────
const StatusMsg = ({ msg }) => {
  if (!msg) return null;
  const isOk = msg.toLowerCase().includes('success');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '9px 12px', borderRadius: 7, fontSize: 13,
      background: isOk ? 'rgba(74,153,96,0.08)' : 'rgba(192,82,75,0.08)',
      border: `1px solid ${isOk ? 'rgba(74,153,96,0.25)' : 'rgba(192,82,75,0.25)'}`,
      color: isOk ? 'var(--ok)' : 'var(--error)',
    }}>
      <span>{isOk ? '✓' : '!'}</span>
      {msg}
    </div>
  );
};

// ── Section card wrapper ────────────────────────────────────────────────────
const Card = ({ children }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: 18,
  }}>
    {children}
  </div>
);

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Danger zone — requires typing "DELETE" to confirm
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg('');
    try {
      const { user: updatedUser } = await updateProfile(name);
      dispatch(login(updatedUser));
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setSecurityMsg('New passwords do not match');
    if (newPassword.length < 6) return setSecurityMsg('Password must be at least 6 characters');
    setSecurityLoading(true); setSecurityMsg('');
    try {
      await changePassword(currentPassword, newPassword);
      setSecurityMsg('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setSecurityMsg(err.message || 'Failed to change password');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await deleteAccount();
      dispatch(logout());
      navigate({ to: '/' });
    } catch (err) {
      alert(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    { id: 'security', label: 'Security', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    )},
    { id: 'danger', label: 'Danger Zone', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )},
  ];

  // Avatar initials
  const initials = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Account Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Manage your profile, security, and account preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer', transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            <span style={{ color: tab.id === 'danger' && activeTab === tab.id ? 'var(--error)' : 'inherit' }}>
              {tab.icon}
            </span>
            <span style={{ color: tab.id === 'danger' && activeTab === tab.id ? 'var(--error)' : 'inherit' }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar + info row */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #c87d2a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'var(--bg)',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{user?.name || 'User'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>{user?.email}</p>
                {joinDate && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>Member since {joinDate}</p>}
              </div>
            </div>
          </Card>

          {/* Edit name */}
          <Card>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Display Name</p>
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              <StatusMsg msg={profileMsg} />
              <div>
                <button type="submit" className="btn-primary" disabled={profileLoading} style={{ padding: '9px 18px', fontSize: 13 }}>
                  {profileLoading ? (
                    <><span className="spinner" style={{ borderTopColor: 'var(--bg)' }} /> Saving…</>
                  ) : 'Save changes'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === 'security' && (
        <Card>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Change Password</p>
          <form onSubmit={handleSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <div style={{ height: 1, background: 'var(--border)' }} />
            <Field label="New password" hint="At least 6 characters" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Field label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <StatusMsg msg={securityMsg} />
            <div>
              <button type="submit" className="btn-primary" disabled={securityLoading} style={{ padding: '9px 18px', fontSize: 13 }}>
                {securityLoading ? (
                  <><span className="spinner" style={{ borderTopColor: 'var(--bg)' }} /> Updating…</>
                ) : 'Update password'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* ── DANGER ZONE TAB ── */}
      {activeTab === 'danger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            border: '1px solid rgba(192,82,75,0.3)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Header strip */}
            <div style={{
              padding: '14px 20px',
              background: 'rgba(192,82,75,0.06)',
              borderBottom: '1px solid rgba(192,82,75,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)' }}>Delete Account</span>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.6 }}>
                Permanently deletes your account and <strong style={{ color: 'var(--text)' }}>all associated data</strong> — short links, analytics, and settings. This cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    marginTop: 16,
                    padding: '9px 16px', fontSize: 13,
                    background: 'transparent',
                    color: 'var(--error)',
                    border: '1px solid rgba(192,82,75,0.4)',
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(192,82,75,0.08)'; e.currentTarget.style.borderColor = 'var(--error)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(192,82,75,0.4)'; }}
                >
                  I want to delete my account
                </button>
              ) : (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'rgba(192,82,75,0.06)', border: '1px solid rgba(192,82,75,0.15)',
                    fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5,
                  }}>
                    To confirm, type <code style={{ fontFamily: 'monospace', color: 'var(--error)', background: 'rgba(192,82,75,0.1)', padding: '1px 5px', borderRadius: 3 }}>DELETE</code> in the box below.
                  </div>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    style={{
                      width: '100%', padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(192,82,75,0.35)',
                      background: 'rgba(192,82,75,0.04)',
                      color: 'var(--text)', fontSize: 14, outline: 'none',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--error)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(192,82,75,0.35)'}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                      style={{
                        padding: '9px 18px', fontSize: 13,
                        background: deleteConfirmText === 'DELETE' ? 'var(--error)' : 'rgba(192,82,75,0.3)',
                        color: 'white', border: 'none', borderRadius: 8,
                        cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', fontWeight: 500,
                        transition: 'all 0.15s',
                        opacity: deleteLoading ? 0.6 : 1,
                      }}
                    >
                      {deleteLoading ? 'Deleting…' : 'Delete my account'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                      style={{
                        padding: '9px 16px', fontSize: 13,
                        background: 'transparent', color: 'var(--text-muted)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
