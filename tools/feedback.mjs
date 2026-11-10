import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFeedbackStore } from '../server/feedback-store.mjs';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = createFeedbackStore(process.env.CATXUAN_DATA_DIR || path.join(app, '.catxuan-data'));
const [command = 'list', argument] = process.argv.slice(2);
if (command === 'list') { console.log(JSON.stringify(await store.read(), null, 2)); }
else if (command === 'resolve' && argument) { const result = await store.resolve(argument); if (!result) throw Error('Feedback not found'); console.log(JSON.stringify(result, null, 2)); }
else if (command === 'export' && argument) { await fs.writeFile(path.resolve(argument), JSON.stringify(await store.read(), null, 2) + '\n'); console.log('Exported feedback.'); }
else { console.error('Usage: node tools/feedback.mjs list | resolve ID | export FILE'); process.exitCode = 1; }
