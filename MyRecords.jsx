import React, { useEffect, useState } from 'react';
import { db } from '../db';
import PrintPreviewModal from './PrintPreviewModal.jsx';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${ampm}`;
}

export default function MyRecords({ profile }) {
  const [pmcfs, setPmcfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPm, setPreviewPm] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setPmcfs(await db.getPmcfs()); } catch (e) {}
    setLoading(false);
  }
  async function doPreview(pm) {
    const full = await db.getPmcf(pm.id);
    setPreviewPm(full);
  }

  return (
    <div>
      <h1 className="page-title">My PMCF Records</h1>
      <div className="sub">Observations and coaching notes from your Master Teacher.</div>
      {loading && <div className="empty">Loading…</div>}
      {!loading && pmcfs.length === 0 && <div className="empty">No PMCF entries yet.</div>}
      {!loading && pmcfs.map(pm => (
        <RecordCard key={pm.id} pm={pm} onPreview={() => doPreview(pm)} />
      ))}
      {previewPm && <PrintPreviewModal pm={previewPm} onClose={() => setPreviewPm(null)} />}
    </div>
  );
}

function RecordCard({ pm, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState(null);

  async function toggle() {
    if (!expanded && !full) {
      const data = await db.getPmcf(pm.id);
      setFull(data);
    }
    setExpanded(!expanded);
  }

  return (
    <div className="card">
      <div className="toolbar">
        <div>
          <span className="pill">{pm.observation_date ? pm.observation_date.slice(0, 10) : '—'}</span>{' '}
          {pm.observation_time && <span className="pill">{formatTime(pm.observation_time)}</span>}{' '}
          <span className="pill">{pm.grade} {pm.section}</span>{' '}
          <span className="pill gold">{pm.status}</span>
        </div>
        <div className="row-actions">
          <button className="btn small outline" onClick={toggle}>{expanded ? 'Hide' : 'View'}</button>
          <button className="btn small gold" onClick={onPreview}>Preview / Print</button>
        </div>
      </div>
      {expanded && full && (
        <>
          <div style={{ fontSize: 13, margin: '8px 0' }}><strong>Target Objective:</strong> {full.category_text}</div>
          <table className="pmcf-table">
            <thead><tr><th>Date</th><th>Critical Incident</th><th>Findings</th><th>Output</th><th>Impact/Action Plan</th></tr></thead>
            <tbody>
              {full.rows.map(r => (
                <tr key={r.id}>
                  <td>{r.row_date ? r.row_date.slice(0, 10) : ''}</td>
                  <td>{r.incident}</td>
                  <td>{r.findings}</td>
                  <td>{r.output}</td>
                  <td>{r.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
