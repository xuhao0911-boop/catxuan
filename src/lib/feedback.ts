import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const feedbackCategories = [{ id: 'appearance', name: '毛色与形态' }, { id: 'image', name: '插画' }, { id: 'profile', name: '文字资料' }, { id: 'other', name: '其他' }] as const;
export type FeedbackCategory = typeof feedbackCategories[number]['id'];
export type FeedbackDraft = { breedId?: string; color?: string; form?: string; category: FeedbackCategory; message: string; reference?: string };
export type FeedbackRecord = FeedbackDraft & { id: string; createdAt: string; status: 'pending' | 'submitted'; receipt?: string };
const key = '@catxuan/feedback-v1';
let queue = Promise.resolve();
export async function readFeedback(): Promise<FeedbackRecord[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) return [];
  return value.filter((record): record is FeedbackRecord => !!record && typeof record === 'object' && typeof record.id === 'string' && typeof record.message === 'string' && ['pending', 'submitted'].includes(record.status)).slice(0, 100);
}
async function write(record: FeedbackRecord) {
  const task = queue.then(async () => { const records = await readFeedback(); await AsyncStorage.setItem(key, JSON.stringify([record, ...records.filter(item => item.id !== record.id)].slice(0, 100))); });
  queue = task.catch(() => {}); await task;
}
export function validFeedback(draft: FeedbackDraft) {
  return feedbackCategories.some(category => category.id === draft.category) && draft.message.trim().length >= 8 && draft.message.trim().length <= 1000 && (!draft.reference?.trim() || /^https?:\/\/\S+$/i.test(draft.reference.trim())) && (draft.reference?.length || 0) <= 500;
}
export async function retryFeedback(record: FeedbackRecord): Promise<FeedbackRecord> {
  const base = process.env.EXPO_PUBLIC_CAT_FEEDBACK_URL;
  if (Platform.OS !== 'web' && !base) return record;
  const endpoint = base || '/api/feedback';
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...record, version: '0.1.0' }), signal: controller.signal });
    if (!response.ok) return record;
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== 'object' || !('id' in receipt) || receipt.id !== record.id || !('accepted' in receipt) || receipt.accepted !== true) return record;
    const submitted: FeedbackRecord = { ...record, status: 'submitted', receipt: String(receipt.id) };
    await write(submitted); return submitted;
  } catch { return record; } finally { clearTimeout(timeout); }
}
export async function submitFeedback(draft: FeedbackDraft): Promise<FeedbackRecord> {
  if (!validFeedback(draft)) throw new Error('Invalid feedback');
  const record: FeedbackRecord = { ...draft, message: draft.message.trim(), reference: draft.reference?.trim() || undefined, id: 'cx-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 14), createdAt: new Date().toISOString(), status: 'pending' };
  await write(record); return retryFeedback(record);
}
export async function deleteFeedback(id: string) { const task = queue.then(async () => { const records = await readFeedback(); await AsyncStorage.setItem(key, JSON.stringify(records.filter(record => record.id !== id))); }); queue = task.catch(() => {}); await task; }
