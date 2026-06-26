import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { db } from './db';
import Login from './Login.jsx';
import Teachers from './Teachers.jsx';
import Categories from './Categories.jsx';
import Schedule from './Schedule.jsx';
import Records from './Records.jsx';
import Team from './Team.jsx';
import ChatMaster from './ChatMaster.jsx';
import ChatTeacher from './ChatTeacher.jsx';
import MyRecords from './MyRecords.jsx';
import Overview from './Overview.jsx';
import PmcfReminders from './PmcfReminders.jsx';

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
      if (p) setTab(p.role === 'master' ? 'teachers' : p.role === 'principal' ? 'overview' : 'mychat');
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
  const isPrincipal = profile.role === 'principal';
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
  const principalTabs = [
    ['overview', 'Team Overview'],
  ];

  const activeTabs = isMaster ? masterTabs : isPrincipal ? principalTabs : teacherTabs;

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
          {isMaster && <span style={{ fontSize: 10, opacity: .6 }}>DB: {(import.meta.env.VITE_SUPABASE_URL || '').replace('https://', '').split('.')[0]}</span>}
          <button onClick={handleLogout}>Log out</button>
        </div>
      </div>
      <div className="layout">
        <div className="tabs">
          {activeTabs.map(([key, label]) => (
            <div key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </div>
          ))}
        </div>
        <div className="content">
          {(isMaster || (!isPrincipal && !needsSetup)) && <PmcfReminders isMaster={isMaster} />}
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
          {isPrincipal && tab === 'overview' && <Overview />}
          {!isMaster && !isPrincipal && !needsSetup && tab === 'myrecords' && <MyRecords profile={profile} />}
          {!isMaster && !isPrincipal && !needsSetup && tab === 'mychat' && <ChatTeacher profile={profile} />}
        </div>
      </div>
      <div className="printable" id="printable"></div>
    </div>
  );
}
