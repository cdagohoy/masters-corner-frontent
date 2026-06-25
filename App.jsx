import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { db } from './db';
import Login from './pages/Login.jsx';
import Teachers from './pages/Teachers.jsx';
import Categories from './pages/Categories.jsx';
import Schedule from './pages/Schedule.jsx';
import Records from './pages/Records.jsx';
import Team from './pages/Team.jsx';
import ChatMaster from './pages/ChatMaster.jsx';
import ChatTeacher from './pages/ChatTeacher.jsx';
import MyRecords from './pages/MyRecords.jsx';

export const SCHOOL = "Maria Cristina P. Belcar Agricultural High School";
export const DEPT = "Related Subjects Department - JHS";

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(null);

  useEffect(() => {
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setProfile(null); setLoading(false); }
      else loadSession();
    });
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  async function loadSession() {
    setLoading(true);
    try {
      const session = await db.getSession();
      if (!session) { setProfile(null); return; }
      const p = await db.getMyProfile();
      setProfile(p);
      if (p) setTab(p.role === 'master' ? 'teachers' : 'mychat');
    } catch (e) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await db.logout();
    setProfile(null);
  }

  if (loading) return <div className="loading-screen">Loading The Master's Corner…</div>;
  if (!profile) return <Login onLoggedIn={loadSession} />;

  if (!profile.role || (profile.role === 'teacher' && !profile.teacher_id && !profile.name)) {
    // Profile exists but Master Teacher hasn't finished linking it yet
  }

  const isMaster = profile.role === 'master';
  const needsSetup = profile.role === 'teacher' && !profile.teacher_id;

  const masterTabs = [
    ['teachers', 'Teachers'],
    ['schedule', 'Observe / PMCF'],
    ['records', 'PMCF Records'],
    ['categories', 'Categories'],
    ['chat', 'Messages'],
    ['team', 'Team Access'],
  ];
  const teacherTabs = [
    ['myrecords', 'My PMCF Records'],
    ['mychat', 'Message Master Teacher'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="topbar">
        <div className="brand">
          <div className="leafmark">M</div>
          <div>
            <div className="mark">The Master's Corner</div>
            <div className="tag">{SCHOOL} · {DEPT}</div>
          </div>
        </div>
        <div className="who">
          <span>{profile.name || profile.email}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </div>
      <div className="layout">
        <div className="tabs">
          {(isMaster ? masterTabs : teacherTabs).map(([key, label]) => (
            <div key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </div>
          ))}
        </div>
        <div className="content">
          {needsSetup && (
            <div className="banner">
              Your account is logged in but not yet linked to your teacher profile. Ask your Master Teacher to finish setting you up under Team Access.
            </div>
          )}
          {isMaster && tab === 'teachers' && <Teachers />}
          {isMaster && tab === 'schedule' && <Schedule onCreated={() => setTab('records')} />}
          {isMaster && tab === 'records' && <Records />}
          {isMaster && tab === 'categories' && <Categories />}
          {isMaster && tab === 'chat' && <ChatMaster profile={profile} />}
          {isMaster && tab === 'team' && <Team />}
          {!isMaster && !needsSetup && tab === 'myrecords' && <MyRecords profile={profile} />}
          {!isMaster && !needsSetup && tab === 'mychat' && <ChatTeacher profile={profile} />}
        </div>
      </div>
      <div className="printable" id="printable"></div>
    </div>
  );
}
