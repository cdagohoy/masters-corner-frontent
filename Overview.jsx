import React, { useEffect, useState } from 'react';
import { db } from './db';
import PrintPreviewModal from './PrintPreviewModal.jsx';

export default function Overview() {
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [pmcfs, setPmcfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPm, setPreviewPm] = useState(null);

  useEffect(() => {
    db.getMasters().then(m => { setMasters(m); if (m[0]) setSelectedMaster(m[0].id); });
  }, []);

  useEffect(() => {
    if (!selectedMaster) return;
    load();
    // eslint-disable-next-line
  }, [selectedMaster]);

  async function load() {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([db.getTeachers(selectedMaster), db.getPmcfs(selectedMaster)]);
      setTeachers(t);
      setPmcfs(p);
    } catch (e) {}
    setLoading(false);
  }
  async function doPreview(pm) {
    const full = await db.getPmcf(pm.id);
    setPreviewPm(full);
  }

  return (
    <div>
      <h1 className="page-title">Team Overview</h1>
      <div className="sub">Read-only view across Master Teachers' teams.</div>

      <div className="field">
        <label>Viewing team led by</label>
        <select value={selectedMaster} onChange={e => setSelectedMaster(e.target.value)}>
          {masters.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
        </select>
      </div>

      <div className="card">
        <h1 className="page-title" style={{ fontSize: 18 }}>Teachers</h1>
        {loading && <div className="empty">Loading…</div>}
        {!loading && teachers.length === 0 && <div className="empty">No teachers under this team yet.</div>}
        {!loading && teachers.map(t => (
          <div className="teacher-row" key={t.id}>
            <div>
              <span className="teacher-name">{t.name}</span>
              <span className="pill">{t.position || '—'}</span>
              <span className="pill gold">{t.subjects || '—'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h1 className="page-title" style={{ fontSize: 18 }}>PMCF Records</h1>
        {!loading && pmcfs.length === 0 && <div className="empty">No PMCF entries yet for this team.</div>}
        {!loading && pmcfs.map(pm => (
          <div className="teacher-row" key={pm.id}>
            <div>
              <strong>{pm.teacher_name}</strong>{' '}
              <span className="pill">{pm.observation_date ? pm.observation_date.slice(0, 10) : 'no date'}</span>{' '}
              <span className="pill gold">{pm.status}</span>
            </div>
            <button className="btn small outline" onClick={() => doPreview(pm)}>Preview</button>
          </div>
        ))}
      </div>
      {previewPm && <PrintPreviewModal pm={previewPm} onClose={() => setPreviewPm(null)} />}
    </div>
  );
}
