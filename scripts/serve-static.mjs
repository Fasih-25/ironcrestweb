// Minimal static server for the reference page (and for testing the static export).
// Usage: node scripts/serve-static.mjs <dir> <port>
import http from 'node:http';
import path from 'node:path';
import handler from 'serve-handler';

const dir = path.resolve(process.argv[2] ?? 'design/site-reference');
const port = Number(process.argv[3] ?? 3200);

http
  .createServer((req, res) => handler(req, res, { public: dir, cleanUrls: false }))
  .listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`));
