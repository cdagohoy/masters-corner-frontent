import { SCHOOL, DEPT } from './App.jsx';

function escapeHtml(s) {
  const d = document.createElement('div');
  d.innerText = s || '';
  return d.innerHTML;
}

export function printPmcf(pm) {
  const rowsHtml = (pm.rows || []).map(r => `<tr>
      <td>${escapeHtml(r.row_date || '')}</td>
      <td>${escapeHtml(r.incident || '')}</td>
      <td>${escapeHtml(r.findings || '')}</td>
      <td>${escapeHtml(r.output || '')}</td>
      <td>${escapeHtml(r.impact || '')}</td>
    </tr>`).join('');

  const html = `
    <div class="print-header">
      <div class="line1">Republic of the Philippines</div>
      <div class="line1">Department of Education</div>
      <div class="line2">${SCHOOL}</div>
      <div class="line1">${DEPT}</div>
      <h2>PERFORMANCE MONITORING AND COACHING FORM</h2>
      <div class="line1">${escapeHtml(pm.rating_period || '')}</div>
    </div>
    <div class="print-meta">
      <div><strong>Name of Ratee:</strong> ${escapeHtml(pm.teacher_name || '')}</div>
      <div><strong>Name of Rater:</strong> ${escapeHtml(pm.master_name || '')}</div>
    </div>
    <div class="print-meta">
      <div><strong>Grade &amp; Section:</strong> ${escapeHtml(pm.grade || '')} ${escapeHtml(pm.section || '')}</div>
      <div><strong>Time:</strong> ${escapeHtml(pm.observation_time || '')}</div>
    </div>
    <div style="font-size:13px;margin:8px 0 6px"><strong>Target Objective:</strong> ${escapeHtml(pm.category_text || '')}</div>
    <table class="pmcf-table" style="font-size:12px">
      <thead><tr><th>Date</th><th>Critical Incident Description</th><th>Findings/Observation</th><th>Output</th><th>Impact on Job/Action Plan</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="signoff">
      <div>Ratee's Signature</div>
      <div>Rater's Signature</div>
    </div>
  `;
  const target = document.getElementById('printable');
  if (target) target.innerHTML = html;
  window.print();
}
