/**
 * Translations for both pages. Thai is the default; the choice persists in
 * localStorage and applies across pages.
 *
 * Field names, XML tags, HTTP terms and code stay in English in every language —
 * they are identifiers, and translating them would break the mapping to what the
 * listener actually reads.
 *
 * Elements opt in with data-i18n (textContent) or data-i18n-html (innerHTML).
 */

const I18N = {
  th: {
    "app.title": "ANPR Mock",
    "app.sub": "จำลอง ANPR webhook แบบ Hikvision",
    "nav.app": "Hikvision",
    "nav.help": "วิธีใช้",
    "nav.zenith": "Zenith",

    "zenith.sub": "จำลอง plate result webhook แบบ Zenith",
    "label.json": "plate result JSON",
    "zenith.noProvince": "— ไม่ระบุจังหวัด —",
    "zenith.transport": "ปุ่มยิงส่งเป็น multipart/form-data ที่ชื่อ field เป็น AlarmInfoPlate[result][PlateResult][…] เพราะ browser ส่ง application/json ข้าม origin ไม่ได้ถ้า listener ไม่ตอบ CORS — multer ฝั่ง listener ประกอบกลับเป็น object เดียวกัน ถ้าต้องการ JSON แบบกล้องจริงเป๊ะ ให้ดาวน์โหลด JSON แล้วใช้ curl",
    "hint.jsonInvalid": "JSON ไม่ถูกต้อง: {error}",
    "hint.ext2": "license_ext2 → code {id}",
    "hint.ext2Unknown": "license_ext2 = {name} — ไม่มีในตาราง ระบบจะเก็บเป็นชื่อ fallback",
    "hint.ext2None": "ไม่มี license_ext2 — event จะไม่มีจังหวัด",
    "hint.zenithPictures": "แนบแล้ว {n}/{total} · แปลงเป็น base64 ใส่ใน JSON ตอนยิง ไม่แนบก็ได้",
    "hint.tooBig": "ยาวเกิน 1 MB หลังแปลง base64 — listener จะปฏิเสธ",
    "pic.imageFile": "ภาพเต็ม (big_img)",
    "pic.imageFragmentFile": "ภาพป้ายทะเบียน (small_img)",
    "btn.heartbeat": "ส่ง heartbeat",
    "msg.jsonInvalid": "ยิงไม่ได้: JSON ไม่ถูกต้อง\n\n{error}",
    "msg.noPlateResult": "ยิงไม่ได้: ไม่มี AlarmInfoPlate.result.PlateResult ใน JSON",
    "msg.tooBig": "ไม่ได้ยิง: {fields} ยาวเกิน 1 MB หลังแปลงเป็น base64\nmulter ฝั่ง listener จะปฏิเสธด้วย LIMIT_FIELD_VALUE\nย่อรูปลง หรือดาวน์โหลด JSON แล้วยิงด้วย curl",
    "msg.zenithCurlCopied": "คัดลอกคำสั่ง curl แล้ว (ส่ง JSON แบบกล้องจริง)\nกดดาวน์โหลดเอา zenith.json (มีรูปอยู่ในนั้นแล้ว) ก่อน แล้วรันในโฟลเดอร์นั้น\n\n",

    "label.url": "Listener URL",
    "label.plate": "ทะเบียนรถ",
    "label.province": "จังหวัด",
    "label.xml": "anpr.xml",
    "label.pictures": "รูปภาพ",
    "label.result": "ผลลัพธ์",
    "label.history": "ประวัติการยิง",
    "btn.clearHistory": "ล้างประวัติ",
    "btn.restore": "ใช้ซ้ำ",
    "hint.historyCount": "{n} รายการ · เก็บเฉพาะสิ่งที่ส่งออกไป ไม่ใช่ผลฝั่ง listener",
    "empty.history": "ยังไม่มีประวัติ",
    "msg.blocked": "response ถูกบล็อก",
    "presence.online": "ออนไลน์",
    "presence.openChat": "คลิกชื่อเพื่อส่งข้อความ",
    "chat.send": "ส่ง",
    "chat.placeholder": "พิมพ์ข้อความ…",
    "chat.empty": "ยังไม่มีข้อความ",
    "chat.typing": "{name} กำลังพิมพ์…",
    "presence.yourName": "ชื่อของคุณ",
    "presence.share": "แสดงตัวให้คนอื่นเห็น",
    "presence.alone": "ตอนนี้มีคุณคนเดียว",
    "presence.note": "ชื่อและ host:port ที่ยิงจะถูกเผยแพร่ให้ทุกคนที่เปิดหน้านี้เห็น",

    "btn.reset": "คืนค่าเดิม",
    "btn.download": "ดาวน์โหลด",
    "btn.fire": "ยิง request",
    "btn.curl": "คัดลอกเป็น curl",
    "btn.pick": "เลือก",
    "btn.replace": "เปลี่ยน",
    "btn.clear": "ล้าง",
    "check.readResponse": "อ่าน response",
    "check.readResponse.title": "ใช้ได้ต่อเมื่อ listener ส่ง CORS header",

    "hint.attached": "แนบแล้ว {n}/{total} · ตัวที่ไม่แนบจะถูกข้าม ไม่ปลอมให้",
    "hint.noPictures": "ไม่มี <pictureInfo> ใน XML",
    "hint.state": "tailandStateID = {id}",
    "hint.stateUnknown": "tailandStateID = {id} — ไม่มีในตาราง",
    "pid.noFileName": "(ไม่มี fileName)",
    "empty.nothing": "ไม่มีรูปให้แนบ",

    "warn.mixed":
      "<b>ถูกบล็อก: mixed content</b> หน้านี้อยู่บน HTTPS browser จะไม่ยอมส่ง request ไป <code>{origin}</code> " +
      "มีแค่ <code>localhost</code> กับ <code>127.0.0.1</code> ที่ได้รับการยกเว้น<br />" +
      "ให้รันหน้านี้เองผ่าน http แทน — clone repo แล้ว <code>npx serve .</code> — หรือใช้ <b>คัดลอกเป็น curl</b>",

    "msg.firing": "กำลังยิง… ({mode})",
    "msg.delivered":
      "ส่งถึงแล้ว · {ms}ms{note}\n\nlistener รับ request ไปแล้ว แต่ดู status code ไม่ได้เพราะ response เป็น opaque\n" +
      "ในโหมด no-cors — ไปดูผลที่ log ของ desktop app หรือติ๊ก “อ่าน response” ถ้า endpoint นี้ส่ง CORS header",
    "msg.failedCors":
      "request น่าจะถึง listener แล้ว แต่ browser บล็อกไม่ให้อ่าน response เพราะไม่มี CORS header\n" +
      "ไม่ได้แปลว่ายิงไม่สำเร็จ — ไปดูผลจริงที่ log ของ desktop app\n" +
      "เอาติ๊ก “อ่าน response” ออกถ้าไม่อยากเจอความกำกวมนี้",
    "msg.failedConn": "request ไปไม่ถึง listener เช็ค URL, port และว่า desktop app รันอยู่หรือเปล่า",
    "msg.noPicture": "\nไม่ได้แนบรูปให้: {ids}",
    "msg.curlCopied": "คัดลอกคำสั่ง curl แล้ว\nดาวน์โหลด anpr.xml ก่อน แล้วรันในโฟลเดอร์นั้น\n\n",
    "msg.failed": "ล้มเหลว",
  },

  en: {
    "app.title": "ANPR Mock",
    "app.sub": "Hikvision-style ANPR webhook simulator",
    "nav.app": "Hikvision",
    "nav.help": "How to use",
    "nav.zenith": "Zenith",

    "zenith.sub": "Zenith-style plate result webhook simulator",
    "label.json": "plate result JSON",
    "zenith.noProvince": "— no province —",
    "zenith.transport": "Fire sends multipart/form-data with fields named AlarmInfoPlate[result][PlateResult][…]: a browser cannot POST application/json cross-origin unless the listener answers CORS. The listener's multer rebuilds the same object. For the exact camera JSON, download it and use curl.",
    "hint.jsonInvalid": "invalid JSON: {error}",
    "hint.ext2": "license_ext2 → code {id}",
    "hint.ext2Unknown": "license_ext2 = {name} — not in the table, kept as a fallback name",
    "hint.ext2None": "no license_ext2 — the event will carry no province",
    "hint.zenithPictures": "{n}/{total} attached · base64'd into the JSON on fire, both optional",
    "hint.tooBig": "over 1 MB once base64'd — the listener will refuse it",
    "pic.imageFile": "Full frame (big_img)",
    "pic.imageFragmentFile": "Plate crop (small_img)",
    "btn.heartbeat": "Send heartbeat",
    "msg.jsonInvalid": "not fired: invalid JSON\n\n{error}",
    "msg.noPlateResult": "not fired: the JSON has no AlarmInfoPlate.result.PlateResult",
    "msg.tooBig": "not fired: {fields} is over 1 MB once base64'd.\nThe listener's multer refuses it with LIMIT_FIELD_VALUE.\nShrink the picture, or download the JSON and send it with curl.",
    "msg.zenithCurlCopied": "curl command copied (sends the exact camera JSON).\nDownload zenith.json first (pictures included), then run it from that folder.\n\n",

    "label.url": "Listener URL",
    "label.plate": "License plate",
    "label.province": "Province",
    "label.xml": "anpr.xml",
    "label.pictures": "Pictures",
    "label.result": "Result",
    "label.history": "History",
    "btn.clearHistory": "clear",
    "btn.restore": "reuse",
    "hint.historyCount": "{n} entries · records what was sent, not the listener's own result",
    "empty.history": "nothing fired yet",
    "msg.blocked": "response blocked",
    "presence.online": "online",
    "presence.openChat": "click a name to message them",
    "chat.send": "Send",
    "chat.placeholder": "Type a message…",
    "chat.empty": "No messages yet",
    "chat.typing": "{name} is typing…",
    "presence.yourName": "your name",
    "presence.share": "show me to others",
    "presence.alone": "nobody else right now",
    "presence.note": "Your name and the host:port you target are broadcast to everyone with this page open.",

    "btn.reset": "reset",
    "btn.download": "download",
    "btn.fire": "Fire request",
    "btn.curl": "Copy as curl",
    "btn.pick": "Pick",
    "btn.replace": "Replace",
    "btn.clear": "Clear",
    "check.readResponse": "read response",
    "check.readResponse.title": "Only works if the listener sends CORS headers",

    "hint.attached": "{n}/{total} attached · missing pictures are omitted, not faked",
    "hint.noPictures": "no <pictureInfo> blocks in the XML",
    "hint.state": "tailandStateID = {id}",
    "hint.stateUnknown": "tailandStateID = {id} — not in the table",
    "pid.noFileName": "(no fileName)",
    "empty.nothing": "nothing to attach",

    "warn.mixed":
      "<b>Blocked: mixed content.</b> This page is on HTTPS, so the browser will not send a request to " +
      "<code>{origin}</code>. Only <code>localhost</code> and <code>127.0.0.1</code> are exempt.<br />" +
      "Run this page locally over http instead — clone the repo and <code>npx serve .</code> — or use <b>Copy as curl</b>.",

    "msg.firing": "firing… ({mode})",
    "msg.delivered":
      "delivered · {ms}ms{note}\n\nThe listener received the request. Its status code is hidden because the\n" +
      "response is opaque in no-cors mode — check the desktop app log for the result,\n" +
      "or tick “read response” if this endpoint sends CORS headers.",
    "msg.failedCors":
      "The request most likely reached the listener; the browser blocked the response\n" +
      "because there is no CORS header. This is NOT a failed send — check the desktop\n" +
      "app log for the real outcome. Untick “read response” to avoid the ambiguity.",
    "msg.failedConn":
      "The request never reached the listener. Check the URL, the port, and that\nthe desktop app is running.",
    "msg.noPicture": "\nno picture attached for: {ids}",
    "msg.curlCopied": "curl command copied.\nDownload anpr.xml first, then run it from that folder.\n\n",
    "msg.failed": "failed",
  },

  ja: {
    "app.title": "ANPR Mock",
    "app.sub": "Hikvision 形式の ANPR webhook シミュレーター",
    "nav.app": "Hikvision",
    "nav.help": "使い方",
    "nav.zenith": "Zenith",

    "zenith.sub": "Zenith 形式の plate result webhook シミュレーター",
    "label.json": "plate result JSON",
    "zenith.noProvince": "— 県なし —",
    "zenith.transport": "送信ボタンは AlarmInfoPlate[result][PlateResult][…] という名前のフィールドで multipart/form-data を送ります。listener が CORS に応答しない限り、ブラウザはクロスオリジンで application/json を送れないためです。listener 側の multer が同じオブジェクトに組み立て直します。カメラと完全に同じ JSON が必要なら、ダウンロードして curl を使ってください。",
    "hint.jsonInvalid": "JSON が不正です: {error}",
    "hint.ext2": "license_ext2 → code {id}",
    "hint.ext2Unknown": "license_ext2 = {name} — 一覧にありません。フォールバック名として保存されます",
    "hint.ext2None": "license_ext2 なし — イベントに県は含まれません",
    "hint.zenithPictures": "{n}/{total} 添付済み · 送信時に base64 で JSON に埋め込みます（任意）",
    "hint.tooBig": "base64 後に 1 MB を超えます — listener が拒否します",
    "pic.imageFile": "全体画像 (big_img)",
    "pic.imageFragmentFile": "プレート画像 (small_img)",
    "btn.heartbeat": "heartbeat 送信",
    "msg.jsonInvalid": "送信しませんでした: JSON が不正です\n\n{error}",
    "msg.noPlateResult": "送信しませんでした: JSON に AlarmInfoPlate.result.PlateResult がありません",
    "msg.tooBig": "送信しませんでした: {fields} が base64 後に 1 MB を超えます。\nlistener の multer が LIMIT_FIELD_VALUE で拒否します。\n画像を縮小するか、JSON をダウンロードして curl で送ってください。",
    "msg.zenithCurlCopied": "curl コマンドをコピーしました（カメラと同じ JSON を送信）。\n先に zenith.json（画像込み）をダウンロードし、そのフォルダで実行してください。\n\n",

    "label.url": "Listener URL",
    "label.plate": "ナンバープレート",
    "label.province": "県",
    "label.xml": "anpr.xml",
    "label.pictures": "画像",
    "label.result": "結果",
    "label.history": "送信履歴",
    "btn.clearHistory": "クリア",
    "btn.restore": "再利用",
    "hint.historyCount": "{n} 件 · 送信内容の記録です（listener 側の結果ではありません）",
    "empty.history": "まだ送信していません",
    "msg.blocked": "レスポンスがブロックされました",
    "presence.online": "オンライン",
    "presence.openChat": "名前をクリックしてメッセージを送信",
    "chat.send": "送信",
    "chat.placeholder": "メッセージを入力…",
    "chat.empty": "メッセージはまだありません",
    "chat.typing": "{name} が入力中…",
    "presence.yourName": "あなたの名前",
    "presence.share": "他の人に表示する",
    "presence.alone": "現在あなただけです",
    "presence.note": "名前と送信先の host:port は、このページを開いている全員に共有されます。",

    "btn.reset": "リセット",
    "btn.download": "ダウンロード",
    "btn.fire": "リクエスト送信",
    "btn.curl": "curl としてコピー",
    "btn.pick": "選択",
    "btn.replace": "変更",
    "btn.clear": "クリア",
    "check.readResponse": "レスポンスを読む",
    "check.readResponse.title": "listener が CORS ヘッダーを返す場合のみ有効",

    "hint.attached": "{n}/{total} 添付済み · 未添付の画像は送信されません（捏造しません）",
    "hint.noPictures": "XML に <pictureInfo> がありません",
    "hint.state": "tailandStateID = {id}",
    "hint.stateUnknown": "tailandStateID = {id} — 一覧にありません",
    "pid.noFileName": "(fileName なし)",
    "empty.nothing": "添付する画像はありません",

    "warn.mixed":
      "<b>ブロック: mixed content</b> このページは HTTPS のため、ブラウザは <code>{origin}</code> へのリクエストを送信しません。" +
      "例外は <code>localhost</code> と <code>127.0.0.1</code> のみです。<br />" +
      "http でローカルに配信してください — リポジトリを clone して <code>npx serve .</code> — または <b>curl としてコピー</b> を使ってください。",

    "msg.firing": "送信中… ({mode})",
    "msg.delivered":
      "送信完了 · {ms}ms{note}\n\nlistener はリクエストを受け取りました。no-cors モードではレスポンスが opaque のため\n" +
      "ステータスコードは見えません。結果は desktop app のログを確認するか、この endpoint が\nCORS ヘッダーを返すなら「レスポンスを読む」を有効にしてください。",
    "msg.failedCors":
      "リクエストは listener に届いている可能性が高く、CORS ヘッダーがないためブラウザが\n" +
      "レスポンスをブロックしました。送信失敗ではありません — 実際の結果は desktop app の\n" +
      "ログを確認してください。「レスポンスを読む」を外すと曖昧さを避けられます。",
    "msg.failedConn":
      "リクエストが listener に届きませんでした。URL、ポート、desktop app が\n起動しているかを確認してください。",
    "msg.noPicture": "\n画像が未添付: {ids}",
    "msg.curlCopied": "curl コマンドをコピーしました。\n先に anpr.xml をダウンロードし、そのフォルダで実行してください。\n\n",
    "msg.failed": "失敗",
  },
}

const LANGS = [
  ["th", "ไทย"],
  ["en", "English"],
  ["ja", "日本語"],
]

let LANG = localStorage.getItem("anpr-lang") || "th"

/** Translate `key`, substituting {placeholders}. Falls back to English, then the key. */
const t = (key, vars) => {
  let text = I18N[LANG]?.[key] ?? I18N.en[key] ?? key
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(value)
  return text
}

const applyLang = (lang) => {
  LANG = I18N[lang] ? lang : "th"
  localStorage.setItem("anpr-lang", LANG)
  document.documentElement.lang = LANG

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n)
  })
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml)
  })
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle)
  })
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder)
  })

  // Pages re-render their dynamic parts here; both define it before this runs.
  if (typeof onLangChange === "function") onLangChange()
  // Presence is a module and loads later, so it registers its own hook.
  window.onPresenceLang?.()
}

const initLang = () => {
  const select = document.getElementById("lang")
  if (!select) return
  select.innerHTML = LANGS.map(([code, name]) => `<option value="${code}">${name}</option>`).join("")
  select.value = LANG
  select.onchange = () => applyLang(select.value)
  applyLang(LANG)
}
