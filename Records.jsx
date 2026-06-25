import React, { useEffect, useState } from 'react';
import { db } from '../db';
import { printPmcf } from '../printUtil';

export default function Records() {
  const [pmcfs, setPmcfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setPmcfs(await db.getPmcfs()); } catch (e) {}
    setLoading(false);
  }

  async function remove(pm) {
    if (!confirm('Delete this PMCF record?')) return;
    await db.deletePmcf(pm.id);
    load();
  }
  async function doPrint(pm) {
    const full = await db.getPmcf(pm.id);
    printPmcf(full);
  }

  if (openId) return <PmcfEditor id={openId} onBack={() => { setOpenId(null); load(); }} />;

  return (
    <div>
      <h1 className="page-title">PMCF Records</h1>
      <div className="sub">All observation records across your team.</div>
      {loading && <div className="empty">Loading…</div>}
      {!loading && pmcfs.length === 0 && <div className="empty">No PMCF entries yet. Go to "Observe / PMCF" to start one.</div>}
      {!loading && pmcfs.map(pm => (
        <div className="card" key={pm.id}>
          <div className="toolbar">
            <div>
              <strong>{pm.teacher_name || 'Unknown teacher'}</strong>{' '}
              <span className="pill">{pm.observation_date ? pm.observation_date.slice(0, 10) : 'no date'}</span>{' '}
              <span className="pill">{pm.grade} {pm.section}</span>{' '}
              <span className="pill gold">{pm.status}</span>
            </div>
            <div className="row-actions">
              <button className="btn small outline" onClick={() => setOpenId(pm.id)}>Open</button>
              <button className="btn small gold" onClick={() => doPrint(pm)}>Print</button>
              <button className="btn small danger" onClick={() => remove(pm)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PmcfEditor({ id, onBack }) {
  const [pm, setPm] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    db.getPmcf(id).then(setPm);
    db.getCategories().then(setCategories);
  }, [id]);

  if (!pm) return <div className="empty">Loading…</div>;

  async function saveMeta() {
    await db.updatePmcf(id, {
      grade: pm.grade, section: pm.section, observationTime: pm.observation_time,
      ratingPeriod: pm.rating_period, categoryId: pm.category_id, status: pm.status,
    });
    alert('Saved.');
  }
  async function toggleFinal() {
    const newStatus = pm.status === 'final' ? 'draft' : 'final';
    await db.updatePmcf(id, {
      grade: pm.grade, section: pm.section, observationTime: pm.observation_time,
      ratingPeriod: pm.rating_period, categoryId: pm.category_id, status: newStatus,
    });
    setPm({ ...pm, status: newStatus });
  }
  async function addRow() {
    const row = await db.addPmcfRow(id);
    setPm({ ...pm, rows: [...pm.rows, row] });
  }
  function updateRow(rowId, field, value) {
    setPm({ ...pm, rows: pm.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r) });
  }
  async function commitRow(row) {
    await db.updatePmcfRow(row.id, {
      rowDate: row.row_date, incident: row.incident, findings: row.findings, output: row.output, impact: row.impact,
    });
  }
  async function removeRow(rowId) {
    await db.deletePmcfRow(rowId);
    setPm({ ...pm, rows: pm.rows.filter(r => r.id !== rowId) });
  }

  return (
    <div className="card">
      <div className="toolbar">
        <strong>{pm.teacher_name}</strong>
        <div className="row-actions">
          <button className="btn small outline" onClick={onBack}>← Back to list</button>
          <button className="btn small gold" onClick={() => printPmcf(pm)}>Print PMCF</button>
        </div>
      </div>
      <div className="grid2" style={{ marginBottom: 10 }}>
        <div className="field"><label>Grade</label><input value={pm.grade || ''} onChange={e => setPm({ ...pm, grade: e.target.value })} /></div>
        <div className="field"><label>Section</label><input value={pm.section || ''} onChange={e => setPm({ ...pm, section: e.target.value })} /></div>
        <div className="field"><label>Time</label><input type="time" value={pm.observation_time || ''} onChange={e => setPm({ ...pm, observation_time: e.target.value })} /></div>
        <div className="field"><label>Rating Period</label><input placeholder="e.g. S.Y. 2025-2026, 1st Quarter" value={pm.rating_period || ''} onChange={e => setPm({ ...pm, rating_period: e.target.value })} /></div>
      </div>
      <div className="field">
        <label>Target Category / Objective</label>
        <select value={pm.category_id || ''} onChange={e => setPm({ ...pm, category_id: e.target.value })}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
        </select>
      </div>
      <table className="pmcf-table">
        <thead>
          <tr><th style={{ width: '10%' }}>Date</th><th style={{ width: '25%' }}>Critical Incident Description</th><th style={{ width: '20%' }}>Findings / Observation</th><th style={{ width: '20%' }}>Output</th><th style={{ width: '20%' }}>Impact on Job / Action Plan</th><th></th></tr>
        </thead>
        <tbody>
          {pm.rows.map(row => (
            <tr key={row.id}>
              <td><input type="date" value={row.row_date ? row.row_date.slice(0, 10) : ''} onChange={e => updateRow(row.id, 'row_date', e.target.value)} onBlur={() => commitRow(row)} /></td>
              <td><textarea rows={2} value={row.incident || ''} onChange={e => updateRow(row.id, 'incident', e.target.value)} onBlur={() => commitRow(row)} /></td>
              <td><textarea rows={2} value={row.findings || ''} onChange={e => updateRow(row.id, 'findings', e.target.value)} onBlur={() => commitRow(row)} /></td>
              <td><textarea rows={2} value={row.output || ''} onChange={e => updateRow(row.id, 'output', e.target.value)} onBlur={() => commitRow(row)} /></td>
              <td><textarea rows={2} value={row.impact || ''} onChange={e => updateRow(row.id, 'impact', e.target.value)} onBlur={() => commitRow(row)} /></td>
              <td><button className="btn small danger" onClick={() => removeRow(row.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn small outline" style={{ marginTop: 8 }} onClick={addRow}>+ Add Row</button>
      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button className="btn outline" onClick={saveMeta}>Save</button>
        <button className="btn gold" onClick={toggleFinal}>{pm.status === 'final' ? 'Mark as Draft' : 'Finalize'}</button>
      </div>
    </div>
  );
}
