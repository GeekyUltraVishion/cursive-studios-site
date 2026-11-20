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
- Do not place any logo watermark over the videos. (Clarified later: the site must never add a watermark overlay, but the owner's own videos may have their Cursive Studios logo baked in, as posted on Instagram. Upload those as they are.)
- Visitors can play videos but should not be able to download them: keep `controlslist="nodownload"` and `disablepictureinpicture` on every `<video>`, the right-click/drag block in `js/main.js`, and the `noindex` headers on `/content/ugc/videos/` and `/content/videos/` in `vercel.json` and `netlify.toml`.
- Do not use LinkedIn anywhere. The only social channel is Instagram.
- Keep the founder's personal name off the site. Use "Cursive Studios" only

### TECH

Plain HTML, CSS and JavaScript (no framework). Three.js for 3D, loaded only where needed. Videos and images live in /content, driven by JSON data files. Deploys on Vercel or Netlify.

## Repository state

Static site, no build step or package.json. Pages: `index.html` (homepage) and four service pages at the root: `ai-ugc-ads.html`, `motion-graphics.html`, `website-design.html`, `3d-websites.html`, linked as `/ai-ugc-ads` etc. (clean URLs on Vercel, Netlify and http-server). The four service pages share one layout and identical header/footer markup; change all four together.

- Service pages: `css/service.css` (imports `main.css`) and `js/gallery.js`, which builds the filter tabs, cards and the `<dialog>` preview from `content/<slug>.json` (format in `content/README.md`).
- AI UGC Ads is different: `css/ugc.css` (imports `service.css`) and `js/ugc.js` read `content/ugc/videos.json`; videos in `content/ugc/videos/`, thumbs in `content/ugc/thumbs/` (or full https URLs to an external host). Hover previews on desktop, tap-to-preview then tap-for-player on touch, full-screen `<dialog>` player with sound, category tabs, newest-first order, latest-3 strip in the hero. `tools/add-ugc-video.mjs` (Node + ffmpeg) copies/compresses a video, makes the thumbnail and adds the entry; see `content/ugc/README.md`. The 8 current entries are generated placeholder clips (`"placeholder": true`).

- 3D: Three.js r170 is vendored at `js/vendor/three.module.min.js` (167 KB gzip) and loaded only by dynamic `import()` on the two pages that use it. `js/three/support.js` (tiny, no Three.js) decides: `tier()` returns `none` (data saver, 2G, no WebGL: keep the still image), `lite` (touch, small screen, <=4 cores or <=4 GB: fewer polygons, lower resolution) or `full`. Homepage hero: `js/three/chrome.js` (a polished chrome letter C, a rounded pen stroke under a baked studio environment), mounted into `#hero-3d` after the page is idle, skipped under reduced motion; still images `content/images/hero-chrome-*.webp|jpg`. 3D Websites demo: `js/three/product.js` (drag or arrow keys to turn a serum bottle), mounted when `#product-3d` scrolls near; still `content/images/demo-bottle-*`. Both read colours from `css/settings.css` tokens, pause offscreen and have a visible Pause button. If the 3D changes, re-capture the stills.
- Scroll reveal: any element with `data-reveal` fades and rises in once (`js/main.js` IntersectionObserver + MutationObserver, so gallery cards added later are picked up); off under reduced motion. Smooth anchor scrolling is CSS (`scroll-behavior: smooth`, also off under reduced motion).
- Contact: `contact.html` (+ `css/contact.css`, `js/contact.js`), `thanks.html` (Netlify's no-JS redirect target) and `404.html` (root-absolute asset paths, since it is served at any URL). The enquiry form posts to Netlify Forms (`data-netlify`, honeypot `company-website`) or Formspree, chosen in `content/data.json` `form`; it must never show success without a real 2xx from the service. Style options mirror the gallery data files. A floating "DM us on Instagram" button (`.dm-float` inside `aside.dm-float-wrap`) shows under 60rem on every page except thanks/404 and steps aside while `#contact`, the footer or the hero actions are on screen.
- SEO: every page has title, description, canonical, Open Graph/Twitter tags with a 1200x630 image in `content/images/share/<slug>.jpg` (template `tools/og-template.html`), and JSON-LD (Organization on home, Service on service pages, ContactPage). `sitemap.xml`, `robots.txt`. The domain is the placeholder `https://cursivestudios.example` until `node tools/set-site.mjs --domain ... --email ... --instagram ...` is run; that tool rewrites domain, email and handle everywhere.
- CSS is linked directly in each page's head (settings, tokens, base, main, then service, ugc or contact), not via `@import`, to avoid request chains. Fonts are self-hosted in `fonts/` with `@font-face` in `settings.css` and two `<link rel="preload">` per page.
- `index.html`: the homepage. `js/main.js`: mobile menu, and fills contact links and featured work from `content/data.json` (the HTML holds the same content as a no-JS fallback, so keep the two in step).
- Logo: the badge (ivory circle, black C, copper swoosh; the owner chose to keep its copper on the black and white site) (`content/images/brand/logo-badge-{96,160,512}.webp|png`, cropped to a circle from the owner's file, source in `logo-badge-source.png`) sits beside the "Cursive Studios" text in the header and footer of all five pages, as one link to `/`. Favicons: `favicon.ico`, `apple-touch-icon.png`, `content/images/brand/favicon-32.png`. `logo-on-white.png` is the owner's version for light backgrounds (its black C disappears on this dark site, so it is not used here).
- `css/settings.css`: every colour and both fonts (the one file to restyle the site). `css/tokens.css`: spacing/type scale. `css/base.css`: Hallmark scaffold base. `css/main.css`: page styles, starting with the Hallmark stamp.
- `content/`: `videos/`, `images/`, `data.json` (see `content/README.md`). Entries with `"placeholder": true` are Wikimedia stand-ins shown in greyscale. The owner does not want photographer names in the footer, so the footer only shows an "Image credits" link (while stand-ins are on that page) to `credits.html`, which lists them from the data files. Most are CC BY/BY-SA, so keep that page while any stand-in remains.
- Hallmark design: Midnight layout in black and white by the owner's request (near-black ground, white ink, white primary button; only the logo and status colours have hue), build log in `.hallmark/log.json`.

Run locally (the JSON fetch needs http, not `file://`):

```bash
npx http-server -p 4173 -c-1 .
```

Deploy: Vercel uses `vercel.json` + `.vercelignore`; Netlify runs `node tools/build-dist.mjs`, which copies only the public site into `dist/` (no `.claude/`, `tools/`, READMEs). Both configs set noindex on raw video folders and cache headers for fonts, images and the vendored Three.js.

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
