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
