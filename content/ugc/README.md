# AI UGC Ads gallery

The `/ai-ugc-ads` page reads `videos.json` in this folder. Videos live in `videos/`, thumbnails in `thumbs/`. There is no build step or database: commit, push, and Vercel or Netlify redeploys with the new video in place.

## Add a video, the quick way (recommended)

Needs [Node 18+](https://nodejs.org) and [ffmpeg](https://ffmpeg.org/download.html) (Mac: `brew install ffmpeg`, Windows: `winget install ffmpeg`). From the project folder:

```bash
node tools/add-ugc-video.mjs ~/Exports/glow-serum.mp4 --title "Glow serum, morning routine" --category skincare --compress
```

It copies the video into `videos/` (with `--compress`, re-encoded for the web), saves a thumbnail from the 1-second mark into `thumbs/`, and adds the entry to `videos.json`, newest first. Then:

```bash
git add content/ugc && git commit -m "Add Glow serum ad" && git push
```

Options: `--date 2026-11-18` (defaults to today), `--caption "..."`, `--at 2.5` (thumbnail time in seconds), `--dry-run` (shows what would happen). `node tools/add-ugc-video.mjs --help` lists them all.

## Add a video by hand

1. Put the video in `videos/` (MP4, H.264, vertical 9:16) and a 9:16 JPG in `thumbs/`.
2. Add an entry to `videos` in `videos.json`:

```json
{
  "file": "glow-serum.mp4",
  "thumb": "glow-serum.jpg",
  "title": "Glow serum, morning routine",
  "category": "skincare",
  "date": "2026-11-18",
  "caption": "One line shown in the full-screen player.",
  "instagram": "https://www.instagram.com/reel/..."
}
```

- `category` must be an `id` from `categories`. Add a new category there and it gets its own tab.
- `date` is `YYYY-MM-DD`. The page orders by it, and the three newest fill the "Latest from Instagram" strip.
- `caption` and `instagram` (a link to the post) are optional.
- `file` and `thumb` can also be full `https://` links to a video host (see below).
- Entries marked `"placeholder": true` are the sample clips. Delete them and their files as your real ads go in.

## File sizes and hosting

| Limit | What it means for you |
| --- | --- |
| **GitHub** warns on files over 50 MB and refuses files over 100 MB. Repos are best kept under about 1 GB. | Use `--compress`. A 15 to 30 second 1080x1920 ad usually lands at 5 to 15 MB. Every video you ever commit stays in the repo history, even after you delete it. |
| **Vercel** Hobby (free) is for personal, non-commercial use only; a business site needs Pro. Static uploads are capped at 100 MB on Hobby and 1 GB on Pro. | Check Vercel's current terms before launching the business site there. |
| **Netlify** accounts created since September 2025 get 300 credits a month on the free plan. Bandwidth costs 20 credits per GB and each production deploy costs 15, so that is at most about 15 GB of traffic a month. When credits run out, the site pauses. Older accounts may still have the legacy 100 GB allowance. | Video is the biggest cost. At 10 MB per ad, 15 GB is roughly 1,500 full plays a month, less your deploys. |

**When to move videos off the site:** once the repo nears 1 GB, any single file nears 50 MB, or your host's bandwidth meter starts to climb. Upload the videos to a video host and put its links in `videos.json` (`"file": "https://..."`, `"thumb": "https://..."`). The page code does not change. Options:

- **Bunny Stream** or **Cloudflare Stream**: video hosts built for this. They resize for each phone and charge mainly by minutes stored and watched. Use their direct MP4 link.
- **Cloudflare R2** (or similar object storage with a public URL): stores plain MP4 files cheaply, with no fee for data going out. Compress first, since it serves the file as-is.

Avoid YouTube or Vimeo embeds for this gallery: they add their own branding and player on top of the video, and they cannot autoplay silently on hover the same way.
