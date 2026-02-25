#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const hookType = (process.argv[2] || '').trim().toLowerCase();

const HOOK_ENV = {
  primary: 'NETLIFY_BUILD_HOOK_PRIMARY',
  secondary: 'NETLIFY_BUILD_HOOK_SECONDARY',
  preview: 'NETLIFY_PREVIEW_SERVER_HOOK',
  'preview:secondary': 'NETLIFY_PREVIEW_SERVER_HOOK_SECONDARY',
};


const DEFAULT_HOOK_URL = {
  primary: 'https://api.netlify.com/build_hooks/699f04659adb693fea055cc0',
  secondary: 'https://api.netlify.com/build_hooks/699f04869662fb3d15b13d18',
  preview: 'https://api.netlify.com/preview_server_hooks/699f04f7bcd708545509329f',
  'preview:secondary': 'https://api.netlify.com/preview_server_hooks/699f050e9adb693f160565c9',
};

const LABEL = {
  primary: 'primary build',
  secondary: 'secondary build',
  preview: 'preview server',
  'preview:secondary': 'secondary preview server',
};

if (!HOOK_ENV[hookType]) {
  console.error('Usage: node scripts/netlify-hook-trigger.mjs <primary|secondary|preview|preview:secondary>');
  process.exit(2);
}

const envKey = HOOK_ENV[hookType];
const hookUrl = (process.env[envKey] || DEFAULT_HOOK_URL[hookType] || '').trim();
if (!hookUrl) {
  console.error(`Missing ${envKey} and no default exists for ${hookType}. Configure this environment variable with the Netlify ${LABEL[hookType]} hook URL.`);
  process.exit(2);
}

function postHook(url) {
  const out = execFileSync(
    'curl',
    ['-sS', '-X', 'POST', '-H', 'Content-Type: application/json', '-d', '{}', '-w', '\n%{http_code}', url],
    { encoding: 'utf8' },
  );

  const idx = out.lastIndexOf('\n');
  const body = idx >= 0 ? out.slice(0, idx) : '';
  const status = Number(idx >= 0 ? out.slice(idx + 1) : 'NaN');
  return { status, body: body.trim() };
}

try {
  const { status, body } = postHook(hookUrl);
  if (!Number.isFinite(status) || status < 200 || status >= 300) {
    const snippet = body ? body.replace(/\s+/g, ' ').slice(0, 160) : 'empty body';
    console.error(`Netlify ${LABEL[hookType]} hook failed (${status}). Response: ${snippet}`);
    process.exit(1);
  }

  console.log(`Triggered Netlify ${LABEL[hookType]} hook (HTTP ${status}).`);
} catch (err) {
  console.error(`Failed to call Netlify ${LABEL[hookType]} hook.`);
  if (err.stdout) process.stderr.write(String(err.stdout));
  if (err.stderr) process.stderr.write(String(err.stderr));
  process.exit(1);
}
