import { expect, test, type Page } from '@playwright/test';

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) > 1000;

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 8000 });
  await expect(page.getByTestId('loader')).not.toBeAttached();
}

test.describe('S4 · reel, app, pricing, FAQ, CTA, footer', () => {
  test('reel shows exactly the five approved screens', async ({ page }) => {
    await ready(page);
    const cards = page.locator('#screens [data-reel]');
    await expect(cards).toHaveCount(5);
    expect(await cards.evaluateAll((els) => els.map((e) => e.getAttribute('data-reel')))).toEqual([
      'dashboard',
      'members',
      'subscriptions',
      'bookings',
      'payments',
    ]);
    await expect(page.locator('#screens')).not.toContainText(/Trainers|Attendance|Module Settings/);
  });

  test('reel: vertical scroll drives the horizontal track (desktop)', async ({ page }) => {
    test.skip(!wide(page), 'pinned above 1000px only');
    await ready(page);
    const sec = page.locator('#screens');
    const { top, height } = await sec.evaluate((el) => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }));
    const H = page.viewportSize()!.height;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top + (height - H) * 0.5);
    await expect.poll(async () => Number(await sec.getAttribute('data-progress'))).toBeGreaterThan(0.4);
    const x = await page.getByTestId('reel-track').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(x).toBeLessThan(-200);
  });

  test('reel becomes a native swipe row (phone)', async ({ page }) => {
    test.skip(wide(page), 'mobile layout');
    await ready(page);
    const track = page.getByTestId('reel-track');
    const css = await track.evaluate((el) => ({ ox: getComputedStyle(el).overflowX, snap: getComputedStyle(el).scrollSnapType }));
    expect(css.ox).toBe('auto');
    expect(css.snap).toContain('x');
  });

  test('pricing toggle switches between annual and monthly prices', async ({ page }) => {
    await ready(page);
    const pricing = page.locator('#pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing.locator('[data-price="studio"]')).toHaveText('Rs 12,367');
    await expect(pricing.locator('[data-price="club"]')).toHaveText('Rs 28,967');
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(pricing.locator('[data-price="studio"]')).toHaveText('Rs 14,900');
    await expect(pricing.locator('[data-price="club"]')).toHaveText('Rs 34,900');
    await expect(page.getByRole('button', { name: 'Monthly' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /Annual/ }).click();
    await expect(pricing.locator('[data-price="studio"]')).toHaveText('Rs 12,367');
    await expect(pricing).toContainText("Let's talk");
  });

  test('FAQ opens one item at a time', async ({ page }) => {
    await ready(page);
    const faqs = page.getByTestId('faqs');
    await faqs.scrollIntoViewIfNeeded();
    const btns = faqs.getByRole('button');
    await expect(btns).toHaveCount(5);
    await expect(btns.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await btns.nth(2).click();
    await expect(btns.nth(2)).toHaveAttribute('aria-expanded', 'true');
    await expect(btns.nth(0)).toHaveAttribute('aria-expanded', 'false');
    await btns.nth(2).click();
    await expect(btns.nth(2)).toHaveAttribute('aria-expanded', 'false');
  });

  test('form: validation errors are announced and fields marked invalid', async ({ page }) => {
    await ready(page);
    let posted = false;
    await page.route('**/api/demo-requests', (r) => {
      posted = true;
      return r.fulfill({ json: { ok: true } });
    });
    const form = page.getByTestId('demo-form');
    await form.scrollIntoViewIfNeeded();
    await page.locator('#f-email').fill('not-an-email');
    await form.getByRole('button', { name: /Book demo/ }).click();
    await expect(page.getByTestId('form-status')).toHaveText('Please add your name, gym and a valid email.');
    await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#f-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#f-name')).toBeFocused();
    expect(posted).toBe(false);
  });

  test('form: success replaces the form, escaping the name', async ({ page }) => {
    await ready(page);
    let body: Record<string, string> = {};
    await page.route('**/api/demo-requests', async (r) => {
      body = r.request().postDataJSON();
      await r.fulfill({ json: { ok: true } });
    });
    const form = page.getByTestId('demo-form');
    await form.scrollIntoViewIfNeeded();
    await page.locator('#f-name').fill('<b>Ayesha</b>');
    await page.locator('#f-gym').fill('Iron Den');
    await page.locator('#f-email').fill('ayesha@example.com');
    await form.getByRole('button', { name: /Book demo/ }).click();
    await expect(page.getByTestId('form-success')).toHaveText("Thanks, <b>Ayesha</b>. We'll be in touch within one business day.");
    await expect(page.locator('#demo b')).toHaveCount(0);
    expect(body).toMatchObject({ name: '<b>Ayesha</b>', gym: 'Iron Den', email: 'ayesha@example.com', website: '' });
  });

  test('footer has the three columns and fine print', async ({ page }) => {
    await page.goto('/');
    const f = page.locator('footer');
    for (const t of ['Product', 'Company', 'Built for']) await expect(f.getByRole('navigation', { name: t })).toBeVisible();
    await expect(f).toContainText('© 2026 Ironcrest. All rights reserved.');
  });

  test('no horizontal scroll on the full page', async ({ page }) => {
    await ready(page);
    for (const y of [0.25, 0.5, 0.75, 1]) {
      await page.evaluate((p) => window.scrollTo({ top: document.documentElement.scrollHeight * p, behavior: 'instant' }), y);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('API /api/demo-requests', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'server behaviour, run once');

  test('rejects invalid input with field errors', async ({ request }) => {
    const r = await request.post('/api/demo-requests', { data: { name: '', gym: 'x', email: 'bad' }, headers: { 'x-forwarded-for': '10.0.0.1' } });
    expect(r.status()).toBe(422);
    expect((await r.json()).fields).toMatchObject({ name: expect.any(String), email: expect.any(String) });
  });

  test('honeypot submissions get a quiet 200 and are not delivered', async ({ request }) => {
    const r = await request.post('/api/demo-requests', {
      data: { name: 'Bot', gym: 'Bot gym', email: 'bot@example.com', website: 'http://spam.example' },
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });
    expect(r.status()).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
  });

  test('rejects non-JSON and oversized bodies', async ({ request }) => {
    const a = await request.post('/api/demo-requests', { data: 'name=x', headers: { 'content-type': 'text/plain', 'x-forwarded-for': '10.0.0.3' } });
    expect(a.status()).toBe(415);
    const b = await request.post('/api/demo-requests', {
      data: { name: 'x'.repeat(9000), gym: 'g', email: 'a@b.co' },
      headers: { 'x-forwarded-for': '10.0.0.4' },
    });
    expect(b.status()).toBe(413);
  });

  test('rate limits to 5 per IP per hour', async ({ request }) => {
    const ip = { 'x-forwarded-for': `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await request.post('/api/demo-requests', { data: { name: '' }, headers: ip })).status());
    expect(statuses.slice(0, 5).every((s) => s === 422)).toBe(true);
    expect(statuses[5]).toBe(429);
  });
});
