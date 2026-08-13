/**
 * ANPR Mock — fires a Hikvision-style multipart/form-data POST at a camera
 * listener endpoint: one `anpr.xml` part plus one image part per <pId> declared
 * in the XML. Multipart layout mirrors the desktop app's built-in simulator, so
 * a listener cannot tell the two apart.
 *
 * No build step, no dependencies. Images are held in memory only (a page reload
 * clears them); the URL and XML persist in localStorage.
 */

const DEFAULT_URL = "http://localhost:8080/api/v1/hikvision/listener/mqgczsx3000k3x6x64cc6zos"

const DEFAULT_XML = `<?xml version="1.0" encoding="utf-8"?>
<EventNotificationAlert version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <ipAddress>192.168.1.251</ipAddress>
  <protocol>HTTP</protocol>
  <macAddress>e8:a0:ed:2c:e6:24</macAddress>
  <channelID>1</channelID>
  <dateTime>2025-11-12T10:44:56.365+07:00</dateTime>
  <eventType>ANPR</eventType>
  <eventState>active</eventState>
  <eventDescription>ANPR</eventDescription>
  <channelName>IP CAPTURE CAMERA</channelName>
  <ANPR>
    <country>64</country>
    <tailandStateID>1</tailandStateID>
    <licensePlate>8กผ444</licensePlate>
    <line>1</line>
    <direction>reverse</direction>
    <confidenceLevel>97</confidenceLevel>
    <plateType>unknown</plateType>
    <vehicleType>unknown</vehicleType>
    <pictureInfoList>
      <pictureInfo>
        <fileName>licensePlatePicture.jpg</fileName>
        <type>licensePlatePicture</type>
        <dataType>0</dataType>
        <pId>FU64608246132164921310</pId>
        <absTime>20251112104456365</absTime>
      </pictureInfo>
      <pictureInfo>
        <fileName>detectionPicture.jpg</fileName>
        <type>detectionPicture</type>
        <dataType>0</dataType>
        <pId>FU64608246132164944210</pId>
        <absTime>20251112104456365</absTime>
      </pictureInfo>
      <pictureInfo>
        <fileName>featurePicture.jpg</fileName>
        <type>featurePicture</type>
        <dataType>0</dataType>
        <pId>FU64608246132164954816</pId>
        <absTime>20251112104456367</absTime>
      </pictureInfo>
    </pictureInfoList>
    <listType>temporary</listType>
    <originalLicensePlate>8กผ444</originalLicensePlate>
  </ANPR>
  <UUID>a1301cd8-1dd1-11b2-9c0b-e8ad94177b80</UUID>
  <picNum>3</picNum>
  <deviceUUID>DS-TCG406-E 20241223AIFU6460824</deviceUUID>
</EventNotificationAlert>`

const $ = (id) => document.getElementById(id)
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

/** pId → File, in memory only. */
const images = new Map()

/** Extract { pId, fileName } per <pictureInfo> block — no XML parser needed. */
const parsePids = (xml) =>
  (xml.match(/<pictureInfo>[\s\S]*?<\/pictureInfo>/g) ?? [])
    .map((block) => ({
      pId: block.match(/<pId>([\s\S]*?)<\/pId>/)?.[1]?.trim(),
      fileName: block.match(/<fileName>([\s\S]*?)<\/fileName>/)?.[1]?.trim() ?? "",
    }))
    .filter((entry) => entry.pId)

// ─── persistence ───────────────────────────────────────────────────────────

const load = () => {
  $("url").value = localStorage.getItem("anpr-url") || DEFAULT_URL
  $("xml").value = localStorage.getItem("anpr-xml") || DEFAULT_XML
}
const save = () => {
  localStorage.setItem("anpr-url", $("url").value)
  localStorage.setItem("anpr-xml", $("xml").value)
}

// ─── environment check ─────────────────────────────────────────────────────

/**
 * A page served over HTTPS may not call a plain-http address — the browser
 * blocks it as mixed content before the request is made. localhost/127.0.0.1
 * are exempt (they count as trustworthy origins), a LAN IP is not. There is no
 * page-side workaround, so say so plainly and point at the way out.
 */
const checkEnv = () => {
  const el = $("warn")
  let target
  try {
    target = new URL($("url").value)
  } catch {
    el.className = "warn hidden"
    return
  }

  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
  const blocked = location.protocol === "https:" && target.protocol === "http:" && !isLocal

  if (!blocked) {
    el.className = "warn hidden"
    return
  }
  el.className = "warn"
  el.innerHTML =
    "<b>Blocked: mixed content.</b> This page is on HTTPS, so the browser will not send a request to " +
    "<code>" +
    esc(target.origin) +
    "</code>. Only <code>localhost</code> and <code>127.0.0.1</code> are exempt.<br />" +
    "Run this page locally over http instead — clone the repo and <code>npx serve .</code> — or use <b>Copy as curl</b>."
}

// ─── picture list ──────────────────────────────────────────────────────────

const renderPids = () => {
  const pids = parsePids($("xml").value)
  const wrap = $("pids")

  // Drop images whose pId no longer appears in the XML.
  for (const pId of [...images.keys()]) {
    if (!pids.some((entry) => entry.pId === pId)) images.delete(pId)
  }

  $("pidHint").textContent = pids.length
    ? `${images.size}/${pids.length} attached · missing pictures are simply omitted`
    : "no <pictureInfo> blocks in the XML"

  wrap.innerHTML =
    pids
      .map((entry) => {
        const file = images.get(entry.pId)
        return `<div class="pid">
          <div class="thumb${file ? "" : " empty"}" id="thumb-${esc(entry.pId)}">${file ? "" : "—"}</div>
          <div class="pid-body">
            <div class="pid-name">${esc(entry.fileName || "(no fileName)")}</div>
            <div class="pid-id">${esc(entry.pId)}</div>
            ${file ? `<div class="pid-file">${esc(file.name)} · ${Math.round(file.size / 1024)} KB</div>` : ""}
          </div>
          <label class="btn-file">${file ? "Replace" : "Pick"}<input type="file" accept="image/*" data-pick="${esc(entry.pId)}" /></label>
          ${file ? `<button class="ghost" type="button" data-clear="${esc(entry.pId)}">Clear</button>` : ""}
        </div>`
      })
      .join("") || `<div class="empty-box">nothing to attach</div>`

  wrap.querySelectorAll("[data-pick]").forEach((input) => {
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) images.set(input.dataset.pick, file)
      renderPids()
    }
  })
  wrap.querySelectorAll("[data-clear]").forEach((button) => {
    button.onclick = () => {
      images.delete(button.dataset.clear)
      renderPids()
    }
  })

  // Thumbnails are object URLs, revoked as soon as the image has decoded.
  pids.forEach((entry) => {
    const file = images.get(entry.pId)
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => URL.revokeObjectURL(url)
    img.src = url
    $(`thumb-${entry.pId}`)?.appendChild(img)
  })
}

// ─── fire ──────────────────────────────────────────────────────────────────

const buildForm = (xml, pids) => {
  const form = new FormData()
  const missing = []
  form.append("anpr.xml", new Blob([xml], { type: "application/xml" }), "anpr.xml")
  for (const { pId, fileName } of pids) {
    const file = images.get(pId)
    if (!file) {
      missing.push(pId)
      continue
    }
    form.append(pId, file, fileName || file.name)
  }
  return { form, missing }
}

const report = (text, ok) => {
  const el = $("result")
  el.textContent = text
  el.className = "result " + (ok === true ? "ok" : ok === false ? "err" : "")
}

const fire = async () => {
  save()
  const url = $("url").value.trim()
  const xml = $("xml").value
  const { form, missing } = buildForm(xml, parsePids(xml))
  const note = missing.length ? `\nno picture attached for: ${missing.join(", ")}` : ""
  const startedAt = Date.now()

  report("firing…")
  try {
    const response = await fetch(url, { method: "POST", body: form })
    const body = await response.text()
    report(
      `${response.status} ${response.statusText} · ${Date.now() - startedAt}ms${note}\n\n${body.slice(0, 8000)}`,
      response.ok
    )
  } catch (error) {
    // The listener sends no CORS headers, so a normal fetch rejects even when
    // the POST would be accepted. Resend opaquely: the server still receives it,
    // the browser just refuses to show us the response.
    try {
      await fetch(url, { method: "POST", body: form, mode: "no-cors" })
      report(
        `sent · ${Date.now() - startedAt}ms${note}\n\n` +
          "Response not readable: the listener returned no CORS headers, so the browser hides it.\n" +
          "Check the desktop app log to confirm the event was processed.",
        true
      )
    } catch {
      report(`failed · ${Date.now() - startedAt}ms${note}\n\n${error.message}`, false)
    }
  }
}

// ─── curl ──────────────────────────────────────────────────────────────────

const curlCommand = () => {
  const url = $("url").value.trim()
  const pids = parsePids($("xml").value)
  const lines = [`curl -X POST '${url}' \\`, `  -F 'anpr.xml=@anpr.xml;type=application/xml'`]
  for (const { pId, fileName } of pids) {
    const file = images.get(pId)
    lines[lines.length - 1] += " \\"
    lines.push(`  -F '${pId}=@${file ? file.name : fileName || pId + ".jpg"}'`)
  }
  return lines.join("\n")
}

// ─── wiring ────────────────────────────────────────────────────────────────

load()
renderPids()
checkEnv()

$("url").oninput = () => {
  save()
  checkEnv()
}
$("xml").oninput = () => {
  save()
  renderPids()
}
$("resetXml").onclick = () => {
  $("xml").value = DEFAULT_XML
  save()
  renderPids()
}
$("downloadXml").onclick = () => {
  const url = URL.createObjectURL(new Blob([$("xml").value], { type: "application/xml" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "anpr.xml"
  a.click()
  URL.revokeObjectURL(url)
}
$("fire").onclick = fire
$("curl").onclick = async () => {
  await navigator.clipboard.writeText(curlCommand())
  report("curl command copied.\nDownload anpr.xml first, then run it from that folder.\n\n" + curlCommand())
}
