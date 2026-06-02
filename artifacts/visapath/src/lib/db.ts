import { supabase } from './supabase';

export async function saveAssessmentToDb(userId: string, data: unknown): Promise<string | null> {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from('assessments')
    .insert({ user_id: userId, data })
    .select('id')
    .single();
  if (error) { console.error('[db] saveAssessment', error.message); return null; }
  return (row as { id: string }).id;
}

export async function saveRecommendationsToDb(userId: string, assessmentId: string, data: unknown) {
  if (!supabase) return;
  const { error } = await supabase
    .from('recommendations')
    .upsert({ user_id: userId, assessment_id: assessmentId, data }, { onConflict: 'assessment_id' });
  if (error) console.error('[db] saveRecommendations', error.message);
}

export async function saveRoadmapToDb(userId: string, assessmentId: string, data: unknown) {
  if (!supabase) return;
  const { error } = await supabase
    .from('roadmaps')
    .upsert({ user_id: userId, assessment_id: assessmentId, data }, { onConflict: 'assessment_id' });
  if (error) console.error('[db] saveRoadmap', error.message);
}

export async function loadAdvisorChat(userId: string, assessmentId: string | null): Promise<{ id: string; messages: unknown[] } | null> {
  if (!supabase || !assessmentId) return null;
  const { data, error } = await supabase
    .from('advisor_chats')
    .select('id, messages')
    .eq('user_id', userId)
    .eq('assessment_id', assessmentId)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; messages: unknown[] };
}

export async function upsertAdvisorChat(
  userId: string,
  assessmentId: string | null,
  messages: unknown[],
  existingChatId?: string,
): Promise<string | null> {
  if (!supabase) return null;
  if (existingChatId) {
    const { error } = await supabase
      .from('advisor_chats')
      .update({ messages, updated_at: new Date().toISOString() })
      .eq('id', existingChatId);
    if (error) console.error('[db] updateChat', error.message);
    return existingChatId;
  }
  const { data, error } = await supabase
    .from('advisor_chats')
    .insert({ user_id: userId, assessment_id: assessmentId, messages })
    .select('id')
    .single();
  if (error) { console.error('[db] insertChat', error.message); return null; }
  return (data as { id: string }).id;
}

export type AssessmentRow = {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
};

export async function getUserAssessments(userId: string): Promise<AssessmentRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('assessments')
    .select('id, data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('[db] getUserAssessments', error.message); return []; }
  return (data ?? []) as AssessmentRow[];
}
