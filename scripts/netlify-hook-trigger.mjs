#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const hookType = (process.argv[2] || '').trim().toLowerCase();

const HOOK_ENV = {
  primary: 'NETLIFY_BUILD_HOOK_PRIMARY',
  secondary: 'NETLIFY_BUILD_HOOK_SECONDARY',
  preview: 'NETLIFY_PREVIEW_SERVER_HOOK',
};

const label = {
  primary: 'primary build',
  secondary: 'secondary build',
  preview: 'preview server',
};

if (!HOOK_ENV[hookType]) {
  console.error('Usage: node scripts/netlify-hook-trigger.mjs <primary|secondary|preview>');
  process.exit(2);
}

const envKey = HOOK_ENV[hookType];
const hookUrl = (process.env[envKey] || '').trim();
if (!hookUrl) {
  console.error(`Missing ${envKey}. Configure this secret/environment variable with the Netlify ${label[hookType]} hook URL.`);
  process.exit(2);
}

let out = '';
try {
  out = execFileSync('curl', ['-sS', '-i', '-X', 'POST', '-H', 'Content-Type: application/json', '-d', '{}', hookUrl], {
    encoding: 'utf8',
  });
} catch (err) {
  console.error(`Failed to call Netlify ${label[hookType]} hook.`);
  if (err.stdout) process.stderr.write(String(err.stdout));
  if (err.stderr) process.stderr.write(String(err.stderr));
  process.exit(1);
}

const statusLine = out.split('\n').find((line) => /^HTTP\//i.test(line.trim()));
const statusMatch = statusLine?.match(/\s(\d{3})\s/);
const status = statusMatch ? Number(statusMatch[1]) : NaN;

if (!Number.isFinite(status) || status < 200 || status >= 300) {
  console.error(`Netlify ${label[hookType]} hook failed (${statusLine || 'unknown response'}).`);
  process.stderr.write(out);
  process.exit(1);
}

console.log(`Triggered Netlify ${label[hookType]} hook: ${statusLine}`);
