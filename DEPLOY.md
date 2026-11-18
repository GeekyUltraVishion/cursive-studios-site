# Putting Cursive Studios live

Recommended host: **Netlify** (reasons in section 1). Everything here was checked in November 2026. Platform menus get renamed often: if a menu name below does not match what you see, look for the closest one, or follow the linked docs.

---

## 1. Netlify or Vercel?

**Netlify**, for three reasons:

1. **It can be free for a business.** Vercel's free Hobby plan is for personal, non-commercial use only; a business site needs Vercel Pro (paid). Netlify's free plan has no such rule.
2. **The enquiry form works with no extra account.** The form is already built for Netlify Forms. On Netlify's current credit-based plans, form submissions do not use credits. On Vercel you would also need Formspree.
3. **The site is already configured for it** (`netlify.toml`: build step, video protection and caching headers).

**The limit to watch on Netlify's free plan:** new accounts (created since September 2025) get **300 credits a month**. Bandwidth costs **20 credits per GB** and each production deploy costs **15 credits**, so it is about **15 GB of traffic a month at most**, less your deploys. When credits run out, the **site pauses** until the next month. Video is what uses bandwidth: at about 10 MB per ad, 15 GB is roughly 1,500 full plays. Older accounts may still be on the legacy plan (100 GB). Check your account's usage page after launch.

**Ways to stay under it:** batch your changes into fewer pushes (each production deploy costs credits), compress videos (`--compress`), and move videos to an external host when traffic grows (`content/ugc/README.md`). If you outgrow the free plan, Netlify's paid plan adds credits.

**File size:** this repository's largest file is under 1 MB, so you are far from any limit today. Netlify does not clearly publish a per-file limit for deploys; if you start committing large videos, check Netlify's docs first. GitHub itself refuses files over 100 MB.

---

## 2. GitHub

The code is already on GitHub at **github.com/GeekyUltraVishion/cursive-studios-site**, on a branch called `claude/sweet-hypatia-kbuycm`. There is no `main` branch yet. Make `main` the live branch:

1. Open the repository on GitHub and click the **branch menu** (top left, shows `claude/sweet-hypatia-kbuycm`).
2. Type `main` in the box and choose **Create branch: main from claude/sweet-hypatia-kbuycm**.
3. Go to **Settings > General > Default branch**, click the switch icon, choose **main**, and confirm.
4. On your computer, get a copy of the code:

   ```bash
   git clone https://github.com/GeekyUltraVishion/cursive-studios-site.git
   ```

   ```bash
   cd cursive-studios-site
   ```

5. Put in your real details (domain, email, Instagram handle) everywhere at once:

   ```bash
   node tools/set-site.mjs --domain https://www.yourdomain.com --email hello@yourdomain.com --instagram yourhandle
   ```

6. Save and upload the change:

   ```bash
   git add -A
   ```

   ```bash
   git commit -m "Set real domain, email and Instagram"
   ```

   ```bash
   git push origin main
   ```

From now on, every change you push to `main` goes live (section 3).

**If you ever start a new repository instead:** on GitHub click **New repository**, give it a name, leave it empty (no README), then in the project folder run `git init`, `git add -A`, `git commit -m "First version"`, `git branch -M main`, `git remote add origin <the repository URL GitHub shows>`, `git push -u origin main`.

---

## 3. Connect GitHub to Netlify (automatic deploys)

1. Sign up or log in at **app.netlify.com** (signing up with GitHub is simplest).
2. Click **Add new project** (may say **Add new site**) **> Import an existing project > GitHub**.
3. Allow Netlify to access GitHub. When asked which repositories, choose **only** `cursive-studios-site`.
4. Pick the repository. Netlify reads `netlify.toml` and fills the build settings in for you. Check they say:
   - Branch to deploy: **main**
   - Build command: **node tools/build-dist.mjs**
   - Publish directory: **dist**
5. Click **Deploy**. After a minute you get an address like `something.netlify.app`. Open it and check the site.
6. Optional: rename that address under **Project configuration > General > Project details > Change project name**.

Every push to `main` now redeploys the site. Each deploy costs credits on the free plan, so push finished batches rather than every small edit.

---

## 4. The enquiry form

1. In Netlify, open the project and go to **Forms** (in the left menu, or under Project configuration).
2. Click **Enable form detection**.
3. Go to **Deploys > Trigger deploy > Deploy project** so Netlify scans the pages again. A form named **enquiry** appears under Forms.
4. Set up email alerts: **Project configuration > Notifications > Emails and webhooks > Form submission notifications > Add notification > Email notification**. Choose the **enquiry** form and enter your email.
5. On the live site, go to **/contact** and send a test enquiry. You should see "Thanks, your enquiry is in", the entry under **Forms > enquiry**, and an email.
6. Check **Forms > enquiry > Spam submissions** now and then: real enquiries can be filtered there by mistake.

Nothing else to change: `content/data.json` is already set to `"provider": "netlify"`.

---

## 5. Your domain

Do this after section 3 works on the `netlify.app` address.

1. In Netlify: **Domain management > Add a domain** (may say **Add custom domain**). Enter `yourdomain.com` and confirm you own it.
2. Netlify adds both `yourdomain.com` and `www.yourdomain.com`. Make **www.yourdomain.com** the **primary domain** (Netlify recommends a `www` primary when your DNS stays with your registrar). The other one then redirects to it.
3. Log in where you bought the domain (your registrar: GoDaddy, Namecheap, Cloudflare, Hostinger and so on), open its **DNS** settings, and add these records. Use the values Netlify shows on its domain page if they differ from these:

   | Type | Name / Host | Value / Points to |
   | --- | --- | --- |
   | CNAME | `www` | `your-project-name.netlify.app` |
   | ALIAS, ANAME or flattened CNAME (if your registrar offers one) | `@` (the bare domain) | `apex-loadbalancer.netlify.com` |
   | A (only if there is no ALIAS option) | `@` | `75.2.60.5` |

4. **Delete** any other A, AAAA or CNAME records on `@` and `www` (for example the registrar's "parking page" records). Leave email records (MX, TXT) alone.
5. Wait. DNS changes can take from a few minutes to about a day.
6. Back in Netlify, under **Domain management > HTTPS**, the free certificate is issued automatically once DNS works. If it says it is waiting, click **Verify DNS configuration**.
7. Make sure the domain you passed to `tools/set-site.mjs` in section 2 is exactly the primary one (`https://www.yourdomain.com`). If not, run it again with the right one and push.

**Alternative:** Netlify can run your DNS for you (it gives you nameservers to set at the registrar). That is simpler, but it moves all your DNS, including email records, to Netlify, so only do it if you are comfortable checking that email still works afterwards.

---

## 6. After going live: checklist

Do this on your phone **and** on a computer.

**Pages**
- [ ] `/` loads, the copper ribbon moves (or a still image shows on older phones)
- [ ] `/ai-ugc-ads`, `/motion-graphics`, `/website-design`, `/3d-websites`, `/contact` all load
- [ ] Clicking the logo on every page goes to the homepage
- [ ] A made-up address like `/abc` shows the "This page is not here" page
- [ ] `http://yourdomain.com` and `yourdomain.com` both end up on `https://www.yourdomain.com` with the padlock
- [ ] The menu button opens and closes on the phone

**Videos (on the phone)**
- [ ] On `/ai-ugc-ads`, tap a card: it plays silently; tap again: full screen with sound
- [ ] Filter tabs and "Newest first" work
- [ ] Long-press on a video shows no "Save video" option, and the player has no download button
- [ ] The 3D bottle on `/3d-websites` turns when you drag it

**Form**
- [ ] Send a test from `/contact`: thanks message, entry in Netlify Forms, email arrives
- [ ] Leaving the name empty shows "Add your name."
- [ ] The floating "DM us on Instagram" button opens your Instagram DM

**Share previews**
- [ ] Paste `https://www.yourdomain.com` into opengraph.xyz (or any "Open Graph preview" checker): title, description and the share image show
- [ ] Send the link to yourself on WhatsApp and Instagram DM and check the preview (they cache old previews: if it looks wrong, add `?v=2` to the link to test again)

**Search**
- [ ] `https://www.yourdomain.com/sitemap.xml` and `/robots.txt` open
- [ ] In Google Search Console (search.google.com/search-console), add your domain, verify it with the DNS record it gives you, and submit `https://www.yourdomain.com/sitemap.xml`
- [ ] Paste the homepage into Google's Rich Results Test (search.google.com/test/rich-results) and check it finds the Organization data

**Speed**
- [ ] Run pagespeed.web.dev on the homepage (mobile); earlier local tests scored 97+

**Before you share it widely**
- [ ] Replace the placeholder videos, samples and project names with your own work
- [ ] Re-read the "What you get" text on each service page
- [ ] Check your Netlify usage page after the first week to see how fast credits are used
