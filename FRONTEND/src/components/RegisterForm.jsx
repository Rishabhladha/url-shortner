import React, { useState } from 'react';
import { registerUser } from '../api/user.api';
import { useDispatch } from 'react-redux';
import { login } from '../store/slice/authSlice';
import { useNavigate } from '@tanstack/react-router';

const RegisterForm = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) { setError('Fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const data = await registerUser(name, password, email);
      dispatch(login(data.user));
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(192, 82, 75, 0.08)', border: '1px solid rgba(192,82,75,0.25)', borderRadius: 8, fontSize: 13, color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} style={{ paddingRight: 60 }} autoComplete="new-password" />
          <button type="button" onClick={() => setShow(!show)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer'
          }}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4, width: '100%', padding: '12px', justifyContent: 'center' }}>
        {loading && <span className="spinner" style={{ borderTopColor: 'var(--bg)' }} />}
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer' }}>
          Sign in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;