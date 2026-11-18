# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project brief

You are helping me build the portfolio website for my freelance business,
Cursive Studios (always spelled with an s). I am a solo founder. I will paste
a series of prompts, one at a time. Build in stages and wait for my approval
before moving on.

### BUSINESS

Cursive Studios offers four services:
1. AI UGC ads (short AI-generated video ads for brands)
2. Motion Graphics (product motion graphics and property or building motion
graphics)
3. Website Design (normal, modern business websites)
4. 3D Websites (websites with interactive 3D elements)

Target clients: small and mid-size brands and businesses in the US, UK and
India (skincare, supplements, pet, cafes, restaurants, gyms, clinics, real
estate and others).

### RULES

- Do not show any prices anywhere on the site. Contact is by Instagram DM or
email only.
- Our content is AI-generated and the Instagram page already says so. Add one
short line in the footer: "Content created with AI tools." Do not repeat AI
disclaimers elsewhere.
- Do not place any logo watermark over the videos.
- Do not use LinkedIn anywhere. The only social channel is Instagram.
- Keep the founder's personal name off the site. Use "Cursive Studios" only

### TECH

Plain HTML, CSS and JavaScript (no framework). Three.js for 3D, loaded only where needed. Videos and images live in /content, driven by JSON data files. Deploys on Vercel or Netlify.

## Repository state

No site code exists yet: there is no build step, package.json or test suite. The only content is the vendored Hallmark design skill in `.claude/skills/hallmark/`. Add the real run/preview commands here once the first pages exist.

## Design: Hallmark skill

Hallmark (from `Nutlope/hallmark`, MIT) is committed into the repo so every session gets it without a global install. Use it for new pages and designs (`/hallmark <prompt>`). Use it on an existing page only when the user names it: `/hallmark redesign <path>` (keeps content and wiring) or `/hallmark audit <path>` (only reports).

Hallmark produces self-contained HTML/CSS pages. Its non-waivable "Floor" (in `SKILL.md`) applies to all pages in this site, even ones built without the skill. The key rules: every colour and font goes through `:root` tokens; no invented metrics, testimonials or logos; `:focus-visible` and `prefers-reduced-motion` on everything; and no eyebrows or tracked-capital labels.

Lint a page before handing it back. Fix every `FAIL` and fix or waive every `REFLEX`:

```bash
node .claude/skills/hallmark/scripts/sloplint.mjs <file-or-dir> --render
```

`--render` needs `puppeteer-core` and Chrome. Chromium is at `/opt/pw-browsers/chromium` in cloud sessions. Without them, only the static checks run.

The skill's own script tests use Node's built-in runner (Node 18+):

```bash
node --test .claude/skills/hallmark/scripts/*.test.mjs
```

Run a single file by naming it, e.g. `node --test .claude/skills/hallmark/scripts/theme.test.mjs`. Most render tests skip without `puppeteer-core`.

Don't hand-edit the vendored skill. To update it, re-clone upstream and copy `skills/hallmark/` over `.claude/skills/hallmark/`. Run upstream's `scripts/install.mjs` first so it validates the themes and regenerates `references/themes/index.json`.
