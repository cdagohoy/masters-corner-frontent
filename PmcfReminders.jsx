import React, { useEffect, useState } from 'react';
import { db } from './db';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${ampm}`;
}

export default function PmcfReminders({ isMaster }) {
  const [upcoming, setUpcoming] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('mc_dismissed_reminders') || '[]'); } catch (e) { return []; }
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const all = await db.getPmcfs();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const inThreeDays = new Date(today); inThreeDays.setDate(today.getDate() + 3);
      const items = all.filter(pm => {
        if (!pm.observation_date || pm.status === 'final') return false;
        const d = new Date(pm.observation_date + 'T00:00:00');
        return d >= today && d <= inThreeDays;
      }).sort((a, b) => new Date(a.observation_date) - new Date(b.observation_date));
      setUpcoming(items);
    } catch (e) { /* not critical, fail quietly */ }
  }

  function dismiss(id) {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('mc_dismissed_reminders', JSON.stringify(next));
  }

  function dayLabel(dateStr) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  const visible = upcoming.filter(pm => !dismissed.includes(pm.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      {visible.map(pm => (
        <div className="banner" key={pm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            🌱 <strong>{dayLabel(pm.observation_date)}</strong>
            {isMaster ? ` — PMCF observation for ${pm.teacher_name}` : ' — your PMCF observation is scheduled'}
            {pm.observation_time ? ` at ${formatTime(pm.observation_time)}` : ''}
            {pm.grade || pm.section ? ` (${pm.grade || ''} ${pm.section || ''})` : ''}
          </div>
          <button className="btn small outline" onClick={() => dismiss(pm.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
