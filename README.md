# ANPR Mock

Web page that fires a Hikvision-style ANPR webhook at a camera listener
endpoint: an editable `anpr.xml` plus one uploaded image per `<pId>` in the XML.

Static — no build, no dependencies. Thai / English / Japanese, light and dark.

**Live:** https://jirapat-tech.github.io/lpr-parking-anpr-mock/

There is a **How to use** page (`help.html`) documenting every field, every XML
tag the listener actually reads, and the failure modes — in all three languages.

## Enable Debug mode first

Against an installed (packaged) desktop app, turn on
**Settings → Configuration → Application → Advanced → Debug mode**, then restart it.

The local server enforces an IP whitelist and only accepts registered cameras;
a request from a browser is not one, so it is rejected with `403 Forbidden`.
Debug mode disables the whitelist. Running the desktop app in dev mode skips the
whitelist already, so it is not needed there.

That 403 is invisible in `no-cors` mode — the page reports `delivered` and
nothing happens. Suspect Debug mode first.

## Use

1. Set the listener URL.
2. Set the **license plate** and pick a **province**.
3. Edit `anpr.xml` directly if you need anything else (adding or removing
   `<pictureInfo>` blocks updates the picture list live).
4. Attach an image per picture. Missing ones are omitted, not faked.
5. **Fire request.**

Everything persists across reloads: the URL, XML, language, theme and the last
50 fires in `localStorage`, the pictures in IndexedDB. The history list records
plate, province, picture count and delivery outcome, and **reuse** puts a past
request back into the form. Light theme by default; toggle in the header.

Pictures are cached as files, not paths — a browser never exposes the real path
of a picked file, only its name and bytes. Removing a `<pId>` from the XML drops
its cached picture too, so edits cannot leave orphaned blobs behind.

### Plate and province fields

The XML is the source of truth — those two inputs are just a faster way in, and
edits flow both ways.

- **License plate** writes both `<licensePlate>` and `<originalLicensePlate>`,
  since a real camera sends the same value in both.
- **Province** writes `<tailandStateID>`. The dropdown carries all 78 codes,
  generated from the desktop app's `license-plate-city` seed and cross-checked
  against `ThailandProvinceCode` in the Hikvision SDK types — both agree on every
  entry. Bangkok is 1, Chiang Mai 14, Betong 78.

Hand-editing `<tailandStateID>` to a value outside the table is allowed; the
field just reports it as unknown rather than overwriting your XML.

## Reaching your machine

This is the part that bites, so it is worth being precise.

| Page served from | Target | Works? |
| --- | --- | --- |
| GitHub Pages (https) | `http://localhost:PORT` | yes |
| GitHub Pages (https) | `http://127.0.0.1:PORT` | yes |
| GitHub Pages (https) | `http://192.168.x.x:PORT` | **no — mixed content** |
| local (http) | anything on the LAN | yes |

A page on HTTPS may not call a plain-http address; the browser blocks it before
the request leaves. `localhost` and `127.0.0.1` are the only exceptions, because
they count as trustworthy origins. There is no workaround from inside the page,
so the app detects this and says so instead of silently failing.

**To hit a LAN address**, serve the same files over http:

```bash
git clone https://github.com/jirapat-tech/lpr-parking-anpr-mock.git
cd lpr-parking-anpr-mock
npx serve .
```

Or use **Copy as curl**, which has no browser restrictions at all.

## Why the response is usually unreadable

The listener sends no CORS headers, so the browser refuses to expose the
response even though the POST is accepted.

The app therefore fires in `no-cors` mode by default: **exactly one request per
click**, reported as `delivered`, with the status code hidden. Check the desktop
app log for the outcome.

> Earlier versions tried a normal request first and fell back to `no-cors` on
> error. That delivered the event **twice** — a CORS rejection happens *after*
> the server has already accepted and processed the request, so the retry was a
> genuine second POST. The mode is now chosen up front and never retried.

If your listener does send `Access-Control-Allow-Origin`, tick **read response**
to get the real status and body — still one request.

`no-cors` still rejects when the connection genuinely fails, so `delivered`
versus `failed` remains trustworthy; only the status code is lost.

## Request shape

```
POST <listener url>
Content-Type: multipart/form-data

  anpr.xml   → the XML, as application/xml, filename anpr.xml
  <pId>      → the image, filename taken from that block's <fileName>
```

One image part per `<pictureInfo>`, named after its `<pId>`. This mirrors the
desktop app's built-in simulator, so a listener cannot tell them apart.

## Live presence (optional, off by default)

Shows who else has the page open and which listener each of them is pointed at —
two people firing at the same desktop app otherwise produce one interleaved log
with no way to tell whose event is whose.

It is disabled until `presence.config.js` is filled in. Left blank, nothing runs
and no external request is made at all; the Supabase SDK is not even fetched.

To enable, create a Supabase project (free tier) and paste its URL and
**publishable** key (`sb_publishable_…`, labelled *anon / public* in older
dashboards) into `presence.config.js`. Never the **Secret** key — it bypasses Row
Level Security and this file is served publicly. Nothing needs switching on: Presence runs on a
public Realtime channel and touches no database table, so there is no schema, no
replication setting, and no stale rows to clean up — state lives in the channel
and clears itself when a tab closes.

The one setting that breaks it is *private-only channels* under Project Settings
→ Realtime; leave that off.

**Before you enable it:** GitHub Pages serves this site publicly even when the
repository is private. Anyone who finds the URL can join the channel and read
every name and `host:port` being broadcast, including internal addresses. Treat
what you broadcast as public, or leave presence off. Each person can also untick
*show me to others* to stay out of it.

## Deploying a change

Asset URLs carry a `?v=N`. **Bump it in both `index.html` and `help.html` whenever
you change a JS or CSS file**, otherwise a browser can pair a freshly-fetched
`index.html` with a cached `app.js` from the previous deploy — which throws
rather than degrading, because the two disagree about what elements exist.

## Deploy

GitHub Pages → Settings → Pages → Deploy from branch → `main` / `/ (root)`.
`.nojekyll` is present so files are served as-is.
