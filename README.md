# ANPR Mock

Web page that fires a Hikvision-style ANPR webhook at a camera listener
endpoint: an editable `anpr.xml` plus one uploaded image per `<pId>` in the XML.

Static — three files, no build, no dependencies.

**Live:** https://jirapat-tech.github.io/lpr-parking-anpr-mock/

## Use

1. Set the listener URL.
2. Set the **license plate** and pick a **province**.
3. Edit `anpr.xml` directly if you need anything else (adding or removing
   `<pictureInfo>` blocks updates the picture list live).
4. Attach an image per picture. Missing ones are omitted, not faked.
5. **Fire request.**

The URL, XML, and theme persist in `localStorage`. Images are held in memory
only, so a reload clears them. Light theme by default; toggle in the header.

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
response even when the POST is accepted. The app retries the request in
`no-cors` mode and reports `sent` — the server does receive it; only the reply
is hidden. Confirm the event in the desktop app log.

If the listener ever adds `Access-Control-Allow-Origin`, the real status and
body appear automatically — no change needed here.

## Request shape

```
POST <listener url>
Content-Type: multipart/form-data

  anpr.xml   → the XML, as application/xml, filename anpr.xml
  <pId>      → the image, filename taken from that block's <fileName>
```

One image part per `<pictureInfo>`, named after its `<pId>`. This mirrors the
desktop app's built-in simulator, so a listener cannot tell them apart.

## Deploy

GitHub Pages → Settings → Pages → Deploy from branch → `main` / `/ (root)`.
`.nojekyll` is present so files are served as-is.
