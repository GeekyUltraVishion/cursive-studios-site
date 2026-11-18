#!/usr/bin/env node
// Add a video to the AI UGC Ads gallery: copies (or compresses) it into content/ugc/videos,
// grabs a thumbnail into content/ugc/thumbs, and adds an entry to content/ugc/videos.json.
// Needs Node 18+ and ffmpeg (with ffprobe) on your PATH.
//
//   node tools/add-ugc-video.mjs <video-file> --title "Glow serum" --category skincare
//        [--date 2026-11-18] [--caption "..."] [--at 1.5] [--compress] [--dry-run]
//
// Run with --help for details.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'content/ugc/videos.json');
const VIDEOS = path.join(ROOT, 'content/ugc/videos');
const THUMBS = path.join(ROOT, 'content/ugc/thumbs');
const WARN_MB = 50;   // GitHub warns above 50 MB
const MAX_MB = 100;   // GitHub rejects files above 100 MB

const HELP = `Add a video to the AI UGC Ads gallery.

  node tools/add-ugc-video.mjs <video-file> --title "Title" --category <id> [options]

Options
  --title "..."      Card title (required)
  --category <id>    One of the category ids in content/ugc/videos.json (required)
  --date YYYY-MM-DD  Date shown on the card; defaults to today. Newest dates show first.
  --caption "..."    Line shown in the full-screen player
  --at <seconds>     Where to take the thumbnail from; defaults to 1
  --compress         Re-encode for the web (H.264, max 1080x1920, fast start). Use it on big exports.
  --dry-run          Show what would happen and change nothing
  --help             This text

Example
  node tools/add-ugc-video.mjs ~/Exports/glow-serum.mp4 --title "Glow serum, morning routine" --category skincare --compress
`;

function fail(msg) { console.error(`\nError: ${msg}\n`); process.exit(1); }

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--compress') out.compress = true;
    else if (a === '--dry-run') out.dry = true;
    else if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val === undefined || val.startsWith('--')) fail(`${a} needs a value.`);
      out[key] = val; i++;
    } else out._.push(a);
  }
  return out;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.error && r.error.code === 'ENOENT') fail(`${cmd} was not found. Install ffmpeg (it includes ffprobe): https://ffmpeg.org/download.html, or "brew install ffmpeg" on a Mac, "winget install ffmpeg" on Windows.`);
  if (r.status !== 0) fail(`${cmd} failed:\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
  return r.stdout;
}

const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';
const mb = (bytes) => bytes / 1024 / 1024;
const today = () => new Date().toISOString().slice(0, 10);

const args = parseArgs(process.argv.slice(2));
if (args.help || args._.length === 0) { console.log(HELP); process.exit(args.help ? 0 : 1); }

const input = path.resolve(args._[0]);
if (!fs.existsSync(input)) fail(`Video not found: ${input}`);
if (!args.title) fail('Add a title with --title "..."');
if (!fs.existsSync(DATA)) fail(`Data file not found: ${DATA}`);

let data;
try { data = JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch (e) { fail(`content/ugc/videos.json is not valid JSON: ${e.message}`); }
data.videos ??= [];
const ids = (data.categories || []).map((c) => c.id);
if (!args.category) fail(`Add a category with --category. Choose from: ${ids.join(', ')}`);
if (!ids.includes(args.category)) fail(`Unknown category "${args.category}". Choose from: ${ids.join(', ')} (or add a new one to "categories" in videos.json).`);
const date = args.date || today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) fail(`--date must look like 2026-11-18, got "${date}".`);
const at = args.at === undefined ? 1 : Number(args.at);
if (!Number.isFinite(at) || at < 0) fail('--at must be a number of seconds, like 1.5');

// Probe the video
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', input]));
const stream = probe.streams?.[0];
if (!stream) fail('That file has no video stream.');
const duration = Number(probe.format?.duration) || 0;
const { width, height } = stream;
if (width >= height) console.warn(`Warning: this video is ${width}x${height}, not vertical. Cards are 9:16, so it will be cropped.`);
const thumbAt = duration && at >= duration ? Math.max(0, duration / 2) : at;

// Unique file names
let slug = slugify(args.title);
const taken = (s) => fs.existsSync(path.join(VIDEOS, `${s}.mp4`)) || data.videos.some((v) => v.file === `${s}.mp4`);
for (let n = 2; taken(slug); n++) slug = `${slugify(args.title)}-${n}`;
const videoOut = path.join(VIDEOS, `${slug}.mp4`);
const thumbOut = path.join(THUMBS, `${slug}.jpg`);
const entry = { file: `${slug}.mp4`, thumb: `${slug}.jpg`, title: args.title, category: args.category, date, caption: args.caption || '' };

if (args.dry) {
  console.log(`Would ${args.compress ? 'compress' : 'copy'} ${input}\n  -> ${path.relative(ROOT, videoOut)}\nWould write thumbnail at ${thumbAt}s\n  -> ${path.relative(ROOT, thumbOut)}\nWould add to content/ugc/videos.json:\n${JSON.stringify(entry, null, 2)}`);
  process.exit(0);
}

fs.mkdirSync(VIDEOS, { recursive: true });
fs.mkdirSync(THUMBS, { recursive: true });

if (args.compress) {
  console.log('Compressing for the web...');
  run('ffmpeg', ['-v', 'error', '-y', '-i', input,
    '-vf', 'scale=w=1080:h=1920:force_original_aspect_ratio=decrease:force_divisible_by=2',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', videoOut]);
} else if (path.extname(input).toLowerCase() === '.mp4') {
  fs.copyFileSync(input, videoOut);
} else {
  fail('Only .mp4 files can be copied as they are. Add --compress to convert this file to .mp4.');
}

run('ffmpeg', ['-v', 'error', '-y', '-ss', String(thumbAt), '-i', videoOut, '-frames:v', '1',
  '-vf', 'scale=w=540:h=960:force_original_aspect_ratio=increase,crop=540:960', '-q:v', '3', thumbOut]);

const size = mb(fs.statSync(videoOut).size);
data.videos.push(entry);
data.videos.sort((a, b) => String(b.date).localeCompare(String(a.date)));
fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n');

console.log(`\nAdded "${entry.title}" (${entry.category}, ${entry.date})
  video      ${path.relative(ROOT, videoOut)}  (${size.toFixed(1)} MB)
  thumbnail  ${path.relative(ROOT, thumbOut)}
  data       content/ugc/videos.json`);
if (size > MAX_MB) console.warn(`\nThis video is over ${MAX_MB} MB, so GitHub will refuse the push. Run again with --compress, or host it externally (see content/ugc/README.md).`);
else if (size > WARN_MB) console.warn(`\nThis video is over ${WARN_MB} MB. GitHub will warn on push and it will be slow to load. Try --compress, or host it externally (see content/ugc/README.md).`);
console.log('\nNext: commit and push. Your host redeploys and the video appears.');
