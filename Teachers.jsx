import React, { useEffect, useState } from 'react';
import { db } from '../db';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', position: '', subjects: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setTeachers(await db.getTeachers()); } catch (e) {}
    setLoading(false);
  }

  async function addTeacher() {
    if (!form.name.trim()) return;
    await db.addTeacher(form);
    setForm({ name: '', position: '', subjects: '', notes: '' });
    load();
  }
  function startEdit(t) { setEditingId(t.id); setEditForm({ ...t }); }
  async function saveEdit() {
    await db.updateTeacher(editingId, editForm);
    setEditingId(null);
    load();
  }
  async function removeTeacher(t) {
    if (!confirm(`Remove ${t.name} from the roster? Their PMCF records and messages stay on file.`)) return;
    await db.deleteTeacher(t.id);
    load();
  }

  return (
    <div>
      <h1 className="page-title">Teachers</h1>
      <div className="sub">Your team under Related Subjects Department - JHS. Keep context notes here so observations stay personalized.</div>

      <div className="card">
        <label>Add a teacher</label>
        <div className="grid2">
          <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Position (e.g. Teacher I)" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <input placeholder="Subject(s) taught" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} />
        </div>
        <div className="field">
          <textarea placeholder="Context / notes about this teacher (strengths, growth areas, teaching style)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn gold" onClick={addTeacher}>Add Teacher</button>
      </div>

      <div className="card">
        {loading && <div className="empty">Loading…</div>}
        {!loading && teachers.length === 0 && <div className="empty">No teachers yet. Add your first one above.</div>}
        {!loading && teachers.map(t => (
          <div className="teacher-row" key={t.id} style={{ display: 'block' }}>
            {editingId === t.id ? (
              <div>
                <div className="grid2" style={{ marginBottom: 8 }}>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  <input value={editForm.position || ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} />
                </div>
                <input style={{ marginBottom: 8 }} value={editForm.subjects || ''} onChange={e => setEditForm({ ...editForm, subjects: e.target.value })} />
                <textarea style={{ marginBottom: 8 }} value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                <div className="row-actions">
                  <button className="btn small gold" onClick={saveEdit}>Save</button>
                  <button className="btn small outline" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="teacher-name">{t.name}</span>
                  <span className="pill">{t.position || '—'}</span>
                  <span className="pill gold">{t.subjects || '—'}</span>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, maxWidth: 520 }}>
                    {t.notes || <em>No context notes yet.</em>}
                  </div>
                </div>
                <div className="row-actions">
                  <button className="btn small outline" onClick={() => startEdit(t)}>Edit</button>
                  <button className="btn small danger" onClick={() => removeTeacher(t)}>Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
