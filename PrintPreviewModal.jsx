import React from 'react';
import { buildPmcfHtml } from '../printUtil';

export default function PrintPreviewModal({ pm, onClose }) {
  if (!pm) return null;

  function doPrint() {
    const target = document.getElementById('printable');
    if (target) target.innerHTML = buildPmcfHtml(pm);
    window.print();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <strong>Print Preview — {pm.teacher_name}</strong>
          <div className="row-actions">
            <button className="btn small gold" onClick={doPrint}>Print</button>
            <button className="btn small outline" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="preview-paper" dangerouslySetInnerHTML={{ __html: buildPmcfHtml(pm) }} />
        </div>
      </div>
    </div>
  );
}
