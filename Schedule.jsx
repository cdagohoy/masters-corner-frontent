import React, { useEffect, useState } from 'react';
import { db } from '../db';

export default function Schedule({ onCreated }) {
  const [teachers, setTeachers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ teacherId: '', categoryId: '', observationDate: '', observationTime: '', grade: '', section: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db.getTeachers().then(setTeachers).catch(() => {});
    db.getCategories().then(cats => { setCategories(cats); if (cats[0]) setForm(f => ({ ...f, categoryId: cats[0].id })); }).catch(() => {});
  }, []);

  useEffect(() => { if (teachers[0] && !form.teacherId) setForm(f => ({ ...f, teacherId: teachers[0].id })); }, [teachers]);

  async function start() {
    if (!form.teacherId) { alert('Add a teacher first under the Teachers tab.'); return; }
    setBusy(true);
    try {
      await db.createPmcf(form);
      onCreated && onCreated();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Observe a Teacher / Fill Out PMCF</h1>
      <div className="sub">Select the teacher, date, section, and target category, then log critical incidents as you observe.</div>
      <div className="card">
        <div className="grid2">
          <div className="field">
            <label>Teacher</label>
            <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Target Category / Objective</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.text.slice(0, 70)}{c.text.length > 70 ? '…' : ''}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Date of Observation</label>
            <input type="date" value={form.observationDate} onChange={e => setForm({ ...form, observationDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={form.observationTime} onChange={e => setForm({ ...form, observationTime: e.target.value })} />
          </div>
          <div className="field">
            <label>Grade Level</label>
            <input placeholder="e.g. Grade 8" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
          </div>
          <div className="field">
            <label>Section</label>
            <input placeholder="e.g. Mahogany" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
          </div>
        </div>
        <button className="btn gold" disabled={busy} onClick={start}>{busy ? 'Starting…' : 'Start PMCF Entry'}</button>
      </div>
    </div>
  );
}
