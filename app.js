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

/**
 * Thailand province code table — [tailandStateID, code, English, Thai].
 * Generated from the desktop app's license-plate-city seed and cross-checked
 * against ThailandProvinceCode in the Hikvision SDK types; both agree on all 78
 * entries. The camera reports the number, so that is what goes in the XML.
 */
const PROVINCES = [
  [1, "BKK", "Bangkok", "กรุงเทพมหานคร"],
  [2, "KBI", "Krabi", "กระบี่"],
  [3, "KRI", "Kanchanaburi", "กาญจนบุรี"],
  [4, "KSN", "Kalasin", "กาฬสินธุ์"],
  [5, "KPT", "Kamphaeng Phet", "กำแพงเพชร"],
  [6, "KKN", "Khon Kaen", "ขอนแก่น"],
  [7, "CTI", "Chanthaburi", "จันทบุรี"],
  [8, "CCO", "Chachoengsao", "ฉะเชิงเทรา"],
  [9, "CBI", "Chonburi", "ชลบุรี"],
  [10, "CNT", "Chai Nat", "ชัยนาท"],
  [11, "CPM", "Chaiyaphum", "ชัยภูมิ"],
  [12, "CPN", "Chumphon", "ชุมพร"],
  [13, "CRI", "Chiang Rai", "เชียงราย"],
  [14, "CMI", "Chiang Mai", "เชียงใหม่"],
  [15, "TRG", "Trang", "ตรัง"],
  [16, "TRT", "Trat", "ตราด"],
  [17, "TAK", "Tak", "ตาก"],
  [18, "NYK", "Nakhon Nayok", "นครนายก"],
  [19, "NPT", "Nakhon Pathom", "นครปฐม"],
  [20, "NPM", "Nakhon Phanom", "นครพนม"],
  [21, "NMA", "Nakhon Ratchasima", "นครราชสีมา"],
  [22, "NRT", "Nakhon Si Thammarat", "นครศรีธรรมราช"],
  [23, "NSN", "Nakhon Sawan", "นครสวรรค์"],
  [24, "NBI", "Nonthaburi", "นนทบุรี"],
  [25, "NWT", "Narathiwat", "นราธิวาส"],
  [26, "NAN", "Nan", "น่าน"],
  [27, "BKN", "Bueng Kan", "บึงกาฬ"],
  [28, "BRM", "Buri Ram", "บุรีรัมย์"],
  [29, "PTE", "Pathum Thani", "ปทุมธานี"],
  [30, "PKN", "Prachuap Khiri Khan", "ประจวบคีรีขันธ์"],
  [31, "PRI", "Prachin Buri", "ปราจีนบุรี"],
  [32, "PTN", "Pattani", "ปัตตานี"],
  [33, "AYA", "Phra Nakhon Si Ayutthaya", "พระนครศรีอยุธยา"],
  [34, "PNA", "Phang Nga", "พังงา"],
  [35, "PLG", "Phatthalung", "พัทลุง"],
  [36, "PCT", "Phichit", "พิจิตร"],
  [37, "PLK", "Phitsanulok", "พิษณุโลก"],
  [38, "PBI", "Phetchaburi", "เพชรบุรี"],
  [39, "PNB", "Phetchabun", "เพชรบูรณ์"],
  [40, "PRE", "Phrae", "แพร่"],
  [41, "PYO", "Phayao", "พะเยา"],
  [42, "PKT", "Phuket", "ภูเก็ต"],
  [43, "MKM", "Maha Sarakham", "มหาสารคาม"],
  [44, "MDH", "Mukdahan", "มุกดาหาร"],
  [45, "MSN", "Mae Hong Son", "แม่ฮ่องสอน"],
  [46, "YLA", "Yala", "ยะลา"],
  [47, "YST", "Yasothon", "ยโสธร"],
  [48, "RET", "Roi Et", "ร้อยเอ็ด"],
  [49, "RNG", "Ranong", "ระนอง"],
  [50, "RYG", "Rayong", "ระยอง"],
  [51, "RBR", "Ratchaburi", "ราชบุรี"],
  [52, "LRI", "Lop Buri", "ลพบุรี"],
  [53, "LPG", "Lampang", "ลำปาง"],
  [54, "LPN", "Lamphun", "ลำพูน"],
  [55, "LEI", "Loei", "เลย"],
  [56, "SSK", "Sisaket", "ศรีสะเกษ"],
  [57, "SNK", "Sakon Nakhon", "สกลนคร"],
  [58, "SKA", "Songkhla", "สงขลา"],
  [59, "STN", "Satun", "สตูล"],
  [60, "SPK", "Samut Prakan", "สมุทรปราการ"],
  [61, "SKM", "Samut Songkhram", "สมุทรสงคราม"],
  [62, "SKN", "Samut Sakhon", "สมุทรสาคร"],
  [63, "SKW", "Sa Kaeo", "สระแก้ว"],
  [64, "SRI", "Saraburi", "สระบุรี"],
  [65, "SBR", "Sing Buri", "สิงห์บุรี"],
  [66, "STI", "Sukhothai", "สุโขทัย"],
  [67, "SPB", "Suphan Buri", "สุพรรณบุรี"],
  [68, "SNI", "Surat Thani", "สุราษฎร์ธานี"],
  [69, "SRN", "Surin", "สุรินทร์"],
  [70, "NKI", "Nong Khai", "หนองคาย"],
  [71, "NBP", "Nong Bua Lam Phu", "หนองบัวลำภู"],
  [72, "ATG", "Ang Thong", "อ่างทอง"],
  [73, "UDN", "Udon Thani", "อุดรธานี"],
  [74, "UTI", "Uthai Thani", "อุทัยธานี"],
  [75, "UTT", "Uttaradit", "อุตรดิตถ์"],
  [76, "UBN", "Ubon Ratchathani", "อุบลราชธานี"],
  [77, "ACR", "Amnat Charoen", "อำนาจเจริญ"],
  [78, "BTG", "Betong", "เบตง"],
]

const $ = (id) => document.getElementById(id)
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

/** pId → File. Mirrored into IndexedDB so picks survive a reload. */
const images = new Map()

// ─── image cache ───────────────────────────────────────────────────────────

/**
 * A browser never exposes the real path of a picked file — `File` carries the
 * name and the bytes, nothing else — so the file itself is cached rather than a
 * path. IndexedDB is used instead of localStorage because it stores Blobs
 * natively and is not capped at a few megabytes; three camera stills would blow
 * past a base64'd localStorage entry immediately.
 */
const DB_NAME = "anpr-mock"
const STORE = "images"

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

/** Every cache write is best-effort: losing a cached picture must never break a fire. */
const write = async (run) => {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, "readwrite")
    run(tx.objectStore(STORE))
    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
      tx.onabort = resolve
    })
  } catch {
    // private browsing, disabled storage, quota — carry on in memory
  }
}

const cacheImage = (pId, file) => write((store) => store.put(file, pId))
const uncacheImage = (pId) => write((store) => store.delete(pId))

const restoreImages = async () => {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, "readonly")
    const store = tx.objectStore(STORE)
    const keys = store.getAllKeys()
    const files = store.getAll()
    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
    ;(keys.result ?? []).forEach((pId, index) => {
      const file = files.result?.[index]
      if (file) images.set(pId, file)
    })
  } catch {
    // nothing cached, or storage unavailable
  }
}

/** Extract { pId, fileName } per <pictureInfo> block — no XML parser needed. */
const parsePids = (xml) =>
  (xml.match(/<pictureInfo>[\s\S]*?<\/pictureInfo>/g) ?? [])
    .map((block) => ({
      pId: block.match(/<pId>([\s\S]*?)<\/pId>/)?.[1]?.trim(),
      fileName: block.match(/<fileName>([\s\S]*?)<\/fileName>/)?.[1]?.trim() ?? "",
    }))
    .filter((entry) => entry.pId)

// ─── plate + province fields ───────────────────────────────────────────────

const getTag = (xml, tag) => xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1]?.trim() ?? ""
const setTag = (xml, tag, value) =>
  xml.replace(new RegExp(`(<${tag}>)[\\s\\S]*?(</${tag}>)`, "g"), `$1${esc(value)}$2`)

const fillProvinces = () => {
  $("province").innerHTML = PROVINCES.map(
    ([n, code, en, th]) => `<option value="${n}">${n} · ${th} — ${en} (${code})</option>`
  ).join("")
}

/** XML is the source of truth: the two fields are just a friendlier way in. */
const fieldsFromXml = () => {
  const xml = $("xml").value
  $("plate").value = getTag(xml, "licensePlate")

  const stateId = getTag(xml, "tailandStateID")
  const known = PROVINCES.some(([n]) => String(n) === stateId)
  $("province").value = known ? stateId : ""
  $("stateHint").textContent = known
    ? t("hint.state", { id: stateId })
    : t("hint.stateUnknown", { id: stateId || "—" })
}

const fieldsToXml = () => {
  let xml = $("xml").value
  // The camera sends the same value in both, so keep them consistent.
  xml = setTag(xml, "licensePlate", $("plate").value)
  xml = setTag(xml, "originalLicensePlate", $("plate").value)
  xml = setTag(xml, "tailandStateID", $("province").value)
  $("xml").value = xml
  save()
  fieldsFromXml()
}

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
  el.innerHTML = t("warn.mixed", { origin: esc(target.origin) })
}

// ─── picture list ──────────────────────────────────────────────────────────

const renderPids = () => {
  const pids = parsePids($("xml").value)
  const wrap = $("pids")

  // Drop images whose pId no longer appears in the XML, cache included —
  // otherwise editing the XML would leak orphaned blobs into IndexedDB forever.
  for (const pId of [...images.keys()]) {
    if (pids.some((entry) => entry.pId === pId)) continue
    images.delete(pId)
    void uncacheImage(pId)
  }

  $("pidHint").textContent = pids.length
    ? t("hint.attached", { n: images.size, total: pids.length })
    : t("hint.noPictures")

  wrap.innerHTML =
    pids
      .map((entry) => {
        const file = images.get(entry.pId)
        return `<div class="pid">
          <div class="thumb${file ? "" : " empty"}" id="thumb-${esc(entry.pId)}">${file ? "" : "—"}</div>
          <div class="pid-body">
            <div class="pid-name">${esc(entry.fileName || t("pid.noFileName"))}</div>
            <div class="pid-id">${esc(entry.pId)}</div>
            ${file ? `<div class="pid-file">${esc(file.name)} · ${Math.round(file.size / 1024)} KB</div>` : ""}
          </div>
          <label class="btn-file">${file ? t("btn.replace") : t("btn.pick")}<input type="file" accept="image/*" data-pick="${esc(entry.pId)}" /></label>
          ${file ? `<button class="ghost" type="button" data-clear="${esc(entry.pId)}">${t("btn.clear")}</button>` : ""}
        </div>`
      })
      .join("") || `<div class="empty-box">${esc(t("empty.nothing"))}</div>`

  wrap.querySelectorAll("[data-pick]").forEach((input) => {
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        images.set(input.dataset.pick, file)
        void cacheImage(input.dataset.pick, file)
      }
      renderPids()
    }
  })
  wrap.querySelectorAll("[data-clear]").forEach((button) => {
    button.onclick = () => {
      images.delete(button.dataset.clear)
      void uncacheImage(button.dataset.clear)
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

// ─── history ───────────────────────────────────────────────────────────────

/**
 * What was fired, not what came back — the response is opaque in no-cors mode,
 * so the outcome column records delivery, never the listener's own result.
 * Small enough for localStorage; images are deliberately not recorded.
 */
const HISTORY_KEY = "anpr-history"
const HISTORY_MAX = 50

const readHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeHistory = (entries) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)))
  } catch {
    // quota — history is disposable
  }
  renderHistory()
}

/** Snapshot the request that was just sent. Called from fire() with the outcome. */
const remember = (outcome) => {
  const xml = $("xml").value
  const stateId = getTag(xml, "tailandStateID")
  const province = PROVINCES.find(([n]) => String(n) === stateId)
  writeHistory([
    {
      ts: Date.now(),
      plate: getTag(xml, "licensePlate"),
      stateId,
      province: province ? province[LANG === "th" ? 3 : 2] : "",
      url: $("url").value.trim(),
      pictures: parsePids(xml).filter((entry) => images.has(entry.pId)).length,
      outcome,
    },
    ...readHistory(),
  ])
}

const renderHistory = () => {
  const entries = readHistory()
  $("historyHint").textContent = entries.length ? t("hint.historyCount", { n: entries.length }) : ""
  $("history").innerHTML = entries.length
    ? entries
        .map((entry, index) => {
          const time = new Date(entry.ts).toLocaleString()
          return `<div class="hrow">
            <span class="htime">${esc(time)}</span>
            <span class="hplate">${esc(entry.plate || "—")}</span>
            <span class="hprov">${esc(entry.province || "—")}${entry.stateId ? ` <i>#${esc(entry.stateId)}</i>` : ""}</span>
            <span class="hpics">${entry.pictures} <i>img</i></span>
            <button class="link" type="button" data-restore="${index}">${esc(t("btn.restore"))}</button>
          </div>`
        })
        .join("")
    : `<div class="empty-box">${esc(t("empty.history"))}</div>`

  $("history")
    .querySelectorAll("[data-restore]")
    .forEach((button) => {
      button.onclick = () => restoreHistory(entries[Number(button.dataset.restore)])
    })
}

/** Put a past plate/province back into the form — the fastest way to refire one. */
const restoreHistory = (entry) => {
  if (!entry) return
  $("plate").value = entry.plate ?? ""
  if (entry.stateId) $("province").value = entry.stateId
  if (entry.url) $("url").value = entry.url
  fieldsToXml()
  checkEnv()
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

/** state: "ok" | "err" | "warn" | undefined (neutral). */
const report = (text, state) => {
  const el = $("result")
  el.textContent = text
  el.className = "result " + (state ?? "")
}

/**
 * Exactly one request per click — never a retry.
 *
 * A CORS failure is NOT a failure to send: the listener has already received
 * and processed the POST by the time the browser rejects the promise for having
 * no Access-Control-Allow-Origin. Resending on that error delivers the event
 * twice, so the mode is chosen up front instead.
 *
 * `no-cors` still rejects when the connection genuinely fails, and resolves
 * with an opaque response once the request has been delivered — so delivery is
 * knowable without CORS. Only the status code is hidden.
 */
const fire = async () => {
  save()
  const url = $("url").value.trim()
  const xml = $("xml").value
  const { form, missing } = buildForm(xml, parsePids(xml))
  const note = missing.length ? t("msg.noPicture", { ids: missing.join(", ") }) : ""
  const readResponse = $("readResponse").checked
  const startedAt = Date.now()

  $("fire").disabled = true
  report(t("msg.firing", { mode: readResponse ? "cors" : "no-cors" }))

  try {
    if (readResponse) {
      const response = await fetch(url, { method: "POST", body: form })
      const body = await response.text()
      report(
        `${response.status} ${response.statusText} · ${Date.now() - startedAt}ms${note}\n\n${body.slice(0, 8000)}`,
        response.ok ? "ok" : "err"
      )
      remember(`${response.status}`)
    } else {
      await fetch(url, { method: "POST", body: form, mode: "no-cors" })
      report(t("msg.delivered", { ms: Date.now() - startedAt, note }), "ok")
      remember("delivered")
    }
  } catch (error) {
    // A cors-mode rejection cannot tell "blocked by CORS after delivery" apart
    // from "never arrived", so it must not be painted as a failure — the request
    // very likely did land. Only a no-cors rejection is a real delivery failure.
    if (readResponse) {
      report(`${t("msg.blocked")} · ${Date.now() - startedAt}ms${note}\n\n${t("msg.failedCors")}`, "warn")
      remember("blocked?")
    } else {
      report(`${t("msg.failed")} · ${Date.now() - startedAt}ms${note}\n\n${error.message}\n\n${t("msg.failedConn")}`, "err")
      remember("failed")
    }
  } finally {
    $("fire").disabled = false
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

fillProvinces()
load()
$("readResponse").checked = localStorage.getItem("anpr-read-response") === "1"
fieldsFromXml()
renderPids()
renderHistory()
checkEnv()

/** Called by applyLang: the parts built in JS are not covered by data-i18n. */
const onLangChange = () => {
  renderPids()
  renderHistory()
  fieldsFromXml()
  checkEnv()
}

initLang()

// Cached pictures come back asynchronously; re-render once they land.
void restoreImages().then(renderPids)

$("plate").oninput = fieldsToXml
$("province").onchange = fieldsToXml
$("url").oninput = () => {
  save()
  checkEnv()
}
$("xml").oninput = () => {
  save()
  fieldsFromXml()
  renderPids()
}
$("resetXml").onclick = () => {
  $("xml").value = DEFAULT_XML
  save()
  fieldsFromXml()
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
$("clearHistory").onclick = () => writeHistory([])
$("readResponse").onchange = () => localStorage.setItem("anpr-read-response", $("readResponse").checked ? "1" : "")
$("curl").onclick = async () => {
  await navigator.clipboard.writeText(curlCommand())
  report(t("msg.curlCopied") + curlCommand())
}
