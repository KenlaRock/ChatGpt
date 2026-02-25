#!/usr/bin/env node
const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright saknas. Installera med: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

function makePngBytes(base64) {
  return Buffer.from(base64, 'base64');
}

const pngA = makePngBytes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=');
const pngB = makePngBytes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4DwQACfsD/Ql6h9kAAAAASUVORK5CYII=');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Redigeringsläge' }).click();
const input = page.locator('input[type="file"]').first();
await input.setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: pngA });
await page.waitForTimeout(400);
await input.setInputFiles({ name: 'b.png', mimeType: 'image/png', buffer: pngB });
await page.waitForTimeout(1200);

const before = await page.locator('text=i biblioteket').first().innerText();

const imageSelect = page.locator('select').filter({ hasText: 'Ingen bild vald' }).first();
await imageSelect.selectOption({ index: 1 });
await page.waitForTimeout(500);

await page.reload({ waitUntil: 'networkidle' });
const after = await page.locator('text=i biblioteket').first().innerText();

if (!before.includes('2 bilder') || !after.includes('2 bilder')) {
  console.error(`E2E misslyckades. before="${before}", after="${after}"`);
  await browser.close();
  process.exit(2);
}

await browser.close();
console.log(`E2E OK: ${before} -> ${after}`);
