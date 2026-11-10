import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppServer } from './server/app.mjs';
const app = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.CAT_ATLAS_PORT || 4179);
const server = createAppServer({ root: path.join(app, 'dist'), dataDirectory: process.env.CATXUAN_DATA_DIR || path.join(app, '.catxuan-data'), catalog: JSON.parse(fs.readFileSync(path.join(app, 'src/data/breeds.json'), 'utf8')), allowedOrigin: process.env.CATXUAN_ALLOWED_ORIGIN });
server.listen(port, '127.0.0.1', () => console.log('CatXuan: http://127.0.0.1:' + port));
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? '端口已被占用，请打开已有预览，或修改 CAT_ATLAS_PORT。' : error.message); process.exitCode = 1; });
