#!/usr/bin/env node
// Netlify build step: copy only the public site into dist/ (no .claude tooling, tools or notes).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const SKIP = new Set(['dist', 'tools', 'node_modules', 'CLAUDE.md', 'DEPLOY.md', 'netlify.toml', 'vercel.json']);

fs.rmSync(OUT, { recursive: true, force: true });
let count = 0;
(function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name.startsWith('.') || (from === ROOT && SKIP.has(e.name)) || e.name === 'README.md') continue;
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b); else if (e.isFile()) { fs.copyFileSync(a, b); count++; }
  }
})(ROOT, OUT);
console.log(`dist/: ${count} files`);
