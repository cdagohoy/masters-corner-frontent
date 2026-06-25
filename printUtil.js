import { SCHOOL, DEPT } from './App.jsx';

function escapeHtml(s) {
  const d = document.createElement('div');
  d.innerText = s || '';
  return d.innerHTML;
}
function fmtDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
    return dt.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return d; }
}

export function buildPmcfHtml(pm) {
  const rowsHtml = (pm.rows || []).map(r => `<tr>
      <td class="col-date">${escapeHtml(fmtDate(r.row_date))}</td>
      <td>${escapeHtml(r.incident || '').replace(/\n/g, '<br/>')}</td>
      <td>${escapeHtml(r.findings || '').replace(/\n/g, '<br/>')}</td>
      <td>${escapeHtml(r.output || '').replace(/\n/g, '<br/>')}</td>
      <td>${escapeHtml(r.impact || '').replace(/\n/g, '<br/>')}</td>
      <td class="col-sig"></td>
    </tr>`).join('');

  return `
    <div class="pmcf-doc">
      <div class="print-header">
        <div class="line1">Republic of the Philippines</div>
        <div class="line1">Department of Education</div>
        <div class="line2">${escapeHtml(SCHOOL)}</div>
        <div class="line1">${escapeHtml(DEPT)}</div>
        <h2>PERFORMANCE MONITORING AND COACHING FORM</h2>
        <div class="line1">${escapeHtml(pm.rating_period || '')}</div>
      </div>

      <table class="pmcf-meta">
        <tr>
          <td><strong>Name of Ratee:</strong> ${escapeHtml(pm.teacher_name || '')}</td>
          <td><strong>Name of Rater:</strong> ${escapeHtml(pm.master_name || '')}</td>
        </tr>
        <tr>
          <td><strong>Position:</strong> ${escapeHtml(pm.teacher_position || '')}</td>
          <td><strong>Position:</strong> Master Teacher</td>
        </tr>
        <tr>
          <td><strong>Subject/s:</strong> ${escapeHtml(pm.teacher_subjects || '')}</td>
          <td><strong>Department:</strong> ${escapeHtml(DEPT)}</td>
        </tr>
        <tr>
          <td><strong>Grade &amp; Section:</strong> ${escapeHtml(pm.grade || '')} ${escapeHtml(pm.section || '')}</td>
          <td><strong>Time:</strong> ${escapeHtml(pm.observation_time || '')}</td>
        </tr>
      </table>

      <div class="target-obj"><strong>Target Objective:</strong> ${escapeHtml(pm.category_text || '')}</div>

      <table class="pmcf-table">
        <thead>
          <tr>
            <th class="col-date">Date</th>
            <th>Critical Incident Description</th>
            <th>Findings / Observation</th>
            <th>Output</th>
            <th>Impact on Job / Action Plan</th>
            <th class="col-sig">Signature<br/>(Rater/Ratee)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;color:#888">No entries logged yet.</td></tr>'}</tbody>
      </table>

      <table class="prepared-by">
        <tr>
          <td>
            <div class="sig-line"></div>
            <div>${escapeHtml(pm.teacher_name || '')}</div>
            <div class="sig-label">${escapeHtml(pm.teacher_position || 'Teacher')} / Ratee</div>
          </td>
          <td>
            <div class="sig-line"></div>
            <div>${escapeHtml(pm.master_name || '')}</div>
            <div class="sig-label">Master Teacher / Rater</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function printPmcf(pm) {
  const target = document.getElementById('printable');
  if (target) target.innerHTML = buildPmcfHtml(pm);
  window.print();
}
