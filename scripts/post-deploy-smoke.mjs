#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const target = (process.argv[2] || process.env.SMOKE_BASE_URL || '').trim();
if (!target) {
  console.error('Usage: node scripts/post-deploy-smoke.mjs <base-url>');
  process.exit(2);
}

const baseUrl = target.endsWith('/') ? target.slice(0, -1) : target;
const keyRoute = '/boards';

function fetchWithCurl(url) {
  const out = execFileSync('curl', ['-sS', '-L', '-w', '\n%{http_code}', url], {
    encoding: 'utf8',
  });
  const idx = out.lastIndexOf('\n');
  const body = out.slice(0, idx);
  const status = Number(out.slice(idx + 1));
  return { body, status };
}

function checkHtml(pathname) {
  const url = `${baseUrl}${pathname}`;
  const { body, status } = fetchWithCurl(url);
  if (status < 200 || status >= 300) {
    const details = summarizeFailure(status, body);
    throw new Error(`${url} returned ${status}${details ? ` (${details})` : ''}`);
  }
  if (!body.toLowerCase().includes('<html')) throw new Error(`${url} did not return HTML`);
  console.log(`PASS ${url} -> ${status}`);
  return body;
}

function summarizeFailure(status, body) {
  const trimmed = (body || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = JSON.parse(trimmed);
    if (status === 503 && parsed.error === 'usage_exceeded') {
      return 'Netlify site usage quota exceeded; increase plan/quota, wait for reset, or reduce transfer usage';
    }
    if (status === 404 && parsed.message && typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    // Non-JSON body: keep fallback below.
  }

  const snippet = trimmed.replace(/\s+/g, ' ').slice(0, 140);
  return `response snippet: ${snippet}`;
}

function extractBundlePath(html) {
  const match = html.match(/assets\/index-[^"'\s>]+\.js/i);
  if (!match) throw new Error('Could not find bundled JS path in root HTML');
  return match[0];
}

function checkBundle(bundlePath) {
  const url = `${baseUrl}/${bundlePath}`;
  const { body, status } = fetchWithCurl(url);
  if (status < 200 || status >= 300) throw new Error(`${url} returned ${status}`);
  if (body.length < 1000) throw new Error(`${url} appears too small (${body.length} bytes)`);
  console.log(`PASS ${url} -> ${status} (${body.length} bytes)`);
}

try {
  const rootHtml = checkHtml('/');
  checkHtml(keyRoute);
  checkBundle(extractBundlePath(rootHtml));
  console.log('Smoke check completed successfully.');
} catch (err) {
  console.error(`FAIL ${err.message}`);
  process.exit(1);
}
