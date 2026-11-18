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

Your own work shows in its true colours. Entries marked `"placeholder": true` are library stand-ins and are tinted to match the site; delete them as your own work comes in, along with their `credit`.

## Contact details

Set `contact.email` and `contact.instagram` (the handle, without the @), then change `contact.placeholder` to `false`. Also replace `hello@example.com` and `yourhandle` in `index.html` so the page is right even before the script runs.

## Service galleries

Motion Graphics, Website Design and 3D Websites each read their own file: `motion-graphics.json`, `website-design.json`, `3d-websites.json`. The AI UGC Ads page has its own setup in `ugc/` (see `ugc/README.md`).

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

## Contact form

The enquiry form on `/contact` sends to a form service, because a static site has no server of its own. Which one is set in `data.json`:

```json
"form": { "provider": "netlify", "formspreeId": "" }
```

The form never says "sent" unless the service accepted it. If it is not connected, visitors are told to DM or email instead.

### If you deploy on Netlify (already set up)

1. Deploy the site to Netlify.
2. In Netlify: **Site configuration > Forms**, turn on **form detection**, then redeploy once. A form called `enquiry` appears.
3. Under **Forms > Form notifications**, add an email notification so each enquiry lands in your inbox.
4. Send yourself a test enquiry from the live site.

Netlify also filters spam, and the form has a hidden field that catches bots. Check your plan for its monthly submission limit.

### If you deploy on Vercel (use Formspree)

1. Create a free account at formspree.io and make a new form. It gives you an endpoint like `https://formspree.io/f/abcdwxyz`; the ID is the last part, `abcdwxyz`.
2. In `content/data.json` set `"provider": "formspree"` and `"formspreeId": "abcdwxyz"`.
3. In `contact.html`, change `action="/thanks"` on the `<form>` to `action="https://formspree.io/f/abcdwxyz"` (this is only used if a visitor has JavaScript off).
4. In Formspree's form settings, restrict submissions to your domain and set the email address that receives them.
5. Push, then send yourself a test enquiry from the live site. The first submission may ask you to confirm your email with Formspree.

Check Formspree's free plan for its monthly limit.

### The "Style you like" list

It is built from the same files as the galleries (`motion-graphics.json`, `website-design.json`, `3d-websites.json`, and the categories in `ugc/videos.json`), so a style you add there appears in the form too. Choosing a service narrows the list to that service's styles.

## Your domain, email and Instagram

Set them everywhere at once (pages, share tags, sitemap, structured data, this folder's `data.json`):

```bash
node tools/set-site.mjs --domain https://www.yourdomain.com --email hello@yourdomain.com --instagram yourhandle
```

Add `--dry-run` first to see what would change.
