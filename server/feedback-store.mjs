import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export function validateReport(value, catalog) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(value.id)) return null;
  if (!['appearance', 'image', 'profile', 'other'].includes(value.category) || typeof value.message !== 'string' || value.message.trim().length < 8 || value.message.trim().length > 1000) return null;
  const breed = value.breedId ? catalog.find(item => item.id === value.breedId) : undefined;
  if ((value.breedId && !breed) || (value.color && !breed?.colors.some(item => item.id === value.color)) || (value.form && !breed?.forms.some(item => item.id === value.form))) return null;
  if (value.reference && (typeof value.reference !== 'string' || value.reference.length > 500 || !/^https?:\/\/\S+$/i.test(value.reference.trim()))) return null;
  return { id: value.id, breedId: breed?.id || null, color: value.color || null, form: value.form || null, category: value.category, message: value.message.trim(), reference: value.reference?.trim() || null, createdAt: new Date().toISOString(), status: 'pending-review' };
}
export function createFeedbackStore(folder) {
  const file = path.join(folder, 'feedback.json'); let queue = Promise.resolve();
  const read = async () => { try { const value = JSON.parse(await fs.readFile(file, 'utf8')); if (!Array.isArray(value)) throw Error('Invalid feedback store'); return value; } catch (error) { if (error.code === 'ENOENT') return []; throw error; } };
  const update = action => {
    const task = queue.then(async () => { const records = await read(); const { changed, result } = await action(records); if (changed) { await fs.mkdir(folder, { recursive: true }); const temp = path.join(folder, 'feedback-' + randomUUID() + '.tmp'); await fs.writeFile(temp, JSON.stringify(records, null, 2) + '\n', { mode: 0o600 }); await fs.rename(temp, file); } return result; }); queue = task.catch(() => {}); return task;
  };
  return {
    read,
    add: report => update(records => { const found = records.find(item => item.id === report.id); if (found) return { changed: false, result: found }; if (records.length >= 10000) throw Error('Feedback capacity reached'); records.push(report); return { changed: true, result: report }; }),
    resolve: id => update(records => { const item = records.find(item => item.id === id); if (!item) return { changed: false, result: null }; item.status = 'reviewed'; item.reviewedAt = new Date().toISOString(); return { changed: true, result: item }; }),
  };
}
