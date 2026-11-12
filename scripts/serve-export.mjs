// Serves out/ with the CSP from the generated out/.htaccess, to test the static export locally.
// Usage: node scripts/serve-export.mjs [port]
import http from 'node:http';
import { readFileSync } from 'node:fs';
import handler from 'serve-handler';

const port = Number(process.argv[2] ?? 3300);
const ht = readFileSync('out/.htaccess', 'utf8');
const line = ht.split('\n').find((l) => l.includes('Content-Security-Policy'));
if (!line) throw new Error('no CSP in out/.htaccess');
const csp = line
  .slice(line.indexOf('"') + 1, line.lastIndexOf('"'))
  .replaceAll('\\"', '"')
  // local http server: don't force https
  .replace('; upgrade-insecure-requests', '');

http
  .createServer((req, res) => {
    res.setHeader('Content-Security-Policy', csp);
    return handler(req, res, { public: 'out' });
  })
  .listen(port, () => console.log(`static export on http://localhost:${port}`));
