import React, { useEffect, useRef, useState } from 'react';
import { db } from './db';

export default function ChatThread({ teacherId, myName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!teacherId) return;
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [teacherId]);

  async function load() {
    try {
      const msgs = await db.getMessages(teacherId);
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, 0);
    } catch (e) { setLoading(false); }
  }

  async function send() {
    if (!text.trim() || !teacherId) return;
    const val = text.trim();
    setText('');
    try {
      await db.sendMessage(teacherId, val);
      load();
    } catch (e) { alert(e.message); }
  }

  if (!teacherId) return <div className="empty">No teacher selected.</div>;

  return (
    <div className="card">
      <div className="chat-box" ref={boxRef}>
        {loading && <div className="empty">Loading…</div>}
        {!loading && messages.length === 0 && <div className="empty">No messages yet. Say hello!</div>}
        {!loading && messages.map(m => (
          <div key={m.id} className={`msg ${m.sender_name === myName ? 'me' : 'them'}`}>
            <div className="bubble">{m.body}</div>
            <div className="meta">{m.sender_name} · {new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input placeholder="Write a message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
        <button className="btn gold" onClick={send}>Send</button>
      </div>
    </div>
  );
}
