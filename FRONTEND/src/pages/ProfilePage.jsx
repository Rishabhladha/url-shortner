import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { updateProfile, changePassword, deleteAccount } from '../api/user.api';
import { login, logout } from '../store/slice/authSlice';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile states
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Danger states
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const { user: updatedUser } = await updateProfile(name);
      dispatch(login(updatedUser)); // Update redux state with new name
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setSecurityMsg('New passwords do not match');
    }
    setSecurityLoading(true);
    setSecurityMsg('');
    try {
      await changePassword(currentPassword, newPassword);
      setSecurityMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityMsg(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("WARNING: This will permanently delete your account and all your URLs. This action cannot be undone. Are you sure?")) {
      setDeleteLoading(true);
      try {
        await deleteAccount();
        dispatch(logout());
        navigate({ to: '/' });
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete account');
        setDeleteLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Account Settings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <img src={user?.avatar} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%' }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{user?.email}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joined {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-dim)' }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                required
              />
            </div>
            
            {profileMsg && (
              <p style={{ fontSize: 13, color: profileMsg.includes('success') ? 'var(--ok)' : 'var(--error)' }}>
                {profileMsg}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={profileLoading} style={{ alignSelf: 'flex-start' }}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-dim)' }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-dim)' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text-dim)' }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              required
            />
          </div>

          {securityMsg && (
            <p style={{ fontSize: 13, color: securityMsg.includes('success') ? 'var(--ok)' : 'var(--error)' }}>
              {securityMsg}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={securityLoading} style={{ alignSelf: 'flex-start' }}>
            {securityLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      {activeTab === 'danger' && (
        <div style={{ padding: 24, border: '1px solid var(--error)', borderRadius: 12, background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--error)', marginBottom: 8 }}>Delete Account</h3>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 20 }}>
            Once you delete your account, there is no going back. Please be certain.
            All your shortened URLs and analytics will be permanently deleted.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--error)',
              color: 'white',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
