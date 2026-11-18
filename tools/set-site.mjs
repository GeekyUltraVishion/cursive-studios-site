#!/usr/bin/env node
// Set the site's real domain, email and Instagram handle everywhere at once:
// every page (links, share tags, structured data), sitemap.xml, robots.txt and content/data.json.
//
//   node tools/set-site.mjs --domain https://www.cursivestudios.com --email hello@cursivestudios.com --instagram cursivestudios
//
// Run it again later to change any one of them. Add --dry-run to see what would change.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : a), []));
if (!args.domain && !args.email && !args.instagram) {
  console.log('Usage: node tools/set-site.mjs [--domain https://www.example.com] [--email you@example.com] [--instagram handle] [--dry-run]');
  process.exit(1);
}

const dataPath = path.join(ROOT, 'content/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const files = [...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')), 'sitemap.xml', 'robots.txt'].map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f));

// What the files hold now
const oldDomain = (fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8').match(/Sitemap:\s*(https?:\/\/[^/\s]+)/) || [])[1];
const oldEmail = data.contact.email;
const oldHandle = data.contact.instagram;

const swaps = [];
if (args.domain) {
  const d = String(args.domain).replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)) { console.error('--domain should look like https://www.cursivestudios.com'); process.exit(1); }
  swaps.push([oldDomain, d]);
}
if (args.email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args.email)) { console.error('--email does not look like an email address'); process.exit(1); }
  swaps.push([oldEmail, args.email]);
  data.contact.email = args.email;
}
if (args.instagram) {
  const h = String(args.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9._]{1,30}$/i.test(h)) { console.error('--instagram should be your handle, like cursivestudios'); process.exit(1); }
  swaps.push([`instagram.com/${oldHandle}/`, `instagram.com/${h}/`], [`ig.me/m/${oldHandle}`, `ig.me/m/${h}`], [`@${oldHandle}<`, `@${h}<`]);
  data.contact.instagram = h;
}
if (args.email && args.instagram) data.contact.placeholder = false;

let changed = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  for (const [from, to] of swaps) if (from && from !== to) s = s.split(from).join(to);
  // the email shows with a dashed "placeholder" outline until it is real
  if (args.email) s = s.replace(/<span class="fill" data-email-text>/g, '<span data-email-text>');
  if (s !== before) { changed++; if (!args['dry-run']) fs.writeFileSync(f, s); console.log(`${args['dry-run'] ? 'would update' : 'updated'}  ${path.relative(ROOT, f)}`); }
}
if (!args['dry-run']) fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`${args['dry-run'] ? 'would update' : 'updated'}  content/data.json\n${changed} page files ${args['dry-run'] ? 'would change' : 'changed'}. Commit and push to publish.`);
