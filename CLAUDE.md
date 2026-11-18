# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This is the website for Cursive Studios. No site code exists yet: there is no framework, build step, package.json or test suite. The only content is the vendored Hallmark design skill in `.claude/skills/hallmark/`. Update this file once a stack is chosen and real build/run commands exist.

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
