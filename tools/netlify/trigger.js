#!/usr/bin/env node
'use strict';

const { argv, exit } = require('node:process');

const HOOKS = {
  build: {
    description: 'Trigger the primary Storyboard production build hook',
    url: 'https://api.netlify.com/build_hooks/6908472cbe9f34c6bb2b1675'
  },
  preview: {
    description: 'Trigger the Storyboard preview server refresh hook',
    url: 'https://api.netlify.com/preview_server_hooks/68c5147a6f867751dd5ab91c'
  }
};

const HELP_TEXT = `Usage: node tools/netlify/trigger.js <target>

Targets:
  build    Trigger the production build hook.
  preview  Trigger the preview server hook.
  all      Trigger both hooks sequentially.
  help     Show this message.

Examples:
  node tools/netlify/trigger.js build
  node tools/netlify/trigger.js all
`;

function resolveTargets(argument) {
  if (!argument || argument === 'help' || argument === '--help' || argument === '-h') {
    return { type: 'help' };
  }

  if (argument === 'all') {
    return { type: 'hooks', names: Object.keys(HOOKS) };
  }

  if (!HOOKS[argument]) {
    return { type: 'error', message: `Unknown target "${argument}". Use one of: ${Object.keys(HOOKS).concat('all').join(', ')}.` };
  }

  return { type: 'hooks', names: [argument] };
}

async function triggerHook(name, { url }) {
  process.stdout.write(`→ Triggering ${name} hook... `);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`received ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`);
    }

    process.stdout.write('done.');
    if (text) {
      process.stdout.write(`\n   response: ${text}`);
    }
    process.stdout.write('\n');
  } catch (error) {
    process.stdout.write('failed.\n');
    throw error;
  }
}

async function main() {
  const argument = argv[2];
  const result = resolveTargets(argument);

  if (result.type === 'help') {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (result.type === 'error') {
    process.stderr.write(`${result.message}\n`);
    process.stderr.write('\n');
    process.stderr.write(HELP_TEXT);
    exit(1);
    return;
  }

  for (const name of result.names) {
    await triggerHook(name, HOOKS[name]);
  }
}

main().catch((error) => {
  process.stderr.write(`Hook trigger failed: ${error.message}\n`);
  exit(1);
});
