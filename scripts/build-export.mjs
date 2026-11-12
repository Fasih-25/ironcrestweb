// Static export for Hostinger shared hosting (no Node).
// The POST route handler and the nonce proxy are excluded (see next.config.ts pageExtensions);
// the form then posts to NEXT_PUBLIC_DEMO_ENDPOINT (the Ironcrest API).
import { spawnSync } from 'node:child_process';

if (!process.env.NEXT_PUBLIC_DEMO_ENDPOINT) {
  console.warn('[build-export] NEXT_PUBLIC_DEMO_ENDPOINT is not set: the demo form will have nowhere to post.');
}
// next.config.ts drops .ts page extensions in export mode, which leaves out app/api/**/route.ts and proxy.ts.
const r = spawnSync('pnpm', ['exec', 'next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BUILD_TARGET: 'export' },
});
let code = r.status ?? 1;
if (code === 0) {
  const p = spawnSync(process.execPath, ['scripts/postexport.mjs', process.env.NEXT_DIST_DIR || 'out'], { stdio: 'inherit', env: process.env });
  code = p.status ?? 1;
}
process.exit(code);
