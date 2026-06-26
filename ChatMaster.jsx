import React, { useEffect, useState } from 'react';
import { db } from './db';
import ChatThread from './ChatThread.jsx';

export default function ChatMaster({ profile }) {
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    db.getTeachers().then(t => { setTeachers(t); if (t[0]) setSelected(t[0].id); });
  }, []);

  return (
    <div>
      <h1 className="page-title">Messages</h1>
      <div className="sub">Talk directly with a teacher about their observation and coaching notes.</div>
      <div className="field">
        <label>Teacher</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <ChatThread teacherId={selected} myName={profile.name || profile.email} />
    </div>
  );
}
