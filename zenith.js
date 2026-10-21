/**
 * Zenith mock — fires a Zenith "push plate recognition result" (cs_alarm_plate)
 * at the desktop app's Zenith listener, plus the cs_dev_reg heartbeat.
 *
 * A real camera POSTs the plate result as JSON with the pictures base64'd into
 * PlateResult.imageFile / imageFragmentFile. A browser cannot do that here: a
 * cross-origin application/json POST needs a CORS preflight, which the listener
 * does not answer, and no-cors mode silently drops the Content-Type. So Fire
 * sends the same object as multipart/form-data with bracketed field names
 * (AlarmInfoPlate[result][PlateResult][license]); the listener route runs
 * multer().none() after express.json(), and multer folds those names back into
 * the same nested object. Copy as curl sends the exact camera JSON instead.
 *
 * Body shape: lpr-parking-web electron-app/src/device-integration/api/camera/
 * zenith-http/v8.10.1.202509120/types/events/{plate-result,heartbeat}.ts.
 */

const DEFAULT_URL = "http://localhost:8080/api/v1/zenith/listener/DEVICE_ID"

// Captured from a Zenith RA5 (firmware 8.10.1.202509120), plate_rlt_level = DETAILED.
// Pictures and binImageFile are left out: the picked pictures are base64'd in at fire time.
const DEFAULT_JSON = JSON.stringify(
  {
    AlarmInfoPlate: {
      channel: 0,
      deviceName: "IVS",
      ipaddr: "192.168.21.252",
      result: {
        PlateResult: {
          begin_time: 0,
          bright: 0,
          carBright: 0,
          carColor: 255,
          car_extra: { enter_plate: [], leave_plate: [] },
          clean_time: 0,
          colorType: 0,
          colorValue: 0,
          confidence: 97,
          direction: 4,
          end_time: 0,
          event_channel: 1,
          gioouts: [
            { ctrltype: 0, ionum: "0" },
            { ctrltype: 0, ionum: "1" },
            { ctrltype: 0, ionum: "2" },
            { ctrltype: 0, ionum: "3" },
          ],
          isoffline: 0,
          lane_line: 0,
          license: "8กผ444",
          license_ext_type: 0,
          plate_true_width: 245,
          plateid: 965,
          plates: [
            {
              color: 0,
              is_danger: -1,
              license: "8กผ444",
              license_ext: "",
              license_ext2: "กรุงเทพมหานคร",
              license_ext3: "",
              plate_width: 245,
              pos: { bottom: 1524, left: 1503, right: 1796, top: 1369 },
              type: 26,
            },
          ],
          record_uuid: 0,
          start_time: 1792141503455,
          timeStamp: {
            Timeval: {
              decday: 16,
              dechour: 16,
              decmin: 5,
              decmon: 10,
              decsec: 3,
              decyear: 2026,
              sec: 1792141503,
              usec: 455029,
            },
          },
          triggerType: 8,
          type: 26,
          unique_id: "82f0f1e6-30b5d4ca_1792141503455",
        },
      },
      rule_id: 0,
      serialno: "82f0f1e6-30b5d4ca",
      user_data: "",
    },
  },
  null,
  2
)

/** The two pictures the desktop app reads, both keyed by their PlateResult field. */
const PICTURES = [
  { field: "imageFile", label: "pic.imageFile" },
  { field: "imageFragmentFile", label: "pic.imageFragmentFile" },
]

/** multer's default fieldSize: a longer field value is refused with LIMIT_FIELD_VALUE. */
const FIELD_LIMIT = 1024 * 1024

/** field → File. Mirrored into IndexedDB so picks survive a reload. */
const images = new Map()

// ─── image cache ───────────────────────────────────────────────────────────

/** Own database: the Hikvision page prunes every cached key that is not a <pId> in its XML. */
const DB_NAME = "anpr-mock-zenith"
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

const restoreImages = async () => {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE, "readonly")
    const store = tx.objectStore(STORE)
    const requests = PICTURES.map(({ field }) => [field, store.get(field)])
    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
    for (const [field, request] of requests) if (request.result) images.set(field, request.result)
  } catch {
    // nothing cached, or storage unavailable
  }
}

// ─── JSON ──────────────────────────────────────────────────────────────────

const parseJson = () => {
  try {
    return { data: JSON.parse($("json").value) }
  } catch (error) {
    return { error: error.message }
  }
}

const plateResultOf = (data) => data?.AlarmInfoPlate?.result?.PlateResult

const provinceByName = (name) => PROVINCES.find(([, , , th]) => th === name)

// ─── plate + province fields ───────────────────────────────────────────────

const fillProvinces = () => {
  $("province").innerHTML =
    `<option value="">${esc(t("zenith.noProvince"))}</option>` +
    PROVINCES.map(([n, code, en, th]) => `<option value="${th}">${n} · ${th} — ${en} (${code})</option>`).join("")
}

/** JSON is the source of truth: the two fields are just a friendlier way in. */
const fieldsFromJson = () => {
  const { data, error } = parseJson()
  $("jsonHint").textContent = error ? t("hint.jsonInvalid", { error }) : ""
  const plateResult = plateResultOf(data)
  if (!plateResult) {
    $("stateHint").textContent = ""
    return
  }

  $("plate").value = plateResult.license ?? plateResult.plates?.[0]?.license ?? ""
  const name = String(plateResult.plates?.[0]?.license_ext2 ?? "").trim()
  const province = provinceByName(name)
  $("province").value = province ? name : ""
  $("stateHint").textContent = !name
    ? t("hint.ext2None")
    : province
      ? t("hint.ext2", { id: province[0] })
      : t("hint.ext2Unknown", { name })
}

const fieldsToJson = () => {
  const { data } = parseJson()
  const plateResult = plateResultOf(data)
  if (!plateResult) return fieldsFromJson()

  // The camera sends the plate in both places, so keep them consistent.
  plateResult.license = $("plate").value
  if (!Array.isArray(plateResult.plates) || !plateResult.plates.length) plateResult.plates = [{}]
  plateResult.plates[0].license = $("plate").value
  plateResult.plates[0].license_ext2 = $("province").value
  $("json").value = JSON.stringify(data, null, 2)
  save()
  fieldsFromJson()
}

// ─── persistence ───────────────────────────────────────────────────────────

const load = () => {
  $("url").value = localStorage.getItem("zenith-url") || DEFAULT_URL
  $("json").value = localStorage.getItem("zenith-json") || DEFAULT_JSON
}
const save = () => {
  localStorage.setItem("zenith-url", $("url").value)
  localStorage.setItem("zenith-json", $("json").value)
}

// ─── picture list ──────────────────────────────────────────────────────────

/** Length once base64'd: what multer measures against FIELD_LIMIT. */
const base64Length = (file) => Math.ceil(file.size / 3) * 4

const renderPids = () => {
  const wrap = $("pids")
  $("pidHint").textContent = t("hint.zenithPictures", { n: images.size, total: PICTURES.length })

  wrap.innerHTML = PICTURES.map(({ field, label }) => {
    const file = images.get(field)
    const tooBig = file && base64Length(file) > FIELD_LIMIT
    return `<div class="pid">
      <div class="thumb${file ? "" : " empty"}" id="thumb-${field}">${file ? "" : "—"}</div>
      <div class="pid-body">
        <div class="pid-name">${esc(t(label))}</div>
        <div class="pid-id">PlateResult.${field}</div>
        ${file ? `<div class="pid-file${tooBig ? " err" : ""}">${esc(file.name)} · ${Math.round(file.size / 1024)} KB${tooBig ? ` · ${esc(t("hint.tooBig"))}` : ""}</div>` : ""}
      </div>
      <label class="btn-file">${file ? t("btn.replace") : t("btn.pick")}<input type="file" accept="image/jpeg,image/*" data-pick="${field}" /></label>
      ${file ? `<button class="ghost" type="button" data-clear="${field}">${t("btn.clear")}</button>` : ""}
    </div>`
  }).join("")

  wrap.querySelectorAll("[data-pick]").forEach((input) => {
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        images.set(input.dataset.pick, file)
        void write((store) => store.put(file, input.dataset.pick))
      }
      renderPids()
    }
  })
  wrap.querySelectorAll("[data-clear]").forEach((button) => {
    button.onclick = () => {
      images.delete(button.dataset.clear)
      void write((store) => store.delete(button.dataset.clear))
      renderPids()
    }
  })

  // Thumbnails are object URLs, revoked as soon as the image has decoded.
  PICTURES.forEach(({ field }) => {
    const file = images.get(field)
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => URL.revokeObjectURL(url)
    img.src = url
    $(`thumb-${field}`)?.appendChild(img)
  })
}

// ─── payload ───────────────────────────────────────────────────────────────

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]+;base64,/, ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

/** The JSON from the editor with the picked pictures base64'd in, where the camera puts them. */
const buildPayload = async (data) => {
  const payload = structuredClone(data)
  const plateResult = plateResultOf(payload)
  for (const { field } of PICTURES) {
    const file = images.get(field)
    if (!file) continue
    const base64 = await toBase64(file)
    plateResult[field] = base64
    plateResult[`${field}Len`] = file.size
    // The camera repeats the plate crop on the plate itself.
    if (field === "imageFragmentFile" && plateResult.plates?.[0]) {
      plateResult.plates[0].imageFragmentFile = base64
      plateResult.plates[0].imageFragmentFileLen = file.size
    }
  }
  return payload
}

/**
 * Nested object → bracketed multipart fields, the inverse of multer's
 * append-field. Empty arrays and objects have no field form and are dropped;
 * every value arrives as a string, which the desktop app's mapper tolerates.
 */
const appendFlat = (form, value, key) => {
  if (value === null || value === undefined) return
  if (typeof value === "object") {
    for (const [name, child] of Object.entries(value)) appendFlat(form, child, key ? `${key}[${name}]` : name)
    return
  }
  form.append(key, String(value))
}

// ─── history ───────────────────────────────────────────────────────────────

/** What was fired, not what came back — see the Hikvision page for why. */
const HISTORY_KEY = "zenith-history"
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

const remember = (kind, outcome) => {
  const plateResult = plateResultOf(parseJson().data)
  const name = String(plateResult?.plates?.[0]?.license_ext2 ?? "")
  const province = provinceByName(name)
  writeHistory([
    {
      ts: Date.now(),
      kind,
      plate: kind === "plate" ? (plateResult?.license ?? "") : "",
      province: kind === "plate" ? name : "",
      stateId: kind === "plate" && province ? String(province[0]) : "",
      url: $("url").value.trim(),
      pictures: kind === "plate" ? images.size : 0,
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
          const province = provinceByName(entry.province)
          const provinceLabel = province ? province[LANG === "th" ? 3 : 2] : entry.province
          return `<div class="hrow">
            <span class="htime">${esc(time)}</span>
            <span class="hplate">${esc(entry.kind === "heartbeat" ? "heartbeat" : entry.plate || "—")}</span>
            <span class="hprov">${esc(provinceLabel || "—")}${entry.stateId ? ` <i>#${esc(entry.stateId)}</i>` : ""}</span>
            <span class="hpics">${entry.pictures} <i>img</i></span>
            ${entry.kind === "plate" ? `<button class="link" type="button" data-restore="${index}">${esc(t("btn.restore"))}</button>` : ""}
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
  $("province").value = provinceByName(entry.province) ? entry.province : ""
  if (entry.url) $("url").value = entry.url
  fieldsToJson()
  checkEnv()
}

// ─── fire ──────────────────────────────────────────────────────────────────

/**
 * Exactly one request per click — never a retry. Same reasoning as the
 * Hikvision page: a CORS rejection comes after the listener has already taken
 * the POST, so the mode is chosen up front instead of falling back.
 */
const send = async (form, kind, note = "") => {
  const url = $("url").value.trim()
  const readResponse = $("readResponse").checked
  const startedAt = Date.now()
  report(t("msg.firing", { mode: readResponse ? "cors" : "no-cors" }))

  try {
    if (readResponse) {
      const response = await fetch(url, { method: "POST", body: form })
      const body = await response.text()
      report(
        `${response.status} ${response.statusText} · ${Date.now() - startedAt}ms${note}\n\n${body.slice(0, 8000)}`,
        response.ok ? "ok" : "err"
      )
      remember(kind, `${response.status}`)
    } else {
      await fetch(url, { method: "POST", body: form, mode: "no-cors" })
      report(t("msg.delivered", { ms: Date.now() - startedAt, note }), "ok")
      remember(kind, "delivered")
    }
  } catch (error) {
    if (readResponse) {
      report(`${t("msg.blocked")} · ${Date.now() - startedAt}ms${note}\n\n${t("msg.failedCors")}`, "warn")
      remember(kind, "blocked?")
    } else {
      report(`${t("msg.failed")} · ${Date.now() - startedAt}ms${note}\n\n${error.message}\n\n${t("msg.failedConn")}`, "err")
      remember(kind, "failed")
    }
  }
}

/** Disable both fire buttons while one request is in flight. */
const busy = async (run) => {
  $("fire").disabled = $("heartbeat").disabled = true
  try {
    await run()
  } finally {
    $("fire").disabled = $("heartbeat").disabled = false
  }
}

const fire = () =>
  busy(async () => {
    save()
    const { data, error } = parseJson()
    if (error) return report(t("msg.jsonInvalid", { error }), "err")
    if (!plateResultOf(data)) return report(t("msg.noPlateResult"), "err")

    // Refuse rather than send something the listener is certain to reject.
    const tooBig = PICTURES.filter(({ field }) => images.has(field) && base64Length(images.get(field)) > FIELD_LIMIT)
    if (tooBig.length) return report(t("msg.tooBig", { fields: tooBig.map(({ field }) => field).join(", ") }), "err")

    const form = new FormData()
    appendFlat(form, await buildPayload(data))
    const missing = PICTURES.filter(({ field }) => !images.has(field)).map(({ field }) => field)
    await send(form, "plate", missing.length ? t("msg.noPicture", { ids: missing.join(", ") }) : "")
  })

/** cs_dev_reg heartbeat: plain multipart fields, identity taken from the plate result JSON. */
const heartbeat = () =>
  busy(async () => {
    save()
    const device = parseJson().data?.AlarmInfoPlate ?? {}
    const form = new FormData()
    form.append("channel_num", "1")
    form.append("device_name", String(device.deviceName ?? "IVS"))
    form.append("ipaddr", String(device.ipaddr ?? ""))
    form.append("port", "80")
    form.append("serialno", String(device.serialno ?? ""))
    form.append("user_name", "admin")
    await send(form, "heartbeat")
  })

// ─── curl / download ───────────────────────────────────────────────────────

/** The exact camera request: JSON body, pictures inside. Pair with Download. */
const curlCommand = () =>
  [`curl -X POST '${$("url").value.trim()}' \\`, `  -H 'Content-Type: application/json' \\`, `  --data-binary @zenith.json`].join(
    "\n"
  )

const downloadJson = async () => {
  const { data, error } = parseJson()
  if (error) return report(t("msg.jsonInvalid", { error }), "err")
  const payload = plateResultOf(data) ? await buildPayload(data) : data
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "zenith.json"
  a.click()
  URL.revokeObjectURL(url)
}

// ─── wiring ────────────────────────────────────────────────────────────────

fillProvinces()
load()
$("readResponse").checked = localStorage.getItem("anpr-read-response") === "1"
fieldsFromJson()
renderPids()
renderHistory()
checkEnv()

/** Called by applyLang: the parts built in JS are not covered by data-i18n. */
const onLangChange = () => {
  fillProvinces()
  renderPids()
  renderHistory()
  fieldsFromJson()
  checkEnv()
}

initLang()

// Cached pictures come back asynchronously; re-render once they land.
void restoreImages().then(renderPids)

$("plate").oninput = fieldsToJson
$("province").onchange = fieldsToJson
$("url").oninput = () => {
  save()
  checkEnv()
}
$("json").oninput = () => {
  save()
  fieldsFromJson()
}
$("resetJson").onclick = () => {
  $("json").value = DEFAULT_JSON
  save()
  fieldsFromJson()
}
$("downloadJson").onclick = downloadJson
initLoop(fire)
$("heartbeat").onclick = heartbeat
$("clearHistory").onclick = () => writeHistory([])
$("readResponse").onchange = () => localStorage.setItem("anpr-read-response", $("readResponse").checked ? "1" : "")
$("curl").onclick = async () => {
  await navigator.clipboard.writeText(curlCommand())
  report(t("msg.zenithCurlCopied") + curlCommand())
}
