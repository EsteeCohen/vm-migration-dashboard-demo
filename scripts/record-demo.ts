/**
 * Automated demo tour — captures a GIF and a WebM video of the full app flow.
 * Run with: npx tsx scripts/record-demo.ts
 * (start the dev server first: npm run dev)
 */

import { chromium, type Page } from 'playwright';
import GIFEncoder from 'gif-encoder-2';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5173';
const OUT_DIR = 'docs';
const GIF_PATH = path.join(OUT_DIR, 'demo.gif');
const WEBM_PATH = path.join(OUT_DIR, 'demo.webm');
const W = 1280;
const H = 740;

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── GIF helpers ───────────────────────────────────────────────────────────────

const frames: { buf: Buffer; delay: number }[] = [];

async function snap(page: Page, delay: number) {
  const buf = await page.screenshot({ type: 'png' });
  frames.push({ buf, delay });
  process.stdout.write('.');
}

function buildGif() {
  const encoder = new GIFEncoder(W, H, 'neuquant', true);
  const stream = encoder.createReadStream();

  const chunks: Buffer[] = [];
  stream.on('data', (chunk: Buffer) => chunks.push(chunk));

  encoder.start();
  encoder.setRepeat(0);  // loop forever

  for (const { buf, delay } of frames) {
    const png = PNG.sync.read(buf);
    encoder.setDelay(delay);
    // gif-encoder-2 expects RGBA Uint8ClampedArray
    encoder.addFrame(new Uint8ClampedArray(png.data));
  }

  encoder.finish();

  return new Promise<void>((resolve) => {
    stream.on('end', () => {
      const gif = Buffer.concat(chunks);
      fs.writeFileSync(GIF_PATH, gif);
      resolve();
    });
  });
}

// ── Smooth scroll helper ──────────────────────────────────────────────────────

async function smoothScroll(page: Page, y: number) {
  await page.evaluate((target) => {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, y);
  await page.waitForTimeout(600);
}

// ── Tour ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎬  Starting demo recording tour...\n');

  const browser = await chromium.launch({
    headless: false,   // visible window — looks better in recordings
    slowMo: 60,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
  });

  const page = await context.newPage();

  // ── 1. Login page ─────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await snap(page, 2800);   // show the beautiful login design

  // Click DEMO button — fills credentials automatically
  await page.click('button:has-text("DEMO")');
  await page.waitForTimeout(500);
  await snap(page, 1200);

  // Click Sign In
  await page.click('button[type="submit"]:has-text("Sign in")');
  await page.waitForURL(BASE + '/');
  await page.waitForTimeout(1200);

  // ── 2. Dashboard ─────────────────────────────────────────────────────────
  await page.waitForSelector('text=Migration Plans');
  await page.waitForTimeout(600);
  await snap(page, 2800);   // summary cards + charts

  // Scroll down to show recent plans table
  await smoothScroll(page, 400);
  await snap(page, 2000);
  await smoothScroll(page, 0);

  // ── 3. Providers page ────────────────────────────────────────────────────
  await page.click('text=Providers');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await snap(page, 2500);

  // ── 4. Migration Plans page ──────────────────────────────────────────────
  await page.click('text=Plans');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await snap(page, 2200);

  // Filter to show only running plans
  await page.click('button[aria-label="Filter by status"]').catch(() => {});  // ignore if not found
  await page.waitForTimeout(300);

  // ── 5. Open a running plan detail ─────────────────────────────────────────
  // Click the first plan that has "running" or just click the first detail link
  const planLink = page.locator('a[href*="/plans/plan-"]').first();
  if (await planLink.count() > 0) {
    await planLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await snap(page, 2500);   // plan detail with per-VM progress
  }

  // ── 6. Cluster page ───────────────────────────────────────────────────────
  await page.click('text=Cluster');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await snap(page, 2200);

  // ── 7. Dark mode ──────────────────────────────────────────────────────────
  // Toggle dark mode
  const darkBtn = page.locator('button[aria-label*="dark"], button[aria-label*="light"]').first();
  await darkBtn.click();
  await page.waitForTimeout(700);
  await snap(page, 1800);   // page in dark mode

  // Toggle back to light
  await darkBtn.click();
  await page.waitForTimeout(400);

  // ── 8. About page ────────────────────────────────────────────────────────
  await page.click('text=About');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await snap(page, 2000);   // architecture diagram

  // Scroll down to show more of the about page
  await smoothScroll(page, 350);
  await snap(page, 1800);
  await smoothScroll(page, 0);

  // ── 9. Back to dashboard ─────────────────────────────────────────────────
  await page.click('text=Dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  await snap(page, 1500);

  console.log('\n');

  // ── Close browser — this finalises the WebM ───────────────────────────────
  await context.close();
  await browser.close();

  // Rename the generated webm to a predictable name
  const webmFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
  if (webmFiles.length > 0) {
    const src = path.join(OUT_DIR, webmFiles[webmFiles.length - 1]);
    fs.renameSync(src, WEBM_PATH);
    console.log(`✅  Video saved: ${WEBM_PATH}`);
  }

  // ── Build GIF from captured frames ───────────────────────────────────────
  console.log(`\n🖼   Encoding GIF from ${frames.length} frames...`);
  await buildGif();
  const sizeMB = (fs.statSync(GIF_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`✅  GIF saved:   ${GIF_PATH}  (${sizeMB} MB)`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎  To add to your README:

    ![Demo](docs/demo.gif)

    For the WebM (smaller file, GitHub supports it):
    Upload docs/demo.webm to GitHub via drag-drop
    into any Issue or PR comment box, copy the CDN
    URL, then in README:

    https://github.com/user-attachments/assets/...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
