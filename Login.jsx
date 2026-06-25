import React, { useState } from 'react';
import { db } from '../db';
import { supabase } from '../supabaseClient';
import { SCHOOL, DEPT } from '../App.jsx';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('login');
  const [resetSent, setResetSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await db.login(email, password);
      await onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendReset(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'reset') {
    return (
      <div className="login-screen">
        <form className="login-card" onSubmit={sendReset}>
          <div className="leafmark">M</div>
          <div className="mark">Reset Password</div>
          <div className="school">{SCHOOL}<br />{DEPT}</div>
          {resetSent ? (
            <div className="note" style={{ marginBottom: 16 }}>Check your email for a password reset link.</div>
          ) : (
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu.ph" required />
            </div>
          )}
          {error && <div className="err">{error}</div>}
          {!resetSent && <button className="btn gold" style={{ width: '100%' }} disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>}
          <div className="toggle-link" onClick={() => { setMode('login'); setResetSent(false); setError(''); }}>← Back to login</div>
        </form>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="leafmark">M</div>
        <div className="mark">The Master's Corner</div>
        <div className="school">{SCHOOL}<br />{DEPT}</div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu.ph" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <div className="err">{error}</div>}
        <button className="btn gold" style={{ width: '100%' }} disabled={busy}>{busy ? 'Logging in…' : 'Log In'}</button>
        <div className="toggle-link" onClick={() => setMode('reset')}>Forgot your password?</div>
        <div className="note">New team members get their login created by the Master Teacher. If you don't have one yet, ask them.</div>
      </form>
    </div>
  );
}
