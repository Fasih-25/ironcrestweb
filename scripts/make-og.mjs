// One-off asset generator (run when the brand changes): `node scripts/make-og.mjs`
// Renders the hero plate + headline to public/og.png (1200×630) and the crown tile to
// app/apple-icon.png (180×180). Uses Google Fonts at authoring time only; the outputs are
// static files, so the live site makes no font requests.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const ticks = Array.from({ length: 120 }, (_, i) => `<line x1="500" y1="40" x2="500" y2="${i % 5 ? 62 : 80}" transform="rotate(${i * 3} 500 500)"/>`).join('');
const plate = `<svg viewBox="0 0 1000 1000"><defs><path id="p" d="M500 500 m-372 0 a372 372 0 1 1 744 0 a372 372 0 1 1 -744 0"/></defs>
<circle cx="500" cy="500" r="486" fill="rgba(169,20,33,.10)" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
<circle cx="500" cy="500" r="486" fill="none" stroke="currentColor" stroke-width="3"/>
<g stroke="currentColor" stroke-width="2.4" opacity=".75">${ticks}</g>
<circle cx="500" cy="500" r="420" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5"/>
<circle cx="500" cy="500" r="330" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5"/>
<circle cx="500" cy="500" r="236" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5"/>
<text fill="currentColor" style="font:800 38px Manrope;letter-spacing:.2em"><textPath href="#p" textLength="2330" lengthAdjust="spacing">IRONCREST  ·  45 KG  ·  IRONCREST  ·  45 KG  ·  IRONCREST  ·  45 KG  ·</textPath></text>
<circle cx="500" cy="500" r="64" fill="#0A0A0A" stroke="currentColor" stroke-width="3"/></svg>`;

const og = `<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=block">
<style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#0A0A0A;overflow:hidden;font-family:Manrope;position:relative}
.orb{position:absolute;border-radius:50%;filter:blur(90px)}
.o1{width:640px;height:640px;left:-220px;top:-260px;background:radial-gradient(circle,rgba(169,20,33,.75),transparent 65%)}
.o2{width:560px;height:560px;right:-200px;bottom:-300px;background:radial-gradient(circle,rgba(101,10,21,.9),transparent 65%)}
.plate{position:absolute;right:-170px;top:50%;width:780px;height:780px;transform:translateY(-50%) rotate(-12deg);color:#A91421;opacity:.6}
.copy{position:absolute;left:80px;top:92px;width:900px}
.logo{display:flex;align-items:center;gap:14px;font:700 26px 'Playfair Display';letter-spacing:.2em;color:#F5F1F0}
.logo i{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(160deg,#C21A2A,#650A15)}
h1{margin:50px 0 0;font:600 84px/.98 'Playfair Display';letter-spacing:-.01em;color:#F5F1F0}
em{font-style:italic;color:#E5283A}
p{margin:30px 0 0;font:700 22px Manrope;color:#A49A9B;letter-spacing:.02em}
</style></head><body>
<div class="orb o1"></div><div class="orb o2"></div><div class="plate">${plate}</div>
<div class="copy"><div class="logo"><i><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg></i>IRONCREST</div>
<h1>Every member.<br>Every class.<br>One <em>command</em> centre.</h1>
<p>Gym management software</p></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(og, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
writeFileSync('public/og.png', await page.screenshot({ type: 'png' }));

const icon = readFileSync('app/icon.svg', 'utf8');
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(`<html><body style="margin:0;background:#0A0A0A">${icon.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`);
writeFileSync('app/apple-icon.png', await page.screenshot({ type: 'png', omitBackground: false }));
await browser.close();
console.log('wrote public/og.png and app/apple-icon.png');
