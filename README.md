# Cursive Studios website

The portfolio site for Cursive Studios: AI UGC ads, motion graphics, website design and 3D websites.

This file is your reference for running, updating and publishing the site. Two other guides go deeper:

- **[DEPLOY.md](DEPLOY.md)**: putting the site live on Netlify, the enquiry form, your domain, and the after-launch checklist.
- **[content/README.md](content/README.md)** and **[content/ugc/README.md](content/ugc/README.md)**: every field in the data files, video hosting and file-size limits.

---

## Contents

1. [What the site is](#1-what-the-site-is)
2. [Before launch: what still needs your input](#2-before-launch-what-still-needs-your-input)
3. [Run it on your computer](#3-run-it-on-your-computer)
4. [Publish a change](#4-publish-a-change)
5. [Everyday tasks](#5-everyday-tasks)
6. [Where everything lives](#6-where-everything-lives)
7. [Rules the site follows](#7-rules-the-site-follows)
8. [Speed, search and accessibility](#8-speed-search-and-accessibility)
9. [Troubleshooting](#9-troubleshooting)
10. [Getting help from Claude Code](#10-getting-help-from-claude-code)

---

## 1. What the site is

Plain HTML, CSS and JavaScript. There is no framework, no database and no build step to learn. Text lives in the `.html` files; galleries, videos and contact details live in JSON files under `content/`, so you can update most things without touching code.

| Page | Address | File |
| --- | --- | --- |
| Homepage | `/` | `index.html` |
| AI UGC Ads | `/ai-ugc-ads` | `ai-ugc-ads.html` |
| Motion Graphics | `/motion-graphics` | `motion-graphics.html` |
| Website Design | `/website-design` | `website-design.html` |
| 3D Websites | `/3d-websites` | `3d-websites.html` |
| Contact | `/contact` | `contact.html` |
| After an enquiry | `/thanks` | `thanks.html` |
| Page not found | any wrong address | `404.html` |

**Look:** dark espresso background, ivory text, one copper accent. Fonts: Mona Sans for headings, Geist for body text. Everything visual is controlled from `css/settings.css`.

**Features**

- Homepage with a live 3D copper ribbon (Three.js), which becomes a still image on slow devices and under "reduce motion".
- AI UGC Ads video gallery: category tabs, newest first, hover to preview on desktop, tap to preview on phones, full-screen player with sound, and a "Latest from Instagram" strip.
- Style galleries on Motion Graphics, Website Design and 3D Websites, with filter tabs, previews and "Request this style" buttons.
- A drag-to-turn 3D bottle on the 3D Websites page.
- Contact page with Instagram DM, email and an enquiry form (Netlify Forms).
- A floating "DM us on Instagram" button on phones.
- Videos can be played but not casually downloaded.
- Titles, descriptions, share images, a sitemap and structured data for search engines.

---

## 2. Before launch: what still needs your input

Several things on the site are still placeholders. Work through this list before sharing the site widely.

| What | Where it is now | How to fix |
| --- | --- | --- |
| Your domain | `https://cursivestudios.example` | `tools/set-site.mjs` (section 5.1) |
| Your email | `hello@example.com` (dashed outline on the page) | same command |
| Your Instagram handle | `yourhandle` | same command |
| UGC videos | 8 coloured placeholder clips | section 5.2, then delete the placeholders |
| Homepage "Selected work" | 4 stand-in photos from Wikimedia | section 5.4 |
| Gallery samples | stand-in photos with made-up project names | section 5.3 |
| "What you get" text on each service page | written as a starting point | edit the page files (section 5.6) |
| Enquiry form | built, not yet connected | [DEPLOY.md](DEPLOY.md), section 4 |

Stand-in photos are tinted to match the site and credited in the footer as their licences require. When you replace them with your own work, delete their `credit` lines too.

---

## 3. Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer (and [ffmpeg](https://ffmpeg.org/download.html) only for the video script).

```bash
npx http-server -p 4173 -c-1 .
```

Then open http://localhost:4173. Use this small server rather than double-clicking `index.html`: the galleries load their data files, and browsers block that for files opened directly. Stop it with `Ctrl+C`.

The enquiry form cannot send from your computer (there is no form service locally), so it will say "That did not go through". That is expected; it works once the site is on Netlify.

---

## 4. Publish a change

Once the site is connected to Netlify ([DEPLOY.md](DEPLOY.md)), every push to the `main` branch goes live in about a minute:

```bash
git add -A
```

```bash
git commit -m "Describe what you changed"
```

```bash
git push origin main
```

Each live deploy uses Netlify credits on the free plan, so make several changes and push them together rather than pushing every small edit.

---

## 5. Everyday tasks

### 5.1 Set your domain, email and Instagram handle

One command updates every page, the share tags, the sitemap, the structured data and `content/data.json`:

```bash
node tools/set-site.mjs --domain https://www.yourdomain.com --email hello@yourdomain.com --instagram yourhandle
```

Add `--dry-run` first to see what would change. You can run it again later to change just one of them, for example `--instagram newhandle`.

### 5.2 Add an AI UGC ad

**With the script** (needs ffmpeg). It copies the video, makes a thumbnail and adds the entry, newest first:

```bash
node tools/add-ugc-video.mjs ~/Exports/glow-serum.mp4 --title "Glow serum, morning routine" --category skincare --compress
```

- Categories: `skincare`, `supplements`, `pet`, `food-cafe`, `fashion`, `other`.
- Options: `--date 2026-11-18` (defaults to today), `--caption "..."` (shown in the player), `--at 2.5` (thumbnail time in seconds), `--dry-run`, `--help`.
- `--compress` makes the file small enough for the web (usually 5 to 15 MB for a 15 to 30 second ad). Use it on every export.
- Upload the same watermarked file you post on Instagram. The site never adds a watermark and never crops the frame.

**By hand:** put the MP4 in `content/ugc/videos/`, a 9:16 JPG in `content/ugc/thumbs/`, and add an entry to `content/ugc/videos.json`. The format is in [content/ugc/README.md](content/ugc/README.md).

**Remove the placeholders:** delete the entries marked `"placeholder": true` from `content/ugc/videos.json`, and their files from `content/ugc/videos/` and `content/ugc/thumbs/`.

**New category:** add `{ "id": "gyms", "name": "Gyms" }` to `categories` in `videos.json`. It gets its own tab and appears in the contact form's style list automatically.

### 5.3 Add a sample or a style to a gallery

Each gallery has one file:

| Page | File |
| --- | --- |
| Motion Graphics | `content/motion-graphics.json` |
| Website Design | `content/website-design.json` |
| 3D Websites | `content/3d-websites.json` |

- **New style:** add `{ "id": "food", "name": "Food" }` to `styles`. A filter tab appears, and the style shows in the contact form.
- **New sample:** add an entry to `samples` with that style's `id`, a `title`, a one-line `description`, a `thumb` image and, optionally, a `video`. For Website Design, `url` is the address shown in the browser frame.
- Put images in `content/images/` and videos in `content/videos/`, and use paths like `content/images/glow-site.jpg`.
- Full field list: [content/README.md](content/README.md).

### 5.4 Change the homepage "Selected work"

Edit the `work` list in `content/data.json` (title, service, `poster` image, optional `video`). Keep the matching four items in `index.html` roughly in step: they are what visitors see if JavaScript is off, and what search engines read first.

### 5.5 Change colours or fonts

Open `css/settings.css`. Every colour on the site comes from there. The main three:

- `--color-paper`: background
- `--color-ink`: text
- `--color-accent`: copper buttons, links and the 3D ribbon

Colours are written as `oklch(lightness% chroma hue)`. Change a value, refresh the page and see.

Fonts are stored in `fonts/` and declared at the top of `settings.css`. To swap a font, replace the `.woff2` files and the family names there, and update the two `<link rel="preload">` lines near the top of each page.

If you change the colours, the 3D ribbon and bottle follow automatically. Their still images (`content/images/hero-ribbon-*`, `demo-bottle-*`) and the share images (`content/images/share/`) do not: ask Claude Code to re-capture them.

### 5.6 Change the words on a page

Open the page's `.html` file and edit the text between the tags. Headlines are inside `<h1>` and `<h2>`, paragraphs inside `<p>`. The four service pages share the same header and footer, so a change to the menu or footer has to be made in all of them (and in `contact.html`, `thanks.html`, `404.html`).

Each page's search title and description are in its `<head>` (`<title>` and `<meta name="description">`), along with the matching `og:title` and `og:description` used in share previews.

### 5.7 Switch the form to Formspree (only if you move to Vercel)

See "If you deploy on Vercel" in [content/README.md](content/README.md). In short: create a Formspree form, then in `content/data.json` set `"provider": "formspree"` and add your `formspreeId`.

### 5.8 Logo and icons

- Header and footer badge: `content/images/brand/logo-badge-96.webp` and `-160.webp`.
- Browser tab icons: `favicon.ico`, `apple-touch-icon.png` and `content/images/brand/favicon-32.png`.
- Your original files: `logo-badge-source.png` (the badge) and `logo-on-white.png` (for light backgrounds; not used on this dark site).

To replace the logo, keep the same file names and sizes, or ask Claude Code to regenerate them from a new file.

---

## 6. Where everything lives

```
index.html, ai-ugc-ads.html, ...   the pages
contact.html, thanks.html, 404.html

css/
  settings.css    colours and fonts (start here to restyle)
  tokens.css      spacing and text sizes
  base.css        shared basics
  main.css        homepage and shared styles
  service.css     service pages
  ugc.css         AI UGC Ads page
  contact.css     contact page

js/
  main.js         menu, contact links, scroll animations, video protection, floating DM button
  gallery.js      style galleries
  ugc.js          UGC video gallery and player
  contact.js      enquiry form
  three/          3D: ribbon.js (homepage), product.js (bottle), support.js (device checks)
  vendor/         Three.js library

content/
  data.json               contact details, form setting, homepage work
  motion-graphics.json    gallery data (also website-design.json, 3d-websites.json)
  ugc/videos.json         UGC ads; videos/ and thumbs/ beside it
  images/                 site images, brand/ (logo), share/ (link previews)
  videos/                 gallery videos

fonts/            Mona Sans and Geist (free licence)
tools/            helper scripts, not published
sitemap.xml, robots.txt
netlify.toml      Netlify build, video protection and caching
vercel.json       the same for Vercel
CLAUDE.md         instructions for Claude Code
DEPLOY.md         going live
.claude/          the Hallmark design skill used to build the site (not published)
```

**Tools**

| Command | What it does |
| --- | --- |
| `node tools/add-ugc-video.mjs <video> --title "..." --category ...` | Adds a UGC ad (video, thumbnail and entry) |
| `node tools/set-site.mjs --domain ... --email ... --instagram ...` | Sets your details everywhere |
| `node tools/build-dist.mjs` | What Netlify runs: copies only the public files into `dist/` |
| `tools/og-template.html` | Template for the share images (open it through the local server) |

---

## 7. Rules the site follows

These come from your brief. Keep them when you, or Claude Code, change anything.

- No prices anywhere. Contact is by Instagram DM, email or the enquiry form.
- One line in the footer, "Content created with AI tools.", and no AI disclaimers anywhere else.
- The site never adds a watermark over videos. Your own videos may have your logo baked in.
- Visitors can play videos but not casually download them. This stops the download button, right-click "Save video as", dragging and long-press saving. It cannot stop someone who digs through the browser's developer tools or screen-records; your watermark protects you there. For stronger protection, see [content/ugc/README.md](content/ugc/README.md).
- No LinkedIn. Instagram is the only social channel.
- No founder name. "Cursive Studios" only.
- No invented numbers, testimonials or client logos.

---

## 8. Speed, search and accessibility

**Speed.** Mobile Lighthouse scores in testing: 97 to 99 for performance on every page tested. What keeps it fast:

- Fonts are hosted with the site and preloaded.
- The 3D code loads only on the two pages that use it, and only after the page has appeared.
- Videos download only when someone previews or plays them.
- Phones get a lighter 3D version; data-saver, slow connections and devices without 3D get a still image.

Keep videos compressed, and keep images under about 300 KB (WebP or JPG) to stay fast.

**Search.** Every page has its own title, description, share image and canonical address. The homepage describes the business to search engines (structured data), and each service page describes its service. `sitemap.xml` lists the pages. After launch, submit the sitemap in Google Search Console ([DEPLOY.md](DEPLOY.md), section 6).

If you add a new page, add it to `sitemap.xml` and give it its own `<title>`, description and share image.

**Accessibility.** Checked with the axe tool and by keyboard at phone, tablet and desktop widths: text contrast passes, every control shows a focus ring, menus and players work with the keyboard, and all animation stops under the "reduce motion" setting.

---

## 9. Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| Galleries are empty when I open a page on my computer | You opened the file directly. Use the local server (section 3). |
| A new video or sample does not appear | A JSON file has a typo (a missing comma or quote is the usual one). Paste the file into a JSON checker such as jsonlint.com. |
| A UGC video has no thumbnail | The `thumb` file name in `videos.json` does not match the file in `content/ugc/thumbs/`. |
| The add-video script says ffmpeg was not found | Install ffmpeg (Mac: `brew install ffmpeg`, Windows: `winget install ffmpeg`), then open a new terminal. |
| `git push` is refused because a file is too big | GitHub refuses files over 100 MB. Re-run the add-video script with `--compress`, or host the video externally ([content/ugc/README.md](content/ugc/README.md)). |
| The form says "That did not go through" on the live site | Form detection is not on, or the site was not redeployed after turning it on ([DEPLOY.md](DEPLOY.md), section 4). |
| Enquiries are not arriving by email | Check Netlify Forms > Spam submissions, and the email notification setting. |
| The live site is "paused" | Netlify's free credits ran out for the month. Check usage, reduce deploys, move videos to an external host, or upgrade. |
| An old share preview shows on WhatsApp or Instagram | They cache previews. Test with `?v=2` added to the link. |
| A change does not show on the live site | Check Netlify > Deploys for a failed deploy, then hard-refresh the browser (Ctrl+Shift+R, or Cmd+Shift+R on a Mac). |

---

## 10. Getting help from Claude Code

`CLAUDE.md` holds the technical notes Claude Code reads automatically, including your brief and rules. The site was designed with the Hallmark design skill (in `.claude/skills/hallmark/`), which you can call by name, for example:

- "Use Hallmark to build a new About page in the site's existing style."
- `/hallmark audit index.html` for a design review that changes nothing.

Useful requests:

- "Add these five videos to the UGC gallery" (attach them, or put them in a folder and give the path).
- "Re-capture the 3D still images and share images" (after a colour change).
- "Replace the placeholder samples on the Website Design page with these screenshots."
- "Run the quality checks again" (layout, accessibility, speed).
