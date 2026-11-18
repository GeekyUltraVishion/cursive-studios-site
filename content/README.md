# Content

Everything the homepage shows that you will swap out lives here.

- `videos/`: your finished `.mp4` files (H.264, vertical 9:16 for ads).
- `images/`: poster stills for each video, and any other images.
- `data.json`: the list the page reads.

## Adding a piece of work

Add an entry to `work` in `data.json` (the first four are shown on the homepage):

```json
{
  "title": "Glow Serum",
  "service": "AI UGC ad",
  "poster": "content/images/glow-serum.jpg",
  "video": "content/videos/glow-serum.mp4",
  "alt": "A serum bottle turning in the light"
}
```

Your own work shows in its true colours. Entries marked `"placeholder": true` are library stand-ins and are shown in the site's blue duotone; delete them as your own work comes in, along with their `credit`.

## Contact details

Set `contact.email` and `contact.instagram` (the handle, without the @), then change `contact.placeholder` to `false`. Also replace `hello@example.com` and `yourhandle` in `index.html` so the page is right even before the script runs.

## Service galleries

Each service page reads its own file: `ai-ugc-ads.json`, `motion-graphics.json`, `website-design.json`, `3d-websites.json`.

```json
{
  "styles": [
    { "id": "product", "name": "Product" }
  ],
  "samples": [
    {
      "style": "product",
      "title": "Glow Serum",
      "description": "One line about the piece.",
      "thumb": "content/images/glow-serum-thumb.jpg",
      "video": "content/videos/glow-serum.mp4",
      "image": "content/images/glow-serum-full.jpg",
      "alt": "What the picture shows",
      "url": "glowserum.com"
    }
  ]
}
```

- **New style:** add `{ "id", "name" }` to `styles`. It gets its own filter tab automatically. The "All" tab is always there.
- **New sample:** add an entry to `samples` with that style's `id`.
- `thumb` is the card picture. If `video` is set, the card plays it while hovered and the preview opens a video player; otherwise the preview shows `image` (or `thumb`).
- `url` is only used on Website Design, as the address in the browser frame.
- Samples marked `"placeholder": true` are stand-ins (tinted to match the site, credited in the footer). Remove them, with their `credit`, as your own samples arrive.
- Every card's "Request this style" button opens your Instagram DM, using `contact.instagram` from `data.json`.
