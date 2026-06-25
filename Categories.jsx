import React, { useEffect, useState } from 'react';
import { db } from '../db';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setCategories(await db.getCategories()); } catch (e) {}
    setLoading(false);
  }

  async function add() {
    if (!newText.trim()) return;
    await db.addCategory(newText.trim());
    setNewText('');
    load();
  }
  function updateText(c, text) {
    setCategories(categories.map(x => x.id === c.id ? { ...x, text } : x));
  }
  async function commit(c) {
    await db.updateCategory(c.id, c.text);
  }
  async function remove(c) {
    await db.deleteCategory(c.id);
    load();
  }

  return (
    <div>
      <h1 className="page-title">Observation Categories</h1>
      <div className="sub">Target objectives/indicators you can choose from when filling out a PMCF. Edit freely to match your rating period or PPST focus.</div>

      <div className="card obj-list">
        {loading && <div className="empty">Loading…</div>}
        {!loading && categories.length === 0 && <div className="empty">No categories yet.</div>}
        {!loading && categories.map(c => (
          <div className="obj-item" key={c.id}>
            <textarea rows={2} style={{ flex: 1 }} value={c.text} onChange={e => updateText(c, e.target.value)} onBlur={() => commit(c)} />
            <button className="btn small danger" onClick={() => remove(c)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="card">
        <label>Add a new category / objective</label>
        <textarea placeholder="e.g. Apply a range of teaching strategies to develop critical and creative thinking..." value={newText} onChange={e => setNewText(e.target.value)} />
        <button className="btn gold" style={{ marginTop: 8 }} onClick={add}>Add Category</button>
      </div>
    </div>
  );
}
