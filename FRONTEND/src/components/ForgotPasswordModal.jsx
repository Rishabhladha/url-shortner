import React, { useState } from 'react';
import { sendForgotPasswordOtp, resetPassword } from '../api/user.api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await sendForgotPasswordOtp(email);
      setStep(2);
      setMsg('OTP sent to your email');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await resetPassword(email, otp, newPassword);
      setStep(3);
      setMsg('Password reset successfully');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24
    }}>
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 16, width: '100%', maxWidth: 400, padding: 24,
        position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
      }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}
        >
          ×
        </button>

        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Success'}
        </h3>
        
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          {step === 1 && 'Enter your email to receive a reset OTP.'}
          {step === 2 && 'Enter the 6-digit OTP sent to your email.'}
          {step === 3 && 'Your password has been reset.'}
        </p>

        {msg && (
          <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: step === 3 || msg.includes('OTP sent') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: step === 3 || msg.includes('OTP sent') ? 'var(--ok)' : 'var(--error)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
