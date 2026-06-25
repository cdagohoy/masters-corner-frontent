import { supabase } from './supabaseClient';

function err(error, fallback) {
  throw new Error(error?.message || fallback || 'Something went wrong. Please try again.');
}

export const db = {
  // ---------- AUTH ----------
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) err(error, 'Could not log in. Check your email and password.');
    return data;
  },
  async logout() {
    await supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async getMyProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
    if (error) err(error, 'Could not load your profile.');
    return data;
  },

  // ---------- TEACHERS ----------
  async getTeachers() {
    const { data, error } = await supabase.from('teachers').select('*').order('name', { ascending: true });
    if (error) err(error);
    return data;
  },
  async addTeacher(t) {
    const { data, error } = await supabase.from('teachers').insert({
      name: t.name, position: t.position || '', subjects: t.subjects || '', notes: t.notes || '',
    }).select().single();
    if (error) err(error);
    return data;
  },
  async updateTeacher(id, t) {
    const { data, error } = await supabase.from('teachers').update({
      name: t.name, position: t.position || '', subjects: t.subjects || '', notes: t.notes || '',
    }).eq('id', id).select().single();
    if (error) err(error);
    return data;
  },
  async deleteTeacher(id) {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) err(error);
    return true;
  },

  // ---------- TEAM / PROFILES ----------
  async getTeamProfiles() {
    const { data, error } = await supabase.from('profiles').select('*, teachers(name)').order('created_at', { ascending: true });
    if (error) err(error);
    return data;
  },
  async updateProfile(id, { name, role, teacherId }) {
    const { data, error } = await supabase.from('profiles').update({
      name, role, teacher_id: teacherId || null,
    }).eq('id', id).select().single();
    if (error) err(error);
    return data;
  },

  // ---------- CATEGORIES ----------
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (error) err(error);
    return data;
  },
  async addCategory(text) {
    const { data, error } = await supabase.from('categories').insert({ text }).select().single();
    if (error) err(error);
    return data;
  },
  async updateCategory(id, text) {
    const { data, error } = await supabase.from('categories').update({ text }).eq('id', id).select().single();
    if (error) err(error);
    return data;
  },
  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) err(error);
    return true;
  },

  // ---------- PMCF ----------
  async getPmcfs() {
    const { data, error } = await supabase
      .from('pmcf')
      .select('*, teachers(name), categories(text)')
      .order('created_at', { ascending: false });
    if (error) err(error);
    return (data || []).map(flattenPmcf);
  },
  async getPmcf(id) {
    const { data, error } = await supabase
      .from('pmcf')
      .select('*, teachers(name,position,subjects), categories(text), profiles(name)')
      .eq('id', id)
      .single();
    if (error) err(error);
    const { data: rows, error: rowsError } = await supabase
      .from('pmcf_rows').select('*').eq('pmcf_id', id).order('sort_order', { ascending: true });
    if (rowsError) err(rowsError);
    return { ...flattenPmcf(data), master_name: data.profiles?.name || '', rows: rows || [] };
  },
  async createPmcf(form) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      throw new Error('Your session has expired. Please log out and log back in, then try again.');
    }
    const { data: profileCheck, error: profileErr } = await supabase
      .from('profiles').select('id, role').eq('id', userData.user.id).maybeSingle();
    if (profileErr || !profileCheck) {
      throw new Error(
        'Your login is not yet linked to a profile in the database. In Supabase, check Table Editor → profiles for a row matching your account, then log out and log back in here.'
      );
    }
    const { data, error } = await supabase.from('pmcf').insert({
      teacher_id: form.teacherId,
      category_id: form.categoryId || null,
      grade: form.grade || '',
      section: form.section || '',
      observation_date: form.observationDate || null,
      observation_time: form.observationTime || '',
      rating_period: form.ratingPeriod || '',
      status: 'draft',
      created_by: userData.user.id,
    }).select().single();
    if (error) err(error);
    await supabase.from('pmcf_rows').insert({
      pmcf_id: data.id, row_date: form.observationDate || null, incident: '', findings: '', output: '', impact: '', sort_order: 0,
    });
    return data;
  },
  async updatePmcf(id, form) {
    const { data, error } = await supabase.from('pmcf').update({
      grade: form.grade || '', section: form.section || '', observation_time: form.observationTime || '',
      rating_period: form.ratingPeriod || '', category_id: form.categoryId || null, status: form.status || 'draft',
    }).eq('id', id).select().single();
    if (error) err(error);
    return data;
  },
  async deletePmcf(id) {
    const { error } = await supabase.from('pmcf').delete().eq('id', id);
    if (error) err(error);
    return true;
  },
  async addPmcfRow(pmcfId) {
    const { count } = await supabase.from('pmcf_rows').select('*', { count: 'exact', head: true }).eq('pmcf_id', pmcfId);
    const { data, error } = await supabase.from('pmcf_rows').insert({
      pmcf_id: pmcfId, row_date: null, incident: '', findings: '', output: '', impact: '', sort_order: count || 0,
    }).select().single();
    if (error) err(error);
    return data;
  },
  async updatePmcfRow(rowId, row) {
    const { data, error } = await supabase.from('pmcf_rows').update({
      row_date: row.rowDate || null, incident: row.incident || '', findings: row.findings || '',
      output: row.output || '', impact: row.impact || '',
    }).eq('id', rowId).select().single();
    if (error) err(error);
    return data;
  },
  async deletePmcfRow(rowId) {
    const { error } = await supabase.from('pmcf_rows').delete().eq('id', rowId);
    if (error) err(error);
    return true;
  },

  // ---------- MESSAGES ----------
  async getMessages(teacherId) {
    const { data, error } = await supabase.from('messages').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: true });
    if (error) err(error);
    return data;
  },
  async sendMessage(teacherId, body) {
    const { data: userData } = await supabase.auth.getUser();
    const profile = await db.getMyProfile();
    const { data, error } = await supabase.from('messages').insert({
      teacher_id: teacherId, sender_id: userData.user.id, sender_name: profile?.name || userData.user.email, body,
    }).select().single();
    if (error) err(error);
    return data;
  },
};

function flattenPmcf(row) {
  if (!row) return row;
  return {
    ...row,
    teacher_name: row.teachers?.name || '',
    teacher_position: row.teachers?.position || '',
    teacher_subjects: row.teachers?.subjects || '',
    category_text: row.categories?.text || '',
  };
}
