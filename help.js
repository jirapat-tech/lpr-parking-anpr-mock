/**
 * Help page content, rendered from one structure per language.
 *
 * Kept separate from i18n.js because this is prose, not interface labels. XML
 * tags, field names and HTTP terms stay in English everywhere — they are what
 * the listener actually reads.
 */

/** Reproduction of the desktop app's Settings → Configuration → Application screen. */
const debugModeFigure = (caption) => `
<figure class="shot">
  <div class="shot-ui">
    <div class="shot-side">
      <div class="shot-side-h">SETTINGS</div>
      <div class="shot-item">General</div>
      <div class="shot-item sel">Configuration</div>
      <div class="shot-item sub sel">Application</div>
    </div>
    <div class="shot-panel">
      <div class="shot-title">Advanced</div>
      <div class="shot-row">
        <div>
          <div class="shot-label">Debug mode <span class="shot-badge">restart required</span></div>
          <div class="shot-desc">Enables developer tools and verbose logging.</div>
        </div>
        <div class="shot-toggle"><i></i></div>
      </div>
    </div>
  </div>
  <figcaption>${caption}</figcaption>
</figure>`

const XML_ROWS = {
  th: [
    ["eventType", "ต้องเป็น <code>ANPR</code> ไม่งั้น listener จะไปเข้า branch อื่น (เช่น HeartBeat)"],
    ["country", "รหัสประเทศ ไทย = <code>64</code> ใช้ประกอบชื่อไฟล์รูปที่เซฟ"],
    ["tailandStateID", "รหัสจังหวัด 1–78 มาจาก dropdown ด้านบน ใช้หาจังหวัดของป้าย"],
    ["licensePlate", "เลขทะเบียน ใช้ประกอบชื่อไฟล์รูปและใช้จับคู่ transaction"],
    ["originalLicensePlate", "ค่าดิบก่อนแก้ กล้องจริงส่งเท่ากับ <code>licensePlate</code> ช่องทะเบียนเลยเขียนให้ทั้งคู่"],
    ["direction", "<b>ไม่ได้กำหนดเข้า/ออก</b> ระบบใช้ direction ที่ตั้งไว้ที่ lane เป็นตัวตัดสิน"],
    ["line", "เลนของกล้อง ตามที่กล้องรายงาน"],
    ["confidenceLevel", "ความมั่นใจในการอ่านป้าย 0–100"],
    ["pictureInfo &gt; pId", "<b>จำเป็น</b> เป็นชื่อ field ของรูปใน multipart ต้องตรงกันเป๊ะ"],
    ["pictureInfo &gt; type", "<b>จำเป็น</b> ชนิดรูป เช่น <code>licensePlatePicture</code> / <code>detectionPicture</code>"],
    ["pictureInfo &gt; fileName", "ชื่อไฟล์ที่ส่งไปกับ part นั้น"],
    ["pictureInfo &gt; absTime", "เวลาที่ถ่าย ใช้ขึ้นต้นชื่อไฟล์ที่เซฟ"],
    ["picNum", "จำนวนรูปที่แจ้ง ควรตรงกับจำนวน <code>pictureInfo</code>"],
    ["deviceUUID / UUID", "ข้อมูลระบุกล้องและ event"],
  ],
  en: [
    ["eventType", "Must be <code>ANPR</code>, otherwise the listener takes another branch (e.g. HeartBeat)."],
    ["country", "Country code; Thailand is <code>64</code>. Used in the saved picture filename."],
    ["tailandStateID", "Province code 1–78, set by the dropdown. Resolves the plate's province."],
    ["licensePlate", "The plate number. Used in the saved picture filename and to match transactions."],
    ["originalLicensePlate", "Pre-correction value. A real camera sends the same as <code>licensePlate</code>, so the plate field writes both."],
    ["direction", "<b>Does not decide entry/exit.</b> The direction configured on the lane is what counts."],
    ["line", "Camera lane index, as reported by the camera."],
    ["confidenceLevel", "Plate-read confidence, 0–100."],
    ["pictureInfo &gt; pId", "<b>Required.</b> This is the multipart field name for that picture — it must match exactly."],
    ["pictureInfo &gt; type", "<b>Required.</b> Picture kind, e.g. <code>licensePlatePicture</code> / <code>detectionPicture</code>."],
    ["pictureInfo &gt; fileName", "Filename sent with that part."],
    ["pictureInfo &gt; absTime", "Capture time; prefixes the saved filename."],
    ["picNum", "Declared picture count; should match the number of <code>pictureInfo</code> blocks."],
    ["deviceUUID / UUID", "Camera and event identifiers."],
  ],
  ja: [
    ["eventType", "<code>ANPR</code> である必要があります。異なる場合 listener は別の分岐（HeartBeat など）に入ります。"],
    ["country", "国コード。タイは <code>64</code>。保存される画像ファイル名に使われます。"],
    ["tailandStateID", "県コード 1–78。上のドロップダウンで設定します。プレートの県を判定します。"],
    ["licensePlate", "ナンバー。保存画像のファイル名と取引の突合に使われます。"],
    ["originalLicensePlate", "補正前の値。実機は <code>licensePlate</code> と同じ値を送るため、入力欄は両方に書き込みます。"],
    ["direction", "<b>入出庫を決めません。</b> lane 側に設定された direction が使われます。"],
    ["line", "カメラのレーン番号。"],
    ["confidenceLevel", "認識信頼度 0–100。"],
    ["pictureInfo &gt; pId", "<b>必須。</b> multipart の field 名そのものです。完全に一致する必要があります。"],
    ["pictureInfo &gt; type", "<b>必須。</b> 画像種別（<code>licensePlatePicture</code> / <code>detectionPicture</code> など）。"],
    ["pictureInfo &gt; fileName", "その part で送られるファイル名。"],
    ["pictureInfo &gt; absTime", "撮影時刻。保存ファイル名の先頭に付きます。"],
    ["picNum", "宣言された画像枚数。<code>pictureInfo</code> の数と一致させてください。"],
    ["deviceUUID / UUID", "カメラおよびイベントの識別子。"],
  ],
}

const xmlTable = (lang, head) => `
<div class="scroll"><table>
  <thead><tr><th>${head[0]}</th><th>${head[1]}</th></tr></thead>
  <tbody>${XML_ROWS[lang].map(([tag, desc]) => `<tr><td><code>${tag}</code></td><td>${desc}</td></tr>`).join("")}</tbody>
</table></div>`

const HELP = {
  th: () => [
    [
      "เครื่องมือนี้ทำอะไร",
      `<p>ยิง webhook แบบเดียวกับที่กล้อง Hikvision ยิงเข้า desktop app คือ POST แบบ
       <code>multipart/form-data</code> ที่มี:</p>
       <pre>anpr.xml   → ตัว XML (ต้องเป็น part แรกเสมอ)
&lt;pId&gt;      → รูป 1 part ต่อ 1 &lt;pictureInfo&gt; ชื่อ field = ค่า &lt;pId&gt;</pre>
       <p>รูปแบบตรงกับ simulator ที่ฝังอยู่ใน desktop app ฝั่ง listener แยกไม่ออกว่ามาจากตัวไหน</p>`,
    ],
    [
      "ก่อนเริ่ม: เปิด Debug mode",
      `<p>ถ้าใช้กับ desktop app ที่ติดตั้งแล้ว (packaged) <b>ต้องเปิด Debug mode ก่อน</b>
       ไปที่ <b>Settings → Configuration → Application → Advanced</b></p>
       ${debugModeFigure("Settings → Configuration → Application → Advanced")}
       <p><b>ทำไมต้องเปิด:</b> local server มี IP whitelist ยอมรับเฉพาะ IP ของกล้องที่ลงทะเบียนไว้
       request จาก browser ไม่ใช่กล้อง เลยโดน <code>403 Forbidden</code> ทิ้ง
       เปิด Debug mode = ปิด whitelist ชั่วคราว request ถึงจะผ่าน</p>
       <p class="note">ต้อง restart app หลังเปิด · ถ้ารัน desktop app แบบ dev อยู่ ไม่ต้องเปิดก็ได้ เพราะ dev ข้าม whitelist อยู่แล้ว</p>
       <p class="note">ระวัง: 403 จะ<b>มองไม่เห็น</b>ในโหมด no-cors เพราะ response เป็น opaque
       อาการคือขึ้น “ส่งถึงแล้ว” แต่ไม่มีอะไรเกิดขึ้นเลย ถ้าเจอแบบนี้ให้สงสัย Debug mode ก่อน</p>`,
    ],
    [
      "Listener URL",
      `<p>ปลายทางที่จะยิงเข้า หน้าตาแบบนี้:</p>
       <pre>http://localhost:8080/api/v1/hikvision/listener/&lt;device-id&gt;</pre>
       <ul>
         <li><code>8080</code> คือ port ของ local server (ตั้งได้ใน settings)</li>
         <li><code>&lt;device-id&gt;</code> คือ id ของกล้องในระบบ — ตัวนี้บอกว่า event นี้มาจากกล้องตัวไหน
             ใส่ผิดจะไปเข้ากล้องผิดตัวหรือไม่ตรงกับ lane ไหนเลย</li>
       </ul>
       <p>ค่าที่กรอกถูกจำไว้ใน browser</p>`,
    ],
    [
      "ทะเบียนรถ",
      `<p>เขียนลง <code>&lt;licensePlate&gt;</code> และ <code>&lt;originalLicensePlate&gt;</code> พร้อมกัน
       เพราะกล้องจริงส่งค่าเดียวกันทั้งสองที่</p>
       <p>XML เป็นตัวจริงเสมอ — แก้ใน XML ตรงๆ ช่องนี้จะอัปเดตตาม และกลับกัน</p>`,
    ],
    [
      "จังหวัด",
      `<p>เขียนลง <code>&lt;tailandStateID&gt;</code> เป็นตัวเลข 1–78 ครบทุกจังหวัด
       ตัวเลขไม่ได้พิมพ์เอง — generate จากตาราง license-plate-city ของ desktop app
       แล้วเทียบกับ <code>ThailandProvinceCode</code> ใน Hikvision SDK types ตรงกันทั้งหมด</p>
       <p>ตัวอย่าง: กรุงเทพ = 1, เชียงใหม่ = 14, เบตง = 78</p>
       <p>ถ้าแก้ <code>tailandStateID</code> ใน XML เป็นเลขนอกตาราง จะขึ้นว่า “ไม่มีในตาราง” เฉยๆ ไม่ไปทับค่าที่พิมพ์</p>`,
    ],
    ["anpr.xml", `<p>แก้ได้ทุก tag ตัวที่มีผลจริงกับฝั่งรับ:</p>${xmlTable("th", ["Tag", "ความหมาย"])}`],
    [
      "รูปภาพ",
      `<p>รายการรูปสร้างจาก <code>&lt;pictureInfo&gt;</code> ใน XML เพิ่ม/ลบ block แล้วรายการอัปเดตทันที</p>
       <ul>
         <li>ชื่อ field ของแต่ละรูป = ค่า <code>&lt;pId&gt;</code> ฝั่ง listener จับคู่ด้วย
             <code>file.fieldname == pictureInfo.pId</code> ผิดตัวเดียวคือ error</li>
         <li>ไม่แนบรูป = ข้ามไปเลย ไม่ปลอมให้ แต่ listener จะ throw ถ้า <code>pId</code> ที่ประกาศไว้ไม่มีไฟล์มาด้วย</li>
         <li>รูปถูก cache ไว้ใน IndexedDB reload แล้วยังอยู่ — browser ไม่เปิดเผย path จริงของไฟล์
             เลยเก็บตัวไฟล์แทน</li>
         <li>ลบ <code>pId</code> ออกจาก XML → รูปที่ cache ไว้ของ pId นั้นถูกลบตาม</li>
       </ul>`,
    ],
    [
      "ยิง request / อ่าน response",
      `<p><b>ยิงครั้งเดียวต่อการกด 1 ครั้ง เสมอ</b> ไม่มี retry</p>
       <ul>
         <li><b>ไม่ติ๊ก “อ่าน response”</b> (ค่าเริ่มต้น) → โหมด <code>no-cors</code>
             เห็นแค่ว่าส่งถึงหรือไม่ถึง ไม่เห็น status code</li>
         <li><b>ติ๊ก</b> → โหมด <code>cors</code> เห็น status และ body จริง
             แต่ใช้ได้เฉพาะเมื่อ listener ส่ง CORS header (ตอนนี้ยังไม่ส่ง)</li>
       </ul>`,
    ],
    [
      "ความหมายของผลลัพธ์",
      `<ul>
         <li><b class="ok">ส่งถึงแล้ว / 2xx</b> — request ถึง listener แล้ว</li>
         <li><b class="warn">response ถูกบล็อก</b> — โหมด cors แต่ไม่มี CORS header
             <u>ไม่ได้แปลว่ายิงไม่สำเร็จ</u> request น่าจะถึงแล้ว แค่อ่านคำตอบไม่ได้ ไปดู log ของ app</li>
         <li><b class="err">ล้มเหลว</b> — โหมด no-cors แล้ว connection ไม่ติดจริง คือไปไม่ถึงจริงๆ</li>
       </ul>`,
    ],
    [
      "ประวัติการยิง",
      `<p>เก็บ 50 รายการล่าสุด: เวลา, ทะเบียน, จังหวัด, จำนวนรูป, URL และผลการส่ง</p>
       <p>กด <b>ใช้ซ้ำ</b> เพื่อดึงทะเบียน/จังหวัด/URL เดิมกลับมาใส่ฟอร์ม แล้วยิงซ้ำได้เลย</p>
       <p class="note">บันทึกเฉพาะ<b>สิ่งที่ส่งออกไป</b> ไม่ใช่ผลฝั่ง listener เพราะโดยปกติอ่าน response ไม่ได้</p>`,
    ],
    [
      "curl กับดาวน์โหลด XML",
      `<p><b>คัดลอกเป็น curl</b> ได้คำสั่งพร้อมใช้ ไม่ติดข้อจำกัด browser เลย (ไม่มี mixed content ไม่มี CORS)</p>
       <p>กด <b>ดาวน์โหลด</b> เอา <code>anpr.xml</code> ลงเครื่องก่อน แล้วรัน curl ในโฟลเดอร์นั้น
       ส่วนรูปต้องมีไฟล์ชื่อตรงกับใน command อยู่ในโฟลเดอร์เดียวกัน</p>`,
    ],
    [
      "แก้ปัญหา",
      `<div class="scroll"><table>
        <thead><tr><th>อาการ</th><th>สาเหตุ</th></tr></thead>
        <tbody>
          <tr><td>ขึ้น mixed content สีเหลือง</td><td>หน้าอยู่บน HTTPS แต่ยิงไป http ที่ไม่ใช่ localhost — รันหน้านี้เองผ่าน http หรือใช้ curl</td></tr>
          <tr><td>ขึ้น “ส่งถึงแล้ว” แต่ไม่มีอะไรเกิดขึ้น</td><td>น่าจะโดน IP whitelist ตอบ 403 ซึ่งมองไม่เห็นในโหมด no-cors — เปิด Debug mode</td></tr>
          <tr><td>“ล้มเหลว”</td><td>ต่อไม่ติดจริง เช็ค URL, port, และว่า desktop app รันอยู่</td></tr>
          <tr><td>listener บอกว่าไม่เจอไฟล์</td><td>มี <code>&lt;pId&gt;</code> ใน XML ที่ยังไม่ได้แนบรูป</td></tr>
          <tr><td>รูปหายหลัง reload</td><td>เบราว์เซอร์อยู่ใน private mode หรือปิด storage ไว้</td></tr>
        </tbody>
      </table></div>`,
    ],
  ],

  en: () => [
    [
      "What this tool does",
      `<p>It fires the same webhook a Hikvision camera sends to the desktop app: a
       <code>multipart/form-data</code> POST containing:</p>
       <pre>anpr.xml   → the XML (always the first part)
&lt;pId&gt;      → one image part per &lt;pictureInfo&gt;, field name = that &lt;pId&gt;</pre>
       <p>The layout matches the simulator built into the desktop app, so the listener cannot tell them apart.</p>`,
    ],
    [
      "Before you start: enable Debug mode",
      `<p>Against an installed (packaged) desktop app you <b>must enable Debug mode</b> first, under
       <b>Settings → Configuration → Application → Advanced</b>.</p>
       ${debugModeFigure("Settings → Configuration → Application → Advanced")}
       <p><b>Why:</b> the local server enforces an IP whitelist and only accepts registered cameras.
       A request from your browser is not a camera, so it is rejected with <code>403 Forbidden</code>.
       Debug mode disables the whitelist so the request gets through.</p>
       <p class="note">Restart the app after enabling it. If you run the desktop app in dev mode you do not
       need it — dev skips the whitelist already.</p>
       <p class="note">Careful: that 403 is <b>invisible</b> in no-cors mode, because the response is opaque.
       The symptom is “delivered” with nothing happening. Suspect Debug mode first.</p>`,
    ],
    [
      "Listener URL",
      `<p>Where the request goes:</p>
       <pre>http://localhost:8080/api/v1/hikvision/listener/&lt;device-id&gt;</pre>
       <ul>
         <li><code>8080</code> is the local server port (configurable in settings).</li>
         <li><code>&lt;device-id&gt;</code> identifies the camera the event came from. Get it wrong and the
             event is attributed to the wrong camera, or to no lane at all.</li>
       </ul>
       <p>The value is remembered in your browser.</p>`,
    ],
    [
      "License plate",
      `<p>Writes both <code>&lt;licensePlate&gt;</code> and <code>&lt;originalLicensePlate&gt;</code>, because a
       real camera sends the same value in both.</p>
       <p>The XML is always the source of truth — edit it directly and this field follows, and vice versa.</p>`,
    ],
    [
      "Province",
      `<p>Writes <code>&lt;tailandStateID&gt;</code>, a number from 1 to 78, all provinces included.
       The codes were not typed by hand: they are generated from the desktop app's license-plate-city
       table and cross-checked against <code>ThailandProvinceCode</code> in the Hikvision SDK types —
       both agree on every entry.</p>
       <p>Bangkok = 1, Chiang Mai = 14, Betong = 78.</p>
       <p>Hand-editing <code>tailandStateID</code> to a value outside the table is allowed; the field just
       reports it as unknown instead of overwriting your XML.</p>`,
    ],
    ["anpr.xml", `<p>Every tag is editable. The ones that actually matter downstream:</p>${xmlTable("en", ["Tag", "Meaning"])}`],
    [
      "Pictures",
      `<p>The picture list is built from the <code>&lt;pictureInfo&gt;</code> blocks; add or remove one and the
       list updates live.</p>
       <ul>
         <li>Each image's multipart field name is its <code>&lt;pId&gt;</code>. The listener matches with
             <code>file.fieldname == pictureInfo.pId</code>, so a single mismatch is an error.</li>
         <li>A picture you do not attach is omitted, never faked — but the listener throws if a declared
             <code>pId</code> arrives with no file.</li>
         <li>Pictures are cached in IndexedDB and survive a reload. Browsers never expose a picked file's
             real path, so the file itself is cached.</li>
         <li>Removing a <code>pId</code> from the XML evicts its cached picture.</li>
       </ul>`,
    ],
    [
      "Fire / read response",
      `<p><b>Exactly one request per click</b>, never a retry.</p>
       <ul>
         <li><b>“read response” off</b> (default) → <code>no-cors</code>. You learn whether it was delivered,
             but not the status code.</li>
         <li><b>On</b> → <code>cors</code>. You get the real status and body, but only if the listener sends
             CORS headers — it currently does not.</li>
       </ul>`,
    ],
    [
      "Reading the result",
      `<ul>
         <li><b class="ok">delivered / 2xx</b> — the listener received the request.</li>
         <li><b class="warn">response blocked</b> — cors mode with no CORS header.
             <u>This is not a failed send.</u> The request most likely landed; only the reply was hidden.
             Check the app log.</li>
         <li><b class="err">failed</b> — a no-cors rejection, meaning the connection genuinely did not happen.</li>
       </ul>`,
    ],
    [
      "History",
      `<p>The last 50 fires: time, plate, province, picture count, URL and delivery outcome.</p>
       <p><b>reuse</b> puts that plate, province and URL back into the form so you can refire it.</p>
       <p class="note">It records <b>what was sent</b>, not the listener's own result — that is normally unreadable.</p>`,
    ],
    [
      "curl and XML download",
      `<p><b>Copy as curl</b> gives you a ready command with no browser restrictions at all — no mixed
       content, no CORS.</p>
       <p>Hit <b>download</b> to save <code>anpr.xml</code> first, then run curl from that folder. Image
       files must sit in the same folder under the names in the command.</p>`,
    ],
    [
      "Troubleshooting",
      `<div class="scroll"><table>
        <thead><tr><th>Symptom</th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td>Yellow mixed-content banner</td><td>HTTPS page calling a non-localhost http address. Serve this page over http yourself, or use curl.</td></tr>
          <tr><td>“delivered” but nothing happens</td><td>Most likely a 403 from the IP whitelist, invisible in no-cors mode. Enable Debug mode.</td></tr>
          <tr><td>“failed”</td><td>Nothing connected. Check URL, port, and that the desktop app is running.</td></tr>
          <tr><td>Listener reports a missing file</td><td>A <code>&lt;pId&gt;</code> in the XML has no picture attached.</td></tr>
          <tr><td>Pictures gone after reload</td><td>Private browsing, or storage disabled.</td></tr>
        </tbody>
      </table></div>`,
    ],
  ],

  ja: () => [
    [
      "このツールについて",
      `<p>Hikvision カメラが desktop app に送るのと同じ webhook を送信します。
       <code>multipart/form-data</code> の POST で、内容は次のとおりです。</p>
       <pre>anpr.xml   → XML 本体（必ず最初の part）
&lt;pId&gt;      → &lt;pictureInfo&gt; ごとに画像 1 part、field 名はその &lt;pId&gt;</pre>
       <p>desktop app 内蔵のシミュレーターと同一の構成のため、listener からは区別できません。</p>`,
    ],
    [
      "事前準備: Debug mode を有効にする",
      `<p>インストール済み（packaged）の desktop app に送る場合は、先に <b>Debug mode を有効化</b> してください。
       <b>Settings → Configuration → Application → Advanced</b> にあります。</p>
       ${debugModeFigure("Settings → Configuration → Application → Advanced")}
       <p><b>理由:</b> local server は IP whitelist を適用し、登録済みカメラからのみ受け付けます。
       ブラウザからのリクエストはカメラではないため <code>403 Forbidden</code> で拒否されます。
       Debug mode は whitelist を無効化するので、リクエストが通ります。</p>
       <p class="note">有効化後は再起動が必要です。dev モードで起動している場合は不要です（dev は whitelist をスキップします）。</p>
       <p class="note">注意: この 403 は no-cors モードでは <b>見えません</b>（レスポンスが opaque のため）。
       「送信完了」と出るのに何も起きない場合は、まず Debug mode を疑ってください。</p>`,
    ],
    [
      "Listener URL",
      `<p>送信先です。</p>
       <pre>http://localhost:8080/api/v1/hikvision/listener/&lt;device-id&gt;</pre>
       <ul>
         <li><code>8080</code> は local server のポート（設定で変更可）。</li>
         <li><code>&lt;device-id&gt;</code> はイベント送信元のカメラ ID。間違えると別のカメラの
             イベントとして扱われるか、どの lane にも紐づきません。</li>
       </ul>
       <p>入力値はブラウザに保存されます。</p>`,
    ],
    [
      "ナンバープレート",
      `<p><code>&lt;licensePlate&gt;</code> と <code>&lt;originalLicensePlate&gt;</code> の両方に書き込みます。
       実機が同じ値を両方に送るためです。</p>
       <p>XML が常に正であり、直接編集すればこの欄も追従します（逆も同様）。</p>`,
    ],
    [
      "県",
      `<p><code>&lt;tailandStateID&gt;</code> に 1〜78 の番号を書き込みます（全県収録）。
       番号は手入力ではなく、desktop app の license-plate-city テーブルから生成し、
       Hikvision SDK types の <code>ThailandProvinceCode</code> と照合済みです（全件一致）。</p>
       <p>バンコク = 1、チェンマイ = 14、ベートン = 78。</p>
       <p>一覧外の値を XML に直接書いても構いません。その場合は「一覧にありません」と表示するだけで、
       XML を上書きしません。</p>`,
    ],
    ["anpr.xml", `<p>すべての tag を編集できます。実際に影響するものは次のとおりです。</p>${xmlTable("ja", ["Tag", "意味"])}`],
    [
      "画像",
      `<p>画像一覧は XML の <code>&lt;pictureInfo&gt;</code> から生成されます。ブロックを増減すると即座に反映されます。</p>
       <ul>
         <li>各画像の multipart field 名は <code>&lt;pId&gt;</code> です。listener は
             <code>file.fieldname == pictureInfo.pId</code> で突合するため、1 つでも不一致ならエラーになります。</li>
         <li>未添付の画像は送信されません（捏造しません）。ただし宣言された <code>pId</code> にファイルが
             無い場合、listener 側で例外になります。</li>
         <li>画像は IndexedDB にキャッシュされ、リロード後も残ります。ブラウザは選択したファイルの
             実際のパスを公開しないため、ファイル自体を保存しています。</li>
         <li>XML から <code>pId</code> を削除すると、そのキャッシュ画像も削除されます。</li>
       </ul>`,
    ],
    [
      "送信 / レスポンスを読む",
      `<p><b>1 クリックにつき必ず 1 リクエスト</b>で、再送は行いません。</p>
       <ul>
         <li><b>「レスポンスを読む」オフ</b>（既定）→ <code>no-cors</code>。到達可否のみ分かり、
             ステータスコードは見えません。</li>
         <li><b>オン</b> → <code>cors</code>。実際のステータスと body が得られますが、listener が
             CORS ヘッダーを返す場合に限ります（現状は返しません）。</li>
       </ul>`,
    ],
    [
      "結果の読み方",
      `<ul>
         <li><b class="ok">送信完了 / 2xx</b> — listener がリクエストを受け取りました。</li>
         <li><b class="warn">レスポンスがブロックされました</b> — cors モードで CORS ヘッダーが無い場合。
             <u>送信失敗ではありません。</u> リクエストは届いている可能性が高く、応答だけが隠されています。
             app のログを確認してください。</li>
         <li><b class="err">失敗</b> — no-cors での失敗、つまり実際に接続できていません。</li>
       </ul>`,
    ],
    [
      "送信履歴",
      `<p>直近 50 件: 時刻、ナンバー、県、画像枚数、URL、到達結果。</p>
       <p><b>再利用</b> でナンバー・県・URL をフォームに戻し、そのまま再送できます。</p>
       <p class="note">記録するのは <b>送信内容</b> であり、listener 側の結果ではありません（通常は読めないため）。</p>`,
    ],
    [
      "curl と XML ダウンロード",
      `<p><b>curl としてコピー</b> なら、ブラウザの制約（mixed content、CORS）を一切受けません。</p>
       <p>先に <b>ダウンロード</b> で <code>anpr.xml</code> を保存し、そのフォルダで curl を実行してください。
       画像もコマンド内の名前で同じフォルダに置く必要があります。</p>`,
    ],
    [
      "トラブルシューティング",
      `<div class="scroll"><table>
        <thead><tr><th>症状</th><th>原因</th></tr></thead>
        <tbody>
          <tr><td>黄色の mixed content 警告</td><td>HTTPS のページから localhost 以外の http を呼んでいます。http でローカル配信するか curl を使ってください。</td></tr>
          <tr><td>「送信完了」なのに何も起きない</td><td>IP whitelist による 403 の可能性が高く、no-cors では見えません。Debug mode を有効にしてください。</td></tr>
          <tr><td>「失敗」</td><td>接続できていません。URL、ポート、desktop app の起動を確認してください。</td></tr>
          <tr><td>listener がファイル不足と報告</td><td>XML の <code>&lt;pId&gt;</code> に画像が添付されていません。</td></tr>
          <tr><td>リロードで画像が消える</td><td>プライベートブラウジング、またはストレージ無効。</td></tr>
        </tbody>
      </table></div>`,
    ],
  ],
}

const renderHelp = () => {
  const sections = (HELP[LANG] ?? HELP.en)()
  document.getElementById("doc").innerHTML = sections
    .map(([title, body], index) => `<section><h2><span class="num">${index + 1}</span>${title}</h2>${body}</section>`)
    .join("")
}

/** Called by applyLang. */
const onLangChange = renderHelp

initLang()
