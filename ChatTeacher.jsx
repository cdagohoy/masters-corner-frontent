import React from 'react';
import ChatThread from './ChatThread.jsx';

export default function ChatTeacher({ profile }) {
  return (
    <div>
      <h1 className="page-title">Message Master Teacher</h1>
      <div className="sub">Direct line for feedback and coaching about your observations.</div>
      <ChatThread teacherId={profile.teacher_id} myName={profile.name || profile.email} />
    </div>
  );
}
