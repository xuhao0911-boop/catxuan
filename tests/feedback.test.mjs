import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { createAppServer } from '../server/app.mjs';
import { createFeedbackStore } from '../server/feedback-store.mjs';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(app, '../..');
const tempParent = path.join(workspace, 'work/catxuan/service-tests');

test('feedback service persists, validates, deduplicates, and keeps records private', async t => {
  await fs.mkdir(tempParent, { recursive: true }); const folder = await fs.mkdtemp(path.join(tempParent, 'run-'));
  const catalog = JSON.parse(await fs.readFile(path.join(app, 'src/data/breeds.json'), 'utf8'));
  const server = createAppServer({ root: path.join(app, 'dist'), dataDirectory: folder, catalog });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); assert(path.resolve(folder).startsWith(path.resolve(tempParent) + path.sep)); await fs.rm(folder, { recursive: true, force: true }); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const report = { id: 'test-feedback-000000001', breedId: 'british-shorthair', category: 'appearance', message: '测试建议：请核对这条毛色的资料来源。', color: 'blue', form: 'short', reference: 'https://www.fci.be/en/nomenclature/', contact: 'must-not-be-stored' };
  const post = value => fetch(base + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  await t.test('actual receipt and durable idempotent storage', async () => {
    const response = await post(report); assert.equal(response.status, 201); assert.deepEqual(await response.json(), { accepted: true, id: report.id });
    assert.equal((await post(report)).status, 201);
    const records = await createFeedbackStore(folder).read(); assert.equal(records.length, 1); assert.equal(records[0].message, report.message); assert.equal(records[0].status, 'pending-review'); assert(!('contact' in records[0]));
  });
  await t.test('rejects invalid breed, form, colour, text, and unsafe reference', async () => {
    for (const value of [{ ...report, breedId: 'no-breed' }, { ...report, form: 'invented' }, { ...report, color: 'invented' }, { ...report, message: '太短' }, { ...report, reference: 'javascript:alert(1)' }, { ...report, id: '../feedback-file' }, []]) assert.equal((await post(value)).status, 400);
  });
  await t.test('limits payloads and rejects cross-origin submission', async () => {
    assert.equal((await post({ ...report, message: 'x'.repeat(9000) })).status, 413);
    assert.equal((await fetch(base + '/api/feedback', { method: 'POST', headers: { Origin: 'https://unrelated.example', 'Content-Type': 'application/json' }, body: JSON.stringify(report) })).status, 403);
    assert.equal((await fetch(base + '/api/feedback', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'test' })).status, 415);
  });
  await t.test('no public list or private-file access; deep links still work', async () => {
    assert.equal((await fetch(base + '/api/feedback')).status, 405);
    assert.equal((await fetch(base + '/.catxuan-data/feedback.json')).status, 403);
    assert.equal((await fetch(base + '/assets/not-found.png')).status, 404);
    assert.equal((await fetch(base + '/match')).status, 200);
    assert.equal((await fetch(base + '/api/anything')).status, 404);
  });
  await t.test('operator can mark a received report as reviewed', async () => {
    const store = createFeedbackStore(folder); await store.resolve(report.id); assert.equal((await store.read())[0].status, 'reviewed');
  });
});
