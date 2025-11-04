#!/usr/bin/env node
'use strict';

const { mkdir, copyFile, stat } = require('node:fs/promises');
const path = require('node:path');

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function ensureDirectory(target) {
  await mkdir(target, { recursive: true });
}

async function copyWithLog(source, destination) {
  await copyFile(source, destination);
  process.stdout.write(`Copied ${path.relative(process.cwd(), source)} → ${path.relative(process.cwd(), destination)}\n`);
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const distDir = path.join(repoRoot, 'apps', 'storyboard', 'dist');

  const files = [
    {
      source: path.join(repoRoot, 'index.html'),
      destination: path.join(distDir, 'index.html')
    },
    {
      source: path.join(repoRoot, 'manifest.webmanifest'),
      destination: path.join(distDir, 'manifest.webmanifest')
    }
  ];

  if (!(await pathExists(distDir))) {
    throw new Error('Storyboard distribution directory is missing. Did you check out the repo correctly?');
  }

  await ensureDirectory(distDir);

  for (const file of files) {
    if (!(await pathExists(file.source))) {
      throw new Error(`Required asset not found: ${path.relative(repoRoot, file.source)}`);
    }
    await copyWithLog(file.source, file.destination);
  }

  process.stdout.write('Standalone assets prepared for Netlify publish folder.\n');
}

main().catch((error) => {
  process.stderr.write(`Failed to stage standalone assets: ${error.message}\n`);
  process.exit(1);
});
