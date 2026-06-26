import React, { useEffect, useState } from 'react';
import { db } from '../db';

export default function Team() {
  const [profiles, setProfiles] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const [p, t] = await Promise.all([db.getTeamProfiles(), db.getTeachers()]);
      setProfiles(p);
      setTeachers(t);
    } catch (e) {
      console.error('Team Access load error:', e);
      setLoadError(e.message || 'Could not load team data.');
    }
    setLoading(false);
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({ name: p.name || '', role: p.role || 'teacher', teacherId: p.teacher_id || '' });
  }
  async function saveEdit() {
    await db.updateProfile(editingId, editForm);
    setEditingId(null);
    load();
  }

  return (
    <div>
      <h1 className="page-title">Team Access</h1>
      <div className="sub">Manage who can log in and what they can see.</div>

      <div className="banner">
        <strong>To add a new teacher's login:</strong> go to your Supabase project → Authentication → Users → "Add user", enter their email and a temporary password, then come back here to link that login to their teacher profile and name below.
      </div>

      <div className="card">
        {loadError && <div className="banner" style={{ background: '#f5e7e6', color: 'var(--danger)' }}>Could not load team data: {loadError}</div>}
        {loading && <div className="empty">Loading…</div>}
        {!loading && profiles.length === 0 && <div className="empty">No logins yet.</div>}
        {!loading && profiles.map(p => (
          <div className="teacher-row" key={p.id} style={{ display: 'block' }}>
            {editingId === p.id ? (
              <div>
                <div className="grid2" style={{ marginBottom: 8 }}>
                  <input placeholder="Display name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="teacher">Teacher</option>
                    <option value="master">Master Teacher</option>
                    <option value="principal">Principal (read-only, all teams)</option>
                  </select>
                </div>
                <select value={editForm.teacherId} onChange={e => setEditForm({ ...editForm, teacherId: e.target.value })} style={{ marginBottom: 8 }}>
                  <option value="">— Not linked to a teacher profile —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="row-actions">
                  <button className="btn small gold" onClick={saveEdit}>Save</button>
                  <button className="btn small outline" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="teacher-name">{p.name || p.email}</span>
                  <span className="pill">{p.role}</span>
                  <span className="pill gold">{p.teachers?.name || 'not linked'}</span>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{p.email}</div>
                </div>
                <button className="btn small outline" onClick={() => startEdit(p)}>Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="note">Password resets: ask the teacher to use "Forgot password" on the login screen, or reset it yourself from Supabase → Authentication → Users.</div>
    </div>
  );
}
