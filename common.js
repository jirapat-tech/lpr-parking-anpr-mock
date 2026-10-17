/**
 * Shared by the Hikvision and Zenith pages: DOM helpers, the Thai province
 * table, the mixed-content check and the result box. Loaded after i18n.js and
 * before each page's own script.
 */

/**
 * Thailand province code table — [tailandStateID, code, English, Thai].
 * Generated from the desktop app's license-plate-city seed and cross-checked
 * against ThailandProvinceCode in the Hikvision SDK types; both agree on all 78
 * entries. The camera reports the number, so that is what goes in the XML.
 *
 * A Zenith camera reports the Thai name instead (license_ext2); the Thai
 * column matches THAI_PROVINCE_CODE_BY_NAME in the Zenith SDK types exactly.
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

// ─── result box ────────────────────────────────────────────────────────────

/** state: "ok" | "err" | "warn" | undefined (neutral). */
const report = (text, state) => {
  const el = $("result")
  el.textContent = text
  el.className = "result " + (state ?? "")
}
